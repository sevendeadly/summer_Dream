# MVC Architecture Documentation

This document explains the Model-View-Controller (MVC) architecture used in the Audrey & Josue-Daniel 2026 wedding website.

## 📚 What is MVC?

MVC is a software design pattern that separates an application into three interconnected components:

- **Model**: Manages data and business logic
- **View**: Handles the presentation layer (UI)
- **Controller**: Acts as an intermediary between Model and View

## 🏗️ Project Structure

```
summer_Dream/
├── models/                    # Data Layer
│   ├── config.js             # Application configuration
│   └── rsvp.js               # RSVP data model
│
├── views/                    # Presentation Layer
│   ├── index.html            # Home page
│   ├── info.html             # Wedding info page
│   ├── gift.html             # Gift pot page
│   ├── rsvp.html             # RSVP form page
│   └── albums.html           # Albums page
│
├── controllers/              # Business Logic Layer
│   ├── countdown.js          # Countdown timer controller
│   ├── payment.js            # Payment handling controller
│   ├── rsvp.js               # RSVP form controller
│   ├── albums.js             # Albums display controller
│   └── utility.js            # Utility functions controller
│
├── assets/                   # Static Assets
│   └── css/
│       └── styles.css        # Stylesheet
│
├── docs/                     # Documentation
│   ├── DEPLOYMENT.md
│   ├── NOTION_INTEGRATION.md
│   └── QUICKSTART.md
│
└── app.js                    # Main application entry point
```

## 🎯 Component Responsibilities

### Models (`models/`)

**Purpose**: Define data structures and configuration

#### `config.js`
- Stores application-wide configuration
- Wedding date and time
- Payment links (PayPal, Wise, Wero)
- Album URLs
- Notion API credentials

**Benefits**:
- Single source of truth for configuration
- Easy to update without touching other code
- Can be version controlled separately

#### `rsvp.js`
- Defines RSVP data structure
- Validates form data
- Provides data transformation methods

**Benefits**:
- Consistent data structure
- Centralized validation logic
- Reusable across different controllers

### Views (`views/`)

**Purpose**: Present data to users

All HTML files that make up the user interface:
- `index.html` - Home page with countdown
- `info.html` - Wedding information
- `gift.html` - Gift and payment options
- `rsvp.html` - RSVP form
- `albums.html` - Photo albums

**Best Practices**:
- Minimal inline JavaScript
- Semantic HTML
- Accessibility-friendly
- Responsive design

**Benefits**:
- Easy to update content
- Designers can work independently
- Clean separation from logic

### Controllers (`controllers/`)

**Purpose**: Handle user interactions and business logic

#### `countdown.js`
**Responsibilities**:
- Initialize countdown timer
- Update countdown every second
- Display "We're Married!" message after wedding
- Provide utility methods for date calculations

**Methods**:
- `init()` - Initialize the countdown
- `updateCountdown()` - Update display
- `getDaysUntilWedding()` - Calculate days remaining
- `hasWeddingPassed()` - Check if wedding occurred

#### `payment.js`
**Responsibilities**:
- Setup payment button links
- Handle unconfigured payment methods
- Show appropriate error messages

**Methods**:
- `init()` - Initialize all payment buttons
- `setupPayPalButton()` - Configure PayPal
- `setupWiseButton()` - Configure Wise
- `setupWeroButton()` - Configure Wero

#### `rsvp.js`
**Responsibilities**:
- Handle form submission
- Show/hide conditional fields
- Validate user input
- Submit to Notion (if configured)
- Display success/error messages

**Methods**:
- `init()` - Initialize form
- `setupAttendanceToggle()` - Handle radio buttons
- `setupFormSubmission()` - Setup submit handler
- `handleSubmit()` - Process form submission
- `submitToNotion()` - Send data to Notion
- `showSuccess()` / `showError()` - Display messages

#### `albums.js`
**Responsibilities**:
- Display albums or "coming soon" based on date
- Render album cards
- Handle download button clicks

**Methods**:
- `init()` - Initialize albums page
- `showAlbums()` - Display photo albums
- `showComingSoon()` - Display countdown message
- `setupDownloadButtons()` - Handle download clicks

#### `utility.js`
**Responsibilities**:
- Provide shared utility functions
- Setup smooth scrolling

**Methods**:
- `init()` - Initialize utilities
- `setupSmoothScroll()` - Enable smooth scrolling

### Main Application (`app.js`)

**Purpose**: Application entry point and initialization

- Imports all controllers
- Initializes controllers when DOM is ready
- Coordinates component lifecycle

## 🔄 Data Flow

### Example: RSVP Submission Flow

1. **User Action** (View)
   ```
   User fills form in rsvp.html
   User clicks "Submit RSVP"
   ```

2. **Controller Processing** (Controller)
   ```javascript
   RSVPController.handleSubmit()
   ├── Collects form data
   ├── Creates RSVPData model instance
   └── Validates data
   ```

3. **Model Validation** (Model)
   ```javascript
   RSVPData.validate()
   ├── Checks required fields
   ├── Validates email format
   └── Returns validation result
   ```

4. **Controller Actions** (Controller)
   ```javascript
   RSVPController continues...
   ├── If invalid: Show error message
   └── If valid: Submit to backend/Notion
   ```

5. **View Update** (View)
   ```
   Display success or error message
   Reset form if successful
   ```

## 🎨 Styling Architecture

### CSS Organization

The `assets/css/styles.css` file uses:
- CSS Variables for theming
- BEM-like naming conventions
- Mobile-first responsive design
- Three pre-defined color palettes

### Color Palettes

Switch themes by uncommenting palette in `styles.css`:
```css
/* PALETTE 1: Romantic Blush & Gold (Default) */
:root {
    --primary-color: #d4a5a5;
    --secondary-color: #c9a86a;
    ...
}
```

## 📦 Module System

The project uses **ES6 Modules** for code organization:

### Exports
```javascript
// models/config.js
export const WEDDING_DATE = new Date('2026-06-12T15:30:00').getTime();

// controllers/countdown.js
export class CountdownController { ... }
```

### Imports
```javascript
// app.js
import { CountdownController } from './controllers/countdown.js';
import { WEDDING_DATE } from './models/config.js';
```

### Benefits:
- ✅ Clear dependencies
- ✅ No global namespace pollution
- ✅ Better code organization
- ✅ Tree-shaking ready (if bundled)
- ✅ Modern JavaScript standards

## 🔧 Configuration Management

### Centralized Configuration

All configuration is in `models/config.js`:

```javascript
export const WEDDING_DATE = new Date('2026-06-12T15:30:00').getTime();
export const PAYMENT_LINKS = { ... };
export const ALBUM_LINKS = { ... };
export const NOTION_CONFIG = { ... };
```

### Benefits:
- Update one file to change configuration
- Easy to version control
- Can create different configs for testing
- Type safety with JSDoc comments

## 🧪 Testing Strategy

### Unit Testing (Recommended)

Each controller can be tested independently:

```javascript
// Example: test countdown.js
import { CountdownController } from './controllers/countdown.js';

test('hasWeddingPassed returns false before wedding', () => {
    const controller = new CountdownController();
    expect(controller.hasWeddingPassed()).toBe(false);
});
```

### Integration Testing

Test controllers with models:

```javascript
import { RSVPController } from './controllers/rsvp.js';
import { RSVPData } from './models/rsvp.js';

test('RSVP validation works correctly', () => {
    const data = new RSVPData({ name: '', email: '' });
    const validation = data.validate();
    expect(validation.isValid).toBe(false);
});
```

## 📈 Scalability

### Adding New Features

**Example: Add a Photo Gallery Page**

1. **Create Model** (`models/gallery.js`)
   ```javascript
   export const GALLERY_CONFIG = {
       photos: [],
       perPage: 12
   };
   ```

2. **Create Controller** (`controllers/gallery.js`)
   ```javascript
   export class GalleryController {
       init() { /* Load and display photos */ }
   }
   ```

3. **Create View** (`views/gallery.html`)
   ```html
   <!-- Gallery markup -->
   <script type="module" src="../app.js"></script>
   ```

4. **Update Main App** (`app.js`)
   ```javascript
   import { GalleryController } from './controllers/gallery.js';
   
   const galleryController = new GalleryController();
   galleryController.init();
   ```

### Benefits of This Approach:
- ✅ No changes to existing code
- ✅ Clear separation of concerns
- ✅ Easy to maintain
- ✅ Testable in isolation

## 🔒 Security Considerations

### API Keys
- Never commit API keys to repository
- Use environment variables or serverless functions
- Keep `NOTION_CONFIG` empty in public repo

### Input Validation
- All user input validated in `models/rsvp.js`
- XSS prevention through proper escaping
- Email validation with regex

### HTTPS
- GitHub Pages provides automatic HTTPS
- All external links use HTTPS

## 📚 Best Practices

### Code Organization
1. **One responsibility per module**
2. **Clear naming conventions**
3. **Export only what's needed**
4. **Document complex logic**

### File Naming
- **Models**: Singular noun (e.g., `rsvp.js`, `config.js`)
- **Controllers**: Descriptive noun (e.g., `countdown.js`, `payment.js`)
- **Views**: Descriptive HTML (e.g., `index.html`, `rsvp.html`)

### Comments
- Document configuration options
- Explain complex algorithms
- Note future TODOs

## 🎓 Learning Resources

### Understanding MVC
- [MDN Web Docs - MVC](https://developer.mozilla.org/en-US/docs/Glossary/MVC)
- [MVC Pattern Explained](https://www.freecodecamp.org/news/the-model-view-controller-pattern-mvc-explained/)

### ES6 Modules
- [MDN - JavaScript Modules](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules)
- [JavaScript.info - Modules](https://javascript.info/modules-intro)

### Modern JavaScript
- [ES6 Features](https://github.com/lukehoban/es6features)
- [JavaScript Best Practices](https://www.w3schools.com/js/js_best_practices.asp)

## 🤝 Contributing

When adding new features:

1. Follow the MVC pattern
2. Keep models data-focused
3. Keep views presentation-focused
4. Keep controllers logic-focused
5. Update this documentation
6. Test your changes locally

## 📞 Support

For questions about the architecture:
- Review this documentation
- Check inline code comments
- Refer to the main README.md

---

**Made with ❤️ for Audrey & Josue-Daniel 2026**  
*Clean architecture for a beautiful celebration*
