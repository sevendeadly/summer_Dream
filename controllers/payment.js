// ===========================
// PAYMENT CONTROLLER
// ===========================

import { PAYMENT_LINKS } from '../models/config.js';

export class PaymentController {
    constructor() {
        this.paypalBtn = document.getElementById('paypal-btn');
        this.wiseBtn = document.getElementById('wise-btn');
        this.weroBtn = document.getElementById('wero-btn');
    }

    // Initialize payment buttons
    init() {
        this.setupPayPalButton();
        this.setupWiseButton();
        this.setupWeroButton();
    }

    // Setup PayPal button
    setupPayPalButton() {
        if (!this.paypalBtn) return;

        if (PAYMENT_LINKS.paypal) {
            this.paypalBtn.href = PAYMENT_LINKS.paypal;
        } else {
            this.paypalBtn.addEventListener('click', (e) => {
                e.preventDefault();
                alert('PayPal link not configured yet. Please add your PayPal.me link in models/config.js');
            });
        }
    }

    // Setup Wise button
    setupWiseButton() {
        if (!this.wiseBtn) return;

        if (PAYMENT_LINKS.wise) {
            this.wiseBtn.href = PAYMENT_LINKS.wise;
        } else {
            this.wiseBtn.addEventListener('click', (e) => {
                e.preventDefault();
                alert('Wise link not configured yet. Please add your Wise payment link in models/config.js');
            });
        }
    }

    // Setup Wero button
    setupWeroButton() {
        if (!this.weroBtn) return;

        if (PAYMENT_LINKS.wero) {
            this.weroBtn.href = PAYMENT_LINKS.wero;
        } else {
            this.weroBtn.addEventListener('click', (e) => {
                e.preventDefault();
                alert('Wero link not configured yet. Please add your Wero payment link in models/config.js');
            });
        }
    }
}
