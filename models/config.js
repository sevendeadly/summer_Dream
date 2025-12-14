// ===========================
// CONFIGURATION MODEL
// ===========================
// Payment Links Configuration
export const PAYMENT_LINKS = {
    paypal: 'https://www.paypal.com/paypalme/danielkoanga', // Add your PayPal.me link or donation link
    wise: 'https://wise.com/pay/me/josuedanielk', // Add your Wise payment link
    wero: '07304.xx.xx', // Add your Wero payment link or phone number
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
    graduation: 'https://lightroom.adobe.com/shares/d505f5c91fbe4317a7e0e7f7c0081a63'
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
