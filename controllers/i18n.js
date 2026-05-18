// ===========================
// I18N LOCALE RESOLUTION
// Auto-detect browser language for supported locales (en, fr, de).
// Targets guests in France, USA, Canada, Cameroon, and Germany.
// ===========================

export const SUPPORTED_LOCALES = ['en', 'fr', 'de'];

/**
 * Map a BCP 47 language tag to a supported locale, or null.
 * @param {string} tag - e.g. "fr-CA", "en-US", "de-DE"
 * @returns {string|null}
 */
export function resolveLocale(tag) {
    if (!tag || typeof tag !== 'string') return null;
    const base = tag.toLowerCase().split('-')[0];
    return SUPPORTED_LOCALES.includes(base) ? base : null;
}

/**
 * Pick the best supported locale from the browser's language preferences.
 * @returns {'en'|'fr'|'de'}
 */
export function detectBrowserLocale() {
    const candidates = typeof navigator !== 'undefined'
        ? (navigator.languages?.length ? [...navigator.languages] : [navigator.language])
        : [];

    for (const tag of candidates) {
        const locale = resolveLocale(tag);
        if (locale) return locale;
    }

    return 'fr';
}
