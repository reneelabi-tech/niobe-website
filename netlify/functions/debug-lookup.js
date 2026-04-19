/**
 * debug-lookup — TEMPORARY, DELETE AFTER USE
 * Visit: /.netlify/functions/debug-lookup?mode=services&branch=EASTLEGON&q=freestyle
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

const dateStr = d => d.toISOString().split('T')[0];

exports.handler = async function (event) {
  const branch = event.queryStringParameters?.branch || 'EASTLEGON';
  const mode   = event.queryStringParameters?.mode   || 'lookup';
  const apiKey = process.env[`SIMPLESPA_API_KEY_${branch}`];

  if (!apiKey) return { statusCode: 200, body: JSON.stringify({ error: `No API key for ${branch}` }) };

  const AUTH = { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' };

  // ── mode=services ──────────────────────────────────────────────────────────
  if (mode === 'services') {
    const res      = await post('/api/v1/services.php', AUTH, { per_page: 1000 });
    const services = Array.isArray(res.body?.services) ? res.body.services : [];
    const search   = (event.queryStringParameters?.q || '').toLowerCase();
    const filtered = search
      ? services.filter(s => (s.name || '').toLowerCase().includes(search))
      : services.slice(0, 5);
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        totalServices: services.length,
        sample: filtered.map(s => ({ name: s.name, price: s.price ?? null }))
      }, null, 2)
    };
  }

  // ── mode=lookup ────────────────────────────────────────────────────────────
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
  const matched    = allClients.filter(c => {
    const m = (c.mobile || '').replace(/\s+/g, '');
    return variants.some(v => m === v || m.endsWith(v) || v.endsWith(m));
  });

  // Fetch appointments + build price map in parallel for matched clients
  const now       = new Date();
  const weekAgo   = new Date(now - 7 * 24 * 60 * 60 * 1000);
  const sixMonths = new Date(now.getTime() + 180 * 24 * 60 * 60 * 1000);

  const [svcRes, ...apptResults] = await Promise.all([
    post('/api/v1/services.php', AUTH, { per_page: 1000 }),
    ...matched.map(c => post('/api/v1/appointments.php', AUTH, {
      client_id: String(c.client_id),
      start: dateStr(weekAgo), end: dateStr(sixMonths), per_page: 10
    }))
  ]);

  const normaliseKey = str => (str || '').replace(/\s+/g, ' ').trim();
  const services = Array.isArray(svcRes.body?.services) ? svcRes.body.services : [];
  const priceMap = new Map();
  services.forEach(s => { if (s.name) priceMap.set(normaliseKey(s.name), s.price ?? null); });

  const apptDebug = [];
  apptResults.forEach(res => {
    const appts = Array.isArray(res.body?.appointments) ? res.body.appointments : [];
    appts.forEach(a => {
      const svcName = a.service?.service_name || null;
      apptDebug.push({
        appointment_id: a.appointment_id,
        service_raw: a.service,
        price_map_hit: svcName !== null ? (priceMap.get(normaliseKey(svcName)) ?? 'NOT FOUND') : 'no service name',
        start: a.start
      });
    });
  });

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name, phone, branch, searchLog,
      totalUnique: allClients.length,
      phoneMatches: matched.map(c => ({ client_id: c.client_id, firstname: c.firstname, lastname: c.lastname, mobile: c.mobile })),
      appointmentPriceDebug: apptDebug,
    }, null, 2)
  };
};
