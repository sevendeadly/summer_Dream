// ===========================
// ADMIN DASHBOARD CONTROLLER
// ===========================

export class AdminController {
    constructor() {
        this.adminSecret = localStorage.getItem('adminSecret') || '';
        this.allRSVPs = [];
        this.filteredRSVPs = [];
        this.currentPage = 1;
        this.itemsPerPage = 10;
        this.sortColumn = 'submittedAt';
        this.sortDirection = 'desc';
        
        // DOM elements
        this.loginSection = document.getElementById('login-section');
        this.dashboardSection = document.getElementById('dashboard-section');
        this.secretInput = document.getElementById('admin-secret');
        this.loginBtn = document.getElementById('login-btn');
        this.logoutBtn = document.getElementById('logout-btn');
        this.filterAttending = document.getElementById('filter-attending');
        this.filterStatus = document.getElementById('filter-status');
        this.searchInput = document.getElementById('search-input');
        this.rsvpTable = document.getElementById('rsvp-table');
        this.statsAttending = document.getElementById('stats-attending');
        this.statsPending = document.getElementById('stats-pending');
        this.statsTotal = document.getElementById('stats-total');
        this.paginationControls = document.getElementById('pagination-controls');
    }

    // Initialize admin dashboard
    init() {
        if (!this.loginSection) return; // Not on admin page

        this.setupEventListeners();
        
        // Check if already logged in
        if (this.adminSecret) {
            this.showDashboard();
            this.loadRSVPs();
        } else {
            this.showLogin();
        }
    }

    // ===========================
    // AUTHENTICATION
    // ===========================

    setupEventListeners() {
        if (this.loginBtn) {
            this.loginBtn.addEventListener('click', () => this.handleLogin());
        }

        if (this.secretInput) {
            this.secretInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.handleLogin();
            });
        }

        if (this.logoutBtn) {
            this.logoutBtn.addEventListener('click', () => this.handleLogout());
        }

        if (this.filterAttending) {
            this.filterAttending.addEventListener('change', () => this.applyFilters());
        }

        if (this.filterStatus) {
            this.filterStatus.addEventListener('change', () => this.applyFilters());
        }

        if (this.searchInput) {
            this.searchInput.addEventListener('input', () => this.applyFilters());
        }
    }

    handleLogin() {
        const secret = this.secretInput?.value.trim();
        if (!secret) {
            alert('Please enter admin secret');
            return;
        }

        this.adminSecret = secret;
        localStorage.setItem('adminSecret', secret);
        this.showDashboard();
        this.loadRSVPs();
    }

    handleLogout() {
        localStorage.removeItem('adminSecret');
        this.adminSecret = '';
        this.allRSVPs = [];
        this.secretInput.value = '';
        this.showLogin();
    }

    showLogin() {
        if (this.loginSection) this.loginSection.style.display = 'block';
        if (this.dashboardSection) this.dashboardSection.style.display = 'none';
    }

    showDashboard() {
        if (this.loginSection) this.loginSection.style.display = 'none';
        if (this.dashboardSection) this.dashboardSection.style.display = 'block';
    }

    // ===========================
    // RSVP MANAGEMENT
    // ===========================

    async loadRSVPs() {
        try {
            const response = await fetch('/.netlify/functions/get-rsvps', {
                method: 'GET',
                headers: {
                    'X-Admin-Secret': this.adminSecret,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                if (response.status === 401) {
                    alert('Invalid admin secret');
                    this.handleLogout();
                    return;
                }
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();
            this.allRSVPs = data.results || [];
            this.applyFilters();
        } catch (error) {
            console.error('Error loading RSVPs:', error);
            alert('Failed to load RSVPs. Check admin secret and try again.');
        }
    }

    applyFilters() {
        let filtered = [...this.allRSVPs];

        // Filter by attending status
        if (this.filterAttending?.value) {
            filtered = filtered.filter(r => r.attending === this.filterAttending.value);
        }

        // Filter by approval status
        if (this.filterStatus?.value) {
            filtered = filtered.filter(r => r.status === this.filterStatus.value);
        }

        // Search by name or email
        if (this.searchInput?.value) {
            const searchTerm = this.searchInput.value.toLowerCase();
            filtered = filtered.filter(r => 
                r.name.toLowerCase().includes(searchTerm) ||
                r.email.toLowerCase().includes(searchTerm)
            );
        }

        // Sort
        filtered.sort((a, b) => {
            let aVal = a[this.sortColumn];
            let bVal = b[this.sortColumn];

            if (typeof aVal === 'string') {
                aVal = aVal.toLowerCase();
                bVal = bVal.toLowerCase();
            }

            if (this.sortDirection === 'asc') {
                return aVal > bVal ? 1 : -1;
            } else {
                return aVal < bVal ? 1 : -1;
            }
        });

        this.filteredRSVPs = filtered;
        this.currentPage = 1;
        this.updateStats();
        this.displayRSVPs();
    }

    displayRSVPs() {
        if (!this.rsvpTable) return;

        const start = (this.currentPage - 1) * this.itemsPerPage;
        const end = start + this.itemsPerPage;
        const pageRSVPs = this.filteredRSVPs.slice(start, end);

        let html = '<table class="rsvp-table">';
        html += '<thead><tr>';
        html += '<th onclick="adminController.sortBy(\'name\')">Name</th>';
        html += '<th onclick="adminController.sortBy(\'email\')">Email</th>';
        html += '<th onclick="adminController.sortBy(\'attending\')">Attending</th>';
        html += '<th>Guests</th>';
        html += '<th onclick="adminController.sortBy(\'status\')">Status</th>';
        html += '<th>Actions</th>';
        html += '</tr></thead><tbody>';

        pageRSVPs.forEach(rsvp => {
            const statusClass = `status-${rsvp.status.toLowerCase()}`;
            html += `<tr>
                <td>${this.escapeHtml(rsvp.name)}</td>
                <td>${this.escapeHtml(rsvp.email)}</td>
                <td>${rsvp.attending}</td>
                <td>${rsvp.guests}</td>
                <td><span class="status-badge ${statusClass}">${rsvp.status}</span></td>
                <td class="actions">
                    ${rsvp.status !== 'Approved' ? `<button onclick="adminController.approveRSVP('${rsvp.id}')">Approve</button>` : ''}
                    ${rsvp.status !== 'Declined' ? `<button onclick="adminController.declineRSVP('${rsvp.id}')">Decline</button>` : ''}
                    <button onclick="adminController.viewDetails('${rsvp.id}')">Details</button>
                </td>
            </tr>`;
        });

        html += '</tbody></table>';
        this.rsvpTable.innerHTML = html;

        this.updatePagination();
    }

    async approveRSVP(rsvpId) {
        if (!confirm('Send confirmation email to this guest?')) return;

        try {
            const response = await fetch('/.netlify/functions/send-confirmation', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Admin-Secret': this.adminSecret
                },
                body: JSON.stringify({
                    rsvpId: rsvpId,
                    status: 'Approved'
                })
            });

            if (!response.ok) throw new Error(`HTTP ${response.status}`);

            alert('Confirmation email sent!');
            this.loadRSVPs();
        } catch (error) {
            console.error('Error approving RSVP:', error);
            alert('Failed to approve RSVP');
        }
    }

    async declineRSVP(rsvpId) {
        if (!confirm('Send decline email to this guest?')) return;

        try {
            const response = await fetch('/.netlify/functions/send-confirmation', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Admin-Secret': this.adminSecret
                },
                body: JSON.stringify({
                    rsvpId: rsvpId,
                    status: 'Declined'
                })
            });

            if (!response.ok) throw new Error(`HTTP ${response.status}`);

            alert('Decline email sent!');
            this.loadRSVPs();
        } catch (error) {
            console.error('Error declining RSVP:', error);
            alert('Failed to decline RSVP');
        }
    }

    viewDetails(rsvpId) {
        const rsvp = this.allRSVPs.find(r => r.id === rsvpId);
        if (!rsvp) return;

        let details = `Guest Details\n\n`;
        details += `Name: ${rsvp.name}\n`;
        details += `Email: ${rsvp.email}\n`;
        details += `Phone: ${rsvp.phone || 'N/A'}\n`;
        details += `Attending: ${rsvp.attending}\n`;
        details += `Guests: ${rsvp.guests}\n`;
        details += `Dietary Restrictions: ${rsvp.dietary || 'None'}\n`;
        details += `Message: ${rsvp.message || 'None'}\n`;
        details += `Status: ${rsvp.status}\n`;
        details += `Submitted: ${rsvp.submittedAt}`;

        alert(details);
    }

    updateStats() {
        const total = this.filteredRSVPs.length;
        const attending = this.filteredRSVPs.filter(r => r.attending === 'yes').length;
        const pending = this.filteredRSVPs.filter(r => r.status === 'Pending Review').length;

        if (this.statsTotal) this.statsTotal.textContent = total;
        if (this.statsAttending) this.statsAttending.textContent = attending;
        if (this.statsPending) this.statsPending.textContent = pending;
    }

    updatePagination() {
        const totalPages = Math.ceil(this.filteredRSVPs.length / this.itemsPerPage);
        
        if (!this.paginationControls) return;

        let html = `Page ${this.currentPage} of ${totalPages} | `;

        if (this.currentPage > 1) {
            html += `<button onclick="adminController.previousPage()">← Previous</button> `;
        }

        if (this.currentPage < totalPages) {
            html += `<button onclick="adminController.nextPage()">Next →</button>`;
        }

        this.paginationControls.innerHTML = html;
    }

    nextPage() {
        const totalPages = Math.ceil(this.filteredRSVPs.length / this.itemsPerPage);
        if (this.currentPage < totalPages) {
            this.currentPage++;
            this.displayRSVPs();
        }
    }

    previousPage() {
        if (this.currentPage > 1) {
            this.currentPage--;
            this.displayRSVPs();
        }
    }

    sortBy(column) {
        if (this.sortColumn === column) {
            this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            this.sortColumn = column;
            this.sortDirection = 'asc';
        }
        this.applyFilters();
    }

    // ===========================
    // UTILITIES
    // ===========================

    escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, m => map[m]);
    }
}

// Global instance for HTML onclick handlers
let adminController;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    adminController = new AdminController();
    adminController.init();
});
