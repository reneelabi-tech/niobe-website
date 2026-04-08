/* ============================================================
   NIOBE SPA — CONSULTATION FORM CONFIGURATION
   ============================================================ */

const NIOBE_CONSULTATION = {

  // Service categories (not individual services)
  services: {
    'facials':    { label: 'Facials',              sections: ['facial'] },
    'massage':    { label: 'Body Massage',          sections: ['massage'] },
    'wraps':      { label: 'Body Wraps & Scrubs',   sections: ['body'] },
    'eyes-brows': { label: 'Eyes & Brows',          sections: ['brows-lashes'] },
    'waxing':     { label: 'Hair Removal / Waxing', sections: ['waxing'] },
    'nails':      { label: 'Nails',                 sections: [] },
    'thermal':    { label: 'Thermal Facilities',    sections: ['steam-sauna'] },
  },

  packages: {
    // ── Elemis ──────────────────────────────────────────────────
    'elemis-couture-touch':      { label: 'Elemis Couture Touch',              sections: ['massage', 'facial'] },
    'elemis-couture-biotec':     { label: 'Elemis Couture Technology Biotec',  sections: ['facial', 'massage'] },
    'elemis-recharge':           { label: 'Elemis Recharge Package',           sections: ['body', 'massage', 'facial'] },
    'elemis-renew':              { label: 'Elemis Renew Package',              sections: ['body', 'massage', 'facial'] },
    'elemis-bliss':              { label: 'Elemis Bliss Package',              sections: ['body', 'steam-sauna', 'massage', 'facial'] },
    'elemis-body-detox':         { label: 'Elemis Body Detox Package',         sections: ['body'] },
    'elemis-beautiful-bride':    { label: 'Elemis Beautiful Bride Package',    sections: ['massage', 'facial'] },
    'elemis-peaceful-pregnancy': { label: 'Elemis Peaceful Pregnancy Package', sections: ['massage', 'facial'] },
    'elemis-love-solo':          { label: 'Elemis Love Package — Solo',        sections: ['massage'] },
    'elemis-love-two':           { label: 'Elemis Love Package — For Two',     sections: ['massage'] },

    // ── Niobe Signature ─────────────────────────────────────────
    'time-out':                  { label: 'Time Out Package',                  sections: ['massage'] },
    'indulge':                   { label: 'Indulge Package',                   sections: ['body', 'massage'] },
    'relax':                     { label: 'Relax Package',                     sections: ['massage', 'facial'] },
    'spa-alone-treat':           { label: 'Spa Alone Treat',                   sections: ['steam-sauna', 'facial', 'massage'] },
    'spa-together':              { label: 'Spa Together',                      sections: ['steam-sauna', 'facial', 'massage'] },
    'hammam-ritual':             { label: 'Hammam Ritual Package',             sections: ['steam-sauna', 'body', 'massage'] },
    'hammam-turkish-bath':       { label: 'Hammam Turkish Bath Ceremony',      sections: ['steam-sauna', 'body', 'massage'] },
    'hammam-1001':               { label: 'Hammam Thousand and One Night',     sections: ['steam-sauna', 'body', 'facial', 'massage'] },

    // ── Full Day Rituals ─────────────────────────────────────────
    'ultimate-spa-escape':       { label: 'The Ultimate Spa Escape',           sections: ['facial', 'steam-sauna', 'massage', 'body'] },
    'serenity':                  { label: 'Serenity Package',                  sections: ['massage', 'steam-sauna', 'body', 'facial'] },
    'spa-escape-journey':        { label: 'Niobe Spa Escape Journey',          sections: ['massage', 'steam-sauna', 'body', 'facial'] },

    // ── Easter 2026 ──────────────────────────────────────────────
    'easter-first-light':        { label: 'Easter — First Light',              sections: ['facial', 'massage'] },
    'easter-soft-reawakening':   { label: 'Easter — The Soft Reawakening',     sections: ['massage'] },
    'easter-in-full-bloom':      { label: 'Easter — In Full Bloom',            sections: ['massage', 'facial'] },
    'easter-gentle-return':      { label: 'Easter — Gentle Return',            sections: ['steam-sauna', 'body', 'massage'] },
  },

  sectionOrder: ['facial', 'massage', 'waxing', 'brows-lashes', 'steam-sauna', 'body'],
};
