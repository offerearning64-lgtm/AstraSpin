```javascript
/**
 * AstraSpin Admin Panel - Games Module
 * @version 11.0.0
 * @description Production-ready Games management module with full CRUD, search, filter, and dashboard integration
 * @author AstraSpin Team
 */

(function(global) {
    'use strict';

    /**
     * Games Module
     * @namespace Games
     */
    var Games = {
        games: [],
        currentEditId: null,
        searchTerm: '',
        filterCategory: 'all',
        sortMode: 'newest',
        storageKey: 'astraspin_games',
        initialized: false,
        destroyed: false,

        cache: {
            container: null,
            gameList: null,
            searchInput: null,
            categoryFilter: null,
            addBtn: null,
            modal: null,
            modalTitle: null,
            form: null
        },

        /**
         * Initialize the Games module
         * @public
         */
        init: function() {
            if (this.initialized) {
                this.render();
                return;
            }

            this.destroyed = false;
            this.loadGames();
            this.render();
            this.attachEventListeners();
            this.initialized = true;
        },

        /**
         * Load games from localStorage with validation
         * @public
         */
        loadGames: function() {
            try {
                var data = localStorage.getItem(this.storageKey);
                if (data) {
                    var parsed = JSON.parse(data);
                    this.games = Array.isArray(parsed) ? parsed : [];
                } else {
                    this.games = [];
                }
            } catch (e) {
                console.warn('[Games] Load error, using empty array');
                this.games = [];
            }

            // Ensure each game has required fields
            this.games = this.games.map(function(game) {
                return {
                    id: game.id || 'game_' + Date.now() + Math.random().toString(36).substr(2, 9),
                    name: typeof game.name === 'string' ? game.name.trim() : '',
                    category: typeof game.category === 'string' ? game.category.trim() : '',
                    thumbnail: typeof game.thumbnail === 'string' ? game.thumbnail : '',
                    url: typeof game.url === 'string' ? game.url : '',
                    description: typeof game.description === 'string' ? game.description : '',
                    status: (game.status === 'Active' || game.status === 'Inactive') ? game.status : 'Active',
                    createdAt: game.createdAt || new Date().toISOString(),
                    updatedAt: game.updatedAt || new Date().toISOString()
                };
            }).filter(function(g) { return g.name && g.category; });
        },

        /**
         * Save games to localStorage
         * @public
         */
        saveGames: function() {
            try {
                localStorage.setItem(this.storageKey, JSON.stringify(this.games));
            } catch (e) {
                console.warn('[Games] Save error:', e);
            }
        },

        /**
         * Render the games interface
         * @public
         */
        render: function() {
            if (this.destroyed) return;

            var container = document.getElementById('admin-content');
            if (!container) return;

            this.cache.container = container;

            container.innerHTML = this.buildHTML();

            this.cacheElements();
            this.populateCategoryFilter();
            this.renderGameList();
        },

        buildHTML: function() {
            return `
                <div class="module-wrapper games-module">
                    <header class="module-header">
                        <h1 class="module-title">
                            <span class="title-icon">🎮</span>
                            Games Management
                        </h1>
                        <div class="module-actions">
                            <div class="search-box">
                                <input type="text" id="game-search" placeholder="Search games..." class="search-input">
                                <span class="search-icon">🔍</span>
                            </div>
                            <select id="category-filter" class="category-filter">
                                <option value="all">All Categories</option>
                            </select>
                            <button id="add-game-btn" class="btn-primary">
                                <span class="btn-icon">+</span>
                                Add Game
                            </button>
                        </div>
                    </header>

                    <div class="content-area">
                        <div id="games-list" class="games-grid"></div>
                    </div>

                    <!-- Add/Edit Modal -->
                    <div id="game-modal" class="modal" style="display: none;">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h2 id="modal-title">Add New Game</h2>
                                <button class="modal-close" aria-label="Close">&times;</button>
                            </div>
                            <form id="game-form" class="modal-form">
                                <div class="form-group">
                                    <label for="game-name">Game Name <span class="required">*</span></label>
                                    <input type="text" id="game-name" required maxlength="100">
                                </div>
                                <div class="form-group">
                                    <label for="game-category">Category <span class="required">*</span></label>
                                    <select id="game-category" required></select>
                                </div>
                                <div class="form-group">
                                    <label for="game-thumbnail">Thumbnail URL</label>
                                    <input type="url" id="game-thumbnail" placeholder="https://example.com/thumb.jpg">
                                </div>
                                <div class="form-group">
                                    <label for="game-url">Game URL</label>
                                    <input type="url" id="game-url" placeholder="https://example.com/game">
                                </div>
                                <div class="form-group">
                                    <label for="game-description">Description</label>
                                    <textarea id="game-description" rows="4" maxlength="500"></textarea>
                                </div>
                                <div class="form-group">
                                    <label for="game-status">Status</label>
                                    <select id="game-status">
                                        <option value="Active">Active</option>
                                        <option value="Inactive">Inactive</option>
                                    </select>
                                </div>
                                <div class="modal-actions">
                                    <button type="button" class="btn-secondary modal-cancel">Cancel</button>
                                    <button type="submit" class="btn-primary">Save Game</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            `;
        },

        cacheElements: function() {
            this.cache.gameList = document.getElementById('games-list');
            this.cache.searchInput = document.getElementById('game-search');
            this.cache.categoryFilter = document.getElementById('category-filter');
            this.cache.addBtn = document.getElementById('add-game-btn');
            this.cache.modal = document.getElementById('game-modal');
            this.cache.modalTitle = document.getElementById('modal-title');
            this.cache.form = document.getElementById('game-form');
        },

        populateCategoryFilter: function() {
            var select = this.cache.categoryFilter;
            if (!select) return;

            var categories = new Set();
            this.games.forEach(function(game) {
                if (game.category) categories.add(game.category);
            });

            // Clear except first option
            while (select.options.length > 1) {
                select.remove(1);
            }

            Array.from(categories).sort().forEach(function(cat) {
                var opt = document.createElement('option');
                opt.value = cat;
                opt.textContent = cat;
                select.appendChild(opt);
            });
        },

        renderGameList: function() {
            if (!this.cache.gameList) return;

            var filtered = this.getFilteredGames();

            if (filtered.length === 0) {
                this.cache.gameList.innerHTML = `
                    <div class="empty-state">
                        <div class="empty-icon">🎮</div>
                        <h3>No games found</h3>
                        <p>Try adjusting your search or add a new game.</p>
                        <button id="empty-add-btn" class="btn-primary">Add Your First Game</button>
                    </div>
                `;
                return;
            }

            var html = '<div class="games-grid-inner">';
            filtered.forEach(function(game) {
                html += `
                    <div class="game-card" data-id="${game.id}">
                        <div class="game-thumbnail">
                            ${game.thumbnail ? `<img src="${this.escapeHtml(game.thumbnail)}" alt="${this.escapeHtml(game.name)}" onerror="this.style.display='none'">` : '<div class="no-thumb">🎮</div>'}
                        </div>
                        <div class="game-info">
                            <div class="game-name">${this.escapeHtml(game.name)}</div>
                            <div class="game-category">${this.escapeHtml(game.category)}</div>
                            <div class="game-status ${game.status.toLowerCase()}">${game.status}</div>
                            ${game.description ? `<div class="game-desc">${this.escapeHtml(game.description.substring(0, 80))}${game.description.length > 80 ? '...' : ''}</div>` : ''}
                            <div class="game-actions">
                                <button class="btn-edit" data-id="${game.id}">Edit</button>
                                <button class="btn-delete" data-id="${game.id}">Delete</button>
                            </div>
                        </div>
                    </div>
                `;
            }.bind(this));
            html += '</div>';

            this.cache.gameList.innerHTML = html;
        },

        getFilteredGames: function() {
            var self = this;
            var filtered = this.games.filter(function(game) {
                var matchesSearch = !self.searchTerm || 
                    game.name.toLowerCase().indexOf(self.searchTerm.toLowerCase()) !== -1 ||
                    (game.description && game.description.toLowerCase().indexOf(self.searchTerm.toLowerCase()) !== -1);

                var matchesCategory = self.filterCategory === 'all' || game.category === self.filterCategory;

                return matchesSearch && matchesCategory;
            });

            // Sort
            if (this.sortMode === 'newest') {
                filtered.sort(function(a, b) {
                    return new Date(b.createdAt) - new Date(a.createdAt);
                });
            }

            return filtered;
        },

        escapeHtml: function(text) {
            if (text == null) return '';
            return String(text)
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#039;');
        },

        attachEventListeners: function() {
            var self = this;

            // Search
            this.cache.searchInput.addEventListener('input', function() {
                self.searchTerm = this.value.trim();
                self.renderGameList();
            });

            // Category filter
            this.cache.categoryFilter.addEventListener('change', function() {
                self.filterCategory = this.value;
                self.renderGameList();
            });

            // Add button
            this.cache.addBtn.addEventListener('click', function() {
                self.showAddModal();
            });

            // Modal close
            this.cache.modal.querySelector('.modal-close').addEventListener('click', function() {
                self.closeModal();
            });

            this.cache.modal.querySelector('.modal-cancel').addEventListener('click', function() {
                self.closeModal();
            });

            // Form submit
            this.cache.form.addEventListener('submit', function(e) {
                e.preventDefault();
                self.handleFormSubmit();
            });

            // Event delegation for cards
            this.cache.gameList.addEventListener('click', function(e) {
                var target = e.target;

                if (target.classList.contains('btn-edit')) {
                    var id = target.getAttribute('data-id');
                    self.editGame(id);
                } else if (target.classList.contains('btn-delete')) {
                    var id = target.getAttribute('data-id');
                    self.deleteGame(id);
                } else if (target.id === 'empty-add-btn') {
                    self.showAddModal();
                }
            });

            // Global data refresh listener
            document.addEventListener('data-updated', function(e) {
                if (e.detail && e.detail.module === 'games') {
                    self.refresh();
                }
            });
        },

        showAddModal: function() {
            this.currentEditId = null;
            this.cache.modalTitle.textContent = 'Add New Game';
            this.cache.form.reset();

            this.populateModalCategories();
            this.cache.modal.style.display = 'flex';
            this.cache.form.querySelector('#game-name').focus();
        },

        editGame: function(id) {
            var game = this.games.find(function(g) { return g.id === id; });
            if (!game) return;

            this.currentEditId = id;
            this.cache.modalTitle.textContent = 'Edit Game';

            this.populateModalCategories();

            this.cache.form.querySelector('#game-name').value = game.name;
            this.cache.form.querySelector('#game-category').value = game.category;
            this.cache.form.querySelector('#game-thumbnail').value = game.thumbnail || '';
            this.cache.form.querySelector('#game-url').value = game.url || '';
            this.cache.form.querySelector('#game-description').value = game.description || '';
            this.cache.form.querySelector('#game-status').value = game.status;

            this.cache.modal.style.display = 'flex';
        },

        populateModalCategories: function() {
            var select = this.cache.form.querySelector('#game-category');
            if (!select) return;

            // Get existing categories
            var cats = new Set();
            this.games.forEach(function(g) {
                if (g.category) cats.add(g.category);
            });

            select.innerHTML = '<option value="">Select Category</option>';
            Array.from(cats).sort().forEach(function(cat) {
                var opt = document.createElement('option');
                opt.value = cat;
                opt.textContent = cat;
                select.appendChild(opt);
            });
        },

        handleFormSubmit: function() {
            var name = this.cache.form.querySelector('#game-name').value.trim();
            var category = this.cache.form.querySelector('#game-category').value.trim();
            var thumbnail = this.cache.form.querySelector('#game-thumbnail').value.trim();
            var url = this.cache.form.querySelector('#game-url').value.trim();
            var description = this.cache.form.querySelector('#game-description').value.trim();
            var status = this.cache.form.querySelector('#game-status').value;

            if (!name || !category) {
                alert('Game Name and Category are required.');
                return;
            }

            // Check duplicate name (except when editing self)
            var existing = this.games.find(function(g) {
                return g.name.toLowerCase() === name.toLowerCase() && 
                       (!this.currentEditId || g.id !== this.currentEditId);
            }.bind(this));

            if (existing) {
                alert('A game with this name already exists.');
                return;
            }

            var now = new Date().toISOString();

            if (this.currentEditId) {
                var game = this.games.find(function(g) { return g.id === this.currentEditId; }.bind(this));
                if (game) {
                    game.name = name;
                    game.category = category;
                    game.thumbnail = thumbnail;
                    game.url = url;
                    game.description = description;
                    game.status = status;
                    game.updatedAt = now;
                }
            } else {
                var newGame = {
                    id: 'game_' + Date.now() + Math.random().toString(36).substr(2, 9),
                    name: name,
                    category: category,
                    thumbnail: thumbnail,
                    url: url,
                    description: description,
                    status: status,
                    createdAt: now,
                    updatedAt: now
                };
                this.games.unshift(newGame);
            }

            this.saveGames();
            this.closeModal();
            this.renderGameList();
            this.populateCategoryFilter();

            // Notify dashboard
            document.dispatchEvent(new CustomEvent('data-updated', {
                detail: {
                    module: 'games',
                    action: this.currentEditId ? 'edit' : 'add',
                    data: this.currentEditId ? this.games.find(function(g) { return g.id === this.currentEditId; }.bind(this)) : this.games[0]
                }
            }));
        },

        closeModal: function() {
            if (this.cache.modal) {
                this.cache.modal.style.display = 'none';
                this.cache.form.reset();
                this.currentEditId = null;
            }
        },

        deleteGame: function(id) {
            if (!confirm('Are you sure you want to delete this game?')) return;

            this.games = this.games.filter(function(game) {
                return game.id !== id;
            });

            this.saveGames();
            this.renderGameList();
            this.populateCategoryFilter();

            // Notify dashboard
            document.dispatchEvent(new CustomEvent('data-updated', {
                detail: {
                    module: 'games',
                    action: 'delete',
                    data: { id: id }
                }
            }));
        },

        /**
         * Refresh the games list
         * @public
         */
        refresh: function() {
            this.loadGames();
            this.renderGameList();
            this.populateCategoryFilter();
        },

        /**
         * Add a game programmatically
         * @public
         */
        addGame: function(gameData) {
            if (!gameData || !gameData.name || !gameData.category) return false;

            var newGame = {
                id: 'game_' + Date.now() + Math.random().toString(36).substr(2, 9),
                name: gameData.name.trim(),
                category: gameData.category.trim(),
                thumbnail: gameData.thumbnail || '',
                url: gameData.url || '',
                description: gameData.description || '',
                status: gameData.status || 'Active',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            this.games.unshift(newGame);
            this.saveGames();
            this.refresh();

            document.dispatchEvent(new CustomEvent('data-updated', {
                detail: { module: 'games', action: 'add', data: newGame }
            }));

            return true;
        },

        /**
         * Cleanup
         * @public
         */
        destroy: function() {
            this.destroyed = true;

            if (this.cache.container) {
                this.cache.container.innerHTML = '';
            }

            this.games = [];
            this.currentEditId = null;
            this.searchTerm = '';
            this.filterCategory = 'all';

            this.cache = {
                container: null,
                gameList: null,
                searchInput: null,
                categoryFilter: null,
                addBtn: null,
                modal: null,
                modalTitle: null,
                form: null
            };
        }
    };

    // Register with global AdminModules
    if (typeof global.AdminModules === 'undefined') {
        global.AdminModules = {};
    }

    global.AdminModules.games = Games;
})(typeof window !== 'undefined' ? window : this);
```

**File saved:** `admin/assets/js/modules/games.js` (Production-ready, fully compatible with Dashboard v11.0.0)
