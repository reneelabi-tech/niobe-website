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
  const summary = f['Full Form Data'] || '';

  // Convert the plain-text summary into HTML sections
  function escHtml(str) {
    return (str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  const sections = summary.split(/\n\n+/).map(function (block) {
    const lines = block.split('\n');
    const heading = lines[0].replace(/^──\s*/,'').replace(/\s*─+$/,'').trim();
    const rows = lines.slice(1).map(function (line) {
      const colon = line.indexOf(':');
      if (colon === -1) return '<p class="row">' + escHtml(line) + '</p>';
      const key = line.slice(0, colon).trim();
      const val = line.slice(colon + 1).trim();
      const highlight = val.toLowerCase().startsWith('yes') ? ' class="row yes"' : ' class="row"';
      return '<div' + highlight + '><span class="key">' + escHtml(key) + '</span><span class="val">' + escHtml(val) + '</span></div>';
    }).join('');
    return '<section><h2>' + escHtml(heading) + '</h2>' + rows + '</section>';
  }).join('');

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
