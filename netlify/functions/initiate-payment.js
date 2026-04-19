/**
 * initiate-payment
 * Creates a pending deposit record in Airtable, then initiates an ExpressPay payment.
 *
 * POST body: {
 *   appointment_id, client_name, client_phone, service_name,
 *   branch, appointment_date, amount
 * }
 * Returns: { checkout_url: string }
 *
 * ENV VARS REQUIRED:
 *   EXPRESSPAY_MERCHANT_ID  — from ExpressPay merchant dashboard
 *   EXPRESSPAY_API_KEY      — from ExpressPay merchant dashboard
 *   AIRTABLE_API_KEY        — Personal Access Token
 *   DEPOSITS_BASE_ID        — Airtable base ID
 *   SITE_URL                — e.g. https://niobebeauty.netlify.app (no trailing slash)
 */

const https = require('https');

function post(hostname, path, headers, body) {
  return new Promise((resolve, reject) => {
    const bodyStr = typeof body === 'string' ? body : JSON.stringify(body);
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

function get(url, headers) {
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

exports.handler = async function (event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  let body;
  try { body = JSON.parse(event.body); }
  catch (e) { return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON' }) }; }

  const {
    appointment_id, client_name, client_phone,
    service_name, branch, appointment_date, amount
  } = body;

  if (!appointment_id || !client_phone || !amount) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Missing required fields' }) };
  }

  const MERCHANT_ID = process.env.EXPRESSPAY_MERCHANT_ID;
  const API_KEY     = process.env.EXPRESSPAY_API_KEY;
  const BASE_ID     = process.env.DEPOSITS_BASE_ID;
  const AT_KEY      = process.env.AIRTABLE_API_KEY;
  const SITE_URL    = process.env.SITE_URL || 'https://niobebeauty.netlify.app';

  // ── Step 1: Create pending record in Airtable ──────────────────────────────
  const atBody = {
    fields: {
      'appointment_id': String(appointment_id),
      'client_phone':   client_phone,
      'amount_paid':    parseFloat(amount),
      'status':         'pending',
      'paid_at':        new Date().toISOString().split('T')[0]
    }
  };

  const atAuth = { 'Authorization': `Bearer ${AT_KEY}`, 'Content-Type': 'application/json' };
  const atRes  = await post('api.airtable.com', `/v0/${BASE_ID}/deposit_payments`, atAuth, atBody);

  if (atRes.status >= 400) {
    console.error('Airtable error:', atRes.status, atRes.body);
    return { statusCode: 500, body: JSON.stringify({ error: 'Failed to record payment attempt' }) };
  }

  const airtableRecordId = atRes.body?.id;

  // ── Step 2: Initiate ExpressPay payment ────────────────────────────────────
  // Split name into first/last (ExpressPay requires separate fields)
  const nameParts = (client_name || '').trim().split(/\s+/);
  const firstName = nameParts[0] || 'Guest';
  const lastName  = nameParts.slice(1).join(' ') || firstName;

  // order-id ties the payment back to our Airtable record
  const orderId = `DEP-${appointment_id}-${Date.now()}`;

  const epPayload = {
    'api-key':      API_KEY,
    'merchant-id':  MERCHANT_ID,
    'firstname':    firstName,
    'lastname':     lastName,
    'phonenumber':  client_phone,
    'currency':     'GHS',
    'amount':       String(parseFloat(amount).toFixed(2)),
    'redirect-url': `${SITE_URL}/manage-booking.html?paid=true&appt=${appointment_id}`,
    'ipn':          `${SITE_URL}/.netlify/functions/payment-callback`,
    'orderid':      orderId
  };

  let epRes;
  try {
    epRes = await post(
      'expresspaygh.com',
      '/api/initiate.php',
      { 'Content-Type': 'application/json' },
      epPayload
    );
  } catch (err) {
    console.error('ExpressPay request failed:', err);
    return { statusCode: 502, body: JSON.stringify({ error: 'Payment gateway unavailable' }) };
  }

  console.log('ExpressPay initiate response:', JSON.stringify(epRes.body));

  // ExpressPay returns { status: 1, token: "xxx" } on success
  if (!epRes.body?.token || epRes.body?.status !== 1) {
    console.error('ExpressPay initiate failed:', epRes.body);
    return { statusCode: 502, body: JSON.stringify({ error: 'Could not initiate payment', detail: epRes.body }) };
  }

  // Store the token on the Airtable record so the callback can verify it
  if (airtableRecordId) {
    await post(
      'api.airtable.com',
      `/v0/${BASE_ID}/deposit_payments/${airtableRecordId}`,
      { ...atAuth, 'Content-Type': 'application/json' },
      { fields: { 'expresspay_token': epRes.body.token, 'order_id': orderId } }
    ).catch(err => console.error('Failed to save token to Airtable:', err));
  }

  const checkoutUrl = `https://expresspaygh.com/api/pay.php?token=${epRes.body.token}`;

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ checkout_url: checkoutUrl })
  };
};
