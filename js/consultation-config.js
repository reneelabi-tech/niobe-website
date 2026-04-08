/* ============================================================
   NIOBE SPA — CONSULTATION FORM CONFIGURATION
   Maps services and packages to their relevant form sections.
   ============================================================ */

const NIOBE_CONSULTATION = {
  services: {
    // facials
    'classic-facial':      { label: 'Classic / Deep Cleansing Facial',      sections: ['facial'] },
    'brightening-facial':  { label: 'Brightening / Glow Facial',            sections: ['facial'] },
    'anti-ageing-facial':  { label: 'Anti-Ageing Facial',                   sections: ['facial'] },
    'elemis-biotec':       { label: 'Elemis BIOTEC Facial',                 sections: ['facial'] },
    'million-dollar':      { label: 'Million Dollar Super Facial',          sections: ['facial'] },
    'elemis-superfood':    { label: 'Elemis Superfood Facial',              sections: ['facial'] },
    'acne-facial':         { label: 'Acne / Breakout Facial',               sections: ['facial'] },
    'hydrating-facial':    { label: 'Hydrating / Sensitive Facial',         sections: ['facial'] },
    'chemical-peel':       { label: 'Chemical Exfoliation / Peel',          sections: ['facial'] },
    // massage
    'deep-tissue':         { label: 'Deep Tissue Massage',                  sections: ['massage'] },
    'hot-stone':           { label: 'Hot Stone Massage',                    sections: ['massage'] },
    'swedish':             { label: 'Swedish / Relaxation Massage',         sections: ['massage'] },
    'aromatherapy':        { label: 'Aromatherapy Massage',                 sections: ['massage'] },
    'rose-massage':        { label: 'Garden of England Rose Massage',       sections: ['massage'] },
    'indian-head':         { label: 'Indian Head Massage',                  sections: ['massage'] },
    'reflexology':         { label: 'Reflexology',                          sections: ['massage'] },
    'bns-massage':         { label: 'Back, Neck & Shoulder Massage',        sections: ['massage'] },
    // waxing
    'upper-lip-wax':       { label: 'Upper Lip Wax',                        sections: ['waxing'] },
    'chin-wax':            { label: 'Chin Wax',                             sections: ['waxing'] },
    'full-face-wax':       { label: 'Full Face Wax',                        sections: ['waxing'] },
    'underarm-wax':        { label: 'Underarm Wax',                         sections: ['waxing'] },
    'full-leg-wax':        { label: 'Full Leg Wax',                         sections: ['waxing'] },
    'half-leg-wax':        { label: 'Half Leg Wax',                         sections: ['waxing'] },
    'bikini-wax':          { label: 'Bikini Line Wax',                      sections: ['waxing'] },
    'brazilian-wax':       { label: 'Full Brazilian Wax',                   sections: ['waxing'] },
    // brows & lashes
    'eyebrow-tint':        { label: 'Eyebrow Tint',                         sections: ['brows-lashes'] },
    'eyebrow-wax':         { label: 'Eyebrow Wax & Shape',                  sections: ['brows-lashes'] },
    'eyebrow-thread':      { label: 'Eyebrow Thread & Shape',               sections: ['brows-lashes'] },
    'brow-lamination':     { label: 'Brow Lamination',                      sections: ['brows-lashes'] },
    'lash-tint':           { label: 'Lash Tint',                            sections: ['brows-lashes'] },
    'lash-extensions':     { label: 'Lash Extensions',                      sections: ['brows-lashes'] },
    'lash-lift':           { label: 'Lash Lift / Perm',                     sections: ['brows-lashes'] },
    // steam / sauna
    'steam-session':       { label: 'Steam Room Session',                   sections: ['steam-sauna'] },
    'sauna-session':       { label: 'Dry Sauna Session',                    sections: ['steam-sauna'] },
    'herbal-steam':        { label: 'Herbal / Aromatherapy Steam',          sections: ['steam-sauna'] },
    // body
    'salt-scrub':          { label: 'Salt Scrub',                           sections: ['body'] },
    'lime-ginger-scrub':   { label: 'Lime & Ginger Salt Scrub',             sections: ['body'] },
    'detox-wrap':          { label: 'Detox / Clay Body Wrap',               sections: ['body'] },
    'hydrating-wrap':      { label: 'Hydrating / Nourishing Body Wrap',     sections: ['body'] },
    'thermal-wrap':        { label: 'Thermal / Heat Body Wrap',             sections: ['body'] },
    'universal-contour':   { label: 'Universal Contour Body Wrap',          sections: ['body'] },
    'hammam':              { label: 'Hammam Ceremony',                      sections: ['steam-sauna', 'body'] },
  },

  packages: {
    'elemis-bliss':            { label: 'Elemis Bliss Package',             sections: ['body', 'steam-sauna', 'massage', 'facial'] },
    'elemis-indulgence':       { label: 'Elemis Indulgence Package',        sections: ['facial', 'massage'] },
    'elemis-refresh':          { label: 'Elemis Refresh Package',           sections: ['facial', 'massage'] },
    'spa-escape-journey':      { label: 'Niobe Spa Escape Journey',         sections: ['massage', 'steam-sauna', 'body', 'facial'] },
    'pure-indulgence':         { label: 'Niobe Pure Indulgence Package',    sections: ['facial', 'massage', 'body'] },
    'sublime':                 { label: 'Niobe Sublime Package',            sections: ['facial', 'massage'] },
    'twos-company':            { label: "Two's Company (Couples Package)",  sections: ['massage', 'facial'] },
    'hammam-1001':             { label: 'Hammam Thousand & One Night',      sections: ['steam-sauna', 'body'] },
    'hammam-foundation':       { label: 'Hammam Foundation Ceremony',       sections: ['steam-sauna', 'body'] },
    'easter-first-light':      { label: 'Easter — First Light',             sections: ['facial', 'massage'] },
    'easter-soft-reawakening': { label: 'Easter — The Soft Reawakening',    sections: ['massage'] },
    'easter-in-full-bloom':    { label: 'Easter — In Full Bloom',           sections: ['massage', 'facial'] },
    'easter-gentle-return':    { label: 'Easter — Gentle Return',           sections: ['steam-sauna', 'body', 'massage'] },
  },

  sectionOrder: ['facial', 'massage', 'waxing', 'brows-lashes', 'steam-sauna', 'body'],
};
