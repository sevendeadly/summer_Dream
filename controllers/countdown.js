// ===========================
// COUNTDOWN CONTROLLER
// ===========================

import { WEDDING_DATE } from '../models/config.js';

export class CountdownController {
    constructor() {
        this.countdownElement = document.getElementById('countdown');
        this.daysElement = document.getElementById('days');
        this.hoursElement = document.getElementById('hours');
        this.minutesElement = document.getElementById('minutes');
        this.secondsElement = document.getElementById('seconds');
    }

    // Initialize the countdown timer
    init() {
        if (!this.countdownElement) return;
        
        this.updateCountdown();
        setInterval(() => this.updateCountdown(), 1000);
    }

    // Update countdown display
    updateCountdown() {
        const now = new Date().getTime();
        const distance = WEDDING_DATE - now;

        if (distance < 0) {
            // Wedding has passed
            this.countdownElement.innerHTML = '<p style="font-size: 4em;">We\'re Married!!!!!!! 🎉</p>';
            return;
        }

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        if (this.daysElement) this.daysElement.textContent = days;
        if (this.hoursElement) this.hoursElement.textContent = hours;
        if (this.minutesElement) this.minutesElement.textContent = minutes;
        if (this.secondsElement) this.secondsElement.textContent = seconds;
    }

    // Get days until wedding
    getDaysUntilWedding() {
        const now = new Date().getTime();
        const distance = WEDDING_DATE - now;
        return Math.floor(distance / (1000 * 60 * 60 * 24));
    }

    // Check if wedding has passed
    hasWeddingPassed() {
        const now = new Date().getTime();
        return now > WEDDING_DATE;
    }
}
