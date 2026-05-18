// ===========================
// SEATING ADMIN CONTROLLER
// ===========================

const TABLE_CAPACITY = 8;
const PRESTATAIRES_ID = '10';

export class SeatingAdminController {
    constructor() {
        this.panel = document.getElementById('seating-panel');
        this.chartEl = document.getElementById('seating-chart');
        this.importBtn = document.getElementById('seating-import-btn');
        this.saveBtn = document.getElementById('seating-save-btn');
        this.statusEl = document.getElementById('seating-status');

        this.tables = [];
        this.guests = [];
        this.pendingAssignments = new Map();
    }

    init() {
        if (!this.panel) return;
        window.seatingAdminController = this;

        if (this.importBtn) {
            this.importBtn.addEventListener('click', () => this.importGuestList());
        }
        if (this.saveBtn) {
            this.saveBtn.addEventListener('click', () => this.saveAssignments());
        }

        const tabSeating = document.getElementById('tab-seating');
        if (tabSeating) {
            tabSeating.addEventListener('click', () => this.onTabActivated());
        }
    }

    getAdminSecret() {
        return window.adminController?.adminSecret || localStorage.getItem('adminSecret') || '';
    }

    encodedSecret() {
        const secret = this.getAdminSecret();
        return btoa(unescape(encodeURIComponent(secret)));
    }

    setStatus(message, isError = false) {
        if (!this.statusEl) return;
        this.statusEl.textContent = message;
        this.statusEl.style.color = isError ? '#dc3545' : '#666';
    }

    onTabActivated() {
        if (!this.getAdminSecret()) return;
        this.loadChart();
    }

    async loadChart() {
        if (!this.chartEl) return;
        this.chartEl.innerHTML = '<p class="seating-loading">Loading seating chart…</p>';
        this.setStatus('');

        try {
            const response = await fetch('/.netlify/functions/get-seating', {
                method: 'GET',
                headers: {
                    'X-Admin-Secret': this.encodedSecret(),
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const err = await response.json().catch(() => ({}));
                throw new Error(err.error || `HTTP ${response.status}`);
            }

            const data = await response.json();
            this.tables = data.tables || [];
            this.guests = data.guests || [];
            this.pendingAssignments.clear();

            if (this.guests.length === 0) {
                this.chartEl.innerHTML =
                    '<p class="seating-empty">No guests in the database yet. Click “Import guest list” to load names from your roster.</p>';
                return;
            }

            this.renderChart();
        } catch (error) {
            console.error('get-seating failed:', error);
            this.chartEl.innerHTML = `<p class="seating-error-msg">Failed to load: ${this.escapeHtml(error.message)}</p>`;
            this.setStatus(error.message, true);
        }
    }

    async importGuestList() {
        const admin = window.adminController;
        if (!admin) return;

        const ok = await admin.openConfirmModal({
            title: 'Import guest list',
            message:
                'Import all names from data/guest-list.json into the seating database? Existing names are skipped.',
            confirmText: 'Import',
            cancelText: 'Cancel'
        });
        if (!ok) return;

        this.setStatus('Importing…');

        try {
            let names;
            try {
                const res = await fetch('/data/guest-list.json');
                names = await res.json();
            } catch (_e) {
                names = null;
            }

            const response = await fetch('/.netlify/functions/import-seating', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Admin-Secret': this.encodedSecret()
                },
                body: JSON.stringify({ mode: 'guests', names })
            });

            const data = await response.json().catch(() => ({}));
            if (!response.ok) {
                throw new Error(data.error || `HTTP ${response.status}`);
            }

            await admin.showSuccessCheckModal(
                'Imported',
                `Added ${data.inserted || 0} guest(s), skipped ${data.skipped || 0} duplicate(s).`
            );
            this.setStatus(`Imported: ${data.inserted || 0} new, ${data.skipped || 0} skipped.`);
            await this.loadChart();
        } catch (error) {
            console.error('import-seating failed:', error);
            admin.showToast(`Import failed: ${error.message}`, 'error');
            this.setStatus(error.message, true);
        }
    }

    countForTable(tableId) {
        let count = 0;
        for (const guest of this.guests) {
            const tid = this.pendingAssignments.has(guest.id)
                ? this.pendingAssignments.get(guest.id)
                : guest.tableId;
            if (tid === tableId) count += 1;
        }
        return count;
    }

    renderChart() {
        if (!this.chartEl) return;

        const unassigned = [];
        const byTable = {};
        for (const t of this.tables) {
            byTable[t.id] = [];
        }

        for (const guest of this.guests) {
            const tableId = this.pendingAssignments.has(guest.id)
                ? this.pendingAssignments.get(guest.id)
                : guest.tableId;
            if (!tableId) {
                unassigned.push(guest);
            } else if (byTable[tableId]) {
                byTable[tableId].push(guest);
            } else {
                unassigned.push(guest);
            }
        }

        let html = '<div class="seating-admin-layout">';

        html += '<section class="seating-unassigned"><h3>Unassigned</h3><ul class="seating-guest-list">';
        if (unassigned.length === 0) {
            html += '<li class="seating-guest-empty">Everyone has a table</li>';
        } else {
            unassigned.forEach((g) => {
                html += this.renderGuestRow(g);
            });
        }
        html += '</ul></section>';

        html += '<section class="seating-tables-grid">';
        for (const table of this.tables) {
            const guestsAtTable = byTable[table.id] || [];
            const count = this.countForTable(table.id);
            const cap = table.capacity;
            const over = cap != null && count > cap;
            const badge =
                cap == null ? `${count}` : `${count}/${cap}`;
            html += `<article class="seating-table-card${over ? ' seating-table-card--over' : ''}" data-table-id="${this.escapeHtml(table.id)}">`;
            html += `<header><h3>${this.escapeHtml(table.label)}</h3><span class="seating-badge">${badge}</span></header>`;
            if (over) {
                html += `<p class="seating-over-warning">Over capacity (${count}/${cap})</p>`;
            }
            html += '<ul class="seating-guest-list">';
            if (guestsAtTable.length === 0) {
                html += '<li class="seating-guest-empty">No guests yet</li>';
            } else {
                guestsAtTable.forEach((g) => {
                    html += this.renderGuestRow(g);
                });
            }
            html += '</ul></article>';
        }
        html += '</section></div>';

        this.chartEl.innerHTML = html;

        this.chartEl.querySelectorAll('.seating-table-select').forEach((select) => {
            select.addEventListener('change', (e) => {
                const guestId = parseInt(e.target.dataset.guestId, 10);
                const value = e.target.value || null;
                this.pendingAssignments.set(guestId, value);
                this.renderChart();
            });
        });
    }

    renderGuestRow(guest) {
        const current = this.pendingAssignments.has(guest.id)
            ? this.pendingAssignments.get(guest.id)
            : guest.tableId;

        let options = '<option value="">— Unassigned —</option>';
        for (const table of this.tables) {
            const selected = current === table.id ? ' selected' : '';
            options += `<option value="${this.escapeHtml(table.id)}"${selected}>${this.escapeHtml(table.label)}</option>`;
        }

        return `<li class="seating-guest-row">
            <span class="seating-guest-name">${this.escapeHtml(guest.displayName)}</span>
            <select class="seating-table-select" data-guest-id="${guest.id}" aria-label="Table for ${this.escapeHtml(guest.displayName)}">${options}</select>
        </li>`;
    }

    async saveAssignments() {
        const admin = window.adminController;
        if (!admin) return;

        const assignments = [];
        for (const guest of this.guests) {
            if (this.pendingAssignments.has(guest.id)) {
                assignments.push({
                    id: guest.id,
                    tableId: this.pendingAssignments.get(guest.id)
                });
            }
        }

        if (assignments.length === 0) {
            admin.showToast('No changes to save.', 'error');
            return;
        }

        const ok = await admin.openConfirmModal({
            title: 'Save seating',
            message: `Save ${assignments.length} table assignment(s)?`,
            confirmText: 'Save',
            cancelText: 'Cancel'
        });
        if (!ok) return;

        this.setStatus('Saving…');

        try {
            const response = await fetch('/.netlify/functions/save-seating', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Admin-Secret': this.encodedSecret()
                },
                body: JSON.stringify({ assignments })
            });

            const data = await response.json().catch(() => ({}));
            if (!response.ok) {
                if (data.overCapacity) {
                    const labels = data.overCapacity.map((o) => o.label).join(', ');
                    throw new Error(`${data.error}: ${labels}`);
                }
                throw new Error(data.error || `HTTP ${response.status}`);
            }

            await admin.showSuccessCheckModal('Saved', 'Seating assignments updated.');
            this.pendingAssignments.clear();
            this.setStatus('Saved successfully.');
            await this.loadChart();
        } catch (error) {
            console.error('save-seating failed:', error);
            admin.showToast(`Save failed: ${error.message}`, 'error');
            this.setStatus(error.message, true);
        }
    }

    escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return String(text).replace(/[&<>"']/g, (m) => map[m]);
    }
}
