// ===========================
// RSVP CONTROLLER
// ===========================

import { NOTION_CONFIG } from '../models/config.js';
import { RSVPData } from '../models/rsvp.js';

export class RSVPController {
    constructor() {
        this.form = document.getElementById('rsvp-form');
        this.attendingRadios = document.querySelectorAll('input[name="attending"]');
        this.guestsGroup = document.getElementById('guests-group');
        this.dietaryGroup = document.getElementById('dietary-group');
        this.guestsInput = document.getElementById('guests');
        this.formMessage = document.getElementById('form-message');
    }

    // Initialize RSVP form
    init() {
        if (!this.form) return;

        this.setupAttendanceToggle();
        this.setupFormSubmission();
    }

    // Setup attendance radio buttons to show/hide fields
    setupAttendanceToggle() {
        this.attendingRadios.forEach(radio => {
            radio.addEventListener('change', () => {
                if (radio.value === 'yes') {
                    this.guestsGroup.style.display = 'block';
                    this.dietaryGroup.style.display = 'block';
                    this.guestsInput.required = true;
                } else {
                    this.guestsGroup.style.display = 'none';
                    this.dietaryGroup.style.display = 'none';
                    this.guestsInput.required = false;
                }
            });
        });
    }

    // Setup form submission handler
    setupFormSubmission() {
        this.form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleSubmit();
        });
    }

    // Handle form submission
    async handleSubmit() {
        const submitBtn = this.form.querySelector('.btn-submit');
        
        // Disable submit button
        submitBtn.disabled = true;
        submitBtn.textContent = 'Submitting...';

        try {
            // Collect form data
            const formData = {
                name: document.getElementById('name').value,
                email: document.getElementById('email').value,
                phone: document.getElementById('phone').value,
                attending: document.querySelector('input[name="attending"]:checked').value,
                guests: document.getElementById('guests').value,
                dietary: document.getElementById('dietary').value,
                message: document.getElementById('message').value,
            };

            // Create RSVP data model
            const rsvpData = new RSVPData(formData);

            // Validate
            const validation = rsvpData.validate();
            if (!validation.isValid) {
                this.showError(validation.errors.join(', '));
                submitBtn.disabled = false;
                submitBtn.textContent = 'Submit RSVP';
                return;
            }

            // Check if Notion is configured
            if (!NOTION_CONFIG.apiKey || !NOTION_CONFIG.databaseId) {
                // Show success message even without Notion (for testing)
                this.showSuccess('Thank you for your RSVP! (Note: Notion integration not configured yet - see setup instructions below)');
                
                // Log the data for testing
                console.log('RSVP Data (not saved):', rsvpData.toJSON());
                
                // Reset form
                this.form.reset();
            } else {
                // Submit to Notion
                const response = await this.submitToNotion(rsvpData.toJSON());
                
                if (response.success) {
                    this.showSuccess('Thank you for your RSVP! We can\'t wait to celebrate with you! 🎉');
                    this.form.reset();
                } else {
                    throw new Error('Submission failed');
                }
            }
        } catch (error) {
            this.showError('Oops! Something went wrong. Please try again or contact us directly.');
            console.error('Error submitting RSVP:', error);
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Submit RSVP';
        }
    }

    // Submit to Notion API
    async submitToNotion(data) {
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

    // Show success message
    showSuccess(message) {
        this.formMessage.className = 'form-message success';
        this.formMessage.textContent = message;
    }

    // Show error message
    showError(message) {
        this.formMessage.className = 'form-message error';
        this.formMessage.textContent = message;
    }
}
