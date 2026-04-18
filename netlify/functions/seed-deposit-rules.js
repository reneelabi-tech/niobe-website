/**
 * seed-deposit-rules — debug version
 * Returns raw SimpleSpa response so we can see what's coming back.
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

exports.handler = async function () {
  const debug = [];

  for (const branch of BRANCHES) {
    const apiKey = process.env[`SIMPLESPA_API_KEY_${branch.key}`];

    if (!apiKey) {
      debug.push({ branch: branch.name, error: 'No API key found in env vars' });
      continue;
    }

    try {
      const res = await post(
        'my.simplespa.com',
        '/api/v1/services.php',
        { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        { per_page: 100 }
      );

      debug.push({
        branch:     branch.name,
        httpStatus: res.status,
        bodyKeys:   typeof res.body === 'object' ? Object.keys(res.body) : 'not an object',
        raw:        JSON.stringify(res.body).slice(0, 800)
      });
    } catch (err) {
      debug.push({ branch: branch.name, error: err.message });
    }
  }

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ debug }, null, 2)
  };
};
