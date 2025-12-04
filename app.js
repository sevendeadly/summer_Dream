// ===========================
// MAIN APPLICATION CONTROLLER
// ===========================

import { CountdownController } from './controllers/countdown.js';
import { PaymentController } from './controllers/payment.js';
import { RSVPController } from './controllers/rsvp.js';
import { AlbumsController } from './controllers/albums.js';
import { UtilityController } from './controllers/utility.js';
import { ThemeController } from './controllers/theme.js';

// Initialize application when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Initialize theme controller first
    const themeController = new ThemeController();
    themeController.init();

    // Initialize countdown timer
    const countdownController = new CountdownController();
    countdownController.init();

    // Initialize payment buttons
    const paymentController = new PaymentController();
    paymentController.init();

    // Initialize RSVP form
    const rsvpController = new RSVPController();
    rsvpController.init();

    // Initialize albums page
    const albumsController = new AlbumsController();
    albumsController.init();

    // Initialize utility functions
    UtilityController.init();
});
