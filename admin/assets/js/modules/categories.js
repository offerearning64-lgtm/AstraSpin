/**
 * AstraSpin Admin Panel - Categories Module
 * @version 11.0.0
 * @description Full-featured Categories management with CRUD, search, and Games integration
 * @author AstraSpin Team
 */

(function(global) {
    'use strict';

    var Categories = {
        categories: [],
        currentEditId: null,
        searchTerm: '',
        storageKey: 'astraspin_categories',
        initialized: false,
        destroyed: false,

        cache: {
            container: null,
            categoryList: null,
            searchInput: null,
            addBtn: null,
            modal: null,
            modalTitle: null,
            form: null
        },

        /**
         * Initialize Categories module
         * @public
         */
        init: function() {
            if (this.initialized) {
                this.render();
                return;
            }

            this.destroyed = false;
            this.loadCategories();
            this.render();
            this.attachEventListeners();
            this.initialized = true;
        },

        /**
         * Load categories from localStorage
         * @public
         */
        loadCategories: function() {
            try {
                var data = localStorage.getItem(this.storageKey);
                this.categories = data ? JSON.parse(data) : [];
                if (!Array.isArray(this.categories)) this.categories = [];
            } catch (e) {
                this.categories = [];
            }

            this.categories = this.categories.map(function(cat) {
                return {
                    id: cat.id || 'cat_' + Date.now() + Math.random().toString(36).substr(2, 9),
                    name: typeof cat.name === 'string' ? cat.name.trim() : '',
                    description: typeof cat.description === 'string' ? cat.description.trim() : '',
                    createdAt: cat.createdAt || new Date().toISOString(),
                    updatedAt: cat.updatedAt || new Date().toISOString()
                };
            }).filter(function(cat) { return cat.name; });
        },

        /**
         * Save categories to localStorage
         * @public
         */
        saveCategories: function() {
            try {
                localStorage.setItem(this.storageKey, JSON.stringify(this.categories));
            } catch (e) {
                console.warn('[Categories] Save failed:', e);
            }
        },

        /**
         * Render the categories interface
         * @public
         */
        render: function() {
            if (this.destroyed) return;

            var container = document.getElementById('admin-content');
            if (!container) return;

            this.cache.container = container;
            container.innerHTML = this.buildHTML();

            this.cacheElements();
            this.renderCategoryList();
        },

        buildHTML: function() {
            return `
                <div class="module-wrapper categories-module">
                    <header class="module-header">
                        <h1 class="module-title">
                            <span class="title-icon">📂</span>
                            Categories Management
                        </h1>
                        <div class="module-actions">
                            <div class="search-box">
                                <input type="text" id="category-search" placeholder="Search categories..." class="search-input">
                                <span class="search-icon">🔍</span>
                            </div>
                            <button id="add-category-btn" class="btn-primary">
                                <span class="btn-icon">+</span>
                                Add Category
                            </button>
                        </div>
                    </header>

                    <div class="content-area">
                        <div id="categories-list" class="categories-grid"></div>
                    </div>

                    <!-- Modal -->
                    <div id="category-modal" class="modal" style="display: none;">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h2 id="modal-title">Add New Category</h2>
                                <button class="modal-close" aria-label="Close">&times;</button>
                            </div>
                            <form id="category-form" class="modal-form">
                                <div class="form-group">
                                    <label for="cat-name">Category Name <span class="required">*</span></label>
                                    <input type="text" id="cat-name" required maxlength="80">
                                </div>
                                <div class="form-group">
                                    <label for="cat-description">Description</label>
                                    <textarea id="cat-description" rows="4" maxlength="300"></textarea>
                                </div>
                                <div class="modal-actions">
                                    <button type="button" class="btn-secondary modal-cancel">Cancel</button>
                                    <button type="submit" class="btn-primary">Save Category</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            `;
        },

        cacheElements: function() {
            this.cache.categoryList = document.getElementById('categories-list');
            this.cache.searchInput = document.getElementById('category-search');
            this.cache.addBtn = document.getElementById('add-category-btn');
            this.cache.modal = document.getElementById('category-modal');
            this.cache.modalTitle = document.getElementById('modal-title');
            this.cache.form = document.getElementById('category-form');
        },

        renderCategoryList: function() {
            if (!this.cache.categoryList) return;

            var filtered = this.getFilteredCategories();

            if (filtered.length === 0) {
                this.cache.categoryList.innerHTML = `
                    <div class="empty-state">
                        <div class="empty-icon">📂</div>
                        <h3>No categories found</h3>
                        <p>Add your first category to organize games.</p>
                        <button id="empty-add-btn" class="btn-primary">Add Category</button>
                    </div>
                `;
                return;
            }

            var html = '<div class="categories-grid-inner">';
            filtered.forEach(function(cat) {
                html += `
                    <div class="category-card" data-id="${cat.id}">
                        <div class="category-info">
                            <div class="category-name">${this.escapeHtml(cat.name)}</div>
                            ${cat.description ? `<div class="category-desc">${this.escapeHtml(cat.description)}</div>` : ''}
                            <div class="category-date">Created: ${new Date(cat.createdAt).toLocaleDateString()}</div>
                            <div class="category-actions">
                                <button class="btn-edit" data-id="${cat.id}">Edit</button>
                                <button class="btn-delete" data-id="${cat.id}">Delete</button>
                            </div>
                        </div>
                    </div>
                `;
            }.bind(this));
            html += '</div>';

            this.cache.categoryList.innerHTML = html;
        },

        getFilteredCategories: function() {
            var term = this.searchTerm.toLowerCase();
            return this.categories.filter(function(cat) {
                return cat.name.toLowerCase().includes(term) || 
                       (cat.description && cat.description.toLowerCase().includes(term));
            });
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

            this.cache.searchInput.addEventListener('input', function() {
                self.searchTerm = this.value.trim();
                self.renderCategoryList();
            });

            this.cache.addBtn.addEventListener('click', function() {
                self.showAddModal();
            });

            this.cache.modal.querySelector('.modal-close').addEventListener('click', function() {
                self.closeModal();
            });

            this.cache.modal.querySelector('.modal-cancel').addEventListener('click', function() {
                self.closeModal();
            });

            this.cache.form.addEventListener('submit', function(e) {
                e.preventDefault();
                self.handleFormSubmit();
            });

            this.cache.categoryList.addEventListener('click', function(e) {
                var target = e.target;
                var id = target.getAttribute('data-id');

                if (target.classList.contains('btn-edit')) {
                    self.editCategory(id);
                } else if (target.classList.contains('btn-delete')) {
                    self.deleteCategory(id);
                } else if (target.id === 'empty-add-btn') {
                    self.showAddModal();
                }
            });
        },

        showAddModal: function() {
            this.currentEditId = null;
            this.cache.modalTitle.textContent = 'Add New Category';
            this.cache.form.reset();
            this.cache.modal.style.display = 'flex';
            this.cache.form.querySelector('#cat-name').focus();
        },

        editCategory: function(id) {
            var cat = this.categories.find(function(c) { return c.id === id; });
            if (!cat) return;

            this.currentEditId = id;
            this.cache.modalTitle.textContent = 'Edit Category';

            this.cache.form.querySelector('#cat-name').value = cat.name;
            this.cache.form.querySelector('#cat-description').value = cat.description || '';

            this.cache.modal.style.display = 'flex';
        },

        handleFormSubmit: function() {
            var name = this.cache.form.querySelector('#cat-name').value.trim();
            var description = this.cache.form.querySelector('#cat-description').value.trim();

            if (!name) {
                alert('Category name is required.');
                return;
            }

            var existing = this.categories.find(function(c) {
                return c.name.toLowerCase() === name.toLowerCase() && 
                       (!this.currentEditId || c.id !== this.currentEditId);
            }.bind(this));

            if (existing) {
                alert('A category with this name already exists.');
                return;
            }

            var now = new Date().toISOString();

            if (this.currentEditId) {
                var cat = this.categories.find(function(c) { return c.id === this.currentEditId; }.bind(this));
                if (cat) {
                    cat.name = name;
                    cat.description = description;
                    cat.updatedAt = now;
                }
            } else {
                this.categories.unshift({
                    id: 'cat_' + Date.now() + Math.random().toString(36).substr(2, 9),
                    name: name,
                    description: description,
                    createdAt: now,
                    updatedAt: now
                });
            }

            this.saveCategories();
            this.closeModal();
            this.renderCategoryList();

            // Notify other modules (especially Games)
            document.dispatchEvent(new CustomEvent('data-updated', {
                detail: {
                    module: 'categories',
                    action: this.currentEditId ? 'edit' : 'add',
                    data: { name: name }
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

        deleteCategory: function(id) {
            if (!confirm('Delete this category?')) return;

            this.categories = this.categories.filter(function(cat) {
                return cat.id !== id;
            });

            this.saveCategories();
            this.renderCategoryList();

            document.dispatchEvent(new CustomEvent('data-updated', {
                detail: {
                    module: 'categories',
                    action: 'delete',
                    data: { id: id }
                }
            }));
        },

        /**
         * Refresh categories
         * @public
         */
        refresh: function() {
            this.loadCategories();
            this.renderCategoryList();
        },

        /**
         * Cleanup
         * @public
         */
        destroy: function() {
            this.destroyed = true;
            this.categories = [];
            this.currentEditId = null;
            this.searchTerm = '';
        }
    };

    // Register module
    if (typeof global.AdminModules === 'undefined') {
        global.AdminModules = {};
    }

    global.AdminModules.categories = Categories;
})(typeof window !== 'undefined' ? window : this);
