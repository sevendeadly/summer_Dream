// ===========================
// CONFIGURATION MODEL
// ===========================

// Notion Integration Configuration
export const NOTION_CONFIG = {
    apiKey: '', // Add your Notion API key here
    databaseId: '', // Add your Notion database ID here
};

// Payment Links Configuration
export const PAYMENT_LINKS = {
    paypal: '', // Add your PayPal.me link or donation link
    wise: '', // Add your Wise payment link
    wero: '', // Add your Wero payment link or phone number
};

// Wedding Date - June 12, 2026 at 3:30 PM (ceremony time)
// Update the time (15:30:00) if your ceremony starts at a different time
export const WEDDING_DATE = new Date('2026-06-12T15:30:00').getTime();

// Album configuration - Update these links after the wedding
export const ALBUM_LINKS = {
    ceremony: 'https://lightroom.adobe.com/your-ceremony-album',
    reception: 'https://lightroom.adobe.com/your-reception-album',
    couple: 'https://lightroom.adobe.com/your-couple-album',
    guests: 'https://lightroom.adobe.com/your-guest-album',
};

// Theme Palettes Configuration
export const THEME_PALETTES = {
    palette1: {
        name: 'Romantic Blush & Gold',
        primary: '#d4a5a5',
        secondary: '#c9a86a',
        accent: '#ffffff',
        textDark: '#2c2c2c',
        textLight: '#666666',
        background: '#faf8f5',
        cardBackground: '#ffffff',
        borderColor: '#e8d5d5'
    },
    palette2: {
        name: 'Garden Sage & Terracotta',
        primary: '#93a89d',
        secondary: '#c97653',
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
        secondary: '#e8927c',
        accent: '#ffffff',
        textDark: '#2c2c2c',
        textLight: '#666666',
        background: '#f0f6f8',
        cardBackground: '#ffffff',
        borderColor: '#b8d4dc'
    }
};
