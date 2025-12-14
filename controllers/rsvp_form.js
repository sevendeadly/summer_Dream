// ===========================
// RSVP CONTROLLER
// ===========================

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

            // Submit to Netlify function
            const response = await this.submitRSVP(rsvpData.toJSON());
            
            if (response.success) {
                this.showSuccess('Thank you for your RSVP! We can\'t wait to celebrate with you! 🎉');
                this.form.reset();
            } else {
                throw new Error('Submission failed');
            }
        } catch (error) {
            this.showError('Oops! Something went wrong. Please try again or contact us directly.');
            console.error('Error submitting RSVP:', error);
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Submit RSVP';
        }
    }

    // Submit RSVP to Netlify function
    async submitRSVP(data) {
        try {
            const response = await fetch('/.netlify/functions/submit-rsvp', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error submitting RSVP:', error);
            throw error;
        }
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
