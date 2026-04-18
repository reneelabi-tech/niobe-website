/**
 * lookup-booking
 * Searches all active SimpleSpa branches for appointments by phone + name.
 *
 * Each branch is a separate SimpleSpa account with its own API key,
 * but all use the same central endpoint: https://my.simplespa.com/api/v1/
 *
 * POST body: { name: string, phone: string }
 * Returns:   { bookings: [...] }
 *
 * ─── ADDING A NEW BRANCH ───────────────────────────────────────────────────
 * 1. Set enabled: true for that branch below
 * 2. Add one env var in Netlify dashboard:
 *      SIMPLESPA_API_KEY_[BRANCHKEY]   e.g. SIMPLESPA_API_KEY_AFRICANREGENT
 * ───────────────────────────────────────────────────────────────────────────
 *
 * ⚠ STILL NEEDS VERIFICATION:
 *   - Client response field names (first_name, last_name, id) — check a real response
 *   - Appointment response field names (see ⚠ comments in searchBranch below)
 *   - Status integer values — docs mention a status table, get those to filter correctly
 */

const https = require('https');

const SIMPLESPA_HOST = 'my.simplespa.com';
const SIMPLESPA_PATH = '/api/v1';

// ── Branch config ─────────────────────────────────────────────────────────────
// enabled: false = API key not yet received, will be skipped silently
const BRANCHES = [
  { name: 'East Legon',           key: 'EASTLEGON',     enabled: true  },
  { name: 'Cantonments',          key: 'CANTONMENTS',   enabled: true  },
  { name: 'Community 18',         key: 'COMMUNITY18',   enabled: true  },
  { name: 'African Regent Hotel', key: 'AFRICANREGENT', enabled: false },
  { name: 'Alisa Hotel',          key: 'ALISAHOTEL',    enabled: false },
];

// ── HTTP helpers ──────────────────────────────────────────────────────────────
function post(path, headers, body) {
  return new Promise((resolve, reject) => {
    const bodyStr = JSON.stringify(body);
    const req = https.request(
      {
        hostname: SIMPLESPA_HOST,
        path,
        method: 'POST',
        headers: { ...headers, 'Content-Length': Buffer.byteLength(bodyStr) }
      },
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

function get(path, headers) {
  return new Promise((resolve, reject) => {
    const req = https.request(
      { hostname: SIMPLESPA_HOST, path, method: 'GET', headers },
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

function normalise(str) {
  return (str || '').toLowerCase().replace(/\s+/g, ' ').trim();
}

function nameMatches(input, record) {
  // Confirmed field names from SimpleSpa docs: firstname, lastname
  const full = normalise(`${record.firstname || ''} ${record.lastname || ''}`);
  const inp  = normalise(input);
  return (
    full.includes(inp) ||
    inp.includes(normalise(record.firstname)) ||
    inp.includes(normalise(record.lastname))
  );
}

function dateStr(d) {
  return d.toISOString().split('T')[0]; // YYYY-MM-DD
}

// Confirmed status codes from SimpleSpa docs
const STATUS_MAP = {
  0:  'pending',    // New
  5:  'pending',    // Rebooked
  7:  'pending',    // Request
  10: 'pending',    // Online
  12: 'pending',    // Payment Due
  15: 'cancelled',  // Canceled
  17: 'cancelled',  // No-Show
  20: 'confirmed',  // Confirmed
  22: 'confirmed',  // Confirmed (No SMS)
  25: 'confirmed',  // Arrived
  30: 'confirmed',  // Paid
  40: 'completed',  // Completed
};

function mapStatus(raw) {
  if (raw === undefined || raw === null) return 'pending';
  return STATUS_MAP[Number(raw)] || 'pending';
}

// ── Search one branch ─────────────────────────────────────────────────────────
async function searchBranch(branch, name, phone) {
  const apiKey = process.env[`SIMPLESPA_API_KEY_${branch.key}`];
  if (!apiKey) {
    console.warn(`lookup-booking: no API key for ${branch.name} — skipping`);
    return [];
  }

  const AUTH = {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type':  'application/json'
  };

  // ── Step 1: Find client by phone ───────────────────────────────────────────
  // Normalise phone: SimpleSpa stores without leading 0 or country code
  // e.g. user enters "0244334323" or "+233244334323" → search "244334323"
  const normalisedPhone = phone
    .replace(/\s+/g, '')          // remove spaces
    .replace(/^\+233/, '')        // remove +233 prefix
    .replace(/^233/, '')          // remove 233 prefix
    .replace(/^0/, '');           // remove leading 0

  let clientRes;
  try {
    clientRes = await post(
      `${SIMPLESPA_PATH}/clients.php`,
      AUTH,
      { search: normalisedPhone, per_page: 50 }
    );
  } catch (err) {
    console.error(`lookup-booking: ${branch.name} client fetch failed:`, err.message);
    return [];
  }

  if (clientRes.status !== 200) {
    console.warn(`lookup-booking: ${branch.name} clients returned ${clientRes.status}`);
    return [];
  }

  // Response likely: { success: true, clients: [...] } — same pattern as appointments
  // Fall back to array root just in case
  const clients = Array.isArray(clientRes.body?.clients)
    ? clientRes.body.clients
    : Array.isArray(clientRes.body)
      ? clientRes.body
      : [];

  const matched = clients.filter(c => nameMatches(name, c));
  if (matched.length === 0) return [];

  // ── Step 2: Fetch appointments for matched client(s) ───────────────────────
  const now       = new Date();
  const weekAgo   = new Date(now - 7 * 24 * 60 * 60 * 1000);
  const sixMonths = new Date(now.getTime() + 180 * 24 * 60 * 60 * 1000);

  const bookings = [];

  for (const client of matched) {
    let apptRes;
    try {
      // Confirmed from docs: POST https://my.simplespa.com/api/v1/appointments.php
      apptRes = await post(
        `${SIMPLESPA_PATH}/appointments.php`,
        AUTH,
        {
          client_id: String(client.client_id),
          start:     dateStr(weekAgo),    // 7 days ago
          end:       dateStr(sixMonths),  // 6 months ahead (catches all upcoming)
          per_page:  100
        }
      );
    } catch (err) {
      console.error(`lookup-booking: ${branch.name} appointments fetch failed:`, err.message);
      continue;
    }

    if (apptRes.status !== 200) continue;

    // Confirmed response shape: { success: true, appointments: [...], total_results: N }
    const appts = Array.isArray(apptRes.body?.appointments)
      ? apptRes.body.appointments
      : [];

    // Confirmed response shape: { success, appointments: [...], total_results }
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
        status:       mapStatus(a.status),   // 'confirmed'|'cancelled'|'pending'|'completed'
        status_label: a.status_label || null, // e.g. "Confirmed", "Payment Due"
        price:        null  // not returned by appointments endpoint
      });
    });
  }

  return bookings;
}

// ── Handler ───────────────────────────────────────────────────────────────────
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

  // Query all enabled branches in parallel
  const activeBranches = BRANCHES.filter(b => b.enabled);
  const results = await Promise.allSettled(
    activeBranches.map(b => searchBranch(b, name, phone))
  );

  const allBookings = results.flatMap(r => r.status === 'fulfilled' ? r.value : []);

  // Sort soonest first
  allBookings.sort((a, b) => new Date(a.start_at) - new Date(b.start_at));

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ bookings: allBookings })
  };
};
