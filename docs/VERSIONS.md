# Version Comparison Guide

This document compares the two versions of the Audrey & Josue-Daniel 2026 wedding website and helps you choose which one to use.

## 📊 Version Overview

### **Multi-Page MVC Version** (Default - Recommended)
**Location:** `/views/*.html` + `/models` + `/controllers` + `/assets`

A traditional multi-page website with clean MVC architecture:
- Separate HTML files for each page
- Modular JavaScript with ES6 modules
- External CSS with theme variables
- No build process required
- Works on any web server

### **React SPA Version** (Alternative)
**Location:** `/views/spa/index.html`

A single-page React application:
- Single HTML file with embedded React code
- Client-side routing
- Inline styles
- Theme switcher built-in
- Requires React to run (loaded from CDN)

## 🔍 Detailed Comparison

| Feature | Multi-Page MVC | React SPA |
|---------|----------------|-----------|
| **Architecture** | MVC Pattern | React Component |
| **File Structure** | Multiple organized files | Single file |
| **JavaScript** | Vanilla ES6 Modules | React (JSX) |
| **Styling** | External CSS with variables | Inline React styles |
| **Navigation** | Traditional page loads | Client-side routing |
| **Theme Switching** | ✅ Yes (with localStorage) | ✅ Yes (with state) |
| **Build Required** | ❌ No | ❌ No (uses CDN) |
| **SEO** | ✅ Better (multiple pages) | ⚠️ Limited (SPA) |
| **Load Time** | Fast (page-by-page) | Slower (loads all at once) |
| **Browser Support** | Wide | Modern browsers |
| **Maintenance** | Easy (separated concerns) | Moderate (single file) |
| **Customization** | Easy (edit specific files) | Harder (find in large file) |
| **Learning Curve** | Low | Medium (React knowledge needed) |

## 🎯 Which Version Should You Use?

### **Choose Multi-Page MVC Version if:**
- ✅ You want the simplest deployment (just upload files)
- ✅ You prefer traditional websites
- ✅ You want better SEO for search engines
- ✅ You want to easily customize individual pages
- ✅ You want the most maintainable structure
- ✅ You don't know React (no problem!)
- ✅ **RECOMMENDED FOR MOST USERS**

### **Choose React SPA Version if:**
- ✅ You're familiar with React
- ✅ You prefer a single-file solution
- ✅ You want smooth page transitions
- ✅ You like component-based architecture
- ✅ SEO is not a priority for you

## 📂 File Structure Comparison

### Multi-Page MVC Version
```
summer_Dream/
├── models/
│   ├── config.js           # Configuration
│   └── rsvp.js            # RSVP data model
├── views/
│   ├── index.html         # Home page
│   ├── info.html          # Wedding info
│   ├── gift.html          # Gifts
│   ├── rsvp.html          # RSVP form
│   └── albums.html        # Albums
├── controllers/
│   ├── countdown.js       # Countdown logic
│   ├── payment.js         # Payment handling
│   ├── rsvp.js           # RSVP logic
│   ├── albums.js         # Albums logic
│   ├── theme.js          # Theme switching
│   └── utility.js        # Utilities
├── assets/
│   └── css/
│       └── styles.css    # All styles
└── app.js                # Main entry point
```

### React SPA Version
```
views/spa/
└── index.html            # Everything in one file
```

## ⚙️ Configuration

Both versions use similar configuration:

### Multi-Page MVC Version
Edit `models/config.js`:
```javascript
export const WEDDING_DATE = new Date('2026-06-12T15:30:00').getTime();
export const PAYMENT_LINKS = { ... };
export const ALBUM_LINKS = { ... };
export const THEME_PALETTES = { ... };
```

### React SPA Version
Edit `views/spa/index.html` (around lines 67-68):
```javascript
const NOTION_API_KEY = 'YOUR_NOTION_API_KEY_HERE';
const DATABASE_ID = 'YOUR_DATABASE_ID_HERE';
```

## 🎨 Theme Customization

### Multi-Page MVC Version
**Option 1:** Use the theme switcher button in footer (switches between 3 palettes)

**Option 2:** Edit `models/config.js` to add custom palettes:
```javascript
export const THEME_PALETTES = {
    custom: {
        name: 'My Custom Theme',
        primary: '#yourcolor',
        secondary: '#yourcolor',
        // ... other colors
    }
};
```

**Option 3:** Edit CSS variables directly in `assets/css/styles.css`

### React SPA Version
**Option 1:** Click "Switch Theme" button in footer

**Option 2:** Change `activeTheme` state (line 27):
```javascript
const [activeTheme, setActiveTheme] = useState('warm'); // or 'ocean', 'neutral'
```

**Option 3:** Edit `THEMES` object (lines 5-24)

## 🚀 Deployment

### Multi-Page MVC Version
1. Upload entire repository to GitHub
2. Enable GitHub Pages
3. Your site is at: `https://username.github.io/repo-name/views/`

Or create a redirect in root `index.html` to `views/index.html`

### React SPA Version
1. Upload `views/spa/index.html` to GitHub
2. Rename it to `index.html` in root
3. Enable GitHub Pages
4. Your site is at: `https://username.github.io/repo-name/`

## 🔄 Migration Between Versions

### From React SPA to Multi-Page MVC:
1. Extract your customizations (names, dates, payment links)
2. Update `models/config.js` with your configuration
3. Update content in `views/*.html` files
4. Deploy the MVC version

### From Multi-Page MVC to React SPA:
1. Copy values from `models/config.js`
2. Update the React SPA file with your values
3. Deploy the SPA version

## 💡 Recommendations

### For Beginners:
**Use Multi-Page MVC Version** - It's easier to understand, customize, and maintain.

### For React Developers:
**Use React SPA Version** - You'll feel at home with the component structure.

### For Best Practices:
**Use Multi-Page MVC Version** - Better separation of concerns, easier to scale, better for teams.

### For Quick Deploy:
**Use React SPA Version** - Just one file to upload and configure.

## 🐛 Troubleshooting

### Multi-Page MVC Version
**Issue:** Modules not loading
**Solution:** Must use a web server (not file://). Use Python's `http.server` or similar.

**Issue:** Theme not persisting
**Solution:** Check if localStorage is enabled in browser

**Issue:** Navigation not working
**Solution:** Check that all HTML files are in correct paths

### React SPA Version
**Issue:** Blank page
**Solution:** Check browser console for errors. Ensure React CDN is accessible.

**Issue:** RSVP not submitting
**Solution:** Update NOTION_API_KEY and DATABASE_ID with real values

**Issue:** Theme not changing
**Solution:** Click the theme switcher button in footer

## 📚 Additional Resources

- **Multi-Page MVC:** See [STRUCTURE.md](../STRUCTURE.md) for architecture details
- **React SPA:** See [docs/SPA_VERSION.md](../docs/SPA_VERSION.md) for setup guide
- **Deployment:** See [docs/DEPLOYMENT.md](../docs/DEPLOYMENT.md) for hosting instructions
- **Notion Setup:** See [docs/NOTION_INTEGRATION.md](../docs/NOTION_INTEGRATION.md) for RSVP integration

## 🎉 Conclusion

Both versions are production-ready and fully functional. The **Multi-Page MVC Version is recommended for most users** due to its simplicity, maintainability, and better practices. The React SPA version is great if you're already comfortable with React or prefer a single-file solution.

Choose based on your needs, skills, and preferences. You can't go wrong with either!

---

**Need help deciding?** Check the decision tree:

```
Do you know React?
├─ Yes → Do you prefer single-file apps?
│   ├─ Yes → Use React SPA Version
│   └─ No → Use Multi-Page MVC Version
└─ No → Use Multi-Page MVC Version (Recommended)
```

**Made with ❤️ for Audrey & Josue-Daniel 2026**
