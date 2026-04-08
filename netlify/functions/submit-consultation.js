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

  const apiKey   = process.env.AIRTABLE_API_KEY;
  const baseId   = process.env.AIRTABLE_BASE_ID;
  const table    = process.env.AIRTABLE_TABLE_NAME || 'Consultations';

  if (!apiKey || !baseId) {
    console.error('Missing Airtable env vars');
    return { statusCode: 500, body: 'Server configuration error' };
  }

  // ── Health summary ─────────────────────────────────────────────
  const healthChecks = [
    ['health_pregnant',       'Pregnant / possibly pregnant'],
    ['health_allergies',      'Known allergies'],
    ['health_medications',    'Currently on medication'],
    ['health_surgery',        'Recent surgery (past 6 months)'],
    ['health_heart',          'Heart condition / blood pressure'],
    ['health_diabetes',       'Diabetes'],
    ['health_skin_conditions','Skin conditions or disorders'],
    ['health_infections',     'Active skin infection or open wound'],
    ['health_epilepsy',       'Epilepsy'],
    ['health_asthma',         'Asthma or respiratory condition'],
    ['health_implants',       'Metal implants or pacemaker'],
    ['health_varicose',       'Varicose veins'],
    ['health_cancer',         'Cancer or undergoing treatment'],
    ['health_musculo',        'Musculoskeletal condition'],
  ];

  const healthFlags = healthChecks
    .filter(([key]) => formData[key] === 'yes')
    .map(([key, label]) => {
      const notes = formData[key + '_notes'];
      return notes ? `• ${label}: ${notes}` : `• ${label}`;
    });

  const healthSummary = healthFlags.length > 0
    ? healthFlags.join('\n')
    : 'None declared';

  // ── Airtable record ────────────────────────────────────────────
  const serviceLabel = formData.booking_type === 'package'
    ? formData.package_id
    : formData.service_id;

  const record = {
    fields: {
      'Name':                  formData.full_name || '',
      'Date of Birth':         formData.date_of_birth || '',
      'Gender':                formData.gender || '',
      'Phone':                 formData.phone_number || '',
      'WhatsApp':              formData.whatsapp_number || '',
      'Email':                 formData.email_address || '',
      'Address':               formData.home_address || '',
      'First Visit':           formData.first_visit === 'yes',
      'How Did You Hear':      formData.how_did_you_hear || '',
      'Wellness Goal':         formData.wellness_goal || '',
      'Previous Spa Services': formData.previous_spa_services || '',
      'Booking Type':          formData.booking_type || '',
      'Service / Package':     serviceLabel || '',
      'Branch':                formData.branch || '',
      'Appointment Date':      formData.appointment_date || '',
      'Health Flags':          healthSummary,
      'General Health Notes':  formData.general_health_notes || '',
      'Photo Consent':         formData.photo_consent || '',
      'Signature Name':        formData.signature_name || '',
      'Signature Date':        formData.signature_date || '',
      'Submission Date':       new Date().toISOString().split('T')[0],
      'Full Form Data':        JSON.stringify(formData, null, 2),
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
