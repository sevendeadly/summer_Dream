// ===========================
// CONFIGURATION
// ===========================

// Notion Integration Configuration
const NOTION_CONFIG = {
    apiKey: '', // Add your Notion API key here
    databaseId: '', // Add your Notion database ID here
};

// Payment Links Configuration
const PAYMENT_LINKS = {
    paypal: '', // Add your PayPal.me link or donation link
    wise: '', // Add your Wise payment link
    wero: '', // Add your Wero payment link or phone number
};

// Wedding Date - June 12, 2026
const WEDDING_DATE = new Date('2026-06-12T15:30:00').getTime();

// ===========================
// COUNTDOWN TIMER
// ===========================

function updateCountdown() {
    const now = new Date().getTime();
    const distance = WEDDING_DATE - now;

    if (distance < 0) {
        // Wedding has passed
        document.getElementById('countdown').innerHTML = '<p style="font-size: 1.5em;">We\'re Married! 🎉</p>';
        return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    const daysEl = document.getElementById('days');
    const hoursEl = document.getElementById('hours');
    const minutesEl = document.getElementById('minutes');
    const secondsEl = document.getElementById('seconds');

    if (daysEl) daysEl.textContent = days;
    if (hoursEl) hoursEl.textContent = hours;
    if (minutesEl) minutesEl.textContent = minutes;
    if (secondsEl) secondsEl.textContent = seconds;
}

// Update countdown every second
if (document.getElementById('countdown')) {
    updateCountdown();
    setInterval(updateCountdown, 1000);
}

// ===========================
// PAYMENT BUTTONS
// ===========================

document.addEventListener('DOMContentLoaded', function() {
    // PayPal button
    const paypalBtn = document.getElementById('paypal-btn');
    if (paypalBtn) {
        if (PAYMENT_LINKS.paypal) {
            paypalBtn.href = PAYMENT_LINKS.paypal;
        } else {
            paypalBtn.addEventListener('click', function(e) {
                e.preventDefault();
                alert('PayPal link not configured yet. Please add your PayPal.me link in script.js');
            });
        }
    }

    // Wise button
    const wiseBtn = document.getElementById('wise-btn');
    if (wiseBtn) {
        if (PAYMENT_LINKS.wise) {
            wiseBtn.href = PAYMENT_LINKS.wise;
        } else {
            wiseBtn.addEventListener('click', function(e) {
                e.preventDefault();
                alert('Wise link not configured yet. Please add your Wise payment link in script.js');
            });
        }
    }

    // Wero button
    const weroBtn = document.getElementById('wero-btn');
    if (weroBtn) {
        if (PAYMENT_LINKS.wero) {
            weroBtn.href = PAYMENT_LINKS.wero;
        } else {
            weroBtn.addEventListener('click', function(e) {
                e.preventDefault();
                alert('Wero link not configured yet. Please add your Wero payment link in script.js');
            });
        }
    }
});

// ===========================
// RSVP FORM
// ===========================

document.addEventListener('DOMContentLoaded', function() {
    const rsvpForm = document.getElementById('rsvp-form');
    if (!rsvpForm) return;

    const attendingRadios = document.querySelectorAll('input[name="attending"]');
    const guestsGroup = document.getElementById('guests-group');
    const dietaryGroup = document.getElementById('dietary-group');

    // Show/hide additional fields based on attendance
    attendingRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            if (this.value === 'yes') {
                guestsGroup.style.display = 'block';
                dietaryGroup.style.display = 'block';
                document.getElementById('guests').required = true;
            } else {
                guestsGroup.style.display = 'none';
                dietaryGroup.style.display = 'none';
                document.getElementById('guests').required = false;
            }
        });
    });

    // Handle form submission
    rsvpForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        const formMessage = document.getElementById('form-message');
        const submitBtn = rsvpForm.querySelector('.btn-submit');
        
        // Disable submit button
        submitBtn.disabled = true;
        submitBtn.textContent = 'Submitting...';

        // Collect form data
        const formData = {
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            attending: document.querySelector('input[name="attending"]:checked').value,
            guests: document.getElementById('guests').value,
            dietary: document.getElementById('dietary').value,
            message: document.getElementById('message').value,
            submittedAt: new Date().toISOString(),
        };

        // Check if Notion is configured
        if (!NOTION_CONFIG.apiKey || !NOTION_CONFIG.databaseId) {
            // Show success message even without Notion (for testing)
            formMessage.className = 'form-message success';
            formMessage.textContent = 'Thank you for your RSVP! (Note: Notion integration not configured yet - see setup instructions below)';
            
            // Log the data for testing
            console.log('RSVP Data (not saved):', formData);
            
            // Reset form
            rsvpForm.reset();
            submitBtn.disabled = false;
            submitBtn.textContent = 'Submit RSVP';
            
            return;
        }

        try {
            // Submit to Notion
            const response = await submitToNotion(formData);
            
            if (response.success) {
                formMessage.className = 'form-message success';
                formMessage.textContent = 'Thank you for your RSVP! We can\'t wait to celebrate with you! 🎉';
                rsvpForm.reset();
            } else {
                throw new Error('Submission failed');
            }
        } catch (error) {
            formMessage.className = 'form-message error';
            formMessage.textContent = 'Oops! Something went wrong. Please try again or contact us directly.';
            console.error('Error submitting RSVP:', error);
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Submit RSVP';
        }
    });
});

// ===========================
// NOTION INTEGRATION
// ===========================

async function submitToNotion(data) {
    // This is a client-side example. For production, you should create a serverless function
    // (e.g., Netlify Functions, Vercel Serverless Functions, or AWS Lambda) to handle Notion API calls
    // to keep your API key secure.
    
    // Example structure for serverless function:
    /*
    const response = await fetch('/.netlify/functions/submit-rsvp', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });
    
    return await response.json();
    */

    // For now, return a mock response
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({ success: true });
        }, 1000);
    });
}

// ===========================
// ALBUMS PAGE - DATE-BASED VISIBILITY
// ===========================

document.addEventListener('DOMContentLoaded', function() {
    const albumsContent = document.getElementById('albums-content');
    if (!albumsContent) return;

    const now = new Date().getTime();
    const weddingPassed = now > WEDDING_DATE;

    if (weddingPassed) {
        // Show albums - wedding has happened
        albumsContent.innerHTML = `
            <div class="albums-grid">
                <div class="album-card">
                    <h3>📸 Ceremony</h3>
                    <p>Beautiful moments from our ceremony</p>
                    <a href="#" class="btn" onclick="alert('Add your Lightroom or photo gallery link here'); return false;">View Album</a>
                    <a href="#" class="btn-small" onclick="alert('Add download link here'); return false;">Download</a>
                </div>
                <div class="album-card">
                    <h3>🎉 Reception</h3>
                    <p>Fun times at the reception</p>
                    <a href="#" class="btn" onclick="alert('Add your Lightroom or photo gallery link here'); return false;">View Album</a>
                    <a href="#" class="btn-small" onclick="alert('Add download link here'); return false;">Download</a>
                </div>
                <div class="album-card">
                    <h3>💑 Couple Photos</h3>
                    <p>Special moments together</p>
                    <a href="#" class="btn" onclick="alert('Add your Lightroom or photo gallery link here'); return false;">View Album</a>
                    <a href="#" class="btn-small" onclick="alert('Add download link here'); return false;">Download</a>
                </div>
                <div class="album-card">
                    <h3>🎊 Guest Photos</h3>
                    <p>Candid shots from our guests</p>
                    <a href="#" class="btn" onclick="alert('Add your Lightroom or photo gallery link here'); return false;">View Album</a>
                    <a href="#" class="btn-small" onclick="alert('Add download link here'); return false;">Download</a>
                </div>
            </div>
            <div class="info-card" style="margin-top: 40px;">
                <h2>📝 Instructions</h2>
                <p>To add your photo galleries:</p>
                <ol>
                    <li>Upload your photos to Lightroom, Google Photos, Dropbox, or any photo hosting service</li>
                    <li>Get the shareable links for each album</li>
                    <li>Replace the placeholder links in the album cards above (edit script.js)</li>
                    <li>For downloads, you can provide ZIP file links or direct album download links</li>
                </ol>
            </div>
        `;
    } else {
        // Show "coming soon" message
        const daysUntilWedding = Math.floor((WEDDING_DATE - now) / (1000 * 60 * 60 * 24));
        albumsContent.innerHTML = `
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
});

// ===========================
// UTILITY FUNCTIONS
// ===========================

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});
