/**
 * debug-lookup — TEMPORARY, DELETE AFTER USE
 * Visit: /.netlify/functions/debug-lookup?mode=services&branch=EASTLEGON
 * Visit: /.netlify/functions/debug-lookup?name=First+Last&phone=0501234567&branch=EASTLEGON
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
  const branch = event.queryStringParameters?.branch || 'EASTLEGON';
  const mode   = event.queryStringParameters?.mode   || 'lookup';
  const apiKey = process.env[`SIMPLESPA_API_KEY_${branch}`];

  if (!apiKey) return { statusCode: 200, body: JSON.stringify({ error: `No API key for ${branch}` }) };

  const AUTH = { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' };

  // ── mode=services: fetch all services and build price map ─────────────────
  if (mode === 'services') {
    const res      = await post('/api/v1/services.php', AUTH, { per_page: 1000 });
    const services = Array.isArray(res.body?.services) ? res.body.services : [];
    const search   = (event.queryStringParameters?.q || '').toLowerCase();

    const priceMap = {};
    services.forEach(s => {
      const n = s.name || s.service_name;
      if (n) priceMap[n] = s.price ?? s.cost ?? s.sale_price ?? null;
    });

    const filtered = search
      ? services.filter(s => (s.name || '').toLowerCase().includes(search))
      : services.slice(0, 5);

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        httpStatus: res.status,
        totalServices: services.length,
        note: 'Add &q=elemis to filter by name',
        sample: filtered.map(s => ({ name: s.name, price: s.price ?? s.cost ?? null }))
      }, null, 2)
    };
  }

  // ── mode=lookup (default) ─────────────────────────────────────────────────
  const name  = event.queryStringParameters?.name  || '';
  const phone = event.queryStringParameters?.phone || '';

  const base     = phone.replace(/\s+/g, '').replace(/^\+233/, '').replace(/^233/, '');
  const variants = [...new Set([base, base.replace(/^0/, ''), base.startsWith('0') ? base : '0' + base])];

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
  const needle     = variants[variants.length - 1].replace(/^0/, '');

  const results = allClients.map(c => {
    const storedMobile = (c.mobile || '').replace(/\s+/g, '');
    const phoneMatch   = variants.some(v =>
      storedMobile === v || storedMobile.endsWith(v) || v.endsWith(storedMobile)
    );
    return { client_id: c.client_id, firstname: c.firstname, lastname: c.lastname,
             mobile_raw: c.mobile, mobile_clean: storedMobile, phoneMatch };
  });

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name, phone, branch, phoneVariantsTried: variants, searchLog,
      totalUnique: results.length,
      phoneMatches:    results.filter(r => r.phoneMatch),
      suspectsByPhone: results.filter(r => r.mobile_clean.includes(needle)),
    }, null, 2)
  };
};
