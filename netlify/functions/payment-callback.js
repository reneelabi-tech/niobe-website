/**
 * payment-callback
 * IPN (Instant Payment Notification) endpoint — ExpressPay POSTs here after payment.
 * Verifies the payment with ExpressPay's query endpoint, then updates Airtable.
 *
 * This URL must be registered in your ExpressPay merchant dashboard as the IPN URL:
 *   https://[your-netlify-site].netlify.app/.netlify/functions/payment-callback
 *
 * ExpressPay sends: GET or POST with { token, status }
 * status: 1 = success, 2 = failed/cancelled
 *
 * ENV VARS REQUIRED:
 *   EXPRESSPAY_MERCHANT_ID
 *   AIRTABLE_API_KEY
 *   DEPOSITS_BASE_ID
 */

const https = require('https');

function get(url, headers = {}) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const req = https.request(
      { hostname: parsed.hostname, path: parsed.pathname + parsed.search, method: 'GET', headers },
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

function patch(hostname, path, headers, body) {
  return new Promise((resolve, reject) => {
    const bodyStr = JSON.stringify(body);
    const req = https.request(
      { hostname, path, method: 'PATCH', headers: { ...headers, 'Content-Length': Buffer.byteLength(bodyStr) } },
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

function parseParams(event) {
  // ExpressPay may send as GET params or POST body — handle both
  if (event.httpMethod === 'GET' || event.queryStringParameters?.token) {
    return event.queryStringParameters || {};
  }
  try { return JSON.parse(event.body || '{}'); }
  catch (e) {
    // Try URL-encoded body
    const params = {};
    (event.body || '').split('&').forEach(pair => {
      const [k, v] = pair.split('=');
      if (k) params[decodeURIComponent(k)] = decodeURIComponent(v || '');
    });
    return params;
  }
}

exports.handler = async function (event) {
  const params      = parseParams(event);
  const token       = params.token;
  const MERCHANT_ID = process.env.EXPRESSPAY_MERCHANT_ID;
  const BASE_ID     = process.env.DEPOSITS_BASE_ID;
  const AT_KEY      = process.env.AIRTABLE_API_KEY;
  const AT_AUTH     = { 'Authorization': `Bearer ${AT_KEY}`, 'Content-Type': 'application/json' };

  if (!token) {
    console.error('payment-callback: no token received', params);
    return { statusCode: 400, body: 'Missing token' };
  }

  // ── Step 1: Verify with ExpressPay ─────────────────────────────────────────
  let verifyRes;
  try {
    verifyRes = await get(
      `https://expresspaygh.com/api/query.php?merchant-id=${MERCHANT_ID}&token=${token}`
    );
  } catch (err) {
    console.error('ExpressPay verify failed:', err);
    return { statusCode: 500, body: 'Could not verify payment' };
  }

  console.log('ExpressPay query response:', JSON.stringify(verifyRes.body));

  // result: "1" = success, anything else = failed
  const verified = verifyRes.body?.result === '1' || verifyRes.body?.result === 1;
  const newStatus = verified ? 'paid' : 'failed';

  // ── Step 2: Find the Airtable record by token ──────────────────────────────
  const filterFormula = `{expresspay_token} = "${token}"`;
  const searchRes = await get(
    `https://api.airtable.com/v0/${BASE_ID}/deposit_payments?filterByFormula=${encodeURIComponent(filterFormula)}`,
    { 'Authorization': `Bearer ${AT_KEY}` }
  );

  if (searchRes.status !== 200 || !searchRes.body?.records?.length) {
    console.error('No Airtable record found for token:', token);
    // Still return 200 so ExpressPay doesn't keep retrying
    return { statusCode: 200, body: 'OK' };
  }

  const recordId = searchRes.body.records[0].id;

  // ── Step 3: Update the record ──────────────────────────────────────────────
  const updateFields = { 'status': newStatus };
  if (verified) {
    updateFields['paid_at'] = new Date().toISOString().split('T')[0];
  }

  await patch(
    'api.airtable.com',
    `/v0/${BASE_ID}/deposit_payments/${recordId}`,
    AT_AUTH,
    { fields: updateFields }
  );

  console.log(`payment-callback: token ${token} marked as ${newStatus}`);

  // Always return 200 — ExpressPay expects this to acknowledge receipt
  return { statusCode: 200, body: 'OK' };
};
