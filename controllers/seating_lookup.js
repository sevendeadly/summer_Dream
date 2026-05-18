// ===========================
// SEATING LOOKUP CONTROLLER (guest QR page)
// ===========================

export class SeatingLookupController {
    constructor() {
        this.form = document.getElementById('seating-lookup-form');
        this.nameInput = document.getElementById('guest-name');
        this.errorEl = document.getElementById('seating-error');
        this.modalRoot = document.getElementById('seating-modal-root');
        this.modalMessage = document.getElementById('seating-modal-message');
        this.pickerRoot = document.getElementById('seating-picker-root');
        this.pickerList = document.getElementById('seating-picker-list');
    }

    init() {
        if (!this.form) return;

        this.form.addEventListener('submit', (e) => this.onSubmit(e));

        document.querySelectorAll('[data-seating-dismiss]').forEach((el) => {
            el.addEventListener('click', () => this.closeModals());
        });

        document.querySelectorAll('.seating-modal-close').forEach((btn) => {
            btn.addEventListener('click', () => this.closeModals());
        });
    }

    t(key) {
        const lc = window.languageController;
        if (lc && typeof lc.getTranslation === 'function') {
            return lc.getTranslation(key);
        }
        return key;
    }

    welcomeMessage(displayName, tableLabel) {
        const template = this.t('seating.welcomeMessage');
        return template
            .replace('{name}', displayName)
            .replace('{table}', tableLabel);
    }

    showError(message) {
        if (!this.errorEl) return;
        this.errorEl.textContent = message;
        this.errorEl.hidden = !message;
    }

    closeModals() {
        if (this.modalRoot) this.modalRoot.hidden = true;
        if (this.pickerRoot) this.pickerRoot.hidden = true;
    }

    showWelcomeModal(displayName, tableLabel) {
        if (!this.modalRoot || !this.modalMessage) return;
        this.closeModals();
        this.modalMessage.textContent = this.welcomeMessage(displayName, tableLabel);
        this.modalRoot.hidden = false;
    }

    showPicker(options) {
        if (!this.pickerRoot || !this.pickerList) return;
        this.closeModals();
        this.pickerList.innerHTML = '';

        options.forEach((opt) => {
            const li = document.createElement('li');
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'seating-picker-option';
            btn.textContent = opt.displayName;
            btn.addEventListener('click', () => this.lookupByDisplayName(opt.displayName));
            li.appendChild(btn);
            this.pickerList.appendChild(li);
        });

        this.pickerRoot.hidden = false;
    }

    async onSubmit(e) {
        e.preventDefault();
        this.showError('');
        const name = this.nameInput?.value.trim();
        if (!name) {
            this.showError(this.t('seating.errorNameRequired'));
            return;
        }
        await this.lookupByName(name);
    }

    async lookupByName(name) {
        try {
            const response = await fetch('/.netlify/functions/lookup-seat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name })
            });
            await this.handleLookupResponse(response, name);
        } catch (err) {
            console.error('lookup-seat failed:', err);
            this.showError(this.t('seating.errorGeneric'));
        }
    }

    async lookupByDisplayName(displayName) {
        try {
            const response = await fetch('/.netlify/functions/lookup-seat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ displayName })
            });
            await this.handleLookupResponse(response, displayName);
        } catch (err) {
            console.error('lookup-seat failed:', err);
            this.showError(this.t('seating.errorGeneric'));
        }
    }

    async handleLookupResponse(response, _query) {
        const data = await response.json().catch(() => ({}));

        if (response.status === 503) {
            this.showError(this.t('seating.errorDisabled'));
            return;
        }

        if (data.ambiguous && Array.isArray(data.options)) {
            this.showPicker(data.options);
            return;
        }

        if (!response.ok) {
            if (response.status === 404) {
                this.showError(this.t('seating.errorNotFound'));
            } else {
                this.showError(data.error || this.t('seating.errorGeneric'));
            }
            return;
        }

        this.showWelcomeModal(data.displayName, data.tableLabel);
    }
}
