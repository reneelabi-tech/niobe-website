/**
 * check-deposit
 * Checks whether a deposit is required for a service, and if so, whether it's been paid.
 *
 * POST body: { appointment_id: string, service_name: string }
 * Returns:   { required: bool, status: 'paid'|'pending'|'unpaid' }
 *
 * ENV VARS REQUIRED:
 *   AIRTABLE_API_KEY      — Personal Access Token from airtable.com/create/tokens
 *   DEPOSITS_BASE_ID      — Base ID from Airtable URL (starts with 'app')
 *
 * AIRTABLE TABLES:
 *   deposit_rules    — columns: service_name (text), deposit_required (checkbox)
 *   deposit_payments — columns: appointment_id (text), status (single select: paid/pending/failed)
 */

const https = require('https');

function get(hostname, path, headers) {
  return new Promise((resolve, reject) => {
    const req = https.request({ hostname, path, method: 'GET', headers }, (res) => {
      let data = '';
      res.on('data', c => { data += c; });
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
        catch (e) { resolve({ status: res.statusCode, body: data }); }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

function airtableFilter(formula) {
  return `?filterByFormula=${encodeURIComponent(formula)}`;
}

exports.handler = async function (event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  let body;
  try { body = JSON.parse(event.body); }
  catch (e) { return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON' }) }; }

  const { appointment_id, service_name } = body;
  if (!appointment_id) {
    return { statusCode: 400, body: JSON.stringify({ error: 'appointment_id is required' }) };
  }

  const BASE_ID = process.env.DEPOSITS_BASE_ID;
  const AT_KEY  = process.env.AIRTABLE_API_KEY;
  const AUTH    = { 'Authorization': `Bearer ${AT_KEY}`, 'Accept': 'application/json' };

  // ── Step 1: Is a deposit required for this service? ────────────────────────
  let depositRequired = true; // default to required if rule not found

  if (service_name) {
    const ruleFormula = `{service_name} = "${service_name.replace(/"/g, '\\"')}"`;
    const ruleRes = await get(
      'api.airtable.com',
      `/v0/${BASE_ID}/deposit_rules${airtableFilter(ruleFormula)}&pageSize=100`,
      AUTH
    );

    if (ruleRes.status === 200 && ruleRes.body?.records?.length > 0) {
      const rule = ruleRes.body.records[0].fields;
      depositRequired = !!rule.deposit_required;
    }
    // If no rule found, default to required (safer)
  }

  if (!depositRequired) {
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ required: false })
    };
  }

  // ── Step 2: Has payment already been recorded? ─────────────────────────────
  const payFormula = `{appointment_id} = "${appointment_id}"`;
  const payRes = await get(
    'api.airtable.com',
    `/v0/${BASE_ID}/deposit_payments${airtableFilter(payFormula)}`,
    AUTH
  );

  let status = 'unpaid';
  if (payRes.status === 200 && payRes.body?.records?.length > 0) {
    const payment = payRes.body.records[0].fields;
    const s = (payment.status || '').toLowerCase();
    if (s === 'paid')    status = 'paid';
    if (s === 'pending') status = 'pending';
    if (s === 'failed')  status = 'unpaid'; // treat failed as unpaid so they can retry
  }

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ required: true, status })
  };
};
