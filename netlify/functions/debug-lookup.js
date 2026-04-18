/**
 * debug-lookup — TEMPORARY, DELETE AFTER USE
 * Visit: /.netlify/functions/debug-lookup?name=Emmanuel&phone=0503498428&branch=EASTLEGON
 */

const https = require('https');

function post(path, headers, body) {
  return new Promise((resolve, reject) => {
    const bodyStr = JSON.stringify(body);
    const req = https.request(
      { hostname: 'my.simplespa.com', path, method: 'POST',
        headers: { ...headers, 'Content-Length': Buffer.byteLength(bodyStr) } },
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
  const name   = event.queryStringParameters?.name   || '';
  const phone  = event.queryStringParameters?.phone  || '';
  const branch = event.queryStringParameters?.branch || 'EASTLEGON';
  const apiKey = process.env[`SIMPLESPA_API_KEY_${branch}`];

  if (!apiKey) return { statusCode: 200, body: JSON.stringify({ error: `No API key for ${branch}` }) };

  const AUTH = { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' };

  // Build phone variants
  const base   = phone.replace(/\s+/g, '').replace(/^\+233/, '').replace(/^233/, '');
  const variants = [...new Set([base, base.replace(/^0/, ''), base.startsWith('0') ? base : '0' + base])];

  // Search by name
  const res = await post('/api/v1/clients.php', AUTH, { search: name, per_page: 100 });
  const clients = Array.isArray(res.body?.clients) ? res.body.clients : [];

  // Show each client + whether phone matches
  const results = clients.map(c => {
    const storedMobile = (c.mobile || '').replace(/\s+/g, '');
    const phoneMatch = variants.some(v =>
      storedMobile === v || storedMobile.endsWith(v) || v.endsWith(storedMobile)
    );
    return {
      client_id:  c.client_id,
      firstname:  c.firstname,
      lastname:   c.lastname,
      mobile:     c.mobile,
      phoneMatch,
      phoneVariantsTried: variants
    };
  });

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, phone, branch, total: clients.length, results }, null, 2)
  };
};
