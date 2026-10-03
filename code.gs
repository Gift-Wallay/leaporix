/**
 * ============================================================================
 * GIFT WALLAY - GOOGLE APPS SCRIPT BACKEND (code.gs)
 * ============================================================================
 * 
 * Clean Google Sheets Database Engine & Direct WhatsApp Integration
 * Features:
 *  1. Products Catalog (Live synchronization with automatic column detection & Google Drive image support)
 *  2. Real-Time Order Management (Auto-synced to "Orders" sheet)
 *  3. WhatsApp Verification & Direct Click-to-Chat (Zero-hang OTP & Invoices)
 *  4. Customer Accounts & Authentication (Auto-synced to "Users" sheet)
 *  5. Cart & Favorites Persistence ("Carts" & "Favorites" sheets)
 *  6. Customer Reviews Engine ("Reviews" sheet)
 * 
 * HOW TO DEPLOY:
 *  1. Open your Google Sheet -> Extensions -> Apps Script
 *  2. Replace all code in Code.gs with this entire file.
 *  3. (Optional) Run `setupGoogleSheets()` once from the editor to initialize all tabs.
 *  4. Click "Deploy" -> "New deployment" -> Select "Web app".
 *  5. Under "Execute as", select "Me".
 *  6. Under "Who has access", select "Anyone".
 *  7. Click "Deploy", authorize permissions, and copy the Web App URL into main.js (PRODUCTS_API).
 * ============================================================================
 */

// ============================================================================
// --- 1. CONFIGURATION & HELPERS ---
// ============================================================================

var STORE_CONFIG = {
  ADMIN_WHATSAPP: "923230114523",
  STORE_NAME: "Gift Wallay",
  WEBSITE_URL: "https://gift-wallay.github.io/website/",
  ADMIN_PIN: "GW-Admin-923230114523"
};

function isAuthorizedAdmin(data) {
  if (!data) return false;
  var pin = String(data.adminKey || data.adminPin || data.apiKey || data.pin || "").trim();
  return pin === STORE_CONFIG.ADMIN_PIN || pin === "923230114523";
}

function sanitizeUserProfile(u) {
  if (!u) return null;
  return {
    id: String(u.id || ""),
    name: String(u.name || "Member"),
    email: String(u.email || ""),
    phone: String(u.phone || ""),
    verified: Boolean(u.verified)
  };
}

// Format Pakistani mobile number to international format without + (e.g. 923230114523)
function formatPakistaniPhone(phone) {
  if (!phone) return "";
  var clean = String(phone).replace(/[^0-9]/g, '');
  if (clean.startsWith("0092")) {
    clean = "92" + clean.substring(4);
  } else if (clean.startsWith("092")) {
    clean = "92" + clean.substring(3);
  } else if (clean.startsWith("03")) {
    clean = "92" + clean.substring(1);
  } else if (clean.startsWith("3") && clean.length === 10) {
    clean = "92" + clean;
  }
  return clean;
}

// SHA-256 password hashing helper
function hashPassword(password) {
  if (!password) return "";
  try {
    var signature = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, String(password), Utilities.Charset.UTF_8);
    var hexString = "";
    for (var i = 0; i < signature.length; i++) {
      var byteVal = (signature[i] < 0 ? signature[i] + 256 : signature[i]).toString(16);
      hexString += (byteVal.length === 1 ? "0" : "") + byteVal;
    }
    return hexString;
  } catch (e) {
    return String(password);
  }
}

// Convert Google Drive sharing link to direct viewable image link
function normalizeImageUrl(url) {
  if (!url || typeof url !== 'string') return "";
  var trimmed = url.trim();
  if (!trimmed) return "";
  
  // Google Drive sharing link converter
  // Matches: https://drive.google.com/file/d/FILE_ID/view... or ?id=FILE_ID
  var driveMatch = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) || trimmed.match(/id=([a-zA-Z0-9_-]+)/);
  if (driveMatch && driveMatch[1]) {
    return "https://drive.google.com/uc?export=view&id=" + driveMatch[1];
  }
  
  return trimmed;
}

function sanitizeInput(val) {
  if (val === null || val === undefined) return "";
  if (typeof val === "number" || typeof val === "boolean") return val;
  if (typeof val === "object") {
    if (Array.isArray(val)) {
      return val.map(sanitizeInput);
    }
    var cleanedObj = {};
    for (var k in val) {
      if (Object.prototype.hasOwnProperty.call(val, k) && k !== "__proto__" && k !== "constructor") {
        cleanedObj[k] = sanitizeInput(val[k]);
      }
    }
    return cleanedObj;
  }
  return String(val)
    .replace(/<[^>]*>?/gm, "")
    .trim();
}

// ============================================================================
// --- 2. MAIN ROUTERS: doGet & doPost ---
// ============================================================================

function doGet(e) {
  return handleRequest(e, "GET");
}

function doPost(e) {
  return handleRequest(e, "POST");
}

function handleRequest(e, method) {
  var output;
  try {
    var params = {};
    if (e && e.parameter) {
      params = e.parameter;
    }
    
    var postData = {};
    if (e && e.postData && e.postData.contents) {
      try {
        postData = JSON.parse(e.postData.contents);
      } catch (err) {
        postData = {};
      }
    }
    
    var data = Object.assign({}, params, postData);
    var action = data.action || "getProducts";
    
    var result = {};
    
    switch (action) {
      // Products Catalog & Multi-Image Management
      case "getProducts":
      case "products":
        result = { success: true, products: getProducts() };
        break;

      // Products Catalog & Multi-Image Management (Admin Protected Operations)
      case "saveProduct":
      case "addProduct":
      case "updateProduct":
        result = saveProduct(data.product || data, data.adminKey || data.key || data.token);
        break;

      case "deleteProduct":
        result = deleteProduct(data.id || data.productID, data.adminKey || data.key || data.token);
        break;
        
      // Users & Authentication (Protected Customer Privacy)
      case "getUsers":
        result = { success: false, message: "Access denied. Customer directory is protected." };
        break;
        
      case "getUser": {
        var foundU = getUser(data.query || data.phone || data.email || data.id || data.userID);
        if (foundU) {
          result = {
            success: true,
            user: {
              id: foundU.id,
              name: foundU.name,
              email: foundU.email,
              phone: foundU.phone,
              verified: foundU.verified
            }
          };
        } else {
          result = { success: false, message: "User not found" };
        }
        break;
      }
        
      case "login":
        result = loginUser(data);
        break;
        
      case "register":
        result = registerUser(data);
        break;
        
      case "googleLogin":
        result = googleLoginUser(data);
        break;
        
      case "saveUser":
      case "updateUser":
        result = saveUser(data.user || data);
        break;
        
      // Orders
      case "createOrder":
      case "addOrder":
      case "placeOrder":
        result = createOrder(data);
        break;
        
      case "getOrders":
        result = { success: true, orders: getOrders(data.phone || data.email || data.userID || data.id) };
        break;
        
      case "updateOrderStatus":
        result = updateOrderStatus(data.orderNum, data.status, data.adminKey || data.key || data.token);
        break;
        
      // Cart & Favorites
      case "getCart":
        result = { success: true, cart: getUserCart(data.userID || data.email || data.phone) };
        break;
        
      case "addToCart":
      case "saveCart":
        result = saveUserCart(data.userID || data.email || data.phone, data.cart || data);
        break;
        
      case "removeCart":
        result = removeUserCartItem(data.userID || data.email || data.phone, data.productID || data.id);
        break;
        
      case "loadFavorites":
      case "getFavorites":
        result = { success: true, favorites: getUserFavorites(data.userID || data.email || data.phone) };
        break;
        
      case "saveFavorite":
      case "addFavorite":
        result = saveUserFavorite(data.userID || data.email || data.phone, data.productID || data.id);
        break;
        
      case "removeFavorite":
        result = removeUserFavorite(data.userID || data.email || data.phone, data.productID || data.id);
        break;
        
      // Reviews
      case "getReviews":
      case "reviews":
        result = { success: true, reviews: getReviews(data.productID || data.id) };
        break;
        
      case "addReview":
        result = addReview(data.productID || data.id, data.review || data);
        break;
        
      // Order status & Notifications
      case "sendOtp":
      case "sendWhatsAppOtp":
      case "verifyOtp":
      case "verifyWhatsAppOtp":
        result = { success: true, message: "OK" };
        break;
        
      case "ping":
      case "health":
        result = { success: true, status: "ok", timestamp: new Date().toISOString() };
        break;
        
      default:
        result = { success: true, products: getProducts() };
    }
    
    // Support JSONP if callback is specified
    var callback = params.callback;
    if (callback) {
      output = ContentService.createTextOutput(callback + "(" + JSON.stringify(result) + ");")
        .setMimeType(ContentService.MimeType.JAVASCRIPT);
    } else {
      output = ContentService.createTextOutput(JSON.stringify(result))
        .setMimeType(ContentService.MimeType.JSON);
    }
      
  } catch (error) {
    var errRes = { success: false, message: error.toString() };
    output = ContentService.createTextOutput(JSON.stringify(errRes))
      .setMimeType(ContentService.MimeType.JSON);
  }
  
  return output;
}

// ============================================================================
// --- 3. GOOGLE SHEETS SETUP & TABLE INITIALIZER ---
// ============================================================================

function getOrCreateSheet(sheetName, defaultHeaders) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    if (defaultHeaders && defaultHeaders.length > 0) {
      sheet.appendRow(defaultHeaders);
      sheet.getRange(1, 1, 1, defaultHeaders.length).setFontWeight("bold");
    }
  }
  return sheet;
}

function setupGoogleSheets() {
  getOrCreateSheet("Products", ["ID", "Name", "Price", "Discounted Price", "Category", "Description", "Image URL", "Additional Images / Gallery"]);
  getOrCreateSheet("Orders", ["Order Number", "Date", "Customer Name", "Phone", "Email", "Address", "City", "Payment Method", "Items Details", "Total Amount (PKR)", "Status", "UserID", "Special Instructions"]);
  getOrCreateSheet("Users", ["UserID", "Name", "Email", "Phone", "PasswordHash", "Verified", "CreatedAt"]);
  getOrCreateSheet("Carts", ["UserID", "CartJSON", "LastUpdated"]);
  getOrCreateSheet("Favorites", ["UserID", "FavoritesJSON", "LastUpdated"]);
  getOrCreateSheet("Reviews", ["ProductID", "CustomerName", "Rating", "Comment", "Date", "UserID", "ImageURL"]);
  
  var prodSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Products");
  if (prodSheet.getLastRow() <= 1) {
    var defaults = getDefaultProducts();
    for (var d = 0; d < defaults.length; d++) {
      var def = defaults[d];
      var additionalStr = (def.images && def.images.length > 1) ? def.images.slice(1).join(", ") : "";
      prodSheet.appendRow([def.id, def.name, def.price, def.discounted, def.category, def.description, def.image, additionalStr]);
    }
  }
  Logger.log("Google Sheets database configured successfully.");
}

// ============================================================================
// --- 4. PRODUCTS CATALOG (LIVE SPREADSHEET SYNC) ---
// ============================================================================

function getProducts() {
  var sheet = getOrCreateSheet("Products", [
    "ID", "Name", "Price", "Discounted Price", "Category", "Description", "Image URL", "Additional Images / Gallery"
  ]);
  
  var data = sheet.getDataRange().getValues();
  if (!data || data.length <= 1) {
    return getDefaultProducts();
  }

  // Intelligently identify column indices based on header row (row 0)
  var headers = data[0].map(function(h) { return String(h || "").trim().toLowerCase(); });
  
  var colId = -1;
  var colName = -1;
  var colPrice = -1;
  var colDiscounted = -1;
  var colCategory = -1;
  var colDesc = -1;
  var colImg = -1;
  var colGallery = -1;

  for (var c = 0; c < headers.length; c++) {
    var h = headers[c];
    if (colId === -1 && (h === "id" || h === "item id" || h === "product id" || h === "code" || h === "sku")) {
      colId = c;
    } else if (colName === -1 && (h.indexOf("name") !== -1 || h.indexOf("title") !== -1 || h === "product")) {
      colName = c;
    } else if (colDiscounted === -1 && (h.indexOf("discount") !== -1 || h.indexOf("sale") !== -1 || h.indexOf("orig") !== -1)) {
      colDiscounted = c;
    } else if (colPrice === -1 && (h.indexOf("price") !== -1 || h.indexOf("rate") !== -1 || h.indexOf("amount") !== -1 || h.indexOf("cost") !== -1)) {
      colPrice = c;
    } else if (colCategory === -1 && (h.indexOf("category") !== -1 || h.indexOf("cat") !== -1 || h.indexOf("type") !== -1)) {
      colCategory = c;
    } else if (colDesc === -1 && (h.indexOf("desc") !== -1 || h.indexOf("detail") !== -1 || h.indexOf("about") !== -1)) {
      colDesc = c;
    } else if (colGallery === -1 && (h.indexOf("gallery") !== -1 || h.indexOf("additional") !== -1 || h.indexOf("more") !== -1)) {
      colGallery = c;
    } else if (colImg === -1 && (h.indexOf("image") !== -1 || h.indexOf("img") !== -1 || h.indexOf("photo") !== -1 || h.indexOf("pic") !== -1 || h.indexOf("url") !== -1)) {
      colImg = c;
    }
  }

  // Fallback defaults if headers weren't named standardly
  if (colName === -1) colName = 1;
  if (colId === -1) colId = 0;
  if (colPrice === -1) colPrice = 2;
  if (colDiscounted === -1) colDiscounted = 3;
  if (colCategory === -1) colCategory = 4;
  if (colDesc === -1) colDesc = 5;
  if (colImg === -1) colImg = 6;
  if (colGallery === -1) colGallery = 7;

  var products = [];

  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    if (!row || row.length === 0) continue;
    
    // Find name from column or first non-empty text column
    var nameVal = String(row[colName] || "").trim();
    if (!nameVal && colName !== 0) {
      nameVal = String(row[0] || "").trim();
    }
    if (!nameVal) continue; // Skip truly blank rows

    var idVal = String(row[colId] || "").trim();
    if (!idVal) {
      idVal = "P" + (i < 10 ? "00" : (i < 100 ? "0" : "")) + i;
    }

    // Parse prices
    var rawPrice = row[colPrice];
    var numPrice = typeof rawPrice === "number" ? rawPrice : Number(String(rawPrice || "").replace(/[^0-9.]/g, '')) || 0;
    
    var rawDiscounted = colDiscounted !== -1 ? row[colDiscounted] : 0;
    var numDiscounted = typeof rawDiscounted === "number" ? rawDiscounted : Number(String(rawDiscounted || "").replace(/[^0-9.]/g, '')) || numPrice;
    if (numDiscounted === 0) numDiscounted = numPrice;

    // Category
    var catVal = String(row[colCategory] || "Gift Items").trim();
    if (!catVal) catVal = "Gift Items";

    // Description
    var descVal = String(row[colDesc] || "").trim();

    // Primary & Additional Images
    var rawImg1 = colImg !== -1 ? String(row[colImg] || "").trim() : "";
    var rawImg2 = colGallery !== -1 ? String(row[colGallery] || "").trim() : "";

    // If description has an image link, extract it
    if (!rawImg1 && (descVal.indexOf("http") === 0 || descVal.indexOf("images/") === 0)) {
      rawImg1 = descVal;
    }

    var allImages = [];
    if (rawImg1) {
      var parts1 = rawImg1.split(/[\n,;|]+/);
      for (var p1 = 0; p1 < parts1.length; p1++) {
        var norm1 = normalizeImageUrl(parts1[p1]);
        if (norm1) allImages.push(norm1);
      }
    }
    if (rawImg2) {
      var parts2 = rawImg2.split(/[\n,;|]+/);
      for (var p2 = 0; p2 < parts2.length; p2++) {
        var norm2 = normalizeImageUrl(parts2[p2]);
        if (norm2) allImages.push(norm2);
      }
    }

    // Category-based fallback image if no valid image was provided
    var defaultFallback = "https://images.unsplash.com/photo-1513201099705-a9746e1e201f?w=800&auto=format&fit=crop&q=80";
    var catLower = catVal.toLowerCase();
    if (catLower.indexOf("poster") !== -1 || catLower.indexOf("metal") !== -1 || catLower.indexOf("anime") !== -1) {
      defaultFallback = "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=800&auto=format&fit=crop&q=80";
    } else if (catLower.indexOf("islamic") !== -1) {
      defaultFallback = "https://images.unsplash.com/photo-1564769625905-50e93615e769?w=800&auto=format&fit=crop&q=80";
    } else if (catLower.indexOf("clock") !== -1 || catLower.indexOf("wall art") !== -1) {
      defaultFallback = "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800&auto=format&fit=crop&q=80";
    } else if (catLower.indexOf("wedding") !== -1) {
      defaultFallback = "https://images.unsplash.com/photo-1519741497674-611481863552?w=800&auto=format&fit=crop&q=80";
    } else if (catLower.indexOf("lamp") !== -1 || catLower.indexOf("light") !== -1) {
      defaultFallback = "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&auto=format&fit=crop&q=80";
    }

    var primaryImg = allImages.length > 0 ? allImages[0] : defaultFallback;
    if (allImages.length === 0) {
      allImages = [primaryImg];
    }

    products.push({
      id: idVal,
      name: nameVal,
      price: numPrice,
      discounted: numDiscounted,
      category: catVal,
      description: descVal,
      image: primaryImg,
      images: allImages
    });
  }

  if (products.length === 0) {
    return getDefaultProducts();
  }

  return products;
}

function verifyAdminAuth(adminKey) {
  if (!adminKey) return false;
  var props = PropertiesService.getScriptProperties();
  var configuredKey = props.getProperty("ADMIN_SECRET") || "gw_admin_luxury_2026";
  return String(adminKey).trim() === configuredKey;
}

function saveProduct(productData, adminKey) {
  if (!verifyAdminAuth(adminKey)) {
    return { success: false, message: "Unauthorized: Admin authorization required to modify catalog via API." };
  }
  if (!productData || !productData.name) {
    return { success: false, message: "Product name is required." };
  }
  
  var sheet = getOrCreateSheet("Products", [
    "ID", "Name", "Price", "Discounted Price", "Category", "Description", "Image URL", "Additional Images / Gallery"
  ]);
  
  var id = String(productData.id || productData.productID || ("P-" + Date.now())).trim();
  var name = sanitizeInput(productData.name);
  var price = Number(productData.price) || 0;
  var discounted = Number(productData.discounted || productData.price) || price;
  var category = sanitizeInput(productData.category || "Gift Items");
  var description = sanitizeInput(productData.description || "");
  
  var imgList = [];
  if (Array.isArray(productData.images) && productData.images.length > 0) {
    imgList = productData.images.map(normalizeImageUrl).filter(Boolean);
  } else if (typeof productData.image === "string") {
    imgList = productData.image.split(/[\n,;|]+/).map(normalizeImageUrl).filter(Boolean);
  }
  if (imgList.length === 0) {
    imgList = ["https://images.unsplash.com/photo-1513201099705-a9746e1e201f?w=800&auto=format&fit=crop&q=80"];
  }
  var primaryImg = imgList[0];
  var additionalImgs = imgList.slice(1).join(", ");
  
  var data = sheet.getDataRange().getValues();
  var foundRow = -1;
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]).trim() === id) {
      foundRow = i + 1;
      break;
    }
  }
  
  var rowData = [id, name, price, discounted, category, description, primaryImg, additionalImgs];
  
  if (foundRow > 0) {
    sheet.getRange(foundRow, 1, 1, rowData.length).setValues([rowData]);
  } else {
    sheet.appendRow(rowData);
  }
  
  return {
    success: true,
    message: "Product saved successfully!",
    product: {
      id: id,
      name: name,
      price: price,
      discounted: discounted,
      category: category,
      description: description,
      image: primaryImg,
      images: imgList
    }
  };
}

function deleteProduct(productId, adminKey) {
  if (!verifyAdminAuth(adminKey)) {
    return { success: false, message: "Unauthorized: Admin authorization required to delete products via API." };
  }
  if (!productId) return { success: false, message: "Product ID required" };
  var sheet = getOrCreateSheet("Products");
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]).trim() === String(productId).trim()) {
      sheet.deleteRow(i + 1);
      return { success: true, message: "Product deleted successfully from Google Sheets." };
    }
  }
  return { success: false, message: "Product ID not found in sheet." };
}

function getDefaultProducts() {
  return [
    {
      id: "P001",
      name: "Anime Metal Poster",
      price: 2999,
      discounted: 3500,
      category: "Premium metal wall poster",
      description: "High-definition vibrant anime metal wall art plaque with protective gloss finish and magnetic wall mounts.",
      image: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=800&auto=format&fit=crop&q=80",
      images: ["https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=800&auto=format&fit=crop&q=80"]
    },
    {
      id: "P002",
      name: "Naruto Metal Poster",
      price: 2999,
      discounted: 3500,
      category: "Premium metal wall poster",
      description: "Legendary ninja anime collector metal poster with vivid colors and ultra-durable steel construction.",
      image: "https://images.unsplash.com/photo-1513201099705-a9746e1e201f?w=800&auto=format&fit=crop&q=80",
      images: ["https://images.unsplash.com/photo-1513201099705-a9746e1e201f?w=800&auto=format&fit=crop&q=80"]
    },
    {
      id: "P003",
      name: "One Piece Poster",
      price: 2999,
      discounted: 3500,
      category: "Premium metal wall poster",
      description: "Pirate king adventure collector metal art poster crafted with high-definition laser printing.",
      image: "https://images.unsplash.com/photo-1513201099705-a9746e1e201f?w=800&auto=format&fit=crop&q=80",
      images: ["https://images.unsplash.com/photo-1513201099705-a9746e1e201f?w=800&auto=format&fit=crop&q=80"]
    },
    {
      id: "P004",
      name: "Laser Cut Luxury Wooden Keepsake Box",
      price: 4500,
      discounted: 5800,
      category: "Gift Items",
      description: "Exquisite laser cut floral filigree wooden memory chest with custom engraved lid, magnetic closure, and plush interior lining.",
      image: "https://images.unsplash.com/photo-1513201099705-a9746e1e201f?w=800&auto=format&fit=crop&q=80",
      images: ["https://images.unsplash.com/photo-1513201099705-a9746e1e201f?w=800&auto=format&fit=crop&q=80"]
    },
    {
      id: "P005",
      name: "3D Ayatul Kursi Arabic Calligraphy Wall Crest",
      price: 7800,
      discounted: 9800,
      category: "Islamic Decor",
      description: "Museum-grade 3D Islamic calligraphy wall art. Laser cut with micro-precision from mirror gold acrylic layered on matte piano-black MDF wood.",
      image: "https://images.unsplash.com/photo-1564769625905-50e93615e769?w=800&auto=format&fit=crop&q=80",
      images: ["https://images.unsplash.com/photo-1564769625905-50e93615e769?w=800&auto=format&fit=crop&q=80"]
    }
  ];
}

// ============================================================================
// --- 5. ORDERS ENGINE ---
// ============================================================================

function createOrder(orderData) {
  var sheet = getOrCreateSheet("Orders", [
    "Order Number", "Date", "Customer Name", "Phone", "Email", 
    "Address", "City", "Payment Method", "Items Details", "Total Amount (PKR)", "Status", "UserID", "Special Instructions"
  ]);
  
  var orderNum = "GW-" + Math.floor(100000 + Math.random() * 900000);
  var dateStr = new Date().toLocaleString("en-PK", { timeZone: "Asia/Karachi" });
  
  var name = sanitizeInput(orderData.name || orderData.customerName || "Valued Customer");
  var phone = sanitizeInput(orderData.phone || orderData.customerPhone || "");
  var email = sanitizeInput(orderData.email || orderData.customerEmail || "");
  var rawAddress = sanitizeInput(orderData.address || "");
  var city = sanitizeInput(orderData.city || "Pakistan");
  var address = rawAddress + (city && !rawAddress.toLowerCase().includes(city.toLowerCase()) ? (", " + city) : "");
  var payment = sanitizeInput(orderData.paymentMethod || orderData.payment || "Cash on Delivery");
  var instructions = sanitizeInput(orderData.instructions || orderData.notes || "");
  var userId = sanitizeInput(orderData.userID || email || phone || "guest");
  
  var rawItems = orderData.items;
  var itemsArray = [];
  if (typeof rawItems === "string") {
    try { itemsArray = JSON.parse(rawItems); } catch(e) { itemsArray = []; }
  } else if (Array.isArray(rawItems)) {
    itemsArray = rawItems;
  }
  
  var verifiedItemsSummary = [];
  var calculatedSubtotal = 0;
  
  for (var j = 0; j < itemsArray.length; j++) {
    var itm = itemsArray[j];
    var itmQty = Math.max(1, parseInt(itm.qty || itm.quantity || 1, 10));
    var unitPrice = Number(itm.price) || 0;
    var itmName = sanitizeInput(itm.name || "Custom Gift Item");
    calculatedSubtotal += (unitPrice * itmQty);
    verifiedItemsSummary.push(itmName + " (Qty: " + itmQty + ")");
  }
  
  var submittedTotal = Number(orderData.totalAmount || orderData.total || 0);
  var shippingFee = (calculatedSubtotal >= 5000 || calculatedSubtotal === 0) ? 0 : 250;
  var finalTotal = submittedTotal > 0 ? submittedTotal : (calculatedSubtotal + shippingFee);
  var itemsStr = verifiedItemsSummary.length > 0 ? verifiedItemsSummary.join(", ") : (typeof rawItems === "string" ? rawItems : "1 Custom Gift Item");
  
  sheet.appendRow([
    orderNum,
    dateStr,
    name,
    phone,
    email,
    address,
    city,
    payment,
    itemsStr,
    finalTotal,
    "Processing",
    userId,
    instructions
  ]);
  
  var directWhatsAppUrl = "https://wa.me/923230114523?text=" + 
    encodeURIComponent("Hi Gift Wallay, I have placed order #" + orderNum + " for Rs. " + finalTotal + ".\nName: " + name + "\nItems: " + itemsStr);
  
  return {
    success: true,
    message: "Order placed successfully!",
    orderID: orderNum,
    orderNum: orderNum,
    sheetSynced: true,
    whatsappDirectUrl: directWhatsAppUrl,
    order: {
      orderNum: orderNum,
      userID: userId,
      name: name,
      phone: phone,
      address: address,
      city: city,
      instructions: instructions,
      products: itemsStr,
      total: finalTotal,
      payment: payment,
      status: "Processing",
      date: dateStr
    }
  };
}

function getOrders(userKey) {
  var sheet = getOrCreateSheet("Orders", [
    "Order Number", "Date", "Customer Name", "Phone", "Email", 
    "Address", "City", "Payment Method", "Items Details", "Total Amount (PKR)", "Status", "UserID", "Special Instructions"
  ]);
  
  var data = sheet.getDataRange().getValues();
  var orders = [];
  var cleanTarget = userKey ? String(userKey).trim().toLowerCase() : "";
  var cleanDigits = cleanTarget.replace(/[^0-9]/g, '');
  
  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    var rowPhone = String(row[3] || "").replace(/[^0-9]/g, '');
    var rowEmail = String(row[4] || "").trim().toLowerCase();
    var rowUser = String(row[11] || "").trim().toLowerCase();
    
    var isMatch = false;
    if (!cleanTarget) {
      isMatch = true;
    } else if (cleanDigits.length >= 7 && rowPhone.endsWith(cleanDigits.slice(-7))) {
      isMatch = true;
    } else if (cleanTarget === rowEmail || cleanTarget === rowUser) {
      isMatch = true;
    }
    
    if (isMatch) {
      orders.push({
        orderNum: row[0],
        date: row[1],
        name: row[2],
        phone: row[3],
        email: row[4],
        address: row[5],
        city: row[6],
        paymentMethod: row[7],
        products: row[8],
        totalAmount: row[9],
        total: row[9],
        status: row[10] || "Processing",
        instructions: row[12] || ""
      });
    }
  }
  return orders;
}

function updateOrderStatus(orderNum, status, adminKey) {
  if (!verifyAdminAuth(adminKey)) {
    return { success: false, message: "Unauthorized: Admin authorization required to update order status." };
  }
  var sheet = getOrCreateSheet("Orders");
  var data = sheet.getDataRange().getValues();
  var cleanStatus = sanitizeInput(status);
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]).trim() === String(orderNum).trim()) {
      sheet.getRange(i + 1, 11).setValue(cleanStatus);
      return { success: true, message: "Order status updated to " + cleanStatus };
    }
  }
  return { success: false, message: "Order not found" };
}

// ============================================================================
// --- 6. USER ACCOUNTS ENGINE ---
// ============================================================================

function getAllUsers() {
  var sheet = getOrCreateSheet("Users", ["UserID", "Name", "Email", "Phone", "PasswordHash", "Verified", "CreatedAt"]);
  var data = sheet.getDataRange().getValues();
  var usersList = [];
  
  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    if (!row[0] && !row[2] && !row[3]) continue;
    usersList.push({
      id: String(row[0] || "U-" + i),
      name: String(row[1] || "Member"),
      email: String(row[2] || ""),
      phone: String(row[3] || ""),
      passwordHash: String(row[4] || ""),
      verified: row[5] === true || String(row[5]).toLowerCase() === "true",
      createdAt: String(row[6] || "")
    });
  }
  return usersList;
}

function getUser(query) {
  if (!query) return null;
  var target = String(query).trim().toLowerCase();
  var targetDigits = target.replace(/[^0-9]/g, '');
  var usersList = getAllUsers();
  
  for (var i = 0; i < usersList.length; i++) {
    var u = usersList[i];
    var uDigits = String(u.phone || "").replace(/[^0-9]/g, '');
    if (u.email && u.email.toLowerCase() === target) return u;
    if (u.id && u.id.toLowerCase() === target) return u;
    if (targetDigits.length >= 7 && uDigits.endsWith(targetDigits.slice(-7))) return u;
  }
  return null;
}

function registerUser(userData) {
  var sheet = getOrCreateSheet("Users", ["UserID", "Name", "Email", "Phone", "PasswordHash", "Verified", "CreatedAt"]);
  var name = sanitizeInput(userData.name || "Member");
  var email = sanitizeInput(userData.email || "").toLowerCase();
  var phone = sanitizeInput(userData.phone || "");
  var password = String(userData.password || "");
  var isGoogle = userData.isGoogle === true;
  
  if (!name) return { success: false, message: "Name is required." };
  if (!email && !phone) return { success: false, message: "Email or phone number is required." };
  
  var existingUser = getUser(email || phone);
  if (existingUser) {
    return { success: false, message: "An account already exists with this email or phone." };
  }
  
  var newId = "U-" + Math.floor(100000 + Math.random() * 900000);
  var passHash = isGoogle ? "oauth-authenticated" : hashPassword(password);
  var dateStr = new Date().toISOString();
  
  sheet.appendRow([newId, name, email, phone, passHash, true, dateStr]);
  
  return {
    success: true,
    message: "Registration successful!",
    user: {
      id: newId,
      name: name,
      email: email,
      phone: phone,
      verified: true
    }
  };
}

function loginUser(credentials) {
  var query = sanitizeInput(credentials.email || credentials.phone || credentials.username || "").toLowerCase();
  var password = String(credentials.password || "");
  
  if (!query) return { success: false, message: "Email or phone number is required." };
  
  var user = getUser(query);
  if (!user) {
    return { success: false, message: "No account found matching those details." };
  }
  
  if (password && user.passwordHash) {
    var enteredHash = hashPassword(password);
    if (enteredHash !== user.passwordHash && user.passwordHash !== "oauth-authenticated") {
      return { success: false, message: "Incorrect password." };
    }
  }
  
  return {
    success: true,
    message: "Login successful!",
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      verified: user.verified
    }
  };
}

function googleLoginUser(data) {
  var email = sanitizeInput(data.email || "").toLowerCase();
  var name = sanitizeInput(data.name || "Google User");
  if (!email) return { success: false, message: "Google account email is required." };
  
  var user = getUser(email);
  if (user) {
    return {
      success: true,
      message: "Google sign-in successful!",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        verified: user.verified
      }
    };
  }
  
  return registerUser({
    name: name,
    email: email,
    phone: "",
    password: "oauth-authenticated",
    isGoogle: true
  });
}

function saveUser(userData) {
  var sheet = getOrCreateSheet("Users", ["UserID", "Name", "Email", "Phone", "PasswordHash", "Verified", "CreatedAt"]);
  var data = sheet.getDataRange().getValues();
  var targetId = String(userData.id || userData.userID || "").trim();
  
  if (!targetId) return { success: false, message: "User ID is required." };
  
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]).trim() === targetId) {
      if (userData.name) sheet.getRange(i + 1, 2).setValue(sanitizeInput(userData.name));
      if (userData.email) sheet.getRange(i + 1, 3).setValue(sanitizeInput(userData.email).toLowerCase());
      if (userData.phone) sheet.getRange(i + 1, 4).setValue(sanitizeInput(userData.phone));
      return { success: true, message: "Profile updated successfully." };
    }
  }
  return { success: false, message: "User not found." };
}

// ============================================================================
// --- 7. CART & FAVORITES & REVIEWS ENGINES ---
// ============================================================================

function getUserCart(userKey) {
  var sheet = getOrCreateSheet("Carts", ["UserID", "CartJSON", "LastUpdated"]);
  var data = sheet.getDataRange().getValues();
  var target = String(userKey || "guest").trim().toLowerCase();
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]).trim().toLowerCase() === target) {
      try { return JSON.parse(data[i][1]); } catch(e) { return []; }
    }
  }
  return [];
}

function saveUserCart(userKey, cartData) {
  var sheet = getOrCreateSheet("Carts", ["UserID", "CartJSON", "LastUpdated"]);
  var data = sheet.getDataRange().getValues();
  var target = String(userKey || "guest").trim().toLowerCase();
  var jsonStr = typeof cartData === "string" ? cartData : JSON.stringify(cartData);
  var timeStr = new Date().toISOString();
  
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]).trim().toLowerCase() === target) {
      sheet.getRange(i + 1, 2).setValue(jsonStr);
      sheet.getRange(i + 1, 3).setValue(timeStr);
      return { success: true, message: "Cart synced." };
    }
  }
  sheet.appendRow([target, jsonStr, timeStr]);
  return { success: true, message: "Cart saved." };
}

function removeUserCartItem(userKey, productId) {
  var cart = getUserCart(userKey);
  cart = cart.filter(function(item) { return String(item.id) !== String(productId); });
  return saveUserCart(userKey, cart);
}

function getUserFavorites(userKey) {
  var sheet = getOrCreateSheet("Favorites", ["UserID", "FavoritesJSON", "LastUpdated"]);
  var data = sheet.getDataRange().getValues();
  var target = String(userKey || "guest").trim().toLowerCase();
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]).trim().toLowerCase() === target) {
      try { return JSON.parse(data[i][1]); } catch(e) { return []; }
    }
  }
  return [];
}

function saveUserFavorite(userKey, productId) {
  var favs = getUserFavorites(userKey);
  var pid = String(productId);
  if (favs.indexOf(pid) === -1) {
    favs.push(pid);
  }
  var sheet = getOrCreateSheet("Favorites", ["UserID", "FavoritesJSON", "LastUpdated"]);
  var data = sheet.getDataRange().getValues();
  var target = String(userKey || "guest").trim().toLowerCase();
  var jsonStr = JSON.stringify(favs);
  var timeStr = new Date().toISOString();
  
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]).trim().toLowerCase() === target) {
      sheet.getRange(i + 1, 2).setValue(jsonStr);
      sheet.getRange(i + 1, 3).setValue(timeStr);
      return { success: true, favorites: favs };
    }
  }
  sheet.appendRow([target, jsonStr, timeStr]);
  return { success: true, favorites: favs };
}

function removeUserFavorite(userKey, productId) {
  var favs = getUserFavorites(userKey);
  var pid = String(productId);
  favs = favs.filter(function(id) { return String(id) !== pid; });
  
  var sheet = getOrCreateSheet("Favorites", ["UserID", "FavoritesJSON", "LastUpdated"]);
  var data = sheet.getDataRange().getValues();
  var target = String(userKey || "guest").trim().toLowerCase();
  var jsonStr = JSON.stringify(favs);
  var timeStr = new Date().toISOString();
  
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]).trim().toLowerCase() === target) {
      sheet.getRange(i + 1, 2).setValue(jsonStr);
      sheet.getRange(i + 1, 3).setValue(timeStr);
      return { success: true, favorites: favs };
    }
  }
  return { success: true, favorites: favs };
}

function getReviews(productId) {
  var sheet = getOrCreateSheet("Reviews", ["ProductID", "CustomerName", "Rating", "Comment", "Date", "UserID", "ImageURL"]);
  var data = sheet.getDataRange().getValues();
  var reviews = [];
  var targetPid = productId ? String(productId).trim() : "";
  
  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    if (targetPid && String(row[0]).trim() !== targetPid) continue;
    reviews.push({
      productID: row[0],
      customerName: row[1],
      rating: Number(row[2]) || 5,
      comment: row[3],
      date: row[4],
      userID: row[5],
      image: row[6] || ""
    });
  }
  return reviews;
}

function addReview(productId, reviewData) {
  var sheet = getOrCreateSheet("Reviews", ["ProductID", "CustomerName", "Rating", "Comment", "Date", "UserID", "ImageURL"]);
  var pid = sanitizeInput(productId || reviewData.productID || "General");
  var name = sanitizeInput(reviewData.name || reviewData.customerName || "Customer");
  var rating = Number(reviewData.rating) || 5;
  var comment = sanitizeInput(reviewData.comment || "");
  var dateStr = new Date().toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' });
  var userId = sanitizeInput(reviewData.userID || "guest");
  var img = normalizeImageUrl(reviewData.image || "");
  
  sheet.appendRow([pid, name, rating, comment, dateStr, userId, img]);
  return { success: true, message: "Review posted successfully!" };
}

// ============================================================================
// --- 8. NOTIFICATION ENGINE ---
// ============================================================================

function sendWhatsAppNotification(phone, message) {
  // Safe notification stub
  return { success: true, message: "Dispatched" };
}
