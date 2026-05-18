// ===========================
// RSVP CONTROLLER
// ===========================

import { RSVPData } from '../models/rsvp.js';
import { isRsvpOpen } from '../models/config.js';

export class RSVPController {
    constructor() {
        this.form = document.getElementById('rsvp-form');
        this.closedPanel = document.getElementById('rsvp-closed');
        this.deadlineLine = document.getElementById('rsvp-deadline-line');
        this.headerSubtitle = document.getElementById('rsvp-header-subtitle');
        this.attendingRadios = document.querySelectorAll('input[name="attending"]');
        this.guestsGroup = document.getElementById('guests-group');
        this.dietaryGroup = document.getElementById('dietary-group');
        this.guestsInput = document.getElementById('guests');
        this.formMessage = document.getElementById('form-message');
    }

    init() {
        if (!this.form) return;

        if (!isRsvpOpen()) {
            this.showClosedState();
            return;
        }

        this.setupAttendanceToggle();
        this.setupFormSubmission();
    }

    showClosedState() {
        if (this.form) {
            this.form.style.display = 'none';
        }
        if (this.closedPanel) {
            this.closedPanel.hidden = false;
        }
        if (this.deadlineLine) {
            this.deadlineLine.hidden = true;
        }
        if (this.headerSubtitle) {
            this.headerSubtitle.hidden = true;
        }
    }

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

    setupFormSubmission() {
        this.form.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (!isRsvpOpen()) {
                this.showClosedState();
                return;
            }
            await this.handleSubmit();
        });
    }

    getSubmitLabel() {
        return window.languageController?.getTranslation('rsvp.submit') || 'Submit RSVP';
    }

    getSubmittingLabel() {
        return window.languageController?.getTranslation('rsvp.submitting') || 'Submitting...';
    }

    async handleSubmit() {
        const submitBtn = this.form.querySelector('.btn-submit');

        submitBtn.disabled = true;
        submitBtn.textContent = this.getSubmittingLabel();

        try {
            const formData = {
                name: document.getElementById('name').value,
                email: document.getElementById('email').value,
                phone: document.getElementById('phone').value,
                attending: document.querySelector('input[name="attending"]:checked').value,
                guests: document.getElementById('guests').value,
                dietary: document.getElementById('dietary').value,
                message: document.getElementById('message').value,
            };

            const rsvpData = new RSVPData(formData);
            const validation = rsvpData.validate();
            if (!validation.isValid) {
                this.showError(validation.errors.join(', '));
                return;
            }

            const response = await this.submitRSVP(rsvpData.toJSON());

            if (response.success) {
                this.showSuccess('Thank you for your RSVP! We can\'t wait to celebrate with you! 🎉');
                this.form.reset();
            } else {
                throw new Error('Submission failed');
            }
        } catch (error) {
            console.error('Error submitting RSVP:', error);
            const errorMessage = error.response?.data?.error || error.message || 'Oops! Something went wrong. Please try again or contact us directly.';
            this.showError(errorMessage);
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = this.getSubmitLabel();
        }
    }

    async submitRSVP(data) {
        const response = await fetch('/.netlify/functions/submit-rsvp', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        const responseData = await response.json();

        if (!response.ok) {
            const errorMsg = responseData.error || responseData.message || responseData.details || `HTTP ${response.status}`;
            throw new Error(errorMsg);
        }

        return responseData;
    }

    showSuccess(message) {
        this.formMessage.className = 'form-message success';
        this.formMessage.textContent = message;
    }

    showError(message) {
        this.formMessage.className = 'form-message error';
        this.formMessage.textContent = message;
    }
}
