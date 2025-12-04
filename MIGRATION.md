# Migration Guide

This guide helps you migrate from the old flat structure to the new MVC architecture.

## 📦 What Changed?

### Old Structure (Flat)
```
summer_Dream/
├── index.html
├── rsvp.html
├── gift.html
├── info.html
├── albums.html
├── script.js
├── styles.css
├── index-v2.html (React version)
└── readme-v2
```

### New Structure (MVC)
```
summer_Dream/
├── models/                # Data & Configuration
├── views/                 # HTML Pages
├── views/spa/            # React SPA Version
├── controllers/          # Business Logic
├── assets/css/           # Stylesheets
├── docs/                 # Documentation
├── legacy/               # Old files (archived)
├── app.js               # Main entry point
└── index.html           # Root redirector
```

## 🔄 Migration Steps

### Step 1: Understand the New Structure

**Before migrating, read:**
1. [README.md](README.md) - Overview and features
2. [STRUCTURE.md](STRUCTURE.md) - MVC architecture details
3. [VERSIONS.md](VERSIONS.md) - Choose your version

### Step 2: Backup Your Customizations

If you customized the old files, save these values:

**From old `script.js`:**
- Wedding date
- Payment links (PayPal, Wise, Wero)
- Notion API keys
- Album URLs

**From old HTML files:**
- Names and personal details
- Venue information
- Bank transfer details
- Any custom content

### Step 3: Apply Customizations to New Structure

#### For Multi-Page MVC Version:

**1. Update Configuration** (`models/config.js`):
```javascript
// Wedding date
export const WEDDING_DATE = new Date('2026-06-12T15:30:00').getTime();

// Payment links
export const PAYMENT_LINKS = {
    paypal: 'your-paypal-link',
    wise: 'your-wise-link',
    wero: 'your-wero-link',
};

// Album links (after wedding)
export const ALBUM_LINKS = {
    ceremony: 'your-ceremony-album-url',
    reception: 'your-reception-album-url',
    couple: 'your-couple-album-url',
    guests: 'your-guests-album-url',
};

// Notion configuration
export const NOTION_CONFIG = {
    apiKey: 'your-api-key',
    databaseId: 'your-database-id',
};
```

**2. Update HTML Content** (`views/*.html`):
- `views/index.html` - Names and main page
- `views/info.html` - Venue details, schedule
- `views/gift.html` - Bank details, wishlist
- `views/rsvp.html` - RSVP deadline date
- `views/albums.html` - (Content generated dynamically)

**3. Choose Theme** (`assets/css/styles.css`):
Uncomment one of the three color palettes or use the theme switcher.

#### For React SPA Version:

**Update** `views/spa/index.html`:
- Lines 35-36: Wedding date
- Lines 67-68: Notion API keys
- Lines 209: Names
- Lines 321-331: Bank details
- Lines 338-348: Payment links

### Step 4: Test Locally

**Must use a web server** (not file://)

```bash
# Option 1: Python
cd /home/runner/work/summer_Dream/summer_Dream
python -m http.server 8000

# Option 2: Node.js
npx serve

# Visit: http://localhost:8000/views/
```

**Test checklist:**
- [ ] Home page loads with countdown
- [ ] All navigation links work
- [ ] RSVP form shows/hides fields correctly
- [ ] Payment buttons work or show alerts
- [ ] Theme switcher changes colors
- [ ] All pages display correctly on mobile

### Step 5: Deploy

**Choose one deployment method:**

#### Method 1: Direct Views Access
Upload everything and access via: `https://username.github.io/repo/views/index.html`

#### Method 2: Root Redirect (Included)
The `index.html` in root automatically redirects to `views/index.html`

#### Method 3: Custom Setup
Move content of `views/` to root if you prefer flat URL structure

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for detailed deployment instructions.

## 🔍 File Mapping

### Where did everything go?

| Old File | New Location | Purpose |
|----------|--------------|---------|
| `script.js` | Split into multiple files | Better organization |
| → Config section | `models/config.js` | Configuration |
| → Countdown | `controllers/countdown.js` | Timer logic |
| → Payment | `controllers/payment.js` | Payment handling |
| → RSVP | `controllers/rsvp.js` | Form handling |
| → Albums | `controllers/albums.js` | Albums display |
| → Notion | `controllers/rsvp.js` | API integration |
| | `models/rsvp.js` | Data validation |
| | `controllers/utility.js` | Utilities |
| | `controllers/theme.js` | NEW - Theme switching |
| `styles.css` | `assets/css/styles.css` | All styles |
| `index.html` | `views/index.html` | Home page |
| `rsvp.html` | `views/rsvp.html` | RSVP page |
| `gift.html` | `views/gift.html` | Gifts page |
| `info.html` | `views/info.html` | Info page |
| `albums.html` | `views/albums.html` | Albums page |
| `index-v2.html` | `views/spa/index.html` | React SPA version |
| `readme-v2` | `docs/SPA_VERSION.md` | SPA documentation |
| `README.md` | `legacy/README-OLD.md` | Archived |
| | `README.md` | NEW - Main README |
| `DEPLOYMENT.md` | `docs/DEPLOYMENT.md` | Deployment guide |
| `NOTION_INTEGRATION.md` | `docs/NOTION_INTEGRATION.md` | Notion setup |
| `QUICKSTART.md` | `docs/QUICKSTART.md` | Quick start |

## 🆕 New Features

### 1. Theme Switcher
- 3 built-in color palettes
- Persists choice in localStorage
- Click button in footer to switch
- Customizable in `models/config.js`

### 2. Data Validation
- RSVP form validates email format
- Required fields enforced
- Error messages for invalid input
- Model handles validation logic

### 3. Better Organization
- Models: Data structures
- Views: HTML templates
- Controllers: Business logic
- Easier to maintain and extend

### 4. Dual Version Support
- Multi-page MVC (recommended)
- React SPA (alternative)
- Both fully functional
- Choose based on preference

## ⚠️ Breaking Changes

### JavaScript Modules
**Old:** Single `script.js` file
**New:** ES6 modules with imports/exports

**Impact:** Must use web server for local testing (not file://)

**Fix:** Use Python `http.server` or Node `npx serve`

### File Paths
**Old:** `<link rel="stylesheet" href="styles.css">`
**New:** `<link rel="stylesheet" href="../assets/css/styles.css">`

**Impact:** Paths are relative to views directory

**Fix:** Already updated in all HTML files

### Configuration
**Old:** Edit `script.js` variables directly
**New:** Edit `models/config.js` exports

**Impact:** Need to use export syntax

**Fix:** See examples in `models/config.js`

## 🐛 Troubleshooting

### Issue: Modules not loading
**Error:** "Cannot use import statement outside a module"

**Solution:** 
1. Use `<script type="module" src="../app.js"></script>`
2. Must use a web server (not file://)

### Issue: Theme not applying
**Error:** Styles look broken or default

**Solution:**
1. Check CSS file loaded: `../assets/css/styles.css`
2. Open browser console for errors
3. Clear browser cache

### Issue: Links don't work
**Error:** 404 when clicking navigation

**Solution:**
1. Check all HTML files are in `views/` directory
2. Verify relative paths are correct
3. Test with web server, not file://

### Issue: RSVP not submitting
**Error:** Form submits but shows error

**Solution:**
1. Update Notion API keys in `models/config.js`
2. Check console for API errors
3. Verify database schema matches

## 📞 Need Help?

1. **Check documentation:**
   - [README.md](README.md) - Main documentation
   - [STRUCTURE.md](STRUCTURE.md) - Architecture guide
   - [VERSIONS.md](VERSIONS.md) - Version comparison

2. **Review examples:**
   - Look at `legacy/` folder for old code
   - Compare with new structure

3. **Test incrementally:**
   - Make one change at a time
   - Test after each change
   - Use browser console for errors

## ✅ Migration Checklist

Use this checklist to track your migration:

- [ ] Read all documentation (README, STRUCTURE, VERSIONS)
- [ ] Choose version (MVC or React SPA)
- [ ] Back up customizations from old files
- [ ] Update `models/config.js` with your data
- [ ] Update HTML content in `views/*.html`
- [ ] Choose and apply theme
- [ ] Test locally with web server
- [ ] Verify all pages load correctly
- [ ] Test RSVP form functionality
- [ ] Test payment links
- [ ] Test on mobile device
- [ ] Deploy to GitHub Pages
- [ ] Test live deployment
- [ ] Update QR code if needed
- [ ] Celebrate! 🎉

## 🎊 Post-Migration

After successful migration:

1. **Archive old files:** The `legacy/` folder contains old versions for reference
2. **Update bookmarks:** New entry point is `views/index.html` or root `index.html`
3. **Update QR code:** If URLs changed, generate new QR code
4. **Test thoroughly:** Check all features work as expected
5. **Share updates:** If guests have bookmarks, notify of new structure

## 📚 Additional Resources

- [MVC Pattern Explained](https://developer.mozilla.org/en-US/docs/Glossary/MVC)
- [ES6 Modules Guide](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules)
- [GitHub Pages Documentation](https://docs.github.com/en/pages)

---

**Congratulations on migrating to the new structure!** 🎉

Your website is now more organized, maintainable, and feature-rich.

**Made with ❤️ for Summer & Dream**
