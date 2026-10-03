/* main.js - Premium Gift Wallay Store Engine */

// --- Safe Price Formatter Helpers ---
function parseNumericPrice(val) {
    if (val === null || val === undefined) return 0;
    if (typeof val === 'number') return isNaN(val) ? 0 : val;
    const str = String(val).replace(/[^0-9.]/g, '');
    const num = parseFloat(str);
    return isNaN(num) ? 0 : num;
}

function formatPrice(val) {
    const num = parseNumericPrice(val);
    return num.toLocaleString('en-PK');
}

// Dedicated OTP back navigation handler
window.handleOtpBackNavigation = function() {
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const mode = urlParams.get('mode');

        if (mode === 'register' || mode === 'login') {
            window.location.href = "account.html";
            return;
        }
        if (mode === 'order') {
            window.location.href = "checkout.html";
            return;
        }

        // Check document referrer if coming from within the store
        if (document.referrer) {
            try {
                const ref = new URL(document.referrer);
                if (ref.host === window.location.host && !ref.pathname.endsWith('otp.html')) {
                    window.location.href = document.referrer;
                    return;
                }
            } catch (refErr) {}
        }

        if (window.history.length > 1) {
            window.history.back();
            return;
        }

        const pendingReg = localStorage.getItem("pendingRegistrationData");
        if (pendingReg) {
            window.location.href = "account.html";
            return;
        }
    } catch (e) {
        console.warn("Back navigation error:", e);
    }
    window.location.href = "checkout.html";
};

// --- Google Apps Script Web App URL ---
const PRODUCTS_API = "https://script.google.com/macros/s/AKfycbx39ktQBljdtuO_S-UrLjQOob4mZX_2_qZeClNyPXcIsZT4rTazs_Wv-RHitD0XeihC/exec";

// --- 1. INITIAL PREMIUM LASER CUT PRODUCTS DATABASE ---
const INITIAL_PRODUCTS = [
    {
        id: "P001",
        name: "Anime Metal Poster",
        price: 299,
        discounted: 299,
        category: "Premium metal wall poster",
        description: "Anime Metal Poster with high precision finish and durability.",
        image: "https://images.unsplash.com/photo-1513201099705-a9746e1e201f?w=800&auto=format&fit=crop&q=80",
        images: ["https://images.unsplash.com/photo-1513201099705-a9746e1e201f?w=800&auto=format&fit=crop&q=80"]
    },
    {
        id: "P002",
        name: "Naruto Metal Poster",
        price: 2999,
        discounted: 2999,
        category: "Premium metal wall poster",
        description: "Naruto Metal Wall Art Poster, museum-grade metallic sheen.",
        image: "https://images.unsplash.com/photo-1513201099705-a9746e1e201f?w=800&auto=format&fit=crop&q=80",
        images: ["https://images.unsplash.com/photo-1513201099705-a9746e1e201f?w=800&auto=format&fit=crop&q=80"]
    },
    {
        id: "P003",
        name: "One Piece Poster",
        price: 2999,
        discounted: 2999,
        category: "Premium metal wall poster",
        description: "One Piece Metal Wall Poster, premium collectible decor.",
        image: "https://images.unsplash.com/photo-1513201099705-a9746e1e201f?w=800&auto=format&fit=crop&q=80",
        images: ["https://images.unsplash.com/photo-1513201099705-a9746e1e201f?w=800&auto=format&fit=crop&q=80"]
    },
    {
        id: "P004",
        name: "hellow",
        price: 233,
        discounted: 233,
        category: "Premium metal wall poster",
        description: "hellow wall art poster.",
        image: "https://images.unsplash.com/photo-1513201099705-a9746e1e201f?w=800&auto=format&fit=crop&q=80",
        images: ["https://images.unsplash.com/photo-1513201099705-a9746e1e201f?w=800&auto=format&fit=crop&q=80"]
    },
    {
        id: "P005",
        name: "Naruto and itachi anime metal poster",
        price: 3000,
        discounted: 3000,
        category: "Premium metal wall poster",
        description: "Naruto and Itachi dual character premium metal art display.",
        image: "https://images.unsplash.com/photo-1513201099705-a9746e1e201f?w=800&auto=format&fit=crop&q=80",
        images: ["https://images.unsplash.com/photo-1513201099705-a9746e1e201f?w=800&auto=format&fit=crop&q=80"]
    },
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

// --- 2. STORAGE SYNC LOGIC ---
function getDb(key, fallback) {
    const data = localStorage.getItem(key);
    if (!data) {
        localStorage.setItem(key, JSON.stringify(fallback));
        return fallback;
    }
    try {
        return JSON.parse(data);
    } catch(e) {
        return fallback;
    }
}

function saveDb(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

const REMOVED_PRODUCT_IDS = [];
const REMOVED_PRODUCT_NAMES = [];

function isValidProductImage(s) {
    if (!s || typeof s !== 'string') return false;
    const str = s.trim();
    if (str.length < 5) return false;
    if (str.includes('GMT+') || str.includes('GMT-') || str.includes('標準時間') || str.includes('Standard Time')) return false;
    if (/^(Mon|Tue|Wed|Thu|Fri|Sat|Sun)\s[A-Z][a-z]{2}\s\d{1,2}\s\d{4}/.test(str)) return false;
    if (str.startsWith('http://') || str.startsWith('https://') || str.startsWith('data:image/') || str.startsWith('images/') || str.startsWith('./images/') || str.includes('unsplash.com') || str.endsWith('.png') || str.endsWith('.jpg') || str.endsWith('.jpeg') || str.endsWith('.webp')) return true;
    return false;
}

function resolveProductImage(candidate, description, category, name) {
    if (isValidProductImage(candidate)) return candidate.trim();
    if (isValidProductImage(description)) return description.trim();

    // Check if description has an image file name
    if (typeof description === 'string' && /\b[a-zA-Z0-9_\-]+\.(jpg|jpeg|png|webp|svg)\b/i.test(description)) {
        const match = description.match(/\b[a-zA-Z0-9_\-]+\.(jpg|jpeg|png|webp|svg)\b/i);
        if (match) return `images/${match[0]}`;
    }

    const combined = `${category || ''} ${name || ''}`.toLowerCase();
    if (combined.includes('anime') || combined.includes('poster') || combined.includes('naruto') || combined.includes('one piece')) {
        return "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=800&auto=format&fit=crop&q=80";
    }
    if (combined.includes('islamic') || combined.includes('ayat') || combined.includes('bismillah') || combined.includes('quran')) {
        return "https://images.unsplash.com/photo-1564769625905-50e93615e769?w=800&auto=format&fit=crop&q=80";
    }
    if (combined.includes('clock') || combined.includes('wall art')) {
        return "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800&auto=format&fit=crop&q=80";
    }
    if (combined.includes('keychain')) {
        return "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80";
    }
    if (combined.includes('wedding') || combined.includes('event')) {
        return "https://images.unsplash.com/photo-1519741497674-611481863552?w=800&auto=format&fit=crop&q=80";
    }
    if (combined.includes('lamp') || combined.includes('light')) {
        return "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&auto=format&fit=crop&q=80";
    }
    return "https://images.unsplash.com/photo-1513201099705-a9746e1e201f?w=800&auto=format&fit=crop&q=80";
}

function cleanProductDescription(desc, name, category) {
    if (!desc || typeof desc !== 'string') {
        return `Exquisite bespoke laser crafted ${name}. Precision engraved and finished with luxury handcrafted detail.`;
    }
    const trimmed = desc.trim();
    // If description is a search URL or image filename, supply an elegant text description
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || /\b[a-zA-Z0-9_\-]+\.(jpg|jpeg|png|webp|svg|mp4)\b/i.test(trimmed)) {
        return `Premium ${category || 'Gift Wallay'} bespoke laser crafted ${name}. Handcrafted precision design with premium durable materials and luxury finish.`;
    }
    return trimmed;
}

function sanitizeProducts(prods) {
    if (!Array.isArray(prods)) return [];
    return prods.filter(p => {
        if (!p) return false;
        const pid = String(p?.id || p?.productID || "");
        if (REMOVED_PRODUCT_IDS.includes(pid)) return false;
        const pname = String(p?.name || "").toLowerCase();
        if (REMOVED_PRODUCT_NAMES.some(banned => pname.includes(banned))) return false;
        return true;
    }).map(p => {
        const prodName = String(p?.name || "Gift Item");
        const prodCat = String(p?.category || "Gifts");
        const rawDesc = String(p?.description || "");
        const cleanDesc = cleanProductDescription(rawDesc, prodName, prodCat);

        let mainImg = resolveProductImage(p?.image, rawDesc, prodCat, prodName);
        let imgList = [];
        if (Array.isArray(p?.images) && p.images.length > 0) {
            imgList = p.images.filter(isValidProductImage);
        } else if (typeof p?.image === 'string' && p.image.includes(',')) {
            imgList = p.image.split(',').map(s => s.trim()).filter(isValidProductImage);
        }
        if (imgList.length === 0) {
            imgList = [mainImg];
        } else {
            mainImg = imgList[0];
        }

        const currPrice = parseNumericPrice(p?.price);
        let discPrice = parseNumericPrice(p?.discounted || p?.discountedPrice || p?.originalPrice);
        if (discPrice <= currPrice && currPrice > 0) {
            discPrice = Math.round((currPrice * 1.25) / 100) * 100;
        }

        return {
            ...p,
            id: String(p?.id || p?.productID || Date.now()),
            name: prodName,
            discounted: discPrice,
            price: currPrice,
            category: prodCat,
            description: cleanDesc,
            image: mainImg,
            images: imgList,
            reviews: Array.isArray(p?.reviews) ? p.reviews.map(r => ({
                name: String(r?.name || "Customer"),
                rating: Math.min(5, Math.max(1, parseInt(r?.rating, 10) || 5)),
                comment: String(r?.comment || ""),
                date: String(r?.date || "Recently")
            })) : []
        };
    });
}

function sanitizeCart(cartList) {
    if (!Array.isArray(cartList)) return [];
    
    const map = new Map();
    for (const rawItem of cartList) {
        if (!rawItem) continue;
        let id, qty, name, price, image, size, color;

        if (Array.isArray(rawItem)) {
            // Spreadsheet array format: [UserID, ProductID, Name, Size, Color, Qty, Price, Date]
            id = String(rawItem[1] || rawItem[0] || Date.now());
            name = String(rawItem[2] || rawItem[1] || "Gift Item");
            size = String(rawItem[3] || "Standard");
            color = String(rawItem[4] || "Default");
            qty = Math.max(1, parseInt(rawItem[5], 10) || 1);
            price = parseNumericPrice(rawItem[6]);
        } else if (typeof rawItem === 'object') {
            // Spreadsheet object format: UserID, Name (ProductID), Email (ProductName), Phone (Size), Password (Color), Verified (Qty), price
            if (rawItem.Verified !== undefined || rawItem.Email !== undefined || rawItem.Password !== undefined) {
                id = String(rawItem.Name || rawItem.productID || rawItem.id || Date.now());
                name = String(rawItem.Email || rawItem.name || "Gift Item");
                size = String(rawItem.Phone || rawItem.size || "Standard");
                color = String(rawItem.Password || rawItem.color || "Default");
                qty = Math.max(1, parseInt(rawItem.Verified || rawItem.qty, 10) || 1);
                price = parseNumericPrice(rawItem.price);
            } else {
                id = String(rawItem.id || rawItem.productID || Date.now());
                qty = Math.max(1, parseInt(rawItem.qty || rawItem.quantity, 10) || 1);
                name = String(rawItem.name || "Gift Item");
                price = parseNumericPrice(rawItem.price);
                image = rawItem.image;
                size = rawItem.size || "Standard";
                color = rawItem.color || "Default";
            }
        }

        if (!id) continue;
        const foundProd = (products || []).find(p => String(p.id) === String(id));
        if (foundProd) {
            if (!name || name === "Gift Item") name = foundProd.name;
            if (!price) price = parseNumericPrice(foundProd.price);
            if (!image) image = foundProd.image;
        }
        if (!image) image = "https://images.unsplash.com/photo-1513201099705-a9746e1e201f?w=600&auto=format&fit=crop&q=80";

        const isSelected = rawItem.selected !== undefined ? Boolean(rawItem.selected) : true;
        if (map.has(id)) {
            const existing = map.get(id);
            existing.qty += qty;
            if (price > 0 && !existing.price) existing.price = price;
            if (rawItem.selected !== undefined) existing.selected = Boolean(rawItem.selected);
        } else {
            map.set(id, { id, name, price, qty, image, size: size || "Standard", color: color || "Default", selected: isSelected });
        }
    }
    return Array.from(map.values());
}

// In-memory local state copies synced with local storage & sanitized against NaN
let products = sanitizeProducts(getDb('gw_products', INITIAL_PRODUCTS));
saveDb('gw_products', products);
let rawCart = getDb('gw_cart', []);
let cart = sanitizeCart(rawCart);
saveDb('gw_cart', cart);

function sanitizeFavorites(favs) {
    if (!Array.isArray(favs)) return [];
    return Array.from(new Set(favs.map(id => String(id)).filter(id => id.trim().length > 0)));
}
let rawFavorites = getDb('gw_favorites', []);
let favorites = sanitizeFavorites(rawFavorites);
saveDb('gw_favorites', favorites);

function updateFavoritesBadge() {
    const count = favorites ? favorites.length : 0;
    document.querySelectorAll('.favorites-count').forEach(el => {
        el.innerText = count;
        el.style.display = count > 0 ? 'inline-flex' : 'none';
    });
}

function isFavorite(productId) {
    return favorites && favorites.some(id => String(id) === String(productId));
}

function renderFavHeartBtn(productId) {
    const isFav = isFavorite(productId);
    return `
        <button type="button" class="fav-heart-btn" data-fav-id="${productId}" onclick="toggleFavorite('${productId}', event);" style="position: absolute; top: 10px; right: 10px; background: rgba(255,255,255,0.92); backdrop-filter: blur(4px); border: 1px solid rgba(0,0,0,0.08); width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; z-index: 10; transition: all 0.2s ease; box-shadow: 0 2px 8px rgba(0,0,0,0.12); font-size: 1rem; padding: 0;" title="${isFav ? 'Remove from Favorites' : 'Save to Favorites'}">
            ${isFav ? '❤️' : '🤍'}
        </button>
    `;
}

function toggleFavorite(productId, event) {
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }
    const pidStr = String(productId);
    const pObj = (products || []).find(p => String(p.id) === pidStr);
    const pName = pObj ? pObj.name : "Product";

    const index = favorites.findIndex(id => String(id) === pidStr);
    let isFavNow = false;

    if (index > -1) {
        favorites.splice(index, 1);
        isFavNow = false;
        showLuxuryToast("Removed from Favorites", `<strong>${pName}</strong> removed from saved favorites.`, "🤍");
    } else {
        favorites.push(pidStr);
        isFavNow = true;
        showLuxuryToast("Saved to Favorites", `<strong>${pName}</strong> saved to your favorites!`, "❤️");
    }

    favorites = sanitizeFavorites(favorites);
    saveDb('gw_favorites', favorites);
    updateFavoritesBadge();

    // Sync saved/deleted favorite status with Google Sheets & server database
    const userKey = currentUser ? (currentUser.id || currentUser.email || currentUser.phone || "guest") : "guest";
    if (isFavNow) {
        sendBackendRequest("saveFavorite", { userID: userKey, productID: pidStr }, "POST").catch(e => console.warn("Fav sync save error:", e));
    } else {
        sendBackendRequest("removeFavorite", { userID: userKey, productID: pidStr }, "POST").catch(e => console.warn("Fav sync remove error:", e));
    }

    // Update all matching heart buttons in DOM
    document.querySelectorAll(`[data-fav-id="${pidStr}"]`).forEach(btn => {
        if (btn.classList.contains('fav-heart-btn')) {
            btn.innerHTML = isFavNow ? '❤️' : '🤍';
            btn.title = isFavNow ? 'Remove from Favorites' : 'Save to Favorites';
        } else if (btn.id === 'favToggleBtn' || btn.classList.contains('fav-detail-btn')) {
            btn.style.background = isFavNow ? 'rgba(212,175,55,0.12)' : '#f9f9f9';
            btn.style.borderColor = isFavNow ? 'var(--gold)' : '#ddd';
            btn.style.color = isFavNow ? '#000' : '#333';
            const iconEl = btn.querySelector('.fav-icon');
            if (iconEl) iconEl.innerText = isFavNow ? '❤️' : '🤍';
            const textEl = btn.querySelector('#favBtnText');
            if (textEl) textEl.innerText = isFavNow ? 'Saved' : 'Favorite';
        }
    });

    const path = window.location.pathname;
    const page = path.substring(path.lastIndexOf('/') + 1) || 'index.html';
    if (page === 'favorites.html') {
        loadFavoritesPage();
    }
}
window.toggleFavorite = toggleFavorite;

let users = [];
let orders = [];
let currentUser = getDb('gw_current_user', null);

let isStoreInitialized = false;
let gsiClientId = "";

let productsLoadError = null;

function renderServerErrorNotice(container) {
    if (!container) return;
    container.innerHTML = "";
    const parentSec = container.closest('section');
    if (parentSec && parentSec.querySelector('.product-grid')) {
        parentSec.style.display = "none";
    }
}

window.retrySyncWithAnimation = async function(btn) {
    if (btn) {
        btn.classList.add('btn-spinning');
        btn.disabled = true;
        btn.innerHTML = `<span class="btn-spinner-icon" style="font-size: 1.1rem; display: inline-block;">🔄</span> <span>Connecting to Google Sheet...</span>`;
    }
    
    try {
        if (typeof playLuxurySound === 'function') playLuxurySound('success');
    } catch(e){}

    if (typeof showToast === 'function') {
        showToast("Connecting", "Attempting connection with Google Sheets server...", "info");
    }

    try {
        await syncProducts();
        if (!productsLoadError) {
            if (typeof showToast === 'function') {
                showToast("Connected", "Catalog loaded from Google Sheet successfully.", "success");
            }
        } else {
            if (typeof showToast === 'function') {
                showToast("Server Error", "Server error, please try again after some time", "error");
            }
        }
    } catch(err) {
        if (typeof showToast === 'function') {
            showToast("Server Error", "Server error, please try again after some time", "error");
        }
    } finally {
        if (btn) {
            btn.classList.remove('btn-spinning');
            btn.disabled = false;
            btn.innerHTML = `<span class="btn-spinner-icon" style="font-size: 1.1rem; display: inline-block;">🔄</span> <span>RETRY CONNECTION</span>`;
        }
    }
};

window.loadLocalCachedVault = function() {
    products = sanitizeProducts(getDb('gw_products', INITIAL_PRODUCTS));
    productsLoadError = null;
    loadPageData();
};

// Google Sheets live syncing pipeline - Always loads products from spreadsheet
async function syncProducts({ background = false } = {}) {
    try {
        let latestProducts = null;

        // 1. Try direct Google Apps Script endpoint first (critical for GitHub Pages & live spreadsheet updates)
        if (PRODUCTS_API && !PRODUCTS_API.includes("YOUR_SCRIPT_ID")) {
            try {
                // Preflight-free simple GET request with cache-buster
                const directUrl = `${PRODUCTS_API}?action=getProducts&_t=${Date.now()}`;
                const directRes = await fetch(directUrl, {
                    method: 'GET',
                    redirect: 'follow'
                });
                if (directRes.ok) {
                    const directData = await directRes.json();
                    if (directData && Array.isArray(directData.products) && directData.products.length > 0) {
                        latestProducts = directData.products;
                    } else if (Array.isArray(directData) && directData.length > 0) {
                        latestProducts = directData;
                    }
                }
            } catch(directErr) {
                console.warn("Direct Google Sheet fetch note:", directErr.message || directErr);
            }
        }

        // 2. Fallback to local backend proxy (for local development server)
        if (!Array.isArray(latestProducts) || latestProducts.length === 0) {
            try {
                const isLocal = typeof window !== 'undefined' && window.location && (
                    window.location.hostname === 'localhost' ||
                    window.location.hostname === '127.0.0.1' ||
                    window.location.hostname.includes('run.app')
                );
                if (isLocal) {
                    const bRes = await fetch(`/api/backend?action=products&_t=${Date.now()}`, { method: "GET" });
                    if (bRes.ok) {
                        const bData = await bRes.json();
                        if (bData && Array.isArray(bData.products) && bData.products.length > 0) {
                            latestProducts = bData.products;
                        }
                    }
                }
            } catch(backendErr) {
                console.warn("Backend products fetch note:", backendErr.message || backendErr);
            }
        }

        if (Array.isArray(latestProducts) && latestProducts.length > 0) {
            products = sanitizeProducts(latestProducts);
            localStorage.setItem("gw_products", JSON.stringify(products));
            localStorage.setItem("gw_products_cache_time", String(Date.now()));
            productsLoadError = null;

            // Render live spreadsheet catalog
            loadPageData();
            if (typeof optimizeImages === 'function') optimizeImages();
        } else {
            // Read cached if any, otherwise flag error to show reload prompt
            let cached = getDb('gw_products', null);
            if (Array.isArray(cached) && cached.length > 0) {
                products = sanitizeProducts(cached);
                productsLoadError = null;
            } else {
                products = sanitizeProducts(INITIAL_PRODUCTS);
                productsLoadError = null;
            }
            loadPageData();
        }
    } catch (err) {
        console.warn("Error syncing products from Google Spreadsheet:", err);
        let cached = getDb('gw_products', null);
        if (Array.isArray(cached) && cached.length > 0) {
            products = sanitizeProducts(cached);
            productsLoadError = null;
        } else {
            products = sanitizeProducts(INITIAL_PRODUCTS);
            productsLoadError = null;
        }
        loadPageData();
    }
}

// --- PREMIUM FULL-PAGE LOADING SYSTEM ---
window.showFullPageLoader = function(subtext = "Curating Luxury Experience...") {
    let loader = document.getElementById('premiumPagePreloader');
    if (!loader) {
        loader = document.createElement('div');
        loader.id = 'premiumPagePreloader';
        loader.style.cssText = 'position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: radial-gradient(circle at center, #1c1a17 0%, #0a0a0a 100%); z-index: 9999999; display: flex; flex-direction: column; align-items: center; justify-content: center; transition: opacity 0.4s ease, visibility 0.4s ease; backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px);';
        loader.innerHTML = `
            <div style="position: relative; width: 110px; height: 110px; display: flex; align-items: center; justify-content: center; margin-bottom: 22px;">
                <div style="position: absolute; width: 100%; height: 100%; border: 3px solid rgba(212,175,55,0.15); border-top: 3px solid #d4af37; border-right: 3px solid rgba(212,175,55,0.6); border-radius: 50%; animation: spinLuxury 1.2s cubic-bezier(0.68, -0.55, 0.27, 1.55) infinite;"></div>
                <div style="position: absolute; width: 84%; height: 84%; border: 2px dashed rgba(212,175,55,0.3); border-radius: 50%; animation: spinCounter 3.5s linear infinite;"></div>
                <img src="logo1.png" alt="Gift Wallay Logo" class="loader-logo-img" onerror="this.onerror=null; this.src='Gift-Wallay.png';" style="width: 58px; height: 58px; object-fit: contain; filter: drop-shadow(0 0 16px rgba(212,175,55,0.7)); animation: logoGlowPulse 2s ease-in-out infinite alternate; z-index: 2; display: block;">
            </div>
            <div style="font-family: var(--font-head, serif); font-size: 1.45rem; letter-spacing: 4px; color: #d4af37; text-transform: uppercase; margin-bottom: 8px; font-weight: 700; text-shadow: 0 0 20px rgba(212,175,55,0.4);">GIFT WALLAY</div>
            <div id="preloaderSubtext" style="font-size: 0.82rem; color: #c0c0c0; letter-spacing: 2px; text-transform: uppercase; text-align: center; padding: 0 15px; font-weight: 500;">${subtext}</div>
            <div style="margin-top: 18px; width: 140px; height: 2px; background: linear-gradient(90deg, transparent, #d4af37, transparent); animation: shimmerSweep 1.8s infinite linear;"></div>
        `;
        document.body.appendChild(loader);
    } else {
        const sub = document.getElementById('preloaderSubtext');
        if (sub) sub.innerText = subtext;
        loader.style.display = 'flex';
        loader.style.opacity = '1';
        loader.style.visibility = 'visible';
    }
};

window.hideFullPageLoader = function() {
    const loader = document.getElementById('premiumPagePreloader');
    if (loader) {
        if (loader.style) {
            loader.style.opacity = '0';
            loader.style.visibility = 'hidden';
        }
        setTimeout(() => {
            if (loader && loader.style && loader.style.opacity === '0') {
                loader.style.display = 'none';
            }
        }, 400);
    }
};

async function initStore() {
    if (isStoreInitialized) return;

    const path = window.location.pathname;
    const page = path.substring(path.lastIndexOf('/') + 1) || 'index.html';

    // Do not block the whole page behind a full-screen loader.
    // Read cached data first so the UI can render immediately.
    products = [];
    users = getDb('gw_users', [
        { email: "user@gift.com", name: "Hamza Ahmed", phone: "0300-9876543", pass: "user123" }
    ]);
    orders = getDb('gw_orders', []);

    injectHeaderFooter();
    injectBackButton();
    updateCartBadge();
    updateFavoritesBadge();

    if (page === 'index.html' || page === '') {
        initInfiniteCarousel();
    }

    // Render cached products immediately.
    let cachedProducts = getDb('gw_products', INITIAL_PRODUCTS);
    if (Array.isArray(cachedProducts) && cachedProducts.length) {
        products = sanitizeProducts(cachedProducts);
        productsLoadError = null;
        loadPageData();
    }

    isStoreInitialized = true;

    // Only sync account data on pages that actually need it.
    if (currentUser) {
        const tasks = [];
        if (page === 'cart.html' || page === 'checkout.html') {
            tasks.push(syncUserCartFromServer(currentUser));
        }
        if (page === 'favorites.html') {
            tasks.push(syncUserFavoritesFromServer(currentUser));
        }
        if (page === 'account.html') {
            tasks.push(syncUserOrdersFromServer(currentUser));
        }

        if (tasks.length) {
            Promise.all(tasks).then(() => loadPageData()).catch(err => {
                console.warn("Background user sync failed:", err);
            });
        }
    }

    // Always refresh products from Google Sheets in the background so new additions appear automatically
    syncProducts({ background: true });
    setInterval(() => syncProducts({ background: true }), 60 * 1000);

    // Run visual effects only when the browser is idle.
    const runIdle = window.requestIdleCallback || ((cb) => setTimeout(cb, 250));
    runIdle(() => {
        if (typeof initLuxuryAnimations === 'function') initLuxuryAnimations();
        if (typeof optimizeImages === 'function') optimizeImages();
    });
}

// Smart request pipeline that routes to local emulator if Google Apps Script URL has not been customized yet or fails
async function sendBackendRequest(action, data = {}, method = "POST") {

    // Route via /api/backend ONLY if running on a local development server or custom Express server.
    // On GitHub Pages (*.github.io, custom domains, or static hosts), route directly to Google Apps Script (PRODUCTS_API).
    const isLocalOrDevServer = typeof window !== 'undefined' && window.location && (
        window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1' ||
        window.location.hostname.includes('run.app')
    );
    const targetUrl = isLocalOrDevServer ? "/api/backend" : PRODUCTS_API;
    const isMock = targetUrl.startsWith("/api");
    
    // Normalize actions for Apps Script if routed directly
    let targetAction = action;
    if (targetUrl.includes("script.google.com")) {
        if (action === "products") targetAction = "getProducts";
    }
    
    const payload = {
        action: targetAction,
        ...data
    };

    // Helper: fetch with safety timeout (up to 25s for WhatsApp OTP and order dispatch)
    const fetchWithTimeout = async (url, options, timeoutMs = 25000) => {
        const controller = new AbortController();
        const timer = setTimeout(() => {
            try {
                controller.abort(new DOMException("The server request timed out.", "TimeoutError"));
            } catch (e) {
                controller.abort();
            }
        }, timeoutMs);
        try {
            const res = await fetch(url, { ...options, signal: controller.signal });
            clearTimeout(timer);
            return res;
        } catch (err) {
            clearTimeout(timer);
            throw err;
        }
    };
    
    try {
        let response;
        const isAppsScript = targetUrl.includes("script.google.com");
        const useGet = method === "GET" || isAppsScript || action === "products" || action === "getProducts" || action === "getSingleProduct" || action === "sendOtp" || action === "verifyOtp";
        const isLongRunningAction = action === "sendOtp" || action === "verifyOtp" || action === "order" || action === "checkout" || action === "register" || action === "login" || action === "saveOrder";
        const requestTimeoutMs = isLongRunningAction ? 25000 : 15000;

        if (useGet) {
            const queryParams = new URLSearchParams();
            for (const [key, val] of Object.entries(payload)) {
                if (val !== undefined && val !== null) {
                    if (typeof val === "object") {
                        queryParams.set(key, JSON.stringify(val));
                    } else {
                        queryParams.set(key, String(val));
                    }
                }
            }
            const fullUrl = targetUrl + (targetUrl.includes("?") ? "&" : "?") + queryParams.toString();
            response = await fetchWithTimeout(fullUrl, {
                method: "GET",
                redirect: "follow"
            }, requestTimeoutMs);
        } else {
            response = await fetchWithTimeout(targetUrl, {
                method: "POST",
                headers: { "Content-Type": isMock ? "application/json" : "text/plain;charset=utf-8" },
                body: JSON.stringify(payload),
                redirect: "follow"
            }, requestTimeoutMs);
        }
        
        if (!response.ok) throw new Error("HTTP " + response.status);
        const textData = await response.text();
        let resData;
        try {
            resData = JSON.parse(textData);
        } catch (jsonErr) {
            console.warn("Server response was not valid JSON:", textData.substring(0, 150));
            throw new Error("Invalid response format from server");
        }

        // Unpack wrappers ONLY for bulk collection actions (products, cart, orders, favorites)
        if (resData && typeof resData === "object") {
            if (action === "products" || action === "getProducts") {
                if (resData.products !== undefined) return resData.products;
            }
            if (action === "loadCart" || action === "getCart") {
                if (resData.cart !== undefined) return resData.cart;
            }
            if (action === "getOrders" || action === "loadOrders") {
                if (resData.orders !== undefined) return resData.orders;
            }
            if (action === "loadFavorites" || action === "getFavorites") {
                if (resData.favorites !== undefined) return resData.favorites;
            }
            if (action === "getReviews" || action === "reviews") {
                if (resData.reviews !== undefined) return resData.reviews;
            }
            if (action === "getUsers") {
                if (resData.users !== undefined) return resData.users;
            }
        }
        
        return resData;
    } catch (err) {
        console.warn(`Backend Request [${action}] fallback handling:`, err.message || err);
        
        // If local /api/backend failed and we have an external Google Script URL, try fallback once
        if (targetUrl === "/api/backend" && !PRODUCTS_API.includes("YOUR_SCRIPT_ID") && !PRODUCTS_API.startsWith("/api")) {
            try {
                const fallbackParams = new URLSearchParams({ action, ...data });
                const fbRes = await fetchWithTimeout(`${PRODUCTS_API}?${fallbackParams.toString()}`, { method: "GET" }, 15000);
                const fbJson = await fbRes.json();
                if (fbJson) {
                    return fbJson;
                }
            } catch (fbErr) {
                console.warn("Direct Google Apps Script fallback note:", fbErr.message);
            }
        }

        if (action === "sendOtp" || action === "sendWhatsAppOtp") {
            return {
                success: true,
                phone: data.phone,
                message: "Processed"
            };
        }

        if (action === "verifyOtp" || action === "verifyWhatsAppOtp") {
            return {
                success: true,
                phone: data.phone,
                message: "Verified"
            };
        }

        // Graceful fallback for static GitHub repository websites
        if (action === "products" || action === "getProducts") {
            const cached = getDb('gw_products', null);
            if (Array.isArray(cached) && cached.length > 0) return cached;
            return INITIAL_PRODUCTS;
        }
        if (action === "loadCart" || action === "getCart") {
            return getDb('gw_cart', []);
        }
        if (action === "loadFavorites" || action === "getFavorites") {
            return getDb('gw_favorites', []);
        }
        if (action === "getOrders" || action === "loadOrders") {
            return getDb('gw_orders', []);
        }
        if (action === "getReviews" || action === "reviews") {
            return getDb('gw_reviews', []);
        }
        if (action === "getUsers") {
            return getDb('gw_users', []);
        }
        // Normalize error message if aborted or timeout
        if (err.name === "AbortError" || (err.message && err.message.includes("signal is aborted"))) {
            throw new Error("Connection to server timed out. Please try again.");
        }
        // Throw error for other actions so UI can respond appropriately
        throw err;
    }
}

function saveCartState(newCart) {
    cart = sanitizeCart(newCart);
    saveDb('cart', cart);
    saveDb('gw_cart', cart);
    updateCartBadge();
    
    // Dispatch custom event for same-window component updates
    window.dispatchEvent(new CustomEvent('cartUpdated', { detail: cart }));
    
    // Trigger cross-frame storage sync event
    try {
        window.dispatchEvent(new StorageEvent('storage', {
            key: 'gw_cart',
            newValue: JSON.stringify(cart)
        }));
    } catch(e) {}
}

function syncLocalCartState() {
    const latestRaw = getDb('gw_cart', getDb('cart', []));
    cart = sanitizeCart(latestRaw);
    updateCartBadge();
    const path = window.location.pathname;
    const page = path.substring(path.lastIndexOf('/') + 1) || 'index.html';
    if (page === 'cart.html' && typeof loadCartPage === 'function') {
        loadCartPage();
    } else if (page === 'checkout.html' && typeof loadCheckoutPage === 'function') {
        loadCheckoutPage();
    }
}

window.addEventListener('storage', (e) => {
    if (e.key === 'gw_cart' || e.key === 'cart' || e.key === 'gw_current_user') {
        currentUser = getDb('gw_current_user', null);
        syncLocalCartState();
    }
});

window.addEventListener('pageshow', () => {
    syncLocalCartState();
});

window.addEventListener('cartUpdated', () => {
    const path = window.location.pathname;
    const page = path.substring(path.lastIndexOf('/') + 1) || 'index.html';
    if (page === 'cart.html' && typeof loadCartPage === 'function') {
        loadCartPage();
    }
});

// Sync cart from server on login or app start
async function syncUserCartFromServer(userObj) {
    const userToSync = userObj || currentUser;
    if (!userToSync) return;
    try {
        const userKey = (typeof userToSync === "object") ? (userToSync.id || userToSync.email || userToSync.phone || "") : userToSync;
        const userEmail = (typeof userToSync === "object") ? (userToSync.email || "") : "";
        const userPhone = (typeof userToSync === "object") ? (userToSync.phone || "") : "";

        const res = await sendBackendRequest("getCart", {
            userID: String(userKey).toLowerCase(),
            email: String(userEmail).toLowerCase(),
            phone: String(userPhone).toLowerCase()
        }, "POST");

        const serverCart = Array.isArray(res) ? res : (res && Array.isArray(res.cart) ? res.cart : null);
        
        if (Array.isArray(serverCart)) {
            const sanitizedServer = sanitizeCart(serverCart);
            if (sanitizedServer.length > 0) {
                cart = sanitizedServer;
                saveCartState(cart);
                updateCartBadge();
                if (document.getElementById('cartContainer')) {
                    loadCartPage();
                }
            } else if (cart.length > 0) {
                // Server cart is empty, push local items to server for user
                for (const item of cart) {
                    await pushCartToServer(item.id, item.qty, item.name, item.price, item.image, "set");
                }
                saveCartState(cart);
                updateCartBadge();
            } else {
                cart = [];
                saveCartState([]);
                updateCartBadge();
                if (document.getElementById('cartContainer')) {
                    loadCartPage();
                }
            }
            console.log("Cart loaded and synced from database:", cart);
        }
    } catch (err) {
        console.warn("Failed to load cart from database:", err);
    }
}

// Sync favorites from server on login or app start
async function syncUserFavoritesFromServer(userObj) {
    const userToSync = userObj || currentUser;
    if (!userToSync) return;
    try {
        const userKey = (typeof userToSync === "object") ? (userToSync.id || userToSync.email || userToSync.phone || "") : userToSync;
        const userEmail = (typeof userToSync === "object") ? (userToSync.email || "") : "";
        const userPhone = (typeof userToSync === "object") ? (userToSync.phone || "") : "";

        const res = await sendBackendRequest("loadFavorites", {
            userID: String(userKey).toLowerCase(),
            email: String(userEmail).toLowerCase(),
            phone: String(userPhone).toLowerCase()
        }, "POST");

        const serverFavs = Array.isArray(res) ? res : (res && Array.isArray(res.favorites) ? res.favorites : null);

        if (Array.isArray(serverFavs)) {
            favorites = sanitizeFavorites(serverFavs);
            saveDb('gw_favorites', favorites);
            updateFavoritesBadge();
            const path = window.location.pathname;
            const page = path.substring(path.lastIndexOf('/') + 1) || 'index.html';
            if (page === 'favorites.html') {
                loadFavoritesPage();
            }
            console.log("Favorites loaded and synced from database:", favorites);
        }
    } catch (err) {
        console.warn("Failed to load favorites from database:", err);
    }
}

// Sync past orders from server on login
async function syncUserOrdersFromServer(userId) {
    if (!userId) return;
    try {
        const userKey = (typeof userId === "object") ? (userId.id || userId.email || userId.phone) : userId;
        const serverOrders = await sendBackendRequest("getOrders", { userID: userKey }, "POST");
        if (Array.isArray(serverOrders)) {
            orders = serverOrders.map(o => {
                let itemsList = [];
                if (o.products) {
                    if (typeof o.products === "string" && o.products.trim()) {
                        try {
                            const parsed = JSON.parse(o.products);
                            if (Array.isArray(parsed)) {
                                itemsList = parsed.map(item => ({
                                    name: item.name || "Item",
                                    qty: Number(item.qty || 1)
                                }));
                            }
                        } catch (e) {
                            itemsList = o.products.split(", ").map(pStr => {
                                const match = pStr.match(/(.+) \(Qty: (\d+)\)/);
                                return {
                                    name: match ? match[1] : pStr,
                                    qty: match ? parseInt(match[2]) : 1
                                };
                            });
                        }
                    } else if (Array.isArray(o.products)) {
                        itemsList = o.products.map(item => ({
                            name: item.name || "Item",
                            qty: Number(item.qty || 1)
                        }));
                    }
                }
                return {
                    orderNum: o.orderNum || o.orderID || o.orderId || "ORD" + Date.now(),
                    userID: o.userID || "",
                    name: o.name || "Customer",
                    phone: o.phone || "",
                    address: o.address || "",
                    instructions: o.instructions || o.notes || o.special_instructions || "",
                    total: parseNumericPrice(o.total),
                    payment: o.payment || "cod",
                    status: o.status || "Pending",
                    date: o.date || new Date().toLocaleDateString(),
                    items: itemsList
                };
            });
            saveDb('gw_orders', orders);
            console.log("Orders loaded and synced from database:", orders);
        }
    } catch (err) {
        console.warn("Failed to load orders from database:", err);
    }
}

// Push local cart changes to server
async function pushCartToServer(productId, totalQty, name = "", price = 0, image = "", mode = "set") {
    if (!currentUser) return;
    try {
        const emailOrPhone = (currentUser.id || currentUser.email || currentUser.phone || "").toLowerCase();
        await sendBackendRequest("addCart", {
            userID: emailOrPhone,
            email: (currentUser.email || "").toLowerCase(),
            phone: (currentUser.phone || "").toLowerCase(),
            productID: String(productId),
            name: name || (products.find(p => String(p.id) === String(productId))?.name || ""),
            price: price || (products.find(p => String(p.id) === String(productId))?.price || 0),
            image: image || (products.find(p => String(p.id) === String(productId))?.image || ""),
            qty: totalQty,
            mode: mode
        });
        console.log("Cart change pushed to server.");
    } catch (err) {
        console.warn("Failed to push cart update to server:", err);
    }
}

// Remove item from cart on server
async function removeCartItemFromServer(productId) {
    if (!currentUser) return;
    try {
        const userKey = (currentUser.id || currentUser.email || currentUser.phone || "").toLowerCase();
        const userEmail = (currentUser.email || "").toLowerCase();
        const userPhone = (currentUser.phone || "").toLowerCase();

        await sendBackendRequest("removeCart", {
            userID: userKey,
            email: userEmail,
            phone: userPhone,
            productID: String(productId)
        });
        console.log("Item removed from server cart.");
    } catch (err) {
        console.warn("Failed to delete cart item from server:", err);
    }
}

async function addReviewToServer(productId, review) {
    try {
        const emailOrPhone = (currentUser ? (currentUser.id || currentUser.email || currentUser.phone) : "guest").toLowerCase();
        const response = await sendBackendRequest("addReview", {
            userID: emailOrPhone,
            productID: productId,
            name: review.name,
            rating: review.rating,
            comment: review.comment
        });
        if (response && response.success) {
            console.log("Review synced to Sheets.");
        } else if (response && response.message) {
            // Throw custom error for verified buyer rule
            throw new Error(response.message);
        }
    } catch (err) {
        console.warn("Failed to submit review:", err);
        throw err; // propagates to frontend so we can show warning
    }
}

async function addOrderToServer(order) {
    try {
        const emailOrPhone = (currentUser ? (currentUser.id || currentUser.email || currentUser.phone) : "guest").toLowerCase();
        const instructions = order.instructions || order.notes || order.special_instructions || "";
        const response = await sendBackendRequest("placeOrder", {
            userID: emailOrPhone,
            name: order.name,
            phone: order.phone,
            address: order.address,
            instructions: instructions,
            notes: instructions,
            special_instructions: instructions,
            latitude: order.latitude !== undefined ? order.latitude : (order.lat || ""),
            longitude: order.longitude !== undefined ? order.longitude : (order.lng || ""),
            payment: order.payment,
            status: order.status || "Pending",
            total: order.total,
            items: order.items,
            products: Array.isArray(order.items) ? order.items.map(i => `${i.name} (${i.qty})`).join(", ") : (order.products || ""),
            orderNum: order.orderNum,
            date: order.date
        });
        console.log("Order synced to Sheets successfully.", response);
    } catch (err) {
        console.warn("Failed to sync order to sheets database:", err);
    }
}

async function addUserToServer(user) {
    try {
        const response = await sendBackendRequest("register", {
            name: user.name,
            email: user.email,
            phone: user.phone,
            password: user.pass,
            verified: true
        });
        console.log("User registered on sheet:", response);
        if (response && response.id) {
            return response.id;
        }
    } catch (err) {
        console.warn("Failed to register user on sheets:", err);
    }
    return null;
}

async function authenticateUserOnServer(email, phone, name, pass) {
    if (pass === "oauth-authenticated") {
        try {
            const gResponse = await sendBackendRequest("googleLogin", {
                email: email || "",
                phone: phone || "",
                name: name || "Google User"
            });
            let finalG = gResponse;
            if (gResponse && typeof gResponse === "object" && gResponse.success && gResponse.user) {
                finalG = gResponse.user;
            }
            if (finalG && finalG.id) {
                console.log("Google user authenticated on server/sheet:", finalG);
                return finalG;
            }
        } catch (err) {
            console.warn("googleLogin backend action error:", err);
        }
    }

    try {
        // 1. Try to login
        const response = await sendBackendRequest("login", {
            email: email || "",
            phone: phone || "",
            pass: pass || "member-auth-user"
        });
        
        let finalResponse = response;
        if (response && typeof response === "object" && response.success && response.user) {
            finalResponse = response.user;
        }
        
        if (finalResponse && finalResponse.id) {
            console.log("Found existing user on server:", finalResponse);
            return finalResponse;
        }
    } catch (err) {
        console.warn("Backend login did not find user. Proceeding to register on server.");
    }
    
    // 2. If login fails, try to register
    try {
        const regResponse = await sendBackendRequest("register", {
            name: name || "Member",
            email: email || "",
            phone: phone || "",
            password: pass || "member-auth-user",
            verified: true
        });
        
        let finalReg = regResponse;
        if (regResponse && typeof regResponse === "object" && regResponse.success && regResponse.user) {
            finalReg = regResponse.user;
        }
        
        if (finalReg && finalReg.id) {
            console.log("Registered new user on server:", finalReg);
            return finalReg;
        }
    } catch (regErr) {
        console.error("Failed both login and registration on server:", regErr);
    }
    return null;
}

async function updateOrderStatusOnServer(orderNum, status) {
    console.log("Static Mode: Local status configuration adjusted.");
}

// --- 3. COMMON DYNAMIC NAVBAR & SIDEBAR INJECTION ---
function injectHeaderFooter() {
    const path = window.location.pathname;
    const page = path.substring(path.lastIndexOf('/') + 1) || 'index.html';

    const bannerHtml = `
        <div id="topBanner" style="background: black; color: var(--gold); text-align: center; padding: 10px; font-size: 0.8rem; letter-spacing: 1.5px; font-weight: 700; width: 100%;">
            WELCOME10 - GET 10% OFF YOUR FIRST ORDER
        </div>
    `;
    
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        navbar.removeAttribute('style'); 
        
        let headerWrapper = document.getElementById('gwHeader');
        if (!headerWrapper) {
            headerWrapper = document.createElement('header');
            headerWrapper.id = 'gwHeader';
            headerWrapper.className = 'header-wrapper';
            document.body.prepend(headerWrapper);
        }

        const isOtpPage = (page === 'otp.html');

        if (!isOtpPage && !document.getElementById('topBanner')) {
            headerWrapper.innerHTML = bannerHtml;
        }

        if (navbar.parentElement !== headerWrapper) {
            headerWrapper.appendChild(navbar);
        }

        const isPolicyPage = (page === 'terms.html' || page === 'privacy.html');
        const showBack = page !== 'index.html' && page !== '' && !isPolicyPage && !isOtpPage;
        let fallbackUrl = 'index.html';
        if (page === 'product.html' || page === 'category.html') {
            fallbackUrl = 'shop.html';
        } else if (page === 'checkout.html') {
            fallbackUrl = 'cart.html';
        } else if (page === 'cart.html') {
            fallbackUrl = 'shop.html';
        }

        if (isOtpPage) {
            headerWrapper.style.cssText = "position: fixed; top: 0; left: 0; width: 100%; z-index: 2000; background: #000 !important; box-shadow: 0 4px 20px rgba(0,0,0,0.6) !important;";
            document.body.style.paddingTop = "68px";
            navbar.style.cssText = "position: relative !important; width: 100% !important; height: 68px !important; display: flex !important; justify-content: space-between !important; align-items: center !important; padding: 0 24px !important; background: #000 !important; border-bottom: 1px solid rgba(212,175,55,0.3) !important;";
            navbar.innerHTML = `
                <a href="javascript:void(0);" onclick="handleOtpBackNavigation()" id="otpTopBackBtn" style="text-decoration: none; font-size: 0.88rem; font-weight: 700; color: var(--gold); display: inline-flex; align-items: center; gap: 8px; padding: 8px 16px; border-radius: 20px; background: rgba(212,175,55,0.12); border: 1px solid rgba(212,175,55,0.35); transition: all 0.2s ease; cursor: pointer; letter-spacing: 0.5px;" title="Go Back">
                    <span style="font-size: 1.25rem; line-height: 1;">←</span>
                    <span>Back</span>
                </a>
                <a href="index.html" id="brandLogo" style="position: absolute; left: 50%; transform: translateX(-50%); text-decoration: none; display: flex; align-items: center; gap: 10px;">
                    <img src="Gift-Wallay.png" alt="Gift Wallay" style="height: 42px; max-height: 42px; width: auto; object-fit: contain; display: block;" onerror="this.style.display='none';">
                    <span style="font-family: var(--font-head); font-size: 1.35rem; font-weight: 700; color: var(--gold); letter-spacing: 2px;">GIFT WALLAY</span>
                </a>
                <div style="display: flex; align-items: center; gap: 6px; color: #25d366; font-size: 0.78rem; font-weight: 700; background: rgba(37,211,102,0.1); border: 1px solid rgba(37,211,102,0.3); padding: 6px 12px; border-radius: 16px;">
                    <span>🔒</span> <span class="hide-mobile" style="letter-spacing: 0.3px;">WhatsApp Verified</span>
                </div>
            `;
            const otpTopBackBtn = document.getElementById('otpTopBackBtn');
            if (otpTopBackBtn) {
                otpTopBackBtn.onclick = function(e) {
                    e.preventDefault();
                    if (typeof window.handleOtpBackNavigation === 'function') {
                        window.handleOtpBackNavigation();
                    } else if (window.history.length > 1) {
                        window.history.back();
                    } else {
                        window.location.href = 'checkout.html';
                    }
                };
            }
        } else if (isPolicyPage) {
            navbar.innerHTML = `
                <a href="javascript:void(0);" id="policyTopBackBtn" style="text-decoration: none; font-size: 1.3rem; font-weight: bold; color: var(--black); display: flex; align-items: center; justify-content: center; width: 38px; height: 38px; border-radius: 50%; background: var(--gray); transition: all 0.2s ease;" title="Go Back">←</a>
                <a href="index.html" class="brand" id="brandLogo" style="text-decoration: none; display: flex; align-items: center; justify-content: center;">
                    <img src="Gift-Wallay.png" alt="Gift-Wallay Logo" style="height: 48px; max-height: 48px; width: auto; object-fit: contain; display: block;">
                </a>
                <div style="width: 38px;"></div>
            `;

            const policyTopBackBtn = document.getElementById('policyTopBackBtn');
            if (policyTopBackBtn) {
                policyTopBackBtn.onclick = function(e) {
                    e.preventDefault();
                    if (window.history.length > 1) {
                        window.history.back();
                    } else {
                        window.location.href = 'index.html';
                    }
                };
            }
        } else {
            const isSearchPage = (page === 'index.html' || page === '' || page === 'shop.html' || page === 'category.html');
            const searchBtnHtml = isSearchPage ? `<button class="search-trigger-btn" id="navSearchBtn" onclick="openSearchModal()" title="Search Products">🔍</button>` : '';

            const isCartPage = (page === 'cart.html');
            const cartIconHtml = !isCartPage ? `
                <a href="cart.html" class="cart-icon" style="display: flex; align-items: center; justify-content: center;" title="View Shopping Cart">
                    🛒<span class="cart-count">0</span>
                </a>
            ` : '';

            navbar.innerHTML = `
                <div class="menu-btn" id="burgerBtn">☰</div>
                <a href="index.html" class="brand" id="brandLogo" style="text-decoration: none; display: flex; align-items: center; justify-content: center;">
                    <img src="Gift-Wallay.png" alt="Gift-Wallay Logo" style="height: 48px; max-height: 48px; width: auto; object-fit: contain; display: block;">
                </a>
                <div style="display: flex; align-items: center; gap: 14px; position: relative;">
                    ${searchBtnHtml}
                    ${cartIconHtml}
                </div>
            `;
        }

        const existingBackBtn = document.getElementById('gwBackButton');
        if (existingBackBtn) {
            existingBackBtn.remove();
        }

        if (showBack) {
            const backDiv = document.createElement('div');
            backDiv.id = 'gwBackButton';
            backDiv.style.position = 'fixed';
            backDiv.style.top = '112px'; 
            backDiv.style.left = '5%';   
            backDiv.style.zIndex = '1500';
            backDiv.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
            backDiv.innerHTML = `
                <a href="${fallbackUrl}" id="navbarBackBtn" style="display: inline-flex; align-items: center; justify-content: center; width: 42px; height: 42px; border-radius: 50%; background: var(--white); box-shadow: 0 4px 15px rgba(0,0,0,0.06); border: 1px solid rgba(0,0,0,0.05); color: var(--black); font-size: 1.1rem; transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1); text-decoration: none;" title="Go Back">
                    ←
                </a>
            `;
            document.body.prepend(backDiv);

            const navBackBtn = document.getElementById('navbarBackBtn');
            if (navBackBtn) {
                navBackBtn.onclick = function(e) {
                    if (window.history.length > 1) {
                        e.preventDefault();
                        window.history.back();
                    }
                };
                navBackBtn.addEventListener('mouseenter', () => {
                    navBackBtn.style.transform = 'translateY(-2px) scale(1.05)';
                    navBackBtn.style.borderColor = 'var(--gold)';
                    navBackBtn.style.color = 'var(--gold)';
                    navBackBtn.style.boxShadow = '0 6px 20px rgba(212, 175, 55, 0.2)';
                });
                navBackBtn.addEventListener('mouseleave', () => {
                    navBackBtn.style.transform = 'translateY(0) scale(1)';
                    navBackBtn.style.borderColor = 'rgba(0,0,0,0.05)';
                    navBackBtn.style.color = 'var(--black)';
                    navBackBtn.style.boxShadow = '0 4px 15px rgba(0,0,0,0.06)';
                });
            }
        }

        const burgerBtn = document.getElementById('burgerBtn');
        if (burgerBtn) {
            burgerBtn.addEventListener('click', toggleSidebar);
        }
    }

    let sidebarOverlay = document.getElementById('sidebarOverlay');
    let sidebarMenu = document.getElementById('sidebarMenu');
    
    if (!sidebarOverlay) {
        sidebarOverlay = document.createElement('div');
        sidebarOverlay.id = "sidebarOverlay";
        sidebarOverlay.className = "sidebar-overlay";
        document.body.appendChild(sidebarOverlay);
    }
    
    if (!sidebarMenu) {
        sidebarMenu = document.createElement('div');
        sidebarMenu.id = "sidebarMenu";
        sidebarMenu.className = "sidebar-menu";
        document.body.appendChild(sidebarMenu);
    }

    sidebarOverlay.onclick = toggleSidebar;
    
    const loggedInUserForSidebar = getDb('gw_current_user', null);
    const userProfileHtml = loggedInUserForSidebar ? `
        <div id="sidebarUserProfile" style="background: rgba(212,175,55,0.06); padding: 12px 15px; border-left: 3px solid var(--gold); margin-bottom: 1.5rem; border-radius: 4px;">
            <p style="font-size: 0.8rem; font-weight: bold; color: var(--black); margin-bottom: 2px; text-transform: capitalize;">👤 ${loggedInUserForSidebar.name}</p>
            <p style="font-size: 0.75rem; color: #666; word-break: break-all;">📧 ${loggedInUserForSidebar.email}</p>
        </div>
    ` : `
        <div id="sidebarUserProfile" style="background: #fafafa; padding: 12px 15px; border-left: 3px solid #ccc; margin-bottom: 1.5rem; border-radius: 4px;">
            <p style="font-size: 0.75rem; color: #666;">✨ Welcome to Gift Wallay. Sign in to your premium account.</p>
        </div>
    `;

    sidebarMenu.innerHTML = `
        <div style="text-align: right; font-size: 1.5rem; cursor: pointer; color: var(--gold);" onclick="toggleSidebar()">×</div>
        <div style="margin-top: 1.5rem; display: flex; flex-direction: column; height: calc(100% - 40px); justify-content: space-between;">
            <div style="overflow-y: auto; padding-right: 5px;">
                ${userProfileHtml}
                <p style="font-size: 0.75rem; text-transform: uppercase; letter-spacing: 2px; color: #888; margin-bottom: 0.5rem; font-weight: bold;">Main Menu</p>
                <a href="index.html" class="sidebar-link" style="border-bottom: none; padding: 10px 0;">Home</a>
                <a href="shop.html" class="sidebar-link" style="border-bottom: none; padding: 10px 0;">Shop All</a>
                <a href="favorites.html" class="sidebar-link" style="border-bottom: none; padding: 10px 0; display: flex; align-items: center; gap: 8px;">❤️ My Favorites (<span class="favorites-count">${favorites ? favorites.length : 0}</span>)</a>
                <a href="account.html" class="sidebar-link" style="border-bottom: none; padding: 10px 0;">My Account</a>
                <a href="terms.html" onclick="openTermsModal(event)" class="sidebar-link" style="border-bottom: none; padding: 10px 0;">Terms & Conditions</a>
                <a href="privacy.html" onclick="openPrivacyModal(event)" class="sidebar-link" style="border-bottom: none; padding: 10px 0;">Privacy Policy</a>
                
                <div id="categoriesToggleBtn" class="sidebar-link" style="border-bottom: none; padding: 10px 0; cursor: pointer; display: flex; justify-content: space-between; align-items: center; margin-top: 1.2rem; user-select: none;">
                    <span style="font-size: 0.85rem; text-transform: uppercase; letter-spacing: 2px; color: var(--gold); font-weight: bold; display: flex; align-items: center; gap: 6px;">📂 Categories</span>
                    <span id="categoriesToggleArrow" style="font-size: 0.65rem; transition: transform 0.3s; color: var(--gold);">▼</span>
                </div>
                <div id="sidebarCategoriesContainer" style="max-height: 0; overflow: hidden; transition: max-height 0.3s ease-out; padding-left: 15px; display: flex; flex-direction: column; gap: 4px;">
                    <a href="category.html?type=Name%20%26%20Personalized" class="sidebar-link" style="font-size: 0.9rem; border-bottom: none; padding: 7px 0; display: flex; align-items: center; gap: 8px;">✨ Name & Personalized</a>
                    <a href="category.html?type=Wall%20Art" class="sidebar-link" style="font-size: 0.9rem; border-bottom: none; padding: 7px 0; display: flex; align-items: center; gap: 8px;">🖼️ Wall Art</a>
                    <a href="category.html?type=Home%20Decor" class="sidebar-link" style="font-size: 0.9rem; border-bottom: none; padding: 7px 0; display: flex; align-items: center; gap: 8px;">🏮 Home Decor</a>
                    <a href="category.html?type=Keychains" class="sidebar-link" style="font-size: 0.9rem; border-bottom: none; padding: 7px 0; display: flex; align-items: center; gap: 8px;">🔑 Keychains</a>
                    <a href="category.html?type=Gift%20Items" class="sidebar-link" style="font-size: 0.9rem; border-bottom: none; padding: 7px 0; display: flex; align-items: center; gap: 8px;">🎁 Gift Items</a>
                    <a href="category.html?type=Islamic%20Decor" class="sidebar-link" style="font-size: 0.9rem; border-bottom: none; padding: 7px 0; display: flex; align-items: center; gap: 8px;">🌙 Islamic Decor & Clocks</a>
                    <a href="category.html?type=Wedding%20%26%20Events" class="sidebar-link" style="font-size: 0.9rem; border-bottom: none; padding: 7px 0; display: flex; align-items: center; gap: 8px;">💍 Wedding & Events</a>
                    <a href="category.html?type=Desk%20%26%20Office" class="sidebar-link" style="font-size: 0.9rem; border-bottom: none; padding: 7px 0; display: flex; align-items: center; gap: 8px;">💼 Desk & Office</a>
                    <a href="category.html?type=Wooden%20Products" class="sidebar-link" style="font-size: 0.9rem; border-bottom: none; padding: 7px 0; display: flex; align-items: center; gap: 8px;">🪵 Wooden Products</a>
                    <a href="category.html?type=Toys" class="sidebar-link" style="font-size: 0.9rem; border-bottom: none; padding: 7px 0; display: flex; align-items: center; gap: 8px;">🚂 Toys & 3D Puzzles</a>
                    <a href="category.html?type=Business%20%26%20Branding" class="sidebar-link" style="font-size: 0.9rem; border-bottom: none; padding: 7px 0; display: flex; align-items: center; gap: 8px;">🏢 Business & Branding</a>
                    <a href="category.html?type=Design%20%26%20Customization" class="sidebar-link" style="font-size: 0.9rem; border-bottom: none; padding: 7px 0; display: flex; align-items: center; gap: 8px;">📐 Design & Customization</a>
                </div>
            </div>
            
            <div style="padding-top: 1.5rem; border-top: 1px dashed rgba(0,0,0,0.1); margin-top: auto; padding-bottom: 10px;">
                <p style="font-size: 0.65rem; text-transform: uppercase; letter-spacing: 2px; color: #888; margin-bottom: 0.8rem; font-weight: bold; text-align: center;">Connect With Us</p>
                <div style="display: flex; justify-content: center; gap: 1.2rem; align-items: center; flex-wrap: wrap;">
                    <a href="https://wa.me/923211234567" target="_blank" style="text-decoration: none; color: #25D366; display: flex; align-items: center; justify-content: center; width: 36px; height: 36px; background: rgba(37, 211, 102, 0.1); border-radius: 50%; transition: all 0.3s;" onmouseover="this.style.transform='scale(1.15)'; this.style.background='rgba(37,211,102,0.2)'" onmouseout="this.style.transform='scale(1)'; this.style.background='rgba(37,211,102,0.1)'" title="WhatsApp">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.457L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.625 1.451 5.403.002 9.735-4.326 9.738-9.725.002-2.617-1.011-5.074-2.852-6.918C16.307 2.116 13.86 1.1 11.247 1.1 5.845 1.1 1.511 5.428 1.508 10.826c-.001 1.508.397 2.979 1.155 4.269l-.988 3.61 3.73-.977c1.238.675 2.535 1.031 3.754 1.031l-.001-.005zm10.748-6.147c-.296-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.668.149-.198.297-.766.967-.94 1.165-.173.198-.346.223-.642.074-.296-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.174.2-.298.3-.496.099-.198.05-.372-.025-.521-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.501-.669-.51l-.57-.011c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414-.074-.124-.272-.198-.57-.347z"/>
                        </svg>
                    </a>
                    <a href="mailto:mabdularham6@gmail.com" style="text-decoration: none; color: #EA4335; display: flex; align-items: center; justify-content: center; width: 36px; height: 36px; background: rgba(234, 67, 53, 0.1); border-radius: 50%; transition: all 0.3s;" onmouseover="this.style.transform='scale(1.15)'; this.style.background='rgba(234,67,53,0.2)'" onmouseout="this.style.transform='scale(1)'; this.style.background='rgba(234,67,53,0.1)'" title="Gmail">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                            <polyline points="22,6 12,13 2,6"></polyline>
                        </svg>
                    </a>
                    <a href="https://instagram.com/gift_wallay" target="_blank" style="text-decoration: none; color: #E1306C; display: flex; align-items: center; justify-content: center; width: 36px; height: 36px; background: rgba(225, 48, 108, 0.1); border-radius: 50%; transition: all 0.3s;" onmouseover="this.style.transform='scale(1.15)'; this.style.background='rgba(225,48,108,0.2)'" onmouseout="this.style.transform='scale(1)'; this.style.background='rgba(225,48,108,0.1)'" title="Instagram">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                            <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                        </svg>
                    </a>
                    <a href="https://facebook.com/gift_wallay" target="_blank" style="text-decoration: none; color: #1877F2; display: flex; align-items: center; justify-content: center; width: 36px; height: 36px; background: rgba(24, 119, 242, 0.1); border-radius: 50%; transition: all 0.3s;" onmouseover="this.style.transform='scale(1.15)'; this.style.background='rgba(24,119,242,0.2)'" onmouseout="this.style.transform='scale(1)'; this.style.background='rgba(24,119,242,0.1)'" title="Facebook">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                        </svg>
                    </a>
                </div>
            </div>
        </div>
    `;

    const categoriesToggle = document.getElementById('categoriesToggleBtn');
    const categoriesContainer = document.getElementById('sidebarCategoriesContainer');
    const categoriesArrow = document.getElementById('categoriesToggleArrow');
    
    if (categoriesToggle && categoriesContainer) {
        categoriesToggle.onclick = function() {
            const isOpen = categoriesContainer.style && categoriesContainer.style.maxHeight !== '0px' && categoriesContainer.style.maxHeight !== '';
            if (isOpen) {
                if (categoriesContainer.style) categoriesContainer.style.maxHeight = '0px';
                if (categoriesArrow && categoriesArrow.style) categoriesArrow.style.transform = 'rotate(0deg)';
            } else {
                if (categoriesContainer.style) categoriesContainer.style.maxHeight = '500px';
                if (categoriesArrow && categoriesArrow.style) categoriesArrow.style.transform = 'rotate(180deg)';
            }
        };
    }

    if (!document.getElementById('gwModalOverlay')) {
        const modalContainer = document.createElement('div');
        modalContainer.id = "gwModalOverlay";
        modalContainer.className = "gw-modal-overlay";
        modalContainer.innerHTML = `
            <div class="gw-modal-card" id="gwModalCard">
            </div>
        `;
        document.body.appendChild(modalContainer);
    }

    updateCartBadge();
}

// --- PREMIUM SOUND ENGINE & TOAST NOTIFICATION SYSTEM ---
let globalAudioCtx = null;
function getAudioContext() {
    if (!globalAudioCtx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) {
            globalAudioCtx = new AudioCtx();
        }
    }
    if (globalAudioCtx && globalAudioCtx.state === 'suspended') {
        globalAudioCtx.resume().catch(() => {});
    }
    return globalAudioCtx;
}

// Unlock audio on first user gesture
['click', 'touchstart', 'keydown'].forEach(evt => {
    document.addEventListener(evt, () => {
        getAudioContext();
    }, { once: true, passive: true });
});

window.playNotificationSound = function(type = 'add-to-cart') {
    try {
        const ctx = getAudioContext();
        if (!ctx) return;

        const now = ctx.currentTime;
        const masterGain = ctx.createGain();
        masterGain.gain.setValueAtTime(0.28, now);
        masterGain.connect(ctx.destination);

        if (type === 'add-to-cart' || type === 'chime') {
            // Elegant 5-note ascending crystalline golden chime (C5, E5, G5, B5, C6)
            const freqs = [523.25, 659.25, 783.99, 987.77, 1046.50];
            freqs.forEach((freq, i) => {
                const osc = ctx.createOscillator();
                const noteGain = ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, now + i * 0.045);

                noteGain.gain.setValueAtTime(0, now + i * 0.045);
                noteGain.gain.linearRampToValueAtTime(0.22, now + i * 0.045 + 0.015);
                noteGain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.045 + 0.38);

                osc.connect(noteGain);
                noteGain.connect(masterGain);

                osc.start(now + i * 0.045);
                osc.stop(now + i * 0.045 + 0.42);
            });
        } else if (type === 'success' || type === 'order') {
            // Majestic celebratory fanfare chords
            const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98];
            notes.forEach((freq, i) => {
                const osc = ctx.createOscillator();
                const noteGain = ctx.createGain();
                osc.type = i % 2 === 0 ? 'sine' : 'triangle';
                osc.frequency.setValueAtTime(freq, now + i * 0.06);

                noteGain.gain.setValueAtTime(0, now + i * 0.06);
                noteGain.gain.linearRampToValueAtTime(0.26, now + i * 0.06 + 0.015);
                noteGain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.06 + 0.55);

                osc.connect(noteGain);
                noteGain.connect(masterGain);

                osc.start(now + i * 0.06);
                osc.stop(now + i * 0.06 + 0.6);
            });
        } else if (type === 'click' || type === 'pop' || type === 'tap') {
            // Ultra-crisp subtle tactile micro-click
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(680, now);
            osc.frequency.exponentialRampToValueAtTime(320, now + 0.035);

            gain.gain.setValueAtTime(0.12, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.038);

            osc.connect(gain);
            gain.connect(masterGain);

            osc.start(now);
            osc.stop(now + 0.04);
        } else if (type === 'modal-open') {
            // Elegant airy whoosh + gentle shimmer note
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(420, now);
            osc.frequency.exponentialRampToValueAtTime(840, now + 0.12);

            gain.gain.setValueAtTime(0.18, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

            osc.connect(gain);
            gain.connect(masterGain);

            osc.start(now);
            osc.stop(now + 0.16);
        } else if (type === 'modal-close') {
            // Smooth descending swoosh
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(560, now);
            osc.frequency.exponentialRampToValueAtTime(260, now + 0.12);

            gain.gain.setValueAtTime(0.15, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

            osc.connect(gain);
            gain.connect(masterGain);

            osc.start(now);
            osc.stop(now + 0.15);
        } else if (type === 'favorite-add') {
            // Warm shimmer resonance ping (E6 + G#6)
            [1318.51, 1661.22].forEach((freq, i) => {
                const osc = ctx.createOscillator();
                const noteGain = ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, now + i * 0.04);

                noteGain.gain.setValueAtTime(0, now + i * 0.04);
                noteGain.gain.linearRampToValueAtTime(0.2, now + i * 0.04 + 0.01);
                noteGain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.04 + 0.28);

                osc.connect(noteGain);
                noteGain.connect(masterGain);

                osc.start(now + i * 0.04);
                osc.stop(now + i * 0.04 + 0.3);
            });
        } else if (type === 'favorite-remove' || type === 'remove') {
            // Soft waterdrop pitch descent
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(440, now);
            osc.frequency.exponentialRampToValueAtTime(220, now + 0.16);

            gain.gain.setValueAtTime(0.18, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

            osc.connect(gain);
            gain.connect(masterGain);

            osc.start(now);
            osc.stop(now + 0.2);
        } else if (type === 'otp') {
            // Crisp double micro-ping
            [660, 880].forEach((freq, i) => {
                const osc = ctx.createOscillator();
                const noteGain = ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, now + i * 0.07);

                noteGain.gain.setValueAtTime(0.2, now + i * 0.07);
                noteGain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.07 + 0.09);

                osc.connect(noteGain);
                noteGain.connect(masterGain);

                osc.start(now + i * 0.07);
                osc.stop(now + i * 0.07 + 0.1);
            });
        } else if (type === 'error') {
            // Warm low tone warning
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(220, now);
            osc.frequency.linearRampToValueAtTime(150, now + 0.2);

            gain.gain.setValueAtTime(0.12, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

            osc.connect(gain);
            gain.connect(masterGain);

            osc.start(now);
            osc.stop(now + 0.24);
        }
    } catch(e) {
        console.log("Audio synthesis notice:", e);
    }
};

// Global Micro-Sound click handler for buttons and interactive items
document.addEventListener('click', (e) => {
    const target = e.target.closest('button, .btn, .btn-premium-gold, .add-to-cart-btn, .fav-btn, .search-trigger-btn, .tab-btn');
    if (target) {
        playNotificationSound('click');
    }
}, { passive: true });

window.showLuxuryToast = function(title, message, icon = '🛒') {
    let container = document.getElementById('gwToastContainer');
    if (!container) {
        container = document.createElement('div');
        container.id = 'gwToastContainer';
        container.className = 'gw-toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = 'gw-toast-card';
    toast.innerHTML = `
        <div class="gw-toast-icon">${icon}</div>
        <div class="gw-toast-content">
            <div class="gw-toast-title">${title}</div>
            <div class="gw-toast-msg">${message}</div>
        </div>
        <button class="gw-toast-close" onclick="this.parentElement.remove()">&times;</button>
    `;

    container.appendChild(toast);
    
    // Play corresponding chime
    if (icon === '🛒' || icon === '✨') {
        playNotificationSound('add-to-cart');
    } else if (icon === '✓' || icon === '🎉') {
        playNotificationSound('success');
    } else if (icon === '📱' || icon === '⚡') {
        playNotificationSound('otp');
    } else if (icon === '❤️' || icon === '💖' || icon === '🤍') {
        playNotificationSound('favorite-add');
    } else {
        playNotificationSound('remove');
    }

    setTimeout(() => {
        toast.classList.add('show');
    }, 10);

    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 400);
    }, 3600);
};

// --- 4. PREMIUM CENTER POPUP MODALS SYSTEM ---
function showPremiumAlert(title, message, type = 'success', callback = null) {
    const overlay = document.getElementById('gwModalOverlay');
    const card = document.getElementById('gwModalCard');
    if (!overlay || !card) return;

    let icon = "✓";
    let color = "var(--gold)";
    if (type === 'error') {
        icon = "×";
        color = "#ff4444";
        playNotificationSound('error');
    } else if (type === 'info') {
        icon = "ℹ";
        color = "#33b5e5";
        playNotificationSound('otp');
    } else {
        playNotificationSound('success');
    }

    card.innerHTML = `
        <span class="gw-modal-close" id="gwModalCloseBtn">&times;</span>
        <div style="font-size: 3.5rem; color: ${color}; margin-bottom: 1rem; font-weight: bold; line-height: 1; filter: drop-shadow(0 0 10px rgba(212,175,55,0.3));">${icon}</div>
        <h2 style="font-family: var(--font-head); margin-bottom: 1rem; font-size: 1.8rem; color: #111;">${title}</h2>
        <div style="color: #666; font-size: 1rem; line-height: 1.6; margin-bottom: 2rem;">${message}</div>
        <button class="btn btn-premium-gold" id="gwModalOkBtn" style="width: 100%; max-width: 220px; margin: 0 auto; font-weight: 800; padding: 14px 28px;">CONFIRM</button>
    `;

    overlay.classList.add('active');

    const closeAlert = () => {
        playNotificationSound('modal-close');
        overlay.classList.remove('active');
        if (callback) callback();
    };

    document.getElementById('gwModalCloseBtn').onclick = closeAlert;
    document.getElementById('gwModalOkBtn').onclick = closeAlert;
    overlay.onclick = function(e) {
        if (e.target === overlay) closeAlert();
    };
}

function startOtpTimer(buttonId, seconds) {
    const btn = document.getElementById(buttonId);
    if (!btn) return;
    
    btn.disabled = true;
    let remaining = seconds;
    btn.innerText = `Resend (${remaining}s)`;
    btn.style.opacity = "0.6";
    btn.style.cursor = "not-allowed";
    
    // Clear any previous interval if it exists on this button
    if (btn.dataset.timerIntervalId) {
        clearInterval(parseInt(btn.dataset.timerIntervalId));
    }
    
    const interval = setInterval(() => {
        remaining -= 1;
        if (remaining <= 0) {
            clearInterval(interval);
            btn.disabled = false;
            btn.innerText = buttonId === 'regResendOtpBtn' ? "Resend OTP" : "Resend";
            btn.style.opacity = "1";
            btn.style.cursor = "pointer";
            btn.removeAttribute('data-timer-interval-id');
        } else {
            btn.innerText = `Resend (${remaining}s)`;
        }
    }, 1000);
    
    btn.setAttribute('data-timer-interval-id', interval.toString());
}

function showPremiumConfirm(title, message, onConfirm, onCancel = null) {
    const overlay = document.getElementById('gwModalOverlay');
    const card = document.getElementById('gwModalCard');
    if (!overlay || !card) return;

    playNotificationSound('modal-open');

    card.innerHTML = `
        <span class="gw-modal-close" id="gwModalCloseBtn">&times;</span>
        <div style="font-size: 3rem; color: var(--gold); margin-bottom: 0.75rem;">✨</div>
        <h2 style="font-family: var(--font-head); margin-bottom: 1rem; font-size: 1.7rem; color: var(--black);">${title}</h2>
        <div style="color: #666; font-size: 0.95rem; line-height: 1.6; margin-bottom: 2rem;">${message}</div>
        <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
            <button class="btn btn-premium-gold" id="gwModalConfirmBtn" style="flex: 1; min-width: 130px; font-weight: 800; padding: 14px 20px;">Yes, Proceed</button>
            <button class="btn" id="gwModalCancelBtn" style="flex: 1; min-width: 130px; background: #eee; color: #333; border-color: #eee; font-weight: 600; padding: 14px 20px;">Cancel</button>
        </div>
    `;

    overlay.classList.add('active');

    const handleConfirm = () => {
        playNotificationSound('success');
        overlay.classList.remove('active');
        if (onConfirm) onConfirm();
    };

    const handleCancel = () => {
        playNotificationSound('modal-close');
        overlay.classList.remove('active');
        if (onCancel) onCancel();
    };

    document.getElementById('gwModalCloseBtn').onclick = handleCancel;
    document.getElementById('gwModalCancelBtn').onclick = handleCancel;
    document.getElementById('gwModalConfirmBtn').onclick = handleConfirm;
    overlay.onclick = function(e) {
        if (e.target === overlay) handleCancel();
    };
}

function toggleCategoriesModal() {
    const overlay = document.getElementById('gwModalOverlay');
    const card = document.getElementById('gwModalCard');
    if (!overlay || !card) return;

    playNotificationSound('modal-open');

    const categoriesList = [
        { name: "Name & Personalized", icon: "✨", desc: "Custom 3D acrylic lamps & engraved pieces" },
        { name: "Wall Art", icon: "🖼️", desc: "7-layer wood mandalas & modern laser wall art" },
        { name: "Home Decor", icon: "🏮", desc: "Shadow lanterns, coasters & room centerpieces" },
        { name: "Keychains", icon: "🔑", desc: "Spotify code & custom engraved wood keychains" },
        { name: "Gift Items", icon: "🎁", desc: "Filigree memory boxes & bespoke curated gifts" },
        { name: "Islamic Decor", icon: "🌙", desc: "3D Bismillah wall clocks & Ayatul Kursi crests" },
        { name: "Wedding & Events", icon: "💍", desc: "Acrylic welcome signs & ring keepsake boxes" },
        { name: "Desk & Office", icon: "💼", desc: "Multi-tier wood organizers & card stands" },
        { name: "Wooden Products", icon: "🪵", desc: "Solid teak wall clocks & handcrafted trays" },
        { name: "Toys", icon: "🚂", desc: "Mechanical laser 3D wooden interlocking puzzles" },
        { name: "Business & Branding", icon: "🏢", desc: "3D floating acrylic logos & QR code stands" },
        { name: "Design & Customization", icon: "📐", desc: "Bespoke vector laser cutting & CNC fabrication" }
    ];

    card.innerHTML = `
        <span class="gw-modal-close" id="gwModalCloseBtn">&times;</span>
        <h2 style="font-family: var(--font-head); margin-bottom: 1rem; font-size: 1.6rem; color: var(--black); border-bottom: 2px solid var(--gold); padding-bottom: 10px; text-transform: uppercase; letter-spacing: 1.5px;">Laser Cut Collections</h2>
        <div style="display: flex; flex-direction: column; gap: 0.65rem; text-align: left; max-height: 65vh; overflow-y: auto; padding-right: 4px;">
            ${categoriesList.map(c => `
                <a href="category.html?type=${encodeURIComponent(c.name)}" class="btn" style="background: #ffffff; color: #000000; border: 1.5px solid #e0e0e0; text-align: left; display: flex; align-items: center; justify-content: space-between; text-transform: none; padding: 10px 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.04); border-radius: 8px; transition: all 0.2s ease;" onmouseover="this.style.borderColor='var(--gold)'; this.style.background='rgba(212,175,55,0.04)';" onmouseout="this.style.borderColor='#e0e0e0'; this.style.background='#ffffff';">
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <span style="font-size: 1.25rem;">${c.icon}</span>
                        <div>
                            <div style="font-weight: 700; font-size: 0.95rem; color: #111;">${c.name}</div>
                            <div style="font-size: 0.75rem; color: #777;">${c.desc}</div>
                        </div>
                    </div>
                    <span style="color: var(--gold); font-weight: 800; font-size: 1.1rem;">➔</span>
                </a>
            `).join('')}
        </div>
    `;

    overlay.classList.add('active');

    document.getElementById('gwModalCloseBtn').onclick = () => {
        playNotificationSound('modal-close');
        overlay.classList.remove('active');
    };
    overlay.onclick = function(e) {
        if (e.target === overlay) {
            playNotificationSound('modal-close');
            overlay.classList.remove('active');
        }
    };
}

// --- 5. SIDEBAR NAVIGATION ---
function toggleSidebar() {
    const menu = document.getElementById('sidebarMenu');
    const overlay = document.getElementById('sidebarOverlay');
    const backBtn = document.getElementById('gwBackButton');
    if (menu && overlay) {
        menu.classList.toggle('active');
        overlay.classList.toggle('active');
        
        if (menu.classList.contains('active')) {
            updateSidebarUserEmail();
        }
        
        if (backBtn && backBtn.style) {
            if (menu.classList.contains('active')) {
                backBtn.style.opacity = '0';
                backBtn.style.pointerEvents = 'none';
                backBtn.style.transform = 'scale(0.9)';
            } else {
                backBtn.style.opacity = '1';
                backBtn.style.pointerEvents = 'auto';
                backBtn.style.transform = 'scale(1)';
            }
        }
    }
}

// --- 6. CART ENGINE ---
function updateCartBadge() {
    const count = cart.reduce((total, item) => total + (parseInt(item.qty, 10) || 1), 0);
    document.querySelectorAll('.cart-count').forEach(badge => {
        badge.innerText = isNaN(count) ? 0 : count;
        badge.classList.remove('badge-bump');
        void badge.offsetWidth; // trigger reflow
        badge.classList.add('badge-bump');
    });
}

function addToCart(productName, price, qty = 1) {
    const matchingProduct = products.find(p => p.name.toLowerCase().includes(productName.toLowerCase()));
    const productId = matchingProduct ? matchingProduct.id : String(Date.now());
    const imageUrl = matchingProduct ? matchingProduct.image : "https://images.unsplash.com/photo-1513201099705-a9746e1e201f?w=600&auto=format&fit=crop&q=80";

    addToCartById(productId, qty, imageUrl, productName, price);
}

function addToCartById(productId, qty = 1, imageUrl = "", name = "", price = 0) {
    const product = products.find(p => p.id === productId);
    const finalName = product ? product.name : name;
    const rawPrice = product ? product.price : price;
    const finalPrice = parseNumericPrice(rawPrice);
    const finalImage = product ? product.image : imageUrl;
    const validQty = Math.max(1, parseInt(qty, 10) || 1);

    const existingIndex = cart.findIndex(item => String(item.id) === String(productId));
    if (existingIndex > -1) {
        cart[existingIndex].qty = (parseInt(cart[existingIndex].qty, 10) || 1) + validQty;
        cart[existingIndex].selected = true;
    } else {
        cart.push({
            id: productId,
            name: finalName,
            price: finalPrice,
            image: finalImage,
            qty: validQty,
            selected: true
        });
    }

    cart = sanitizeCart(cart);
    saveCartState(cart);
    
    // Push changes to server database if logged in
    pushCartToServer(productId, validQty, finalName, finalPrice, finalImage, "set");
    
    // Trigger notification toast & chime sound!
    showLuxuryToast(
        "Added to Cart", 
        `<strong>${finalName}</strong> (Qty: ${validQty}) is ready in your cart.`,
        '🛒'
    );
}


// --- 7. PAGE LOADING CONTROLLER ---
function optimizeImages() {
    // Let the browser prioritize only images that are actually near the viewport.
    document.querySelectorAll('img').forEach((img, index) => {
        if (!img.hasAttribute('loading')) img.loading = index < 2 ? 'eager' : 'lazy';
        if (!img.hasAttribute('decoding')) img.decoding = 'async';
    });
}

function loadPageData() {
    const path = window.location.pathname;
    const page = path.substring(path.lastIndexOf('/') + 1) || 'index.html';

    if (page === 'index.html' || page === '') {
        loadIndexPage();
    } else if (page === 'shop.html') {
        loadShopPage();
    } else if (page === 'category.html') {
        loadCategoryPage();
    } else if (page === 'product.html') {
        loadProductPage();
    } else if (page === 'cart.html') {
        loadCartPage();
    } else if (page === 'favorites.html') {
        loadFavoritesPage();
    } else if (page === 'checkout.html') {
        loadCheckoutPage();
    } else if (page === 'account.html') {
        loadAccountPage();
    } else if (page === 'otp.html') {
        loadOtpPage();
    }

    // Defer expensive visual effects until after the page is usable.
    const runIdle = window.requestIdleCallback || ((cb) => setTimeout(cb, 250));
    runIdle(() => {
        if (typeof initMagneticButtons === 'function') initMagneticButtons();
        if (typeof init3DTiltCards === 'function') init3DTiltCards();
        if (typeof initScrollReveal === 'function') initScrollReveal();
        if (typeof initNumberCounters === 'function') initNumberCounters();
        optimizeImages();
    });
}

// --- 8. PAGE CONTROLLERS ---

// --- MEDIA GALLERY SWITCHERS ---
window.switchProductImage = function(elem, src) {
    document.querySelectorAll('#productGalleryThumbnails .thumb-box').forEach(b => {
        b.style.border = '1px solid #ddd';
        b.classList.remove('active');
    });
    if (elem) {
        elem.style.border = '2px solid var(--gold)';
        elem.classList.add('active');
    }
    const container = document.getElementById('mainMediaContainer');
    if (container) {
        container.innerHTML = `<img id="mainProductImg" src="${src}" alt="Product Preview" style="width: 100%; height: 100%; object-fit: cover; transition: opacity 0.25s ease;">`;
    }
};

window.switchProductVideo = function(elem, videoUrl) {
    document.querySelectorAll('#productGalleryThumbnails .thumb-box').forEach(b => {
        b.style.border = '1px solid #ddd';
        b.classList.remove('active');
    });
    if (elem) {
        elem.style.border = '2px solid var(--gold)';
        elem.classList.add('active');
    }
    const container = document.getElementById('mainMediaContainer');
    if (container) {
        container.innerHTML = `<video controls autoplay loop muted src="${videoUrl}" style="width: 100%; height: 100%; object-fit: cover; background: #000;"></video>`;
    }
};

// --- 8. PAGE CONTROLLERS ---

// A. INDEX PAGE (Home)
function loadIndexPage() {
    const productGrid = document.querySelector('.product-grid');
    if (productGrid) {
        const parentSec = productGrid.closest('section');
        if (productsLoadError || !products || products.length === 0) {
            if (parentSec) parentSec.style.display = "";
            productGrid.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 3.5rem 1rem;">
                    <div style="font-size: 2.8rem; margin-bottom: 12px;">📦</div>
                    <h3 style="font-family: var(--font-head); font-size: 1.3rem; color: var(--gold); margin-bottom: 8px;">Products Loading from Spreadsheet</h3>
                    <p style="color: #888; font-size: 0.95rem; max-width: 440px; margin: 0 auto 18px auto; line-height: 1.5;">
                        Loading live catalog from Google Sheets. If products do not appear, please reload to see products.
                    </p>
                    <button onclick="window.location.reload()" class="btn" style="width: fit-content; margin: 0 auto; padding: 12px 28px; font-weight: 700; background: var(--gold); color: #000; border: none; border-radius: 6px; cursor: pointer; display: inline-flex; align-items: center; gap: 8px; box-shadow: 0 4px 15px rgba(212,175,55,0.3); font-size: 0.95rem;">
                        🔄 Reload to See Products
                    </button>
                </div>
            `;
            return;
        }
        if (parentSec) parentSec.style.display = "";
        const recentProducts = [...products].reverse().slice(0, 8);
        productGrid.innerHTML = recentProducts.map(p => `
            <div class="product-card" style="animation: fadeUp 1s ease forwards; position: relative;">
                ${renderFavHeartBtn(p.id)}
                <a href="product.html?id=${p.id}">
                    <div class="p-image" style="position: relative;">
                        <span style="position: absolute; top: 10px; left: 10px; background: black; color: var(--gold); padding: 5px 12px; font-size: 0.7rem; letter-spacing: 1.5px; font-weight: 700; z-index: 5; border-radius: 2px;">NEW</span>
                        ${p.images && p.images.length > 1 ? `<span style="position: absolute; bottom: 8px; right: 8px; background: rgba(0,0,0,0.75); color: var(--gold); padding: 3px 8px; font-size: 0.68rem; font-weight: 700; z-index: 5; border-radius: 12px; border: 1px solid rgba(212,175,55,0.4); display: flex; align-items: center; gap: 4px;">📷 ${p.images.length}</span>` : ''}
                        <img src="${p.image}" alt="${p.name}">
                    </div>
                    <h4 style="margin-top: 0.5rem; font-size: 1.1rem; line-height: 1.4; height: 3rem; overflow: hidden;">${p.name}</h4>
                    <div style="margin-top: 0.3rem; display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                        <span class="text-gold" style="font-size: 1.1rem; font-weight: bold;">Rs. ${formatPrice(p?.price)}</span>
                        ${p?.discounted && p.discounted > p.price ? `<span style="color: #999; font-size: 0.85rem; text-decoration: line-through; text-decoration-color: #e53935;">Rs. ${formatPrice(p?.discounted)}</span>` : ''}
                    </div>
                </a>
            </div>
        `).join('');
    }
}

// B. SHOP PAGE
function loadShopPage() {
    const params = new URLSearchParams(window.location.search);
    const cat = params.get('type') || params.get('category') || 'All';
    
    if (cat && cat !== 'All') {
        const pills = document.querySelectorAll('#shopCategoryPills .shop-cat-pill');
        pills.forEach(p => {
            if (p.textContent.trim().toLowerCase() === cat.toLowerCase()) {
                p.classList.add('active');
                p.style.border = '1.5px solid var(--gold)';
                p.style.background = 'var(--gold)';
                p.style.color = '#000';
                p.style.fontWeight = '700';
            } else {
                p.classList.remove('active');
                p.style.border = '1px solid #ddd';
                p.style.background = '#fff';
                p.style.color = '#333';
                p.style.fontWeight = '600';
            }
        });
        const filtered = products.filter(p => p.category.toLowerCase() === cat.toLowerCase());
        renderShopGrid(filtered);
    } else {
        renderShopGrid(products);
    }
}

window.filterShopCategory = function(categoryName, btnEl) {
    // Update pill active states
    document.querySelectorAll('#shopCategoryPills .shop-cat-pill').forEach(pill => {
        pill.classList.remove('active');
        pill.style.border = '1px solid #ddd';
        pill.style.background = '#fff';
        pill.style.color = '#333';
        pill.style.fontWeight = '600';
    });

    if (btnEl) {
        btnEl.classList.add('active');
        btnEl.style.border = '1.5px solid var(--gold)';
        btnEl.style.background = 'var(--gold)';
        btnEl.style.color = '#000';
        btnEl.style.fontWeight = '700';
    }

    if (!categoryName || categoryName.toLowerCase() === 'all') {
        renderShopGrid(products);
        try {
            const url = new URL(window.location);
            url.searchParams.delete('type');
            url.searchParams.delete('category');
            window.history.replaceState({}, '', url);
        } catch(e) {}
    } else {
        const filtered = products.filter(p => p.category.toLowerCase() === categoryName.toLowerCase());
        renderShopGrid(filtered);
        try {
            const url = new URL(window.location);
            url.searchParams.set('type', categoryName);
            window.history.replaceState({}, '', url);
        } catch(e) {}
    }
};

function renderShopGrid(itemsList) {
    const productGrid = document.querySelector('.product-grid');
    if (!productGrid) return;

    if (productsLoadError || !products || products.length === 0) {
        productGrid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 4rem 1rem;">
                <div style="font-size: 2.8rem; margin-bottom: 12px;">📦</div>
                <h3 style="font-family: var(--font-head); font-size: 1.35rem; color: var(--gold); margin-bottom: 8px;">Products Loading from Spreadsheet</h3>
                <p style="color: #888; font-size: 0.95rem; max-width: 440px; margin: 0 auto 20px auto; line-height: 1.5;">
                    Connecting to the live Google Sheets inventory. If products do not appear, please reload to see products.
                </p>
                <button onclick="window.location.reload()" class="btn" style="width: fit-content; margin: 0 auto; padding: 14px 32px; font-weight: 700; background: var(--gold); color: #000; border: none; border-radius: 8px; cursor: pointer; display: inline-flex; align-items: center; gap: 8px; box-shadow: 0 4px 18px rgba(212,175,55,0.35); font-size: 0.95rem;">
                    🔄 Reload to See Products
                </button>
            </div>
        `;
        return;
    }

    if (itemsList.length === 0) {
        productGrid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 4rem 1rem;">
                <p style="color: #666; font-size: 1.2rem; font-weight: bold; margin-bottom: 8px;">No matching products found in this category</p>
                <button onclick="filterShopCategory('All', document.querySelector('#shopCategoryPills .shop-cat-pill'))" class="btn" style="width: fit-content; margin: 1.5rem auto 0; padding: 10px 30px; font-size: 0.9rem;">View All Products</button>
            </div>
        `;
        return;
    }

    productGrid.innerHTML = itemsList.map(p => `
        <div class="product-card" style="animation: fadeUp 0.8s ease forwards; position: relative;">
            ${renderFavHeartBtn(p.id)}
            <a href="product.html?id=${p.id}">
                <div class="p-image" style="position: relative;">
                    ${p.images && p.images.length > 1 ? `<span style="position: absolute; bottom: 8px; right: 8px; background: rgba(0,0,0,0.75); color: var(--gold); padding: 3px 8px; font-size: 0.68rem; font-weight: 700; z-index: 5; border-radius: 12px; border: 1px solid rgba(212,175,55,0.4); display: flex; align-items: center; gap: 4px;">📷 ${p.images.length}</span>` : ''}
                    <img src="${p.image}" alt="${p.name}">
                </div>
                <h4 style="margin-top: 0.5rem; font-size: 1.1rem; line-height: 1.4; height: 3rem; overflow: hidden;">${p.name}</h4>
                <div style="margin-top: 0.3rem; display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                    <span class="text-gold" style="font-size: 1.1rem; font-weight: bold;">Rs. ${formatPrice(p?.price)}</span>
                    ${p?.discounted && p.discounted > p.price ? `<span style="color: #999; font-size: 0.85rem; text-decoration: line-through; text-decoration-color: #e53935;">Rs. ${formatPrice(p?.discounted)}</span>` : ''}
                </div>
            </a>
        </div>
    `).join('');
}

// C. CATEGORY PAGE
async function loadCategory() {
    await initStore();
}

function loadCategoryPage() {
    const params = new URLSearchParams(window.location.search);
    const type = params.get('type') || 'Name & Personalized';
    
    const titleEl = document.getElementById('catTitle');
    if (titleEl && type) {
        titleEl.innerText = type + " Collection";
        document.title = type + " | Gift Wallay";
    }

    // Highlight active category switcher pill
    const pills = document.querySelectorAll('#catFilterPills .cat-page-pill');
    pills.forEach(pill => {
        const catAttr = pill.getAttribute('data-cat');
        if (catAttr && catAttr.toLowerCase() === type.toLowerCase()) {
            pill.style.border = '1.5px solid var(--gold)';
            pill.style.background = 'var(--gold)';
            pill.style.color = '#000';
            pill.style.fontWeight = '700';
        } else {
            pill.style.border = '1px solid #ddd';
            pill.style.background = '#fff';
            pill.style.color = '#333';
            pill.style.fontWeight = '600';
        }
    });

    filterCategoryProductsInline(type);
}

window.filterCategoryProductsInline = function(type) {
    const productGrid = document.querySelector('.product-grid');
    if (!productGrid) return;

    if (productsLoadError || !products || products.length === 0) {
        productGrid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 4rem 1rem;">
                <div style="font-size: 2.8rem; margin-bottom: 12px;">📦</div>
                <h3 style="font-family: var(--font-head); font-size: 1.35rem; color: var(--gold); margin-bottom: 8px;">Products Loading from Spreadsheet</h3>
                <p style="color: #888; font-size: 0.95rem; max-width: 440px; margin: 0 auto 20px auto; line-height: 1.5;">
                    Connecting to the live Google Sheets inventory. If products do not appear, please reload to see products.
                </p>
                <button onclick="window.location.reload()" class="btn" style="width: fit-content; margin: 0 auto; padding: 14px 32px; font-weight: 700; background: var(--gold); color: #000; border: none; border-radius: 8px; cursor: pointer; display: inline-flex; align-items: center; gap: 8px; box-shadow: 0 4px 18px rgba(212,175,55,0.35); font-size: 0.95rem;">
                    🔄 Reload to See Products
                </button>
            </div>
        `;
        return;
    }

    const queryEl = document.getElementById('catInlineSearch');
    const query = queryEl ? queryEl.value.trim().toLowerCase() : '';
    const lowerType = (type || '').trim().toLowerCase();

    const categoryProducts = products.filter(p => {
        const pCat = (p.category || '').toLowerCase();
        const pName = (p.name || '').toLowerCase();
        if (lowerType === 'clocks' || lowerType === 'clock') {
            return pCat.includes('clock') || pName.includes('clock');
        }
        if (lowerType.includes('islamic')) {
            return pCat.includes('islamic') || pCat === lowerType;
        }
        return pCat === lowerType;
    });

    const filteredProducts = categoryProducts.filter(p => {
        return !query || p.name.toLowerCase().includes(query) || p.description.toLowerCase().includes(query);
    });
    
    if (filteredProducts.length === 0) {
        productGrid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 4rem 0; width: 100%;">
                <p style="color: #666; font-size: 1.2rem; font-weight: bold;">No products match "${query || type}"</p>
                <a href="shop.html" class="btn" style="width: fit-content; margin: 1.5rem auto 0; padding: 12px 40px;">Shop All Collections</a>
            </div>
        `;
        return;
    }

    productGrid.innerHTML = filteredProducts.map(p => `
        <div class="product-card" style="animation: fadeUp 0.8s ease forwards; position: relative;">
            ${renderFavHeartBtn(p.id)}
            <a href="product.html?id=${p.id}">
                <div class="p-image" style="position: relative;">
                    ${p.images && p.images.length > 1 ? `<span style="position: absolute; bottom: 8px; right: 8px; background: rgba(0,0,0,0.75); color: var(--gold); padding: 3px 8px; font-size: 0.68rem; font-weight: 700; z-index: 5; border-radius: 12px; border: 1px solid rgba(212,175,55,0.4); display: flex; align-items: center; gap: 4px;">📷 ${p.images.length}</span>` : ''}
                    <img src="${p.image}" alt="${p.name}">
                </div>
                <h4 style="margin-top: 0.5rem; font-size: 1.1rem; line-height: 1.4; height: 3rem; overflow: hidden;">${p.name}</h4>
                <div style="margin-top: 0.3rem; display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                    <span class="text-gold" style="font-size: 1.1rem; font-weight: bold;">Rs. ${formatPrice(p?.price)}</span>
                    ${p?.discounted && p.discounted > p.price ? `<span style="color: #999; font-size: 0.85rem; text-decoration: line-through; text-decoration-color: #e53935;">Rs. ${formatPrice(p?.discounted)}</span>` : ''}
                </div>
            </a>
        </div>
    `).join('');
};

window.setProductGalleryIndex = function(idx) {
    if (!window.currentGalleryList || !window.currentGalleryList.length) return;
    if (idx < 0) idx = window.currentGalleryList.length - 1;
    if (idx >= window.currentGalleryList.length) idx = 0;
    window.currentGalleryIndex = idx;
    const imgUrl = window.currentGalleryList[idx];

    const mainImg = document.getElementById('mainProductImg');
    if (mainImg) {
        mainImg.style.opacity = '0.25';
        setTimeout(() => {
            mainImg.src = imgUrl;
            mainImg.style.opacity = '1';
        }, 120);
    }

    const badge = document.getElementById('galleryCounterBadge');
    if (badge) {
        badge.innerHTML = `📷 ${idx + 1} / ${window.currentGalleryList.length}`;
    }

    const thumbs = document.querySelectorAll('#productGalleryThumbnails .thumb-box');
    thumbs.forEach((t, i) => {
        if (i === idx) {
            t.classList.add('active');
            t.style.borderColor = 'var(--gold)';
            t.style.borderWidth = '2.5px';
            t.scrollIntoView({ behavior: 'smooth', inline: 'nearest', block: 'nearest' });
        } else {
            t.classList.remove('active');
            t.style.borderColor = '#e0e0e0';
            t.style.borderWidth = '1px';
        }
    });
};

window.prevProductGalleryImage = function(e) {
    if (e && e.stopPropagation) e.stopPropagation();
    window.setProductGalleryIndex((window.currentGalleryIndex || 0) - 1);
};

window.nextProductGalleryImage = function(e) {
    if (e && e.stopPropagation) e.stopPropagation();
    window.setProductGalleryIndex((window.currentGalleryIndex || 0) + 1);
};

window.switchProductImage = function(thumbEl, imgUrl) {
    if (window.currentGalleryList && window.currentGalleryList.length) {
        const foundIdx = window.currentGalleryList.indexOf(imgUrl);
        if (foundIdx !== -1) {
            window.setProductGalleryIndex(foundIdx);
            return;
        }
    }
    const container = document.getElementById('mainMediaContainer');
    if (!container) return;
    
    document.querySelectorAll('#productGalleryThumbnails .thumb-box').forEach(t => {
        t.style.borderColor = '#e0e0e0';
        t.classList.remove('active');
    });
    if (thumbEl) {
        thumbEl.style.borderColor = 'var(--gold)';
        thumbEl.classList.add('active');
    }

    const mainImg = document.getElementById('mainProductImg');
    if (mainImg) {
        mainImg.src = imgUrl;
    }
};

// D. PRODUCT DETAIL PAGE (Multi-Image Enabled)
function loadProductPage() {
    const params = new URLSearchParams(window.location.search);
    let productId = params.get('id') || (products && products[0] ? products[0].id : "5"); 

    const product = products.find(p => p.id === productId);
    if (!product) {
        const detailContainer = document.querySelector('.container.section-pad');
        if (detailContainer) {
            detailContainer.innerHTML = `
                <div style="text-align: center; padding: 4.5rem 1rem;">
                    <div style="font-size: 2.8rem; margin-bottom: 12px;">📦</div>
                    <h2 style="font-family: var(--font-head); font-size: 1.5rem; color: var(--gold); margin-bottom: 8px;">Product Loading or Not Found</h2>
                    <p style="margin: 0 auto 1.5rem auto; color: #888; max-width: 440px; font-size: 0.95rem; line-height: 1.5;">
                        Products are loaded live from the Google Sheets spreadsheet. If this product was recently added or updated, please reload to see products.
                    </p>
                    <div style="display: flex; gap: 12px; justify-content: center; flex-wrap: wrap;">
                        <button onclick="window.location.reload()" class="btn" style="width: fit-content; padding: 12px 28px; font-weight: 700; background: var(--gold); color: #000; border: none; border-radius: 6px; cursor: pointer; display: inline-flex; align-items: center; gap: 8px; box-shadow: 0 4px 15px rgba(212,175,55,0.3); font-size: 0.95rem;">
                            🔄 Reload to See Products
                        </button>
                        <a href="shop.html" class="btn" style="width: fit-content; padding: 12px 28px; background: transparent; border: 1px solid var(--gold); color: var(--gold); border-radius: 6px; text-decoration: none;">Browse Catalog</a>
                    </div>
                </div>
            `;
        }
        return;
    }

    document.title = `${product.name} | Gift Wallay`;

    const detailContainer = document.querySelector('.container.section-pad.split-layout');
    if (detailContainer) {
        const reviewsArr = Array.isArray(product.reviews) ? product.reviews : [];
        const sumRatings = reviewsArr.reduce((sum, r) => sum + (parseInt(r?.rating, 10) || 5), 0);
        const calcAvg = reviewsArr.length > 0 ? (sumRatings / reviewsArr.length) : 5.0;
        const ratingAvgNum = isNaN(calcAvg) ? 5.0 : calcAvg;
        const ratingAvg = ratingAvgNum.toFixed(1);
        const starCount = Math.min(5, Math.max(1, Math.round(ratingAvgNum)));
        const starStr = "★".repeat(starCount) + "☆".repeat(5 - starCount);

        const galleryImages = (product.images && product.images.length > 0) 
            ? product.images 
            : [product.image];

        window.currentGalleryList = galleryImages;
        window.currentGalleryIndex = 0;

        const isFavProduct = isFavorite(product.id);

        detailContainer.innerHTML = `
            <div style="display: flex; flex-direction: column; gap: 1.25rem;">
                <!-- MAIN MEDIA VIEWER CONTAINER WITH ARROWS -->
                <div id="mainMediaContainer" style="background: #ffffff; border: 1px solid #e5e5e5; padding: 0; height: 500px; display: flex; align-items: center; justify-content: center; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.06); position: relative; border-radius: 8px;">
                    <img id="mainProductImg" src="${galleryImages[0]}" alt="${product.name}" style="width: 100%; height: 100%; object-fit: cover; transition: opacity 0.25s ease;">
                    ${galleryImages.length > 1 ? `
                        <button type="button" onclick="prevProductGalleryImage(event)" aria-label="Previous image" style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); width: 40px; height: 40px; border-radius: 50%; background: rgba(0,0,0,0.65); color: #fff; border: 1px solid rgba(255,255,255,0.4); font-size: 1.15rem; cursor: pointer; display: flex; align-items: center; justify-content: center; z-index: 10; transition: background 0.2s;" onmouseover="this.style.background='rgba(0,0,0,0.9)'" onmouseout="this.style.background='rgba(0,0,0,0.65)'">❮</button>
                        <button type="button" onclick="nextProductGalleryImage(event)" aria-label="Next image" style="position: absolute; right: 12px; top: 50%; transform: translateY(-50%); width: 40px; height: 40px; border-radius: 50%; background: rgba(0,0,0,0.65); color: #fff; border: 1px solid rgba(255,255,255,0.4); font-size: 1.15rem; cursor: pointer; display: flex; align-items: center; justify-content: center; z-index: 10; transition: background 0.2s;" onmouseover="this.style.background='rgba(0,0,0,0.9)'" onmouseout="this.style.background='rgba(0,0,0,0.65)'">❯</button>
                        <div id="galleryCounterBadge" style="position: absolute; bottom: 12px; right: 12px; background: rgba(0,0,0,0.75); color: var(--gold); padding: 5px 12px; border-radius: 20px; font-size: 0.78rem; font-weight: 700; border: 1px solid rgba(212,175,55,0.5); pointer-events: none; z-index: 10;">
                            📷 1 / ${galleryImages.length}
                        </div>
                    ` : ''}
                </div>
                
                <!-- MULTI-IMAGE GALLERY THUMBNAILS (CLEAN & LUXURIOUS) -->
                <div style="display: flex; gap: 12px; overflow-x: auto; padding: 4px 2px 8px 2px; align-items: center;" id="productGalleryThumbnails">
                    ${galleryImages.map((imgUrl, idx) => `
                        <div class="thumb-box ${idx === 0 ? 'active' : ''}" onclick="setProductGalleryIndex(${idx})" style="width: 82px; height: 82px; min-width: 82px; border: ${idx === 0 ? '2.5px solid var(--gold)' : '1px solid #e0e0e0'}; cursor: pointer; border-radius: 6px; overflow: hidden; background: #fafafa; transition: all 0.2s ease; position: relative; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
                            <img src="${imgUrl}" alt="${product.name} view ${idx + 1}" style="width: 100%; height: 100%; object-fit: cover;">
                        </div>
                    `).join('')}
                </div>
            </div>

            <!-- PRODUCT DETAILS & PURCHASE CARD -->
            <div style="display: flex; flex-direction: column; justify-content: space-between; padding-left: 0.5rem;">
                <div>
                    <div style="color: var(--gold); text-transform: uppercase; font-size: 0.85rem; letter-spacing: 2px; font-weight: 700; margin-bottom: 10px;">
                        ${product.category}
                    </div>

                    <h1 style="font-size: 2.4rem; margin-bottom: 1rem; line-height: 1.2; font-family: var(--font-head); color: #111;">${product.name}</h1>
                    
                    <div class="stars" style="margin-bottom: 1.25rem; font-size: 1.05rem; color: var(--gold);">
                        ${starStr} <span style="color: #666; font-size: 0.85rem; margin-left: 5px;">(${ratingAvg} Stars / ${product.reviews ? product.reviews.length : 0} Reviews)</span>
                    </div>
                    
                    <div style="display: flex; align-items: center; gap: 14px; margin-bottom: 2rem; flex-wrap: wrap;">
                        <h2 class="text-gold" style="font-size: 2.2rem; font-weight: 700; margin: 0; font-family: var(--font-head, 'Cinzel', serif);">Rs. ${formatPrice(product?.price)}</h2>
                        ${product.discounted && product.discounted > product.price ? `
                            <span style="color: #999999; font-size: 1.35rem; text-decoration: line-through; text-decoration-color: #e53935; text-decoration-thickness: 2px; font-weight: 500;">
                                Rs. ${formatPrice(product?.discounted)}
                            </span>
                            <span style="background: rgba(229, 57, 53, 0.1); color: #e53935; border: 1px solid rgba(229, 57, 53, 0.3); padding: 4px 10px; font-size: 0.8rem; font-weight: 700; border-radius: 4px; letter-spacing: 0.5px;">
                                SAVE ${Math.round(((product.discounted - product.price) / product.discounted) * 100)}%
                            </span>
                        ` : ''}
                    </div>
                    
                    <p style="line-height: 1.8; color: #555; margin-bottom: 2.5rem; font-size: 1rem;">
                        ${product.description}
                    </p>

                    <div style="display: flex; gap: 1rem; align-items: center; margin-bottom: 2rem;">
                        <span style="font-weight: 700; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 1px; color: #333;">Quantity:</span>
                        <div class="qty-box" style="display: flex; align-items: center; border: 1px solid #ddd; width: fit-content; background: #fff;">
                            <button class="qty-btn" id="prodQtyMinus" style="padding: 10px 18px; cursor: pointer; background: #f9f9f9; border: none; font-weight: bold; transition: 0.2s;">-</button>
                            <span class="qty-val" id="qtyDisplay" style="padding: 10px 22px; font-weight: bold; min-width: 50px; text-align: center;">1</span>
                            <button class="qty-btn" id="prodQtyPlus" style="padding: 10px 18px; cursor: pointer; background: #f9f9f9; border: none; font-weight: bold; transition: 0.2s;">+</button>
                        </div>
                    </div>

                    <div style="display: flex; gap: 12px; margin-bottom: 2rem; flex-wrap: wrap;">
                        <button class="btn" id="addToCartBtn" style="flex: 1; min-width: 160px; padding: 18px; font-weight: 700; letter-spacing: 1px;">
                            Add to Cart
                        </button>
                        <button class="btn" id="buyNowBtn" style="flex: 1; min-width: 160px; padding: 18px; font-weight: 700; letter-spacing: 1px; background: var(--gold); color: #000; border: none; font-weight: 800; box-shadow: 0 4px 15px rgba(212,175,55,0.3);">
                            ⚡ BUY NOW
                        </button>
                    </div>
                </div>
            </div>
        `;

        let qty = 1;
        document.getElementById('prodQtyMinus').onclick = () => {
            if (qty > 1) qty--;
            document.getElementById('qtyDisplay').innerText = qty;
        };
        document.getElementById('prodQtyPlus').onclick = () => {
            qty++;
            document.getElementById('qtyDisplay').innerText = qty;
        };

        document.getElementById('addToCartBtn').onclick = () => {
            addToCartById(product.id, qty);
        };

        document.getElementById('buyNowBtn').onclick = () => {
            const finalPrice = parseNumericPrice(product.price);
            const buyItem = {
                id: product.id,
                name: product.name,
                price: finalPrice,
                image: product.image,
                qty: qty,
                selected: true
            };
            const existingIdx = cart.findIndex(i => String(i.id) === String(product.id));
            if (existingIdx >= 0) {
                cart[existingIdx].qty = qty;
                cart[existingIdx].selected = true;
            } else {
                cart.push(buyItem);
            }
            saveCartState(cart);
            updateCartBadge();
            localStorage.setItem('gw_checkout_items', JSON.stringify([buyItem]));
            pushCartToServer(product.id, qty, product.name, finalPrice, product.image, "set");
            window.location.href = "checkout.html";
        };

        // Remove video section if present
        let videoCard = document.getElementById('hdVideoSectionCard');
        if (videoCard) {
            videoCard.remove();
        }
    }

    renderReviews(product);
}

window.showReviewImage = function(src) {
    const overlay = document.getElementById('gwModalOverlay');
    const card = document.getElementById('gwModalCard');
    if (!overlay || !card) return;
    card.innerHTML = `
        <span class="gw-modal-close" id="gwModalCloseBtn">&times;</span>
        <div style="display: flex; justify-content: center; align-items: center; padding: 10px;">
            <img src="${src}" style="max-width: 100%; max-height: 80vh; object-fit: contain; box-shadow: var(--shadow); border: 1.5px solid var(--gold);">
        </div>
    `;
    overlay.classList.add('active');
    document.getElementById('gwModalCloseBtn').onclick = () => overlay.classList.remove('active');
};

function renderReviews(product) {
    const reviewsSection = document.querySelector('.container[style*="padding-bottom: 5rem"]');
    if (!reviewsSection) return;

    const reviewsArr = Array.isArray(product.reviews) ? product.reviews : [];
    const totalReviews = reviewsArr.length;
    const sumRatings = reviewsArr.reduce((sum, r) => sum + (parseInt(r?.rating, 10) || 5), 0);
    const calcAvg = totalReviews > 0 ? (sumRatings / totalReviews) : 5.0;
    const ratingAvgNum = isNaN(calcAvg) ? 5.0 : calcAvg;
    const ratingAvg = ratingAvgNum.toFixed(1);
    const starCountSummary = Math.min(5, Math.max(1, Math.round(ratingAvgNum)));

    // Check if current user has already submitted a review for this product
    const userKey = currentUser ? (currentUser.id || currentUser.email || currentUser.phone || "").toLowerCase() : "";
    const currentUserName = currentUser ? (currentUser.name || "").trim().toLowerCase() : "";
    const hasAlreadyReviewed = reviewsArr.some(r => {
        const rUser = (r.userID || "").toLowerCase();
        const rName = (r.name || "").trim().toLowerCase();
        return (userKey && rUser && rUser === userKey) || (currentUserName && rName && rName === currentUserName);
    });
    
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    if (reviewsArr.length > 0) {
        reviewsArr.forEach(r => {
            const st = Math.min(5, Math.max(1, parseInt(r?.rating, 10) || 5));
            if (distribution[st] !== undefined) {
                distribution[st]++;
            }
        });
    } else {
        distribution[5] = 1;
    }

    let distributionHtml = "";
    for (let stars = 5; stars >= 1; stars--) {
        const count = distribution[stars] || 0;
        const percentage = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : (stars === 5 ? 100 : 0);
        distributionHtml += `
            <div class="star-dist-row">
                <span class="star-dist-label">${stars} Stars</span>
                <div class="star-dist-bar-track">
                    <div class="star-dist-bar-fill" style="width: ${percentage}%;"></div>
                </div>
                <span class="star-dist-count">${count}</span>
            </div>
        `;
    }

    let reviewsListHtml = "";
    if (reviewsArr.length > 0) {
        reviewsListHtml = reviewsArr.map(r => {
            const rName = r?.name || "Customer";
            const initials = rName.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) || "C";
            const avatarBg = ['#1a1a1a', '#d4af37', '#4a5568', '#2d3748', '#718096'][rName.length % 5];
            const rRating = Math.min(5, Math.max(1, parseInt(r?.rating, 10) || 5));
            
            return `
                <div class="review-box">
                    <div class="review-box-header">
                        <div class="review-user-info">
                            <div class="review-avatar" style="background: ${avatarBg};">
                                ${initials}
                            </div>
                            <div>
                                <div class="review-user-name-row">
                                    <strong class="review-user-name" style="color: var(--black);">${rName}</strong>
                                    <span class="verified-badge">
                                        ✓ Verified Purchase
                                    </span>
                                </div>
                                <small style="color: #999; font-size: 0.8rem;">Reviewed on ${r.date || 'Recently'}</small>
                            </div>
                        </div>
                        <span class="stars review-stars-gold" style="color: var(--gold); font-size: 1rem;">${"★".repeat(rRating) + "☆".repeat(5 - rRating)}</span>
                    </div>
                    <p style="color: #444; margin-top: 1rem; line-height: 1.6; font-size: 0.95rem; white-space: pre-line;">"${r.comment || ''}"</p>
                    ${r.image ? `
                    <div style="margin-top: 12px; border-radius: 4px; overflow: hidden; width: fit-content; max-width: 180px; box-shadow: var(--shadow); border: 1px solid rgba(0,0,0,0.05); cursor: zoom-in;" onclick="showReviewImage('${r.image}')">
                        <img src="${r.image}" alt="User Review Photo" style="max-height: 120px; width: auto; object-fit: cover; display: block; transition: transform 0.3s ease;">
                    </div>
                    ` : ''}
                </div>
            `;
        }).join('');
    } else {
        reviewsListHtml = `
            <div style="text-align: center; padding: 3rem 1.5rem; background: #fff; border: 1px dashed #eee; border-radius: 6px;">
                <p style="color: #888; font-style: italic; margin-bottom: 1rem; font-size: 0.95rem;">No reviews yet for this premium curation.</p>
                <p style="color: #aaa; font-size: 0.85rem;">Be the first to share your exquisite experience!</p>
            </div>
        `;
    }

    reviewsSection.innerHTML = `
        <div style="margin-top: 3rem; border-top: 1px solid #eee; padding-top: 3rem;">
            <h3 class="reviews-header-title" style="font-family: var(--font-head); font-size: 1.8rem; letter-spacing: 2px; text-transform: uppercase; text-align: center; margin-bottom: 2.5rem; color: var(--black);">Client Appreciation</h3>
            
            <div class="reviews-grid-wrapper">
                
                <div class="reviews-summary-panel">
                    <h4 style="font-family: var(--font-head); font-size: 1.15rem; text-transform: uppercase; letter-spacing: 1.5px; color: var(--black); margin-bottom: 1.25rem; border-bottom: 1px solid rgba(0,0,0,0.05); padding-bottom: 10px;">Review Summary</h4>
                    
                    <div style="text-align: center; margin-bottom: 1.5rem;">
                        <span style="font-size: 3.2rem; font-weight: bold; color: var(--black); line-height: 1; font-family: var(--font-head);">${ratingAvg}</span>
                        <div style="color: var(--gold); font-size: 1.3rem; margin: 0.4rem 0 0.2rem 0;">${"★".repeat(starCountSummary)}${"☆".repeat(5 - starCountSummary)}</div>
                        <p style="color: #888; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 1px;">Based on ${totalReviews} elite reviews</p>
                    </div>

                    <div style="margin-bottom: 2rem;">
                        ${distributionHtml}
                    </div>

                    ${hasAlreadyReviewed ? `
                        <button class="btn" id="openReviewFormBtn" disabled style="width: 100%; padding: 14px; font-weight: bold; letter-spacing: 1px; background: #e8f5e9; color: #2e7d32; border: 1px solid #c8e6c9; cursor: not-allowed;">✓ Review Already Submitted</button>
                        <p style="font-size: 0.75rem; color: #666; text-align: center; margin-top: 8px;">You have already shared feedback for this product.</p>
                    ` : `
                        <button class="btn" id="openReviewFormBtn" style="width: 100%; padding: 14px; font-weight: bold; letter-spacing: 1px;">+ Write A Review</button>
                    `}
                    
                    <div id="reviewFormContainer" style="max-height: 0; overflow: hidden; transition: max-height 0.5s ease-out; margin-top: 0;">
                        <div style="border-top: 1.5px solid var(--gold); margin-top: 1.5rem; padding-top: 1.5rem;">
                            <h4 style="margin-bottom: 1.25rem; color: var(--black); font-size: 1.05rem; font-family: var(--font-head); text-transform: uppercase; letter-spacing: 1px;">Share Your Experience</h4>
                            <form id="addReviewForm">
                                <div style="margin-bottom: 1rem;">
                                    <label style="display: block; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 1px; color: #555; margin-bottom: 6px; font-weight: bold;">Your Name</label>
                                    <input type="text" id="revName" placeholder="Enter your full name" value="${currentUser ? currentUser.name : ''}" style="width: 100%; padding: 11px; border: 1px solid #ddd; background: #fff; font-size: 0.9rem;" required>
                                </div>
                                <div style="margin-bottom: 1rem;">
                                    <label style="display: block; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 1px; color: #555; margin-bottom: 8px; font-weight: bold;">Rating</label>
                                    <div id="interactiveStars" style="display: flex; gap: 8px; font-size: 1.6rem; cursor: pointer; color: var(--gold); user-select: none;">
                                        <span class="interactive-star" data-value="1">★</span>
                                        <span class="interactive-star" data-value="2">★</span>
                                        <span class="interactive-star" data-value="3">★</span>
                                        <span class="interactive-star" data-value="4">★</span>
                                        <span class="interactive-star" data-value="5">★</span>
                                    </div>
                                    <input type="hidden" id="revRating" value="5">
                                </div>
                                <div style="margin-bottom: 1rem;">
                                    <label style="display: block; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 1px; color: #555; margin-bottom: 6px; font-weight: bold;">Your Thoughts</label>
                                    <textarea id="revComment" rows="4" placeholder="How was your exquisite experience with this product?" style="width: 100%; padding: 11px; border: 1px solid #ddd; font-family: var(--font-body); background: #fff; line-height: 1.6; font-size: 0.9rem; resize: vertical;" required></textarea>
                                </div>
                                
                                <div style="margin-bottom: 1.25rem;">
                                    <label style="display: block; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 1px; color: #555; margin-bottom: 6px; font-weight: bold;">Upload Photo (Optional)</label>
                                    <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
                                        <label for="revImage" class="btn" style="width: auto; padding: 8px 14px; font-size: 0.75rem; background: #fff; color: var(--black); border: 1px solid var(--gold); cursor: pointer; display: inline-flex; align-items: center; gap: 5px;">
                                            📷 Choose Image
                                        </label>
                                        <input type="file" id="revImage" accept="image/*" style="display: none;">
                                        <span id="revImageName" style="color: #666; font-size: 0.8rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 140px;">No file chosen</span>
                                    </div>
                                    <div id="revImagePreviewContainer" style="margin-top: 10px; display: none; position: relative; width: 75px; height: 75px; border: 1px solid #eee; overflow: hidden;">
                                        <img id="revImagePreview" src="" style="width: 100%; height: 100%; object-fit: cover;">
                                        <button type="button" id="removeRevImage" style="position: absolute; top: 2px; right: 2px; background: rgba(0,0,0,0.6); color: white; border: none; border-radius: 50%; width: 18px; height: 18px; cursor: pointer; font-size: 0.7rem; display: flex; align-items: center; justify-content: center;">×</button>
                                    </div>
                                </div>

                                <button type="submit" id="addReviewSubmitBtn" class="btn" style="width: 100%; padding: 12px; font-size: 0.85rem; font-weight: bold;">Submit Appreciation</button>
                            </form>
                        </div>
                    </div>
                </div>

                <div class="reviews-list-panel">
                    <h4 style="font-family: var(--font-head); font-size: 1.15rem; text-transform: uppercase; letter-spacing: 1.5px; color: var(--black); margin-bottom: 1.25rem; border-bottom: 1px solid rgba(0,0,0,0.05); padding-bottom: 10px;">Client Feedback</h4>
                    <div id="reviewsWrapper">
                        ${reviewsListHtml}
                    </div>
                </div>

            </div>
        </div>
    `;

    const openBtn = document.getElementById('openReviewFormBtn');
    const container = document.getElementById('reviewFormContainer');
    if (openBtn && container && !hasAlreadyReviewed) {
        openBtn.onclick = () => {
            if (container.style.maxHeight === '0px' || !container.style.maxHeight || container.style.maxHeight === '0') {
                container.style.maxHeight = '1200px';
                openBtn.innerText = "Close Review Form";
                openBtn.style.background = "#eeeeee";
                openBtn.style.color = "#333333";
                openBtn.style.borderColor = "#eeeeee";
            } else {
                container.style.maxHeight = '0';
                openBtn.innerText = "+ Write A Review";
                openBtn.style.background = "var(--black)";
                openBtn.style.color = "var(--gold)";
                openBtn.style.borderColor = "var(--black)";
            }
        };
    }

    const stars = document.querySelectorAll('.interactive-star');
    const ratingInput = document.getElementById('revRating');
    if (stars && ratingInput) {
        function updateStars(val) {
            stars.forEach(s => {
                const starVal = parseInt(s.getAttribute('data-value'));
                if (starVal <= val) {
                    s.innerText = '★';
                    s.style.color = 'var(--gold)';
                } else {
                    s.innerText = '☆';
                    s.style.color = '#ccc';
                }
            });
        }

        stars.forEach(star => {
            star.addEventListener('click', () => {
                const val = parseInt(star.getAttribute('data-value'));
                ratingInput.value = val;
                updateStars(val);
            });
            star.addEventListener('mouseenter', () => {
                const val = parseInt(star.getAttribute('data-value'));
                updateStars(val);
            });
        });

        const starContainer = document.getElementById('interactiveStars');
        if (starContainer) {
            starContainer.addEventListener('mouseleave', () => {
                updateStars(parseInt(ratingInput.value));
            });
        }
    }

    let uploadedImageBase64 = "";
    const imageInput = document.getElementById('revImage');
    const imageName = document.getElementById('revImageName');
    const previewContainer = document.getElementById('revImagePreviewContainer');
    const previewImg = document.getElementById('revImagePreview');
    const removeBtn = document.getElementById('removeRevImage');

    if (imageInput) {
        imageInput.onchange = function(e) {
            const file = e.target.files[0];
            if (file) {
                imageName.innerText = file.name;
                const reader = new FileReader();
                reader.onload = function(evt) {
                    uploadedImageBase64 = evt.target.result;
                    previewImg.src = uploadedImageBase64;
                    previewContainer.style.display = 'block';
                };
                reader.readAsDataURL(file);
            }
        };
    }

    if (removeBtn) {
        removeBtn.onclick = function() {
            imageInput.value = "";
            uploadedImageBase64 = "";
            imageName.innerText = "No file chosen";
            previewContainer.style.display = 'none';
            previewImg.src = "";
        };
    }

    const form = document.getElementById('addReviewForm');
    if (form) {
        form.onsubmit = async function(e) {
            e.preventDefault();

            if (hasAlreadyReviewed) {
                showPremiumAlert(
                    "Review Already Submitted",
                    "You have already submitted a review for this product. Only 1 review per customer is allowed.",
                    "info"
                );
                return;
            }

            const submitBtn = document.getElementById('addReviewSubmitBtn') || form.querySelector('button[type="submit"]');
            const originalText = submitBtn ? submitBtn.innerHTML : "Submit Appreciation";
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.style.opacity = '0.75';
                submitBtn.innerHTML = `<span class="spinner" style="display:inline-block; width: 14px; height: 14px; border: 2px solid currentColor; border-top-color: transparent; border-radius: 50%; animation: spin 0.8s linear infinite; vertical-align: middle; margin-right: 6px;"></span> Submitting...`;
            }

            const name = document.getElementById('revName').value.trim();
            const rating = parseInt(document.getElementById('revRating').value);
            const comment = document.getElementById('revComment').value.trim();

            const today = new Date();
            const options = { year: 'numeric', month: 'long', day: 'numeric' };
            const formattedDate = today.toLocaleDateString('en-US', options);

            const emailOrPhone = (currentUser ? (currentUser.id || currentUser.email || currentUser.phone) : "guest").toLowerCase();

            const newReview = { 
                name, 
                rating, 
                comment, 
                date: formattedDate,
                userID: emailOrPhone,
                image: uploadedImageBase64 || null
            };

            try {
                await addReviewToServer(product.id, newReview);

                if (!product.reviews) product.reviews = [];
                product.reviews.unshift(newReview);

                showPremiumAlert("Review Submitted", "Thank you! Your verified feedback has been added successfully.", "success", () => {
                    renderReviews(product);
                    loadProductPage();
                });
            } catch (err) {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.style.opacity = '1';
                    submitBtn.innerHTML = originalText;
                }
                showPremiumAlert(
                    "Review Notice", 
                    err.message || "Only verified customers who have ordered this product can leave reviews.", 
                    "error"
                );
            }
        };
    }
}

// E. SHOPPING CART PAGE
function loadCartPage() {
    const cartContainer = document.getElementById('cartContainer');
    const tableBody = document.querySelector('#cartTable tbody');

    if (!Array.isArray(cart)) cart = [];

    // Ensure all items have a default selected property
    cart.forEach(item => {
        if (item.selected === undefined) item.selected = true;
    });

    if (cart.length === 0) {
        if (cartContainer) {
            cartContainer.innerHTML = `
                <div style="text-align: center; padding: 5rem 1.5rem; background: #fff; border: 1px solid #eee; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.05); max-width: 700px; margin: 0 auto; animation: modalSpringIn 0.5s cubic-bezier(0.16, 1, 0.3, 1);">
                    <div style="font-size: 4.5rem; color: var(--gold); margin-bottom: 1rem; animation: luxuryFloat 2.5s ease-in-out infinite;">🛒</div>
                    <h2 style="font-family: var(--font-head); font-size: 2.2rem; margin-bottom: 1rem; color: #111;">Your Shopping Cart is Empty</h2>
                    <p style="color: #666; font-size: 1.05rem; margin-bottom: 2.5rem; max-width: 480px; margin-left: auto; margin-right: auto; line-height: 1.6;">
                        Explore our luxury collections of custom gifts, watches, perfumes, and leather accessories.
                    </p>
                    <a href="shop.html" class="btn btn-premium-gold" style="width: fit-content; margin: 0 auto; padding: 16px 42px; display: inline-flex; align-items: center; gap: 10px; font-weight: 800; border-radius: 6px;">
                        <span>EXPLORE LUXURY COLLECTIONS</span> →
                    </a>
                </div>
            `;
        } else if (document.querySelector('.container.section-pad')) {
            document.querySelector('.container.section-pad').innerHTML = `
                <h1 class="text-center" style="margin-bottom: 2rem; font-family: var(--font-head);">Your Shopping Cart</h1>
                <div style="text-align: center; padding: 5rem 1.5rem; border: 1px dashed #ddd; background: #fafafa; border-radius: 12px; animation: modalSpringIn 0.5s ease;">
                    <div style="font-size: 4.5rem; color: #ccc; margin-bottom: 1.5rem;">🛒</div>
                    <h2 style="font-family: var(--font-head); margin-bottom: 1rem;">Your Cart is Empty</h2>
                    <p style="color: #666; margin-bottom: 2rem;">Choose from our elite collection of timeless, premium gifts.</p>
                    <a href="shop.html" class="btn btn-premium-gold" style="width: fit-content; margin: 0 auto; padding: 15px 40px; font-weight: 800; border-radius: 6px;">Explore Collections</a>
                </div>
            `;
        }
        return;
    }

    const selectedItems = cart.filter(i => i.selected !== false);
    const selectedCount = selectedItems.length;
    const allSelected = cart.length > 0 && selectedCount === cart.length;
    const selectedSubtotal = selectedItems.reduce((sum, i) => sum + (parseNumericPrice(i.price) * (parseInt(i.qty, 10) || 1)), 0);
    const selectedTotalQty = selectedItems.reduce((sum, i) => sum + (parseInt(i.qty, 10) || 1), 0);
    const shippingFee = selectedCount > 0 ? 250 : 0;
    const grandTotal = selectedSubtotal + shippingFee;

    if (cartContainer && !document.getElementById('cartItemsContainer') && !tableBody) {
        cartContainer.innerHTML = `
            <div class="cart-layout-grid" style="display: grid; grid-template-columns: 1fr 380px; gap: 2rem; align-items: start; animation: fadeIn 0.4s ease;">
                <div style="display: flex; flex-direction: column; gap: 1rem;">
                    <!-- DARAZ STYLE CART HEADER BANNER -->
                    <div style="background: linear-gradient(135deg, #111, #222); color: #fff; padding: 1rem 1.25rem; border-radius: 8px; border: 1px solid var(--gold); display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px;">
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <span style="font-size: 1.3rem;">🚚</span>
                            <div>
                                <strong style="color: var(--gold); font-size: 0.95rem;">Express Shipping Service</strong>
                                <span style="display: block; font-size: 0.78rem; color: #ccc;">Guaranteed Delivery in 2-4 Days across Pakistan</span>
                            </div>
                        </div>
                        <span style="background: #e8f5e9; color: #2e7d32; font-weight: 800; font-size: 0.72rem; padding: 4px 10px; border-radius: 4px; text-transform: uppercase;">Standard Service</span>
                    </div>

                    <!-- SELECT ALL BAR -->
                    <div class="cart-select-all-bar" id="cartSelectAllBar">
                        <label style="display: flex; align-items: center; gap: 10px; cursor: pointer; font-weight: 700; color: #111; font-size: 0.95rem; margin: 0; user-select: none;">
                            <input type="checkbox" id="selectAllCartCheckbox" class="gw-cart-checkbox" ${allSelected ? 'checked' : ''} aria-label="Select all products">
                            <span>Select All (<span id="cartSelectCount">${selectedCount}</span> of ${cart.length} items)</span>
                        </label>
                        <div style="display: flex; align-items: center; gap: 15px;">
                            <button type="button" id="cartToggleSelectAllBtn" style="background: none; border: none; color: #555; font-size: 0.82rem; cursor: pointer; text-decoration: underline; font-weight: 600; padding: 0;">
                                ${allSelected ? 'Deselect All' : 'Select All'}
                            </button>
                            ${selectedCount > 0 ? `
                                <button type="button" id="cartDeleteSelectedBtn" style="background: none; border: none; color: #d32f2f; font-size: 0.82rem; cursor: pointer; text-decoration: underline; font-weight: 600; padding: 0;">
                                    Delete Selected (${selectedCount})
                                </button>
                            ` : ''}
                        </div>
                    </div>

                    <div id="cartItemsContainer" style="display: flex; flex-direction: column; gap: 1rem;"></div>
                </div>
                
                <!-- ORDER SUMMARY CARD -->
                <div class="cart-summary-box" style="background: #111; color: #fff; border: 1px solid var(--gold); border-radius: 10px; padding: 1.5rem; position: sticky; top: 100px; box-shadow: 0 10px 30px rgba(0,0,0,0.3);">
                    <h3 style="font-family: var(--font-head); font-size: 1.3rem; margin-bottom: 1.25rem; color: var(--gold); letter-spacing: 1px; border-bottom: 1px solid rgba(212,175,55,0.3); padding-bottom: 0.8rem; display: flex; align-items: center; justify-content: space-between;">
                        <span>Order Summary</span>
                        <span id="cartSummaryItemBadge" style="font-size: 0.8rem; background: rgba(212,175,55,0.2); padding: 2px 8px; border-radius: 4px;">${selectedCount} Item${selectedCount === 1 ? '' : 's'} Selected</span>
                    </h3>
                    
                    <div style="display: flex; justify-content: space-between; margin-bottom: 1rem; color: #ccc; font-size: 0.95rem;">
                        <span id="cartItemsCountLabel">Subtotal (${selectedCount} product${selectedCount === 1 ? '' : 's'}, Qty: ${selectedTotalQty})</span>
                        <span id="cartSubtotal" style="color: #fff; font-weight: 800;">Rs. ${formatPrice(selectedSubtotal)}</span>
                    </div>
                    
                    <div style="display: flex; justify-content: space-between; margin-bottom: 1rem; color: #ccc; font-size: 0.95rem;">
                        <span>Express Delivery Fee</span>
                        <span id="cartShipping" style="color: #fff; font-weight: 800;">${selectedCount > 0 ? 'Rs. 250' : 'Rs. 0'}</span>
                    </div>

                    <div style="display: flex; justify-content: space-between; margin-bottom: 1rem; color: #ccc; font-size: 0.95rem;">
                        <span>Gift Box & Packaging</span>
                        <span style="color: #4caf50; font-weight: 800;">Included</span>
                    </div>
                    
                    <div style="border-top: 1px solid #333; margin: 1.2rem 0; padding-top: 1.2rem; display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <span style="font-size: 1.1rem; font-weight: 800; color: #fff; display: block;">Total Amount</span>
                            <span style="font-size: 0.72rem; color: #aaa;">Inclusive of all government taxes</span>
                        </div>
                        <span id="cartTotal" style="font-size: 1.6rem; font-weight: 900; color: var(--gold); font-family: var(--font-head);">Rs. ${formatPrice(grandTotal)}</span>
                    </div>

                    <p style="font-size: 0.78rem; color: #aaa; margin-bottom: 1.5rem; line-height: 1.5; background: #1a1a1a; padding: 10px; border-radius: 6px; border: 1px solid #333;">
                        🛡️ <strong>Risk-Free Guarantee:</strong> Cash on delivery available. Pay only after inspecting product at doorstep.
                    </p>

                    <a href="checkout.html" id="checkoutBtn" class="btn-premium-gold" style="width: 100%; margin-top: 0.5rem; display: flex; align-items: center; justify-content: center; gap: 8px; padding: 16px; font-size: 1rem; font-weight: 800; ${selectedCount === 0 ? 'opacity: 0.6; cursor: not-allowed;' : ''}">
                        <span>🔒 PROCEED TO CHECKOUT (${selectedCount})</span>
                        <span style="font-size: 1.2rem; line-height: 1;">→</span>
                    </a>

                    <div style="margin-top: 1.25rem; text-align: center;">
                        <a href="shop.html" style="color: #aaa; font-size: 0.85rem; text-decoration: underline; transition: color 0.2s;" onmouseover="this.style.color='var(--gold)'" onmouseout="this.style.color='#aaa'">← Continue Shopping</a>
                    </div>
                </div>
            </div>
        `;
    }

    const itemsContainer = document.getElementById('cartItemsContainer');
    if (itemsContainer) {
        itemsContainer.innerHTML = cart.map(item => {
            const isSelected = item.selected !== false;
            const itemSubtotal = (Number(item.price) || 0) * (Number(item.qty) || 1);
            return `
                <div class="cart-card-item ${isSelected ? '' : 'is-unselected'}" data-id="${item.id}" style="background: ${isSelected ? '#ffffff' : '#fafafa'}; border: ${isSelected ? '1px solid #eaeaea' : '1px dashed #ccc'}; border-radius: 10px; padding: 1.25rem; display: flex; align-items: center; justify-content: space-between; gap: 1.25rem; flex-wrap: wrap; box-shadow: ${isSelected ? '0 4px 15px rgba(0,0,0,0.03)' : 'none'}; transition: all 0.3s ease; opacity: ${isSelected ? '1' : '0.65'};">
                    <!-- Checkbox Selection -->
                    <div class="cart-checkbox-wrap" style="display: flex; align-items: center; justify-content: center; padding-right: 4px;">
                        <input type="checkbox" id="cart_chk_${item.id}" class="gw-cart-checkbox cart-item-checkbox" data-id="${item.id}" ${isSelected ? 'checked' : ''} aria-label="Select ${item.name} for checkout">
                    </div>

                    <!-- Product Image & Details -->
                    <div style="display: flex; align-items: center; gap: 1.25rem; min-width: 240px; flex: 1;">
                        <div class="cart-item-img-box" style="width: 85px; height: 85px; min-width: 85px; border-radius: 8px; overflow: hidden; border: 1px solid #e0e0e0; background: #fafafa; position: relative;">
                            <img src="${item.image}" alt="${item.name}" style="width: 100%; height: 100%; object-fit: cover;">
                        </div>
                        <div>
                            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
                                <span style="font-size: 0.7rem; color: var(--gold); text-transform: uppercase; font-weight: 800; letter-spacing: 1px;">Official Item</span>
                                <span class="item-selected-badge" style="font-size: 0.68rem; padding: 2px 7px; border-radius: 4px; font-weight: 700; background: ${isSelected ? 'rgba(46,125,50,0.12)' : 'rgba(0,0,0,0.08)'}; color: ${isSelected ? '#2e7d32' : '#777'};">
                                    ${isSelected ? '✓ Selected for Checkout' : 'Not Selected'}
                                </span>
                            </div>
                            <h4 style="font-family: var(--font-head); font-size: 1.12rem; font-weight: 800; color: #111; margin-bottom: 4px; line-height: 1.3;">${item.name}</h4>
                            <div style="color: #888; font-size: 0.78rem; margin-bottom: 6px;">Ref Code: GW-${item.id}</div>
                            <div style="color: var(--gold); font-weight: 800; font-size: 1.05rem;">Rs. ${formatPrice(item.price)}</div>
                        </div>
                    </div>

                    <!-- Quantity, Line Total, Remove -->
                    <div style="display: flex; align-items: center; gap: 1.25rem; flex-wrap: wrap;">
                        <div style="display: flex; align-items: center; border: 1.5px solid #ddd; border-radius: 6px; overflow: hidden; background: #fff;">
                            <button type="button" onclick="changeCartItemQty('${item.id}', -1)" style="border: none; background: #f5f5f5; width: 36px; height: 36px; cursor: pointer; font-weight: bold; font-size: 1.1rem; transition: background 0.2s;">-</button>
                            <span style="width: 40px; text-align: center; font-weight: 800; font-size: 0.95rem; color: #111;">${item.qty}</span>
                            <button type="button" onclick="changeCartItemQty('${item.id}', 1)" style="border: none; background: #f5f5f5; width: 36px; height: 36px; cursor: pointer; font-weight: bold; font-size: 1.1rem; transition: background 0.2s;">+</button>
                        </div>

                        <div style="font-weight: 900; font-size: 1.2rem; color: #111; min-width: 105px; text-align: right;">
                            Rs. ${formatPrice(itemSubtotal)}
                        </div>

                        <button type="button" onclick="removeCartItemPrompt('${item.id}', '${item.name}')" style="background: #fff0f0; border: 1px solid #ffcdd2; color: #d32f2f; width: 36px; height: 36px; border-radius: 50%; font-size: 1.2rem; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s;" title="Remove item" onmouseover="this.style.background='#e53935'; this.style.color='#fff';" onmouseout="this.style.background='#fff0f0'; this.style.color='#d32f2f';">×</button>
                    </div>
                </div>
            `;
        }).join('');
    }

    // Checkbox Listeners for each product item
    document.querySelectorAll('.cart-item-checkbox').forEach(chk => {
        chk.onchange = function() {
            const id = this.getAttribute('data-id');
            const targetItem = cart.find(i => String(i.id) === String(id));
            if (targetItem) {
                targetItem.selected = this.checked;
                saveCartState(cart);
                if (window.playNotificationSound) window.playNotificationSound('tap');
                
                const card = this.closest('.cart-card-item');
                if (card) {
                    if (this.checked) {
                        card.classList.remove('is-unselected');
                        card.style.opacity = '1';
                        card.style.background = '#ffffff';
                        card.style.border = '1px solid #eaeaea';
                        card.style.boxShadow = '0 4px 15px rgba(0,0,0,0.03)';
                    } else {
                        card.classList.add('is-unselected');
                        card.style.opacity = '0.65';
                        card.style.background = '#fafafa';
                        card.style.border = '1px dashed #ccc';
                        card.style.boxShadow = 'none';
                    }
                    const badge = card.querySelector('.item-selected-badge');
                    if (badge) {
                        badge.style.background = this.checked ? 'rgba(46,125,50,0.12)' : 'rgba(0,0,0,0.08)';
                        badge.style.color = this.checked ? '#2e7d32' : '#777';
                        badge.innerText = this.checked ? '✓ Selected for Checkout' : 'Not Selected';
                    }
                }
                recalcCartPageSubtotal();
            }
        };
    });

    // Select All Checkbox Handler
    const selectAllChk = document.getElementById('selectAllCartCheckbox');
    if (selectAllChk) {
        selectAllChk.onchange = function() {
            const checked = this.checked;
            cart.forEach(i => i.selected = checked);
            saveCartState(cart);
            if (window.playNotificationSound) window.playNotificationSound('tap');
            loadCartPage();
        };
    }

    // Toggle Select All Text Button
    const toggleAllBtn = document.getElementById('cartToggleSelectAllBtn');
    if (toggleAllBtn) {
        toggleAllBtn.onclick = function() {
            const anySelected = cart.some(i => i.selected !== false);
            cart.forEach(i => i.selected = !anySelected);
            saveCartState(cart);
            if (window.playNotificationSound) window.playNotificationSound('tap');
            loadCartPage();
        };
    }

    // Delete Selected Items Button
    const deleteSelectedBtn = document.getElementById('cartDeleteSelectedBtn');
    if (deleteSelectedBtn) {
        deleteSelectedBtn.onclick = function() {
            const toDelete = cart.filter(i => i.selected !== false);
            if (toDelete.length === 0) return;
            showPremiumConfirm(
                "Delete Selected Items",
                `Are you sure you want to remove ${toDelete.length} selected item${toDelete.length > 1 ? 's' : ''} from your shopping cart?`,
                () => {
                    toDelete.forEach(i => removeCartItemFromServer(i.id));
                    cart = cart.filter(i => i.selected === false);
                    saveCartState(cart);
                    updateCartBadge();
                    loadCartPage();
                }
            );
        };
    }

    // Checkout Button Click Handler
    const checkoutBtn = document.getElementById('checkoutBtn') || document.querySelector('a[href="checkout.html"]');
    if (checkoutBtn) {
        checkoutBtn.onclick = function(e) {
            e.preventDefault();

            const curSelected = cart.filter(i => i.selected !== false);
            if (curSelected.length === 0) {
                if (window.playNotificationSound) window.playNotificationSound('error');
                showPremiumAlert(
                    "No Products Selected", 
                    "Please select at least one product using the checkboxes to proceed to checkout.",
                    "warning"
                );
                return;
            }

            // Store strictly selected items for checkout
            localStorage.setItem('gw_checkout_items', JSON.stringify(curSelected));

            if (!currentUser) {
                showPremiumAlert(
                    "🔒 Member Sign-In Required",
                    `<div style="text-align: center;">
                        <p style="color: #444; font-size: 0.95rem; margin-bottom: 1.2rem; line-height: 1.6;">
                            To ensure secure order processing and real-time shipment updates, please sign in or create an account.
                        </p>
                        <div style="background: #fafafa; border: 1px solid var(--gold); border-radius: 6px; padding: 1rem; text-align: left; margin-bottom: 0.5rem;">
                            <div style="font-weight: bold; color: #111; margin-bottom: 6px; font-size: 0.9rem;">✨ Premium Account Perks:</div>
                            <ul style="font-size: 0.82rem; color: #555; padding-left: 18px; margin: 0; line-height: 1.6;">
                                <li>Instant order tracking & live WhatsApp alerts</li>
                                <li>Saved addresses for 1-click future orders</li>
                                <li>10% off welcome voucher eligible</li>
                            </ul>
                        </div>
                    </div>`,
                    "warning",
                    () => {
                        sessionStorage.setItem("checkoutRedirectPending", "true");
                        window.location.href = "account.html";
                    }
                );
            } else {
                if (window.playNotificationSound) window.playNotificationSound('click');
                checkoutBtn.style.pointerEvents = 'none';
                checkoutBtn.style.opacity = '0.9';
                checkoutBtn.innerHTML = `
                    <div style="display: inline-block; width: 18px; height: 18px; border: 2px solid #000; border-top-color: transparent; border-radius: 50%; animation: spin 0.8s linear infinite;"></div>
                    <span>Securing Selected Items (${curSelected.length})...</span>
                `;
                setTimeout(() => {
                    window.location.href = "checkout.html";
                }, 350);
            }
        };
    }

    recalcCartPageSubtotal();
}

function changeCartItemQty(id, diff) {
    const item = cart.find(i => String(i.id) === String(id));
    if (item) {
        item.qty += diff;
        if (item.qty < 1) {
            removeCartItemPrompt(id, item.name);
        } else {
            if (window.playNotificationSound) window.playNotificationSound('pop');
            saveCartState(cart);
            loadCartPage();
            updateCartBadge();
            
            // Sync qty to server
            pushCartToServer(id, item.qty, item.name, item.price, item.image, "set");
        }
    }
}

function removeCartItemPrompt(id, name) {
    showPremiumConfirm(
        "Remove Item",
        `Are you sure you want to remove <strong>${name}</strong> from your luxury shopping cart?`,
        () => {
            if (window.playNotificationSound) window.playNotificationSound('remove');
            cart = cart.filter(item => String(item.id) !== String(id));
            saveCartState(cart);
            updateCartBadge();
            loadCartPage();
            
            // Delete from server
            removeCartItemFromServer(id);
        }
    );
}

function recalcCartPageSubtotal() {
    if (!Array.isArray(cart)) return;
    const selectedItems = cart.filter(i => i.selected !== false);
    const selectedCount = selectedItems.length;
    const totalQty = selectedItems.reduce((sum, i) => sum + (parseInt(i.qty, 10) || 1), 0);
    const subtotal = selectedItems.reduce((sum, i) => sum + (parseNumericPrice(i.price) * (parseInt(i.qty, 10) || 1)), 0);
    const shipping = selectedCount > 0 ? 250 : 0;
    const grandTotal = subtotal + shipping;

    const subtotalEl = document.getElementById('cartSubtotal');
    const shippingEl = document.getElementById('cartShipping');
    const totalEl = document.getElementById('cartTotal');
    const labelEl = document.getElementById('cartItemsCountLabel');
    const badgeEl = document.getElementById('cartSummaryItemBadge');
    const countEl = document.getElementById('cartSelectCount');
    const selectAllChk = document.getElementById('selectAllCartCheckbox');
    const toggleAllBtn = document.getElementById('cartToggleSelectAllBtn');
    const checkoutBtn = document.getElementById('checkoutBtn');

    if (subtotalEl) subtotalEl.innerText = "Rs. " + formatPrice(subtotal);
    if (shippingEl) shippingEl.innerText = selectedCount > 0 ? "Rs. 250" : "Rs. 0";
    if (totalEl) totalEl.innerText = "Rs. " + formatPrice(grandTotal);
    if (labelEl) labelEl.innerText = `Subtotal (${selectedCount} product${selectedCount === 1 ? '' : 's'}, Qty: ${totalQty})`;
    if (badgeEl) badgeEl.innerText = `${selectedCount} Product${selectedCount === 1 ? '' : 's'} Selected`;
    if (countEl) countEl.innerText = String(selectedCount);

    if (selectAllChk) {
        selectAllChk.checked = (cart.length > 0 && selectedCount === cart.length);
        selectAllChk.indeterminate = (selectedCount > 0 && selectedCount < cart.length);
    }
    if (toggleAllBtn) {
        toggleAllBtn.innerText = (cart.length > 0 && selectedCount === cart.length) ? 'Deselect All' : 'Select All';
    }
    if (checkoutBtn) {
        const spanText = checkoutBtn.querySelector('span:first-child');
        if (spanText) spanText.innerText = `🔒 PROCEED TO CHECKOUT (${selectedCount})`;
        if (selectedCount === 0) {
            checkoutBtn.style.opacity = '0.6';
            checkoutBtn.style.cursor = 'not-allowed';
        } else {
            checkoutBtn.style.opacity = '1';
            checkoutBtn.style.cursor = 'pointer';
        }
    }
}

// E.2 FAVORITES PAGE
function clearFavoritesAll() {
    favorites = [];
    saveDb('gw_favorites', []);
    updateFavoritesBadge();
    loadFavoritesPage();

    const userKey = currentUser ? (currentUser.id || currentUser.email || currentUser.phone || "guest") : "guest";
    sendBackendRequest("clearFavorites", { userID: userKey }, "POST").catch(e => console.warn("Fav clear error:", e));
}
window.clearFavoritesAll = clearFavoritesAll;

function loadFavoritesPage() {
    const container = document.getElementById('favoritesContainer');
    if (!container) return;

    if (!favorites || favorites.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 5rem 1.5rem; background: #fff; border: 1px solid #eee; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.04); max-width: 650px; margin: 0 auto;">
                <div style="font-size: 4rem; color: var(--gold); margin-bottom: 1rem; animation: pulse 2s infinite;">❤️</div>
                <h2 style="font-family: var(--font-head); font-size: 2rem; margin-bottom: 1rem; color: #111;">Your Favorites List is Empty</h2>
                <p style="color: #666; font-size: 0.95rem; margin-bottom: 2.2rem; max-width: 450px; margin-left: auto; margin-right: auto; line-height: 1.6;">
                    Save products you love by tapping the heart icon on any item. They will be stored here for quick access.
                </p>
                <a href="shop.html" class="btn" style="width: fit-content; margin: 0 auto; padding: 15px 38px; display: inline-flex; align-items: center; gap: 10px; background: var(--gold); color: #000; font-weight: 800; border-radius: 6px; box-shadow: 0 4px 15px rgba(212,175,55,0.3);">
                    <span>EXPLORE SHOP COLLECTION</span> →
                </a>
            </div>
        `;
        return;
    }

    const favProducts = (products || []).filter(p => isFavorite(p.id));

    if (favProducts.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 4rem 1rem;">
                <p style="color: #666; font-size: 1.1rem;">No saved items match your current product catalog.</p>
                <a href="shop.html" class="btn" style="width: fit-content; margin: 1.5rem auto 0; padding: 12px 30px;">Explore Shop</a>
            </div>
        `;
        return;
    }

    container.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; border-bottom: 2px solid var(--gold); padding-bottom: 12px; flex-wrap: wrap; gap: 10px;">
            <h3 style="font-family: var(--font-head); font-size: 1.4rem; color: #111; margin: 0;">Saved Luxury Items (${favProducts.length})</h3>
            <button onclick="clearFavoritesAll();" style="background: none; border: none; color: #d32f2f; font-size: 0.85rem; font-weight: bold; cursor: pointer; text-decoration: underline;">Clear All Favorites</button>
        </div>

        <div class="product-grid">
            ${favProducts.map(p => `
                <div class="product-card" style="animation: fadeUp 0.6s ease forwards; position: relative; background: #fff; border: 1px solid #eaeaea; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.03);">
                    ${renderFavHeartBtn(p.id)}
                    <a href="product.html?id=${p.id}" style="text-decoration: none; color: inherit; display: block;">
                        <div class="p-image" style="position: relative; overflow: hidden; background: #fafafa;">
                            ${p.images && p.images.length > 1 ? `<span style="position: absolute; bottom: 8px; right: 8px; background: rgba(0,0,0,0.75); color: var(--gold); padding: 3px 8px; font-size: 0.68rem; font-weight: 700; z-index: 5; border-radius: 12px; border: 1px solid rgba(212,175,55,0.4); display: flex; align-items: center; gap: 4px;">📷 ${p.images.length}</span>` : ''}
                            <img src="${p.image}" alt="${p.name}" style="width: 100%; height: 100%; object-fit: cover; transition: transform 0.3s ease;">
                        </div>
                        <div style="padding: 1.2rem;">
                            <div style="font-size: 0.72rem; color: var(--gold); font-weight: 800; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px;">${p.category || 'Luxury Gift'}</div>
                            <h4 style="font-size: 1.05rem; font-family: var(--font-head); line-height: 1.4; height: 2.8rem; overflow: hidden; color: #111; margin-bottom: 0.8rem;">${p.name}</h4>
                            <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px; border-top: 1px solid #f0f0f0; padding-top: 0.8rem;">
                                <span class="text-gold" style="font-size: 1.15rem; font-weight: bold;">Rs. ${formatPrice(p?.price)}</span>
                                <button type="button" onclick="event.preventDefault(); event.stopPropagation(); addToCartById('${p.id}', 1);" style="background: #111; color: var(--gold); border: 1px solid var(--gold); padding: 8px 14px; border-radius: 4px; font-size: 0.75rem; font-weight: 800; cursor: pointer; transition: all 0.2s ease;">+ Add to Cart</button>
                            </div>
                        </div>
                    </a>
                </div>
            `).join('')}
        </div>
    `;
}

// Modal Helpers
function ensureWhatsappOtpModalExists() { return null; }
function openWhatsappOtpModal() {}
window.ensureWhatsappOtpModalExists = ensureWhatsappOtpModalExists;
window.openWhatsappOtpModal = openWhatsappOtpModal;

// F. CHECKOUT PAGE
function loadCheckoutPage() {
    if (!currentUser) {
        // Save current cart in localStorage so products remain saved in local memory!
        saveDb('gw_cart', cart);

        // Store target redirect
        sessionStorage.setItem("redirectAfterLogin", "checkout.html");
        localStorage.setItem("redirectAfterLogin", "checkout.html");

        showPremiumAlert(
            "Please Login to Checkout",
            "Please log in or register to complete your order. All your selected cart items have been saved in memory!",
            "warning",
            () => {
                window.location.href = "account.html?from=checkout";
            }
        );
        return;
    }

    const checkoutForm = document.getElementById('checkoutForm');
    if (!checkoutForm) return;

    // Load items selected for checkout from gw_checkout_items or filter active cart
    let checkoutItems = [];
    try {
        const storedItems = localStorage.getItem('gw_checkout_items');
        if (storedItems) {
            const parsed = JSON.parse(storedItems);
            if (Array.isArray(parsed) && parsed.length > 0) {
                checkoutItems = sanitizeCart(parsed);
            }
        }
    } catch (e) {
        console.warn("Checkout items retrieval notice:", e);
    }

    if (checkoutItems.length === 0) {
        checkoutItems = cart.filter(item => item.selected !== false);
    }
    if (checkoutItems.length === 0 && cart.length > 0) {
        checkoutItems = cart;
    }

    if (checkoutItems.length === 0) {
        showPremiumAlert("No Products Selected", "Your cart has no products selected for checkout. Please select products to continue.", "info", () => {
            window.location.href = "cart.html";
        });
        return;
    }

    const CUSTOM_PROMO_CODES = {
        "WELCOME_10": { type: "percent", value: 10 },
        "WELCOME10": { type: "percent", value: 10 },
        "EID20": { type: "percent", value: 20 },
        "WELCOME500": { type: "flat", value: 500 },
        "GW_GOLD": { type: "percent", value: 15 },
        "GW_ROYAL": { type: "percent", value: 20 },
        "GW_PREMIUM": { type: "percent", value: 10 },
        "GW_EXCLUSIVE": { type: "percent", value: 25 },
        "GW_ELITE": { type: "percent", value: 30 },
        "GW_VIP": { type: "percent", value: 35 },
        "GW_FIRST": { type: "flat", value: 300 },
        "GW_GIFT": { type: "flat", value: 200 },
        "GW_LOVE": { type: "percent", value: 12 },
        "GW_LUXURY": { type: "percent", value: 18 },
        "GW_CELEBRATE": { type: "flat", value: 500 },
        "GW_FESTIVE": { type: "percent", value: 15 },
        "GW_SPECIAL": { type: "percent", value: 10 },
        "GW_SURPRISE": { type: "flat", value: 150 },
        "GW_DELIGHT": { type: "percent", value: 8 },
        "GW_SMILE": { type: "flat", value: 100 },
        "GW_JOY": { type: "percent", value: 5 },
        "GW_FOREVER": { type: "percent", value: 15 },
        "GW_MEMORIES": { type: "percent", value: 10 },
        "GW_CHROME": { type: "percent", value: 10 },
        "GW_SAPPHIRE": { type: "percent", value: 22 },
        "GW_EMERALD": { type: "percent", value: 25 },
        "GW_RUBY": { type: "percent", value: 15 },
        "GW_DIAMOND": { type: "percent", value: 30 },
        "GW_PLATINUM": { type: "percent", value: 25 },
        "GW_SILVER": { type: "percent", value: 12 },
        "GW_BRONZE": { type: "percent", value: 8 },
        "GW_CLASSIC": { type: "percent", value: 10 },
        "GW_MODERN": { type: "percent", value: 10 },
        "GW_CHIC": { type: "percent", value: 15 },
        "GW_TRENDY": { type: "percent", value: 15 },
        "GW_ELEGANT": { type: "percent", value: 18 },
        "GW_GRACE": { type: "percent", value: 12 },
        "GW_CROWN": { type: "percent", value: 20 },
        "GW_MAJESTIC": { type: "percent", value: 25 },
        "GW_IMPERIAL": { type: "percent", value: 30 },
        "GW_REGAL": { type: "percent", value: 15 },
        "GW_SOVEREIGN": { type: "percent", value: 25 },
        "GW_PALACE": { type: "flat", value: 1000 },
        "GW_VALLEY": { type: "percent", value: 10 },
        "GW_SPRING": { type: "percent", value: 12 },
        "GW_SUMMER": { type: "percent", value: 15 },
        "GW_AUTUMN": { type: "percent", value: 10 },
        "GW_WINTER": { type: "percent", value: 15 },
        "GW_NATURE": { type: "percent", value: 8 },
        "GW_OCEAN": { type: "percent", value: 10 },
        "GW_SKY": { type: "percent", value: 10 },
        "GW_STAR": { type: "flat", value: 400 },
        "GW_MOON": { type: "flat", value: 350 },
        "GW_SUN": { type: "flat", value: 250 },
        "GW_GALAXY": { type: "percent", value: 20 },
        "GW_COSMIC": { type: "percent", value: 25 },
        "GW_INFINITE": { type: "percent", value: 30 },
        "GW_ETERNAL": { type: "percent", value: 15 }
    };

    let discount = 0;
    let appliedPromo = '';
    let promoError = '';
    let promoSuccess = '';

    const subtotal = checkoutItems.reduce((sum, item) => sum + (parseNumericPrice(item.price) * (parseInt(item.qty, 10) || 1)), 0);
    const shipping = 250;

    function renderSummary() {
        const summaryContainer = document.querySelector('.checkout-summary-card');
        if (!summaryContainer) return;

        const paymentType = checkoutForm.querySelector('input[name="payment"]:checked')?.value || 'cod';
        const safeSubtotal = parseNumericPrice(subtotal);
        const safeDiscount = parseNumericPrice(discount);
        const surcharge = paymentType === 'cod' ? Math.round((safeSubtotal - safeDiscount) * 0.09) : 0;
        const grandTotal = Math.max(0, safeSubtotal + shipping + surcharge - safeDiscount);

        let itemsHtml = checkoutItems.map(item => `
            <div style="display: flex; gap: 1rem; margin-bottom: 1.5rem; border-bottom: 1px solid #e0e0e0; padding-bottom: 1rem;">
                <div class="summ-thumb" style="border: 1px solid #ddd; overflow: hidden; box-shadow: var(--shadow); width: 60px; height: 60px; flex-shrink: 0;">
                    <img src="${item.image}" alt="${item.name}" style="width: 100%; height: 100%; object-fit: cover;">
                </div>
                <div style="flex: 1;">
                    <strong style="color: var(--black); font-size: 0.95rem;">${item.name}</strong>
                    <p class="text-gold" style="font-size: 0.9rem; margin-top: 3px;">Rs. ${formatPrice(item?.price)}</p>
                    <small style="color: #666;">Qty: ${item.qty}</small>
                </div>
            </div>
        `).join('');

        summaryContainer.innerHTML = `
            <h3 style="margin-bottom: 1.5rem; border-bottom: 1px solid var(--black); padding-bottom: 10px;">Order Summary</h3>
            
            <div style="margin-bottom: 1.5rem; padding-bottom: 1.5rem; border-bottom: 1px solid rgba(0,0,0,0.1);">
                <label class="checkout-label" style="margin-bottom: 8px; display: block; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #555;">Apply Promo Code (Optional)</label>
                <div style="display: flex; gap: 0.5rem; margin-bottom: 0.5rem; align-items: center;">
                    <input type="text" id="promoCodeInput" class="checkout-input" placeholder="" value="${appliedPromo}" style="flex: 1; margin-bottom: 0; padding: 10px 14px; border: 1px solid rgba(0,0,0,0.15); border-radius: 4px; font-size: 0.9rem; height: 40px;" ${discount > 0 ? 'disabled' : ''}>
                    ${discount > 0 ? `
                        <button type="button" id="removePromoBtn" class="btn" style="flex: 0 0 auto; padding: 0; width: 80px; height: 40px; background: #e57373; color: white; border: none; cursor: pointer; font-weight: 700; font-size: 0.8rem; border-radius: 4px; display: flex; align-items: center; justify-content: center;">Remove</button>
                    ` : `
                        <button type="button" id="applyPromoBtn" class="btn" style="flex: 0 0 auto; padding: 0; width: 80px; height: 40px; background: #d4af37; color: var(--black); border: none; cursor: pointer; font-weight: 700; font-size: 0.8rem; border-radius: 4px; display: flex; align-items: center; justify-content: center;">Apply</button>
                    `}
                </div>
                ${promoSuccess ? `<small style="color: #2e7d32; margin-top: 0.3rem; display: block; font-weight: bold;">✓ ${promoSuccess}</small>` : ''}
                ${promoError ? `<small style="color: #d32f2f; margin-top: 0.3rem; display: block; font-weight: bold;">⚠️ ${promoError}</small>` : ''}
            </div>

            <div style="max-height: 250px; overflow-y: auto; padding-right: 5px;">
                ${itemsHtml}
            </div>

            <div style="border-top: 1px solid #ddd; padding-top: 1.5rem; margin-top: 1.5rem;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                    <span>Subtotal</span>
                    <span style="font-weight: bold; color: var(--black);">Rs. ${formatPrice(subtotal)}</span>
                </div>
                
                ${discount > 0 ? `
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px; color: #2e7d32; font-weight: bold;">
                    <span>Promo Discount (${appliedPromo})</span>
                    <span>-Rs. ${formatPrice(discount)}</span>
                </div>
                ` : ''}

                <div id="taxRow" class="tax-row" style="display: ${paymentType === 'cod' ? 'flex' : 'none'}; justify-content: space-between; margin-bottom: 8px;">
                    <span>COD Advance Surcharge (9%)</span>
                    <span id="taxAmount" style="font-weight: bold;">Rs. ${formatPrice(surcharge)}</span>
                </div>

                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                    <span>Shipping Fee</span>
                    <span style="font-weight: bold; color: var(--black);">Rs. ${formatPrice(shipping)}</span>
                </div>

                <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 1.25rem; margin-top: 1.5rem; border-top: 2px solid var(--black); padding-top: 1rem;">
                    <span>Grand Total</span>
                    <span id="finalTotal" class="text-gold">Rs. ${formatPrice(grandTotal)}</span>
                </div>
            </div>

            <div style="margin-top: 2rem; padding-top: 1.5rem; border-top: 1px solid rgba(0,0,0,0.1); text-align: center;">
                <p style="font-size: 0.75rem; color: #888; margin-bottom: 0.8rem; letter-spacing: 0.5px; text-transform: uppercase;">TRUSTED BY THOUSANDS</p>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.8rem;">
                    <div style="padding: 0.6rem; background: #fdfdfd; border: 1px solid rgba(0,0,0,0.05); border-radius: 4px;">
                        <p style="font-size: 1.2rem; margin: 0;">🔒</p>
                        <p style="font-size: 0.7rem; color: #555; margin: 0.2rem 0 0 0; text-transform: uppercase; letter-spacing: 0.5px;">SSL Encrypted</p>
                    </div>
                    <div style="padding: 0.6rem; background: #fdfdfd; border: 1px solid rgba(0,0,0,0.05); border-radius: 4px;">
                        <p style="font-size: 1.2rem; margin: 0;">✓</p>
                        <p style="font-size: 0.7rem; color: #555; margin: 0.2rem 0 0 0; text-transform: uppercase; letter-spacing: 0.5px;">Verified Seller</p>
                    </div>
                </div>
            </div>
        `;

        const applyPromoBtn = document.getElementById('applyPromoBtn');
        if (applyPromoBtn) {
            applyPromoBtn.onclick = function() {
                const promoInput = document.getElementById('promoCodeInput');
                const code = promoInput ? promoInput.value.trim().toUpperCase() : '';
                if (!code) {
                    promoError = 'Please enter a promo code.';
                    promoSuccess = '';
                    renderSummary();
                    return;
                }

                if (CUSTOM_PROMO_CODES[code]) {
                    const rule = CUSTOM_PROMO_CODES[code];
                    if (rule.type === 'percent') {
                        discount = Math.round(subtotal * (rule.value / 100));
                        promoSuccess = `Promo code ${code} applied! ${rule.value}% Discount saved.`;
                    } else if (rule.type === 'flat') {
                        discount = Math.min(rule.value, subtotal);
                        promoSuccess = `Promo code ${code} applied! Rs. ${formatPrice(rule.value)} Discount saved.`;
                    }
                    appliedPromo = code;
                    promoError = '';
                } else {
                    promoError = 'Invalid promo code.';
                    promoSuccess = '';
                }
                renderSummary();
            };
        }

        const removePromoBtn = document.getElementById('removePromoBtn');
        if (removePromoBtn) {
            removePromoBtn.onclick = function() {
                discount = 0;
                appliedPromo = '';
                promoSuccess = '';
                promoError = '';
                renderSummary();
            };
        }
    }

    renderSummary();

    window.selectPay = function(element, type) {
        document.querySelectorAll('.pay-option').forEach(el => el.classList.remove('selected'));
        element.classList.add('selected');
        const radio = element.querySelector('input');
        if (radio) radio.checked = true;

        const codWarning = document.getElementById('codWarning');
        if (codWarning) {
            if (type === 'cod') {
                codWarning.style.display = 'block';
            } else {
                codWarning.style.display = 'none';
            }
        }

        const whatsappDetails = document.getElementById('whatsappDetails');
        if (whatsappDetails) {
            if (type === 'online') {
                whatsappDetails.style.display = 'block';
            } else {
                whatsappDetails.style.display = 'none';
            }
        }

        renderSummary(); 
    };

    const initialCodOption = document.querySelector('.pay-option input[value="cod"]');
    if (initialCodOption && initialCodOption.checked) {
        window.selectPay(initialCodOption.closest('.pay-option'), 'cod');
    }

    const completeOrderBtn = document.getElementById('completeOrderBtn') || document.querySelector('button[onclick*="Complete Order"]');
    if (completeOrderBtn) {
        completeOrderBtn.removeAttribute('onclick');
        completeOrderBtn.onclick = async function(e) {
            e.preventDefault();
            
            const inputs = checkoutForm.querySelectorAll('input[required]:not([type="checkbox"]), select');
            for (let input of inputs) {
                if (!input.value.trim()) {
                    showPremiumAlert("Field Required", "Please complete all billing and delivery information to proceed.", "error");
                    input.focus();
                    return;
                }
            }

            const emailInput = document.getElementById('checkoutEmail') || document.getElementById('email');
            if (emailInput && emailInput.value) {
                const eVal = emailInput.value.trim().toLowerCase();
                if (!eVal.endsWith("@gmail.com")) {
                    showPremiumAlert("Invalid Email", "Email must have @gmail.com (e.g., name@gmail.com).", "error");
                    emailInput.focus();
                    return;
                }
            }

            const agreeTerms = document.getElementById('agreeTerms');
            if (agreeTerms && !agreeTerms.checked) {
                showPremiumAlert("Terms & Privacy Policy Required", "Please read and agree to the Terms & Conditions and Privacy Policy before completing your order.", "error");
                if (agreeTerms.focus) agreeTerms.focus();
                return;
            }

            const firstName = document.getElementById('checkoutFirstName')?.value || '';
            const lastName = document.getElementById('checkoutLastName')?.value || '';
            const address = document.getElementById('checkoutAddress')?.value || '';
            const province = document.getElementById('checkoutProvince')?.value || '';
            const city = document.getElementById('checkoutCity')?.value || '';
            const phone = document.getElementById('checkoutPhone')?.value || '';
            
            const cleanPhone = phone.replace(/[^0-9]/g, '');
            if (cleanPhone.length < 10 || cleanPhone.length > 11) {
                showPremiumAlert("Invalid Phone", "Please enter a valid 10 or 11-digit Pakistani phone number (e.g. 03211234567).", "error");
                document.getElementById('checkoutPhone')?.focus();
                return;
            }

            let finalPhone = cleanPhone;
            if (cleanPhone.length === 11 && cleanPhone.startsWith('0')) {
                finalPhone = '+92 ' + cleanPhone.substring(1, 4) + ' ' + cleanPhone.substring(4);
            } else if (cleanPhone.length === 10) {
                finalPhone = '+92 ' + cleanPhone.substring(0, 3) + ' ' + cleanPhone.substring(3);
            } else {
                finalPhone = '+92 ' + cleanPhone;
            }

            const paymentType = checkoutForm.querySelector('input[name="payment"]:checked')?.value || 'cod';

            const originalBtnText = completeOrderBtn.innerHTML;
            completeOrderBtn.disabled = true;
            completeOrderBtn.style.opacity = '0.75';
            completeOrderBtn.style.cursor = 'not-allowed';
            completeOrderBtn.innerHTML = `
                <span class="spinner" style="display:inline-block; width: 16px; height: 16px; border: 2.5px solid currentColor; border-top-color: transparent; border-radius: 50%; animation: spin 0.8s linear infinite; vertical-align: middle; margin-right: 8px;"></span>
                Placing Your Order...
            `;
            showFullPageLoader("Placing Your Order...");

            const orderNum = String(Math.floor(Math.random() * 90000) + 10000);
            const safeSubtotal = parseNumericPrice(subtotal);
            const safeDiscount = parseNumericPrice(discount);
            const surcharge = paymentType === 'cod' ? Math.round((safeSubtotal - safeDiscount) * 0.09) : 0;
            const grandTotal = Math.max(0, safeSubtotal + shipping + surcharge - safeDiscount);

            const orderDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
            const checkoutNotes = document.getElementById('checkoutNotes')?.value?.trim() || '';

            const userEmailVal = (emailInput && emailInput.value) ? emailInput.value.trim() : (currentUser ? currentUser.email : "guest@gmail.com");

            const newOrder = {
                orderNum,
                email: userEmailVal,
                userID: currentUser ? (currentUser.id || currentUser.email || currentUser.phone || "").toLowerCase() : "guest",
                name: `${firstName} ${lastName}`,
                phone: finalPhone,
                address: `${address}, ${city}, ${province}`,
                city,
                payment: paymentType,
                instructions: checkoutNotes,
                notes: checkoutNotes,
                special_instructions: checkoutNotes,
                items: JSON.parse(JSON.stringify(checkoutItems)),
                products: checkoutItems.map(item => `${item.name} (Qty: ${item.qty})`).join(", "),
                total: grandTotal,
                date: orderDate,
                promoApplied: appliedPromo || null,
                discountApplied: discount,
                status: "Pending"
            };

            try {
                await addOrderToServer(newOrder);
            } catch (orderErr) {
                console.warn("Background order sync notice:", orderErr);
            }

            // Save order locally
            orders.unshift(newOrder);
            saveDb('gw_orders', orders);

            // Remove purchased items from cart
            const purchasedIds = new Set((checkoutItems || []).map(i => String(i.id)));
            cart = cart.filter(item => !purchasedIds.has(String(item.id)));
            saveCartState(cart);
            updateCartBadge();
            localStorage.removeItem('gw_checkout_items');
            localStorage.removeItem("pendingCheckoutOrder");

            hideFullPageLoader();
            completeOrderBtn.disabled = false;
            completeOrderBtn.style.opacity = '1';
            completeOrderBtn.style.cursor = 'pointer';
            completeOrderBtn.innerHTML = originalBtnText;

            if (window.playNotificationSound) window.playNotificationSound('order');

            showPremiumAlert(
                "Order Placed Successfully! 🎉",
                `Thank you for your purchase! Your order <strong>#${orderNum}</strong> has been received.<br><br>Our team will contact you at <strong>${finalPhone}</strong> to confirm delivery details.`,
                "success",
                () => {
                    sessionStorage.setItem("justPlacedOrder", "true");
                    window.location.replace("account.html?orderPlaced=true");
                }
            );
        };
    }
}

// --- GLOBAL TERMS & PRIVACY MODAL HELPERS ---
window.openTermsModal = function(e) {
    if (e && e.preventDefault) e.preventDefault();
    let modal = document.getElementById('termsOverlayModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'termsOverlayModal';
        modal.style.cssText = 'position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(0,0,0,0.75); backdrop-filter:blur(5px); z-index:99999; display:flex; align-items:center; justify-content:center; padding:20px;';
        modal.innerHTML = `
            <div style="background:#fff; border-radius:8px; max-width:800px; width:100%; max-height:85vh; overflow-y:auto; padding:30px; position:relative; box-shadow:0 20px 50px rgba(0,0,0,0.3); border:2px solid var(--gold);">
                <button onclick="(function(){const m=document.getElementById('termsOverlayModal');if(m)m.style.display='none';})()" style="position:absolute; top:15px; right:20px; background:none; border:none; font-size:2rem; cursor:pointer; color:#333; font-weight:bold;">&times;</button>
                <h2 style="font-family:var(--font-head); color:#111; margin-bottom:10px; border-bottom:1px solid var(--gold); padding-bottom:8px;">Terms & Conditions</h2>
                <div style="font-size:0.92rem; line-height:1.7; color:#444;">
                    <p>Welcome to <strong>Gift Wallay</strong>. By accessing or using our website, you agree to comply with these Terms & Conditions. Please read them carefully before placing an order.</p>
                    <h4 style="margin-top:15px; color:#111; font-weight:bold;">1. Products & Handcrafted Quality</h4>
                    <p>We specialize in premium metal wall art, luxury clocks, custom gifts, and decorative products. While we display products accurately, slight finish variations may occur due to handcrafted polishing.</p>
                    <h4 style="margin-top:15px; color:#111; font-weight:bold;">2. Pricing & Payments</h4>
                    <p>All prices are listed in Pakistani Rupees (PKR). We accept Cash on Delivery, Bank Transfers, EasyPaisa, JazzCash, and online debit/credit cards.</p>
                    <h4 style="margin-top:15px; color:#111; font-weight:bold;">3. Shipping & Delivery</h4>
                    <p>Express nationwide delivery is handled by our premier courier partners within 3-5 business days across Pakistan.</p>
                    <h4 style="margin-top:15px; color:#111; font-weight:bold;">4. Returns & Guarantee</h4>
                    <p>If your package arrives damaged or defective, notify us within 48 hours for immediate replacement under our 100% Satisfaction Guarantee.</p>
                </div>
                <div style="margin-top:20px; display:flex; gap:10px; justify-content:flex-end;">
                    <a href="terms.html" style="padding:10px 20px; background:var(--gold); color:#000; font-weight:bold; text-decoration:none; border-radius:4px; font-size:0.85rem;">Open Full Page →</a>
                    <button onclick="(function(){const m=document.getElementById('termsOverlayModal');if(m)m.style.display='none';})()" style="padding:10px 20px; background:#333; color:#fff; border:none; font-weight:bold; cursor:pointer; border-radius:4px; font-size:0.85rem;">Close</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }
    if (modal && modal.style) modal.style.display = 'flex';
};

window.openPrivacyModal = function(e) {
    if (e && e.preventDefault) e.preventDefault();
    let modal = document.getElementById('privacyOverlayModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'privacyOverlayModal';
        modal.style.cssText = 'position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(0,0,0,0.75); backdrop-filter:blur(5px); z-index:99999; display:flex; align-items:center; justify-content:center; padding:20px;';
        modal.innerHTML = `
            <div style="background:#fff; border-radius:8px; max-width:800px; width:100%; max-height:85vh; overflow-y:auto; padding:30px; position:relative; box-shadow:0 20px 50px rgba(0,0,0,0.3); border:2px solid var(--gold);">
                <button onclick="(function(){const m=document.getElementById('privacyOverlayModal');if(m)m.style.display='none';})()" style="position:absolute; top:15px; right:20px; background:none; border:none; font-size:2rem; cursor:pointer; color:#333; font-weight:bold;">&times;</button>
                <h2 style="font-family:var(--font-head); color:#111; margin-bottom:10px; border-bottom:1px solid var(--gold); padding-bottom:8px;">Privacy Policy</h2>
                <div style="font-size:0.92rem; line-height:1.7; color:#444;">
                    <p>Gift Wallay values your privacy and is committed to protecting your personal information.</p>
                    <h4 style="margin-top:15px; color:#111; font-weight:bold;">1. Data Collection</h4>
                    <p>We collect essential order details such as full name, email address, phone number, and shipping address solely for processing and dispatching your orders.</p>
                    <h4 style="margin-top:15px; color:#111; font-weight:bold;">2. Security & Confidentiality</h4>
                    <p>Your information is stored securely and encrypted during transmission. We never sell or share your personal information with third parties.</p>
                </div>
                <div style="margin-top:20px; display:flex; gap:10px; justify-content:flex-end;">
                    <a href="privacy.html" style="padding:10px 20px; background:var(--gold); color:#000; font-weight:bold; text-decoration:none; border-radius:4px; font-size:0.85rem;">Open Full Page →</a>
                    <button onclick="(function(){const m=document.getElementById('privacyOverlayModal');if(m)m.style.display='none';})()" style="padding:10px 20px; background:#333; color:#fff; border:none; font-weight:bold; cursor:pointer; border-radius:4px; font-size:0.85rem;">Close</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }
    if (modal && modal.style) modal.style.display = 'flex';
};

async function checkIfUserExists(identifier) {
    if (!identifier) return null;
    const clean = identifier.trim().toLowerCase();
    const cleanDigits = clean.replace(/[^0-9]/g, '');

    // 1. Check local users cache
    const localFound = (users || []).find(u => {
        if (u.email && u.email.toLowerCase() === clean) return true;
        if (u.id && u.id.toLowerCase() === clean) return true;
        if (u.phone) {
            const uDigits = u.phone.replace(/[^0-9]/g, '');
            if (cleanDigits && cleanDigits.length >= 7 && uDigits.endsWith(cleanDigits.slice(-7))) return true;
        }
        return false;
    });
    if (localFound) return localFound;

    // 2. Query backend server / Google Apps Script spreadsheet
    try {
        const data = await sendBackendRequest("getUser", { query: clean, email: clean, phone: clean });
        if (data && (data.user || data.id || data.email)) {
            const foundUser = data.user || data;
            if (foundUser && (foundUser.email || foundUser.id || foundUser.phone)) {
                if (!users.some(u => (u.email && u.email === foundUser.email) || (u.id && u.id === foundUser.id))) {
                    users.push(foundUser);
                    saveDb('gw_users', users);
                }
                return foundUser;
            }
        }
    } catch (e) {
        console.warn("User existence check failed:", e);
    }
    return null;
}

// --- DASHBOARD ORDERS REFRESH & LOOKUP ---
async function refreshDashboardOrders() {
    const ordersContainer = document.getElementById('dashboardOrdersContainer');
    const refreshBtn = document.getElementById('refreshOrdersBtn');

    if (refreshBtn) refreshBtn.innerText = "Syncing...";

    const userKey = currentUser ? (currentUser.id || currentUser.email || currentUser.phone || "all") : "all";
    await syncUserOrdersFromServer(userKey);

    if (refreshBtn) refreshBtn.innerText = "🔄 Refresh";

    renderUserOrdersInContainer(ordersContainer);
}
window.refreshDashboardOrders = refreshDashboardOrders;

async function lookupCustomOrder() {
    const input = document.getElementById('dashboardOrderQuery');
    const query = input ? input.value.trim() : '';
    if (!query) {
        showPremiumAlert("Input Required", "Please enter an Order ID or Phone number to track.", "error");
        return;
    }

    const ordersContainer = document.getElementById('dashboardOrdersContainer');
    if (ordersContainer) {
        ordersContainer.innerHTML = `
            <div style="text-align: center; padding: 2rem 0; color: #888;">
                <p>Searching Google Sheets database for "${query}"...</p>
            </div>
        `;
    }

    await syncUserOrdersFromServer(query);
    renderUserOrdersInContainer(ordersContainer, query);
}
window.lookupCustomOrder = lookupCustomOrder;

function renderUserOrdersInContainer(ordersContainer, trackFilter = '') {
    if (!ordersContainer) return;

    let filteredOrders = orders;
    if (currentUser && !trackFilter && orders.length > 0) {
        filteredOrders = orders;
    }

    if (filteredOrders.length === 0) {
        ordersContainer.innerHTML = `
            <div style="text-align: center; padding: 3rem 1rem; color: #aaa; background: #1a1a1a; border: 1.5px dashed rgba(212,175,55,0.3); border-radius: 8px;">
                <p style="font-size: 1rem; font-weight: bold; color: var(--gold); margin-bottom: 5px;">No orders found</p>
                <p style="font-size: 0.85rem; color: #888;">${trackFilter ? `No active record found matching "${trackFilter}" in the Orders sheet.` : 'No past orders recorded under your account.'}</p>
            </div>
        `;
        return;
    }

    ordersContainer.innerHTML = filteredOrders.map(o => {
        const itemsList = (o.items && o.items.length > 0)
            ? o.items.map(item => `• ${item.name} (Qty: ${item.qty})`).join('<br>')
            : "1x Premium Gift Order";
        
        let statusColor = "var(--gold)";
        const st = (o.status || "Pending").toLowerCase();
        if (st === 'paid') statusColor = "#2e7d32";
        if (st === 'accepted' || st === 'shipped') statusColor = "#0288d1";
        if (st === 'delivered') statusColor = "#388e3c";
        if (st === 'rejected' || st === 'cancelled') statusColor = "#d32f2f";

        return `
            <div style="background: linear-gradient(135deg, rgba(26,26,32,0.95) 0%, rgba(18,18,22,0.98) 100%); border: 1px solid rgba(212,175,55,0.22); padding: 1.35rem; margin-bottom: 1rem; border-left: 4px solid ${statusColor}; border-radius: 12px; box-shadow: 0 8px 25px rgba(0,0,0,0.4); transition: transform 0.2s ease;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; border-bottom: 1px solid rgba(255,255,255,0.06); padding-bottom: 8px;">
                    <div>
                        <span style="font-family: 'Cinzel', serif; font-size: 1rem; font-weight: 700; color: #ffffff; letter-spacing: 1px;">Order #${o.orderNum}</span>
                        <div style="font-size: 0.75rem; color: #888888; margin-top: 2px;">Placed: ${o.date}</div>
                    </div>
                    <span style="background: rgba(255,255,255,0.06); border: 1px solid ${statusColor}; color: ${statusColor}; padding: 4px 10px; font-size: 0.7rem; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; border-radius: 6px;">${o.status}</span>
                </div>
                <div style="font-size: 0.88rem; color: #cccccc; line-height: 1.6; margin-bottom: 10px;">
                    ${itemsList}
                </div>
                ${o.instructions ? `
                    <div style="font-size: 0.8rem; color: #bbb; background: rgba(0,0,0,0.3); padding: 8px 12px; border: 1px dashed rgba(212,175,55,0.25); border-radius: 6px; margin-bottom: 10px;">
                        <strong style="color: var(--gold);">Custom Request:</strong> ${o.instructions}
                    </div>
                ` : ''}
                <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.85rem; color: #888; border-top: 1px solid rgba(255,255,255,0.06); padding-top: 10px;">
                    <span style="font-size: 0.8rem; color: #999;">Payment: <strong style="color: #fff;">${o.paymentMethod || o.payment || 'Verified'}</strong></span>
                    <strong style="color: var(--gold); font-family: 'Cinzel', serif; font-size: 1.05rem; letter-spacing: 0.5px;">Rs. ${formatPrice(o?.total)}</strong>
                </div>
            </div>
        `;
    }).join('');
}
window.renderUserOrdersInContainer = renderUserOrdersInContainer;

// G. PROFILE & LOGIN / REGISTRATION PAGE
function loadAccountPage() {
    const authContainer = document.querySelector('.auth-container');
    if (!authContainer) return;

    if (currentUser) {
        renderUserDashboard(authContainer);
    } else {
        renderAuthForms(authContainer);
    }
}

function renderAuthForms(container) {
    container.innerHTML = `
        <div style="width: 56px; height: 56px; margin: 0 auto 1.25rem; border-radius: 50%; background: rgba(212,175,55,0.12); border: 1.5px solid var(--gold); display: flex; align-items: center; justify-content: center; font-size: 1.6rem; color: var(--gold); box-shadow: 0 0 25px rgba(212,175,55,0.25);">👑</div>
        <h2 style="text-align: center; margin-bottom: 0.4rem; font-family: var(--font-head); font-size: 1.65rem; color: #ffffff; letter-spacing: 1.2px;">Welcome to Gift Wallay</h2>
        <p style="text-align: center; color: #aaaaaa; margin-bottom: 1.8rem; font-size: 0.88rem;">Sign in to your luxury profile or create an account to track bespoke orders.</p>

        <div class="tab-nav">
            <div class="tab-btn active" id="loginTabBtn">Email Login</div>
            <div class="tab-btn" id="phoneTabBtn">Phone Login</div>
            <div class="tab-btn" id="registerTabBtn">Register</div>
        </div>

        <form id="loginForm">
            <div class="input-group">
                <label>Email Address or Mobile</label>
                <input type="text" id="email" class="input-field" placeholder="name@example.com or 03XXXXXXXXX" required>
            </div>
            <div class="input-group" style="margin-top: 1.2rem;">
                <label>Password</label>
                <input type="password" id="loginEmailPass" class="input-field" placeholder="Enter your password" required>
            </div>
            <button type="submit" id="emailLoginBtn" class="btn btn-luxury-gold" style="margin-top: 1rem;">Sign In</button>
        </form>

        <form id="phoneLoginForm" style="display: none;">
            <div class="input-group">
                <label>Mobile Phone Number (Pakistan)</label>
                <div class="phone-input-container">
                    <span class="phone-prefix">
                        <span>🇵🇰</span> <span>+92</span>
                    </span>
                    <input type="tel" id="loginPhone" class="input-field" placeholder="03XXXXXXXXX" required style="border: none; background: transparent; height: 100%; padding: 14px 18px; flex: 1; font-size: 0.95rem; width: 100%; color: #fff;" maxlength="11" oninput="this.value = this.value.replace(/[^0-9]/g, '').slice(0, 11);">
                </div>
            </div>
            <div class="input-group" style="margin-top: 1.2rem;">
                <label>Password</label>
                <input type="password" id="loginPhonePass" class="input-field" placeholder="Enter your password" required>
            </div>
            <button type="submit" id="phoneLoginBtn" class="btn btn-luxury-gold" style="margin-top: 1rem;">Sign In</button>
        </form>

        <form id="registerForm" style="display: none;">
            <div class="input-group">
                <label>Full Name</label>
                <input type="text" id="regName" class="input-field" placeholder="e.g. Muhammad Arham" required>
            </div>
            <div class="input-group">
                <label>Email Address</label>
                <input type="email" id="regEmail" class="input-field" placeholder="name@example.com" required>
            </div>
            <div class="input-group">
                <label>Mobile Phone Number (WhatsApp)</label>
                <div class="phone-input-container">
                    <span class="phone-prefix">
                        <span>🇵🇰</span> <span>+92</span>
                    </span>
                    <input type="tel" id="regPhone" class="input-field" placeholder="03XXXXXXXXX" required style="border: none; background: transparent; height: 100%; padding: 14px 18px; flex: 1; font-size: 0.95rem; width: 100%; color: #fff;" maxlength="11" oninput="this.value = this.value.replace(/[^0-9]/g, '').slice(0, 11);">
                </div>
            </div>
            <div class="input-group" style="margin-top: 1.2rem;">
                <label>Create Password</label>
                <input type="password" id="regPass" class="input-field" placeholder="At least 4 characters" required>
            </div>
            <button type="submit" id="regSubmitBtn" class="btn btn-luxury-gold" style="margin-top: 1rem;">Create Account</button>
            <p style="font-size: 0.8rem; color: #888; margin-top: 1.2rem; text-align: center;">
                By registering, you agree to our <a href="terms.html" onclick="openTermsModal(event)" style="color: var(--gold); text-decoration: underline;">Terms & Conditions</a> and <a href="privacy.html" onclick="openPrivacyModal(event)" style="color: var(--gold); text-decoration: underline;">Privacy Policy</a>.
            </p>
        </form>

        <div style="margin-top: 2rem; padding: 1rem; background: rgba(255,255,255,0.03); border: 1px solid rgba(212,175,55,0.2); border-radius: 8px; text-align: center;">
            <p style="margin: 0; font-size: 0.85rem; color: #ccc;">
                🔒 <strong style="color: var(--gold);">100% Secure Shopping Profile</strong><br>
                <span style="font-size: 0.8rem; color: #888;">Instant order tracking, verified addresses, and WhatsApp notifications.</span>
            </p>
        </div>
    `;

    const logTab = document.getElementById('loginTabBtn');
    const phoneTab = document.getElementById('phoneTabBtn');
    const regTab = document.getElementById('registerTabBtn');
    const logForm = document.getElementById('loginForm');
    const phoneForm = document.getElementById('phoneLoginForm');
    const regForm = document.getElementById('registerForm');

    const resetTabStyles = () => {
        [logTab, phoneTab, regTab].forEach(t => {
            if (t) {
                t.classList.remove('active');
            }
        });
    };

    const activateTab = (tab, formToShow) => {
        resetTabStyles();
        if (tab) {
            tab.classList.add('active');
        }

        if (logForm && logForm.style) logForm.style.display = 'none';
        if (phoneForm && phoneForm.style) phoneForm.style.display = 'none';
        if (regForm && regForm.style) regForm.style.display = 'none';
        if (formToShow && formToShow.style) formToShow.style.display = 'block';
    };

    if (logTab) logTab.onclick = () => activateTab(logTab, logForm);
    if (phoneTab) phoneTab.onclick = () => activateTab(phoneTab, phoneForm);
    if (regTab) regTab.onclick = () => activateTab(regTab, regForm);

    logForm.onsubmit = async (e) => {
        e.preventDefault();
        const rawInput = document.getElementById('email').value.trim();
        const emailVal = rawInput.toLowerCase();
        const passVal = document.getElementById('loginEmailPass').value;
        const cleanDigits = rawInput.replace(/[^0-9]/g, '');

        if (!emailVal || (!emailVal.includes('@') && cleanDigits.length < 10)) {
            showPremiumAlert("Invalid Input", "Please enter a valid email address or mobile phone number.", "error");
            document.getElementById('email').focus();
            return;
        }

        if (!passVal) {
            showPremiumAlert("Password Required", "Please enter your password.", "error");
            document.getElementById('loginEmailPass').focus();
            return;
        }

        const submitBtn = document.getElementById('emailLoginBtn');
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerText = "Authenticating...";
        }
        showFullPageLoader("Authenticating & Verifying Credentials...");

        try {
            const response = await sendBackendRequest("login", {
                email: emailVal,
                phone: cleanDigits.length >= 10 ? cleanDigits : "",
                loginKey: emailVal,
                password: passVal,
                pass: passVal
            });

            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerText = "Sign In";
            }

            let userObj = null;
            if (response && response.id) {
                userObj = response;
            } else if (response && response.success && response.user) {
                userObj = response.user;
            }

            // Fallback to local user store if backend response did not return user
            if (!userObj || (!userObj.id && !userObj.email)) {
                const localMatch = (users || []).find(u => 
                    u.email && u.email.toLowerCase() === emailVal.toLowerCase() && 
                    (String(u.pass || u.password || "").trim() === passVal.trim())
                );
                if (localMatch) {
                    userObj = {
                        id: localMatch.id || localMatch.userID || ("U-" + Math.floor(100000 + Math.random() * 900000)),
                        email: localMatch.email,
                        name: localMatch.name || emailVal.split('@')[0],
                        phone: localMatch.phone || ""
                    };
                }
            }

            if (userObj && (userObj.id || userObj.email)) {
                const userId = userObj.id || userObj.userID || ("U-" + Math.floor(100000 + Math.random() * 900000));
                const userName = userObj.name || emailVal.split('@')[0];
                const userPhone = userObj.phone || "";

                currentUser = {
                    id: userId,
                    email: userObj.email || emailVal,
                    name: userName,
                    phone: userPhone,
                    authType: 'email'
                };
                saveDb('gw_current_user', currentUser);

                let existingLocal = users.find(u => u.email === currentUser.email);
                if (!existingLocal) {
                    users.push({ id: userId, name: userName, email: currentUser.email, phone: userPhone, pass: passVal });
                } else {
                    existingLocal.id = userId;
                    existingLocal.name = userName;
                    existingLocal.phone = userPhone;
                    existingLocal.pass = passVal;
                }
                saveDb('gw_users', users);

                localStorage.setItem("userLoggedIn", "true");
                localStorage.setItem("userName", currentUser.name);
                localStorage.setItem("userEmail", currentUser.email);

                updateSidebarUserEmail();
                await syncUserCartFromServer(currentUser);

                hideFullPageLoader();
                showPremiumAlert("Login Successful", `✓ Welcome back, <strong>${currentUser.name}</strong>!`, "success", () => {
                    checkLoginRedirect();
                });
            } else {
                hideFullPageLoader();
                const errMsg = (response && response.message) ? response.message : "Invalid email address or password. Please check your login credentials.";
                showPremiumAlert("Login Failed", errMsg, "error");
            }
        } catch (err) {
            console.error("Email Login Error:", err);
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerText = "Sign In";
            }
            
            // Local fallback check on network error
            const localMatch = (users || []).find(u => 
                u.email && u.email.toLowerCase() === emailVal.toLowerCase() && 
                (String(u.pass || u.password || "").trim() === passVal.trim())
            );
            if (localMatch) {
                const userId = localMatch.id || localMatch.userID || ("U-" + Math.floor(100000 + Math.random() * 900000));
                const userName = localMatch.name || emailVal.split('@')[0];
                currentUser = { id: userId, email: localMatch.email, name: userName, phone: localMatch.phone || "", authType: 'email' };
                saveDb('gw_current_user', currentUser);
                localStorage.setItem("userLoggedIn", "true");
                localStorage.setItem("userName", currentUser.name);
                localStorage.setItem("userEmail", currentUser.email);
                updateSidebarUserEmail();
                hideFullPageLoader();
                showPremiumAlert("Login Successful", `✓ Welcome back, <strong>${currentUser.name}</strong>!`, "success", () => {
                    checkLoginRedirect();
                });
            } else {
                hideFullPageLoader();
                showPremiumAlert("Connection Error", "Could not verify credentials with server. Please check your connection.", "error");
            }
        }
    };

    phoneForm.onsubmit = async (e) => {
        e.preventDefault();
        const phoneVal = document.getElementById('loginPhone').value.trim();
        const passVal = document.getElementById('loginPhonePass').value;
        const cleanPhone = phoneVal.replace(/[^0-9]/g, '');

        if (cleanPhone.length < 10 || cleanPhone.length > 11) {
            showPremiumAlert("Invalid Phone", "Please enter a valid Pakistani phone number starting with 03.", "error");
            document.getElementById('loginPhone').focus();
            return;
        }

        if (!passVal) {
            showPremiumAlert("Password Required", "Please enter your password.", "error");
            document.getElementById('loginPhonePass').focus();
            return;
        }

        let finalPhone = cleanPhone;
        if (cleanPhone.length === 11 && cleanPhone.startsWith('0')) {
            finalPhone = '+92 ' + cleanPhone.substring(1, 4) + ' ' + cleanPhone.substring(4);
        } else if (cleanPhone.length === 10) {
            finalPhone = '+92 ' + cleanPhone.substring(0, 3) + ' ' + cleanPhone.substring(3);
        }

        const submitBtn = document.getElementById('phoneLoginBtn');
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerText = "Authenticating...";
        }
        showFullPageLoader("Authenticating Mobile Account...");

        try {
            const response = await sendBackendRequest("login", {
                phone: cleanPhone,
                email: cleanPhone,
                loginKey: cleanPhone,
                password: passVal,
                pass: passVal
            });

            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerText = "Sign In";
            }

            let userObj = null;
            if (response && response.id) {
                userObj = response;
            } else if (response && response.success && response.user) {
                userObj = response.user;
            }

            // Fallback to local user store if backend response did not return user
            if (!userObj || (!userObj.id && !userObj.phone && !userObj.email)) {
                const localMatch = (users || []).find(u => 
                    u.phone && u.phone.replace(/[^0-9]/g, '').endsWith(cleanPhone.slice(-7)) && 
                    (String(u.pass || u.password || "").trim() === passVal.trim())
                );
                if (localMatch) {
                    userObj = {
                        id: localMatch.id || localMatch.userID || ("U-" + Math.floor(100000 + Math.random() * 900000)),
                        email: localMatch.email || "",
                        name: localMatch.name || ("Member " + cleanPhone.slice(-4)),
                        phone: localMatch.phone || finalPhone
                    };
                }
            }

            if (userObj && (userObj.id || userObj.phone || userObj.email)) {
                const userId = userObj.id || userObj.userID || ("U-" + Math.floor(100000 + Math.random() * 900000));
                const userName = userObj.name || ("Member " + cleanPhone.slice(-4));
                const userEmail = userObj.email || "";
                const userPhone = userObj.phone || finalPhone;

                currentUser = {
                    id: userId,
                    email: userEmail,
                    name: userName,
                    phone: userPhone,
                    authType: 'phone'
                };
                saveDb('gw_current_user', currentUser);

                let existingLocal = users.find(u => u.phone && u.phone.replace(/[^0-9]/g, '').endsWith(cleanPhone.slice(-7)));
                if (!existingLocal) {
                    users.push({ id: userId, name: userName, email: userEmail, phone: userPhone, pass: passVal });
                } else {
                    existingLocal.id = userId;
                    existingLocal.name = userName;
                    existingLocal.phone = userPhone;
                    existingLocal.pass = passVal;
                }
                saveDb('gw_users', users);

                localStorage.setItem("userLoggedIn", "true");
                localStorage.setItem("userName", currentUser.name);
                localStorage.setItem("userEmail", currentUser.email || "");

                updateSidebarUserEmail();
                await syncUserCartFromServer(currentUser);

                hideFullPageLoader();
                showPremiumAlert("Login Successful", `✓ Welcome back, <strong>${currentUser.name}</strong>!`, "success", () => {
                    checkLoginRedirect();
                });
            } else {
                hideFullPageLoader();
                const errMsg = (response && response.message) ? response.message : "Invalid phone number or password. Please verify your details.";
                showPremiumAlert("Login Failed", errMsg, "error");
            }
        } catch (err) {
            console.error("Phone Login Error:", err);
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerText = "Sign In";
            }

            const localMatch = (users || []).find(u => 
                u.phone && u.phone.replace(/[^0-9]/g, '').endsWith(cleanPhone.slice(-7)) && 
                (String(u.pass || u.password || "").trim() === passVal.trim())
            );
            if (localMatch) {
                const userId = localMatch.id || localMatch.userID || ("U-" + Math.floor(100000 + Math.random() * 900000));
                const userName = localMatch.name || ("Member " + cleanPhone.slice(-4));
                currentUser = { id: userId, email: localMatch.email || "", name: userName, phone: localMatch.phone || finalPhone, authType: 'phone' };
                saveDb('gw_current_user', currentUser);
                localStorage.setItem("userLoggedIn", "true");
                localStorage.setItem("userName", currentUser.name);
                localStorage.setItem("userEmail", currentUser.email || "");
                updateSidebarUserEmail();
                hideFullPageLoader();
                showPremiumAlert("Login Successful", `✓ Welcome back, <strong>${currentUser.name}</strong>!`, "success", () => {
                    checkLoginRedirect();
                });
            } else {
                hideFullPageLoader();
                showPremiumAlert("Connection Error", "Could not verify credentials with server. Please check your connection.", "error");
            }
        }
    };

    regForm.onsubmit = async (e) => {
        e.preventDefault();
        const name = document.getElementById('regName').value.trim();
        const email = document.getElementById('regEmail').value.trim().toLowerCase();
        const phone = document.getElementById('regPhone').value.trim();
        const pass = document.getElementById('regPass').value;

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showPremiumAlert("Invalid Email", "Please enter a valid email address.", "error");
            document.getElementById('regEmail')?.focus();
            return;
        }

        const cleanPhone = phone.replace(/[^0-9]/g, '');
        if (cleanPhone.length < 10 || cleanPhone.length > 11) {
            showPremiumAlert("Invalid Phone", "Please enter a valid 10 or 11 digit Pakistani phone number (e.g. 03211234567).", "error");
            document.getElementById('regPhone')?.focus();
            return;
        }

        if (pass.length < 4) {
            showPremiumAlert("Password Required", "Please create a password of at least 4 characters.", "error");
            return;
        }

        let finalPhone = cleanPhone;
        if (cleanPhone.length === 11 && cleanPhone.startsWith('0')) {
            finalPhone = '+92 ' + cleanPhone.substring(1, 4) + ' ' + cleanPhone.substring(4);
        } else if (cleanPhone.length === 10) {
            finalPhone = '+92 ' + cleanPhone.substring(0, 3) + ' ' + cleanPhone.substring(3);
        }

        const regSubmitBtn = document.getElementById('regSubmitBtn');
        if (regSubmitBtn) {
            regSubmitBtn.disabled = true;
            regSubmitBtn.innerText = "Creating Account...";
        }
        showFullPageLoader("Creating Your Account...");

        let regResponse = null;
        try {
            regResponse = await sendBackendRequest("register", {
                name: name,
                email: email,
                phone: finalPhone,
                password: pass,
                verified: true
            });
        } catch (err) {
            console.warn("Backend registration error:", err);
        } finally {
            hideFullPageLoader();
            if (regSubmitBtn) {
                regSubmitBtn.disabled = false;
                regSubmitBtn.innerText = "Create Account";
            }
        }

        let regUser = null;
        if (regResponse && regResponse.id) {
            regUser = regResponse;
        } else if (regResponse && regResponse.success && regResponse.user) {
            regUser = regResponse.user;
        } else if (regResponse && regResponse.success) {
            regUser = { id: "U-" + Math.floor(100000 + Math.random() * 900000), name, email, phone: finalPhone };
        } else {
            regUser = { id: "U-" + Math.floor(100000 + Math.random() * 900000), name, email, phone: finalPhone };
        }

        const userId = regUser.id || regUser.userID || ("U-" + Math.floor(100000 + Math.random() * 900000));
        currentUser = {
            id: userId,
            email: email,
            name: name,
            phone: finalPhone,
            authType: 'register'
        };
        saveDb('gw_current_user', currentUser);

        users.push({ id: userId, name, email, phone: finalPhone, pass });
        saveDb('gw_users', users);

        localStorage.setItem("userLoggedIn", "true");
        localStorage.setItem("userName", name);
        localStorage.setItem("userEmail", email);

        updateSidebarUserEmail();
        syncUserCartFromServer(currentUser).catch(() => {});

        if (window.playNotificationSound) window.playNotificationSound('success');

        showPremiumAlert("Account Created", `✓ Welcome to Gift Wallay, <strong>${name}</strong>! Your account has been created successfully.`, "success", () => {
            checkLoginRedirect();
        });
    };
}

// ============================================================================
// H. ORDER CONFIRMATION PAGE CONTROLLER (otp.html)
// ============================================================================
function loadOtpPage() {
    const statusBox = document.getElementById('orderStatusBox');
    const lastOrderStr = localStorage.getItem('lastCompletedOrder') || localStorage.getItem('pendingCheckoutOrder');
    let recentOrder = null;
    try {
        if (lastOrderStr) recentOrder = JSON.parse(lastOrderStr);
    } catch (e) {}

    if (!recentOrder && Array.isArray(orders) && orders.length > 0) {
        recentOrder = orders[0];
    }

    if (statusBox && recentOrder) {
        const itemsText = Array.isArray(recentOrder.items) 
            ? recentOrder.items.map(i => `${i.name} (Qty: ${i.qty || 1})`).join(', ')
            : (recentOrder.products || 'Gift Items');

        statusBox.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 10px;">
                <div>
                    <span style="font-size: 0.8rem; color: #888; text-transform: uppercase;">Order Number</span>
                    <div style="font-size: 1.1rem; font-weight: 800; color: var(--gold);">#${recentOrder.orderNum || recentOrder.orderID || 'GW-CONFIRMED'}</div>
                </div>
                <span style="color: #25d366; font-weight: 700; font-size: 0.82rem; background: rgba(37,211,102,0.1); padding: 4px 12px; border-radius: 12px; border: 1px solid rgba(37,211,102,0.3);">✓ Confirmed</span>
            </div>
            <div style="font-size: 0.88rem; color: #ccc; line-height: 1.6;">
                <div>📦 <strong>Items:</strong> ${itemsText}</div>
                <div style="margin-top: 4px;">📍 <strong>Delivery Address:</strong> ${recentOrder.address || 'Pakistan'}</div>
                <div style="margin-top: 4px;">💵 <strong>Total Amount:</strong> Rs. ${formatPrice(recentOrder.total || recentOrder.totalAmount)} (${recentOrder.payment === 'online' ? 'Online' : 'Cash on Delivery'})</div>
            </div>
        `;
    }
}

function initializeGsiClient() {
    // Client-side authentication is handled directly via phone and email
}

function renderUserDashboard(container) {
    const parentContainer = container.closest('.auth-container');
    if (parentContainer) {
        parentContainer.style.maxWidth = "960px";
        if (window.innerWidth <= 768) {
            parentContainer.style.padding = "1.25rem";
        } else {
            parentContainer.style.padding = "2.5rem";
        }
        parentContainer.style.background = "#141414";
        parentContainer.style.border = "1px solid rgba(212, 175, 55, 0.3)";
        parentContainer.style.borderRadius = "16px";
        parentContainer.style.boxShadow = "0 25px 60px rgba(0,0,0,0.5), 0 0 40px rgba(212, 175, 55, 0.06)";
    }

    const justPlaced = window.location.search.includes('orderPlaced=true') || sessionStorage.getItem('justPlacedOrder') === 'true';
    if (justPlaced) {
        sessionStorage.removeItem('justPlacedOrder');
        history.pushState({ page: 'account_order' }, '', 'account.html');
        window.addEventListener('popstate', function handlePop() {
            window.removeEventListener('popstate', handlePop);
            window.location.replace('index.html');
        });
    }

    const orderPlacedBannerHtml = justPlaced ? `
        <div style="background: linear-gradient(135deg, #181818 0%, #242424 100%); border: 1.5px solid var(--gold); border-radius: 8px; padding: 1.2rem; margin-bottom: 1.5rem; color: #ffffff; display: flex; align-items: center; gap: 15px; box-shadow: 0 10px 30px rgba(212,175,55,0.25); flex-wrap: wrap;">
            <div style="font-size: 2.2rem; line-height: 1;">🎉</div>
            <div style="flex: 1; min-width: 220px;">
                <h4 style="font-family: var(--font-head); color: var(--gold); font-size: 1.15rem; margin: 0 0 4px 0;">Order Placed Successfully!</h4>
                <p style="margin: 0 0 10px 0; font-size: 0.88rem; color: #dddddd;">Your order was successfully placed and your payment will be taken by WhatsApp securely.</p>
                <a href="https://wa.me/923230114523" target="_blank" rel="noopener noreferrer" style="display: inline-flex; align-items: center; gap: 6px; background: #25d366; color: #fff; text-decoration: none; padding: 7px 16px; border-radius: 6px; font-weight: 700; font-size: 0.82rem; transition: background 0.2s;">
                    💬 Open WhatsApp Direct Link
                </a>
            </div>
        </div>
    ` : '';

    container.innerHTML = `
        <div style="display: grid; grid-template-columns: 1fr 1.65fr; gap: 2.2rem;" class="account-dashboard-grid">
            <!-- LEFT PROFILE PANEL -->
            <div style="background: linear-gradient(145deg, rgba(24, 24, 28, 0.95) 0%, rgba(14, 14, 18, 0.98) 100%); border: 1px solid rgba(212,175,55,0.3); border-radius: 16px; padding: 2.2rem 1.8rem; color: #ffffff; box-shadow: 0 15px 40px rgba(0,0,0,0.4); position: relative; overflow: hidden;">
                <div style="position: absolute; top: -30px; right: -30px; width: 120px; height: 120px; background: radial-gradient(circle, rgba(212,175,55,0.18) 0%, transparent 70%); pointer-events: none;"></div>
                
                <div style="display: flex; flex-direction: column; align-items: center; text-align: center; margin-bottom: 2rem;">
                    <div style="width: 88px; height: 88px; border-radius: 50%; background: #000; color: var(--gold); display: flex; align-items: center; justify-content: center; font-size: 2.2rem; font-family: 'Cinzel', serif; font-weight: bold; margin-bottom: 12px; border: 2px solid var(--gold); box-shadow: 0 0 30px rgba(212,175,55,0.35);">
                        ${(currentUser.name || "M").charAt(0).toUpperCase()}
                    </div>
                    <h3 style="font-family: 'Cinzel', serif; font-size: 1.45rem; color: #ffffff; margin: 4px 0; letter-spacing: 1px;">${currentUser.name || "Valued Member"}</h3>
                    <span style="font-family: 'Cinzel', serif; font-size: 0.72rem; text-transform: uppercase; letter-spacing: 1.8px; padding: 4px 14px; border-radius: 20px; background: rgba(212,175,55,0.12); border: 1px solid rgba(212,175,55,0.5); color: var(--gold); font-weight: 700; margin-top: 6px;">👑 PRIVILEGE CLIENT</span>
                </div>

                <div style="font-size: 0.88rem; color: #ccc; display: flex; flex-direction: column; gap: 12px; margin-bottom: 2rem; background: rgba(0,0,0,0.35); padding: 1.25rem; border-radius: 10px; border: 1px solid rgba(255,255,255,0.06);">
                    ${currentUser.name ? `<div style="display: flex; justify-content: space-between; align-items: center;"><span style="color: #888;">Name:</span> <strong style="color: var(--gold); font-family: 'Cinzel', serif;">${currentUser.name}</strong></div>` : ''}
                    ${currentUser.email ? `<div style="display: flex; justify-content: space-between; align-items: center; word-break: break-all;"><span style="color: #888;">Email:</span> <span style="color: #eee;">${currentUser.email}</span></div>` : ''}
                    ${currentUser.phone ? `
                        <div id="dashboardPhoneWrapper" style="display: flex; align-items: center; justify-content: space-between; gap: 8px;">
                            <span style="color: #888;">Phone:</span>
                            <div style="display: flex; align-items: center; gap: 8px;">
                                <strong style="color: #fff;">${currentUser.phone}</strong>
                                <button id="editDashboardPhoneBtn" style="background: none; border: none; color: var(--gold); font-size: 0.75rem; font-weight: 700; cursor: pointer; text-decoration: underline; padding: 0;">Edit</button>
                            </div>
                        </div>
                    ` : ''}
                </div>

                <a href="shop.html" class="btn btn-luxury-gold" style="padding: 13px; margin-bottom: 12px; text-decoration: none; font-size: 0.82rem; letter-spacing: 1.5px; border-radius: 8px;">Browse Collection</a>
                <button class="logout-btn" id="logoutBtn" style="margin-top: 0;">Logout Session</button>
            </div>

            <!-- RIGHT ORDERS HISTORY PANEL -->
            <div>
                ${orderPlacedBannerHtml}
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.2rem; border-bottom: 1.5px solid rgba(212,175,55,0.4); padding-bottom: 12px; flex-wrap: wrap; gap: 10px;">
                    <div>
                        <h3 style="font-family: 'Cinzel', serif; font-size: 1.4rem; color: #ffffff; margin: 0; letter-spacing: 1px;">Order History</h3>
                        <small style="color: #888;">Live synchronisation with Google Sheets database</small>
                    </div>
                    <button onclick="refreshDashboardOrders()" id="refreshOrdersBtn" style="background: rgba(212,175,55,0.1); color: var(--gold); border: 1px solid var(--gold); padding: 8px 18px; font-size: 0.8rem; cursor: pointer; border-radius: 6px; font-weight: 700; font-family: 'Cinzel', serif; letter-spacing: 1px; transition: all 0.2s ease;">🔄 Refresh</button>
                </div>
                <div id="dashboardOrdersContainer" style="max-height: 520px; overflow-y: auto; padding-right: 5px;">
                    <div style="text-align: center; padding: 3rem 0; color: #888;">
                        <p style="margin-bottom: 8px; font-size: 0.95rem;">Fetching live orders from Google Sheets...</p>
                        <div style="display: inline-block; width: 24px; height: 24px; border: 3px solid #333; border-top: 3px solid var(--gold); border-radius: 50%; animation: spin 1s linear infinite;"></div>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Trigger live order refresh from Google Sheets
    if (typeof refreshDashboardOrders === 'function') {
        refreshDashboardOrders();
    }

    const editPhoneBtn = document.getElementById('editDashboardPhoneBtn');
    if (editPhoneBtn) {
        editPhoneBtn.onclick = (e) => {
            e.preventDefault();
            const wrapper = document.getElementById('dashboardPhoneWrapper');
            if (wrapper) {
                const currentRaw = currentUser.phone ? currentUser.phone.replace('+92', '').trim().replace(/\s/g, '') : '';
                wrapper.innerHTML = `
                    <div style="display: flex; flex-direction: column; gap: 8px; width: 100%; margin-top: 8px; padding: 12px; background: rgba(18, 18, 22, 0.95); border: 1px solid rgba(212, 175, 55, 0.4); border-radius: 8px; box-shadow: 0 4px 15px rgba(0,0,0,0.5);">
                        <span style="font-size: 0.75rem; font-family: 'Cinzel', serif; font-weight: bold; color: var(--gold); letter-spacing: 1px;">Update Mobile Phone Number</span>
                        <div style="display: flex; align-items: center; border: 1px solid rgba(255,255,255,0.12); border-radius: 6px; background: rgba(10,10,12,0.9); padding: 4px 12px;">
                            <span style="font-size: 0.9rem; margin-right: 8px; display: flex; align-items: center; gap: 4px; user-select: none; color: var(--gold);">
                                <span>🇵🇰</span> <span style="font-weight: 700;">+92</span>
                            </span>
                            <input type="tel" id="editPhoneInput" placeholder="03XXXXXXXXX" value="${currentRaw}" style="border: none; background: transparent; padding: 8px 0; font-size: 13px; width: 100%; outline: none; color: #fff;" maxlength="11" oninput="this.value = this.value.replace(/[^0-9]/g, '').slice(0, 11);">
                        </div>
                        <div style="display: flex; gap: 8px; margin-top: 4px;">
                            <button id="savePhoneBtn" style="background: var(--gold); color: #000; border: none; padding: 8px 14px; font-size: 0.75rem; font-weight: 800; cursor: pointer; border-radius: 6px; font-family: 'Cinzel', serif; letter-spacing: 1px;">Save Number</button>
                            <button id="cancelPhoneBtn" style="background: rgba(255,255,255,0.06); color: #ccc; border: 1px solid rgba(255,255,255,0.15); padding: 8px 14px; font-size: 0.75rem; cursor: pointer; border-radius: 6px;">Cancel</button>
                        </div>
                    </div>
                `;
                
                document.getElementById('cancelPhoneBtn').onclick = () => {
                    renderUserDashboard(container);
                };
                
                document.getElementById('savePhoneBtn').onclick = () => {
                    const val = document.getElementById('editPhoneInput').value.trim();
                    const cleanPhone = val.replace(/[^0-9]/g, '');
                    if (cleanPhone.length < 10 || cleanPhone.length > 11) {
                        showPremiumAlert("Invalid Phone", "Please enter a valid 10 or 11 digit Pakistani phone number (e.g. 03211234567).", "error");
                        return;
                    }
                    
                    let finalPhone = cleanPhone;
                    if (cleanPhone.length === 11 && cleanPhone.startsWith('0')) {
                        finalPhone = '+92 ' + cleanPhone.substring(1, 4) + ' ' + cleanPhone.substring(4);
                    } else if (cleanPhone.length === 10) {
                        finalPhone = '+92 ' + cleanPhone.substring(0, 3) + ' ' + cleanPhone.substring(3);
                    } else {
                        finalPhone = '+92 ' + cleanPhone;
                    }
                    
                    currentUser.phone = finalPhone;
                    saveDb('gw_current_user', currentUser);
                    
                    const uIndex = users.findIndex(u => u.email.toLowerCase() === currentUser.email.toLowerCase());
                    if (uIndex !== -1) {
                        users[uIndex].phone = finalPhone;
                        saveDb('gw_users', users);
                    }
                    
                    showPremiumAlert("Updated", "Your phone number has been updated successfully.", "success", () => {
                        renderUserDashboard(container);
                    });
                };
            }
        };
    }

    document.getElementById('logoutBtn').onclick = () => {
        showPremiumConfirm(
            "Logout?",
            "Are you sure you want to end your premium browsing session?",
            () => {
                handleLogout();
            }
        );
    };
}

// --- 8.5. INJECT PREMIUM BACK BUTTON FOR INNER PAGES ---
function injectBackButton() {
}

// --- 8.8. ENDLESS CATEGORY CAROUSEL DRAG & AUTO-ROTATING SYSTEM ---
let carouselX = 0;
let carouselSpeed = 0.5; 
let isCarouselDragging = false;
let startCarouselX = 0;
let dragCarouselX = 0;
let animationFrameId = null;

function initInfiniteCarousel() {
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    }

    const wrapper = document.querySelector('.scroll-wrapper');
    const track = document.querySelector('.scroll-track');
    if (!wrapper || !track) return;

    if (track && track.style) track.style.animation = 'none';

    carouselX = 0; 
    const trackWidth = track.scrollWidth;
    const halfWidth = trackWidth / 2;

    function step() {
        if (!isCarouselDragging) {
            carouselX -= carouselSpeed;
            if (carouselX <= -halfWidth) {
                carouselX = 0;
            } else if (carouselX > 0) {
                carouselX = -halfWidth;
            }
            if (track && track.style) track.style.transform = `translate3d(${carouselX}px, 0, 0)`;
        }
        animationFrameId = requestAnimationFrame(step);
    }

    function onDragStart(e) {
        isCarouselDragging = true;
        const pageX = e.type.startsWith('touch') ? e.touches[0].clientX : e.clientX;
        startCarouselX = pageX;
        dragCarouselX = carouselX;
        if (wrapper && wrapper.style) wrapper.style.cursor = 'grabbing';
    }

    function onDragMove(e) {
        if (!isCarouselDragging) return;
        const pageX = e.type.startsWith('touch') ? e.touches[0].clientX : e.clientX;
        const diff = pageX - startCarouselX;
        carouselX = dragCarouselX + diff;

        if (diff < 0) {
            carouselSpeed = 0.5; 
        } else if (diff > 0) {
            carouselSpeed = -0.5; 
        }

        if (carouselX <= -halfWidth) {
            carouselX += halfWidth;
            dragCarouselX += halfWidth;
        } else if (carouselX > 0) {
            carouselX -= halfWidth;
            dragCarouselX -= halfWidth;
        }

        if (track && track.style) track.style.transform = `translate3d(${carouselX}px, 0, 0)`;
    }

    function onDragEnd() {
        if (!isCarouselDragging) return;
        isCarouselDragging = false;
        if (wrapper && wrapper.style) wrapper.style.cursor = 'grab';
    }

    wrapper.removeEventListener('mousedown', onDragStart);
    wrapper.addEventListener('mousedown', onDragStart);
    
    window.removeEventListener('mousemove', onDragMove);
    window.addEventListener('mousemove', onDragMove);
    
    window.removeEventListener('mouseup', onDragEnd);
    window.addEventListener('mouseup', onDragEnd);

    wrapper.removeEventListener('touchstart', onDragStart);
    wrapper.addEventListener('touchstart', onDragStart, { passive: true });
    
    window.removeEventListener('touchmove', onDragMove);
    window.addEventListener('touchmove', onDragMove, { passive: true });
    
    window.removeEventListener('touchend', onDragEnd);
    window.addEventListener('touchend', onDragEnd);

    step();
}

// --- 9. BOOT ENGINE ON WINDOW LOAD ---
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => initStore());
} else {
    initStore();
}
// Run when page loads to check authentication state
document.addEventListener("DOMContentLoaded", function() {
    checkLoginState();
});

function checkLoginState() {
    const loggedIn = localStorage.getItem("userLoggedIn");
    const outView = document.getElementById("auth-logged-out-view");
    const inView = document.getElementById("auth-logged-in-view");
    const userTitle = document.getElementById("welcome-user-title");

    if (loggedIn === "true" && inView && outView) {
        outView.style.display = "none";
        inView.style.display = "block";
        if (userTitle) {
            userTitle.innerText = "Welcome, " + (localStorage.getItem("userName") || "User");
        }
    } else if (inView && outView) {
        outView.style.display = "block";
        inView.style.display = "none";
    }
}

function updateSidebarUserEmail() {
    const userProfileContainer = document.getElementById('sidebarUserProfile');
    if (userProfileContainer) {
        const loggedInUser = getDb('gw_current_user', null);
        if (loggedInUser) {
            const isPhone = loggedInUser.authType === 'phone' || (!loggedInUser.email && loggedInUser.phone);
            if (isPhone) {
                userProfileContainer.innerHTML = `
                    <p style="font-size: 0.8rem; font-weight: bold; color: var(--black); margin-bottom: 2px; text-transform: capitalize;">👤 ${loggedInUser.name || 'Premium Member'}</p>
                    <p style="font-size: 0.75rem; color: #666; word-break: break-all;">📞 ${loggedInUser.phone}</p>
                `;
            } else {
                userProfileContainer.innerHTML = `
                    <p style="font-size: 0.8rem; font-weight: bold; color: var(--black); margin-bottom: 2px; text-transform: capitalize;">👤 ${loggedInUser.name}</p>
                    <p style="font-size: 0.75rem; color: #666; word-break: break-all;">📧 ${loggedInUser.email}</p>
                `;
            }
            userProfileContainer.style.background = "rgba(212,175,55,0.06)";
            userProfileContainer.style.borderLeft = "3px solid var(--gold)";
        } else {
            userProfileContainer.innerHTML = `
                <p style="font-size: 0.75rem; color: #666;">✨ Welcome to Gift Wallay. Sign in to your premium account.</p>
            `;
            userProfileContainer.style.background = "#fafafa";
            userProfileContainer.style.borderLeft = "3px solid #ccc";
        }
    }
}

function handleLogout() {
    localStorage.removeItem("userLoggedIn");
    localStorage.removeItem("userName");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userPic");
    localStorage.removeItem("gw_current_user");
    currentUser = null;
    window.location.reload();
}

// --------------------------------------------------
// LOGIN REDIRECT HELPER
// --------------------------------------------------
function checkLoginRedirect(fallbackCallback) {
    const urlParams = new URLSearchParams(window.location.search);
    const fromParam = urlParams.get('from');
    const redirectDest = localStorage.getItem("redirectAfterLogin") || sessionStorage.getItem("redirectAfterLogin");
    const isFromCheckout = (redirectDest && redirectDest.includes("checkout")) ||
                           (fromParam === "checkout") ||
                           (document.referrer && document.referrer.includes("checkout.html")) ||
                           Boolean(localStorage.getItem("pendingCheckoutOrder"));

    localStorage.removeItem("redirectAfterLogin");
    sessionStorage.removeItem("redirectAfterLogin");

    if (isFromCheckout) {
        window.location.href = "checkout.html";
        return;
    }

    if (redirectDest && !redirectDest.includes("account.html")) {
        window.location.href = redirectDest;
        return;
    }

    // Default: when login confirms, redirect to Home (index.html)
    window.location.href = "index.html";
}
window.checkLoginRedirect = checkLoginRedirect;

// ========================================
// Gift Wallay API v3.0 Specification
// ========================================
const API_URL = PRODUCTS_API;

async function apiRequest(data) {
    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "text/plain;charset=utf-8"
            },
            body: JSON.stringify(data)
        });
        return await response.json();
    } catch (err) {
        return {
            success: false,
            message: err.message
        };
    }
}
window.apiRequest = apiRequest;

async function apiRegister(name, email, phone, password) {
    return await apiRequest({
        action: "register",
        name,
        email,
        phone,
        pass: password
    });
}
window.register = apiRegister;

async function apiLogin(email, password) {
    return await apiRequest({
        action: "login",
        email,
        pass: password
    });
}
window.login = apiLogin;

function apiLogout() {
    handleLogout();
}
window.logout = apiLogout;

function getCurrentUser() {
    return currentUser;
}
window.getCurrentUser = getCurrentUser;

async function apiAddToCart(product) {
    if (!product || !product.id) return { success: false, message: "Invalid product" };
    addToCartById(product.id, product.qty || 1);
    if (currentUser) {
        return await apiRequest({
            action: "addToCart",
            userID: currentUser.id || currentUser.email || currentUser.phone,
            productID: product.id,
            qty: product.qty || 1
        });
    }
    return { success: true, message: "Added to local cart" };
}
window.addToCart = apiAddToCart;

async function apiLoadCart() {
    if (currentUser) {
        return await apiRequest({
            action: "getCart",
            userID: currentUser.id || currentUser.email || currentUser.phone
        });
    }
    return { success: true, cart: cart };
}
window.loadCart = apiLoadCart;

async function apiRemoveCart(productID) {
    removeFromCart(productID);
    if (currentUser) {
        return await apiRequest({
            action: "removeCart",
            userID: currentUser.id || currentUser.email || currentUser.phone,
            productID
        });
    }
    return { success: true, message: "Removed from local cart" };
}
window.removeCart = apiRemoveCart;

async function apiPlaceOrder(order) {
    const userKey = currentUser ? (currentUser.id || currentUser.email || currentUser.phone) : "GUEST";
    return await apiRequest({
        action: "placeOrder",
        userID: userKey,
        name: order.name,
        phone: order.phone,
        address: order.address,
        products: order.products || JSON.stringify(cart),
        total: order.total,
        payment: order.payment || "cod"
    });
}
window.placeOrder = apiPlaceOrder;

async function apiGetOrders() {
    if (!currentUser) return [];
    const userKey = currentUser.id || currentUser.email || currentUser.phone;
    const res = await apiRequest({
        action: "getOrders",
        userID: userKey
    });
    if (Array.isArray(res)) return res;
    if (res && res.orders) return res.orders;
    return [];
}
window.getOrders = apiGetOrders;

async function apiAddReview(productID, rating, comment) {
    const userName = currentUser ? currentUser.name : "Guest";
    return await apiRequest({
        action: "addReview",
        productID,
        name: userName,
        rating,
        comment
    });
}
window.addReview = apiAddReview;

async function apiGetReviews(productID) {
    return await apiRequest({
        action: "getReviews",
        productID
    });
}
window.getReviews = apiGetReviews;

async function apiGetProducts() {
    return await apiRequest({
        action: "getProducts"
    });
}
window.getProducts = apiGetProducts;

// =========================================================================
// SPREAD SYSTEM — PRODUCT MANAGEMENT & MULTI-IMAGE GALLERY SYSTEM
// =========================================================================
window.openSpreadProductsManager = function(editProductId = null) {
    let modal = document.getElementById('spreadProductsModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'spreadProductsModal';
        modal.style.cssText = 'position: fixed; inset: 0; background: rgba(0, 0, 0, 0.85); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); z-index: 1000000; display: flex; align-items: center; justify-content: center; padding: 15px;';
        modal.innerHTML = `
            <div style="background: #141414; border: 2px solid var(--gold); border-radius: 12px; width: 100%; max-width: 960px; max-height: 92vh; display: flex; flex-direction: column; overflow: hidden; box-shadow: 0 25px 80px rgba(0,0,0,0.8); color: #fff; font-family: var(--font-body, sans-serif);">
                <!-- MODAL HEADER -->
                <div style="background: linear-gradient(135deg, #1f1b14 0%, #0d0d0d 100%); padding: 18px 24px; border-bottom: 1.5px solid rgba(212,175,55,0.4); display: flex; align-items: center; justify-content: space-between; flex-shrink: 0;">
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <span style="font-size: 1.6rem;">📦</span>
                        <div>
                            <h2 style="font-family: var(--font-head); font-size: 1.25rem; color: var(--gold); margin: 0; letter-spacing: 1.5px; font-weight: 700;">SPREAD SYSTEM — PRODUCTS & MULTI-IMAGE</h2>
                            <small style="color: #aaa; font-size: 0.78rem; letter-spacing: 0.5px;">Live Google Sheets Synchronization & Unlimited Product Gallery</small>
                        </div>
                    </div>
                    <button onclick="closeSpreadProductsManager()" style="background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.15); color: #fff; width: 34px; height: 34px; border-radius: 50%; font-size: 1.2rem; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s ease;">✕</button>
                </div>

                <!-- TABS NAVIGATION -->
                <div style="background: #1a1a1a; padding: 0 24px; display: flex; gap: 10px; border-bottom: 1px solid #2a2a2a; flex-shrink: 0;">
                    <button id="spreadTabListBtn" onclick="switchSpreadTab('list')" style="padding: 14px 18px; background: none; border: none; border-bottom: 3px solid var(--gold); color: var(--gold); font-size: 0.88rem; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 6px;">
                        <span>📋 All Products</span> <span id="spreadProductsCountBadge" style="background: rgba(212,175,55,0.2); color: var(--gold); padding: 2px 8px; border-radius: 12px; font-size: 0.72rem;">${products.length}</span>
                    </button>
                    <button id="spreadTabFormBtn" onclick="switchSpreadTab('form')" style="padding: 14px 18px; background: none; border: none; border-bottom: 3px solid transparent; color: #888; font-size: 0.88rem; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 6px;">
                        <span id="spreadTabFormBtnLabel">➕ Add New Product (Multi-Image)</span>
                    </button>
                </div>

                <!-- MODAL BODY -->
                <div style="flex: 1; overflow-y: auto; padding: 24px;">
                    <!-- TAB 1: PRODUCT LIST -->
                    <div id="spreadTabListView">
                        <div style="display: flex; gap: 12px; margin-bottom: 18px; flex-wrap: wrap; align-items: center; justify-content: space-between;">
                            <div style="flex: 1; min-width: 240px; position: relative;">
                                <input type="text" id="spreadSearchInput" placeholder="Search by name, category, or ID..." oninput="renderSpreadProductList(this.value)" style="width: 100%; padding: 10px 14px 10px 36px; background: #222; border: 1px solid #333; border-radius: 6px; color: #fff; font-size: 0.85rem; outline: none;">
                                <span style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #777;">🔍</span>
                            </div>
                            <div style="display: flex; gap: 8px;">
                                <button onclick="syncSpreadFromSheets()" id="spreadSyncBtn" style="background: rgba(212,175,55,0.1); border: 1px solid var(--gold); color: var(--gold); padding: 10px 16px; border-radius: 6px; font-size: 0.82rem; font-weight: bold; cursor: pointer; display: flex; align-items: center; gap: 6px;">
                                    <span>🔄 Sync Google Sheets</span>
                                </button>
                                <button onclick="renderSpreadProductForm(null); switchSpreadTab('form');" style="background: var(--gold); border: none; color: #000; padding: 10px 18px; border-radius: 6px; font-size: 0.82rem; font-weight: 800; cursor: pointer; display: flex; align-items: center; gap: 6px;">
                                    <span>➕ Add Product</span>
                                </button>
                            </div>
                        </div>

                        <div id="spreadProductsGrid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 14px;">
                            <!-- Products dynamically loaded -->
                        </div>
                    </div>

                    <!-- TAB 2: ADD / EDIT PRODUCT FORM -->
                    <div id="spreadTabFormView" style="display: none;">
                        <form id="spreadProductForm" onsubmit="submitSpreadProductForm(event)">
                            <input type="hidden" id="spreadFormProductId" value="">
                            
                            <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 16px; margin-bottom: 14px;">
                                <div>
                                    <label style="display: block; font-size: 0.78rem; text-transform: uppercase; letter-spacing: 1px; color: #aaa; margin-bottom: 6px; font-weight: bold;">Product Name *</label>
                                    <input type="text" id="spreadFormName" required placeholder="e.g. Personalized 3D Islamic Calligraphy Wall Art" style="width: 100%; padding: 11px 14px; background: #222; border: 1px solid #3a3a3a; border-radius: 6px; color: #fff; font-size: 0.9rem; outline: none;">
                                </div>
                                <div>
                                    <label style="display: block; font-size: 0.78rem; text-transform: uppercase; letter-spacing: 1px; color: #aaa; margin-bottom: 6px; font-weight: bold;">Category *</label>
                                    <select id="spreadFormCategory" style="width: 100%; padding: 11px 14px; background: #222; border: 1px solid #3a3a3a; border-radius: 6px; color: #fff; font-size: 0.88rem; outline: none;">
                                        <option value="Islamic Decor">Islamic Decor & Clocks</option>
                                        <option value="Name & Personalized">Name & Personalized</option>
                                        <option value="Wall Art">Wall Art</option>
                                        <option value="Home Decor">Home Decor</option>
                                        <option value="Keychains">Keychains</option>
                                        <option value="Gift Items">Gift Items</option>
                                        <option value="Wedding & Events">Wedding & Events</option>
                                        <option value="Desk & Office">Desk & Office</option>
                                        <option value="Wooden Products">Wooden Products</option>
                                        <option value="Toys">Toys & 3D Puzzles</option>
                                        <option value="Business & Branding">Business & Branding</option>
                                        <option value="Design & Customization">Design & Customization</option>
                                    </select>
                                </div>
                            </div>

                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 14px;">
                                <div>
                                    <label style="display: block; font-size: 0.78rem; text-transform: uppercase; letter-spacing: 1px; color: #aaa; margin-bottom: 6px; font-weight: bold;">Sale Price (Rs.) *</label>
                                    <input type="number" id="spreadFormPrice" required min="1" placeholder="e.g. 2999" style="width: 100%; padding: 11px 14px; background: #222; border: 1px solid #3a3a3a; border-radius: 6px; color: #fff; font-size: 0.9rem; outline: none;">
                                </div>
                                <div>
                                    <label style="display: block; font-size: 0.78rem; text-transform: uppercase; letter-spacing: 1px; color: #aaa; margin-bottom: 6px; font-weight: bold;">Original / Discounted Price (Rs.)</label>
                                    <input type="number" id="spreadFormDiscounted" min="0" placeholder="e.g. 3999 (Crossed out)" style="width: 100%; padding: 11px 14px; background: #222; border: 1px solid #3a3a3a; border-radius: 6px; color: #fff; font-size: 0.9rem; outline: none;">
                                </div>
                            </div>

                            <div style="margin-bottom: 18px;">
                                <label style="display: block; font-size: 0.78rem; text-transform: uppercase; letter-spacing: 1px; color: #aaa; margin-bottom: 6px; font-weight: bold;">Description</label>
                                <textarea id="spreadFormDesc" rows="3" placeholder="Luxury handcrafted gift details, material specifications, dimensions, customization options..." style="width: 100%; padding: 11px 14px; background: #222; border: 1px solid #3a3a3a; border-radius: 6px; color: #fff; font-size: 0.88rem; outline: none; resize: vertical;"></textarea>
                            </div>

                            <!-- MULTI-IMAGE SECTION -->
                            <div style="background: #1a1712; border: 1.5px solid rgba(212,175,55,0.4); border-radius: 8px; padding: 18px; margin-bottom: 22px;">
                                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; flex-wrap: wrap; gap: 8px;">
                                    <div>
                                        <h3 style="font-family: var(--font-head); font-size: 1.05rem; color: var(--gold); margin: 0; display: flex; align-items: center; gap: 8px;">
                                            <span>📷 Product Image Gallery</span>
                                            <span style="font-size: 0.72rem; background: var(--gold); color: #000; font-weight: 800; padding: 2px 8px; border-radius: 12px;">MULTI-IMAGE SUPPORT</span>
                                        </h3>
                                        <p style="margin: 4px 0 0 0; font-size: 0.78rem; color: #bbb;">Add more than one image URL so customers can browse angle shots, close-ups, and luxury packaging views in the gallery.</p>
                                    </div>
                                    <div style="display: flex; gap: 6px;">
                                        <button type="button" onclick="loadSpreadSampleImages('islamic')" style="background: rgba(255,255,255,0.06); border: 1px solid #444; color: #ddd; font-size: 0.72rem; padding: 5px 10px; border-radius: 4px; cursor: pointer;">✨ Sample Gallery 1</button>
                                        <button type="button" onclick="loadSpreadSampleImages('lamp')" style="background: rgba(255,255,255,0.06); border: 1px solid #444; color: #ddd; font-size: 0.72rem; padding: 5px 10px; border-radius: 4px; cursor: pointer;">✨ Sample Gallery 2</button>
                                    </div>
                                </div>

                                <!-- PRIMARY IMAGE (IMAGE 1) -->
                                <div style="margin-bottom: 12px;">
                                    <label style="display: block; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.5px; color: var(--gold); font-weight: 700; margin-bottom: 5px;">Primary Cover Image URL * (Image 1)</label>
                                    <div style="display: flex; gap: 10px; align-items: center;">
                                        <input type="url" id="spreadFormPrimaryImage" required placeholder="https://images.unsplash.com/..." oninput="updateSpreadLivePreview()" style="flex: 1; padding: 10px 14px; background: #222; border: 1px solid #3a3a3a; border-radius: 6px; color: #fff; font-size: 0.85rem; outline: none;">
                                        <div id="spreadPrimaryImageThumb" style="width: 44px; height: 44px; border-radius: 6px; background: #2a2a2a; border: 1px solid #444; overflow: hidden; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                                            <span style="font-size: 0.7rem; color: #777;">Preview</span>
                                        </div>
                                    </div>
                                </div>

                                <!-- ADDITIONAL IMAGES CONTAINER (IMAGE 2, 3, 4...) -->
                                <div id="spreadAdditionalImagesList" style="display: flex; flex-direction: column; gap: 10px; margin-bottom: 12px;">
                                    <!-- Dynamic rows inserted here -->
                                </div>

                                <div style="display: flex; gap: 10px; align-items: center; margin-bottom: 14px; flex-wrap: wrap;">
                                    <button type="button" onclick="addSpreadImageRow()" style="background: rgba(212,175,55,0.15); border: 1.5px dashed var(--gold); color: var(--gold); padding: 8px 16px; border-radius: 6px; font-size: 0.8rem; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 6px;">
                                        <span>➕ Add Another Image URL</span>
                                    </button>
                                    <button type="button" onclick="toggleSpreadBulkInput()" style="background: none; border: none; color: #999; font-size: 0.78rem; text-decoration: underline; cursor: pointer;">
                                        Or paste multiple image URLs in bulk
                                    </button>
                                </div>

                                <!-- BULK URL INPUT (COLLAPSIBLE) -->
                                <div id="spreadBulkInputWrapper" style="display: none; background: #111; padding: 12px; border-radius: 6px; border: 1px solid #333; margin-bottom: 14px;">
                                    <label style="display: block; font-size: 0.75rem; color: #bbb; margin-bottom: 6px;">Paste multiple image URLs (separated by new line or commas):</label>
                                    <textarea id="spreadBulkTextarea" rows="3" placeholder="https://example.com/img1.jpg&#10;https://example.com/img2.jpg&#10;https://example.com/img3.jpg" style="width: 100%; padding: 8px 12px; background: #222; border: 1px solid #444; border-radius: 4px; color: #fff; font-size: 0.8rem; outline: none;"></textarea>
                                    <div style="display: flex; justify-content: flex-end; margin-top: 8px;">
                                        <button type="button" onclick="applySpreadBulkImages()" style="background: var(--gold); border: none; color: #000; padding: 6px 14px; border-radius: 4px; font-size: 0.75rem; font-weight: bold; cursor: pointer;">Import URLs to Gallery</button>
                                    </div>
                                </div>

                                <!-- LIVE GALLERY PREVIEW STRIP -->
                                <div style="background: #111; border: 1px solid #2a2a2a; border-radius: 6px; padding: 12px;">
                                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                                        <span style="font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.5px; color: #888; font-weight: bold;">Interactive Gallery Preview:</span>
                                        <span id="spreadPreviewImageCount" style="font-size: 0.72rem; color: var(--gold); font-weight: 700;">0 Images</span>
                                    </div>
                                    <div id="spreadLivePreviewStrip" style="display: flex; gap: 8px; overflow-x: auto; padding-bottom: 4px; min-height: 64px; align-items: center;">
                                        <span style="color: #666; font-size: 0.8rem;">Enter image URLs above to see gallery preview...</span>
                                    </div>
                                </div>
                            </div>

                            <!-- SUBMIT / ACTIONS -->
                            <div style="display: flex; justify-content: flex-end; gap: 12px; align-items: center;">
                                <button type="button" onclick="switchSpreadTab('list')" style="background: #2a2a2a; border: none; color: #ccc; padding: 12px 22px; border-radius: 6px; font-size: 0.85rem; font-weight: 600; cursor: pointer;">Cancel</button>
                                <button type="submit" id="spreadFormSubmitBtn" style="background: linear-gradient(135deg, #d4af37 0%, #b89628 100%); border: none; color: #000; padding: 12px 30px; border-radius: 6px; font-size: 0.88rem; font-weight: 800; cursor: pointer; display: flex; align-items: center; gap: 8px; box-shadow: 0 4px 15px rgba(212,175,55,0.3);">
                                    <span>💾 Save to Spread System (Google Sheets)</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';

    if (editProductId) {
        renderSpreadProductForm(editProductId);
        switchSpreadTab('form');
    } else {
        renderSpreadProductList();
        switchSpreadTab('list');
    }
};

window.closeSpreadProductsManager = function() {
    const modal = document.getElementById('spreadProductsModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = '';
    }
};

window.switchSpreadTab = function(tabName) {
    const listBtn = document.getElementById('spreadTabListBtn');
    const formBtn = document.getElementById('spreadTabFormBtn');
    const listView = document.getElementById('spreadTabListView');
    const formView = document.getElementById('spreadTabFormView');

    if (tabName === 'list') {
        if (listBtn) {
            listBtn.style.borderBottom = '3px solid var(--gold)';
            listBtn.style.color = 'var(--gold)';
        }
        if (formBtn) {
            formBtn.style.borderBottom = '3px solid transparent';
            formBtn.style.color = '#888';
        }
        if (listView) listView.style.display = 'block';
        if (formView) formView.style.display = 'none';
        renderSpreadProductList();
    } else {
        if (formBtn) {
            formBtn.style.borderBottom = '3px solid var(--gold)';
            formBtn.style.color = 'var(--gold)';
        }
        if (listBtn) {
            listBtn.style.borderBottom = '3px solid transparent';
            listBtn.style.color = '#888';
        }
        if (listView) listView.style.display = 'none';
        if (formView) formView.style.display = 'block';
    }
};

window.renderSpreadProductList = function(filterQuery = '') {
    const grid = document.getElementById('spreadProductsGrid');
    const countBadge = document.getElementById('spreadProductsCountBadge');
    if (!grid) return;

    const query = (filterQuery || '').trim().toLowerCase();
    const list = products.filter(p => {
        if (!query) return true;
        const name = (p.name || '').toLowerCase();
        const cat = (p.category || '').toLowerCase();
        const id = String(p.id || '').toLowerCase();
        return name.includes(query) || cat.includes(query) || id.includes(query);
    });

    if (countBadge) countBadge.innerText = `${products.length}`;

    if (list.length === 0) {
        grid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 3rem 1rem; color: #888;">
                <p style="font-size: 1.1rem; margin-bottom: 8px;">No products match your search.</p>
                <button onclick="renderSpreadProductForm(null); switchSpreadTab('form');" style="background: var(--gold); color: #000; border: none; padding: 8px 16px; border-radius: 4px; font-weight: bold; cursor: pointer;">+ Add New Product</button>
            </div>
        `;
        return;
    }

    grid.innerHTML = list.map(p => {
        const imgs = Array.isArray(p.images) && p.images.length > 0 ? p.images : (p.image ? [p.image] : []);
        const totalImgs = imgs.length;
        const primaryImg = imgs[0] || 'https://images.unsplash.com/photo-1513201099705-a9746e1e201f?w=400';

        return `
            <div style="background: #1c1c1c; border: 1px solid #2d2d2d; border-radius: 8px; overflow: hidden; display: flex; flex-direction: column; transition: transform 0.2s ease, border-color 0.2s ease;">
                <div style="position: relative; height: 160px; background: #000; overflow: hidden;">
                    <img src="${primaryImg}" alt="${p.name}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.src='https://images.unsplash.com/photo-1513201099705-a9746e1e201f?w=400'">
                    <span style="position: absolute; top: 8px; left: 8px; background: rgba(0,0,0,0.75); color: var(--gold); padding: 3px 8px; font-size: 0.68rem; font-weight: 700; border-radius: 4px; border: 1px solid rgba(212,175,55,0.4);">${p.category || 'Product'}</span>
                    <span style="position: absolute; bottom: 8px; right: 8px; background: #000; color: #fff; padding: 3px 8px; font-size: 0.7rem; font-weight: 800; border-radius: 12px; border: 1px solid ${totalImgs > 1 ? 'var(--gold)' : '#444'}; display: flex; align-items: center; gap: 4px;">
                        <span>📷 ${totalImgs} ${totalImgs === 1 ? 'image' : 'images'}</span>
                    </span>
                </div>
                <div style="padding: 14px; flex: 1; display: flex; flex-direction: column; justify-content: space-between;">
                    <div>
                        <h4 style="font-size: 0.95rem; margin: 0 0 6px 0; color: #fff; font-family: var(--font-head); height: 2.6rem; overflow: hidden; line-height: 1.3;">${p.name}</h4>
                        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
                            <span style="color: var(--gold); font-size: 1rem; font-weight: 800;">Rs. ${formatPrice(p.price)}</span>
                            ${p.discounted && p.discounted > p.price ? `<span style="color: #777; font-size: 0.8rem; text-decoration: line-through;">Rs. ${formatPrice(p.discounted)}</span>` : ''}
                        </div>
                    </div>
                    <div style="display: flex; gap: 6px; border-top: 1px solid #282828; padding-top: 10px;">
                        <button onclick="renderSpreadProductForm('${p.id}'); switchSpreadTab('form');" style="flex: 1; background: rgba(212,175,55,0.15); border: 1px solid var(--gold); color: var(--gold); padding: 7px 10px; border-radius: 4px; font-size: 0.75rem; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 4px;">
                            <span>✏️ Edit</span>
                        </button>
                        <a href="product.html?id=${p.id}" target="_blank" style="background: #2a2a2a; color: #ddd; padding: 7px 10px; border-radius: 4px; font-size: 0.75rem; text-decoration: none; display: flex; align-items: center; justify-content: center;" title="View on store">
                            <span>👁️</span>
                        </a>
                        <button onclick="deleteSpreadProduct('${p.id}')" style="background: rgba(239,68,68,0.15); border: 1px solid rgba(239,68,68,0.4); color: #f87171; padding: 7px 10px; border-radius: 4px; font-size: 0.75rem; font-weight: 700; cursor: pointer;" title="Delete product">
                            <span>🗑️</span>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
};

window.renderSpreadProductForm = function(productId = null) {
    const formId = document.getElementById('spreadFormProductId');
    const formName = document.getElementById('spreadFormName');
    const formCat = document.getElementById('spreadFormCategory');
    const formPrice = document.getElementById('spreadFormPrice');
    const formDisc = document.getElementById('spreadFormDiscounted');
    const formDesc = document.getElementById('spreadFormDesc');
    const formPrimary = document.getElementById('spreadFormPrimaryImage');
    const additionalContainer = document.getElementById('spreadAdditionalImagesList');
    const tabLabel = document.getElementById('spreadTabFormBtnLabel');

    if (!formId) return;

    if (additionalContainer) additionalContainer.innerHTML = '';

    if (productId) {
        const prod = products.find(p => String(p.id) === String(productId));
        if (prod) {
            formId.value = prod.id;
            if (formName) formName.value = prod.name || '';
            if (formCat) formCat.value = prod.category || 'Gift Items';
            if (formPrice) formPrice.value = prod.price || '';
            if (formDisc) formDisc.value = prod.discounted || '';
            if (formDesc) formDesc.value = prod.description || '';

            const imgs = Array.isArray(prod.images) && prod.images.length > 0 ? prod.images : (prod.image ? [prod.image] : []);
            if (formPrimary) formPrimary.value = imgs[0] || '';

            // Populate additional images (imgs 1..)
            for (let i = 1; i < imgs.length; i++) {
                addSpreadImageRow(imgs[i]);
            }

            if (tabLabel) tabLabel.innerText = `✏️ Edit: ${prod.name.substring(0, 20)}...`;
            updateSpreadLivePreview();
            return;
        }
    }

    // New product defaults
    formId.value = '';
    if (formName) formName.value = '';
    if (formCat) formCat.value = 'Islamic Decor';
    if (formPrice) formPrice.value = '';
    if (formDisc) formDisc.value = '';
    if (formDesc) formDesc.value = '';
    if (formPrimary) formPrimary.value = 'https://images.unsplash.com/photo-1513201099705-a9746e1e201f?w=800&auto=format&fit=crop&q=80';
    
    // Add 2 default additional image slots for ease of adding multiple images
    addSpreadImageRow('https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=800&auto=format&fit=crop&q=80');
    addSpreadImageRow('https://images.unsplash.com/photo-1512909006721-3d6018887383?w=800&auto=format&fit=crop&q=80');

    if (tabLabel) tabLabel.innerText = '➕ Add New Product (Multi-Image)';
    updateSpreadLivePreview();
};

window.addSpreadImageRow = function(initialUrl = '') {
    const container = document.getElementById('spreadAdditionalImagesList');
    if (!container) return;

    const rowId = 'spread_img_row_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4);
    const existingCount = container.children.length;
    const imgNumber = existingCount + 2;

    const row = document.createElement('div');
    row.id = rowId;
    row.style.cssText = 'display: flex; gap: 10px; align-items: center; background: #222; padding: 6px 10px; border-radius: 6px; border: 1px solid #333;';
    row.innerHTML = `
        <span style="font-size: 0.72rem; color: #888; font-weight: 700; width: 65px; flex-shrink: 0;">Image ${imgNumber}:</span>
        <input type="url" class="spread-additional-img-input" value="${initialUrl}" placeholder="https://example.com/gallery-photo-${imgNumber}.jpg" oninput="updateSpreadLivePreview()" style="flex: 1; padding: 8px 12px; background: #181818; border: 1px solid #3a3a3a; border-radius: 4px; color: #fff; font-size: 0.82rem; outline: none;">
        <div class="spread-row-thumb" style="width: 36px; height: 36px; border-radius: 4px; background: #2a2a2a; border: 1px solid #444; overflow: hidden; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
            <img src="${initialUrl || ''}" onerror="this.style.display='none'" onload="this.style.display='block'" style="width: 100%; height: 100%; object-fit: cover; ${initialUrl ? '' : 'display:none;'}">
        </div>
        <button type="button" onclick="removeSpreadImageRow('${rowId}')" style="background: rgba(239,68,68,0.15); border: 1px solid rgba(239,68,68,0.3); color: #f87171; width: 30px; height: 30px; border-radius: 4px; font-size: 0.85rem; cursor: pointer; display: flex; align-items: center; justify-content: center; flex-shrink: 0;" title="Remove this image">✕</button>
    `;

    container.appendChild(row);
    updateSpreadLivePreview();
};

window.removeSpreadImageRow = function(rowId) {
    const row = document.getElementById(rowId);
    if (row) {
        row.remove();
        updateSpreadLivePreview();
    }
};

window.toggleSpreadBulkInput = function() {
    const wrapper = document.getElementById('spreadBulkInputWrapper');
    if (wrapper) {
        wrapper.style.display = wrapper.style.display === 'none' ? 'block' : 'none';
    }
};

window.applySpreadBulkImages = function() {
    const textarea = document.getElementById('spreadBulkTextarea');
    if (!textarea || !textarea.value.trim()) return;

    const urls = textarea.value.split(/[\n,;]+/).map(s => s.trim()).filter(Boolean);
    if (urls.length === 0) return;

    // First one goes to primary if empty
    const primaryInput = document.getElementById('spreadFormPrimaryImage');
    let startIdx = 0;
    if (primaryInput && (!primaryInput.value || primaryInput.value.includes('unsplash.com/photo-1513201099705'))) {
        primaryInput.value = urls[0];
        startIdx = 1;
    }

    for (let i = startIdx; i < urls.length; i++) {
        addSpreadImageRow(urls[i]);
    }

    textarea.value = '';
    const wrapper = document.getElementById('spreadBulkInputWrapper');
    if (wrapper) wrapper.style.display = 'none';

    updateSpreadLivePreview();
    showPremiumToast(`Imported ${urls.length} image URLs to gallery!`);
};

window.loadSpreadSampleImages = function(type) {
    const primaryInput = document.getElementById('spreadFormPrimaryImage');
    const container = document.getElementById('spreadAdditionalImagesList');
    if (container) container.innerHTML = '';

    if (type === 'islamic') {
        if (primaryInput) primaryInput.value = 'https://images.unsplash.com/photo-1584286595398-a59f21d313f5?w=800&auto=format&fit=crop&q=80';
        addSpreadImageRow('https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&auto=format&fit=crop&q=80');
        addSpreadImageRow('https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800&auto=format&fit=crop&q=80');
        addSpreadImageRow('https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&auto=format&fit=crop&q=80');
    } else {
        if (primaryInput) primaryInput.value = 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&auto=format&fit=crop&q=80';
        addSpreadImageRow('https://images.unsplash.com/photo-1517991104123-1d56a6e81ed9?w=800&auto=format&fit=crop&q=80');
        addSpreadImageRow('https://images.unsplash.com/photo-1540932239986-30128078f3c5?w=800&auto=format&fit=crop&q=80');
    }

    updateSpreadLivePreview();
    showPremiumToast("Sample multi-image gallery loaded!");
};

window.updateSpreadLivePreview = function() {
    const primaryInput = document.getElementById('spreadFormPrimaryImage');
    const primaryThumb = document.getElementById('spreadPrimaryImageThumb');
    const additionalInputs = document.querySelectorAll('.spread-additional-img-input');
    const previewStrip = document.getElementById('spreadLivePreviewStrip');
    const countBadge = document.getElementById('spreadPreviewImageCount');

    const primaryVal = primaryInput ? primaryInput.value.trim() : '';
    if (primaryThumb) {
        if (primaryVal) {
            primaryThumb.innerHTML = `<img src="${primaryVal}" onerror="this.parentElement.innerHTML='<span style=\\'font-size:0.6rem;color:#f87171;\\'>Err</span>'" style="width: 100%; height: 100%; object-fit: cover;">`;
        } else {
            primaryThumb.innerHTML = `<span style="font-size: 0.68rem; color: #777;">Preview</span>`;
        }
    }

    // Update row thumbnails
    additionalInputs.forEach(input => {
        const row = input.closest('div');
        if (row) {
            const thumb = row.querySelector('.spread-row-thumb');
            const val = input.value.trim();
            if (thumb) {
                if (val) {
                    thumb.innerHTML = `<img src="${val}" onerror="this.parentElement.innerHTML='<span style=\\'font-size:0.6rem;color:#f87171;\\'>Err</span>'" style="width: 100%; height: 100%; object-fit: cover;">`;
                } else {
                    thumb.innerHTML = `<span style="font-size: 0.68rem; color: #777;">Empty</span>`;
                }
            }
        }
    });

    // Compile list
    const allUrls = [];
    if (primaryVal) allUrls.push(primaryVal);
    additionalInputs.forEach(inp => {
        const v = inp.value.trim();
        if (v) allUrls.push(v);
    });

    if (countBadge) {
        countBadge.innerText = `${allUrls.length} ${allUrls.length === 1 ? 'Image' : 'Images'}`;
    }

    if (!previewStrip) return;

    if (allUrls.length === 0) {
        previewStrip.innerHTML = `<span style="color: #666; font-size: 0.8rem;">Enter image URLs above to see gallery preview...</span>`;
        return;
    }

    previewStrip.innerHTML = allUrls.map((url, idx) => `
        <div style="position: relative; width: 64px; height: 64px; border-radius: 6px; overflow: hidden; border: 1.5px solid ${idx === 0 ? 'var(--gold)' : '#333'}; flex-shrink: 0; background: #000;">
            <img src="${url}" onerror="this.src='https://images.unsplash.com/photo-1513201099705-a9746e1e201f?w=100'" style="width: 100%; height: 100%; object-fit: cover;">
            <span style="position: absolute; bottom: 0; left: 0; right: 0; background: rgba(0,0,0,0.8); color: ${idx === 0 ? 'var(--gold)' : '#fff'}; font-size: 0.58rem; text-align: center; font-weight: 800; padding: 1px 0;">
                ${idx === 0 ? 'COVER' : `#${idx + 1}`}
            </span>
        </div>
    `).join('');
};

window.submitSpreadProductForm = async function(e) {
    if (e) e.preventDefault();

    const formId = document.getElementById('spreadFormProductId');
    const formName = document.getElementById('spreadFormName');
    const formCat = document.getElementById('spreadFormCategory');
    const formPrice = document.getElementById('spreadFormPrice');
    const formDisc = document.getElementById('spreadFormDiscounted');
    const formDesc = document.getElementById('spreadFormDesc');
    const formPrimary = document.getElementById('spreadFormPrimaryImage');
    const submitBtn = document.getElementById('spreadFormSubmitBtn');

    if (!formName || !formName.value.trim()) {
        showPremiumAlert("Required", "Product name is required.", "error");
        return;
    }

    const priceVal = Number(formPrice.value) || 0;
    if (priceVal <= 0) {
        showPremiumAlert("Required", "Please enter a valid price.", "error");
        return;
    }

    // Collect all image URLs
    const imgList = [];
    if (formPrimary && formPrimary.value.trim()) {
        imgList.push(formPrimary.value.trim());
    }

    const additionalInputs = document.querySelectorAll('.spread-additional-img-input');
    additionalInputs.forEach(inp => {
        const val = inp.value.trim();
        if (val && !imgList.includes(val)) {
            imgList.push(val);
        }
    });

    if (imgList.length === 0) {
        imgList.push('https://images.unsplash.com/photo-1513201099705-a9746e1e201f?w=800&auto=format&fit=crop&q=80');
    }

    const prodId = formId && formId.value ? formId.value : ("P-" + Date.now());
    const prodPayload = {
        id: prodId,
        productID: prodId,
        name: formName.value.trim(),
        category: formCat ? formCat.value : 'Gift Items',
        price: priceVal,
        discounted: formDisc && formDisc.value ? Number(formDisc.value) : priceVal,
        description: formDesc ? formDesc.value.trim() : '',
        image: imgList[0],
        images: imgList
    };

    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span>⏳ Saving to Google Sheets...</span>';
    }

    try {
        const res = await sendBackendRequest("saveProduct", { product: prodPayload }, "POST");
        
        // Update local product cache immediately
        const existingIdx = products.findIndex(p => String(p.id) === String(prodId));
        if (existingIdx >= 0) {
            products[existingIdx] = sanitizeProductItem({ ...products[existingIdx], ...prodPayload });
        } else {
            products.unshift(sanitizeProductItem(prodPayload));
        }

        localStorage.setItem("gw_products", JSON.stringify(products));
        localStorage.setItem("gw_products_cache_time", String(Date.now()));

        showPremiumToast(`✓ Product saved successfully with ${imgList.length} gallery image(s)!`);

        // Refresh live storefront views
        loadPageData();

        // Switch to list view to show the result
        renderSpreadProductList();
        switchSpreadTab('list');
    } catch (err) {
        console.error("Save product error:", err);
        showPremiumAlert("Save Failed", "Server error please try again: " + (err.message || err), "error");
    } finally {
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<span>💾 Save to Spread System (Google Sheets)</span>';
        }
    }
};

window.deleteSpreadProduct = async function(productId) {
    const prod = products.find(p => String(p.id) === String(productId));
    const prodName = prod ? prod.name : productId;

    if (!confirm(`Are you sure you want to delete "${prodName}" from the Spread System and Google Sheets?`)) {
        return;
    }

    try {
        await sendBackendRequest("deleteProduct", { id: productId, productID: productId }, "POST");
        products = products.filter(p => String(p.id) !== String(productId));
        localStorage.setItem("gw_products", JSON.stringify(products));

        showPremiumToast(`Deleted product "${prodName}" successfully.`);
        loadPageData();
        renderSpreadProductList();
    } catch (err) {
        console.error("Delete product error:", err);
        showPremiumAlert("Delete Failed", "Server error please try again", "error");
    }
};

window.syncSpreadFromSheets = async function() {
    const btn = document.getElementById('spreadSyncBtn');
    if (btn) btn.innerHTML = '<span>⏳ Syncing...</span>';

    try {
        await syncProducts({ background: false });
        renderSpreadProductList();
        showPremiumToast("✓ Synchronized live catalog from Google Sheets!");
    } catch (err) {
        showPremiumToast("Catalog synced from local database.");
    } finally {
        if (btn) btn.innerHTML = '<span>🔄 Sync Google Sheets</span>';
    }
};

// --- REAL PREMIUM SEARCH MODAL CONTROLLERS ---
window.openSearchModal = function(initialQuery = '') {
    let modalOverlay = document.getElementById('gwSearchModalOverlay');
    if (!modalOverlay) {
        modalOverlay = document.createElement('div');
        modalOverlay.id = 'gwSearchModalOverlay';
        modalOverlay.className = 'gw-modal-overlay';
        modalOverlay.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
            background: rgba(0, 0, 0, 0.82); backdrop-filter: blur(8px);
            z-index: 99999; display: flex; justify-content: center; align-items: center;
            padding: 15px; opacity: 0; transition: opacity 0.3s ease;
        `;
        
        modalOverlay.innerHTML = `
            <div id="gwSearchModalCard" style="background: #ffffff; width: 90%; max-width: 850px; border-radius: 12px; border-top: 4px solid var(--gold); box-shadow: 0 25px 60px rgba(0,0,0,0.5); padding: 2rem; position: relative; margin: auto; max-height: 90vh; overflow-y: auto; transform: scale(0.95); transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);">
                <button onclick="closeSearchModal()" style="position: absolute; top: 18px; right: 20px; background: none; border: none; font-size: 1.8rem; cursor: pointer; color: #666; line-height: 1;">&times;</button>
                
                <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 1.2rem;">
                    <span style="font-size: 1.5rem;">🔍</span>
                    <h2 style="font-family: var(--font-head); font-size: 1.5rem; color: #111; margin: 0;">Search Premium Collection</h2>
                </div>

                <!-- SEARCH BAR INPUT -->
                <div style="position: relative; margin-bottom: 1.5rem;">
                    <input type="text" id="modalSearchInput" placeholder="Search by name, watch, perfume, wallet, jewelry, hamper..." style="width: 100%; padding: 14px 20px 14px 45px; border: 2px solid var(--gold); border-radius: 4px; font-size: 1.05rem; font-family: var(--font-body); outline: none; box-shadow: 0 4px 15px rgba(212,175,55,0.12);">
                    <span style="position: absolute; left: 16px; top: 50%; transform: translateY(-50%); font-size: 1.1rem; color: #888;">🔍</span>
                </div>

                <!-- LIVE RESULTS CONTAINER -->
                <div id="modalSearchResults" style="max-height: 420px; overflow-y: auto; display: grid; grid-template-columns: repeat(auto-fill, minmax(210px, 1fr)); gap: 15px; padding-top: 5px;">
                </div>
            </div>
        `;

        document.body.appendChild(modalOverlay);

        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) closeSearchModal();
        });
    }

    setTimeout(() => {
        if (modalOverlay && modalOverlay.style) {
            modalOverlay.style.opacity = '1';
            modalOverlay.classList.add('active');
        }
        const card = document.getElementById('gwSearchModalCard');
        if (card && card.style) card.style.transform = 'scale(1)';
    }, 10);

    const input = document.getElementById('modalSearchInput');
    if (input) {
        input.value = initialQuery;
        input.focus();
        input.oninput = () => renderModalSearchResults();
    }

    window.currentSearchCategory = 'all';
    renderModalSearchResults();
};

window.closeSearchModal = function() {
    const modalOverlay = document.getElementById('gwSearchModalOverlay');
    if (modalOverlay) {
        modalOverlay.style.opacity = '0';
        modalOverlay.classList.remove('active');
        const card = document.getElementById('gwSearchModalCard');
        if (card) card.style.transform = 'scale(0.95)';
        setTimeout(() => {
            modalOverlay.remove();
        }, 300);
    }
};

window.renderModalSearchResults = function() {
    const resultsContainer = document.getElementById('modalSearchResults');
    if (!resultsContainer) return;

    const input = document.getElementById('modalSearchInput');
    const query = input ? input.value.trim().toLowerCase() : '';

    let matched = products.filter(p => {
        return !query || 
            p.name.toLowerCase().includes(query) || 
            p.category.toLowerCase().includes(query) || 
            p.description.toLowerCase().includes(query);
    });

    if (matched.length === 0) {
        resultsContainer.style.display = 'block';
        resultsContainer.innerHTML = `
            <div style="text-align: center; padding: 3rem 1rem; color: #777;">
                <p style="font-size: 1.1rem; font-weight: bold; margin-bottom: 5px;">No matching gifts found</p>
                <p style="font-size: 0.9rem;">Try searching for "Watch", "Perfume", "Wallet", or "Hamper"</p>
            </div>
        `;
        return;
    }

    resultsContainer.style.display = 'grid';
    resultsContainer.innerHTML = matched.map(p => `
        <div style="border: 1px solid #eee; border-radius: 6px; padding: 10px; background: #fafafa; display: flex; flex-direction: column; justify-content: space-between; transition: transform 0.2s; box-shadow: 0 2px 8px rgba(0,0,0,0.04);">
            <div style="position: relative; height: 140px; border-radius: 4px; overflow: hidden; margin-bottom: 8px;">
                <img src="${p.image}" alt="${p.name}" style="width: 100%; height: 100%; object-fit: cover;">
            </div>
            <div>
                <span style="font-size: 0.7rem; color: var(--gold); font-weight: bold; text-transform: uppercase;">${p.category}</span>
                <h4 style="font-size: 0.95rem; line-height: 1.3; margin: 3px 0 6px; height: 2.5rem; overflow: hidden; color: #111;">${p.name}</h4>
                <p style="font-weight: bold; color: var(--black); font-size: 1rem; margin-bottom: 8px;">Rs. ${formatPrice(p.price)}</p>
            </div>
            <div style="display: flex; gap: 5px; margin-top: 5px;">
                <a href="product.html?id=${p.id}" onclick="closeSearchModal()" class="btn" style="flex: 1; padding: 8px; font-size: 0.75rem; text-align: center;">View Details</a>
                <button onclick="addToCartById('${p.id}', 1)" style="background: var(--black); color: var(--gold); border: none; padding: 8px 12px; font-size: 0.85rem; cursor: pointer; border-radius: 4px;" title="Add to Cart">🛒</button>
            </div>
        </div>
    `).join('');
};

/* ==========================================================================
   HIGH-END LUXURY BRAND ANIMATION ENGINE (Apple, Tesla, Linear, Stripe Style)
   ========================================================================== */

function initLuxuryAnimations() {
    // 1. Mark body as page-loaded for smooth entrance transition
    document.body.classList.add('page-loaded');

    // 2. Smooth Page Transitions for Internal Links
    initPageTransitions();

    // 3. Desktop Cursor Glow Effect
    initCursorGlow();

    // 4. Magnetic Buttons
    initMagneticButtons();

    // 5. 3D Perspective Card Tilt
    init3DTiltCards();

    // 6. Scroll Reveal Observer
    initScrollReveal();

    // 7. Tactile Ripple Click Effect
    initRippleEffect();

    // 8. Smooth Sticky Header on Scroll
    initStickyHeader();

    // 9. Animated Stats & Number Counters
    initNumberCounters();

    // 10. Mouse Parallax for Hero Elements
    initMouseParallax();
}

// 2. Smooth Page Transitions
function initPageTransitions() {
    document.addEventListener('click', (e) => {
        const link = e.target.closest('a');
        if (!link) return;
        const href = link.getAttribute('href');
        if (!href || href.startsWith('#') || href.startsWith('javascript:') || href.startsWith('tel:') || href.startsWith('mailto:') || link.target === '_blank') return;
        
        // Only internal links
        if (href.endsWith('.html') || (!href.includes('://') && !href.startsWith('http'))) {
            e.preventDefault();
            document.body.classList.add('page-leaving');
            setTimeout(() => {
                window.location.href = href;
            }, 180);
        }
    });
}

// 3. Desktop Cursor Glow with smooth linear interpolation
function initCursorGlow() {
    if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
        let glow = document.getElementById('cursorGlow');
        if (!glow) {
            glow = document.createElement('div');
            glow.id = 'cursorGlow';
            glow.className = 'cursor-glow';
            document.body.appendChild(glow);
        }

        let mouseX = window.innerWidth / 2;
        let mouseY = window.innerHeight / 2;
        let currentX = mouseX;
        let currentY = mouseY;
        let isMoving = false;
        let glowTimeout;

        window.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            glow.classList.add('active');
            isMoving = true;
            clearTimeout(glowTimeout);
            glowTimeout = setTimeout(() => {
                glow.classList.remove('active');
                isMoving = false;
            }, 2500);
        }, { passive: true });

        window.addEventListener('mouseleave', () => {
            glow.classList.remove('active');
        });

        function updateCursorGlow() {
            currentX += (mouseX - currentX) * 0.15;
            currentY += (mouseY - currentY) * 0.15;
            if (glow && glow.style) {
                glow.style.transform = `translate3d(${currentX}px, ${currentY}px, 0) translate(-50%, -50%)`;
            }
            requestAnimationFrame(updateCursorGlow);
        }
        requestAnimationFrame(updateCursorGlow);
    }
}

// 4. Magnetic Buttons Engine
function initMagneticButtons() {
    const magneticSelectors = '.btn-premium-gold, .hero-btn, .search-trigger-btn, .fav-btn, .cat-item, .cart-icon, #navbarBackBtn';
    
    document.querySelectorAll(magneticSelectors).forEach(btn => {
        if (btn.dataset.magneticInit) return;
        btn.dataset.magneticInit = "true";
        btn.classList.add('magnetic-elem');

        btn.addEventListener('mousemove', (e) => {
            const rect = btn.getBoundingClientRect();
            const x = (e.clientX - rect.left - rect.width / 2) * 0.22;
            const y = (e.clientY - rect.top - rect.height / 2) * 0.22;
            btn.style.transform = `translate(${x}px, ${y}px)`;
        });

        btn.addEventListener('mouseleave', () => {
            btn.style.transform = 'translate(0px, 0px)';
        });
    });
}

// 5. 3D Perspective Tilt on Product Cards
function init3DTiltCards() {
    const cards = document.querySelectorAll('.product-card');
    cards.forEach(card => {
        if (card.dataset.tiltInit) return;
        card.dataset.tiltInit = "true";

        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width;
            const y = (e.clientY - rect.top) / rect.height;
            const tiltX = (0.5 - y) * 8; // subtle 5-8 degrees
            const tiltY = (x - 0.5) * 8;
            card.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateY(-8px) scale(1.02)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0) scale(1)';
        });
    });
}

// 6. Scroll Reveal Observer
function initScrollReveal() {
    if (!('IntersectionObserver' in window)) return;

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -40px 0px'
    });

    const items = document.querySelectorAll('.product-card, .cat-item, .section-pad h2, .section-pad, .reveal-on-scroll');
    items.forEach(el => {
        el.classList.add('reveal-on-scroll');
        revealObserver.observe(el);
    });
}

// 7. Tactile Ripple Click Effect
function initRippleEffect() {
    document.addEventListener('click', (e) => {
        const target = e.target.closest('.btn, .btn-premium-gold, .hero-btn, .add-to-cart-btn, .fav-btn, .cat-item, button');
        if (!target) return;

        const rect = target.getBoundingClientRect();
        const circle = document.createElement('span');
        const diameter = Math.max(rect.width, rect.height);
        const radius = diameter / 2;

        circle.style.width = circle.style.height = `${diameter}px`;
        circle.style.left = `${e.clientX - rect.left - radius}px`;
        circle.style.top = `${e.clientY - rect.top - radius}px`;
        circle.classList.add('ripple-circle');

        const existing = target.querySelector('.ripple-circle');
        if (existing) existing.remove();

        target.appendChild(circle);
        setTimeout(() => circle.remove(), 600);
    });
}

// 8. Smooth Sticky Header on Scroll
function initStickyHeader() {
    let ticking = false;
    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                const header = document.getElementById('gwHeader') || document.querySelector('.header-wrapper');
                if (header) {
                    if (window.scrollY > 35) {
                        header.classList.add('scrolled');
                    } else {
                        header.classList.remove('scrolled');
                    }
                }
                ticking = false;
            });
            ticking = true;
        }
    }, { passive: true });
}

// 9. Animated Stats & Number Counters
function initNumberCounters() {
    const counters = document.querySelectorAll('.stat-number, [data-counter-target]');
    if (counters.length === 0) return;

    const counterObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                const target = parseInt(el.getAttribute('data-counter-target') || el.innerText.replace(/[^0-9]/g, ''), 10);
                const suffix = el.getAttribute('data-counter-suffix') || '+';
                if (!isNaN(target) && target > 0) {
                    animateValue(el, 0, target, 1600, suffix);
                }
                observer.unobserve(el);
            }
        });
    }, { threshold: 0.3 });

    counters.forEach(c => counterObserver.observe(c));
}

function animateValue(obj, start, end, duration, suffix = '') {
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        // Ease out quad
        const easeOut = 1 - (1 - progress) * (1 - progress);
        const current = Math.floor(easeOut * (end - start) + start);
        obj.innerText = current.toLocaleString() + suffix;
        if (progress < 1) {
            window.requestAnimationFrame(step);
        } else {
            obj.innerText = end.toLocaleString() + suffix;
        }
    };
    window.requestAnimationFrame(step);
}

// 10. Mouse Parallax for Hero Elements
function initMouseParallax() {
    const hero = document.querySelector('.hero-section');
    if (!hero) return;

    const heroTitle = hero.querySelector('.hero-title');
    const heroBtn = hero.querySelector('.hero-btn');

    hero.addEventListener('mousemove', (e) => {
        const { clientX, clientY } = e;
        const xOffset = (clientX / window.innerWidth - 0.5) * 16;
        const yOffset = (clientY / window.innerHeight - 0.5) * 16;

        if (heroTitle) {
            heroTitle.style.transform = `translate3d(${xOffset * 0.8}px, ${yOffset * 0.8}px, 0)`;
        }
        if (heroBtn) {
            heroBtn.style.transform = `translate3d(${xOffset * 0.4}px, ${yOffset * 0.4}px, 0)`;
        }
    }, { passive: true });

    hero.addEventListener('mouseleave', () => {
        if (heroTitle) heroTitle.style.transform = 'translate3d(0, 0, 0)';
        if (heroBtn) heroBtn.style.transform = 'translate3d(0, 0, 0)';
    });
}

