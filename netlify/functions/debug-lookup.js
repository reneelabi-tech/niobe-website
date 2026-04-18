/**
 * debug-lookup — TEMPORARY, DELETE AFTER USE
 * Returns raw SimpleSpa client search response.
 * Visit: /.netlify/functions/debug-lookup?phone=244334323&branch=EASTLEGON
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
  const phone  = event.queryStringParameters?.phone  || '244334323';
  const branch = event.queryStringParameters?.branch || 'EASTLEGON';
  const apiKey = process.env[`SIMPLESPA_API_KEY_${branch}`];

  if (!apiKey) {
    return { statusCode: 200, body: JSON.stringify({ error: `No API key for ${branch}` }) };
  }

  const AUTH = { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' };

  const base     = phone.replace(/\s+/g, '').replace(/^\+233/, '').replace(/^233/, '');
  const without0 = base.replace(/^0/, '');
  const with0    = base.startsWith('0') ? base : '0' + base;
  const variants = [...new Set([base, without0, with0])];

  const results = {};
  for (const v of variants) {
    const res = await post('/api/v1/clients.php', AUTH, { search: v, per_page: 10 });
    results[v] = { httpStatus: res.status, total_results: res.body?.total_results, clients: res.body?.clients };
  }

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone, branch, results }, null, 2)
  };
};
