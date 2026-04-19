const https = require('https');

// ── HTTP helpers ────────────────────────────────────────────────────────────

function request(method, hostname, path, headers, body) {
  return new Promise((resolve, reject) => {
    const bodyStr = body ? (typeof body === 'string' ? body : JSON.stringify(body)) : '';
    const opts = {
      hostname, path, method,
      headers: body
        ? { ...headers, 'Content-Length': Buffer.byteLength(bodyStr) }
        : headers
    };
    const req = https.request(opts, (res) => {
      let data = '';
      res.on('data', c => { data += c; });
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
        catch (e) { resolve({ status: res.statusCode, body: data }); }
      });
    });
    req.on('error', reject);
    if (bodyStr) req.write(bodyStr);
    req.end();
  });
}

// ── Airtable helpers ────────────────────────────────────────────────────────

const AT_HOST    = 'api.airtable.com';
const AT_BASE    = process.env.VOUCHER_BASE_ID  || 'appoxjO7vqvVO1vhS';
const AT_TABLE   = process.env.VOUCHER_TABLE_ID || 'tblWKcXNlNPRFertT';

function atHeaders() {
  return {
    'Authorization': `Bearer ${process.env.AIRTABLE_API_KEY}`,
    'Content-Type':  'application/json'
  };
}

async function findRecord(clientRef) {
  const filter = encodeURIComponent(`{Hubtel Reference} = "${clientRef}"`);
  const res = await request('GET', AT_HOST, `/v0/${AT_BASE}/${AT_TABLE}?filterByFormula=${filter}`, atHeaders(), null);
  if (res.body && res.body.records && res.body.records.length > 0) {
    return res.body.records[0];
  }
  return null;
}

async function updateRecord(id, fields) {
  return request('PATCH', AT_HOST, `/v0/${AT_BASE}/${AT_TABLE}/${id}`, atHeaders(), { fields });
}

// ── Resend email ────────────────────────────────────────────────────────────

async function sendEmail(to, recipientName, d) {
  const html = buildVoucherHtml(recipientName, d);
  const payload = {
    from:    'Niobe Spa <onboarding@resend.dev>',
    to:      [to],
    subject: `Your Niobe Spa Gift Voucher — ${d.voucherCode}`,
    html
  };
  return request('POST', 'api.resend.com', '/emails',
    {
      'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type':  'application/json'
    },
    payload
  );
}

// ── Voucher HTML builder ────────────────────────────────────────────────────

function buildVoucherHtml(recipientName, d) {
  const firstName  = (recipientName || 'you').split(' ')[0];
  const baseUrl    = 'https://niobebeauty.netlify.app';
  const gcNum      = d.cardDesign || '2';
  const msgBlock   = d.message
    ? `<div class="v-message">"${d.message}"</div>`
    : '';
  const typeLabel  = d.voucherType === 'open' ? 'Gift Card Value' : 'Treatment';

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<title>Your Niobe Spa Gift Voucher</title>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=DM+Sans:wght@400;500;700&display=swap" rel="stylesheet"/>
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
body{background:#E8E5DF;font-family:'DM Sans',Arial,sans-serif;padding:0;margin:0}
.vw{max-width:560px;margin:0 auto}
.vh{background:#2F241D;padding:20px 44px;display:flex;align-items:center;justify-content:space-between}
.vh-tag{font-family:'DM Sans',Arial,sans-serif;font-size:9px;font-weight:700;letter-spacing:.2em;text-transform:uppercase;color:rgba(255,254,246,.35)}
.vb{background:#7A795D;padding:9px 44px;font-family:'DM Sans',Arial,sans-serif;font-size:9px;font-weight:700;letter-spacing:.2em;text-transform:uppercase;color:rgba(255,254,246,.9)}
.vbd{background:#FFFEF6;padding:40px 44px 32px}
.vg{font-family:'DM Sans',Arial,sans-serif;font-size:11px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:rgba(47,36,29,.4);margin-bottom:6px}
.vr{font-family:'Cormorant Garamond',Georgia,serif;font-size:40px;font-weight:300;color:#2F241D;line-height:1.15;margin-bottom:24px}
.vr em{font-style:italic}
.v-message{font-family:'Cormorant Garamond',Georgia,serif;font-size:16px;line-height:1.8;color:rgba(47,36,29,.65);border-left:2px solid #7A795D;padding-left:16px;margin-bottom:32px;font-style:italic}
.vi{font-family:'DM Sans',Arial,sans-serif;font-size:13px;line-height:1.75;color:rgba(47,36,29,.6);margin-bottom:28px}
.vtb{border:1px solid rgba(47,36,29,.1);margin-bottom:28px}
.vth{background:#F5F3EE;padding:12px 18px;font-family:'DM Sans',Arial,sans-serif;font-size:9px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:rgba(47,36,29,.4)}
.vtd{padding:18px;display:flex;justify-content:space-between;align-items:center}
.vtn{font-family:'Cormorant Garamond',Georgia,serif;font-size:22px;font-weight:400;color:#2F241D}
.vtp{font-family:'DM Sans',Arial,sans-serif;font-size:22px;font-weight:700;color:#2F241D}
.vcs{text-align:center;margin-bottom:28px}
.vcl{font-family:'DM Sans',Arial,sans-serif;font-size:9px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:rgba(47,36,29,.35);margin-bottom:10px}
.vc{font-family:'DM Sans',monospace;font-size:30px;font-weight:700;letter-spacing:.18em;color:#2F241D;background:#F5F3EE;padding:14px 24px;display:inline-block;border:1px dashed rgba(47,36,29,.15)}
.vm{display:flex;border:1px solid rgba(47,36,29,.08);margin-bottom:0}
.vmi{flex:1;padding:14px 12px;text-align:center;border-right:1px solid rgba(47,36,29,.08)}
.vmi:last-child{border-right:none}
.vml{font-family:'DM Sans',Arial,sans-serif;font-size:9px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:rgba(47,36,29,.35);margin-bottom:5px}
.vmv{font-family:'Cormorant Garamond',Georgia,serif;font-size:15px;color:#2F241D}
.vre{background:#FFFEF6;padding:28px 44px;border-top:1px solid rgba(47,36,29,.08)}
.vret{font-family:'DM Sans',Arial,sans-serif;font-size:10px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:rgba(47,36,29,.4);margin-bottom:12px}
.vre p{font-family:'Cormorant Garamond',Georgia,serif;font-size:15px;line-height:1.75;color:rgba(47,36,29,.65)}
.vct{background:#7A795D;padding:28px 44px;text-align:center}
.vct p{font-family:'Cormorant Garamond',Georgia,serif;font-size:15px;color:rgba(255,254,246,.8);margin-bottom:16px;font-style:italic}
.vbtn{display:inline-block;background:#FFFEF6;color:#2F241D;font-family:'DM Sans',Arial,sans-serif;font-size:10px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;padding:14px 32px;text-decoration:none}
.vft{background:#2F241D;padding:20px 44px;display:flex;justify-content:space-between;align-items:center}
.vsl{font-family:'Pinyon Script','Cormorant Garamond',cursive;font-size:18px;color:rgba(255,254,246,.5);letter-spacing:.02em}
.vfd{font-family:'DM Sans',Arial,sans-serif;font-size:10px;color:rgba(255,254,246,.25);text-align:right;line-height:1.7}
.vsm{background:#F5F3EE;padding:14px 44px;font-family:'DM Sans',Arial,sans-serif;font-size:10px;color:rgba(47,36,29,.35);line-height:1.7;text-align:center}
</style>
</head>
<body>
<div class="vw">
  <div class="vh">
    <img src="${baseUrl}/images/niobe-spa-logo-white.png" alt="Niobe Spa" style="height:100px;width:auto;display:block;"/>
    <div class="vh-tag">Gift Voucher</div>
  </div>
  <div class="vb">You have received a gift</div>
  <div style="background:#FFFEF6;padding:28px 44px 0;">
    <img src="${baseUrl}/images/gc-design-${gcNum}.jpg" alt="Gift Card Design" style="width:100%;display:block;border:1px solid rgba(47,36,29,.08);"/>
  </div>
  <div class="vbd">
    <div class="vg">For</div>
    <div class="vr">Lovely to have<br><em>you with us,</em><br>${firstName}.</div>
    ${msgBlock}
    <div class="vi">Your voucher is valid at the branches listed below. Simply quote your voucher code when booking or present it at reception on arrival.</div>
    <div class="vtb">
      <div class="vth">Your ${typeLabel}</div>
      <div class="vtd">
        <div class="vtn">${d.treatmentLabel}</div>
        <div class="vtp">GHS ${Number(d.amount).toLocaleString()}</div>
      </div>
    </div>
    <div class="vcs">
      <div class="vcl">Redemption Code</div>
      <div class="vc">${d.voucherCode}</div>
    </div>
    <div class="vm">
      <div class="vmi">
        <div class="vml">Valid Until</div>
        <div class="vmv">${d.expiryFormatted}</div>
      </div>
      <div class="vmi">
        <div class="vml">From</div>
        <div class="vmv">${d.senderName}</div>
      </div>
      <div class="vmi">
        <div class="vml">Valid At</div>
        <div class="vmv" style="font-size:12px;line-height:1.5;">${d.validBranches}</div>
      </div>
    </div>
  </div>
  <div class="vre">
    <div class="vret">How to Redeem</div>
    <p>Call us on +233 30 277 7222 or book online at niobebeauty.com. Quote your voucher code at the time of booking or present it at reception on arrival. Please note this voucher is only redeemable at the branches listed on your voucher.</p>
  </div>
  <div class="vct">
    <p>Ready to book your experience?</p>
    <a href="${baseUrl}/booking.html" class="vbtn">Book Your Visit</a>
  </div>
  <div class="vft">
    <div class="vsl">where ageing is optional&hellip;</div>
    <div class="vfd">niobebeauty.com<br>+233 30 277 7222</div>
  </div>
  <div class="vsm">Valid for 90 days from date of purchase &nbsp;&middot;&nbsp; Not redeemable for cash &nbsp;&middot;&nbsp; Cannot be combined with other offers<br>East Legon &nbsp;&middot;&nbsp; Cantonments &nbsp;&middot;&nbsp; African Regent &nbsp;&middot;&nbsp; Community 18 &nbsp;&middot;&nbsp; Alisa Hotel Tema</div>
</div>
</body>
</html>`;
}

// ── Handler ─────────────────────────────────────────────────────────────────

exports.handler = async function (event) {
  let payload = {};

  if (event.httpMethod === 'POST' && event.body) {
    try { payload = JSON.parse(event.body); }
    catch (e) { payload = {}; }
  } else {
    payload = event.queryStringParameters || {};
  }

  // Hubtel sends different keys depending on the flow
  const clientRef  = payload.ClientReference || payload.clientReference;
  const respCode   = payload.ResponseCode    || payload.responseCode;
  const txId       = payload.TransactionId   || payload.transactionId || payload.HubtelTransactionId;
  const status     = (payload.Status || '').toLowerCase();

  if (!clientRef) {
    console.log('hubtel-callback: no clientReference in payload', payload);
    return { statusCode: 200, body: 'OK' };
  }

  const isSuccess = respCode === '0000' || status === 'success';

  if (!isSuccess) {
    console.log('hubtel-callback: payment not successful', { clientRef, respCode, status });
    return { statusCode: 200, body: 'OK' };
  }

  // Look up the record
  let record;
  try {
    record = await findRecord(clientRef);
  } catch (err) {
    console.error('hubtel-callback: Airtable lookup failed', err);
    return { statusCode: 200, body: 'OK' }; // Always 200 to Hubtel
  }

  if (!record) {
    console.error('hubtel-callback: record not found for', clientRef);
    return { statusCode: 200, body: 'OK' };
  }

  const f = record.fields;

  // Update record with Hubtel transaction ID
  try {
    await updateRecord(record.id, {
      'Hubtel Reference': txId || clientRef
    });
  } catch (err) {
    console.error('hubtel-callback: Airtable update failed', err);
  }

  // Send email if recipient email is populated
  if (f['Recipient Email'] && f['Recipient Email'].length > 0) {
    const expiry = new Date(f['Expiry Date']);
    const expiryFormatted = expiry.toLocaleDateString('en-GB', {
      day: 'numeric', month: 'long', year: 'numeric'
    });

    // Extract card design number
    const m = (f['Card Design'] || '').match(/\((\d)\)/);
    const cardDesign = m ? m[1] : '2';

    const isOpen = (f['Treatment'] || '').toLowerCase().startsWith('open value');

    const voucherData = {
      voucherCode:    f['Voucher Code'],
      treatmentLabel: f['Treatment'],
      amount:         f['Amount (GHS)'],
      senderName:     f['Buyer Name'],
      message:        f['Personal Message'],
      validBranches:  f['Valid Branches'],
      expiryFormatted,
      cardDesign,
      voucherType:    isOpen ? 'open' : 'treatment'
    };

    try {
      const result = await sendEmail(f['Recipient Email'], f['Recipient Name'], voucherData);
      console.log('hubtel-callback: email sent', result.status, result.body);
    } catch (err) {
      console.error('hubtel-callback: email send failed', err);
    }
  }

  return { statusCode: 200, body: 'OK' };
};
