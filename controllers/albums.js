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
        // Normalize ALBUM_LINKS to an array of { key, url }
        const albums = Array.isArray(ALBUM_LINKS)
            ? ALBUM_LINKS.map((url, i) => ({ key: String(i), url }))
            : Object.entries(ALBUM_LINKS).map(([key, url]) => ({ key, url }));

        const niceTitle = (key) => {
            const map = {
                ceremony: '📸 Ceremony',
                reception: '🎉 Reception',
                couple: '💑 Couple Photos',
                guests: '🎊 Guest Photos',
                graduation: '🎓 Graduation Photos'
            };
            if (map[key]) return map[key];
            return key.replace(/[_-]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
        };

        const niceDescription = (key) => {
            const map = {
                ceremony: 'Beautiful moments from our ceremony',
                reception: 'Fun times at the reception',
                couple: 'Special moments together',
                guests: 'Candid shots from our guests',
                graduation: 'Memorable graduation photos'
            };
            return map[key] || `Photos for ${niceTitle(key)}`;
        };

        // Build HTML using forEach so every element in ALBUM_LINKS is processed
        let html = '<div class="albums-grid">';
        albums.forEach(({ key, url }) => {
            const title = niceTitle(key);
            const desc = niceDescription(key);
            const href = url || '#';
            html += `
                <div class="album-card" style="
                    display:flex;
                    flex-direction:column;
                    align-items:center;
                    justify-content:center;
                    text-align:center;
                    padding:20px;
                ">
                    <h3 style="margin:0 0 8px;">${title}</h3>
                    <p style="margin:0 0 12px; max-width:260px;">${desc}</p>
                    <a href="${href}" class="btn" target="_blank" rel="noopener noreferrer" style="margin:6px 0;">View Album</a>
                    <a href="#" class="btn-small" data-album="${key}" style="margin-top:6px;">Download</a>
                </div>
            `;
        });
        html += '</div>';

        html += `
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

        this.albumsContent.innerHTML = html;

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
