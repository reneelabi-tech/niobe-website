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

const GENDER_LABELS = {
  'female':          'Female',
  'male':            'Male',
  'non-binary':      'Non-binary',
  'prefer-not-to-say': 'Prefer not to say',
};

const HEAR_LABELS = {
  'google':    'Google',
  'instagram': 'Instagram',
  'facebook':  'Facebook',
  'tiktok':    'TikTok',
  'friend':    'Friend or family',
  'walk-in':   'Walk-in',
  'returning': 'Returning client',
  'other':     'Other',
};

function yn(val, notes) {
  if (!val) return '—';
  if (val === 'yes') return notes ? 'Yes — ' + notes : 'Yes';
  if (val === 'no')  return 'No';
  return val;
}

function csvLabels(csv, map) {
  if (!csv) return '—';
  return csv.split(',').filter(Boolean).map(function (v) { return map[v] || v; }).join(', ');
}

function section(title, lines) {
  var content = lines.filter(function (l) { return l; }).join('\n');
  return '── ' + title + ' ──────────────────────\n' + content;
}

function buildReadableSummary(f) {
  var parts = [];

  parts.push(section('BOOKING', [
    'Type:              ' + (f.booking_type === 'package' ? 'Package' : 'Treatment'),
    'Service / Package: ' + (f.service_id || f.package_id || '—'),
    'Branch:            ' + (f.branch || '—'),
    'Appointment:       ' + (f.appointment_date || '—'),
  ]));

  parts.push(section('PERSONAL DETAILS', [
    'Name:          ' + (f.full_name || '—'),
    'Date of Birth: ' + (f.date_of_birth || '—'),
    'Gender:        ' + (GENDER_LABELS[f.gender] || f.gender || '—'),
    'Phone:         ' + (f.phone_number || '—'),
    'WhatsApp:      ' + (f.whatsapp_number || '—'),
    'Email:         ' + (f.email_address || '—'),
    'Address:       ' + (f.home_address || '—'),
    'First visit:   ' + (f.first_visit === 'yes' ? 'Yes' : f.first_visit === 'no' ? 'No' : '—'),
    'How heard:     ' + (HEAR_LABELS[f.how_did_you_hear] || f.how_did_you_hear || '—'),
    'Wellness goal: ' + (f.wellness_goal || '—'),
    'Prev services: ' + (f.previous_spa_services || '—'),
  ]));

  parts.push(section('GENERAL HEALTH', [
    'Pregnant / breastfeeding:    ' + yn(f.health_pregnant, f.health_pregnant_notes),
    'Known allergies:             ' + yn(f.health_allergies, f.health_allergies_notes),
    'Medications:                 ' + yn(f.health_medications, f.health_medications_notes),
    'Recent surgery:              ' + yn(f.health_surgery, f.health_surgery_notes),
    'Heart / blood pressure:      ' + yn(f.health_heart, f.health_heart_notes),
    'Diabetes:                    ' + yn(f.health_diabetes, f.health_diabetes_notes),
    'Skin conditions:             ' + yn(f.health_skin_conditions, f.health_skin_conditions_notes),
    'Active infection / wound:    ' + yn(f.health_infections, f.health_infections_notes),
    'Epilepsy:                    ' + yn(f.health_epilepsy, f.health_epilepsy_notes),
    'Asthma / respiratory:        ' + yn(f.health_asthma, f.health_asthma_notes),
    'Metal implants / pacemaker:  ' + yn(f.health_implants, f.health_implants_notes),
    'Varicose veins:              ' + yn(f.health_varicose, f.health_varicose_notes),
    'Cancer / treatment:          ' + yn(f.health_cancer, f.health_cancer_notes),
    'Musculoskeletal:             ' + yn(f.health_musculo, f.health_musculo_notes),
    f.general_health_notes ? 'General notes: ' + f.general_health_notes : '',
  ]));

  // Facial
  var facialLines = [
    f.facial_skin_type     ? 'Skin type:     ' + (SKIN_TYPE_LABELS[f.facial_skin_type] || f.facial_skin_type) : '',
    f.facial_skin_concerns ? 'Skin concerns: ' + csvLabels(f.facial_skin_concerns, SKIN_CONCERN_LABELS) : '',
    f.facial_skin_goal     ? 'Goal:          ' + f.facial_skin_goal : '',
    f.facial_active_infection !== '' ? 'Active infection:          ' + yn(f.facial_active_infection, f.facial_active_infection_notes) : '',
    f.facial_skin_condition   !== '' ? 'Skin condition:            ' + yn(f.facial_skin_condition, f.facial_skin_condition_notes) : '',
    f.facial_retinol          !== '' ? 'Retinol / AHA / BHA:       ' + yn(f.facial_retinol, f.facial_retinol_notes) : '',
    f.facial_recent_treatment !== '' ? 'Recent facial treatment:   ' + yn(f.facial_recent_treatment, f.facial_recent_treatment_notes) : '',
    f.facial_waxing_48h       !== '' ? 'Waxing in 48h:             ' + yn(f.facial_waxing_48h, f.facial_waxing_48h_notes) : '',
    f.facial_sunburn          !== '' ? 'Sunburn / windburn:        ' + yn(f.facial_sunburn, f.facial_sunburn_notes) : '',
    f.facial_prescription_topical !== '' ? 'Prescription topical:  ' + yn(f.facial_prescription_topical, f.facial_prescription_topical_notes) : '',
    f.facial_product_allergy  !== '' ? 'Product allergy:           ' + yn(f.facial_product_allergy, f.facial_product_allergy_notes) : '',
    f.facial_past_reaction    !== '' ? 'Past reaction:             ' + yn(f.facial_past_reaction, f.facial_past_reaction_notes) : '',
    f.facial_injectables      !== '' ? 'Injectables (3 months):    ' + yn(f.facial_injectables, f.facial_injectables_notes) : '',
    f.facial_patch_test_requested ? 'Patch test requested: Yes' : '',
  ].filter(Boolean);
  if (facialLines.length) parts.push(section('FACIAL', facialLines));

  // Massage
  var massageLines = [
    f.massage_pressure ? 'Pressure preference: ' + f.massage_pressure : '',
    f.massage_goal     ? 'Goal: ' + f.massage_goal : '',
    f.massage_injury   !== '' ? 'Pain / injury / inflammation: ' + yn(f.massage_injury, f.massage_injury_notes) : '',
    f.massage_spine    !== '' ? 'Muscle / joint / spine:       ' + yn(f.massage_spine, f.massage_spine_notes) : '',
    f.massage_heart    !== '' ? 'Heart / blood pressure:       ' + yn(f.massage_heart, f.massage_heart_notes) : '',
    f.massage_varicose !== '' ? 'Varicose veins:               ' + yn(f.massage_varicose, f.massage_varicose_notes) : '',
    f.massage_blood_thinners !== '' ? 'Blood thinners:           ' + yn(f.massage_blood_thinners, f.massage_blood_thinners_notes) : '',
    f.massage_metal_implants !== '' ? 'Metal implants:           ' + yn(f.massage_metal_implants, f.massage_metal_implants_notes) : '',
    f.massage_neuropathy !== '' ? 'Neuropathy:               ' + yn(f.massage_neuropathy, f.massage_neuropathy_notes) : '',
    f.massage_skin_infection !== '' ? 'Skin infection:           ' + yn(f.massage_skin_infection, f.massage_skin_infection_notes) : '',
    f.massage_oil_allergy    !== '' ? 'Oil allergy:              ' + yn(f.massage_oil_allergy, f.massage_oil_allergy_notes) : '',
    f.massage_osteoporosis   !== '' ? 'Osteoporosis:             ' + yn(f.massage_osteoporosis, f.massage_osteoporosis_notes) : '',
    f.massage_areas_avoid  ? 'Areas to avoid: ' + f.massage_areas_avoid : '',
    f.massage_areas_focus  ? 'Areas to focus: ' + f.massage_areas_focus : '',
  ].filter(Boolean);
  if (massageLines.length) parts.push(section('MASSAGE', massageLines));

  // Waxing
  var waxLines = [
    f.waxing_areas ? 'Areas: ' + f.waxing_areas.split(',').join(', ') : '',
    f.waxing_retinol        !== '' ? 'Retinol / AHA / BHA:   ' + yn(f.waxing_retinol, f.waxing_retinol_notes) : '',
    f.waxing_recent_treatment !== '' ? 'Recent treatment:    ' + yn(f.waxing_recent_treatment, f.waxing_recent_treatment_notes) : '',
    f.waxing_broken_skin    !== '' ? 'Broken / irritated skin: ' + yn(f.waxing_broken_skin, f.waxing_broken_skin_notes) : '',
    f.waxing_eczema         !== '' ? 'Eczema / psoriasis:    ' + yn(f.waxing_eczema, f.waxing_eczema_notes) : '',
    f.waxing_steroids       !== '' ? 'Steroids (topical):    ' + yn(f.waxing_steroids, f.waxing_steroids_notes) : '',
    f.waxing_blood_thinners !== '' ? 'Blood thinners:        ' + yn(f.waxing_blood_thinners, f.waxing_blood_thinners_notes) : '',
    f.waxing_diabetes       !== '' ? 'Diabetes:              ' + yn(f.waxing_diabetes, f.waxing_diabetes_notes) : '',
    f.waxing_past_reaction  !== '' ? 'Past wax reaction:     ' + yn(f.waxing_past_reaction, f.waxing_past_reaction_notes) : '',
    f.waxing_wax_allergy    !== '' ? 'Wax allergy:           ' + yn(f.waxing_wax_allergy, f.waxing_wax_allergy_notes) : '',
  ].filter(Boolean);
  if (waxLines.length) parts.push(section('WAXING', waxLines));

  // Brows & Lashes
  var blLines = [
    f.bl_services_requested ? 'Services: ' + f.bl_services_requested.split(',').join(', ') : '',
    f.bl_adhesive_allergy !== '' ? 'Adhesive allergy:    ' + yn(f.bl_adhesive_allergy, f.bl_adhesive_allergy_notes) : '',
    f.bl_dye_allergy      !== '' ? 'Dye allergy:         ' + yn(f.bl_dye_allergy, f.bl_dye_allergy_notes) : '',
    f.bl_eye_infection    !== '' ? 'Eye infection:       ' + yn(f.bl_eye_infection, f.bl_eye_infection_notes) : '',
    f.bl_eye_condition    !== '' ? 'Eye condition:       ' + yn(f.bl_eye_condition, f.bl_eye_condition_notes) : '',
    f.bl_eye_surgery      !== '' ? 'Eye surgery:         ' + yn(f.bl_eye_surgery, f.bl_eye_surgery_notes) : '',
    f.bl_contacts         !== '' ? 'Contact lenses:      ' + yn(f.bl_contacts, '') : '',
    f.bl_eye_skin         !== '' ? 'Sensitive eye skin:  ' + yn(f.bl_eye_skin, f.bl_eye_skin_notes) : '',
    f.bl_eye_meds         !== '' ? 'Eye medications:     ' + yn(f.bl_eye_meds, f.bl_eye_meds_notes) : '',
    f.bl_past_reaction    !== '' ? 'Past reaction:       ' + yn(f.bl_past_reaction, f.bl_past_reaction_notes) : '',
    f.bl_lash_serum       !== '' ? 'Lash serum:          ' + yn(f.bl_lash_serum, f.bl_lash_serum_notes) : '',
  ].filter(Boolean);
  if (blLines.length) parts.push(section('BROWS & LASHES', blLines));

  // Steam / Sauna
  var steamLines = [
    f.steam_heart           !== '' ? 'Heart condition:     ' + yn(f.steam_heart, f.steam_heart_notes) : '',
    f.steam_blood_pressure  !== '' ? 'Blood pressure:      ' + yn(f.steam_blood_pressure, f.steam_blood_pressure_notes) : '',
    f.steam_respiratory     !== '' ? 'Respiratory:         ' + yn(f.steam_respiratory, f.steam_respiratory_notes) : '',
    f.steam_diabetes        !== '' ? 'Diabetes:            ' + yn(f.steam_diabetes, f.steam_diabetes_notes) : '',
    f.steam_epilepsy        !== '' ? 'Epilepsy:            ' + yn(f.steam_epilepsy, f.steam_epilepsy_notes) : '',
    f.steam_alcohol         !== '' ? 'Alcohol consumed:    ' + yn(f.steam_alcohol, f.steam_alcohol_notes) : '',
    f.steam_surgery         !== '' ? 'Recent surgery:      ' + yn(f.steam_surgery, f.steam_surgery_notes) : '',
    f.steam_implants        !== '' ? 'Metal implants:      ' + yn(f.steam_implants, f.steam_implants_notes) : '',
  ].filter(Boolean);
  if (steamLines.length) parts.push(section('STEAM / SAUNA', steamLines));

  // Body
  var bodyLines = [
    f.body_exfoliation_preference ? 'Exfoliation preference: ' + f.body_exfoliation_preference : '',
    f.body_goal               ? 'Goal: ' + f.body_goal : '',
    f.body_wounds             !== '' ? 'Open wounds:           ' + yn(f.body_wounds, f.body_wounds_notes) : '',
    f.body_skin_conditions    !== '' ? 'Skin conditions:       ' + yn(f.body_skin_conditions, f.body_skin_conditions_notes) : '',
    f.body_infections         !== '' ? 'Active infections:     ' + yn(f.body_infections, f.body_infections_notes) : '',
    f.body_sunburn            !== '' ? 'Sunburn:               ' + yn(f.body_sunburn, f.body_sunburn_notes) : '',
    f.body_ingredient_allergy !== '' ? 'Ingredient allergy:    ' + yn(f.body_ingredient_allergy, f.body_ingredient_allergy_notes) : '',
    f.body_claustrophobia     !== '' ? 'Claustrophobia:        ' + yn(f.body_claustrophobia, f.body_claustrophobia_notes) : '',
    f.body_heat_sensitivity   !== '' ? 'Heat sensitivity:      ' + yn(f.body_heat_sensitivity, f.body_heat_sensitivity_notes) : '',
    f.body_known_sensitivities ? 'Known sensitivities: ' + f.body_known_sensitivities : '',
  ].filter(Boolean);
  if (bodyLines.length) parts.push(section('BODY WRAP / SCRUB', bodyLines));

  parts.push(section('CONSENT & SIGNATURE', [
    'Photo consent:  ' + (f.photo_consent || '—'),
    'Signature:      ' + (f.signature_name || '—'),
    'Date:           ' + (f.signature_date || '—'),
  ]));

  return parts.join('\n\n');
}

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

  const serviceLabel = formData.booking_type === 'package'
    ? formData.package_id
    : formData.service_id;

  const phone = [formData.phone_number, formData.whatsapp_number]
    .filter(Boolean)
    .filter(function (v, i, a) { return a.indexOf(v) === i; })
    .join(' / ');

  const today = new Date().toISOString().split('T')[0];

  const record = {
    fields: {
      'Full Name':               formData.full_name || '',
      'Email Address':           formData.email_address || '',
      'Phone/WhatsApp':          phone,
      'Appointment Date':        formData.appointment_date || '',
      'Client Type':             formData.first_visit === 'yes' ? 'New' : formData.first_visit === 'no' ? 'Returning' : '',
      'Treatment Booked':        serviceLabel || '',
      'Main Wellness Goal':      formData.wellness_goal || '',
      'Skin Type':               SKIN_TYPE_LABELS[formData.facial_skin_type] || formData.facial_skin_type || '',
      'Allergies/Conditions':    formData.health_allergies_notes || (formData.health_allergies === 'yes' ? 'Yes — see Health Flags' : 'None'),
      'Medication Details':      formData.health_medications_notes || (formData.health_medications === 'yes' ? 'Yes — see Health Flags' : 'None'),
      'Pregnancy/Breastfeeding': formData.health_pregnant === 'yes',
      'Medical Conditions':      formData.general_health_notes || 'None',
      'Consultation Completed':  true,
      'Signature Completed':     formData.signature_name ? true : false,
      'Consent Signed Date':     today,

      'Branch':                  formData.branch || '',
      'Booking Type':            formData.booking_type || '',
      'Health Flags':            healthFlags.length > 0 ? healthFlags.join('\n') : 'None declared',
      'Full Form Data':          buildReadableSummary(formData),
      'Submission Date':         today,
      'Photo Consent':           formData.photo_consent || '',
      'How Did You Hear':        formData.how_did_you_hear || '',
      'Date of Birth':           formData.date_of_birth || '',
      'Gender':                  GENDER_LABELS[formData.gender] || formData.gender || '',
      'Previous Spa Services':   formData.previous_spa_services || '',
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

    const result  = await response.json();
    const recordId = result.records && result.records[0] && result.records[0].id;

    // Patch the record with its own view link
    if (recordId) {
      const viewUrl = `https://niobebeauty.netlify.app/.netlify/functions/view-consultation?id=${recordId}`;
      await fetch(
        `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(table)}/${recordId}`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ fields: { 'Form Summary Link': viewUrl } }),
        }
      );
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
