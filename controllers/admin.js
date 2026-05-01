// ===========================
// ADMIN DASHBOARD CONTROLLER
// ===========================

export class AdminController {
    constructor() {
        this.adminSecret = localStorage.getItem('adminSecret') || '';
        this.allRSVPs = [];
        this.filteredRSVPs = [];
        this.currentPage = 1;
        this.itemsPerPage = 25; // Default to 25 rows
        this.sortColumn = 'submittedAt';
        this.sortDirection = 'desc';
        this.autoRefreshInterval = null; // Store interval ID for auto-refresh
        
        // DOM elements
        this.loginSection = document.getElementById('login-section');
        this.dashboardSection = document.getElementById('dashboard-section');
        this.secretInput = document.getElementById('admin-secret');
        this.loginBtn = document.getElementById('login-btn');
        this.logoutBtn = document.getElementById('logout-btn');
        this.filterAttending = document.getElementById('filter-attending');
        this.filterStatus = document.getElementById('filter-status');
        this.searchInput = document.getElementById('search-input');
        this.rowsPerPage = document.getElementById('rows-per-page');
        this.rsvpTable = document.getElementById('rsvp-table');
        this.statsAttending = document.getElementById('stats-attending');
        this.statsPending = document.getElementById('stats-pending');
        this.statsTotal = document.getElementById('stats-total');
        this.statsApprovedGuests = document.getElementById('stats-approved-guests');
        this.paginationControls = document.getElementById('pagination-controls');
    }

    // Initialize admin dashboard
    init() {
        if (!this.loginSection) return; // Not on admin page
        window.adminController = this;

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

        if (this.rowsPerPage) {
            this.rowsPerPage.addEventListener('change', () => this.handleRowsPerPageChange());
            // Set default value
            this.rowsPerPage.value = this.itemsPerPage.toString();
        }

        if (this.rsvpTable) {
            this.rsvpTable.addEventListener('click', (event) => this.handleTableClick(event));
        }

        if (this.paginationControls) {
            this.paginationControls.addEventListener('click', (event) => this.handlePaginationClick(event));
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
        // Clear auto-refresh interval
        this.stopAutoRefresh();
        
        localStorage.removeItem('adminSecret');
        this.adminSecret = '';
        this.allRSVPs = [];
        this.secretInput.value = '';
        this.showLogin();
    }

    showLogin() {
        if (this.loginSection) this.loginSection.style.display = 'block';
        if (this.dashboardSection) this.dashboardSection.style.display = 'none';
        // Stop auto-refresh when showing login
        this.stopAutoRefresh();
    }

    showDashboard() {
        if (this.loginSection) this.loginSection.style.display = 'none';
        if (this.dashboardSection) this.dashboardSection.style.display = 'block';
        // Start auto-refresh when dashboard is shown
        this.startAutoRefresh();
    }

    // Start auto-refresh: reload RSVPs every 5 minutes
    startAutoRefresh() {
        // Clear any existing interval first
        this.stopAutoRefresh();
        
        // Set interval to refresh every 5 minutes (300000 milliseconds)
        this.autoRefreshInterval = setInterval(() => {
            console.log('🔄 Auto-refreshing RSVPs...');
            this.loadRSVPs();
        }, 5 * 60 * 1000); // 5 minutes
    }

    // Stop auto-refresh
    stopAutoRefresh() {
        if (this.autoRefreshInterval) {
            clearInterval(this.autoRefreshInterval);
            this.autoRefreshInterval = null;
            console.log('⏸️ Auto-refresh stopped');
        }
    }

    // ===========================
    // RSVP MANAGEMENT
    // ===========================

    async loadRSVPs() {
        console.log('📥 Loading RSVPs from server...');
        
        // Show loading state
        if (this.rsvpTable) {
            this.rsvpTable.innerHTML = '<div style="padding: 40px; text-align: center; color: #999;">Loading RSVPs...</div>';
        }
        
        try {
            // Encode adminSecret to base64 to handle non-ASCII characters in headers
            const encodedSecret = btoa(unescape(encodeURIComponent(this.adminSecret)));
            
            const response = await fetch('/.netlify/functions/get-rsvps', {
                method: 'GET',
                headers: {
                    'X-Admin-Secret': encodedSecret,
                    'Content-Type': 'application/json'
                }
            });

            console.log('Response status:', response.status);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error('Error response:', errorData);
                
                if (response.status === 401) {
                    alert('Invalid admin secret. Please login again.');
                    this.handleLogout();
                    return;
                }
                throw new Error(errorData.error || `HTTP ${response.status}: Failed to load RSVPs`);
            }

            const data = await response.json();
            console.log('✅ Loaded RSVPs:', data);
            
            this.allRSVPs = data.results || [];
            console.log(`Total RSVPs: ${this.allRSVPs.length}`);

            if (typeof data.listedBlobCount === 'number' && data.listedBlobCount !== this.allRSVPs.length) {
                const msg =
                    `Loaded ${this.allRSVPs.length} RSVPs but blob store listed ${data.listedBlobCount} keys. ` +
                    'Some blobs may be empty, invalid JSON, or failed to load.';
                console.warn('⚠️ RSVP count mismatch:', msg, data.failedBlobLoads || '');
                if (Array.isArray(data.failedBlobLoads) && data.failedBlobLoads.length > 0) {
                    alert(`${msg}\n\n${data.failedBlobLoads.length} blob read(s) failed. Details are in the browser console.`);
                }
            }

            this.applyFilters();
        } catch (error) {
            console.error('❌ Error loading RSVPs:', error);
            
            // Show error in table
            if (this.rsvpTable) {
                this.rsvpTable.innerHTML = `
                    <div style="padding: 40px; text-align: center; color: #dc3545;">
                        <p><strong>Error loading RSVPs</strong></p>
                        <p>${error.message}</p>
                        <button data-action="retry-load" style="margin-top: 20px; padding: 10px 20px; cursor: pointer;">Retry</button>
                    </div>
                `;
            }
            
            alert(`Failed to load RSVPs: ${error.message}`);
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

    async handleTableClick(event) {
        const actionButton = event.target.closest('button[data-action]');
        if (actionButton) {
            const { action, rsvpId } = actionButton.dataset;
            if (action === 'retry-load') {
                await this.loadRSVPs();
                return;
            }

            if (!rsvpId) return;
            if (action === 'approve') await this.approveRSVP(rsvpId);
            if (action === 'decline') await this.declineRSVP(rsvpId);
            if (action === 'details') this.viewDetails(rsvpId);
            if (action === 'delete') await this.deleteRSVP(rsvpId);
            return;
        }

        const sortHeader = event.target.closest('th[data-sort]');
        if (sortHeader) {
            this.sortBy(sortHeader.dataset.sort);
        }
    }

    handlePaginationClick(event) {
        const pageButton = event.target.closest('button[data-page-action]');
        if (!pageButton) return;

        if (pageButton.dataset.pageAction === 'prev') this.previousPage();
        if (pageButton.dataset.pageAction === 'next') this.nextPage();
    }

    handleRowsPerPageChange() {
        const newRowsPerPage = parseInt(this.rowsPerPage.value) || 25;
        this.itemsPerPage = newRowsPerPage;
        this.currentPage = 1; // Reset to first page when changing rows per page
        this.displayRSVPs();
    }

    displayRSVPs() {
        if (!this.rsvpTable) return;

        const start = (this.currentPage - 1) * this.itemsPerPage;
        const end = start + this.itemsPerPage;
        const pageRSVPs = this.filteredRSVPs.slice(start, end);

        // Show empty state if no RSVPs
        if (pageRSVPs.length === 0) {
            this.rsvpTable.innerHTML = `
                <div style="padding: 40px; text-align: center; color: #999;">
                    <p style="font-size: 1.2em; margin-bottom: 10px;">No RSVPs found</p>
                    <p>Waiting for guests to submit their RSVPs...</p>
                </div>
            `;
            this.updatePagination();
            return;
        }

        let html = '<table class="rsvp-table">';
        html += '<thead><tr>';
        html += '<th data-sort="name" style="cursor: pointer;">Name ⇅</th>';
        html += '<th data-sort="email" style="cursor: pointer;">Email ⇅</th>';
        html += '<th data-sort="attending" style="cursor: pointer;">Attending ⇅</th>';
        html += '<th>Guests</th>';
        html += '<th data-sort="status" style="cursor: pointer;">Status ⇅</th>';
        html += '<th>Actions</th>';
        html += '</tr></thead><tbody>';

        pageRSVPs.forEach(rsvp => {
            const statusClass = `status-${rsvp.status.toLowerCase()}`;
            const statusDisplay = rsvp.status.charAt(0).toUpperCase() + rsvp.status.slice(1);
            const attendingDisplay = rsvp.attending === 'yes' ? '✓ Yes' : '✗ No';
            
            html += `<tr>
                <td>${this.escapeHtml(rsvp.name)}</td>
                <td>${this.escapeHtml(rsvp.email)}</td>
                <td>${attendingDisplay}</td>
                <td>${rsvp.guests || 1}</td>
                <td><span class="status-badge ${statusClass}">${statusDisplay}</span></td>
                <td class="actions">
                    ${rsvp.status !== 'approved' ? `<button data-action="approve" data-rsvp-id="${rsvp.id}">Approve</button>` : ''}
                    ${rsvp.status !== 'declined' ? `<button data-action="decline" data-rsvp-id="${rsvp.id}">Decline</button>` : ''}
                    <button data-action="details" data-rsvp-id="${rsvp.id}">Details</button>
                    <button data-action="delete" data-rsvp-id="${rsvp.id}" style="background:#dc3545;color:#fff;">Delete</button>
                </td>
            </tr>`;
        });

        html += '</tbody></table>';
        this.rsvpTable.innerHTML = html;

        this.updatePagination();
    }

    async approveRSVP(rsvpId) {
        const rsvp = this.allRSVPs.find(r => r.id === rsvpId);
        if (!rsvp) {
            alert('RSVP not found');
            return;
        }
        
        // Prompt for optional admin message
        const adminMessage = prompt(
            `Send confirmation email to ${rsvp.name} (${rsvp.email})?\n\n` +
            `(Optional) Add a personal message to include in the email:\n` +
            `(Leave empty and click OK to send without a message)`,
            ''
        );
        
        if (adminMessage === null) {
            // User cancelled the prompt
            return;
        }

        console.log(`📧 Approving RSVP: ${rsvpId}`, adminMessage ? '(with message)' : '(no message)');

        try {
            // Encode adminSecret to base64 to handle non-ASCII characters in headers
            const encodedSecret = btoa(unescape(encodeURIComponent(this.adminSecret)));
            
            const requestBody = {
                rsvpId: rsvpId,
                status: 'Approved'
            };
            
            // Only include adminMessage if provided
            if (adminMessage && adminMessage.trim()) {
                requestBody.adminMessage = adminMessage.trim();
            }
            
            const response = await fetch('/.netlify/functions/send-confirmation', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Admin-Secret': encodedSecret
                },
                body: JSON.stringify(requestBody)
            });

            const responseData = await response.json().catch(() => ({}));
            console.log('Response:', responseData);

            if (!response.ok) {
                throw new Error(responseData.error || `HTTP ${response.status}`);
            }

            alert('✅ Confirmation email sent successfully!');
            await this.loadRSVPs();
        } catch (error) {
            console.error('❌ Error approving RSVP:', error);
            alert(`Failed to approve RSVP: ${error.message}`);
        }
    }

    async declineRSVP(rsvpId) {
        const rsvp = this.allRSVPs.find(r => r.id === rsvpId);
        if (!rsvp) {
            alert('RSVP not found');
            return;
        }
        
        // Determine if we need to ask for a reason
        const userWantedToAttend = rsvp.attending === 'yes';
        let declineReason = '';
        
        if (userWantedToAttend) {
            // User wanted to attend but admin is declining - ask for reason
            const reason = prompt(
                `This guest wanted to attend. Please provide a reason for declining their RSVP:\n\n` +
                `(This reason will be included in the email sent to ${rsvp.name})`,
                ''
            );
            
            if (reason === null) {
                // User cancelled the prompt
                return;
            }
            
            declineReason = reason.trim();
            
            if (!confirm(`Send decline email to ${rsvp.name} (${rsvp.email}) with the provided reason?`)) {
                return;
            }
        } else {
            // User didn't want to attend - just confirm their choice
            if (!confirm(`Send confirmation email to ${rsvp.name} (${rsvp.email}) confirming they won't be attending?`)) {
                return;
            }
        }

        console.log(`📧 Declining RSVP: ${rsvpId}`, userWantedToAttend ? '(user wanted to attend)' : '(user declined)');

        try {
            // Encode adminSecret to base64 to handle non-ASCII characters in headers
            const encodedSecret = btoa(unescape(encodeURIComponent(this.adminSecret)));
            
            const requestBody = {
                rsvpId: rsvpId,
                status: 'Declined'
            };
            
            // Only include declineReason if user wanted to attend
            if (userWantedToAttend && declineReason) {
                requestBody.declineReason = declineReason;
            }
            
            const response = await fetch('/.netlify/functions/send-confirmation', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Admin-Secret': encodedSecret
                },
                body: JSON.stringify(requestBody)
            });

            const responseData = await response.json().catch(() => ({}));
            console.log('Response:', responseData);

            if (!response.ok) {
                throw new Error(responseData.error || `HTTP ${response.status}`);
            }

            alert('✅ Decline email sent successfully!');
            await this.loadRSVPs();
        } catch (error) {
            console.error('❌ Error declining RSVP:', error);
            alert(`Failed to decline RSVP: ${error.message}`);
        }
    }

    async deleteRSVP(rsvpId) {
        const rsvp = this.allRSVPs.find(r => r.id === rsvpId);
        if (!rsvp) {
            alert('RSVP not found');
            return;
        }

        const shouldDelete = confirm(
            `Delete RSVP for ${rsvp.name} (${rsvp.email})?\n\n` +
            'This will permanently remove the RSVP from storage.'
        );
        if (!shouldDelete) return;

        try {
            const encodedSecret = btoa(unescape(encodeURIComponent(this.adminSecret)));
            const response = await fetch('/.netlify/functions/delete-rsvp', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Admin-Secret': encodedSecret
                },
                body: JSON.stringify({ rsvpId })
            });

            const responseData = await response.json().catch(() => ({}));
            if (!response.ok) {
                throw new Error(responseData.error || `HTTP ${response.status}`);
            }

            alert('🗑️ RSVP deleted successfully');
            await this.loadRSVPs();
        } catch (error) {
            console.error('❌ Error deleting RSVP:', error);
            alert(`Failed to delete RSVP: ${error.message}`);
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
        const pending = this.filteredRSVPs.filter(r => r.status === 'pending').length;
        
        // Calculate total approved attending guests (sum of guests count for approved RSVPs where attending === 'yes')
        const approvedAttendingGuests = this.filteredRSVPs
            .filter(r => r.status === 'approved' && r.attending === 'yes')
            .reduce((sum, r) => sum + (parseInt(r.guests) || 1), 0);

        if (this.statsTotal) this.statsTotal.textContent = total;
        if (this.statsAttending) this.statsAttending.textContent = attending;
        if (this.statsPending) this.statsPending.textContent = pending;
        if (this.statsApprovedGuests) this.statsApprovedGuests.textContent = approvedAttendingGuests;
    }

    updatePagination() {
        const totalPages = Math.ceil(this.filteredRSVPs.length / this.itemsPerPage);
        
        if (!this.paginationControls) return;

        let html = `Page ${this.currentPage} of ${totalPages || 1} | `;

        if (this.currentPage > 1) {
            html += '<button data-page-action="prev">← Previous</button> ';
        }

        if (this.currentPage < totalPages) {
            html += '<button data-page-action="next">Next →</button>';
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

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    const adminController = new AdminController();
    adminController.init();
});

// Cleanup auto-refresh when page is unloaded
window.addEventListener('beforeunload', function() {
    if (window.adminController) {
        window.adminController.stopAutoRefresh();
    }
});
