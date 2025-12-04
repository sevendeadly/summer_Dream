# Legacy Files Archive

This folder contains the original flat-structure files from before the MVC reorganization.

## 📦 Contents

- `index.html` - Old home page
- `rsvp.html` - Old RSVP page
- `gift.html` - Old gift page
- `info.html` - Old info page
- `albums.html` - Old albums page
- `script.js` - Old monolithic JavaScript file
- `styles.css` - Old stylesheet
- `index-v2.html` - Old React SPA version
- `readme-v2` - Old React SPA documentation
- `README-OLD.md` - Old README file

## ⚠️ Important Notes

**These files are archived for reference only and are NOT used by the current website.**

The active website now uses:
- **Multi-page MVC Version:** `/views`, `/models`, `/controllers`, `/assets`
- **React SPA Version:** `/views/spa/index.html`

## 🔄 Migration

If you need to reference old customizations:

1. Compare these files with new structure
2. See [../MIGRATION.md](../MIGRATION.md) for detailed migration guide
3. Extract your customizations and apply to new structure

## 🗑️ Deletion

These files can be safely deleted once you've:
- ✅ Migrated all customizations to new structure
- ✅ Verified new website works correctly
- ✅ Deployed and tested live site

To delete this folder:
```bash
rm -rf legacy/
```

## 📚 Documentation

For the new structure, see:
- [../README.md](../README.md) - Main documentation
- [../STRUCTURE.md](../STRUCTURE.md) - MVC architecture
- [../VERSIONS.md](../VERSIONS.md) - Version comparison
- [../MIGRATION.md](../MIGRATION.md) - Migration guide

---

**These files are preserved for reference purposes only.**
