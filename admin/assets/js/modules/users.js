/* ==========================================================================
   AstraSpin Admin - Users Manager Module
   File: admin/assets/js/modules/users.js
   Production-ready user management with CRUD, search, and localStorage.
   ========================================================================== */

window.AdminModules = window.AdminModules || {};

window.AdminModules.users = (() => {
    'use strict';

    const STORAGE_KEY = 'astraspin_admin_users';
    const CONTENT_ID = 'admin-content';
    const ROLES = ['user', 'admin'];
    const STATUSES = ['active', 'banned'];

    let _users = [];
    let _editingId = null;
    let _searchQuery = '';
    let _viewingId = null;

    /* ======================================================================
       DATA LAYER
       ====================================================================== */

    /**
     * Load users from localStorage.
     * @returns {Array} Array of user objects
     */
    function _loadUsers() {
        try {
            const data = localStorage.getItem(STORAGE_KEY);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('[UsersModule] Failed to load users from storage:', error);
            return [];
        }
    }

    /**
     * Save users to localStorage.
     */
    function _saveUsers() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(_users));
        } catch (error) {
            console.error('[UsersModule] Failed to save users to storage:', error);
        }
    }

    /**
     * Generate a unique user ID.
     * @returns {string}
     */
    function _generateId() {
        return 'usr_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8);
    }

    /**
     * Find a user by its ID.
     * @param {string} id
     * @returns {Object|null}
     */
    function _findUserById(id) {
        return _users.find(user => user.id === id) || null;
    }

    /**
     * Check if a username already exists.
     * @param {string} username
     * @param {string|null} excludeId
     * @returns {boolean}
     */
    function _isDuplicateUsername(username, excludeId = null) {
        const lowerUsername = username.toLowerCase().trim();
        return _users.some(u => u.id !== excludeId && u.username.toLowerCase().trim() === lowerUsername);
    }

    /**
     * Check if an email already exists.
     * @param {string} email
     * @param {string|null} excludeId
     * @returns {boolean}
     */
    function _isDuplicateEmail(email, excludeId = null) {
        const lowerEmail = email.toLowerCase().trim();
        return _users.some(u => u.id !== excludeId && u.email.toLowerCase().trim() === lowerEmail);
    }

    /* ======================================================================
       RENDERING
       ====================================================================== */

    /**
     * Initialize and render the Users Manager page.
     */
    function init() {
        _users = _loadUsers();
        _searchQuery = '';
        _editingId = null;
        _viewingId = null;

        const container = document.getElementById(CONTENT_ID);
        if (!container) return;

        container.innerHTML = _buildPageHTML();
        _bindEvents();
        _renderTable();
    }

    /**
     * Build the full page HTML structure.
     * @returns {string}
     */
    function _buildPageHTML() {
        return `
            <div class="page-users">
                <div class="page-header" style="display:flex;align-items:center;justify-content:space-between;margin-bottom:24px;flex-wrap:wrap;gap:12px;">
                    <div>
                        <h1 style="font-size:1.5rem;font-weight:700;margin:0;">Users & Roles</h1>
                        <p style="font-size:0.8125rem;color:#94A3B8;margin:4px 0 0;">Manage registered users and permissions</p>
                    </div>
                    <button class="btn btn-primary" id="usr-btn-add">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:16px;height:16px;"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                        Add User
                    </button>
                </div>

                <div class="card">
                    <div class="card-header" style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;">
                        <div style="display:flex;align-items:center;gap:8px;">
                            <span style="font-weight:600;">All Users</span>
                            <span class="badge badge-green" id="usr-count">0</span>
                        </div>
                        <div style="position:relative;display:flex;align-items:center;">
                            <svg viewBox="0 0 24 24" fill="none" stroke="#94A3B8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:16px;height:16px;position:absolute;left:10px;pointer-events:none;"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                            <input type="text" class="input" id="usr-search" placeholder="Search users..." style="padding-left:32px;width:220px;max-width:100%;">
                        </div>
                    </div>
                    <div class="card-body" style="padding:0;" id="usr-table-container">
                        <!-- Table or empty state renders here -->
                    </div>
                </div>

                <!-- User Form Modal -->
                <div id="usr-modal-overlay" style="position:fixed;inset:0;background:rgba(0,0,0,0.4);backdrop-filter:blur(4px);z-index:5000;opacity:0;visibility:hidden;transition:opacity 0.3s ease,visibility 0.3s ease;"></div>
                <div id="usr-modal" style="position:fixed;bottom:0;left:0;right:0;z-index:5001;background:#fff;border-radius:32px 32px 0 0;max-height:90vh;overflow-y:auto;transform:translateY(100%);transition:transform 0.35s cubic-bezier(0.32,0.72,0,1);">
                    <div style="display:flex;justify-content:center;padding:12px;"><div style="width:36px;height:4px;background:#E2E8F0;border-radius:4px;"></div></div>
                    <div style="display:flex;align-items:center;justify-content:space-between;padding:0 20px 16px;border-bottom:1px solid #E2E8F0;">
                        <h2 style="font-size:1.25rem;font-weight:700;" id="usr-form-title">Add User</h2>
                        <button id="usr-btn-close-modal" style="width:36px;height:36px;border-radius:50%;background:#F1F5F9;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;" aria-label="Close">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:18px;height:18px;color:#64748B;"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                        </button>
                    </div>
                    <div style="padding:20px;">
                        <form id="usr-form" novalidate>
                            <input type="hidden" id="usr-form-id">

                            <div style="margin-bottom:16px;">
                                <label style="display:block;font-size:0.8125rem;font-weight:600;margin-bottom:6px;" for="usr-form-username">Username <span style="color:#EF4444;">*</span></label>
                                <input type="text" class="input" id="usr-form-username" placeholder="Enter username" style="width:100%;" required>
                                <span style="display:block;font-size:0.75rem;color:#EF4444;margin-top:4px;min-height:18px;" id="usr-error-username"></span>
                            </div>

                            <div style="margin-bottom:16px;">
                                <label style="display:block;font-size:0.8125rem;font-weight:600;margin-bottom:6px;" for="usr-form-fullname">Full Name <span style="color:#EF4444;">*</span></label>
                                <input type="text" class="input" id="usr-form-fullname" placeholder="Enter full name" style="width:100%;" required>
                                <span style="display:block;font-size:0.75rem;color:#EF4444;margin-top:4px;min-height:18px;" id="usr-error-fullname"></span>
                            </div>

                            <div style="margin-bottom:16px;">
                                <label style="display:block;font-size:0.8125rem;font-weight:600;margin-bottom:6px;" for="usr-form-email">Email <span style="color:#EF4444;">*</span></label>
                                <input type="email" class="input" id="usr-form-email" placeholder="user@example.com" style="width:100%;" required>
                                <span style="display:block;font-size:0.75rem;color:#EF4444;margin-top:4px;min-height:18px;" id="usr-error-email"></span>
                            </div>

                            <div style="margin-bottom:16px;">
                                <label style="display:block;font-size:0.8125rem;font-weight:600;margin-bottom:6px;" for="usr-form-avatar">Avatar URL</label>
                                <input type="url" class="input" id="usr-form-avatar" placeholder="https://example.com/avatar.jpg" style="width:100%;">
                            </div>

                            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px;">
                                <div>
                                    <label style="display:block;font-size:0.8125rem;font-weight:600;margin-bottom:6px;" for="usr-form-coins">Coins</label>
                                    <input type="number" class="input" id="usr-form-coins" placeholder="0" min="0" value="0" style="width:100%;">
                                </div>
                                <div>
                                    <label style="display:block;font-size:0.8125rem;font-weight:600;margin-bottom:6px;" for="usr-form-games">Games Played</label>
                                    <input type="number" class="input" id="usr-form-games" placeholder="0" min="0" value="0" style="width:100%;">
                                </div>
                            </div>

                            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:24px;">
                                <div>
                                    <label style="display:block;font-size:0.8125rem;font-weight:600;margin-bottom:6px;" for="usr-form-role">Role</label>
                                    <select class="input" id="usr-form-role" style="width:100%;">
                                        ${ROLES.map(r => '<option value="' + r + '">' + r.charAt(0).toUpperCase() + r.slice(1) + '</option>').join('')}
                                    </select>
                                </div>
                                <div>
                                    <label style="display:block;font-size:0.8125rem;font-weight:600;margin-bottom:6px;" for="usr-form-status">Status</label>
                                    <select class="input" id="usr-form-status" style="width:100%;">
                                        ${STATUSES.map(s => '<option value="' + s + '">' + s.charAt(0).toUpperCase() + s.slice(1) + '</option>').join('')}
                                    </select>
                                </div>
                            </div>

                            <div style="display:flex;gap:8px;justify-content:flex-end;">
                                <button type="button" class="btn btn-secondary" id="usr-btn-cancel">Cancel</button>
                                <button type="submit" class="btn btn-primary">Save User</button>
                            </div>
                        </form>
                    </div>
                </div>

                <!-- View User Details Modal -->
                <div id="usr-view-overlay" style="position:fixed;inset:0;background:rgba(0,0,0,0.4);backdrop-filter:blur(4px);z-index:4500;opacity:0;visibility:hidden;transition:opacity 0.3s ease,visibility 0.3s ease;"></div>
                <div id="usr-view-modal" style="position:fixed;bottom:0;left:0;right:0;z-index:4501;background:#fff;border-radius:32px 32px 0 0;max-height:85vh;overflow-y:auto;transform:translateY(100%);transition:transform 0.35s cubic-bezier(0.32,0.72,0,1);">
                    <div style="display:flex;justify-content:center;padding:12px;"><div style="width:36px;height:4px;background:#E2E8F0;border-radius:4px;"></div></div>
                    <div style="display:flex;align-items:center;justify-content:space-between;padding:0 20px 16px;border-bottom:1px solid #E2E8F0;">
                        <h2 style="font-size:1.25rem;font-weight:700;">User Details</h2>
                        <button id="usr-btn-close-view" style="width:36px;height:36px;border-radius:50%;background:#F1F5F9;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;" aria-label="Close">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:18px;height:18px;color:#64748B;"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                        </button>
                    </div>
                    <div style="padding:20px;" id="usr-view-content">
                        <!-- User details render here dynamically -->
                    </div>
                </div>

                <!-- Delete Confirmation Modal -->
                <div id="usr-delete-overlay" style="position:fixed;inset:0;background:rgba(0,0,0,0.4);backdrop-filter:blur(4px);z-index:6000;opacity:0;visibility:hidden;transition:opacity 0.3s ease,visibility 0.3s ease;"></div>
                <div id="usr-delete-modal" style="position:fixed;bottom:0;left:0;right:0;z-index:6001;background:#fff;border-radius:32px 32px 0 0;transform:translateY(100%);transition:transform 0.35s cubic-bezier(0.32,0.72,0,1);">
                    <div style="display:flex;justify-content:center;padding:12px;"><div style="width:36px;height:4px;background:#E2E8F0;border-radius:4px;"></div></div>
                    <div style="padding:20px 20px 24px;">
                        <h3 style="font-size:1.125rem;font-weight:700;margin-bottom:8px;">Delete User</h3>
                        <p style="font-size:0.875rem;color:#64748B;margin-bottom:20px;" id="usr-delete-message">Are you sure you want to delete this user?</p>
                        <input type="hidden" id="usr-delete-id">
                        <div style="display:flex;gap:8px;justify-content:flex-end;">
                            <button class="btn btn-secondary" id="usr-btn-cancel-delete">Cancel</button>
                            <button class="btn btn-danger" id="usr-btn-confirm-delete">Delete</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Render the users table or empty state.
     */
    function _renderTable() {
        const container = document.getElementById('usr-table-container');
        const countBadge = document.getElementById('usr-count');
        if (!container) return;

        const filtered = _getFilteredUsers();
        if (countBadge) countBadge.textContent = filtered.length;

        container.innerHTML = filtered.length === 0 ? _buildEmptyState() : _buildTable(filtered);
    }

    /**
     * Get users filtered by search query.
     * @returns {Array}
     */
    function _getFilteredUsers() {
        if (!_searchQuery) return _users;
        const q = _searchQuery.toLowerCase().trim();
        return _users.filter(u =>
            u.username.toLowerCase().includes(q) ||
            u.fullName.toLowerCase().includes(q) ||
            u.email.toLowerCase().includes(q) ||
            u.role.toLowerCase().includes(q)
        );
    }

    /**
     * Build the users table HTML.
     * @param {Array} users
     * @returns {string}
     */
    function _buildTable(users) {
        const rows = users.map(user => {
            const statusBadge = user.status === 'active'
                ? '<span class="badge badge-green">Active</span>'
                : '<span class="badge badge-red">Banned</span>';
            const roleBadge = user.role === 'admin'
                ? '<span class="badge badge-purple">Admin</span>'
                : '<span class="badge badge-blue">User</span>';

            const avatarContent = user.avatarURL
                ? '<img src="' + _esc(user.avatarURL) + '" alt="" style="width:36px;height:36px;object-fit:cover;border-radius:50%;" onerror="this.outerHTML=\'<div style=&quot;width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,#2DB87B,#34D399);display:flex;align-items:center;justify-content:center;font-size:0.75rem;font-weight:700;color:white;text-transform:uppercase;&quot;>' + _esc(user.fullName.charAt(0)) + '</div>\'">'
                : '<div style="width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,#2DB87B,#34D399);display:flex;align-items:center;justify-content:center;font-size:0.75rem;font-weight:700;color:white;text-transform:uppercase;">' + _esc(user.fullName.charAt(0)) + '</div>';

            return '<tr data-uid="' + _esc(user.id) + '">' +
                '<td style="padding:12px 16px;border-bottom:1px solid #E2E8F0;">' + avatarContent + '</td>' +
                '<td style="padding:12px 16px;border-bottom:1px solid #E2E8F0;">' +
                    '<div style="font-weight:600;font-size:0.875rem;">' + _esc(user.fullName) + '</div>' +
                    '<div style="font-size:0.75rem;color:#94A3B8;margin-top:1px;">@' + _esc(user.username) + '</div>' +
                '</td>' +
                '<td style="padding:12px 16px;border-bottom:1px solid #E2E8F0;">' +
                    '<div style="font-size:0.8125rem;color:#64748B;">' + _esc(user.email) + '</div>' +
                '</td>' +
                '<td style="padding:12px 16px;border-bottom:1px solid #E2E8F0;text-align:center;">' +
                    '<div style="font-size:0.875rem;font-weight:600;">' + (user.coins || 0) + '</div>' +
                '</td>' +
                '<td style="padding:12px 16px;border-bottom:1px solid #E2E8F0;">' + roleBadge + '</td>' +
                '<td style="padding:12px 16px;border-bottom:1px solid #E2E8F0;">' + statusBadge + '</td>' +
                '<td style="padding:12px 16px;border-bottom:1px solid #E2E8F0;">' +
                    '<div style="display:flex;gap:6px;">' +
                        '<button class="btn btn-sm btn-secondary usr-btn-view" data-id="' + _esc(user.id) + '" title="View">' +
                            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:13px;height:13px;"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg> View' +
                        '</button>' +
                        '<button class="btn btn-sm btn-secondary usr-btn-edit" data-id="' + _esc(user.id) + '" title="Edit">' +
                            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:13px;height:13px;"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg> Edit' +
                        '</button>' +
                        '<button class="btn btn-sm btn-danger usr-btn-delete" data-id="' + _esc(user.id) + '" title="Delete">' +
                            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:13px;height:13px;"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>' +
                        '</button>' +
                    '</div>' +
                '</td>' +
            '</tr>';
        }).join('');

        return '<div style="overflow-x:auto;"><table class="table" style="width:100%;border-collapse:collapse;">' +
            '<thead><tr>' +
                '<th style="width:48px;"></th>' +
                '<th>User</th>' +
                '<th>Email</th>' +
                '<th style="width:70px;text-align:center;">Coins</th>' +
                '<th>Role</th>' +
                '<th>Status</th>' +
                '<th style="width:210px;">Actions</th>' +
            '</tr></thead>' +
            '<tbody>' + rows + '</tbody>' +
        '</table></div>';
    }

    /**
     * Build the empty state HTML.
     * @returns {string}
     */
    function _buildEmptyState() {
        const searching = _searchQuery && _searchQuery.trim().length > 0;
        return '<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;padding:60px 20px;text-align:center;">' +
            '<div style="width:64px;height:64px;border-radius:16px;background:#F1F5F9;display:flex;align-items:center;justify-content:center;margin-bottom:16px;">' +
                '<svg viewBox="0 0 24 24" fill="none" stroke="#CBD5E1" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="width:28px;height:28px;"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>' +
            '</div>' +
            '<h3 style="font-size:1rem;font-weight:600;margin-bottom:4px;">' + (searching ? 'No users found' : 'No users yet') + '</h3>' +
            '<p style="font-size:0.8125rem;color:#94A3B8;margin-bottom:16px;">' + (searching ? 'Try a different search term' : 'Users will appear here once they register') + '</p>' +
            (!searching ? '<button class="btn btn-primary usr-btn-add-first">Add User</button>' : '') +
        '</div>';
    }

    /**
     * Build the user details view content.
     * @param {Object} user
     * @returns {string}
     */
    function _buildViewContent(user) {
        const avatarContent = user.avatarURL
            ? '<img src="' + _esc(user.avatarURL) + '" alt="" style="width:64px;height:64px;object-fit:cover;border-radius:50%;" onerror="this.outerHTML=\'<div style=&quot;width:64px;height:64px;border-radius:50%;background:linear-gradient(135deg,#2DB87B,#34D399);display:flex;align-items:center;justify-content:center;font-size:1.25rem;font-weight:700;color:white;text-transform:uppercase;&quot;>' + _esc(user.fullName.charAt(0)) + '</div>\'">'
            : '<div style="width:64px;height:64px;border-radius:50%;background:linear-gradient(135deg,#2DB87B,#34D399);display:flex;align-items:center;justify-content:center;font-size:1.25rem;font-weight:700;color:white;text-transform:uppercase;">' + _esc(user.fullName.charAt(0)) + '</div>';

        const statusBadge = user.status === 'active'
            ? '<span class="badge badge-green">Active</span>'
            : '<span class="badge badge-red">Banned</span>';
        const roleBadge = user.role === 'admin'
            ? '<span class="badge badge-purple">Admin</span>'
            : '<span class="badge badge-blue">User</span>';

        return `
            <div style="display:flex;flex-direction:column;align-items:center;margin-bottom:20px;">
                ${avatarContent}
                <h3 style="font-size:1.125rem;font-weight:700;margin:12px 0 2px;">${_esc(user.fullName)}</h3>
                <p style="font-size:0.8125rem;color:#94A3B8;">@${_esc(user.username)}</p>
                <div style="display:flex;gap:6px;margin-top:8px;">${roleBadge} ${statusBadge}</div>
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:20px;">
                <div style="background:#F8FAFC;border-radius:12px;padding:14px;text-align:center;">
                    <div style="font-size:0.6875rem;color:#94A3B8;font-weight:600;text-transform:uppercase;letter-spacing:0.03em;margin-bottom:2px;">Coins</div>
                    <div style="font-size:1.25rem;font-weight:700;">${user.coins || 0}</div>
                </div>
                <div style="background:#F8FAFC;border-radius:12px;padding:14px;text-align:center;">
                    <div style="font-size:0.6875rem;color:#94A3B8;font-weight:600;text-transform:uppercase;letter-spacing:0.03em;margin-bottom:2px;">Games Played</div>
                    <div style="font-size:1.25rem;font-weight:700;">${user.totalGamesPlayed || 0}</div>
                </div>
                <div style="background:#F8FAFC;border-radius:12px;padding:14px;text-align:center;">
                    <div style="font-size:0.6875rem;color:#94A3B8;font-weight:600;text-transform:uppercase;letter-spacing:0.03em;margin-bottom:2px;">Total Wins</div>
                    <div style="font-size:1.25rem;font-weight:700;">${user.totalWins || 0}</div>
                </div>
                <div style="background:#F8FAFC;border-radius:12px;padding:14px;text-align:center;">
                    <div style="font-size:0.6875rem;color:#94A3B8;font-weight:600;text-transform:uppercase;letter-spacing:0.03em;margin-bottom:2px;">Role</div>
                    <div style="font-size:1.25rem;font-weight:700;text-transform:capitalize;">${_esc(user.role)}</div>
                </div>
            </div>
            <div style="border-top:1px solid #E2E8F0;padding-top:16px;">
                <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
                    <span style="font-size:0.8125rem;color:#94A3B8;">Email</span>
                    <span style="font-size:0.8125rem;font-weight:600;">${_esc(user.email)}</span>
                </div>
                <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
                    <span style="font-size:0.8125rem;color:#94A3B8;">Joined</span>
                    <span style="font-size:0.8125rem;font-weight:600;">${user.joinedAt ? new Date(user.joinedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}</span>
                </div>
                <div style="display:flex;justify-content:space-between;">
                    <span style="font-size:0.8125rem;color:#94A3B8;">Last Updated</span>
                    <span style="font-size:0.8125rem;font-weight:600;">${user.updatedAt ? new Date(user.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}</span>
                </div>
            </div>
        `;
    }

    /* ======================================================================
       MODAL MANAGEMENT
       ====================================================================== */

    /**
     * Open the user form modal.
     * @param {string|null} userId - If provided, populate for editing
     */
    function _openFormModal(userId) {
        _editingId = userId;
        _clearFormErrors();

        const overlay = document.getElementById('usr-modal-overlay');
        const modal = document.getElementById('usr-modal');
        const titleEl = document.getElementById('usr-form-title');

        if (userId) {
            const user = _findUserById(userId);
            if (user) {
                if (titleEl) titleEl.textContent = 'Edit User';
                _populateForm(user);
            }
        } else {
            if (titleEl) titleEl.textContent = 'Add User';
            _clearForm();
        }

        if (overlay) { overlay.style.opacity = '1'; overlay.style.visibility = 'visible'; }
        if (modal) { modal.style.transform = 'translateY(0)'; }
        document.body.style.overflow = 'hidden';
    }

    /**
     * Close the user form modal.
     */
    function _closeFormModal() {
        const overlay = document.getElementById('usr-modal-overlay');
        const modal = document.getElementById('usr-modal');

        if (overlay) { overlay.style.opacity = '0'; overlay.style.visibility = 'hidden'; }
        if (modal) { modal.style.transform = 'translateY(100%)'; }
        document.body.style.overflow = '';

        _editingId = null;
        _clearForm();
        _clearFormErrors();
    }

    /**
     * Open the view user details modal.
     * @param {string} userId
     */
    function _openViewModal(userId) {
        const user = _findUserById(userId);
        if (!user) return;

        _viewingId = userId;

        const overlay = document.getElementById('usr-view-overlay');
        const modal = document.getElementById('usr-view-modal');
        const content = document.getElementById('usr-view-content');

        if (content) content.innerHTML = _buildViewContent(user);
        if (overlay) { overlay.style.opacity = '1'; overlay.style.visibility = 'visible'; }
        if (modal) { modal.style.transform = 'translateY(0)'; }
        document.body.style.overflow = 'hidden';
    }

    /**
     * Close the view user details modal.
     */
    function _closeViewModal() {
        const overlay = document.getElementById('usr-view-overlay');
        const modal = document.getElementById('usr-view-modal');

        if (overlay) { overlay.style.opacity = '0'; overlay.style.visibility = 'hidden'; }
        if (modal) { modal.style.transform = 'translateY(100%)'; }
        document.body.style.overflow = '';

        _viewingId = null;
    }

    /**
     * Open the delete confirmation modal.
     * @param {string} userId
     */
    function _openDeleteModal(userId) {
        const user = _findUserById(userId);
        if (!user) return;

        const overlay = document.getElementById('usr-delete-overlay');
        const modal = document.getElementById('usr-delete-modal');
        const msg = document.getElementById('usr-delete-message');
        const idInput = document.getElementById('usr-delete-id');

        if (msg) msg.textContent = 'Are you sure you want to delete "' + user.fullName + '" (@' + user.username + ')? This action cannot be undone.';
        if (idInput) idInput.value = userId;

        if (overlay) { overlay.style.opacity = '1'; overlay.style.visibility = 'visible'; }
        if (modal) { modal.style.transform = 'translateY(0)'; }
        document.body.style.overflow = 'hidden';
    }

    /**
     * Close the delete confirmation modal.
     */
    function _closeDeleteModal() {
        const overlay = document.getElementById('usr-delete-overlay');
        const modal = document.getElementById('usr-delete-modal');

        if (overlay) { overlay.style.opacity = '0'; overlay.style.visibility = 'hidden'; }
        if (modal) { modal.style.transform = 'translateY(100%)'; }
        document.body.style.overflow = '';
    }

    /* ======================================================================
       FORM MANAGEMENT
       ====================================================================== */

    function _clearForm() {
        const form = document.getElementById('usr-form');
        if (form) form.reset();
        const idInput = document.getElementById('usr-form-id');
        if (idInput) idInput.value = '';
        const coinsInput = document.getElementById('usr-form-coins');
        if (coinsInput) coinsInput.value = '0';
        const gamesInput = document.getElementById('usr-form-games');
        if (gamesInput) gamesInput.value = '0';
    }

    function _clearFormErrors() {
        ['username', 'fullname', 'email'].forEach(f => {
            const err = document.getElementById('usr-error-' + f);
            if (err) err.textContent = '';
        });
        document.querySelectorAll('.input-error').forEach(el => el.classList.remove('input-error'));
    }

    function _populateForm(user) {
        const map = {
            'usr-form-id': user.id,
            'usr-form-username': user.username,
            'usr-form-fullname': user.fullName,
            'usr-form-email': user.email,
            'usr-form-avatar': user.avatarURL || '',
            'usr-form-coins': user.coins || 0,
            'usr-form-games': user.totalGamesPlayed || 0,
            'usr-form-role': user.role || 'user',
            'usr-form-status': user.status || 'active',
        };
        Object.entries(map).forEach(([id, val]) => {
            const el = document.getElementById(id);
            if (el) el.value = val;
        });
    }

    function _getFormData() {
        return {
            id: (document.getElementById('usr-form-id')?.value || ''),
            username: (document.getElementById('usr-form-username')?.value || '').trim(),
            fullName: (document.getElementById('usr-form-fullname')?.value || '').trim(),
            email: (document.getElementById('usr-form-email')?.value || '').trim(),
            avatarURL: (document.getElementById('usr-form-avatar')?.value || '').trim(),
            coins: parseInt(document.getElementById('usr-form-coins')?.value || '0', 10),
            totalGamesPlayed: parseInt(document.getElementById('usr-form-games')?.value || '0', 10),
            role: (document.getElementById('usr-form-role')?.value || 'user'),
            status: (document.getElementById('usr-form-status')?.value || 'active'),
        };
    }

    function _validateForm(data) {
        let valid = true;
        _clearFormErrors();

        if (!data.username) {
            _showError('username', 'Username is required');
            valid = false;
        } else if (_isDuplicateUsername(data.username, _editingId)) {
            _showError('username', 'This username is already taken');
            valid = false;
        }

        if (!data.fullName) {
            _showError('fullname', 'Full name is required');
            valid = false;
        }

        if (!data.email) {
            _showError('email', 'Email is required');
            valid = false;
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
            _showError('email', 'Enter a valid email address');
            valid = false;
        } else if (_isDuplicateEmail(data.email, _editingId)) {
            _showError('email', 'This email is already registered');
            valid = false;
        }

        if (isNaN(data.coins) || data.coins < 0) data.coins = 0;
        if (isNaN(data.totalGamesPlayed) || data.totalGamesPlayed < 0) data.totalGamesPlayed = 0;

        return valid;
    }

    function _showError(field, msg) {
        const err = document.getElementById('usr-error-' + field);
        if (err) err.textContent = msg;
        const inputMap = { username: 'usr-form-username', fullname: 'usr-form-fullname', email: 'usr-form-email' };
        const inp = document.getElementById(inputMap[field]);
        if (inp) inp.classList.add('input-error');
    }

    /* ======================================================================
       CRUD OPERATIONS
       ====================================================================== */

    function _saveUser(data) {
        if (!_validateForm(data)) return;

        if (_editingId) {
            const idx = _users.findIndex(u => u.id === _editingId);
            if (idx !== -1) {
                _users[idx] = {
                    ..._users[idx],
                    username: data.username,
                    fullName: data.fullName,
                    email: data.email,
                    avatarURL: data.avatarURL,
                    coins: data.coins,
                    totalGamesPlayed: data.totalGamesPlayed,
                    role: data.role,
                    status: data.status,
                    updatedAt: new Date().toISOString(),
                };
            }
            _toast('User updated successfully', 'success');
        } else {
            _users.unshift({
                id: _generateId(),
                username: data.username,
                fullName: data.fullName,
                email: data.email,
                avatarURL: data.avatarURL,
                coins: data.coins,
                totalGamesPlayed: data.totalGamesPlayed,
                totalWins: 0,
                status: data.status,
                role: data.role,
                joinedAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            });
            _toast('User created successfully', 'success');
        }

        _saveUsers();
        _closeFormModal();
        _renderTable();
    }

    function _deleteUser(userId) {
        _users = _users.filter(u => u.id !== userId);
        _saveUsers();
        _closeDeleteModal();
        _renderTable();
        _toast('User deleted', 'success');
    }

    /* ======================================================================
       EVENT BINDING
       ====================================================================== */

    function _bindEvents() {
        _on('usr-btn-add', 'click', () => _openFormModal(null));
        _on('usr-btn-close-modal', 'click', _closeFormModal);
        _on('usr-btn-cancel', 'click', _closeFormModal);
        _on('usr-modal-overlay', 'click', _closeFormModal);

        _on('usr-btn-close-view', 'click', _closeViewModal);
        _on('usr-view-overlay', 'click', _closeViewModal);

        _on('usr-btn-cancel-delete', 'click', _closeDeleteModal);
        _on('usr-delete-overlay', 'click', _closeDeleteModal);

        _on('usr-btn-confirm-delete', 'click', () => {
            const el = document.getElementById('usr-delete-id');
            if (el && el.value) _deleteUser(el.value);
        });

        const form = document.getElementById('usr-form');
        if (form) form.addEventListener('submit', e => { e.preventDefault(); _saveUser(_getFormData()); });

        const search = document.getElementById('usr-search');
        if (search) search.addEventListener('input', e => { _searchQuery = e.target.value; _renderTable(); });

        /* Delegated events for dynamic table content */
        const tableContainer = document.getElementById('usr-table-container');
        if (tableContainer) {
            tableContainer.addEventListener('click', e => {
                const viewBtn = e.target.closest('.usr-btn-view');
                const editBtn = e.target.closest('.usr-btn-edit');
                const deleteBtn = e.target.closest('.usr-btn-delete');
                const addFirst = e.target.closest('.usr-btn-add-first');

                if (viewBtn && viewBtn.dataset.id) _openViewModal(viewBtn.dataset.id);
                if (editBtn && editBtn.dataset.id) _openFormModal(editBtn.dataset.id);
                if (deleteBtn && deleteBtn.dataset.id) _openDeleteModal(deleteBtn.dataset.id);
                if (addFirst) _openFormModal(null);
            });
        }
    }

    function _on(id, evt, fn) {
        const el = document.getElementById(id);
        if (el) el.addEventListener(evt, fn);
    }

    /* ======================================================================
       UTILITIES
       ====================================================================== */

    function _esc(str) {
        if (!str) return '';
        const d = document.createElement('div');
        d.appendChild(document.createTextNode(str));
        return d.innerHTML;
    }

    function _toast(msg, type) {
        if (typeof AdminModules !== 'undefined' && AdminModules.showToast) {
            AdminModules.showToast(msg, type);
            return;
        }
        const container = document.getElementById('toast-container');
        if (!container) return;
        const t = document.createElement('div');
        t.className = 'toast ' + (type || 'info');
        t.textContent = msg;
        container.appendChild(t);
        setTimeout(() => { t.classList.add('removing'); setTimeout(() => { if (t.parentNode) t.parentNode.removeChild(t); }, 300); }, 3000);
    }

    /* ======================================================================
       PUBLIC API
       ====================================================================== */

    return Object.freeze({
        init,
    });
})();
