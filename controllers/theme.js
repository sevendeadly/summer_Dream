// ===========================
// THEME CONTROLLER
// ===========================

import { THEME_PALETTES } from '../models/config.js';

export class ThemeController {
    constructor() {
        this.currentPalette = 'palette1'; // Default palette
        this.loadSavedTheme();
    }

    // Initialize theme controller
    init() {
        this.createThemeSwitcher();
        this.applyTheme(this.currentPalette);
    }

    // Load saved theme from localStorage
    loadSavedTheme() {
        const saved = localStorage.getItem('wedding-theme');
        if (saved && THEME_PALETTES[saved]) {
            this.currentPalette = saved;
        }
    }

    // Apply theme to document
    applyTheme(paletteKey) {
        const palette = THEME_PALETTES[paletteKey];
        if (!palette) return;

        const root = document.documentElement;
        root.style.setProperty('--primary-color', palette.primary);
        root.style.setProperty('--secondary-color', palette.secondary);
        root.style.setProperty('--accent-color', palette.accent);
        root.style.setProperty('--text-dark', palette.textDark);
        root.style.setProperty('--text-light', palette.textLight);
        root.style.setProperty('--background', palette.background);
        root.style.setProperty('--card-background', palette.cardBackground);
        root.style.setProperty('--border-color', palette.borderColor);

        this.currentPalette = paletteKey;
        localStorage.setItem('wedding-theme', paletteKey);
    }

    // Switch to next theme
    switchTheme() {
        const palettes = Object.keys(THEME_PALETTES);
        const currentIndex = palettes.indexOf(this.currentPalette);
        const nextIndex = (currentIndex + 1) % palettes.length;
        this.applyTheme(palettes[nextIndex]);
        
        // Show notification
        this.showThemeNotification(THEME_PALETTES[palettes[nextIndex]].name);
    }

    // Show theme change notification
    showThemeNotification(themeName) {
        // Remove existing notification if any
        const existing = document.querySelector('.theme-notification');
        if (existing) existing.remove();

        const notification = document.createElement('div');
        notification.className = 'theme-notification';
        notification.textContent = `Theme: ${themeName}`;
        notification.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: var(--primary-color);
            color: white;
            padding: 12px 24px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            z-index: 1000;
            animation: slideIn 0.3s ease-out, slideOut 0.3s ease-in 2.7s;
        `;

        // Add animation styles
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(400px); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(400px); opacity: 0; }
            }
        `;
        document.head.appendChild(style);

        document.body.appendChild(notification);

        // Remove after 3 seconds
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    // Create theme switcher button in footer
    createThemeSwitcher() {
        const footer = document.querySelector('footer');
        if (!footer) return;

        // Check if button already exists
        if (document.getElementById('theme-switcher')) return;

        const switcherContainer = document.createElement('div');
        switcherContainer.style.cssText = 'margin-top: 15px;';
        
        const button = document.createElement('button');
        button.id = 'theme-switcher';
        button.textContent = '🎨 Switch Theme';
        button.className = 'btn-small';
        button.style.cssText = `
            cursor: pointer;
            font-size: 0.9em;
        `;
        
        button.addEventListener('click', () => this.switchTheme());
        
        switcherContainer.appendChild(button);
        footer.appendChild(switcherContainer);
    }

    // Get current theme name
    getCurrentThemeName() {
        return THEME_PALETTES[this.currentPalette]?.name || 'Unknown';
    }
}
