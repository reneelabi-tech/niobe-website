const https = require('https');
const crypto = require('crypto');

function generateVoucherCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const bytes = crypto.randomBytes(4);
  let suffix = '';
  for (let i = 0; i < 4; i++) {
    suffix += chars[bytes[i] % chars.length];
  }
  const year = new Date().getFullYear().toString().slice(-2);
  return `N${year}-${suffix}`;
}

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

exports.handler = async function (event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  let order;
  try {
    order = JSON.parse(event.body);
  } catch (e) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid request body' }) };
  }

  const {
    recipientName, recipientEmail, recipientWhatsapp,
    senderName, senderPhone, message, sendDate,
    treatment, packageName, amount, cardDesign, designName,
    voucherType, deliveryMethod, validBranches, treatmentLabel
  } = order;

  if (!recipientName || !senderName || !amount || parseFloat(amount) < 1) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Missing required fields' }) };
  }

  const voucherCode     = generateVoucherCode();
  const clientReference = `GC${Date.now()}${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
  const purchaseDate    = new Date().toISOString().split('T')[0];
  const expiryDate      = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const label           = treatmentLabel || packageName || treatment || `Open Value GHS ${amount}`;
  const branches        = validBranches  || 'East Legon, Cantonments, African Regent, Community 18, Alisa Hotel Tema';

  // ── Save to Airtable ────────────────────────────────────────────────────────
  const airtableBody = {
    fields: {
      'Voucher Code':    voucherCode,
      'Status':         'Active',
      'Treatment':      label,
      'Amount (GHS)':   parseFloat(amount),
      'Card Design':    designName ? `${designName} (${cardDesign})` : `Design ${cardDesign}`,
      'Recipient Name': recipientName,
      'Recipient Email': recipientEmail || '',
      'Recipient Phone': recipientWhatsapp || '',
      'Personal Message': message || '',
      'Buyer Name':     senderName,
      'Buyer Phone':    senderPhone || '',
      'Purchase Date':  purchaseDate,
      'Expiry Date':    expiryDate,
      'Valid Branches': branches,
      'Hubtel Reference': clientReference
    }
  };

  try {
    const atBase  = process.env.VOUCHER_BASE_ID  || 'appoxjO7vqvVO1vhS';
  const atTable = process.env.VOUCHER_TABLE_ID || 'tblWKcXNlNPRFertT';

  const at = await post(
      'api.airtable.com',
      `/v0/${atBase}/${atTable}`,
      {
        'Authorization': `Bearer ${process.env.AIRTABLE_API_KEY}`,
        'Content-Type':  'application/json'
      },
      airtableBody
    );
    if (at.status >= 400) {
      console.error('Airtable error status:', at.status, 'body:', JSON.stringify(at.body));
      return { statusCode: 500, body: JSON.stringify({ error: 'Failed to save order record', detail: at.body }) };
    }
  } catch (err) {
    console.error('Airtable save failed:', err);
    return { statusCode: 500, body: JSON.stringify({ error: 'Database error' }) };
  }

  // ── Initiate Hubtel payment ─────────────────────────────────────────────────
  const siteUrl      = 'https://niobebeauty.netlify.app';
  const clientId     = process.env.HUBTEL_CLIENT_ID;
  const clientSecret = process.env.HUBTEL_CLIENT_SECRET;
  const basicAuth    = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  console.log('Auth check — clientId length:', clientId ? clientId.length : 0, 'secret length:', clientSecret ? clientSecret.length : 0);

  const hubtelBody = {
    totalAmount:           parseFloat(amount),
    description:          `Niobe Spa Gift Voucher - ${label}`,
    callbackUrl:          `${siteUrl}/.netlify/functions/hubtel-callback`,
    returnUrl:            `${siteUrl}/gift-card-confirmation.html`,
    cancellationUrl:      `${siteUrl}/gift-cards.html`,
    merchantAccountNumber: clientId,
    clientReference:      clientReference
  };

  let hubtel;
  try {
    hubtel = await post(
      'payproxyapi.hubtel.com',
      '/items/initiate',
      { 'Authorization': `Basic ${basicAuth}`, 'Content-Type': 'application/json' },
      hubtelBody
    );
  } catch (err) {
    console.error('Hubtel request failed:', err);
    return { statusCode: 500, body: JSON.stringify({ error: 'Payment gateway unavailable' }) };
  }

  console.log('Hubtel response:', JSON.stringify(hubtel));

  const checkoutUrl =
    hubtel.body &&
    hubtel.body.data &&
    (hubtel.body.data.checkoutDirectLink || hubtel.body.data.checkoutUrl);

  if (!checkoutUrl) {
    return {
      statusCode: 502,
      body: JSON.stringify({ error: 'No checkout URL returned from payment gateway', detail: hubtel.body })
    };
  }

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ checkoutUrl, voucherCode, clientReference })
  };
};
