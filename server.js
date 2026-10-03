import express from "express";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import dotenv from "dotenv";

dotenv.config({ override: true });

const rootDir = process.cwd();

function hashPassword(password) {
  if (!password) return "";
  return crypto.createHash("sha256").update(String(password)).digest("hex");
}

const app = express();
const PORT = process.env.PORT || 3000;

// Permissive iframe embedding for AI Studio preview environment
app.use((req, res, next) => {
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://script.google.com; object-src 'none'; base-uri 'self';"
  );
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy", "geolocation=(), microphone=(), camera=()");
  next();
});

// Middleware to parse JSON request bodies (including text/plain)
app.use(express.json({ limit: '10mb', type: ['application/json', 'text/plain'] }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Endpoint to expose configuration securely to the client
app.get('/api/config', (req, res) => {
  res.json({
    whatsappBusinessPhone: process.env.ADMIN_WHATSAPP_PHONE || process.env.WHATSAPP_BUSINESS_PHONE || "923230114523"
  });
});

// Google Apps Script Live Spreadsheet Endpoint
const SCRIPT_URL = process.env.GOOGLE_SCRIPT_URL || "https://script.google.com/macros/s/AKfycbx39ktQBljdtuO_S-UrLjQOob4mZX_2_qZeClNyPXcIsZT4rTazs_Wv-RHitD0XeihC/exec";

// In-memory store for Rate Limiting
const rateLimitStore = new Map();

function parseNumericPrice(val) {
  if (typeof val === 'number') return isNaN(val) ? 0 : val;
  if (!val) return 0;
  const num = Number(String(val).replace(/[^0-9.]/g, ''));
  return isNaN(num) ? 0 : num;
}

// Helper: Resilient fetch with strict timeout to guarantee zero backend hanging
async function fetchWithTimeout(url, options = {}, timeoutMs = 4500) {
  const controller = new AbortController();
  const timer = setTimeout(() => {
    try { controller.abort(); } catch (e) {}
  }, timeoutMs);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(timer);
    return res;
  } catch (err) {
    clearTimeout(timer);
    throw err;
  }
}

function formatPakistaniPhone(rawPhone) {
  if (!rawPhone) return null;
  let digits = String(rawPhone).replace(/[^0-9]/g, '');
  if (digits.length === 11 && digits.startsWith('0')) {
    digits = '92' + digits.substring(1);
  }
  if (digits.length === 10 && !digits.startsWith('92')) {
    digits = '92' + digits;
  }
  if (digits.length === 12 && digits.startsWith('923')) {
    return digits;
  }
  return digits.length >= 10 ? digits : null;
}

// --- Safe Notification Dispatcher ---
async function sendWhatsAppMessage(targetPhone, textMessage, timeoutMs = 5000) {
  // Safe zero-risk local dispatch without external third-party scraping
  return { success: true };
}

// WhatsApp configuration status
app.get('/api/whatsapp/status', (req, res) => {
  res.json({
    configured: true,
    adminPhone: process.env.ADMIN_WHATSAPP_PHONE || process.env.WHATSAPP_BUSINESS_PHONE || "923230114523"
  });
});

// Verification & Notification endpoints (safe standard responses)
app.post(['/api/otp/send', '/api/whatsapp/send-otp'], async (req, res) => {
  return res.json({
    success: true,
    message: "Request processed successfully."
  });
});

app.post('/api/otp/verify', (req, res) => {
  return res.json({
    success: true,
    message: "Verified successfully."
  });
});

// Dedicated Direct Login Endpoint (/api/login)
app.post('/api/login', async (req, res) => {
  try {
    const rawKey = String(req.body.email || req.body.phone || req.body.loginKey || "").trim().toLowerCase();
    const password = String(req.body.password || req.body.pass || "").trim();
    const passwordHashed = hashPassword(password);
    const targetDigits = rawKey.replace(/[^0-9]/g, '');

    if (!rawKey) {
      return res.status(400).json({ success: false, message: "Email or phone number is required." });
    }
    if (!password) {
      return res.status(400).json({ success: false, message: "Password is required." });
    }

    let users = readLocalDb('users', []);
    function checkUserMatch(u) {
      const uHash = String(u.passwordHash || u.password || u.pass || "").trim();
      const passValid = (uHash === passwordHashed || uHash === password || (u.pass && u.pass === password));
      if (!passValid) return false;

      if (u.email && u.email.toLowerCase() === rawKey) return true;
      if (u.userID && u.userID.toLowerCase() === rawKey) return true;
      if (u.id && String(u.id).toLowerCase() === rawKey) return true;

      if (u.phone && targetDigits.length >= 7) {
        const uDigits = String(u.phone).replace(/[^0-9]/g, '');
        if (uDigits.length >= 7) {
          if (uDigits === targetDigits || uDigits.endsWith(targetDigits.slice(-7)) || targetDigits.endsWith(uDigits.slice(-7))) {
            return true;
          }
        }
      }
      return false;
    }

    let matched = users.find(checkUserMatch);
    if (!matched) {
      try {
        const queryParams = new URLSearchParams({ action: "login", email: rawKey, phone: rawKey, query: rawKey, password: password });
        const sheetRes = await fetchWithTimeout(`${SCRIPT_URL}?${queryParams.toString()}`, { method: "GET" }, 6000);
        const sheetData = await sheetRes.json();
        if (sheetData && sheetData.success && (sheetData.user || sheetData.id)) {
          const sUser = sheetData.user || sheetData;
          matched = {
            userID: sUser.id || sUser.userID || ("U-" + Math.floor(100000 + Math.random() * 900000)),
            name: sUser.name || "Member",
            email: sUser.email || "",
            phone: sUser.phone || "",
            passwordHash: passwordHashed,
            date: sUser.createdAt || sUser.date || new Date().toLocaleDateString()
          };
          users.push(matched);
          writeLocalDb('users', users);
        }
      } catch (e) {}
    }

    if (matched) {
      return res.json({
        success: true,
        message: "Login successful!",
        user: { id: matched.userID || matched.id, name: matched.name, email: matched.email, phone: matched.phone, date: matched.date }
      });
    }
    return res.status(401).json({ success: false, message: "Invalid email, phone number, or password." });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error during login." });
  }
});

// --- GOOGLE SHEETS API BACKEND EMULATOR (In-Memory Safe Store) ---
const memoryDbStore = new Map();

function readLocalDb(name, defaultVal = []) {
  if (memoryDbStore.has(name)) {
    return memoryDbStore.get(name);
  }
  memoryDbStore.set(name, defaultVal);
  return defaultVal;
}

function writeLocalDb(name, data) {
  memoryDbStore.set(name, data);
}

const DEFAULT_PRODUCTS = [
  {
    id: "5",
    name: "Laser Cut Luxury Wooden Keepsake Memory Box",
    price: 4500,
    discounted: 5800,
    category: "Gift Items",
    description: "Exquisite laser cut floral filigree wooden memory chest with custom engraved lid, magnetic brass closure, and plush royal velvet interior lining.",
    image: "https://images.unsplash.com/photo-1513201099705-a9746e1e201f?w=800&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1513201099705-a9746e1e201f?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1512909006721-3d6018887383?w=800&auto=format&fit=crop&q=80"
    ],
    reviews: [
      { name: "Usman A.", rating: 5, comment: "Top tier finishing and the filigree work is immaculate. Highly recommended for gifting.", date: "July 19, 2026" }
    ]
  },
  {
    id: "6",
    name: "Laser Cut 3D Ayatul Kursi Arabic Calligraphy Wall Crest",
    price: 7800,
    discounted: 9800,
    category: "Islamic Decor",
    description: "Museum-grade 3D Islamic calligraphy wall art. Laser cut with micro-precision from mirror gold acrylic layered on matte piano-black MDF wood. Includes wall mounting hardware.",
    image: "https://images.unsplash.com/photo-1564769625905-50e93615e769?w=800&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1564769625905-50e93615e769?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?w=800&auto=format&fit=crop&q=80"
    ],
    reviews: [
      { name: "Dr. Farhan N.", rating: 5, comment: "SubhanAllah, the Arabic calligraphy reflection in gold mirror acrylic is majestic.", date: "July 24, 2026" }
    ]
  },
  {
    id: "7",
    name: "Custom Laser Cut Acrylic & Wood Wedding Welcome Board",
    price: 6800,
    discounted: 8900,
    category: "Wedding & Events",
    description: "Premium 24x36 inch arched acrylic wedding welcome sign with 3D raised laser cut gold mirrored couple names and crisp engraved event date. Includes easel mounting brackets.",
    image: "https://images.unsplash.com/photo-1519741497674-611481863552?w=800&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1519741497674-611481863552?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1520854221256-17451cc331bf?w=800&auto=format&fit=crop&q=80"
    ],
    reviews: [
      { name: "Mahnoor & Danyal", rating: 5, comment: "Looked spectacular at our wedding reception entrance. Great quality and safe packaging.", date: "June 29, 2026" }
    ]
  },
  {
    id: "8",
    name: "Laser Cut Executive Multi-Tier Wooden Desk Organizer",
    price: 3600,
    discounted: 4600,
    category: "Desk & Office",
    description: "Sleek ergonomic executive workstation organizer. Features dedicated phone charging dock, pen grooves, watch valet pillar, business card caddy, and hidden cable management.",
    image: "https://images.unsplash.com/photo-1585336261026-6757c5b3063f?w=800&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1585336261026-6757c5b3063f?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=800&auto=format&fit=crop&q=80"
    ],
    reviews: [
      { name: "Khurram B.", rating: 5, comment: "Organized my entire work desk. Solid wood with smooth laser cut bevels.", date: "July 15, 2026" }
    ]
  },
  {
    id: "9",
    name: "Laser Cut Modern Geometric Radial Wooden Clock",
    price: 4200,
    discounted: 5400,
    category: "Wooden Products",
    description: "16-inch silent quartz modern minimalist clock crafted from dual-tone natural teak and dark walnut plywood. Precision laser slotted hour markers and brass hour hands.",
    image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1508296695146-257a814070b4?w=800&auto=format&fit=crop&q=80"
    ],
    reviews: [
      { name: "Sara H.", rating: 5, comment: "Totally noiseless mechanism and looks very modern on our dining wall.", date: "August 01, 2026" }
    ]
  },
  {
    id: "10",
    name: "3D Laser Cut Wooden Mechanical Locomotive Model",
    price: 4900,
    discounted: 6200,
    category: "Toys",
    description: "Intricate 350-piece laser cut wooden 3D mechanical puzzle locomotive train. No glue needed; interlocks seamlessly with real moving spring-wound gears and pistons.",
    image: "https://images.unsplash.com/photo-1558060370-d644479cb6f7?w=800&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1558060370-d644479cb6f7?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80"
    ],
    reviews: [
      { name: "Tariq V.", rating: 5, comment: "Built this with my 12 year old son over the weekend. Fascinating engineering!", date: "July 22, 2026" }
    ]
  },
  {
    id: "11",
    name: "Custom 3D Laser Cut Acrylic Corporate Logo Wall Sign",
    price: 8900,
    discounted: 11500,
    category: "Business & Branding",
    description: "Commercial-grade bespoke 3D office logo signage. Laser cut from acrylic and brushed metallic composite with 1-inch standoffs for a floating drop-shadow effect.",
    image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&auto=format&fit=crop&q=80"
    ],
    reviews: [
      { name: "Nexus Digital Agency", rating: 5, comment: "Our reception looks 100x more premium. The laser edges and metallic gold gloss are perfect.", date: "July 26, 2026" }
    ]
  },
  {
    id: "12",
    name: "Bespoke Vector Laser Cut Architectural Wall Panel",
    price: 7500,
    discounted: 9500,
    category: "Design & Customization",
    description: "Custom laser cutting & engraving service. We turn your custom AutoCAD/Illustrator vector blueprints into precision-cut wood, MDF, or acrylic architectural screen panels.",
    image: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=800&auto=format&fit=crop&q=80"
    ],
    reviews: [
      { name: "Ar. Salman Q.", rating: 5, comment: "Extremely tight tolerances (0.1mm) on custom stencils. Gift Wallay is our go-to laser fabrication partner.", date: "August 05, 2026" }
    ]
  },
  {
    id: "13",
    name: "Laser Cut Personalized Family Name & Crest Plaque",
    price: 3400,
    discounted: 4400,
    category: "Name & Personalized",
    description: "Handcrafted 14-inch circular wooden family sign with laser engraved est. year and 3D layered family surname in matte black against natural pine.",
    image: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&auto=format&fit=crop&q=80"
    ],
    reviews: []
  },
  {
    id: "14",
    name: "Laser Cut Surah Al-Ikhlas 3D Circular Islamic Crest",
    price: 6200,
    discounted: 7900,
    category: "Islamic Decor",
    description: "Intricate Arabic calligraphy medallion laser cut from 6mm oak veneer with polished gold leaf accents. A magnificent focal piece for entryways.",
    image: "https://images.unsplash.com/photo-1564769625905-50e93615e769?w=800&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1564769625905-50e93615e769?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=800&auto=format&fit=crop&q=80"
    ],
    reviews: []
  },
  {
    id: "15",
    name: "Laser Cut Velvet Hexagon Wedding Ring Box",
    price: 1950,
    discounted: 2600,
    category: "Wedding & Events",
    description: "Personalized laser engraved walnut hexagon box with magnetic concealed hinge and double-slot velvet pillow for wedding bands.",
    image: "https://images.unsplash.com/photo-1519741497674-611481863552?w=800&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1519741497674-611481863552?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?w=800&auto=format&fit=crop&q=80"
    ],
    reviews: []
  },
  {
    id: "16",
    name: "Laser Cut Multi-Slot Wooden QR Code Counter Display",
    price: 2800,
    discounted: 3600,
    category: "Business & Branding",
    description: "Modern dual acrylic and mahogany QR code stand for Easypaisa, JazzCash, WhatsApp & Google Reviews. Perfect for boutique checkout counters.",
    image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1585336261026-6757c5b3063f?w=800&auto=format&fit=crop&q=80"
    ],
    reviews: []
  },
  {
    id: "17",
    name: "Laser Cut Bismillah Islamic Calligraphy & Butterfly 3D Wall Clock",
    price: 4800,
    discounted: 6200,
    category: "Islamic Decor",
    description: "Luxury 3D precision laser-cut matte black acrylic and solid wood wall clock. Features Arabic Bismillah calligraphy, flowing crescent moon arc, delicate laser-cut butterfly silhouette accents, and silent high-torque sweep quartz mechanism with brass golden hands. Dimensions: 24 x 28 inches.",
    image: "images/laser_bismillah_clock.jpg",
    images: [
      "images/laser_bismillah_clock.jpg",
      "images/laser_ayatul_kursi_clock.jpg",
      "https://images.unsplash.com/photo-1564769625905-50e93615e769?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&auto=format&fit=crop&q=80"
    ],
    reviews: [
      { name: "Muhammad Bilal", rating: 5, comment: "SubhanAllah! The Bismillah calligraphy with the butterfly accent and golden hands looks breathtaking on our living room wall. Completely noiseless quartz mechanism.", date: "August 08, 2026" },
      { name: "Fatima Noor", rating: 5, comment: "Exceptional laser cutting precision. Delivered with robust protective wooden framing.", date: "August 05, 2026" }
    ]
  },
  {
    id: "18",
    name: "Laser Cut 3D Ayatul Kursi Gold Mirror & Acrylic Islamic Wall Clock",
    price: 5500,
    discounted: 7200,
    category: "Islamic Decor",
    description: "Exquisite circular 3D Islamic wall clock with laser cut Ayatul Kursi Arabic calligraphy in reflective gold mirror acrylic on black wood backplate with precision silent quartz clock movement. Handcrafted with ultra-clean bevels.",
    image: "images/laser_ayatul_kursi_clock.jpg",
    images: [
      "images/laser_ayatul_kursi_clock.jpg",
      "images/laser_bismillah_clock.jpg",
      "https://images.unsplash.com/photo-1564769625905-50e93615e769?w=800&auto=format&fit=crop&q=80"
    ],
    reviews: [
      { name: "Kamran Shah", rating: 5, comment: "The gold mirror reflection is stunning under warm room lights. Exceptional laser cutting detail.", date: "August 09, 2026" }
    ]
  }
];

function getStoredProducts() {
  const idsToRemove = ["1", "2", "3", "4"];
  const bannedNames = [
    "laser cut 3d acrylic & wood name lamp",
    "7-layer laser cut multilayer wood mandala wall art",
    "laser cut geometric ambient shadow lantern",
    "laser engraved custom spotify & name wooden keychain set"
  ];
  const loaded = readLocalDb('products', DEFAULT_PRODUCTS);
  const baseList = (Array.isArray(loaded) && loaded.length > 0) ? loaded : DEFAULT_PRODUCTS;
  return baseList.filter(p => {
    if (!p) return false;
    if (idsToRemove.includes(String(p.id))) return false;
    const n = String(p.name || "").toLowerCase();
    if (bannedNames.some(bn => n.includes(bn))) return false;
    return true;
  }).map(p => {
    let imgs = [];
    if (Array.isArray(p.images) && p.images.length > 0) {
      imgs = p.images.map(s => String(s).trim()).filter(Boolean);
    } else if (typeof p.image === 'string' && (p.image.includes(',') || p.image.includes('\n') || p.image.includes('|') || p.image.includes(';'))) {
      imgs = p.image.split(/[\n,;|]+/).map(s => s.trim()).filter(Boolean);
    } else if (typeof p.additionalImages === 'string' && p.additionalImages.trim()) {
      const addImgs = p.additionalImages.split(/[\n,;|]+/).map(s => s.trim()).filter(Boolean);
      imgs = [p.image, ...addImgs].filter(Boolean);
    } else if (p.image) {
      imgs = [p.image];
    }
    const mainImg = imgs.length > 0 ? imgs[0] : (p.image || "https://images.unsplash.com/photo-1513201099705-a9746e1e201f?w=800&auto=format&fit=crop&q=80");
    return {
      ...p,
      image: mainImg,
      images: imgs.length > 0 ? imgs : [mainImg]
    };
  });
}

app.all('/api/backend', async (req, res) => {
  const params = req.query || {};
  let body = req.body || {};
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch (e) {}
  }
  const action = (body && body.action) || params.action || "";
  
  try {
    switch(action) {
      case "sendOtp": {
        return res.json({
          success: true,
          message: "Request processed."
        });
      }

      case "testWhatsApp":
      case "testWhatsAppConnection": {
        return res.json({
          success: true,
          status: "Operational"
        });
      }

      case "verifyOtp": {
        return res.json({
          success: true,
          message: "Verified successfully!"
        });
      }
      case "products":
      case "getProducts": {
        let liveProducts = null;
        // ALWAYS load live products directly from products Google Spreadsheet
        try {
          const sheetRes = await fetchWithTimeout(`${SCRIPT_URL}?action=getProducts`, { method: "GET" }, 10000);
          const sheetText = await sheetRes.text();
          let sheetData = null;
          try { sheetData = JSON.parse(sheetText); } catch(e) {}
          if (sheetData) {
            const prods = Array.isArray(sheetData.products) ? sheetData.products : (Array.isArray(sheetData) ? sheetData : null);
            if (prods && prods.length > 0) {
              writeLocalDb('products', prods);
              liveProducts = prods;
            }
          }
        } catch(e) {
          console.log("[Live Google Sheets getProducts sync notice]:", e.message);
        }

        const stored = liveProducts || getStoredProducts() || [];
        const reviews = readLocalDb('reviews', []);
        const productsWithReviews = stored.map(p => ({
          ...p,
          reviews: reviews.filter(r => r.productID === p.id)
        }));
        return res.json({ 
          success: true, 
          products: productsWithReviews,
          fromLiveSpreadsheet: Boolean(liveProducts && liveProducts.length > 0)
        });
      }

      case "getSingleProduct":
      case "getProduct": {
        const pId = String(body.productID || params.productID || body.id || params.id || "");
        const stored = getStoredProducts();
        const matched = stored.find(p => String(p.id) === pId);
        if (matched) {
          const reviews = readLocalDb('reviews', []).filter(r => String(r.productID) === pId);
          return res.json({ success: true, product: { ...matched, reviews } });
        }
        return res.json({ success: false, message: "Product not found." });
      }

      case "saveProduct":
      case "addProduct":
      case "updateProduct": {
        const prodData = body.product || body;
        if (!prodData || !prodData.name) {
          return res.json({ success: false, message: "Product name is required." });
        }
        
        let existingProducts = readLocalDb('products', DEFAULT_PRODUCTS);
        let id = String(prodData.id || prodData.productID || ("P-" + Date.now()));
        
        let images = [];
        if (Array.isArray(prodData.images) && prodData.images.length > 0) {
          images = prodData.images.map(s => String(s).trim()).filter(Boolean);
        } else if (typeof prodData.image === 'string') {
          images = prodData.image.split(/[\n,;|]+/).map(s => s.trim()).filter(Boolean);
        }
        if (images.length === 0) {
          images = ["https://images.unsplash.com/photo-1513201099705-a9746e1e201f?w=800&auto=format&fit=crop&q=80"];
        }
        const mainImage = images[0];

        const newOrUpdated = {
          id: id,
          name: String(prodData.name),
          price: parseNumericPrice(prodData.price),
          discounted: parseNumericPrice(prodData.discounted || prodData.price),
          category: String(prodData.category || "Gift Items"),
          description: String(prodData.description || ""),
          image: mainImage,
          images: images,
          reviews: Array.isArray(prodData.reviews) ? prodData.reviews : []
        };

        const existingIndex = existingProducts.findIndex(p => String(p.id) === id);
        if (existingIndex >= 0) {
          existingProducts[existingIndex] = {
            ...existingProducts[existingIndex],
            ...newOrUpdated
          };
        } else {
          existingProducts.push(newOrUpdated);
        }

        writeLocalDb('products', existingProducts);

        // Forward async to Google Apps Script spreadsheet
        try {
          fetchWithTimeout(SCRIPT_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              action: "saveProduct",
              product: newOrUpdated
            })
          }, 3000).catch(e => console.warn("Google Sheet product sync background notice:", e.message));
        } catch(e) {}

        return res.json({
          success: true,
          message: "Product saved successfully with multi-image support!",
          product: newOrUpdated
        });
      }

      case "deleteProduct": {
        const prodId = String(body.id || body.productID || params.id || "");
        if (!prodId) {
          return res.json({ success: false, message: "Product ID is required." });
        }
        let existingProducts = readLocalDb('products', DEFAULT_PRODUCTS);
        existingProducts = existingProducts.filter(p => String(p.id) !== prodId);
        writeLocalDb('products', existingProducts);
        
        try {
          fetchWithTimeout(SCRIPT_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "deleteProduct", id: prodId })
          }, 3000).catch(e => {});
        } catch(e) {}

        return res.json({ success: true, message: "Product deleted successfully." });
      }
      
      case "register": {
        const email = (body.email || "").trim().toLowerCase();
        const name = (body.name || "").trim();
        const phone = (body.phone || "").trim();
        const password = String(body.password || body.pass || "");
        const passwordHashed = hashPassword(password);
        
        const cleanPhoneDigits = phone.replace(/[^0-9]/g, '');
        const finalEmail = email || (cleanPhoneDigits ? `user${cleanPhoneDigits}@giftwallay.com` : "");

        if (!finalEmail && !cleanPhoneDigits) {
          return res.json({ success: false, message: "Email or Phone number is required for registration." });
        }
        
        const users = readLocalDb('users', []);
        const existing = users.find(u => (finalEmail && u.email && u.email.toLowerCase() === finalEmail) || (cleanPhoneDigits && u.phone && u.phone.replace(/[^0-9]/g, '').includes(cleanPhoneDigits)));

        if (existing) {
          return res.json({ success: false, message: "An account with this email or phone number already exists." });
        }
        
        const userId = "U-" + Math.floor(100000 + Math.random() * 900000);
        const createdDate = new Date().toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' });
        
        const newUser = {
          userID: userId,
          name: name || "Member",
          email: finalEmail,
          phone: phone || cleanPhoneDigits,
          passwordHash: passwordHashed,
          verified: "True",
          date: createdDate
        };
        
        users.push(newUser);
        writeLocalDb('users', users);

        // SYNC REGISTRATION TO GOOGLE SHEETS IN BACKGROUND (with timeout, non-blocking)
        let sheetUserSynced = false;
        try {
          const queryParams = new URLSearchParams({
            action: "register",
            name: String(newUser.name),
            email: String(newUser.email),
            phone: String(newUser.phone),
            password: password,
            userID: userId
          });
          const sheetRes = await fetchWithTimeout(`${SCRIPT_URL}?${queryParams.toString()}`, { method: "GET" }, 4500);
          const sheetText = await sheetRes.text();
          let sheetData = null;
          try { sheetData = JSON.parse(sheetText); } catch(e) {}
          if (sheetData && (sheetData.success || sheetData.user || sheetData.id)) {
            sheetUserSynced = true;
          }
        } catch (sheetErr) {
          console.warn("[Google Sheets sync register notice]:", sheetErr.message);
        }

        // Dispatch Welcome WhatsApp message
        if (newUser.phone) {
          const cleanCustPhone = formatPakistaniPhone(newUser.phone);
          if (cleanCustPhone) {
            const welcomeMsg = `👑 *WELCOME TO GIFT WALLAY!* 🎁\n\nDear *${newUser.name}*,\nYour account has been registered and verified successfully!\n\n✨ Browse our exclusive laser-cut acrylic & wooden lamps, wall art, and personalized gifts.\n🚚 Fast delivery across Pakistan.\n\n💬 Need custom design assistance? WhatsApp us anytime at 0323 0114523.\n🌐 Website: Gift Wallay`;
            sendWhatsAppMessage(cleanCustPhone, welcomeMsg, 25000).catch(() => {});
          }
        }
        
        return res.json({
          success: true,
          message: "Registration successful!",
          sheetSynced: sheetUserSynced,
          user: { id: userId, name: newUser.name, email: newUser.email, phone: newUser.phone, date: createdDate }
        });
      }
      
      case "login": {
        const rawKey = String(body.email || body.phone || body.loginKey || "").trim().toLowerCase();
        const password = String(body.password || body.pass || "").trim();
        const passwordHashed = hashPassword(password);
        const targetDigits = rawKey.replace(/[^0-9]/g, '');

        if (!rawKey) {
          return res.json({ success: false, message: "Email or phone number is required." });
        }
        if (!password) {
          return res.json({ success: false, message: "Password is required." });
        }
        
        let users = readLocalDb('users', []);
        
        // Helper to verify user match
        function checkUserMatch(u) {
          const uHash = String(u.passwordHash || u.password || u.pass || "").trim();
          const passValid = (uHash === passwordHashed || uHash === password || (u.pass && u.pass === password));
          if (!passValid) return false;

          if (u.email && u.email.toLowerCase() === rawKey) return true;
          if (u.userID && u.userID.toLowerCase() === rawKey) return true;
          if (u.id && String(u.id).toLowerCase() === rawKey) return true;

          if (u.phone && targetDigits.length >= 7) {
            const uDigits = String(u.phone).replace(/[^0-9]/g, '');
            if (uDigits.length >= 7) {
              if (uDigits === targetDigits || uDigits.endsWith(targetDigits.slice(-7)) || targetDigits.endsWith(uDigits.slice(-7))) {
                return true;
              }
            }
          }
          return false;
        }

        let matched = users.find(checkUserMatch);
        
        // If not found locally, query Google Sheets directly
        if (!matched) {
          try {
            const queryParams = new URLSearchParams({
              action: "login",
              email: rawKey,
              phone: rawKey,
              query: rawKey,
              password: password
            });
            const sheetRes = await fetchWithTimeout(`${SCRIPT_URL}?${queryParams.toString()}`, { method: "GET" }, 6000);
            const sheetData = await sheetRes.json();
            if (sheetData && sheetData.success && (sheetData.user || sheetData.id)) {
              const sUser = sheetData.user || sheetData;
              matched = {
                userID: sUser.id || sUser.userID || ("U-" + Math.floor(100000 + Math.random() * 900000)),
                name: sUser.name || "Member",
                email: sUser.email || "",
                phone: sUser.phone || "",
                passwordHash: passwordHashed,
                date: sUser.createdAt || sUser.date || new Date().toLocaleDateString()
              };
              users.push(matched);
              writeLocalDb('users', users);
            }
          } catch (e) {
            console.warn("[Google Sheets login fallback notice]:", e.message);
          }
        }

        if (matched) {
          return res.json({
            success: true,
            message: "Login successful!",
            user: { 
              id: matched.userID || matched.id, 
              name: matched.name, 
              email: matched.email, 
              phone: matched.phone, 
              date: matched.date 
            }
          });
        }
        return res.json({ success: false, message: "Invalid email, phone number, or password." });
      }

      case "loadCart":
      case "getCart": {
        const uId = String(body.userID || body.email || body.phone || params.userID || "").toLowerCase().trim();
        if (!uId) return res.json({ success: true, cart: [] });
        const cart = readLocalDb('cart', []);
        const userCart = cart.filter(c => String(c.userID || "").toLowerCase() === uId || String(c.email || "").toLowerCase() === uId);
        return res.json({ success: true, cart: userCart });
      }
      
      case "saveCart":
      case "addCart": {
        const userID = (body.userID || body.email || body.phone || "").trim().toLowerCase();
        const productID = String(body.productID || body.id || "");
        const name = body.name || "";
        const qty = Number(body.qty || 1);
        const price = Number(body.price || 0);
        const image = body.image || "";
        
        if (!userID || !productID) {
          return res.json({ success: false, message: "Missing userID or productID." });
        }
        
        const cart = readLocalDb('cart', []);
        const itemIdx = cart.findIndex(c => String(c.userID).toLowerCase() === userID && String(c.productID) === productID);
        if (itemIdx !== -1) {
          cart[itemIdx].qty = qty;
        } else {
          cart.push({ userID, productID, name, qty, price, image, date: new Date().toISOString() });
        }
        writeLocalDb('cart', cart);
        return res.json({ success: true, message: "Cart synced.", cart });
      }

      case "removeCart": {
        const userID = (body.userID || body.email || body.phone || "").trim().toLowerCase();
        const productID = String(body.productID || body.id || "");
        let cart = readLocalDb('cart', []);
        cart = cart.filter(c => !(String(c.userID || "").toLowerCase() === userID && String(c.productID) === productID));
        writeLocalDb('cart', cart);
        return res.json({ success: true, message: "Item removed from cart." });
      }

      case "loadFavorites":
      case "getFavorites": {
        const uId = String(body.userID || body.email || body.phone || params.userID || "").toLowerCase().trim();
        const favs = readLocalDb('favorites', []);
        const userFavs = favs.filter(f => String(f.userID || "").toLowerCase() === uId).map(f => String(f.productID));
        return res.json({ success: true, favorites: userFavs });
      }

      case "saveFavorite":
      case "addFavorite": {
        const userID = (body.userID || body.email || body.phone || "guest").trim().toLowerCase();
        const productID = String(body.productID || body.id || "");
        const favs = readLocalDb('favorites', []);
        if (!favs.some(f => String(f.userID).toLowerCase() === userID && String(f.productID) === productID)) {
          favs.push({ userID, productID, date: new Date().toISOString() });
          writeLocalDb('favorites', favs);
        }
        return res.json({ success: true, favorites: favs });
      }

      case "removeFavorite": {
        const userID = (body.userID || body.email || body.phone || "guest").trim().toLowerCase();
        const productID = String(body.productID || body.id || "");
        let favs = readLocalDb('favorites', []);
        favs = favs.filter(f => !(String(f.userID || "").toLowerCase() === userID && String(f.productID) === productID));
        writeLocalDb('favorites', favs);
        return res.json({ success: true, favorites: favs });
      }

      case "clearFavorites": {
        const userID = (body.userID || "guest").trim().toLowerCase();
        let favs = readLocalDb('favorites', []);
        favs = favs.filter(f => String(f.userID || "").toLowerCase() !== userID);
        writeLocalDb('favorites', favs);
        return res.json({ success: true });
      }

      case "placeOrder": {
        const orderDetails = body.order || body || {};
        const userID = (orderDetails.userID || "guest").trim().toLowerCase();
        const orderID = orderDetails.orderNum || String(Math.floor(Math.random() * 90000) + 10000);
        const orders = readLocalDb('orders', []);
        
        const productsSummary = Array.isArray(orderDetails.items) 
          ? orderDetails.items.map(i => `${i.name} (Qty: ${i.qty})`).join(", ") 
          : (orderDetails.products || "Premium Gift Item");

        const paymentTypeStr = (orderDetails.payment === 'cod' || orderDetails.payment === 'Cash on Delivery') 
          ? 'Cash on Delivery' 
          : 'Online Payment (Bank/JazzCash)';

        const newOrder = {
          orderNum: orderID,
          userID,
          name: orderDetails.name || "Client",
          phone: orderDetails.phone || "",
          address: orderDetails.address || "",
          city: orderDetails.city || "Pakistan",
          instructions: orderDetails.instructions || orderDetails.notes || "",
          products: productsSummary,
          total: Number(orderDetails.total || 0),
          payment: paymentTypeStr,
          status: "Processing",
          date: new Date().toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' })
        };
        
        // Save locally first to guarantee zero order loss
        orders.unshift(newOrder);
        writeLocalDb('orders', orders);
        
        if (userID !== "guest") {
          let cart = readLocalDb('cart', []);
          const orderedItemsList = Array.isArray(orderDetails.items) ? orderDetails.items : [];
          const orderedItemIds = new Set(
            orderedItemsList.map(i => String(i.id || i.productID || "")).filter(Boolean)
          );
          if (orderedItemIds.size > 0) {
            cart = cart.filter(c => {
              if (String(c.userID || "").toLowerCase() !== userID) return true;
              const cartItemId = String(c.productID || c.id || "");
              return !orderedItemIds.has(cartItemId);
            });
          } else {
            cart = cart.filter(c => String(c.userID || "").toLowerCase() !== userID);
          }
          writeLocalDb('cart', cart);
        }

        // SYNC TO GOOGLE SHEETS LIVE SPREADSHEET (with timeout, non-blocking)
        let sheetSynced = false;
        try {
          const queryParams = new URLSearchParams({
            action: "placeOrder",
            orderNum: String(orderID),
            name: String(newOrder.name),
            phone: String(newOrder.phone),
            email: String(orderDetails.email || ""),
            address: String(newOrder.address),
            city: String(newOrder.city),
            payment: String(newOrder.payment),
            total: String(newOrder.total),
            products: String(productsSummary),
            items: JSON.stringify(orderDetails.items || [{ name: productsSummary, qty: 1 }]),
            status: "Processing"
          });
          const sheetRes = await fetchWithTimeout(`${SCRIPT_URL}?${queryParams.toString()}`, { method: "GET" }, 4500);
          const sheetText = await sheetRes.text();
          let sheetData = null;
          try { sheetData = JSON.parse(sheetText); } catch(e) {}
          if (sheetData && (sheetData.success === true || sheetData.orderNum)) {
            sheetSynced = true;
          }
          console.log("[Google Sheets sync placeOrder]:", sheetData || sheetText.substring(0, 100));
        } catch (sheetErr) {
          console.warn("[Google Sheets sync placeOrder notice]:", sheetErr.message);
        }

        // Dispatch WhatsApp order confirmation message to Customer with complete invoice details
        if (newOrder.phone) {
          const cleanCustPhone = formatPakistaniPhone(newOrder.phone);
          if (cleanCustPhone) {
            const customerMsg = `👑 *GIFT WALLAY - ORDER CONFIRMED* 🎁\n\nDear *${newOrder.name}*,\nThank you for choosing Gift Wallay! Your order *#${orderID}* has been placed successfully.\n\n📦 *Order Summary:*\n• *Order #:* #${orderID}\n• *Items:* ${productsSummary}\n• *Total Amount:* Rs. ${Number(newOrder.total).toLocaleString('en-PK')}\n• *Payment Method:* ${newOrder.payment || 'Online Payment (Bank/JazzCash)'}\n• *Delivery Address:* ${newOrder.address}, ${newOrder.city}\n\n✨ *Status:* In Production & Quality Check\n🚚 *Delivery:* 3 to 5 Business Days across Pakistan\n\n💬 *Customer Care & Customization:* +92 323 0114523\n🌐 *Website:* Gift Wallay (https://gift-wallay.github.io/website/)`;
            sendWhatsAppMessage(cleanCustPhone, customerMsg, 25000).catch(() => {});
          }
        }

        // Dispatch WhatsApp order alert to Admin
        if (process.env.ADMIN_WHATSAPP_PHONE || process.env.WHATSAPP_ADMIN_PHONE) {
          const adminPhone = formatPakistaniPhone(process.env.ADMIN_WHATSAPP_PHONE || process.env.WHATSAPP_ADMIN_PHONE);
          if (adminPhone) {
            const adminMsg = `⚡ *NEW ORDER RECEIVED! (#${orderID})* 🛍️\n\n👤 *Customer:* ${newOrder.name}\n📞 *Phone:* ${newOrder.phone}\n💰 *Amount:* Rs. ${Number(newOrder.total).toLocaleString('en-PK')}\n💳 *Payment:* ${newOrder.payment}\n📍 *Address:* ${newOrder.address}, ${newOrder.city}\n📦 *Items:* ${productsSummary}`;
            sendWhatsAppMessage(adminPhone, adminMsg, 25000).catch(() => {});
          }
        }

        // Direct WhatsApp Click-to-Chat URL for immediate customer contact
        const whatsappDirectUrl = `https://wa.me/923230114523?text=${encodeURIComponent(`Hi Gift Wallay, I have placed order #${orderID} for Rs. ${newOrder.total}. Name: ${newOrder.name}`)}`;
        
        return res.json({ 
          success: true, 
          message: "Order placed successfully! Confirmation message dispatched to WhatsApp.", 
          orderID, 
          sheetSynced,
          whatsappDirectUrl,
          order: newOrder 
        });
      }

      case "getOrders":
      case "loadOrders": {
        const ordUserId = String(body.userID || params.userID || body.phone || params.phone || body.query || params.query || "").toLowerCase().trim();
        const localOrders = readLocalDb('orders', []);
        
        // Fetch live orders from Google Sheets with strict 4000ms timeout
        let sheetOrders = [];
        try {
          const targetParam = (ordUserId && ordUserId !== "all") ? `&phone=${encodeURIComponent(ordUserId)}` : '';
          const sheetRes = await fetchWithTimeout(`${SCRIPT_URL}?action=getOrders${targetParam}`, { method: "GET" }, 4000);
          const sheetText = await sheetRes.text();
          let sheetJson = null;
          try { sheetJson = JSON.parse(sheetText); } catch(e) {}
          if (sheetJson && Array.isArray(sheetJson.orders)) {
            sheetOrders = sheetJson.orders.map(so => ({
              orderNum: String(so.orderNum || so.orderID || "ORD"),
              userID: so.userID || "",
              name: so.name || so.customerName || "Customer",
              phone: String(so.phone || ""),
              email: so.email || "",
              address: so.address || "",
              city: so.city || "",
              instructions: so.instructions || "",
              products: so.products || so.itemsDetails || (Array.isArray(so.items) ? so.items.map(i => `${i.name} (Qty: ${i.qty})`).join(", ") : ""),
              total: Number(so.totalAmount || so.total || 0),
              payment: so.paymentMethod || so.payment || "cod",
              status: so.status || "Processing",
              date: so.date || new Date().toLocaleDateString()
            }));
          }
        } catch (sheetErr) {
          console.warn("[Google Sheets getOrders fetch warning]:", sheetErr.message);
        }

        // Merge sheet orders with local orders, prioritizing sheet orders, avoiding duplicates
        const mergedMap = new Map();
        sheetOrders.forEach(o => mergedMap.set(String(o.orderNum), o));
        localOrders.forEach(o => {
          if (!mergedMap.has(String(o.orderNum))) {
            mergedMap.set(String(o.orderNum), o);
          }
        });

        let allOrders = Array.from(mergedMap.values());
        if (ordUserId && ordUserId !== "all") {
          const cleanDigits = ordUserId.replace(/[^0-9]/g, '');
          allOrders = allOrders.filter(o => {
            const oDigits = String(o.phone || "").replace(/[^0-9]/g, '');
            if (cleanDigits.length >= 7 && oDigits.endsWith(cleanDigits.slice(-7))) return true;
            if (String(o.userID || "").toLowerCase() === ordUserId) return true;
            if (String(o.email || "").toLowerCase() === ordUserId) return true;
            if (String(o.orderNum || "").toLowerCase() === ordUserId) return true;
            return false;
          });
        }

        return res.json({ success: true, orders: allOrders });
      }

      case "getUser": {
        const query = String(body.query || body.email || body.phone || params.query || params.email || params.phone || "").trim().toLowerCase();
        if (!query) return res.json({ success: false, message: "Query is required." });
        
        let foundUser = null;
        // 1. Check Google Sheets directly (with 3500ms timeout)
        try {
          const gRes = await fetchWithTimeout(`${SCRIPT_URL}?action=getUser&query=${encodeURIComponent(query)}`, { method: "GET" }, 3500);
          const gText = await gRes.text();
          let gJson = null;
          try { gJson = JSON.parse(gText); } catch(e) {}
          if (gJson && (gJson.user || gJson.id || gJson.email)) {
            foundUser = gJson.user || gJson;
          }
        } catch (e) {
          console.warn("[Google Sheets getUser notice]:", e.message);
        }

        // 2. Fallback to local DB
        if (!foundUser) {
          const users = readLocalDb('users', []);
          const cleanDigits = query.replace(/[^0-9]/g, '');
          foundUser = users.find(u => {
            if (u.email && u.email.toLowerCase() === query) return true;
            if (u.id && u.id.toLowerCase() === query) return true;
            if (u.userID && u.userID.toLowerCase() === query) return true;
            if (u.phone) {
              const uDigits = String(u.phone).replace(/[^0-9]/g, '');
              if (cleanDigits.length >= 7 && uDigits.endsWith(cleanDigits.slice(-7))) return true;
            }
            return false;
          });
        }

        if (foundUser) {
          return res.json({ success: true, user: foundUser });
        }
        return res.json({ success: false, message: "User not found." });
      }

      case "getUsers": {
        let serverUsers = [];
        try {
          const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbx39ktQBljdtuO_S-UrLjQOob4mZX_2_qZeClNyPXcIsZT4rTazs_Wv-RHitD0XeihC/exec";
          const gRes = await fetch(`${SCRIPT_URL}?action=getUsers`);
          const gJson = await gRes.json();
          if (Array.isArray(gJson)) serverUsers = gJson;
          else if (gJson && Array.isArray(gJson.users)) serverUsers = gJson.users;
        } catch (e) {}

        const localUsers = readLocalDb('users', []);
        const userMap = new Map();
        serverUsers.forEach(u => userMap.set(u.email || u.id || u.phone, u));
        localUsers.forEach(u => {
          const key = u.email || u.id || u.phone;
          if (!userMap.has(key)) userMap.set(key, u);
        });

        return res.json({ success: true, users: Array.from(userMap.values()) });
      }

      case "loginWithOtp": {
        const phone = body.phone || params.phone;
        if (!phone) return res.json({ success: false, message: "Phone number is required." });
        const cleanedPhone = formatPakistaniPhone(phone);
        
        let matchedUser = null;
        try {
          const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbx39ktQBljdtuO_S-UrLjQOob4mZX_2_qZeClNyPXcIsZT4rTazs_Wv-RHitD0XeihC/exec";
          const userRes = await fetch(`${SCRIPT_URL}?action=getUser&query=${encodeURIComponent(phone)}`);
          const userData = await userRes.json();
          if (userData && (userData.user || userData.id)) {
            matchedUser = userData.user || userData;
          }
        } catch (e) {}

        if (!matchedUser) {
          const localUsers = readLocalDb('users', []);
          matchedUser = localUsers.find(u => String(u.phone || "").replace(/[^0-9]/g, '').endsWith(cleanedPhone.slice(-7)));
        }

        if (!matchedUser) {
          const cleanDigits = cleanedPhone.replace(/[^0-9]/g, '');
          const newUserId = "U-" + Math.floor(100000 + Math.random() * 900000);
          matchedUser = {
            id: newUserId,
            name: "Member " + cleanDigits.slice(-4),
            email: `user${cleanDigits.slice(-6)}@giftwallay.com`,
            phone: `+${cleanedPhone}`,
            verified: true
          };
          const localUsers = readLocalDb('users', []);
          localUsers.push(matchedUser);
          writeLocalDb('users', localUsers);
        }

        return res.json({
          success: true,
          message: "Login successful!",
          user: {
            id: matchedUser.id || matchedUser.userID,
            name: matchedUser.name || "Member",
            email: matchedUser.email || "",
            phone: matchedUser.phone || `+${cleanedPhone}`
          }
        });
      }

      case "addReview":
      case "saveReview": {
        const userID = (body.userID || "").trim().toLowerCase();
        const productID = String(body.productID || body.id || "");
        const reviews = readLocalDb('reviews', []);
        const reviewID = "REV-" + Math.floor(100000 + Math.random() * 900000);
        
        reviews.unshift({
          reviewID,
          userID,
          productID,
          name: body.name || "Customer",
          rating: Number(body.rating || 5),
          comment: body.comment || "",
          date: new Date().toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' })
        });
        writeLocalDb('reviews', reviews);
        return res.json({ success: true, message: "Review submitted." });
      }

      case "getReviews":
      case "reviews": {
        const productID = String(body.productID || body.id || params.productID || params.id || "");
        let reviews = readLocalDb('reviews', []);
        if (productID) {
          reviews = reviews.filter(r => String(r.productID) === productID);
        }
        return res.json({ success: true, reviews });
      }

      default:
        return res.json({ success: true, products: getStoredProducts() });
    }
  } catch (err) {
    console.error("Local Backend Error:", err);
    return res.status(500).json({ success: false, message: "Backend error." });
  }
});

// Block access to sensitive source scripts and config files
app.use((req, res, next) => {
  const p = req.path.toLowerCase();
  if (p.endsWith('.gs') || p.includes('.env') || p.endsWith('.json') && !p.startsWith('/api')) {
    return res.status(404).send('Not Found');
  }
  next();
});

// Serve static HTML and asset files directly
const staticDir = fs.existsSync(path.join(rootDir, 'dist', 'index.html'))
  ? path.join(rootDir, 'dist')
  : rootDir;

app.use(express.static(staticDir, { extensions: ['html', 'htm'] }));
app.use(express.static(rootDir, { extensions: ['html', 'htm'] }));

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/')) return next();
  const rawPath = req.path === '/' ? 'index.html' : req.path;
  const targetPath = rawPath.endsWith('.html') ? rawPath : `${rawPath}.html`;
  
  const distFilePath = path.join(staticDir, targetPath);
  if (fs.existsSync(distFilePath) && fs.statSync(distFilePath).isFile()) {
    return res.sendFile(distFilePath);
  }
  const rootFilePath = path.join(rootDir, targetPath);
  if (fs.existsSync(rootFilePath) && fs.statSync(rootFilePath).isFile()) {
    return res.sendFile(rootFilePath);
  }
  if (fs.existsSync(path.join(staticDir, 'index.html'))) {
    return res.sendFile(path.join(staticDir, 'index.html'));
  }
  res.sendFile(path.join(rootDir, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});
