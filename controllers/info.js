// ===========================
// INFO PAGE CONTROLLER
// ===========================

export class InfoController {
    constructor() {
        this.itineraryBtn = document.getElementById('btn-itinerary');
        this.colorSpheres = document.querySelectorAll('.color-sphere');
        this.selectedColorsList = document.getElementById('selected-colors-list');
        this.selectedColors = [];
    }

    // Initialize info page
    init() {
        this.setupItineraryButton();
        this.setupColorPaletteSelector();
    }

    // ===========================
    // ITINERARY FUNCTIONALITY
    // ===========================
    setupItineraryButton() {
        if (!this.itineraryBtn) return;

        this.itineraryBtn.addEventListener('click', () => {
            this.openItinerary();
        });
    }

    openItinerary() {
        const destination = 'Val-d\'Oise, Île-de-France, France';
        
        // Try to get user's location
        if ('geolocation' in navigator) {
            const geoOptions = { enableHighAccuracy: false, timeout: 1000, maximumAge: 0 };
            
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const origin = `${pos.coords.latitude},${pos.coords.longitude}`;
                    const url = this.buildMapsUrl(origin, destination);
                    window.open(url, '_blank', 'noopener');
                },
                (err) => {
                    // Fallback if geolocation fails
                    const url = this.buildMapsUrl(null, destination);
                    window.open(url, '_blank', 'noopener');
                },
                geoOptions
            );
        } else {
            // Fallback for browsers without geolocation
            const url = this.buildMapsUrl(null, destination);
            window.open(url, '_blank', 'noopener');
        }
    }

    buildMapsUrl(origin, destination, mode = 'driving') {
        const base = 'https://www.google.com/maps/dir/?api=1';
        const destParam = encodeURIComponent(destination.trim());
        let url = base + '&destination=' + destParam;
        if (origin) url += '&origin=' + encodeURIComponent(origin);
        if (mode) url += '&travelmode=' + encodeURIComponent(mode);
        return url;
    }

    // ===========================
    // COLOR PALETTE SELECTOR FUNCTIONALITY
    // ===========================
    setupColorPaletteSelector() {
        if (this.colorSpheres.length === 0) return;

        this.colorSpheres.forEach(sphere => {
            // Set background color from data-color attribute
            const color = sphere.getAttribute('data-color');
            sphere.style.backgroundColor = color;

            sphere.addEventListener('click', () => {
                this.toggleColorSelection(sphere);
            });
        });
    }

    toggleColorSelection(sphere) {
        const color = sphere.getAttribute('data-color');
        const colorName = sphere.getAttribute('data-name');
        
        // Toggle selection
        if (sphere.classList.contains('selected')) {
            sphere.classList.remove('selected');
            this.selectedColors = this.selectedColors.filter(c => c.hex !== color);
        } else {
            sphere.classList.add('selected');
            this.selectedColors.push({ hex: color, name: colorName });
        }
        
        // Update display
        this.updateSelectedColorsDisplay();
    }

    updateSelectedColorsDisplay() {
        if (!this.selectedColorsList) return;

        if (this.selectedColors.length === 0) {
            this.selectedColorsList.textContent = 'None yet';
            this.selectedColorsList.style.color = '#666';
        } else {
            const colorNames = this.selectedColors.map(c => c.name).join(', ');
            this.selectedColorsList.textContent = colorNames;
            this.selectedColorsList.style.color = 'var(--secondary-color)';
        }
    }
}
