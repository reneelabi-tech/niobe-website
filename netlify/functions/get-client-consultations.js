/* ============================================================
   NIOBE SPA — GET CLIENT CONSULTATIONS
   Requires valid Netlify Identity JWT in Authorization header.
   Returns Airtable records matching the authenticated user's email.
   ============================================================ */

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  // Netlify Identity: context.clientContext.user is populated automatically
  // when a valid Identity JWT is sent in the Authorization header.
  const { clientContext } = context;
  if (!clientContext || !clientContext.user) {
    return {
      statusCode: 401,
      headers,
      body: JSON.stringify({ error: 'Unauthorised. Please log in.' }),
    };
  }

  const userEmail = clientContext.user.email;
  const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN;
  const BASE_ID        = 'app5nw5dr6OPwRPZ9';
  const TABLE_ID       = 'tblEkytaAhqgkbY3s';

  const fields = [
    'Full Name',
    'Email Address',
    'Appointment Date',
    'Treatment Booked',
    'Branch',
    'Booking Type',
    'Submission Date',
    'Health Flags',
    'Full Form Data',
    'Form Summary Link',
    'Consultation Completed',
    'Date of Birth',
    'Gender',
  ];

  const fieldParams = fields.map(f => `fields[]=${encodeURIComponent(f)}`).join('&');
  const filter      = encodeURIComponent(`{Email Address}="${userEmail}"`);
  const sort        = encodeURIComponent(JSON.stringify([{ field: 'Submission Date', direction: 'desc' }]));

  const url = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_ID}?filterByFormula=${filter}&sort[0][field]=Submission%20Date&sort[0][direction]=desc&${fieldParams}`;

  try {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${AIRTABLE_TOKEN}` },
    });

    if (!res.ok) {
      const err = await res.text();
      console.error('Airtable error:', res.status, err);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Failed to fetch records.' }),
      };
    }

    const data = await res.json();

    // Parse Full Form Data JSON string in each record
    const records = (data.records || []).map(r => {
      const fields = { ...r.fields };
      if (fields['Full Form Data']) {
        try {
          fields['Full Form Data'] = JSON.parse(fields['Full Form Data']);
        } catch (_) {
          // Leave as string if unparseable
        }
      }
      return { id: r.id, fields };
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ records }),
    };
  } catch (err) {
    console.error('Server error:', err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Server error.' }),
    };
  }
};
