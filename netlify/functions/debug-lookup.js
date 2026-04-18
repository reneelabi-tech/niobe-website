/**
 * debug-lookup — TEMPORARY, DELETE AFTER USE
 * Visit: /.netlify/functions/debug-lookup?name=Emmanuel+Tamakloe&phone=0503498428&branch=EASTLEGON
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
  const base     = phone.replace(/\s+/g, '').replace(/^\+233/, '').replace(/^233/, '');
  const variants = [...new Set([base, base.replace(/^0/, ''), base.startsWith('0') ? base : '0' + base])];

  // Search each word separately and deduplicate
  const searchTerms = [...new Set(name.trim().split(/\s+/).filter(Boolean))];
  const clientMap   = new Map();
  const searchLog   = [];

  for (const term of searchTerms) {
    const res = await post('/api/v1/clients.php', AUTH, { search: term, per_page: 100 });
    const clients = Array.isArray(res.body?.clients) ? res.body.clients : [];
    searchLog.push({ term, httpStatus: res.status, count: clients.length });
    clients.forEach(c => { if (c.client_id) clientMap.set(String(c.client_id), c); });
  }

  const allClients = [...clientMap.values()];

  // For each client: show name, stored mobile (raw), and whether any variant matches
  const results = allClients.map(c => {
    const raw         = c.mobile || '';
    const storedMobile = raw.replace(/\s+/g, '');
    const phoneMatch  = variants.some(v =>
      storedMobile === v || storedMobile.endsWith(v) || v.endsWith(storedMobile)
    );
    return {
      client_id:    c.client_id,
      firstname:    c.firstname,
      lastname:     c.lastname,
      mobile_raw:   raw,
      mobile_clean: storedMobile,
      phoneMatch,
    };
  });

  // Highlight: any client whose mobile_clean contains the digits we're looking for
  const needle   = variants[variants.length - 1].replace(/^0/, ''); // without leading 0
  const suspects = results.filter(r => r.mobile_clean.includes(needle));

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name,
      phone,
      branch,
      phoneVariantsTried: variants,
      searchLog,
      totalUnique: results.length,
      phoneMatches:   results.filter(r => r.phoneMatch),
      suspectsByPhone: suspects,   // clients whose number contains the target digits
      allResults: results           // full list
    }, null, 2)
  };
};
