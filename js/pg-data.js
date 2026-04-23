// Seasonal Package Generator — Service Data
// Source: Niobe_Beauty_Services.xlsx + East Legon sales data Apr 2025 – Apr 2026
// Locations: EL = East Legon, C = Cantonments, C18 = Community 18, AHT = Alisa Hotel Tema, ARH = African Regent Hotel
//
// popularity: 1–5 derived from East Legon monthly booking volume
//   5 = 80–140+ bookings/month consistently
//   4 = 30–80 bookings/month
//   3 = 10–30 bookings/month
//   2 = <10 bookings/month
//   1 = rarely booked individually (niche / add-on service)

const PG_SERVICES = {
  "Facials": [
    { id: "F01", name: "Elemis Skin Booster Facial", price: 400, duration: 30, locations: ["EL","C","C18","AHT","ARH"], popularity: 4, note: "Go-to facial for packages — quick, versatile, works in any season" },
    { id: "F02", name: "CACI Eye Lift", price: 250, duration: 25, locations: ["EL"], popularity: 2 },
    { id: "F03", name: "CACI Jowl Lift", price: 360, duration: 30, locations: ["EL"], popularity: 2 },
    { id: "F04", name: "CACI Non-Surgical Face Lift", price: 500, duration: 60, locations: ["EL"], popularity: 2 },
    { id: "F05", name: "Elemis Anti-Blemish Mattify & Calm", price: 560, duration: 60, locations: ["EL","C","C18","AHT","ARH"], popularity: 2 },
    { id: "F06", name: "Elemis Biotec O2 Sensitive Skin Soother 75 Min", price: 600, duration: 75, locations: ["EL"], popularity: 1 },
    { id: "F07", name: "Elemis Biotec Anti-Pigment Brightener 75 Min", price: 600, duration: 75, locations: ["EL"], popularity: 1 },
    { id: "F08", name: "Elemis Biotec Control Facial", price: 600, duration: 75, locations: ["EL"], popularity: 1 },
    { id: "F09", name: "Elemis Biotec Express", price: 500, duration: 35, locations: ["EL"], popularity: 1 },
    { id: "F10", name: "Elemis Biotec Eye Treatment 30 Min", price: 250, duration: 30, locations: ["EL"], popularity: 1 },
    { id: "F11", name: "Elemis Biotec Firm-A-Lift 75 Min", price: 600, duration: 75, locations: ["EL"], popularity: 1 },
    { id: "F12", name: "Elemis Biotec L.E.D Blemish Control 75 Min", price: 600, duration: 75, locations: ["EL"], popularity: 1 },
    { id: "F13", name: "Elemis Biotec Line Eraser 75 Min", price: 600, duration: 75, locations: ["EL"], popularity: 1 },
    { id: "F14", name: "Elemis Biotec Radiance Renew 75 Min", price: 600, duration: 75, locations: ["EL"], popularity: 1 },
    { id: "F15", name: "Elemis Biotec Sonic Skin Resurfacer 75 Min", price: 700, duration: 75, locations: ["EL"], popularity: 1 },
    { id: "F16", name: "Elemis Biotec Super-Charge Facial For Men", price: 700, duration: 75, locations: ["EL","C","C18","AHT","ARH"], popularity: 2 },
    { id: "F17", name: "Elemis Biotec Triple-Tec Anti-Wrinkle Facial", price: 700, duration: 75, locations: ["EL","C","C18","AHT","ARH"], popularity: 2 },
    { id: "F18", name: "Elemis Dynamic Resurfacing Precision Peel 75 Min", price: 700, duration: 75, locations: ["EL","C","C18","AHT","ARH"], popularity: 2 },
    { id: "F19", name: "Elemis High Perf Skin Energiser For Men 60 Min", price: 560, duration: 60, locations: ["EL","C","C18","AHT","ARH"], popularity: 2 },
    { id: "F20", name: "Elemis Pro-Definition Lift & Contour Facial", price: 560, duration: 60, locations: ["EL","C","C18","AHT","ARH"], popularity: 2 },
    { id: "F21", name: "Elemis Sensitive Skin Soothing Facial", price: 560, duration: 60, locations: ["EL","C","C18","AHT","ARH"], popularity: 2 },
    { id: "F22", name: "Elemis Superfood Pro-Radiance Facial 60'", price: 560, duration: 60, locations: ["EL","C","C18","AHT","ARH"], popularity: 3, note: "Used in Easter and Christmas packages — glow/radiance positioning" },
    { id: "F23", name: "Elemis White Brightening Pigment Perfector", price: 560, duration: 60, locations: ["EL","C","C18","AHT","ARH"], popularity: 2 },
    { id: "F24", name: "Microdermabrasion", price: 760, duration: 80, locations: ["EL","C"], popularity: 2 },
    { id: "F25", name: "Million Dollar Super Facial", price: 1400, duration: 120, locations: ["EL","C","C18","AHT"], popularity: 2 },
    { id: "F26", name: "Mini Million Dollar Facial", price: 700, duration: 60, locations: ["EL","C","C18","AHT"], popularity: 2 },
    { id: "F27", name: "Murad Acne Complex Facial", price: 560, duration: 60, locations: ["EL","C","C18","AHT","ARH"], popularity: 2 },
    { id: "F28", name: "Murad AHA Rapid Exfoliator Anti-Aging Facial", price: 700, duration: 75, locations: ["EL","C","C18","AHT","ARH"], popularity: 2 },
    { id: "F29", name: "Murad Blemish Control Facial", price: 560, duration: 60, locations: ["EL","C","C18","ARH"], popularity: 2 },
    { id: "F30", name: "Murad Intensive Wrinkle Reducer Peel", price: 700, duration: 75, locations: ["EL","C","C18","AHT","ARH"], popularity: 2 },
    { id: "F31", name: "Murad IP5 Intensive Peel", price: 700, duration: 75, locations: ["EL","C","C18","AHT","ARH"], popularity: 2 },
    { id: "F32", name: "Murad Rapid Peel Age Reform", price: 700, duration: 60, locations: ["EL","C","C18","AHT","ARH"], popularity: 2 },
    { id: "F33", name: "Murad Redness Therapy Facial", price: 560, duration: 60, locations: ["EL","C","C18","AHT","ARH"], popularity: 2 },
    { id: "F34", name: "Murad Resurgence Renewal Facial", price: 560, duration: 60, locations: ["EL","C","C18","AHT","ARH"], popularity: 2 },
    { id: "F35", name: "Murad Sun Undone Vitamin C Infusion Facial", price: 560, duration: 60, locations: ["EL","C","C18","AHT","ARH"], popularity: 2 }
  ],
  "Body Massage": [
    { id: "M01", name: "Elemis Deeper Than Deep Hot Stone Massage 60'", price: 370, duration: 60, locations: ["EL","C","C18","AHT","ARH"], popularity: 5, note: "Top-booked service year-round, 100–136/month. Prime package anchor." },
    { id: "M02", name: "Elemis Deeper Than Deep Hot Stone Massage 90'", price: 480, duration: 90, locations: ["EL","C","C18","AHT","ARH"], popularity: 4, note: "Popular upsell from 60' version" },
    { id: "M03", name: "Elemis Freestyle Deep Tissue Massage 60'", price: 360, duration: 60, locations: ["EL","C","C18","AHT","ARH"], popularity: 5, note: "Consistently top 2, 100–134/month. Interchangeable anchor with Hot Stone." },
    { id: "M04", name: "Elemis Freestyle Deep Tissue Massage 90'", price: 460, duration: 90, locations: ["EL","C","C18","AHT","ARH"], popularity: 4 },
    { id: "M05", name: "Elemis Garden of England Rose Restore Massage 60'", price: 340, duration: 60, locations: ["EL","C","C18","AHT","ARH"], popularity: 5, note: "Third most-booked massage. Strong in Valentine's and Easter packages." },
    { id: "M06", name: "Elemis Garden of England Rose Restore Massage 90'", price: 440, duration: 90, locations: ["EL","C","C18","AHT","ARH"], popularity: 3 },
    { id: "M07", name: "Elemis Hot Mineral Body Boost Massage 60'", price: 340, duration: 60, locations: ["EL","C","C18","AHT","ARH"], popularity: 3, note: "Used in Valentine's, Mother's Day and Xmas packages" },
    { id: "M08", name: "Elemis Hot Mineral Body Boost Massage 90'", price: 440, duration: 90, locations: ["EL","C","C18","AHT","ARH"], popularity: 2 },
    { id: "M09", name: "Elemis Peaceful Pregnancy Massage 75'", price: 400, duration: 75, locations: ["EL","C","C18","AHT","ARH"], popularity: 2 },
    { id: "M10", name: "Foot Massage 30 Min", price: 140, duration: 30, locations: ["EL","C","C18","AHT","ARH"], popularity: 3, note: "Good affordable package add-on, used in Easter and Christmas" },
    { id: "M11", name: "Head Back & Neck Massage", price: 300, duration: 30, locations: ["EL","C","C18","AHT","ARH"], popularity: 4, note: "Strong individual booking (~28/month) and common package component" },
    { id: "M12", name: "Indian Head Massage", price: 220, duration: 30, locations: ["EL","C","C18","AHT","ARH"], popularity: 3, note: "Used in Mother's Day, Easter and Valentine's packages" },
    { id: "M13", name: "Reflexology 30 Min", price: 220, duration: 30, locations: ["EL","C","C18","AHT","ARH"], popularity: 3, note: "Used in Easter and Valentine's packages" },
    { id: "M14", name: "Reflexology 60 Min", price: 320, duration: 60, locations: ["EL","C","C18","AHT","ARH"], popularity: 2 }
  ],
  "Body Wrap & Scrub": [
    { id: "W01", name: "Body Nectar Nourish Wrap - Frangipani", price: 450, duration: 60, locations: ["EL","C","C18","AHT","ARH"], popularity: 2 },
    { id: "W02", name: "Body Sculpt Cellulite and Colon Therapy", price: 600, duration: 60, locations: ["EL","C","C18","AHT"], popularity: 1 },
    { id: "W03", name: "Cellutox Aroma Spa Ocean Wrap", price: 600, duration: 75, locations: ["EL","C","C18","AHT"], popularity: 1 },
    { id: "W04", name: "Exotic Coconut Rub & Milk Ritual Wrap", price: 500, duration: 60, locations: ["EL","C","C18","AHT"], popularity: 1 },
    { id: "W05", name: "Exotic Frangipani Body Nourish Wrap", price: 400, duration: 60, locations: ["EL","C","C18","AHT","ARH"], popularity: 2 },
    { id: "W06", name: "Intensely Cleansing Salt Scrub Lime & Ginger", price: 460, duration: 45, locations: ["EL","C","C18","AHT","ARH"], popularity: 3, note: "Consistently used in Easter, Christmas and Valentine's packages as a ritual step" },
    { id: "W07", name: "Musclease Aroma Spa Ocean Wrap", price: 600, duration: 75, locations: ["EL","C","C18","AHT"], popularity: 1 },
    { id: "W08", name: "Targeted Toning Tightener", price: 600, duration: 75, locations: ["EL","C","C18","AHT"], popularity: 1 },
    { id: "W09", name: "Thousand Flower Detox Wrap", price: 500, duration: 60, locations: ["EL","C","C18","AHT"], popularity: 1 },
    { id: "W10", name: "Universal Contour Wrap", price: 600, duration: 120, locations: ["EL","C","C18","AHT"], popularity: 1 }
  ],
  "Steam, Sauna & Jacuzzi": [
    { id: "S01", name: "Steam (With Add-On Service)", price: 200, duration: 20, locations: ["EL","C","C18","AHT"], limited: true, note: "Used as opener in Easter, Christmas and Valentine's packages" },
    { id: "S02", name: "Steam Alone", price: 250, duration: 20, locations: ["EL","C","C18","AHT"], limited: true },
    { id: "S03", name: "Sauna (With Add-On Service)", price: 200, duration: 20, locations: ["EL","C","C18","AHT"], limited: true },
    { id: "S04", name: "Sauna Alone", price: 250, duration: 20, locations: ["EL","C","C18","AHT"], limited: true },
    { id: "S05", name: "Jacuzzi (With Add-On Service)", price: 200, duration: 20, locations: ["EL","C"], limited: true },
    { id: "S06", name: "Jacuzzi Alone", price: 250, duration: 20, locations: ["EL","C"], limited: true }
  ],
  "Beauty": [
    { id: "B01", name: "Eyebrow Tinting", price: 100, duration: 20, locations: ["EL","C","C18","AHT","ARH"], popularity: 3 },
    { id: "B02", name: "Eyebrow Lamination", price: 300, duration: 45, locations: ["EL","C","C18","AHT"], popularity: 2 },
    { id: "B03", name: "Eyebrow Stain", price: 200, duration: 15, locations: ["EL","C","C18","ARH"], popularity: 2 },
    { id: "B04", name: "Eyelash and Eyebrow Tinting", price: 180, duration: 30, locations: ["EL","C","C18","AHT","ARH"], popularity: 3 },
    { id: "B05", name: "Eyelash Refill", price: 400, duration: 60, locations: ["EL","C","C18","AHT","ARH"], popularity: 2 },
    { id: "B06", name: "Eyelash Removal", price: 100, duration: 30, locations: ["EL","C","C18","AHT","ARH"], popularity: 2 },
    { id: "B07", name: "Eyelash Tinting", price: 100, duration: 20, locations: ["EL","C","C18","AHT","ARH"], popularity: 2 },
    { id: "B08", name: "Full Face Threading", price: 250, duration: 45, locations: ["EL","C","C18","AHT","ARH"], popularity: 2 },
    { id: "B09", name: "Individual Eyelash", price: 200, duration: 30, locations: ["EL","C","C18","AHT","ARH"], popularity: 2 },
    { id: "B10", name: "Semi Permanent Individual Eye Lash", price: 550, duration: 120, locations: ["EL","C18","ARH"], popularity: 2 }
  ],
  "Nails & Pedicure": [
    { id: "N01", name: "Acrylic Extensions (Full Set)", price: 200, duration: 60, locations: ["EL","C","C18","AHT","ARH"], popularity: 2 },
    { id: "N02", name: "Acrylic Refill", price: 150, duration: 60, locations: ["EL","C","C18","AHT","ARH"], popularity: 2 },
    { id: "N03", name: "Basic Manicure", price: 60, duration: 30, locations: ["EL","C","C18","AHT","ARH"], popularity: 2 },
    { id: "N04", name: "Basic Pedicure", price: 80, duration: 45, locations: ["EL","C","C18","AHT","ARH"], popularity: 2 },
    { id: "N05", name: "Classic Manicure", price: 80, duration: 30, locations: ["EL","C","C18","AHT","ARH"], popularity: 2 },
    { id: "N06", name: "Classic Pedicure", price: 100, duration: 45, locations: ["EL","C","C18","AHT","ARH"], popularity: 2 },
    { id: "N07", name: "File and Polish", price: 40, duration: 15, locations: ["EL","C","C18","AHT","ARH"], popularity: 2 },
    { id: "N08", name: "Gel Extensions (Full Set)", price: 280, duration: 90, locations: ["EL","C","C18","AHT","ARH"], popularity: 2 },
    { id: "N09", name: "Gel Extension Removal", price: 80, duration: 30, locations: ["EL","C","C18","AHT","ARH"], popularity: 2 },
    { id: "N10", name: "Gel Infill", price: 250, duration: 60, locations: ["EL","C","C18","AHT","ARH"], popularity: 2 },
    { id: "N11", name: "Gel Overlay", price: 250, duration: 60, locations: ["EL","C","C18","AHT","ARH"], popularity: 2 },
    { id: "N12", name: "Gel Polish", price: 130, duration: 45, locations: ["EL","C","C18","AHT","ARH"], popularity: 3 },
    { id: "N13", name: "Gel Polish Hands and Feet", price: 240, duration: 75, locations: ["EL","C","C18","AHT","ARH"], popularity: 3 },
    { id: "N14", name: "Gel Polish Removal", price: 80, duration: 30, locations: ["EL","C","C18","AHT","ARH"], popularity: 4, note: "~33/month bookings (Gel Polish Dissolve in data)" },
    { id: "N15", name: "Gel Polish Removal with Manicure", price: 120, duration: 45, locations: ["EL","C","C18","AHT","ARH"], popularity: 3 },
    { id: "N16", name: "Gel Polish with Manicure", price: 180, duration: 60, locations: ["EL","C","C18","AHT","ARH"], popularity: 3 },
    { id: "N17", name: "Gel Polish with Pedicure", price: 200, duration: 60, locations: ["EL","C","C18","AHT","ARH"], popularity: 3 },
    { id: "N18", name: "Hard Gel Extensions", price: 350, duration: 90, locations: ["EL","C","C18","AHT","ARH"], popularity: 2 },
    { id: "N19", name: "Henna Tattoo", price: 200, duration: 60, locations: ["EL","C","C18","AHT","ARH"], popularity: 1 },
    { id: "N20", name: "Manicure & Pedicure", price: 140, duration: 60, locations: ["EL","C","C18","AHT","ARH"], popularity: 3 },
    { id: "N21", name: "Mani & Pedi with Gel Polish", price: 290, duration: 90, locations: ["EL","C","C18","AHT","ARH"], popularity: 3 },
    { id: "N22", name: "Nail Art Per Nail", price: 20, duration: 5, locations: ["EL","C","C18","AHT","ARH"], popularity: 1 },
    { id: "N23", name: "Nail Art Per Set", price: 100, duration: 30, locations: ["EL","C","C18","AHT","ARH"], popularity: 1 },
    { id: "N24", name: "Nail Polish", price: 70, duration: 15, locations: ["EL","C","C18","AHT","ARH"], popularity: 2 },
    { id: "N25", name: "Nail Polish Hands and Feet", price: 130, duration: 30, locations: ["EL","C","C18","AHT","ARH"], popularity: 2 },
    { id: "N26", name: "Paraffin Wax Manicure", price: 140, duration: 45, locations: ["EL","C","C18","AHT","ARH"], popularity: 2 },
    { id: "N27", name: "Paraffin Wax Pedicure", price: 190, duration: 60, locations: ["EL","C","C18","AHT","ARH"], popularity: 2, note: "Used in Xmas 2024 packages" },
    { id: "N28", name: "Pedicure & Gel Polish", price: 230, duration: 60, locations: ["EL","C","C18","AHT","ARH"], popularity: 3 },
    { id: "N29", name: "Refill With Gel Polish", price: 250, duration: 60, locations: ["EL","C","C18","AHT","ARH"], popularity: 2 },
    { id: "N30", name: "Sculpture", price: 200, duration: 60, locations: ["EL","C","C18","ARH"], popularity: 1 },
    { id: "N31", name: "Sole Delight Foot Treatment", price: 120, duration: 40, locations: ["EL","C","C18","AHT","ARH"], popularity: 3, note: "Strong package component (Mother's Day, Easter, Xmas couples)" },
    { id: "N32", name: "Sole Delight Foot Treatment With Pedicure", price: 220, duration: 60, locations: ["EL","C","C18","AHT","ARH"], popularity: 3, note: "Used in Xmas 2024 Festive Harmony couples package" },
    { id: "N33", name: "Spa Manicure", price: 100, duration: 45, locations: ["EL","C","C18","AHT","ARH"], popularity: 4, note: "~28–32/month individual bookings" },
    { id: "N34", name: "Spa Manicure and Pedicure Combo", price: 220, duration: 75, locations: ["EL","C","C18","AHT","ARH"], popularity: 4, note: "~28/month. Used in Xmas Time For You, Easter Egg to Toe, Valentine's" },
    { id: "N35", name: "Spa Pedicure", price: 140, duration: 50, locations: ["EL","C","C18","AHT","ARH"], popularity: 5, note: "Consistently top 4 service, 65–112/month. Strong package add-on." },
    { id: "N36", name: "Sports Pedicure", price: 150, duration: 50, locations: ["EL","C","C18","AHT","ARH"], popularity: 3, note: "'Best Foot Forward' appeared in Dec data" }
  ],
  "Hair Removal": [
    { id: "H01", name: "Arm Wax", price: 110, duration: 30, locations: ["EL","C","C18","AHT","ARH"], popularity: 2 },
    { id: "H02", name: "Back Wax", price: 120, duration: 30, locations: ["EL","C","C18","AHT","ARH"], popularity: 2 },
    { id: "H03", name: "Belly Wax", price: 40, duration: 15, locations: ["EL","C","C18","AHT","ARH"], popularity: 2 },
    { id: "H04", name: "Bikini Wax", price: 190, duration: 15, locations: ["EL","C","C18","AHT","ARH"], popularity: 3 },
    { id: "H05", name: "Brazilian Wax", price: 300, duration: 30, locations: ["EL","C","C18","AHT","ARH"], popularity: 3 },
    { id: "H06", name: "Buttocks Wax", price: 120, duration: 20, locations: ["EL","C","C18","AHT","ARH"], popularity: 2 },
    { id: "H07", name: "Cheek Wax", price: 70, duration: 15, locations: ["EL","C","C18","AHT","ARH"], popularity: 3 },
    { id: "H08", name: "Chest Wax", price: 100, duration: 15, locations: ["EL","C","C18","AHT","ARH"], popularity: 2 },
    { id: "H09", name: "Chin Wax", price: 60, duration: 15, locations: ["EL","C","C18","AHT","ARH"], popularity: 4, note: "~37–47/month consistently" },
    { id: "H10", name: "Ear Wax", price: 50, duration: 15, locations: ["EL","C","C18","AHT","ARH"], popularity: 2 },
    { id: "H11", name: "Eyebrow Wax", price: 100, duration: 10, locations: ["EL","C","C18","AHT","ARH"], popularity: 4, note: "~31–53/month consistently" },
    { id: "H12", name: "Full Face Wax", price: 250, duration: 45, locations: ["EL","C","C18","AHT","ARH"], popularity: 3 },
    { id: "H13", name: "Half Leg Wax", price: 210, duration: 30, locations: ["EL","C","C18","AHT","ARH"], popularity: 3 },
    { id: "H14", name: "Hollywood Wax", price: 320, duration: 30, locations: ["EL","C","C18","AHT","ARH"], popularity: 4, note: "~37–72/month, consistently top 5 across all months" },
    { id: "H15", name: "Leg Wax", price: 260, duration: 30, locations: ["EL","C","C18","AHT","ARH"], popularity: 3 },
    { id: "H16", name: "Lip Wax", price: 45, duration: 10, locations: ["EL","C","C18","AHT","ARH"], popularity: 3 },
    { id: "H17", name: "Lower Back Wax", price: 80, duration: 20, locations: ["EL","C","C18","AHT","ARH"], popularity: 2 },
    { id: "H18", name: "Lower Lip Wax", price: 25, duration: 5, locations: ["EL","C","C18","AHT","ARH"], popularity: 2 },
    { id: "H19", name: "Underarm Wax", price: 120, duration: 15, locations: ["EL","C","C18","AHT","ARH"], popularity: 4, note: "~36–63/month consistently" },
    { id: "H20", name: "Upper Lip Wax", price: 40, duration: 10, locations: ["EL","C","C18","AHT","ARH"], popularity: 3 }
  ]
};

// ─── Existing standard packages — year-round catalogue ──────────────────────
// Used as duplication reference
const PG_STANDARD_PACKAGES = [
  { name: "A Treat, On Me", price: 400, duration: 60 },
  { name: "Elemis Couture Touch 60 Min Package", price: 580, duration: 60 },
  { name: "Elemis Couture Touch 120 Min Package", price: 800, duration: 120 },
  { name: "Elemis Couture Technology Biotec 60 Min Package", price: 650, duration: 60 },
  { name: "Elemis Couture Technology Biotec 120 Min Package", price: 1000, duration: 120 },
  { name: "Elemis Bliss Package", price: 1250, duration: 195 },
  { name: "Elemis Beautiful Bride Package", price: 820, duration: 145 },
  { name: "Elemis Body Detox Package", price: 700, duration: 135 },
  { name: "Elemis Deep Relax Package", price: 700, duration: 135 },
  { name: "Elemis Dream Package", price: 750, duration: 120 },
  { name: "Elemis Love Package (For 2)", price: 1000, duration: 120 },
  { name: "Elemis Love Package (Single)", price: 550, duration: 120 },
  { name: "Elemis Peaceful Pregnancy Package", price: 860, duration: 150 },
  { name: "Elemis Recharge Package", price: 800, duration: 135 },
  { name: "Elemis Renew Package", price: 800, duration: 150 },
  { name: "Good Times Package", price: 550, duration: 115 },
  { name: "Hammam Oriental Journey Package", price: 850, duration: 150 },
  { name: "Hammam Ritual Package", price: 700, duration: 90 },
  { name: "Hammam Royal Package", price: 850, duration: 90 },
  { name: "Hammam Thousand and One Night Package", price: 1000, duration: 100 },
  { name: "Hammam Turkish Bath Ceremony Package", price: 800, duration: 85 },
  { name: "Indulge Package", price: 700, duration: 165 },
  { name: "Niobe Spa Escape Journey", price: 1800, duration: 315 },
  { name: "Relax Package", price: 750, duration: 120 },
  { name: "Renew Spa Day Package", price: 700, duration: 115 },
  { name: "Serenity Package", price: 1500, duration: 285 },
  { name: "Spa Alone Treat Package", price: 950, duration: 160 },
  { name: "Spa Together", price: 2100, duration: 160 },
  { name: "The Ultimate Spa Escape", price: 1300, duration: 215 },
  { name: "Time Out Package", price: 510, duration: 115 },
  { name: "Total Time Out Spa Package", price: 700, duration: 120 },
  { name: "Tranquillity Package", price: 820, duration: 135 }
];

// ─── Past seasonal packages — used to avoid duplication ─────────────────────
// Source: SimpleSpa sales data + package description PDFs
const PG_PAST_PACKAGES = [

  // ── Christmas 2024 ──
  {
    campaign: "Christmas 2024", season: "christmas", year: 2024,
    name: "Christmas Holiday Rejuvenation",
    price: 600, duration: 90,
    services: ["Elemis Deeper Than Deep Hot Stone Massage 60'", "Elemis Skin Booster Facial (30 min)"],
    salesNote: "Good performer"
  },
  {
    campaign: "Christmas 2024", season: "christmas", year: 2024,
    name: "Festive Harmony Couples Package",
    price: 1200, duration: 165,
    services: ["2× Elemis Garden of England Rose Restore Massage 60'", "2× Steam (20 min)", "2× Sole Delight Foot Treatment With Pedicure"],
    salesNote: "Couples package"
  },
  {
    campaign: "Christmas 2024", season: "christmas", year: 2024,
    name: "Time For You Spa Day",
    price: 450, duration: 145,
    services: ["Head Back & Neck Massage (30 min)", "Spa Manicure and Pedicure Combo", "Foot Massage 30 Min"],
    salesNote: "Budget-friendly option"
  },
  {
    campaign: "Christmas 2024", season: "christmas", year: 2024,
    name: "New Year, New You",
    price: 1050, duration: 120,
    services: ["Sauna (20 min)", "Intensely Cleansing Salt Scrub Lime & Ginger", "Head Back & Neck Massage (30 min)", "Elemis Skin Booster Facial (30 min)"]
  },
  {
    campaign: "Christmas 2024", season: "christmas", year: 2024,
    name: "Truly Something Special",
    price: 650, duration: 135,
    services: ["Hammam Ritual Package", "Paraffin Wax Pedicure"]
  },
  {
    campaign: "Christmas 2024", season: "christmas", year: 2024,
    name: "Holiday Heels",
    price: 320, duration: 90,
    services: ["Footlogix Pedicure (60 min)", "Reflexology 30 Min"]
  },

  // ── Christmas 2025 ──
  {
    campaign: "Christmas 2025", season: "christmas", year: 2025,
    name: "The Merry Duo",
    price: 520, duration: 140,
    services: ["Elemis Freestyle Deep Tissue Massage 60'", "Spa Manicure and Pedicure Combo"],
    salesNote: "50 bookings in December, 36 bookings in January — strong performer"
  },
  {
    campaign: "Christmas 2025", season: "christmas", year: 2025,
    name: "Merry Me",
    price: 680, duration: 95,
    services: ["Elemis Skin Booster Facial (30 min)", "Head Back & Neck Massage (60 min)"],
    salesNote: "28 bookings Dec, 33 Jan — solid mid-range"
  },
  {
    campaign: "Christmas 2025", season: "christmas", year: 2025,
    name: "Tinsel Therapy",
    price: 750, duration: 100,
    services: ["Steam (20 min)", "Intensely Cleansing Salt Scrub Lime & Ginger", "Foot Massage 30 Min"]
  },
  {
    campaign: "Christmas 2025", season: "christmas", year: 2025,
    name: "Radiance Recharge",
    price: 800, duration: 125,
    services: ["Elemis Superfood Pro-Radiance Facial 60'", "Footlogix Pedicure", "Arm Massage + Foot Massage"]
  },

  // ── Valentine's Day 2025 ──
  {
    campaign: "Valentine's Day 2025", season: "valentines", year: 2025,
    name: "A Treat, On Me",
    price: 350, duration: 50,
    services: ["Foot Massage 30 Min", "Head Back & Neck Massage (30 min)"],
    salesNote: "Also exists as a standard year-round package (GHS 400). Seasonal version at GHS 350."
  },
  {
    campaign: "Valentine's Day 2025", season: "valentines", year: 2025,
    name: "Be My Valentine?",
    price: 500, duration: 75,
    services: ["Steam/Sauna (15 min)", "Elemis Garden of England Rose Restore Massage 60'"]
  },
  {
    campaign: "Valentine's Day 2025", season: "valentines", year: 2025,
    name: "Massaged with Love",
    price: 650, duration: 120,
    services: ["Indian Head Massage (30 min)", "Elemis Hot Mineral Body Boost Massage 60'", "Reflexology 30 Min"],
    salesNote: "Appeared as 'Slow Burn' in Feb sales data — 33 bookings"
  },
  {
    campaign: "Valentine's Day 2025", season: "valentines", year: 2025,
    name: "A Love-Filled Escape",
    price: 800, duration: 180,
    services: ["Elemis Skin Booster Facial (30 min)", "Elemis Deeper Than Deep Hot Stone Massage 60'", "Spa Manicure and Pedicure Combo"]
  },

  // ── Easter 2025 ──
  {
    campaign: "Easter 2025", season: "easter", year: 2025,
    name: "Awakened in April",
    price: 450, duration: 50,
    services: ["Elemis Skin Booster Facial (30 min)", "Foot Massage 20 Min"]
  },
  {
    campaign: "Easter 2025", season: "easter", year: 2025,
    name: "Egg to Toe",
    price: 550, duration: 135,
    services: ["Head Back & Neck Massage (30 min)", "Reflexology 30 Min", "Spa Manicure and Pedicure Combo"]
  },
  {
    campaign: "Easter 2025", season: "easter", year: 2025,
    name: "Elemis Easter",
    price: 700, duration: 90,
    services: ["Elemis Superfood Pro-Radiance Facial 60'", "Elemis Garden of England Rose Restore Massage 30 Min", "Garden of England Rose Hand Treatment"]
  },
  {
    campaign: "Easter 2025", season: "easter", year: 2025,
    name: "Born Again",
    price: 850, duration: 95,
    services: ["Steam (20 min)", "Intensely Cleansing Salt Scrub Lime & Ginger (45 min)", "Elemis Skin Booster Facial (30 min)"]
  },

  // ── Easter 2026 ──
  {
    campaign: "Easter 2026", season: "easter", year: 2026,
    name: "First Light",
    price: 620, duration: 65,
    services: ["Elemis Skin Booster Facial (30 min)", "Indian Head Massage", "Arm Massage"]
  },
  {
    campaign: "Easter 2026", season: "easter", year: 2026,
    name: "The Soft Reawakening",
    price: 700, duration: 130,
    services: ["Elemis Freestyle Deep Tissue Massage 60'", "Sole Delight Foot Treatment", "Garden of England Rose Hand Treatment with Manicure"]
  },
  {
    campaign: "Easter 2026", season: "easter", year: 2026,
    name: "Gentle Return",
    price: 750, duration: 120,
    services: ["Steam (20 min)", "Intensely Cleansing Salt Scrub Lime & Ginger (30 min)", "Elemis Hot Mineral Body Boost Massage 60'"]
  },
  {
    campaign: "Easter 2026", season: "easter", year: 2026,
    name: "In Full Bloom",
    price: 930, duration: 150,
    services: ["Elemis Garden of England Rose Restore Massage 60'", "Elemis Superfood Pro-Radiance Facial (30 min)", "Spa Pedicure + Foot Massage"]
  },

  // ── Mother's Day 2025 ──
  {
    campaign: "Mother's Day 2025", season: "mothers-day", year: 2025,
    name: "Peace of Mum",
    price: 450, duration: 140,
    services: ["Head Back & Neck Massage (60 min)", "Spa Manicure and Pedicure Combo"],
    salesNote: "33 bookings in May — strong performer"
  },
  {
    campaign: "Mother's Day 2025", season: "mothers-day", year: 2025,
    name: "Let Mum Glow",
    price: 500, duration: 120,
    services: ["Elemis Hot Mineral Body Boost Massage 60'", "Steam (20 min)"]
  },
  {
    campaign: "Mother's Day 2025", season: "mothers-day", year: 2025,
    name: "In Full Bloom",
    price: 850, duration: 125,
    services: ["Indian Head Massage (30 min)", "Garden of England Rose Body Treatment", "Elemis Skin Booster Facial (30 min)"]
  },
  {
    campaign: "Mother's Day 2025", season: "mothers-day", year: 2025,
    name: "Sole Purpose of Mum",
    price: 500, duration: 125,
    services: ["Sole Delight Foot Treatment With Pedicure", "Garden of England Rose Manicure", "Foot Massage 30 Min"]
  }
];

// ─── Season configurations ────────────────────────────────────────────────────
const PG_SEASONS = [
  {
    id: "harmattan",
    name: "Harmattan",
    months: "Nov – Feb",
    tone: "warming, restorative, protective",
    theme: "Shield and restore dry, wind-affected skin. Rich hydration, warmth and deep muscle work.",
    anchorServices: ["M01","M03","M07"],  // Hot Stone, Deep Tissue, Hot Mineral
    avoidRepeating: ["christmas"],
    salesInsight: "Hot Stone Massage is peak demand Nov–Jan. Avoid duplicating Christmas packages. Jan clears Christmas stock — don't repeat those combos.",
    palette: "#8B6914"
  },
  {
    id: "valentines",
    name: "Valentine's / Romance",
    months: "Jan – Feb",
    tone: "romantic, indulgent, sensory",
    theme: "Couples and solo rituals built around escape. Soft, sensory, unhurried experiences.",
    anchorServices: ["M05","M07","M01"],  // Rose Massage, Hot Mineral, Hot Stone
    avoidRepeating: ["valentines"],
    salesInsight: "Steam + Swedish/Rose combo sold well (Be My Valentine, 2025). Multi-massage packages (Massaged with Love) hit 33 bookings. Avoid close repeats of 2025 combos.",
    palette: "#9B3A4A"
  },
  {
    id: "easter",
    name: "Easter / Spring",
    months: "Mar – Apr",
    tone: "renewal, brightening, fresh start",
    theme: "Skin renewal after Harmattan dryness. Brightening facials, exfoliation, light body work.",
    anchorServices: ["F01","M03","M05"],  // Skin Booster, Deep Tissue, Rose Massage
    avoidRepeating: ["easter"],
    salesInsight: "2025: Skin Booster Facial appeared in 3 of 4 packages. 2026: shifted to more massage-led with facial as secondary. Scrub + massage combo (Gentle Return) and body+nails+massage (In Full Bloom) are proven structures. Avoid repeating 2026 combos directly.",
    palette: "#5A7A3A"
  },
  {
    id: "mothers-day",
    name: "Mother's Day",
    months: "May",
    tone: "nurturing, gentle, gifting",
    theme: "Quiet restoration. Packages that feel like a genuine gift — nails, relaxation, and gentleness.",
    anchorServices: ["M11","M07","F01"],  // HBN Massage, Hot Mineral, Skin Booster
    avoidRepeating: ["mothers-day"],
    salesInsight: "Peace of Mum (HBN + Mani/Pedi, GHS 450) was the clear bestseller at 33 bookings in May. Foot-focused packages (Sole Purpose) also resonate. Keep at least one low-price accessible option.",
    palette: "#7A5A8A"
  },
  {
    id: "summer",
    name: "Summer / Rainy Season",
    months: "Jun – Sep",
    tone: "refreshing, energising, detox",
    theme: "Combat humidity and heat. Cooling, cleansing and energising treatments.",
    anchorServices: ["M03","M05","W06"],  // Deep Tissue, Rose Massage, Lime & Ginger Scrub
    avoidRepeating: [],
    salesInsight: "Good Times and Time Out packages perform well (41–50 bookings). Bliss Package peaks Jun–Jul (44 bookings Jun). No specific seasonal packages have run in summer — this is the biggest opportunity.",
    palette: "#2F6B8A"
  },
  {
    id: "christmas",
    name: "Christmas / Festive",
    months: "Nov – Dec",
    tone: "luxurious, full-glam, gifting",
    theme: "End-of-year celebration. Full indulgence, polish, gift-worthy experiences.",
    anchorServices: ["M01","M03","N34"],  // Hot Stone, Deep Tissue, Mani/Pedi Combo
    avoidRepeating: ["christmas"],
    salesInsight: "Merry Duo (Deep Tissue + Mani/Pedi, GHS 520) was top Christmas package — 50 bookings Dec, 36 in Jan. Merry Me (Skin Booster + HBN, GHS 680) got 28 Dec. Christmas packages sell into January. Avoid close repeats of 2025 combos.",
    palette: "#6B2D2D"
  }
];

// ─── Package tiers ────────────────────────────────────────────────────────────
const PG_TIERS = [
  {
    id: "low",
    name: "Accessible",
    minPrice: 300,
    maxPrice: 650,
    targetDuration: 75,
    description: "Entry-level — 2 services, quick and high-perceived-value. Best sellers: foot massage + facial, HBN + pedicure."
  },
  {
    id: "mid",
    name: "Signature",
    minPrice: 650,
    maxPrice: 950,
    targetDuration: 130,
    description: "Core packages — 2–3 services with a 60-min massage anchor. The most-booked tier."
  },
  {
    id: "high",
    name: "Luxe",
    minPrice: 950,
    maxPrice: 1400,
    targetDuration: 180,
    description: "Premium — 3–5 services, full-body experience. Hot Stone or Deep Tissue anchor + facial + nail/body treatment."
  }
];

// ─── Constraints ─────────────────────────────────────────────────────────────
// Max 2 Steam/Sauna/Jacuzzi services across an entire campaign
const PG_LIMITED_MAX_PER_CAMPAIGN = 2;
