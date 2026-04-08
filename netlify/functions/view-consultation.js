// View a single consultation record as a formatted HTML page.
// URL: /.netlify/functions/view-consultation?id=recXXXXXX

exports.handler = async function (event) {
  const id     = event.queryStringParameters && event.queryStringParameters.id;
  const apiKey = process.env.AIRTABLE_API_KEY;
  const baseId = process.env.AIRTABLE_BASE_ID;
  const table  = process.env.AIRTABLE_TABLE_NAME || 'Client Records';

  if (!id) {
    return { statusCode: 400, headers: { 'Content-Type': 'text/html' }, body: '<p>No record ID provided.</p>' };
  }

  if (!apiKey || !baseId) {
    return { statusCode: 500, headers: { 'Content-Type': 'text/html' }, body: '<p>Server configuration error.</p>' };
  }

  let record;
  try {
    const res = await fetch(
      `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(table)}/${id}`,
      { headers: { 'Authorization': `Bearer ${apiKey}` } }
    );
    if (!res.ok) throw new Error('Airtable ' + res.status);
    record = await res.json();
  } catch (err) {
    console.error('Fetch error:', err);
    return { statusCode: 502, headers: { 'Content-Type': 'text/html' }, body: '<p>Could not load record.</p>' };
  }

  const f = record.fields;
  let fd = {};
  try { fd = JSON.parse(f['Full Form Data'] || '{}'); } catch {}

  function escHtml(str) {
    return (str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  const SKIN_CONCERN_LABELS = { 'acne':'Acne / Breakouts','hyperpigmentation':'Hyperpigmentation','uneven-tone':'Uneven skin tone','dryness':'Dryness / Dehydration','fine-lines':'Fine lines / Wrinkles','pores':'Enlarged pores','oiliness':'Oiliness / Shine','sensitivity':'Sensitivity / Redness','other':'Other' };
  const SKIN_TYPE_LABELS    = { 'normal':'Normal','oily':'Oily','dry':'Dry','combination':'Combination','sensitive':'Sensitive' };
  const GENDER_LABELS       = { 'female':'Female','male':'Male','non-binary':'Non-binary','prefer-not-to-say':'Prefer not to say' };
  const HEAR_LABELS         = { 'google':'Google','instagram':'Instagram','facebook':'Facebook','tiktok':'TikTok','friend':'Friend or family','walk-in':'Walk-in','returning':'Returning client','other':'Other' };

  function yn(val, notes) {
    if (!val) return '—';
    if (val === 'yes') return notes ? 'Yes — ' + notes : 'Yes';
    if (val === 'no')  return 'No';
    return val;
  }
  function csvLabels(csv, map) {
    if (!csv) return '—';
    return csv.split(',').filter(Boolean).map(function(v){ return map[v]||v; }).join(', ');
  }

  function rows(pairs) {
    return pairs.filter(function(p){ return p[1]; }).map(function(p) {
      var isYes = typeof p[1] === 'string' && p[1].toLowerCase().startsWith('yes');
      return '<div class="row' + (isYes ? ' yes' : '') + '"><span class="key">' + escHtml(p[0]) + '</span><span class="val">' + escHtml(p[1]) + '</span></div>';
    }).join('');
  }
  function sec(title, pairs) {
    var content = rows(pairs);
    if (!content) return '';
    return '<section><h2>' + escHtml(title) + '</h2>' + content + '</section>';
  }

  var sections = [
    sec('Booking', [
      ['Type',        fd.booking_type === 'package' ? 'Package' : 'Treatment'],
      ['Service',     fd.service_id || fd.package_id],
      ['Branch',      fd.branch],
      ['Appointment', fd.appointment_date],
    ]),
    sec('Personal Details', [
      ['Name',          fd.full_name],
      ['Date of Birth', fd.date_of_birth],
      ['Gender',        GENDER_LABELS[fd.gender] || fd.gender],
      ['Phone',         fd.phone_number],
      ['WhatsApp',      fd.whatsapp_number],
      ['Email',         fd.email_address],
      ['Address',       fd.home_address],
      ['First visit',   fd.first_visit === 'yes' ? 'Yes' : fd.first_visit === 'no' ? 'No' : ''],
      ['How heard',     HEAR_LABELS[fd.how_did_you_hear] || fd.how_did_you_hear],
      ['Wellness goal', fd.wellness_goal],
      ['Prev services', fd.previous_spa_services],
    ]),
    sec('General Health', [
      ['Pregnant / breastfeeding',   yn(fd.health_pregnant, fd.health_pregnant_notes)],
      ['Known allergies',            yn(fd.health_allergies, fd.health_allergies_notes)],
      ['Medications',                yn(fd.health_medications, fd.health_medications_notes)],
      ['Recent surgery',             yn(fd.health_surgery, fd.health_surgery_notes)],
      ['Heart / blood pressure',     yn(fd.health_heart, fd.health_heart_notes)],
      ['Diabetes',                   yn(fd.health_diabetes, fd.health_diabetes_notes)],
      ['Skin conditions',            yn(fd.health_skin_conditions, fd.health_skin_conditions_notes)],
      ['Active infection / wound',   yn(fd.health_infections, fd.health_infections_notes)],
      ['Epilepsy',                   yn(fd.health_epilepsy, fd.health_epilepsy_notes)],
      ['Asthma / respiratory',       yn(fd.health_asthma, fd.health_asthma_notes)],
      ['Metal implants / pacemaker', yn(fd.health_implants, fd.health_implants_notes)],
      ['Varicose veins',             yn(fd.health_varicose, fd.health_varicose_notes)],
      ['Cancer / treatment',         yn(fd.health_cancer, fd.health_cancer_notes)],
      ['Musculoskeletal',            yn(fd.health_musculo, fd.health_musculo_notes)],
      ['General notes',              fd.general_health_notes],
    ]),
    fd.facial_skin_type || fd.facial_skin_concerns ? sec('Facial', [
      ['Skin type',               SKIN_TYPE_LABELS[fd.facial_skin_type] || fd.facial_skin_type],
      ['Skin concerns',           csvLabels(fd.facial_skin_concerns, SKIN_CONCERN_LABELS)],
      ['Goal',                    fd.facial_skin_goal],
      ['Active infection',        yn(fd.facial_active_infection, fd.facial_active_infection_notes)],
      ['Skin condition',          yn(fd.facial_skin_condition, fd.facial_skin_condition_notes)],
      ['Retinol / AHA / BHA',     yn(fd.facial_retinol, fd.facial_retinol_notes)],
      ['Recent facial treatment', yn(fd.facial_recent_treatment, fd.facial_recent_treatment_notes)],
      ['Waxing in 48h',           yn(fd.facial_waxing_48h, fd.facial_waxing_48h_notes)],
      ['Sunburn / windburn',      yn(fd.facial_sunburn, fd.facial_sunburn_notes)],
      ['Prescription topical',    yn(fd.facial_prescription_topical, fd.facial_prescription_topical_notes)],
      ['Product allergy',         yn(fd.facial_product_allergy, fd.facial_product_allergy_notes)],
      ['Past reaction',           yn(fd.facial_past_reaction, fd.facial_past_reaction_notes)],
      ['Injectables (3 months)',  yn(fd.facial_injectables, fd.facial_injectables_notes)],
      ['Patch test requested',    fd.facial_patch_test_requested === 'yes' ? 'Yes' : ''],
    ]) : '',
    fd.massage_pressure || fd.massage_goal || fd.massage_injury ? sec('Massage', [
      ['Pressure preference',    fd.massage_pressure],
      ['Goal',                   fd.massage_goal],
      ['Pain / injury',          yn(fd.massage_injury, fd.massage_injury_notes)],
      ['Muscle / joint / spine', yn(fd.massage_spine, fd.massage_spine_notes)],
      ['Heart / blood pressure', yn(fd.massage_heart, fd.massage_heart_notes)],
      ['Varicose veins',         yn(fd.massage_varicose, fd.massage_varicose_notes)],
      ['Blood thinners',         yn(fd.massage_blood_thinners, fd.massage_blood_thinners_notes)],
      ['Metal implants',         yn(fd.massage_metal_implants, fd.massage_metal_implants_notes)],
      ['Neuropathy',             yn(fd.massage_neuropathy, fd.massage_neuropathy_notes)],
      ['Skin infection',         yn(fd.massage_skin_infection, fd.massage_skin_infection_notes)],
      ['Oil allergy',            yn(fd.massage_oil_allergy, fd.massage_oil_allergy_notes)],
      ['Osteoporosis',           yn(fd.massage_osteoporosis, fd.massage_osteoporosis_notes)],
      ['Areas to avoid',         fd.massage_areas_avoid],
      ['Areas to focus',         fd.massage_areas_focus],
    ]) : '',
    fd.waxing_areas ? sec('Waxing', [
      ['Areas',                fd.waxing_areas && fd.waxing_areas.split(',').join(', ')],
      ['Retinol / AHA / BHA',  yn(fd.waxing_retinol, fd.waxing_retinol_notes)],
      ['Recent treatment',     yn(fd.waxing_recent_treatment, fd.waxing_recent_treatment_notes)],
      ['Broken / irritated',   yn(fd.waxing_broken_skin, fd.waxing_broken_skin_notes)],
      ['Eczema / psoriasis',   yn(fd.waxing_eczema, fd.waxing_eczema_notes)],
      ['Steroids (topical)',   yn(fd.waxing_steroids, fd.waxing_steroids_notes)],
      ['Blood thinners',       yn(fd.waxing_blood_thinners, fd.waxing_blood_thinners_notes)],
      ['Diabetes',             yn(fd.waxing_diabetes, fd.waxing_diabetes_notes)],
      ['Past wax reaction',    yn(fd.waxing_past_reaction, fd.waxing_past_reaction_notes)],
      ['Wax allergy',          yn(fd.waxing_wax_allergy, fd.waxing_wax_allergy_notes)],
    ]) : '',
    fd.bl_services_requested ? sec('Brows & Lashes', [
      ['Services',           fd.bl_services_requested && fd.bl_services_requested.split(',').join(', ')],
      ['Adhesive allergy',   yn(fd.bl_adhesive_allergy, fd.bl_adhesive_allergy_notes)],
      ['Dye allergy',        yn(fd.bl_dye_allergy, fd.bl_dye_allergy_notes)],
      ['Eye infection',      yn(fd.bl_eye_infection, fd.bl_eye_infection_notes)],
      ['Eye condition',      yn(fd.bl_eye_condition, fd.bl_eye_condition_notes)],
      ['Eye surgery',        yn(fd.bl_eye_surgery, fd.bl_eye_surgery_notes)],
      ['Contact lenses',     yn(fd.bl_contacts, '')],
      ['Sensitive eye skin', yn(fd.bl_eye_skin, fd.bl_eye_skin_notes)],
      ['Eye medications',    yn(fd.bl_eye_meds, fd.bl_eye_meds_notes)],
      ['Past reaction',      yn(fd.bl_past_reaction, fd.bl_past_reaction_notes)],
      ['Lash serum',         yn(fd.bl_lash_serum, fd.bl_lash_serum_notes)],
    ]) : '',
    fd.steam_heart || fd.steam_blood_pressure ? sec('Steam / Sauna', [
      ['Heart condition',    yn(fd.steam_heart, fd.steam_heart_notes)],
      ['Blood pressure',     yn(fd.steam_blood_pressure, fd.steam_blood_pressure_notes)],
      ['Respiratory',        yn(fd.steam_respiratory, fd.steam_respiratory_notes)],
      ['Diabetes',           yn(fd.steam_diabetes, fd.steam_diabetes_notes)],
      ['Epilepsy',           yn(fd.steam_epilepsy, fd.steam_epilepsy_notes)],
      ['Alcohol consumed',   yn(fd.steam_alcohol, fd.steam_alcohol_notes)],
      ['Recent surgery',     yn(fd.steam_surgery, fd.steam_surgery_notes)],
      ['Metal implants',     yn(fd.steam_implants, fd.steam_implants_notes)],
    ]) : '',
    fd.body_goal || fd.body_wounds ? sec('Body Wrap / Scrub', [
      ['Exfoliation preference', fd.body_exfoliation_preference],
      ['Goal',                   fd.body_goal],
      ['Open wounds',            yn(fd.body_wounds, fd.body_wounds_notes)],
      ['Skin conditions',        yn(fd.body_skin_conditions, fd.body_skin_conditions_notes)],
      ['Active infections',      yn(fd.body_infections, fd.body_infections_notes)],
      ['Sunburn',                yn(fd.body_sunburn, fd.body_sunburn_notes)],
      ['Ingredient allergy',     yn(fd.body_ingredient_allergy, fd.body_ingredient_allergy_notes)],
      ['Claustrophobia',         yn(fd.body_claustrophobia, fd.body_claustrophobia_notes)],
      ['Heat sensitivity',       yn(fd.body_heat_sensitivity, fd.body_heat_sensitivity_notes)],
      ['Known sensitivities',    fd.body_known_sensitivities],
    ]) : '',
    sec('Consent & Signature', [
      ['Photo consent', fd.photo_consent],
      ['Signature',     fd.signature_name],
      ['Date signed',   fd.signature_date],
    ]),
  ].join('');

  const name         = escHtml(f['Full Name'] || 'Client');
  const service      = escHtml(f['Treatment Booked'] || '');
  const branch       = escHtml(f['Branch'] || '');
  const appt         = escHtml(f['Appointment Date'] || '');
  const submissionDate = escHtml(f['Submission Date'] || '');
  const healthFlags  = escHtml(f['Health Flags'] || 'None declared');
  const flagClass    = (f['Health Flags'] && f['Health Flags'] !== 'None declared') ? 'flags-box alert' : 'flags-box';

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Consultation — ${name}</title>
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Helvetica Neue', Arial, sans-serif; background: #FAFAF7; color: #2F241D; font-size: 14px; line-height: 1.6; }
  .doc { max-width: 760px; margin: 0 auto; padding: 2rem 1.5rem 4rem; }
  .doc-header { border-bottom: 2px solid #2F241D; padding-bottom: 1.25rem; margin-bottom: 2rem; }
  .doc-header__logo { font-size: 0.6rem; letter-spacing: 0.2em; text-transform: uppercase; opacity: 0.45; margin-bottom: 0.5rem; }
  .doc-header__name { font-size: 1.6rem; font-weight: 700; letter-spacing: -0.01em; }
  .doc-header__meta { margin-top: 0.4rem; font-size: 0.8rem; opacity: 0.55; }
  .doc-header__meta span { margin-right: 1.5rem; }
  .flags-box { background: #f0ede6; border-left: 3px solid #7A795D; padding: 0.85rem 1rem; margin-bottom: 2rem; border-radius: 3px; font-size: 0.82rem; white-space: pre-line; }
  .flags-box.alert { background: #fff3f0; border-left-color: #c0392b; }
  .flags-box__label { font-weight: 700; font-size: 0.6rem; letter-spacing: 0.15em; text-transform: uppercase; margin-bottom: 0.4rem; opacity: 0.6; }
  section { margin-bottom: 1.75rem; }
  h2 { font-size: 0.6rem; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase; opacity: 0.45; padding-bottom: 0.4rem; border-bottom: 1px solid rgba(47,36,29,0.1); margin-bottom: 0.6rem; }
  .row { display: flex; gap: 1rem; padding: 0.3rem 0; border-bottom: 1px solid rgba(47,36,29,0.05); }
  .row:last-child { border-bottom: none; }
  .key { flex: 0 0 220px; font-size: 0.78rem; opacity: 0.5; }
  .val { flex: 1; font-size: 0.85rem; font-weight: 500; }
  .row.yes .val { color: #c0392b; font-weight: 600; }
  @media (max-width: 500px) { .key { flex: 0 0 140px; font-size: 0.72rem; } }
  .doc-footer { margin-top: 3rem; padding-top: 1rem; border-top: 1px solid rgba(47,36,29,0.1); font-size: 0.72rem; opacity: 0.4; }
</style>
</head>
<body>
<div class="doc">
  <div class="doc-header">
    <div class="doc-header__logo">Niobe Spa — Client Consultation Form</div>
    <div class="doc-header__name">${name}</div>
    <div class="doc-header__meta">
      <span>${service}</span>
      <span>${branch}</span>
      <span>Appt: ${appt}</span>
      <span>Submitted: ${submissionDate}</span>
    </div>
  </div>

  <div class="${flagClass}">
    <div class="flags-box__label">Health flags</div>
    ${healthFlags}
  </div>

  ${sections}

  <div class="doc-footer">This document is confidential and for Niobe Spa internal use only.</div>
</div>
</body>
</html>`;

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
    body: html,
  };
};
