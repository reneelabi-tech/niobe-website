/**
 * lookup-booking
 * Searches all active SimpleSpa branches for appointments by phone + name.
 *
 * ─── ADDING A NEW BRANCH ───────────────────────────────────────────────────
 * 1. Set enabled: true for that branch below
 * 2. Add env var: SIMPLESPA_API_KEY_[BRANCHKEY]
 * ───────────────────────────────────────────────────────────────────────────
 */

const https = require('https');

const SIMPLESPA_HOST = 'my.simplespa.com';
const SIMPLESPA_PATH = '/api/v1';

const BRANCHES = [
  { name: 'East Legon',           key: 'EASTLEGON',     enabled: true  },
  { name: 'Cantonments',          key: 'CANTONMENTS',   enabled: true  },
  { name: 'Community 18',         key: 'COMMUNITY18',   enabled: true  },
  { name: 'African Regent Hotel', key: 'AFRICANREGENT', enabled: false },
  { name: 'Alisa Hotel',          key: 'ALISAHOTEL',    enabled: false },
];

function post(path, headers, body) {
  return new Promise((resolve, reject) => {
    const bodyStr = JSON.stringify(body);
    const req = https.request(
      { hostname: SIMPLESPA_HOST, path, method: 'POST',
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

function normalise(str) {
  return (str || '').toLowerCase().replace(/\s+/g, ' ').trim();
}

function nameMatches(input, record) {
  const first    = normalise(record.firstname || '');
  const last     = normalise(record.lastname  || '');
  const full     = normalise(`${first} ${last}`);
  const reversed = normalise(`${last} ${first}`);
  const inp      = normalise(input);
  return (
    full.includes(inp)     ||
    reversed.includes(inp) ||
    inp.includes(first)    ||
    inp.includes(last)
  );
}

function dateStr(d) {
  return d.toISOString().split('T')[0];
}

const STATUS_MAP = {
  0:  'pending',   5:  'pending',   7:  'pending',
  10: 'pending',   12: 'pending',
  15: 'cancelled', 17: 'cancelled',
  20: 'confirmed', 22: 'confirmed', 25: 'confirmed',
  30: 'confirmed', 40: 'completed',
};

function mapStatus(raw) {
  if (raw === undefined || raw === null) return 'pending';
  return STATUS_MAP[Number(raw)] || 'pending';
}

// Build phone search variants — SimpleSpa stores numbers inconsistently
// (some with leading 0, some without)
function phoneVariants(phone) {
  const base = phone.replace(/\s+/g, '').replace(/^\+233/, '').replace(/^233/, '');
  const without0 = base.replace(/^0/, '');
  const with0    = base.startsWith('0') ? base : '0' + base;
  return [...new Set([base, without0, with0])];
}

async function searchBranch(branch, name, phone) {
  const apiKey = process.env[`SIMPLESPA_API_KEY_${branch.key}`];
  if (!apiKey) {
    console.warn(`lookup-booking: no API key for ${branch.name}`);
    return [];
  }

  const AUTH = { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' };

  // ── Step 1: Search by name (reliable) then verify phone matches ────────────
  // SimpleSpa cannot search "First Last" as a combined query — returns 0 results.
  // Search each word separately and deduplicate by client_id.
  const searchTerms = [...new Set(name.trim().split(/\s+/).filter(Boolean))];
  const clientMap = new Map();

  for (const term of searchTerms) {
    let res;
    try {
      res = await post(`${SIMPLESPA_PATH}/clients.php`, AUTH, { search: term, per_page: 100 });
    } catch (err) {
      console.error(`lookup-booking: ${branch.name} client fetch failed (term="${term}"):`, err.message);
      continue;
    }
    if (res.status !== 200) continue;
    const clients = Array.isArray(res.body?.clients) ? res.body.clients :
                    Array.isArray(res.body)           ? res.body : [];
    clients.forEach(c => { if (c.client_id) clientMap.set(String(c.client_id), c); });
  }

  const allClients = [...clientMap.values()];

  // Build all phone variants the user might have entered
  const variants = phoneVariants(phone);

  // Keep clients whose name matches AND whose mobile matches any phone variant
  const matched = allClients.filter(c => {
    if (!nameMatches(name, c)) return false;
    const storedMobile = (c.mobile || '').replace(/\s+/g, '');
    return variants.some(v => storedMobile === v || storedMobile.endsWith(v) || v.endsWith(storedMobile));
  });

  if (matched.length === 0) return [];

  // ── Step 2: Get appointments for matched client(s) ─────────────────────────
  const now       = new Date();
  const weekAgo   = new Date(now - 7 * 24 * 60 * 60 * 1000);
  const sixMonths = new Date(now.getTime() + 180 * 24 * 60 * 60 * 1000);
  const bookings  = [];

  for (const client of matched) {
    try {
      const res = await post(`${SIMPLESPA_PATH}/appointments.php`, AUTH, {
        client_id: String(client.client_id),
        start:     dateStr(weekAgo),
        end:       dateStr(sixMonths),
        per_page:  100
      });

      if (res.status !== 200) continue;

      const appts = Array.isArray(res.body?.appointments) ? res.body.appointments : [];

      appts.forEach(a => {
        bookings.push({
          id:           a.appointment_id,
          client_name:  a.client
                          ? `${a.client.first_name} ${a.client.last_name}`
                          : `${client.firstname} ${client.lastname}`,
          service_name: a.service?.service_name || null,
          staff_name:   a.staff?.staff_name     || null,
          branch:       branch.name,
          start_at:     a.start,
          end_at:       a.end,
          status:       mapStatus(a.status),
          status_label: a.status_label || null,
          price:        null
        });
      });
    } catch (err) {
      console.error(`lookup-booking: ${branch.name} appointments fetch failed:`, err.message);
    }
  }

  return bookings;
}

exports.handler = async function (event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  let body;
  try { body = JSON.parse(event.body); }
  catch (e) { return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON' }) }; }

  const { name, phone } = body;
  if (!name || !phone) {
    return { statusCode: 400, body: JSON.stringify({ error: 'name and phone are required' }) };
  }

  const activeBranches = BRANCHES.filter(b => b.enabled);
  const results = await Promise.allSettled(
    activeBranches.map(b => searchBranch(b, name, phone))
  );

  const allBookings = results.flatMap(r => r.status === 'fulfilled' ? r.value : []);
  allBookings.sort((a, b) => new Date(a.start_at) - new Date(b.start_at));

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ bookings: allBookings })
  };
};
