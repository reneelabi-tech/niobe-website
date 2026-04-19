/**
 * seed-deposit-rules — full debug version
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

  const log = {
    env: {
      has_DEPOSITS_BASE_ID: !!BASE_ID,
      has_AIRTABLE_API_KEY: !!AT_KEY,
      DEPOSITS_BASE_ID_value: BASE_ID || 'MISSING'
    },
    branches: [],
    services_found: [],
    airtable_existing: null,
    airtable_creates: []
  };

  // ── Step 1: Fetch services ─────────────────────────────────────────────────
  const allServices = new Map();

  for (const branch of BRANCHES) {
    const apiKey = process.env[`SIMPLESPA_API_KEY_${branch.key}`];
    if (!apiKey) {
      log.branches.push({ branch: branch.name, error: 'No API key in env' });
      continue;
    }

    const res = await post(
      'my.simplespa.com',
      '/api/v1/services.php',
      { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      { per_page: 1000 }
    );

    const services = Array.isArray(res.body?.services) ? res.body.services : [];
    services.forEach(s => { if (s.name) allServices.set(s.name, true); });

    log.branches.push({
      branch:        branch.name,
      httpStatus:    res.status,
      servicesFound: services.length
    });
  }

  log.services_found = [...allServices.keys()];

  // ── Step 2: Check existing Airtable records ────────────────────────────────
  const existingRes = await atGet(
    `/v0/${BASE_ID}/deposit_rules?fields%5B%5D=service_name&pageSize=1000`,
    AT_KEY
  );

  log.airtable_existing = {
    status:  existingRes.status,
    records: existingRes.body?.records?.length ?? 'error',
    error:   existingRes.body?.error || null
  };

  const existing = new Set(
    (existingRes.body?.records || []).map(r => r.fields?.service_name).filter(Boolean)
  );

  // ── Step 3: Create records ─────────────────────────────────────────────────
  for (const name of allServices.keys()) {
    if (existing.has(name)) {
      log.airtable_creates.push({ name, result: 'skipped (already exists)' });
      continue;
    }

    const res = await post(
      'api.airtable.com',
      `/v0/${BASE_ID}/deposit_rules`,
      { 'Authorization': `Bearer ${AT_KEY}`, 'Content-Type': 'application/json' },
      { fields: { service_name: name, deposit_required: true } }
    );

    log.airtable_creates.push({
      name,
      result: res.status === 200 || res.status === 201 ? 'created' : 'failed',
      status: res.status,
      error:  res.body?.error || null
    });
  }

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(log, null, 2)
  };
};
