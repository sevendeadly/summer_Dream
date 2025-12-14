# GitHub Copilot Instructions - Audrey & Josue-Daniel 2026 Wedding Website

## 🎯 Project Overview

A lightweight, production-ready wedding website (June 12, 2026) using **MVC architecture with Netlify serverless backend**. Current version is a multi-page vanilla JS app that uses Netlify Blob Storage for RSVPs and serverless functions for email confirmations via SendGrid.

**Key business logic:** Guests fill RSVP → Netlify function stores in Blob Storage → Admin reviews → Sends confirmation email via SendGrid.

---

## 🏗️ Architecture & Data Flow

### MVC Pattern (Non-Negotiable)
Every feature follows strict MVC structure:
- **Models** (`models/config.js`, `models/rsvp.js`) - Data & validation
- **Controllers** (`controllers/*.js`) - Business logic & DOM interaction  
- **Views** (`views/*.html`) - HTML templates (no script logic embedded)

**Pattern Example:** When adding form feature:
1. Create validation method in `models/rsvp.js` (or new model)
2. Create controller class (e.g., `RSVPController` in `controllers/rsvp_form.js`)
3. Import & initialize in `app.js` → `new FeatureController().init()`
4. Controller queries DOM elements by ID and sets up event listeners in `init()`

### Serverless Backend Flow
```
Client Form Submit → Netlify Function (controllers/netlify-func/submit-rsvp.js)
                   → Netlify Blob Storage (stores RSVP)
                   
Admin reviews RSVP → Approve button → Netlify Function (send-confirmation.js)
                   → SendGrid API sends email confirmation
                   → Updates RSVP status to "approved" or "declined"

Admin Dashboard ← Get RSVPs: get-rsvps.js (auth via X-Admin-Secret header)
```

**Critical:** API keys NEVER in client code. Functions use environment variables. See `docs/COMPLETE_SETUP.md` and `docs/RSVP_SYSTEM.md` for setup.

---

## 📂 File Organization Rules

- **`models/`** - Pure data/config, export constants & classes, no DOM access
- **`controllers/`** - ES6 classes, methods for event handlers & business logic
- **`controllers/netlify-func/`** - Node.js serverless functions (not ES6 modules)
- **`views/`** - HTML only, import controller scripts at end in `<script type="module">`
- **`assets/css/`** - Single `styles.css` with CSS variables (no separate stylesheets)
- **`docs/`** - Deployment, setup, integration guides (reference via comments in code)

---

## 🔑 Key Conventions & Patterns

### 1. Controller Class Structure
```javascript
export class FeatureController {
    constructor() {
        // Cache ALL DOM elements here (never query repeatedly)
        this.form = document.getElementById('feature-form');
        this.submitBtn = document.querySelector('.btn-submit');
    }
    
    init() {
        if (!this.form) return; // Skip if not on this page
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        this.submitBtn.addEventListener('click', () => this.handleSubmit());
    }
    
    async handleSubmit() {
        // Business logic here
    }
}
```

### 2. Environment Variables & Configuration
- All config in `models/config.js` using ES6 `export const`
- Wedding date: `new Date('2026-06-12T15:30:00').getTime()` (note: stored as timestamp)
- Theme palettes: `THEME_PALETTES` object with `name`, `primary`, `secondary` keys
- Payment links: `PAYMENT_LINKS` object (PayPal, Wise, Wero, bank transfer)

### 3. CSS Custom Properties System
- **Colors:** `--primary`, `--secondary`, `--accent` (changed by theme controller)
- **Spacing:** `--spacing-xs`, `--spacing-sm`, `--spacing-md`, `--spacing-lg`, `--spacing-xl` (replaces pixel values)
- **Shadows:** `--shadow-sm`, `--shadow-md`, `--shadow-lg` (for cards, modals)
- **Transitions:** `--transition-fast`, `--transition-base`, `--transition-slow` (for animations)
- Font stack: Cormorant Garamond (headings), Montserrat (body), Lora (elegant accents)

### 4. Form Handling Pattern (RSVP Form as Example)
1. Model validates: `new RSVPData(formData).validate()` returns `{isValid, errors: []}`
2. Controller shows/hides conditional fields on attendance radio change
3. Submit calls Netlify function `/submit-rsvp` (NOT direct Notion API)
4. Response: `{success, message, notionId}` with proper error handling
5. Display success/error in `#form-message` element

### 5. Netlify Functions Pattern
- Functions in `controllers/netlify-func/` are **Node.js**, NOT ES6 modules
- HTTP handler: `exports.handler = async (event, context) => {}`
- Access env vars: `process.env.NOTION_API_KEY`
- Return: `{statusCode: 200, body: JSON.stringify({success, data})}`
- Auth: Admin functions check header `X-Admin-Secret` against `process.env.ADMIN_SECRET`

### 6. Error Handling & User Feedback
- Show errors in dedicated `#form-message` or `#error-container` elements
- Classes: `.error` (red), `.success` (green), `.info` (blue)
- Always disable submit button during API calls, re-enable on response
- Provide fallbacks (e.g., geolocation fails → show address directly)

---

## 🔗 Critical Integration Points

### Admin Dashboard Workflow
1. **Authentication:** `AdminController` checks `localStorage.getItem('adminSecret')`
2. **Data Fetch:** Calls `/.netlify/functions/get-rsvps` with header `X-Admin-Secret`
3. **Filtering/Sorting:** Happens client-side in `AdminController` (search, attending filter, sort by column)
4. **Approval:** Calls `/.netlify/functions/send-confirmation` with admin auth
5. **Re-render:** Table updates from `this.filteredRSVPs` array

### Notion Integration
- Database ID: `NOTION_CONFIG.databaseId` in `models/config.js`
- API Key: **NEVER** in client code, only in Netlify function env vars
- Function `submit-rsvp.js` uses `@notionhq/client` to create pages
- Database schema: `name`, `email`, `phone`, `attending`, `guests`, `dietary`, `message`, `status` (pending/approved/declined)

---

## 🚀 Development Workflows

### Adding a New Feature
1. Check if data model exists; if not create in `models/`
2. Create controller class in `controllers/newfeature.js`
3. Add initialization in `app.js`: `import { NewFeatureController } from './controllers/newfeature.js'` + `new NewFeatureController().init()`
4. Add HTML elements to corresponding view in `views/`
5. Style using existing CSS variables in `assets/css/styles.css`
6. Test: `npm install && netlify dev` (or local server + check console for errors)

### Adding a Serverless Function
1. Create in `controllers/netlify-func/functionname.js`
2. Export async handler with `(event, context)` params
3. Return `{statusCode, body: JSON.stringify(...)}`
4. Access env vars via `process.env.VAR_NAME`
5. Update `netlify.toml` if needed (functions path: `controllers/netlify-func`)
6. Deploy: Push to GitHub → Netlify auto-deploys functions

### Debugging
- Client: Browser DevTools (F12) → Console for errors, Network for API calls
- Functions: `netlify dev` shows function logs; use `console.log()` for debugging
- RSVP issues: Check admin secret, Netlify Blob Storage access

---

## ⚠️ Critical Don'ts

1. **Never put API keys in frontend code** (config.js, HTML, client JS)
2. **Never query DOM outside `init()`** - Cache elements in constructor
3. **Never embed script logic in HTML** - Use controller classes
4. **Never modify styles.css without CSS variables** - Breaks theme switching
5. **Never skip form validation** - Always use `RSVPData.validate()` before submit
6. **Never call external APIs directly from client** - Always use Netlify function
7. **Never commit `.env` file** - Add to `.gitignore`, use `.env.example`

---

## 📚 Essential Documentation Links

- **Setup & Deployment:** `docs/COMPLETE_SETUP.md` (all env vars, functions, deployment)
- **RSVP System:** `docs/RSVP_SYSTEM.md` (Netlify Blob Storage, admin dashboard)
- **Email System:** `docs/EMAIL_SYSTEM.md` (SendGrid email configuration)
- **Security:** `docs/SECURITY.md` (API key protection, HTTPS, validation)
- **Deployment:** `docs/DEPLOYMENT.md` (GitHub → Netlify process)
- **Version History:** `CHANGELOG.md` (features per version)

---

## 📋 Common Tasks Checklist

- [ ] **Update wedding date?** → `models/config.js` `WEDDING_DATE`
- [ ] **Change color theme?** → Add to `THEME_PALETTES` in `models/config.js`, update `ThemeController`
- [ ] **Add payment option?** → `PAYMENT_LINKS` in `models/config.js`
- [ ] **Update album links?** → `ALBUM_LINKS` in `models/config.js`
- [ ] **Add RSVP field?** → Update `RSVPData` model validation, form HTML, Netlify functions, admin table
- [ ] **Customize email template?** → `controllers/netlify-func/send-confirmation.js` `getAcceptedTemplate()` & `getDeclinedTemplate()`
- [ ] **Add new page?** → Create `.html` in `views/`, create controller, import in `app.js`
- [ ] **Fix admin authentication?** → Check `ADMIN_SECRET` env var in Netlify, localStorage in `AdminController`

---

## 📧 Email System Configuration (SendGrid Free Tier)

**Important:** This project uses **SendGrid API**, NOT SMTP Gmail.

### Environment Variables Structure
```bash
SENDGRID_API_KEY=SG.xxxxx...              # API key only
SENDGRID_FROM_EMAIL=noreply@yourwedding.com  # Verified sender
ADMIN_EMAIL=your-email@example.com        # Where admin notifications go
ADMIN_SECRET=strong-password              # Admin dashboard auth
```

### Key Difference from Traditional SMTP
- ❌ NO `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASS`
- ✅ YES `SENDGRID_API_KEY` (API token for authentication)
- ✅ YES `SENDGRID_FROM_EMAIL` (verified in SendGrid dashboard)

### Functions Using SendGrid
- `controllers/netlify-func/send-confirmation.js` - Uses `@sendgrid/mail` package
- Initialization: `sgMail.setApiKey(process.env.SENDGRID_API_KEY)`
- Send method: `await sgMail.send({to, from, subject, html})`

### Netlify Deployment
Set these environment variables in Netlify Dashboard → Site Settings → Build & Deploy → Environment:
```
SENDGRID_API_KEY: SG.xxxxx... (from SendGrid API Keys)
SENDGRID_FROM_EMAIL: noreply@yourwedding.com (verified)
ADMIN_EMAIL: your-email@example.com
ADMIN_SECRET: strong-password-here
```

### SendGrid Quick Setup (5 minutes)
1. Go to https://sendgrid.com/free → Sign up → Verify email
2. Dashboard → Settings → API Keys → Create API Key → Copy (starts with `SG.`)
3. Dashboard → Settings → Sender Authentication → Add verified sender email
4. Paste API key into Netlify environment variables above
5. Deploy to Netlify and test

**Reference:** See `docs/RSVP_SYSTEM.md` and `docs/EMAIL_SYSTEM.md` for complete setup

---

## 🎯 When Unclear, Reference These Files

- **"How do I structure a controller?"** → `controllers/rsvp_form.js` or `controllers/info.js`
- **"How do I handle async form submission?"** → `controllers/rsvp_form.js` `handleSubmit()`
- **"How do serverless functions work?"** → `controllers/netlify-func/submit-rsvp.js`
- **"How do I access config values?"** → `models/config.js` (all exports at top)
- **"How does theme switching work?"** → `controllers/theme.js` applies CSS variable values
- **"How do I store/retrieve RSVPs?"** → `controllers/netlify-func/submit-rsvp.js`, `get-rsvps.js`, `admin.js`

---

**Last Updated:** December 14, 2025  
**Project Version:** 2.1.0 (Netlify Blob Storage + SendGrid Email)
