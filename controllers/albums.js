// ===========================
// ALBUMS CONTROLLER
// ===========================

import { WEDDING_DATE, ALBUM_LINKS } from '../models/config.js';

export class AlbumsController {
    constructor() {
        this.albumsContent = document.getElementById('albums-content');
    }

    // Initialize albums page
    init() {
        if (!this.albumsContent) return;

        const now = new Date().getTime();
        const weddingPassed = now > WEDDING_DATE;

        if (weddingPassed) {
            this.showAlbums();
        } else {
            this.showComingSoon();
        }
    }

    // Show albums after wedding
    showAlbums() {
        this.albumsContent.innerHTML = `
            <div class="albums-grid">
                <div class="album-card">
                    <h3>📸 Ceremony</h3>
                    <p>Beautiful moments from our ceremony</p>
                    <a href="${ALBUM_LINKS.ceremony}" class="btn" target="_blank" rel="noopener noreferrer">View Album</a>
                    <a href="#" class="btn-small" data-album="ceremony">Download</a>
                </div>
                <div class="album-card">
                    <h3>🎉 Reception</h3>
                    <p>Fun times at the reception</p>
                    <a href="${ALBUM_LINKS.reception}" class="btn" target="_blank" rel="noopener noreferrer">View Album</a>
                    <a href="#" class="btn-small" data-album="reception">Download</a>
                </div>
                <div class="album-card">
                    <h3>💑 Couple Photos</h3>
                    <p>Special moments together</p>
                    <a href="${ALBUM_LINKS.couple}" class="btn" target="_blank" rel="noopener noreferrer">View Album</a>
                    <a href="#" class="btn-small" data-album="couple">Download</a>
                </div>
                <div class="album-card">
                    <h3>🎊 Guest Photos</h3>
                    <p>Candid shots from our guests</p>
                    <a href="${ALBUM_LINKS.guests}" class="btn" target="_blank" rel="noopener noreferrer">View Album</a>
                    <a href="#" class="btn-small" data-album="guests">Download</a>
                </div>
            </div>
            <div class="info-card" style="margin-top: 40px;">
                <h2>📝 Instructions</h2>
                <p>To add your photo galleries:</p>
                <ol>
                    <li>Upload your photos to Lightroom, Google Photos, Dropbox, or any photo hosting service</li>
                    <li>Get the shareable links for each album</li>
                    <li>Replace the placeholder links in models/config.js (ALBUM_LINKS)</li>
                    <li>For downloads, you can provide ZIP file links or direct album download links</li>
                </ol>
            </div>
        `;

        // Setup download button listeners
        this.setupDownloadButtons();
    }

    // Show coming soon message before wedding
    showComingSoon() {
        const now = new Date().getTime();
        const daysUntilWedding = Math.floor((WEDDING_DATE - now) / (1000 * 60 * 60 * 24));
        
        this.albumsContent.innerHTML = `
            <div class="coming-soon">
                <div class="coming-soon-card">
                    <h2>🎬 Coming Soon</h2>
                    <p>Our wedding albums will be available here after June 12, 2026.</p>
                    <p style="margin-top: 20px; font-size: 1.5em; color: var(--primary-color);">
                        Only <strong>${daysUntilWedding}</strong> days to go!
                    </p>
                    <p style="margin-top: 20px;">Check back after the wedding to view and download our photos! 📷</p>
                </div>
            </div>
        `;
    }

    // Setup download button listeners
    setupDownloadButtons() {
        document.addEventListener('click', (e) => {
            if (e.target.hasAttribute('data-album')) {
                e.preventDefault();
                const album = e.target.getAttribute('data-album');
                console.log(`Download requested for ${album} album. Add your download link in models/config.js (ALBUM_LINKS).`);
                // To enable downloads, replace the console.log above with:
                // window.location.href = 'https://your-download-link.com/album.zip';
            }
        });
    }
}
