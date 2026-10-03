<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Gift Wallay - Premium Gifts E-Commerce

A luxury e-commerce web application specializing in precision laser cut products, acrylic & wood name lamps, 3D multilayer wall art, home decor, customized gifts, and corporate branding.

## Deployment & Hosting

### Option 1: GitHub Pages ("website" repository)
This repository is pre-configured to be hosted directly on GitHub Pages under a repository named `website` (URL: `https://<username>.github.io/website/`) or any custom domain:
- **Instant Deployment via GitHub Pages**:
  1. Push this repository to GitHub as a repo named **`website`** (or your chosen name).
  2. In your GitHub repository, go to **Settings** > **Pages**.
  3. Under **Build and deployment**:
     - **Source**: Select **Deploy from a branch**.
     - **Branch**: Select `main` (or `master`), folder: `/ (root)`.
     - (Alternative) Select **GitHub Actions** to use the automated workflow included in `.github/workflows/deploy.yml`.
  4. Click **Save**. Your website will be live in 1-2 minutes at `https://<username>.github.io/website/`.
- **Static & Offline Resilient**:
  - All product catalogs, 12 laser-cut categories, search, shopping cart, favorites, WhatsApp OTP, and checkout work 100% statically in the browser using cached data and Google Sheets live synchronization.
  - Zero server dependencies required for GitHub Pages.
  - Relative asset paths (`./`) and `.nojekyll` are included so sub-paths (e.g. `/website/`) load seamlessly.

### Option 2: Full-Stack Local / Container (Express + Node.js)
The app includes an Express backend server with security shielding, local database emulation, and API endpoints:
1. Install dependencies:
   ```bash
   npm install
   ```
2. Run development server:
   ```bash
   npm run dev
   ```
3. Build for production:
   ```bash
   npm run build
   npm start
   ```

## Google Apps Script (code.gs) & Live Google Sheets Integration

The application includes an enterprise-grade Google Apps Script backend (`code.gs`) that seamlessly links your live Google Spreadsheet with the Gift Wallay store:

### Setup in Google Sheets:
1. Create a new Google Sheet or open your existing spreadsheet.
2. In Google Sheets, navigate to **Extensions** > **Apps Script**.
3. Clear the default script and paste the entire contents of **`code.gs`**.
4. (Optional) Run the `setupGoogleSheets()` function once in the Apps Script editor to auto-generate all required sheet tabs (`Products`, `Orders`, `Users`, `Carts`, `Favorites`, `Reviews`, `SecurityLogs`) with pre-styled bold column headers and initial products.
5. Click **Deploy** > **New deployment**.
6. Select **Web app** as the deployment type:
   - **Description**: Gift Wallay API v2
   - **Execute as**: **Me** (your Google account)
   - **Who has access**: **Anyone**
7. Click **Deploy**, approve the permissions, and copy the generated **Web App URL**.
8. Paste your URL into `main.js` as the `PRODUCTS_API` variable.

### Features in code.gs:
- **Zero-Hang WhatsApp OTP**: Generates instant 6-digit verification codes for order checkout and account registration with auto-fill, rate-limiting, and direct WhatsApp Click-to-Chat fallback.
- **Automated Order Placement**: Appends every verified order to the `Orders` sheet and dispatches formatted WhatsApp invoice messages to both the customer and store administrator (+92 323 0114523).
- **Users Sheet Persistence**: Automatically saves and authenticates customer accounts directly in the `Users` tab.
- **Catalog Management**: Automatically filters deleted or archived products, guaranteeing that only active products are rendered.
- **Live Spreadsheet Synchronization**: Direct connection to your Google Sheets tabs for real-time inventory and pricing updates.

