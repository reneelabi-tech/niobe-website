/**
 * seed-deposit-rules — ONE-TIME USE ONLY
 * Fetches all services from SimpleSpa and creates deposit_rules rows in Airtable.
 * DELETE this file after running.
 */

const https = require('https');

const BRANCHES = [
  { name: 'East Legon',   key: 'EASTLEGON',   enabled: true },
  { name: 'Cantonments',  key: 'CANTONMENTS', enabled: true },
  { name: 'Community 18', key: 'COMMUNITY18', enabled: true },
];

function post(hostname, path, headers, body) {
  return new Promise((resolve, reject) => {
    const bodyStr = JSON.stringify(body);
    const req = https.request(
      { hostname, path, method: 'POST', headers: { ...headers, 'Content-Length': Buffer.byteLength(bodyStr) } },
      (res) => {
        let data = '';
        res.on('data', c => { data += c; });
        res.on('end', () => {
          try { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
          catch (e) { resolve({ status: res.statusCode, body: data }); }
        });
      }
    );
    req.on('error', reject);
    req.write(bodyStr);
    req.end();
  });
}

function atGet(path, atKey) {
  return new Promise((resolve, reject) => {
    const req = https.request(
      { hostname: 'api.airtable.com', path, method: 'GET', headers: { 'Authorization': `Bearer ${atKey}` } },
      (res) => {
        let data = '';
        res.on('data', c => { data += c; });
        res.on('end', () => {
          try { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
          catch (e) { resolve({ status: res.statusCode, body: data }); }
        });
      }
    );
    req.on('error', reject);
    req.end();
  });
}

exports.handler = async function () {
  const BASE_ID = process.env.DEPOSITS_BASE_ID;
  const AT_KEY  = process.env.AIRTABLE_API_KEY;
  const AT_AUTH = { 'Authorization': `Bearer ${AT_KEY}`, 'Content-Type': 'application/json' };

  // ── Fetch all services from each branch ────────────────────────────────────
  const allServices = new Map(); // name → { name, label }

  for (const branch of BRANCHES) {
    const apiKey = process.env[`SIMPLESPA_API_KEY_${branch.key}`];
    if (!apiKey) continue;

    const res = await post(
      'my.simplespa.com',
      '/api/v1/services.php',
      { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      { per_page: 1000 }
    );

    if (res.status !== 200 || !Array.isArray(res.body?.services)) continue;

    // Confirmed field name from API: 'name' (not 'service_name')
    res.body.services.forEach(s => {
      if (s.name && !allServices.has(s.name)) {
        allServices.set(s.name, { name: s.name, label: s.label || '' });
      }
    });
  }

  if (allServices.size === 0) {
    return { statusCode: 200, body: JSON.stringify({ error: 'No services found' }) };
  }

  // ── Get existing Airtable rows to avoid duplicates ─────────────────────────
  const existingRes = await atGet(
    `/v0/${BASE_ID}/deposit_rules?fields%5B%5D=service_name&pageSize=1000`,
    AT_KEY
  );
  const existing = new Set(
    (existingRes.body?.records || []).map(r => r.fields?.service_name).filter(Boolean)
  );

  // ── Create Airtable records for new services ───────────────────────────────
  const created = [];
  const skipped = [];

  for (const [name] of allServices) {
    if (existing.has(name)) {
      skipped.push(name);
      continue;
    }

    const res = await post(
      'api.airtable.com',
      `/v0/${BASE_ID}/deposit_rules`,
      AT_AUTH,
      { fields: { service_name: name, deposit_required: true } }
    );

    if (res.status === 200 || res.status === 201) {
      created.push(name);
    } else {
      console.error(`Failed to create "${name}":`, res.body);
    }
  }

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: `Done. ${created.length} created, ${skipped.length} already existed.`,
      created,
      skipped
    }, null, 2)
  };
};
