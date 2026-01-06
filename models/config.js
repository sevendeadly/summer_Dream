// ===========================
// CONFIGURATION MODEL
// File: models/config.js
//
// PURPOSE:
// This file serves as the central configuration hub for the entire application.
// All configurable values (dates, links, themes) are defined here, making it
// easy to customize the website without touching business logic.
//
// ARCHITECTURE:
// This is part of the Model layer in MVC. It provides data/configuration to
// controllers and views. Controllers import these constants to use throughout
// the application.
//
// CUSTOMIZATION:
// To customize the website, primarily edit this file and the HTML views.
// No need to modify controller logic for basic customization.
// ===========================

/**
 * Payment Links Configuration
 * 
 * These links are used by the PaymentController to open payment pages when
 * guests click payment buttons on the gift registry page.
 * 
 * Supported payment methods:
 * - PayPal: PayPal.me link or donation link
 * - Wise: Wise payment link
 * - Wero: Wero ID or phone number
 * 
 * Update these with your actual payment links before deployment.
 */
export const PAYMENT_LINKS = {
    paypal: 'https://www.paypal.com/paypalme/danielkoanga', // Add your PayPal.me link or donation link
    wise: 'https://wise.com/pay/me/josuedanielk', // Add your Wise payment link
    wero: '07304.xx.xx', // Add your Wero payment link or phone number
};

/**
 * Wedding Date Configuration
 * 
 * This date is used by:
 * - CountdownController: Calculates time remaining until wedding
 * - AlbumsController: Determines if albums should be visible (after wedding date)
 * 
 * Format: ISO 8601 date string (YYYY-MM-DDTHH:MM:SS)
 * - Date: YYYY-MM-DD
 * - Time: HH:MM:SS (24-hour format)
 * - Timezone: Local time (or specify timezone if needed)
 * 
 * The date is converted to milliseconds since epoch using .getTime() for
 * easy comparison with Date.now() in JavaScript.
 * 
 * Example: '2026-06-12T15:30:00' = June 12, 2026 at 3:30 PM
 */
export const WEDDING_DATE = new Date('2026-06-12T15:30:00').getTime();

// Album configuration - Update these links after the wedding
export const ALBUM_LINKS = {
    ceremony: 'https://lightroom.adobe.com/your-ceremony-album',
    reception: 'https://lightroom.adobe.com/your-reception-album',
    couple: 'https://lightroom.adobe.com/your-couple-album',
    guests: 'https://lightroom.adobe.com/your-guest-album',
    //graduation: 'https://lightroom.adobe.com/shares/d505f5c91fbe4317a7e0e7f7c0081a63'
};

// Theme Palettes Configuration
export const THEME_PALETTES = {
    
    palette2: {
        name: 'Garden Sage & Terracotta',
        primary: '#93a89d',
        secondary: '#c976538c',
        accent: '#f5f1e8',
        textDark: '#2c2c2c',
        textLight: '#666666',
        background: '#f5f1e8',
        cardBackground: '#ffffff',
        borderColor: '#c5d3ca'
    },
    palette3: {
        name: 'Ocean Blue & Coral',
        primary: '#5e8b9a',
        secondary: '#e8927c8c',
        accent: '#ffffff',
        textDark: '#2c2c2c',
        textLight: '#666666',
        background: '#f0f6f8',
        cardBackground: '#ffffff',
        borderColor: '#b8d4dc'
    }
};
