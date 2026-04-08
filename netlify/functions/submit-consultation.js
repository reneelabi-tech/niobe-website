const SKIN_CONCERN_LABELS = {
  'acne':             'Acne / Breakouts',
  'hyperpigmentation':'Hyperpigmentation',
  'uneven-tone':      'Uneven skin tone',
  'dryness':          'Dryness / Dehydration',
  'fine-lines':       'Fine lines / Wrinkles',
  'pores':            'Enlarged pores',
  'oiliness':         'Oiliness / Shine',
  'sensitivity':      'Sensitivity / Redness',
  'other':            'Other',
};

const SKIN_TYPE_LABELS = {
  'normal':      'Normal',
  'oily':        'Oily',
  'dry':         'Dry',
  'combination': 'Combination',
  'sensitive':   'Sensitive',
};

function csvToLabelArray(csv, labelMap) {
  if (!csv) return [];
  return csv.split(',').filter(Boolean).map(function (v) {
    return labelMap[v] || v;
  });
}

exports.handler = async function (event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  let formData;
  try {
    formData = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, body: 'Invalid request body' };
  }

  const apiKey = process.env.AIRTABLE_API_KEY;
  const baseId = process.env.AIRTABLE_BASE_ID;
  const table  = process.env.AIRTABLE_TABLE_NAME || 'Client Records';

  if (!apiKey || !baseId) {
    console.error('Missing Airtable env vars');
    return { statusCode: 500, body: 'Server configuration error' };
  }

  // ── Health summary ──────────────────────────────────────────────
  const healthChecks = [
    ['health_pregnant',        'Pregnant / possibly pregnant'],
    ['health_allergies',       'Known allergies'],
    ['health_medications',     'Currently on medication'],
    ['health_surgery',         'Recent surgery (past 6 months)'],
    ['health_heart',           'Heart condition / blood pressure'],
    ['health_diabetes',        'Diabetes'],
    ['health_skin_conditions', 'Skin conditions or disorders'],
    ['health_infections',      'Active skin infection or open wound'],
    ['health_epilepsy',        'Epilepsy'],
    ['health_asthma',          'Asthma or respiratory condition'],
    ['health_implants',        'Metal implants or pacemaker'],
    ['health_varicose',        'Varicose veins'],
    ['health_cancer',          'Cancer or undergoing treatment'],
    ['health_musculo',         'Musculoskeletal condition'],
  ];

  const healthFlags = healthChecks
    .filter(function (c) { return formData[c[0]] === 'yes'; })
    .map(function (c) {
      const notes = formData[c[0] + '_notes'];
      return notes ? c[1] + ': ' + notes : c[1];
    });

  // ── Service label ───────────────────────────────────────────────
  const serviceLabel = formData.booking_type === 'package'
    ? formData.package_id
    : formData.service_id;

  // ── Phone combined ──────────────────────────────────────────────
  const phone = [formData.phone_number, formData.whatsapp_number]
    .filter(Boolean)
    .filter(function (v, i, a) { return a.indexOf(v) === i; })
    .join(' / ');

  const today = new Date().toISOString().split('T')[0];

  // ── Airtable record ─────────────────────────────────────────────
  const record = {
    fields: {
      'Full Name':                formData.full_name || '',
      'Email Address':            formData.email_address || '',
      'Phone/WhatsApp':           phone,
      'Appointment Date':         formData.appointment_date || '',
      'Client Type':              formData.first_visit === 'yes' ? 'New' : formData.first_visit === 'no' ? 'Returning' : '',
      'Treatment Booked':         serviceLabel || '',
      'Main Wellness Goal':       formData.wellness_goal || '',
      'Skin Type':                SKIN_TYPE_LABELS[formData.facial_skin_type] || formData.facial_skin_type || '',
      'Allergies/Conditions':     formData.health_allergies_notes || (formData.health_allergies === 'yes' ? 'Yes — see Health Flags' : 'None'),
      'Medication Details':       formData.health_medications_notes || (formData.health_medications === 'yes' ? 'Yes — see Health Flags' : 'None'),
      'Pregnancy/Breastfeeding':  formData.health_pregnant === 'yes',
      'Medical Conditions':       formData.general_health_notes || 'None',
      'Consultation Completed':   true,
      'Signature Completed':      formData.signature_name ? true : false,
      'Consent Signed Date':      today,

      // New fields added to table
      'Branch':                   formData.branch || '',
      'Booking Type':             formData.booking_type || '',
      'Health Flags':             healthFlags.length > 0 ? healthFlags.join('\n') : 'None declared',
      'Full Form Data':           JSON.stringify(formData, null, 2),
      'Submission Date':          today,
      'Photo Consent':            formData.photo_consent || '',
      'How Did You Hear':         formData.how_did_you_hear || '',
      'Date of Birth':            formData.date_of_birth || '',
      'Gender':                   formData.gender || '',
      'Previous Spa Services':    formData.previous_spa_services || '',
    }
  };

  try {
    const response = await fetch(
      `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(table)}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ records: [record] }),
      }
    );

    if (!response.ok) {
      const err = await response.text();
      console.error('Airtable error:', response.status, err);
      return { statusCode: 502, body: 'Failed to save record' };
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: true }),
    };
  } catch (err) {
    console.error('Function error:', err);
    return { statusCode: 500, body: 'Internal server error' };
  }
};
