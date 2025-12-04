// ===========================
// RSVP DATA MODEL
// ===========================

export class RSVPData {
    constructor(formData) {
        this.name = formData.name || '';
        this.email = formData.email || '';
        this.phone = formData.phone || '';
        this.attending = formData.attending || '';
        this.guests = formData.guests || '1';
        this.dietary = formData.dietary || '';
        this.message = formData.message || '';
        this.submittedAt = new Date().toISOString();
    }

    // Validate the RSVP data
    validate() {
        const errors = [];
        
        if (!this.name || this.name.trim() === '') {
            errors.push('Name is required');
        }
        
        if (!this.email || this.email.trim() === '') {
            errors.push('Email is required');
        } else if (!this.isValidEmail(this.email)) {
            errors.push('Email is invalid');
        }
        
        if (!this.attending) {
            errors.push('Attendance selection is required');
        }
        
        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }

    // Helper method to validate email format
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Convert to JSON for submission
    toJSON() {
        return {
            name: this.name,
            email: this.email,
            phone: this.phone,
            attending: this.attending,
            guests: this.guests,
            dietary: this.dietary,
            message: this.message,
            submittedAt: this.submittedAt
        };
    }
}
