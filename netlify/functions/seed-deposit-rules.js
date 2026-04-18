/**
 * seed-deposit-rules  —  ONE-TIME USE ONLY
 *
 * Fetches all services from SimpleSpa (across all enabled branches),
 * deduplicates by name, and creates rows in Airtable deposit_rules
 * with deposit_required = true.
 *
 * HOW TO RUN:
 *   1. Deploy (it's already in netlify/functions/)
 *   2. Visit: https://[your-site].netlify.app/.netlify/functions/seed-deposit-rules
 *   3. Check the JSON response — it lists everything created
 *   4. DELETE this file and redeploy
 *
 * Safe to run multiple times — skips services that already exist.
 */

const https = require('https');

const SIMPLESPA_HOST = 'my.simplespa.com';
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

function get(hostname, path, headers) {
  return new Promise((resolve, reject) => {
    const req = https.request(
      { hostname, path, method: 'GET', headers },
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

exports.handler = async function (event) {
  const BASE_ID = process.env.DEPOSITS_BASE_ID;
  const AT_KEY  = process.env.AIRTABLE_API_KEY;
  const AT_AUTH = { 'Authorization': `Bearer ${AT_KEY}`, 'Content-Type': 'application/json' };

  // ── Step 1: Fetch all services from each branch ────────────────────────────
  const allServiceNames = new Set();

  for (const branch of BRANCHES) {
    const apiKey = process.env[`SIMPLESPA_API_KEY_${branch.key}`];
    if (!apiKey) continue;

    const AUTH = { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' };

    try {
      // Services endpoint — same pattern as appointments/clients
      const res = await post(SIMPLESPA_HOST, '/api/v1/services.php', AUTH, { per_page: 1000 });

      if (res.status !== 200) {
        console.warn(`${branch.name} services returned ${res.status}`);
        continue;
      }

      // Try common response shapes
      const services =
        Array.isArray(res.body?.services) ? res.body.services :
        Array.isArray(res.body?.data)     ? res.body.data :
        Array.isArray(res.body)           ? res.body : [];

      services.forEach(s => {
        const name = s.service_name || s.name || s.title;
        if (name) allServiceNames.add(name.trim());
      });

      console.log(`${branch.name}: found ${services.length} services`);
    } catch (err) {
      console.error(`${branch.name} services fetch failed:`, err.message);
    }
  }

  if (allServiceNames.size === 0) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'No services found — check SimpleSpa API keys and services endpoint' })
    };
  }

  // ── Step 2: Get existing Airtable rows to avoid duplicates ─────────────────
  const existingRes = await get(
    'api.airtable.com',
    `/v0/${BASE_ID}/deposit_rules?fields%5B%5D=service_name&pageSize=1000`,
    { 'Authorization': `Bearer ${AT_KEY}` }
  );

  const existing = new Set(
    (existingRes.body?.records || []).map(r => r.fields?.service_name).filter(Boolean)
  );

  // ── Step 3: Create Airtable records for new services ──────────────────────
  const toCreate = [...allServiceNames].filter(name => !existing.has(name));
  const created  = [];
  const skipped  = [...allServiceNames].filter(name => existing.has(name));

  for (const name of toCreate) {
    try {
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
    } catch (err) {
      console.error(`Error creating "${name}":`, err.message);
    }
  }

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: `Done. ${created.length} created, ${skipped.length} already existed.`,
      created,
      skipped
    })
  };
};
