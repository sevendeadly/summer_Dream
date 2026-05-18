# Architecture Documentation

## Overview

This wedding website follows the **Model-View-Controller (MVC)** architectural pattern, providing clear separation of concerns and making the codebase maintainable, scalable, and easy to understand.

---

## Architecture Pattern: MVC

### What is MVC?

MVC (Model-View-Controller) is a design pattern that separates an application into three interconnected components:

1. **Model** - Manages data and business logic
2. **View** - Handles presentation and user interface
3. **Controller** - Processes user input and coordinates between Model and View

### Why MVC?

- ✅ **Separation of Concerns** - Each component has a single, well-defined responsibility
- ✅ **Maintainability** - Easy to locate and modify specific functionality
- ✅ **Testability** - Components can be tested independently
- ✅ **Scalability** - Easy to add new features without affecting existing code
- ✅ **Reusability** - Controllers and models can be reused across different views

---

## Project Structure

```
summer_Dream/
│
├── models/                    # DATA LAYER (Models)
│   ├── config.js             # Application configuration
│   └── rsvp.js               # RSVP data model
│
├── views/                     # PRESENTATION LAYER (Views)
│   ├── index.html            # Home page
│   ├── info.html             # Wedding information
│   ├── gift.html             # Gift registry
│   ├── rsvp.html             # RSVP form
│   ├── albums.html           # Photo albums
│   └── admin_dashboard.html  # Admin interface
│
├── controllers/               # BUSINESS LOGIC LAYER (Controllers)
│   ├── countdown.js          # Countdown timer logic
│   ├── payment.js            # Payment handling
│   ├── rsvp_form.js          # RSVP form controller
│   ├── albums.js             # Albums display logic
│   ├── theme.js              # Theme switching
│   ├── language.js           # Internationalization
│   ├── info.js               # Info page interactions
│   ├── admin.js              # Admin dashboard
│   ├── utility.js            # Shared utilities
│   └── netlify-func/         # Serverless backend
│       ├── submit-rsvp.js    # RSVP submission API
│       ├── get-rsvps.js      # RSVP retrieval API
│       └── send-confirmation.js # Email sending API
│
├── assets/                    # STATIC ASSETS
│   ├── css/
│   │   └── styles.css        # All styles
│   └── images/               # Image files
│
├── app.js                     # APPLICATION BOOTSTRAP
└── netlify.toml              # DEPLOYMENT CONFIG
```

---

## Layer Details

### Models (`models/`)

**Purpose:** Define data structures, validation rules, and configuration.

#### `config.js`
- **Role:** Central configuration file
- **Contains:**
  - Payment links (PayPal, Wise, Wero)
  - Wedding date and time
  - Album links (for post-wedding)
  - Theme palette definitions
- **Why separate?** Single source of truth for all configuration. Easy to update without touching business logic.

#### `rsvp.js`
- **Role:** RSVP data model with validation
- **Contains:**
  - `RSVPData` class - Data structure for RSVP submissions
  - Validation methods (email format, required fields)
  - JSON serialization for API submission
- **Why separate?** Encapsulates data validation logic. Can be reused in multiple controllers.

### Views (`views/`)

**Purpose:** HTML templates that define the user interface.

**Characteristics:**
- Pure HTML structure
- No business logic embedded
- Semantic HTML for accessibility
- Consistent structure across pages
- Data attributes for JavaScript hooks

**Example Structure:**
```html
<nav class="navbar">...</nav>
<main>
    <section class="page-header">...</section>
    <section class="content">...</section>
</main>
<footer>...</footer>
```

### Controllers (`controllers/`)

**Purpose:** Handle user interactions, coordinate with models, and update views.

#### Client-Side Controllers

**Pattern:** Each controller is a class with:
- `constructor()` - Initialize DOM references and state
- `init()` - Set up event listeners and initial state
- Methods for specific functionality

**Example:**
```javascript
export class CountdownController {
    constructor() {
        this.countdownElement = document.getElementById('countdown');
    }
    
    init() {
        this.updateCountdown();
        setInterval(() => this.updateCountdown(), 1000);
    }
    
    updateCountdown() {
        // Business logic here
    }
}
```

#### Serverless Functions (`controllers/netlify-func/`)

**Purpose:** Handle server-side operations (API endpoints).

**Pattern:** Netlify Functions export a handler:
```javascript
exports.handler = async (event, context) => {
    // Handle HTTP request
    // Access environment variables
    // Return HTTP response
};
```

---

## Data Flow

### RSVP Submission Flow

```
1. User fills RSVP form (View: rsvp.html)
   ↓
2. User clicks submit
   ↓
3. RSVPController (Controller) validates data using RSVPData (Model)
   ↓
4. If valid, RSVPController calls submit-rsvp.js (Serverless Function)
   ↓
5. Serverless function stores data in Netlify Blobs (Data Storage)
   ↓
6. Response sent back to RSVPController
   ↓
7. RSVPController updates View (shows success/error message)
```

### Admin Dashboard Flow

```
1. Admin logs in (View: admin_dashboard.html)
   ↓
2. AdminController (Controller) authenticates
   ↓
3. AdminController calls get-rsvps.js (Serverless Function)
   ↓
4. Serverless function retrieves data from Netlify Blobs
   ↓
5. AdminController receives data and updates View (displays table)
   ↓
6. Admin clicks approve/decline
   ↓
7. AdminController calls send-confirmation.js (Serverless Function)
   ↓
8. Serverless function sends email via Brevo and updates RSVP status
   ↓
9. AdminController refreshes View (updates table)
```

---

## Application Bootstrap (`app.js`)

**Purpose:** Initialize all controllers when the page loads.

**Pattern:**
```javascript
document.addEventListener('DOMContentLoaded', function() {
    // Initialize controllers in order
    const languageController = new LanguageController();
    languageController.init();
    
    // ... other controllers
});
```

**Why this pattern?**
- Centralized initialization
- Clear dependency order
- Easy to see what's active on each page
- Controllers only initialize if their DOM elements exist

---

## Communication Patterns

### Client-Side Communication

**Controller ↔ View:**
- Controllers query DOM elements
- Controllers update DOM content
- Event listeners connect user actions to controller methods

**Controller ↔ Model:**
- Controllers import and use model classes
- Models provide validation and data structure
- Controllers use model methods for data processing

### Server Communication

**Client ↔ Server:**
- Fetch API for HTTP requests
- JSON for data serialization
- Environment variables for configuration
- Headers for authentication

**Example:**
```javascript
const response = await fetch('/.netlify/functions/submit-rsvp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
});
```

---

## State Management

### Client-Side State

**Where stored:**
- Controller instance properties (e.g., `this.allRSVPs`)
- localStorage (e.g., `adminSecret`, theme preference)
- DOM state (e.g., form values, visibility)

**Pattern:**
```javascript
class AdminController {
    constructor() {
        // Initialize state
        this.allRSVPs = [];
        this.filteredRSVPs = [];
        this.currentPage = 1;
    }
}
```

### Server-Side State

**Where stored:**
- Netlify Blobs (RSVP data)
- Environment variables (configuration)
- Brevo (email delivery status)

---

## Security Architecture

### Authentication Flow

```
1. Admin enters secret in login form
   ↓
2. Secret stored in localStorage (client-side)
   ↓
3. Secret sent in X-Admin-Secret header with each API request
   ↓
4. Serverless function validates secret against ADMIN_SECRET env var
   ↓
5. If valid, request processed; if invalid, 401 Unauthorized
```

### Data Protection

- **Environment Variables:** All secrets in Netlify environment variables
- **Input Validation:** Both client and server-side validation
- **HTML Escaping:** All user input escaped before display
- **HTTPS:** Enforced by Netlify

---

## Error Handling

### Client-Side

**Pattern:**
```javascript
try {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Request failed');
    const data = await response.json();
} catch (error) {
    console.error('Error:', error);
    // Show user-friendly error message
}
```

### Server-Side

**Pattern:**
```javascript
exports.handler = async (event, context) => {
    try {
        // Process request
        return { statusCode: 200, body: JSON.stringify(data) };
    } catch (error) {
        console.error('Error:', error);
        return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
    }
};
```

---

## Best Practices

### 1. Single Responsibility
Each controller, model, and view has one clear purpose.

### 2. Separation of Concerns
- Models: Data and validation
- Views: Presentation only
- Controllers: Business logic and coordination

### 3. DRY (Don't Repeat Yourself)
- Configuration in one place (`models/config.js`)
- Shared utilities in `controllers/utility.js`
- Reusable components

### 4. Modularity
- Each controller is a separate module
- Easy to add/remove features
- Clear dependencies

### 5. Documentation
- Inline comments explain complex logic
- README files for setup
- Architecture documentation (this file)

---

## Extending the Architecture

### Adding a New Feature

1. **Create Model** (if needed)
   - Add data structure in `models/`
   - Add validation logic

2. **Create View**
   - Add HTML template in `views/`
   - Follow existing structure

3. **Create Controller**
   - Add controller class in `controllers/`
   - Implement business logic
   - Connect to model and view

4. **Register Controller**
   - Add initialization in `app.js`

5. **Add Serverless Function** (if needed)
   - Add function in `controllers/netlify-func/`
   - Configure in `netlify.toml`

### Example: Adding a Guest Book Feature

```javascript
// 1. Model (models/guestbook.js)
export class GuestBookEntry {
    constructor(data) {
        this.name = data.name;
        this.message = data.message;
        this.date = new Date().toISOString();
    }
    validate() { /* validation logic */ }
}

// 2. View (views/guestbook.html)
// HTML template for guest book

// 3. Controller (controllers/guestbook.js)
export class GuestBookController {
    constructor() {
        this.form = document.getElementById('guestbook-form');
    }
    init() {
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
    }
    async handleSubmit(e) {
        // Use GuestBookEntry model
        // Submit to serverless function
    }
}

// 4. Register in app.js
import { GuestBookController } from './controllers/guestbook.js';
const guestBookController = new GuestBookController();
guestBookController.init();
```

---

## Conclusion

This MVC architecture provides:
- ✅ Clear organization
- ✅ Easy maintenance
- ✅ Scalable structure
- ✅ Testable components
- ✅ Reusable code

The separation of concerns makes it easy for developers to understand, modify, and extend the codebase while maintaining code quality and consistency.
