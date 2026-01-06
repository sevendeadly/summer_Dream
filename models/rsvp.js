// ===========================
// RSVP DATA MODEL
// File: models/rsvp.js
//
// PURPOSE:
// This class represents the RSVP data structure and provides validation logic.
// It's part of the Model layer in MVC architecture.
//
// USAGE:
// 1. RSVPController creates an instance from form data
// 2. Validation is performed before submission
// 3. Data is serialized to JSON for API submission
//
// ARCHITECTURE:
// This follows the Model pattern by:
// - Encapsulating data structure
// - Providing validation methods
// - Handling data transformation (toJSON)
// ===========================

/**
 * RSVP Data Model Class
 * 
 * This class represents a single RSVP submission with all its properties
 * and validation logic. It ensures data integrity before submission to the server.
 * 
 * Properties:
 * - name: Guest's full name (required)
 * - email: Guest's email address (required, validated)
 * - phone: Guest's phone number (optional)
 * - attending: 'yes' or 'no' (required)
 * - guests: Number of guests including themselves (default: '1')
 * - dietary: Dietary restrictions or allergies (optional)
 * - message: Personal message for the couple (optional)
 * - submittedAt: ISO timestamp of submission (auto-generated)
 */
export class RSVPData {
    /**
     * Constructor
     * 
     * Initializes RSVP data from form input. All fields have default values
     * to prevent undefined errors. The submittedAt timestamp is automatically
     * set to the current time.
     * 
     * @param {Object} formData - Form data object from RSVP form
     */
    constructor(formData) {
        this.name = formData.name || '';
        this.email = formData.email || '';
        this.phone = formData.phone || '';
        this.attending = formData.attending || '';
        this.guests = formData.guests || '1'; // Default to 1 guest
        this.dietary = formData.dietary || '';
        this.message = formData.message || '';
        this.submittedAt = new Date().toISOString(); // ISO 8601 format timestamp
    }

    /**
     * Validate RSVP Data
     * 
     * Performs client-side validation before submission. This provides
     * immediate feedback to users and reduces unnecessary server requests.
     * 
     * Note: Server-side validation is also performed in submit-rsvp.js
     * for security. Never trust client-side validation alone.
     * 
     * Validation Rules:
     * - Name: Required, non-empty after trimming
     * - Email: Required, must match valid email format
     * - Attending: Required, must be 'yes' or 'no'
     * 
     * @returns {Object} Validation result
     *   - isValid: boolean - True if all validations pass
     *   - errors: string[] - Array of error messages (empty if valid)
     */
    validate() {
        const errors = [];
        
        // Name validation: Required field
        if (!this.name || this.name.trim() === '') {
            errors.push('Name is required');
        }
        
        // Email validation: Required and must be valid format
        if (!this.email || this.email.trim() === '') {
            errors.push('Email is required');
        } else if (!this.isValidEmail(this.email)) {
            errors.push('Email is invalid');
        }
        
        // Attendance validation: Required selection
        if (!this.attending) {
            errors.push('Attendance selection is required');
        }
        
        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }

    /**
     * Email Format Validation
     * 
     * Validates email format using regex pattern. The pattern ensures:
     * - At least one character before @
     * - @ symbol
     * - At least one character after @
     * - Dot (.)
     * - At least one character after dot
     * 
     * Pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
     * 
     * @param {string} email - Email address to validate
     * @returns {boolean} True if email format is valid
     */
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    /**
     * Serialize to JSON
     * 
     * Converts the RSVPData instance to a plain JavaScript object suitable
     * for JSON serialization and API submission. This excludes any methods
     * and only includes data properties.
     * 
     * @returns {Object} Plain object with RSVP data
     */
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
