// ===========================
// MAIN APPLICATION BOOTSTRAP
// File: app.js
//
// PURPOSE:
// This is the entry point of the application. It initializes all controllers
// when the DOM is ready. Each controller is responsible for a specific
// feature or page functionality.
//
// ARCHITECTURE:
// This file follows the MVC pattern by coordinating the initialization of
// all controllers. Controllers are self-contained and only initialize if
// their required DOM elements exist (graceful degradation).
//
// INITIALIZATION ORDER:
// 1. LanguageController - Must be first to set up i18n before other content loads
// 2. ThemeController - Sets up theme before other visual elements render
// 3. Feature Controllers - Countdown, Payment, RSVP, etc.
// 4. Page Controllers - Info, Albums, Admin (only initialize on their pages)
// 5. UtilityController - Shared utilities available to all
//
// NOTE:
// Controllers use defensive programming - they check for DOM elements before
// initializing, so this file can safely initialize all controllers on every page.
// ===========================

// Import all controller classes
// ES6 modules allow us to import only what we need
import { CountdownController } from './controllers/countdown.js';
import { PaymentController } from './controllers/payment.js';
import { RSVPController } from './controllers/rsvp_form.js';
import { AlbumsController } from './controllers/albums.js';
import { UtilityController } from './controllers/utility.js';
import { ThemeController } from './controllers/theme.js';
import { InfoController } from './controllers/info.js';
import { AdminController } from './controllers/admin.js';
import { LanguageController } from './controllers/language.js';

/**
 * Application Initialization
 * 
 * This function runs when the DOM is fully loaded. It initializes all
 * controllers in the correct order to ensure dependencies are met.
 * 
 * Initialization Strategy:
 * - Each controller's init() method checks if required DOM elements exist
 * - If elements don't exist, the controller gracefully does nothing
 * - This allows us to initialize all controllers on every page safely
 */
document.addEventListener('DOMContentLoaded', function() {
    // ============================================
    // PHASE 1: Foundation Controllers
    // ============================================
    // These must initialize first as other controllers may depend on them
    
    // Language Controller - Must be first!
    // Sets up internationalization before any content is displayed
    // Other controllers may use translated strings
    const languageController = new LanguageController();
    languageController.init();

    // Theme Controller - Must be early!
    // Applies theme before other visual elements render
    // Ensures consistent styling from page load
    const themeController = new ThemeController();
    themeController.init();

    // ============================================
    // PHASE 2: Feature Controllers
    // ============================================
    // These handle specific features that may appear on multiple pages
    
    // Countdown Timer - Updates every second
    // Only initializes if countdown element exists (home page)
    const countdownController = new CountdownController();
    countdownController.init();

    // Payment Buttons - Handles payment link clicks
    // Only initializes if payment buttons exist (gift page)
    const paymentController = new PaymentController();
    paymentController.init();

    // RSVP Form - Handles form submission
    // Only initializes if RSVP form exists (rsvp page)
    const rsvpController = new RSVPController();
    rsvpController.init();

    // ============================================
    // PHASE 3: Page-Specific Controllers
    // ============================================
    // These handle functionality specific to certain pages
    
    // Info Page Controller - Handles info page interactions
    // Only initializes if info page elements exist
    const infoController = new InfoController();
    infoController.init();

    // Admin Dashboard - Complete RSVP management
    // Only initializes if admin dashboard elements exist
    // Includes authentication and auto-refresh functionality
    const adminController = new AdminController();
    adminController.init();

    // Albums Page - Date-based visibility logic
    // Only initializes if albums page elements exist
    const albumsController = new AlbumsController();
    albumsController.init();

    // ============================================
    // PHASE 4: Utility Functions
    // ============================================
    // Shared utilities available to all controllers
    
    // Utility Controller - Shared helper functions
    // Static methods available globally
    UtilityController.init();
});
