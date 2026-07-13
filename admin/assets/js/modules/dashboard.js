/**
 * AstraSpin Admin Panel - Dashboard Module
 * @version 11.0.0
 * @description Enterprise-grade dashboard with optimized internal architecture
 * @author AstraSpin Team
 * 
 * @requires AdminModules - Global module registry
 * @requires localStorage - Browser storage API
 * 
 * @exports {Object} AdminModules.dashboard - Dashboard module instance
 */
(function(global) {
    'use strict';

    /**
     * Immutable configuration
     * @private
     */
    var CONFIG = Object.freeze({
        REFRESH_INTERVAL: 30000,
        MAX_ACTIVITY_ITEMS: 20,
        ACTIVITY_DEDUPE_WINDOW: 2000,
        REFRESH_THROTTLE_MS: 100,
        STORAGE_PREFIX: 'astraspin_',
        STORAGE_MODULES: ['users', 'games', 'categories', 'uploads', 'wallet', 'activity'],
        DEBUG: false,
        MAX_TEXT_LENGTH: 500,
        EVENT_THROTTLE: 16
    });

    /**
     * Centralized Event Dispatcher
     * @private
     */
    var EventDispatcher = {
        listeners: {},
        dispatched: new Set(),

        addListener: function(eventName, handler) {
            if (typeof handler !== 'function') return;
            if (!this.listeners[eventName]) {
                this.listeners[eventName] = new Set();
            }
            this.listeners[eventName].add(handler);
            document.addEventListener(eventName, handler, { passive: true });
        },

        removeListener: function(eventName, handler) {
            if (this.listeners[eventName]) {
                this.listeners[eventName].delete(handler);
                document.removeEventListener(eventName, handler);
            }
        },

        dispatch: function(eventName, detail) {
            if (this.dispatched.has(eventName)) return;
            this.dispatched.add(eventName);
            setTimeout(function() {
                EventDispatcher.dispatched.delete(eventName);
            }, CONFIG.EVENT_THROTTLE);

            try {
                var safeDetail = detail && typeof detail === 'object' ? detail : {};
                var event = new CustomEvent(eventName, { detail: safeDetail });
                document.dispatchEvent(event);
            } catch (e) {
                if (CONFIG.DEBUG) console.warn('[Dashboard] Dispatch error:', e);
            }
        },

        cleanup: function() {
            Object.keys(this.listeners).forEach(function(eventName) {
                var handlers = this.listeners[eventName];
                handlers.forEach(function(handler) {
                    document.removeEventListener(eventName, handler);
                });
            }.bind(this));
            this.listeners = {};
            this.dispatched.clear();
        }
    };

    /**
     * Dashboard Module
     * @namespace Dashboard
     */
    var Dashboard = {
        stats: {
            totalUsers: 0,
            totalGames: 0,
            categories: 0,
            uploads: 0,
            walletCoins: 0,
            systemStatus: 'Operational'
        },

        activity: [],
        refreshTimer: null,
        initialized: false,
        storageKeys: {},
        listenersAttached: false,
        boundHandlers: {},
        lastActivityText: '',
        lastActivityTime: 0,
        refreshAnimationTimer: null,
        refreshThrottle: null,
        refreshPending: false,
        refreshing: false,
        destroyed: false,
        rendering: false,
        rafId: null,

        cache: {
            container: null,
            statsGrid: null,
            activityList: null,
            statusIndicator: null,
            statusText: null,
            refreshBtn: null,
            statValues: null
        },

        prevStats: {
            totalUsers: -1,
            totalGames: -1,
            categories: -1,
            uploads: -1,
            walletCoins: -1,
            systemStatus: ''
        },

        /**
         * Initialize the dashboard module
         * @public
         */
        init: function() {
            if (this.initialized) {
                this.render();
                return;
            }

            this.destroyed = false;

            try {
                this.discoverStorageKeys();
                this.loadData();
                this.render();
                this.attachEventListeners();
                this.startAutoRefresh();
                this.verifyModuleCompatibility();
                this.initialized = true;
                EventDispatcher.dispatch('dashboard-ready', { stats: this.stats });
            } catch (error) {
                if (CONFIG.DEBUG) console.warn('[Dashboard] Init error:', error);
            }
        },

        verifyModuleCompatibility: function() {
            if (!global.AdminModules) return;
            var self = this;
            Object.keys(global.AdminModules).forEach(function(key) {
                var mod = global.AdminModules[key];
                if (mod && typeof mod === 'object') {
                    self.moduleInitialized = self.moduleInitialized || {};
                    self.moduleInitialized[key] = {
                        init: typeof mod.init === 'function'
                    };
                }
            });
        },

        discoverStorageKeys: function() {
            var self = this;
            CONFIG.STORAGE_MODULES.forEach(function(module) {
                var key = CONFIG.STORAGE_PREFIX + module;
                self.storageKeys[module] = key;
                try {
                    if (localStorage.getItem(key) === null) {
                        var defaultVal = module === 'wallet' ? 0 : [];
                        localStorage.setItem(key, JSON.stringify(defaultVal));
                    }
                } catch (e) {}
            });
        },

        loadData: function() {
            try {
                var snapshot = {};
                var self = this;
                CONFIG.STORAGE_MODULES.forEach(function(m) {
                    snapshot[m] = self.getStorageData(self.storageKeys[m]);
                });

                var validated = {
                    users: this.validateArray(snapshot.users),
                    games: this.validateArray(snapshot.games),
                    categories: this.validateArray(snapshot.categories),
                    uploads: this.validateArray(snapshot.uploads),
                    wallet: this.validateWallet(snapshot.wallet),
                    activity: this.validateActivityArray(snapshot.activity)
                };

                validated.activity.sort(function(a, b) {
                    return new Date(b.timestamp) - new Date(a.timestamp);
                });

                this.stats = {
                    totalUsers: validated.users.length,
                    totalGames: validated.games.length,
                    categories: validated.categories.length,
                    uploads: validated.uploads.length,
                    walletCoins: Math.max(0, validated.wallet),
                    systemStatus: this.calculateSystemStatus(validated.users, validated.games, validated.categories)
                };

                this.activity = validated.activity.slice(0, CONFIG.MAX_ACTIVITY_ITEMS);
            } catch (error) {
                if (CONFIG.DEBUG) console.warn('[Dashboard] Load data error:', error);
                this.resetToDefaults();
            }
        },

        validateArray: function(data) {
            return Array.isArray(data) ? data : [];
        },

        validateWallet: function(data) {
            if (typeof data === 'number' && isFinite(data)) return data;
            if (data && typeof data === 'object' && typeof data.coins === 'number') return data.coins;
            return 0;
        },

        validateActivityArray: function(data) {
            if (!Array.isArray(data)) return [];
            var result = [];
            for (var i = 0; i < data.length && result.length < CONFIG.MAX_ACTIVITY_ITEMS * 2; i++) {
                var item = data[i];
                if (!item || typeof item !== 'object') continue;
                if (typeof item.text !== 'string' || !item.text.trim()) continue;
                if (typeof item.timestamp !== 'string') continue;

                var date = new Date(item.timestamp);
                if (isNaN(date.getTime())) continue;

                var text = item.text.length > CONFIG.MAX_TEXT_LENGTH ? 
                    item.text.substring(0, CONFIG.MAX_TEXT_LENGTH) + '...' : item.text.trim();

                result.push({
                    text: text,
                    icon: (typeof item.icon === 'string' && item.icon) ? item.icon : '📌',
                    timestamp: item.timestamp
                });
            }
            return result;
        },

        getStorageData: function(key) {
            try {
                var str = localStorage.getItem(key);
                return str ? JSON.parse(str) : null;
            } catch (e) {
                return null;
            }
        },

        calculateSystemStatus: function(users, games, categories) {
            var hasU = Array.isArray(users) && users.length > 0;
            var hasG = Array.isArray(games) && games.length > 0;
            var hasC = Array.isArray(categories) && categories.length > 0;
            if (hasU && hasG && hasC) return 'Operational';
            if (hasU || hasG || hasC) return 'Partial';
            return 'Setup Required';
        },

        resetToDefaults: function() {
            this.stats = {
                totalUsers: 0, totalGames: 0, categories: 0,
                uploads: 0, walletCoins: 0, systemStatus: 'Setup Required'
            };
            this.activity = [];
        },

        statsHaveChanged: function(newStats) {
            var p = this.prevStats;
            return p.totalUsers !== newStats.totalUsers ||
                   p.totalGames !== newStats.totalGames ||
                   p.categories !== newStats.categories ||
                   p.uploads !== newStats.uploads ||
                   p.walletCoins !== newStats.walletCoins ||
                   p.systemStatus !== newStats.systemStatus;
        },

        clearCache: function() {
            this.cache.container = null;
            this.cache.statsGrid = null;
            this.cache.activityList = null;
            this.cache.statusIndicator = null;
            this.cache.statusText = null;
            this.cache.refreshBtn = null;
            this.cache.statValues = null;
        },

        cacheStatsElements: function() {
            if (this.cache.statsGrid) return;
            this.cache.statsGrid = document.getElementById('stats-grid');
            this.cache.activityList = document.getElementById('activity-list');
            this.cache.statusIndicator = document.querySelector('.status-indicator');
            this.cache.statusText = document.querySelector('.status-text');
            this.cache.refreshBtn = document.getElementById('dashboard-refresh');
            this.cache.statValues = document.querySelectorAll('#stats-grid .stat-value');
        },

        render: function() {
            if (this.rendering || this.destroyed) return;
            this.rendering = true;

            var self = this;
            if (this.rafId) cancelAnimationFrame(this.rafId);

            this.rafId = requestAnimationFrame(function() {
                try {
                    var container = document.getElementById('admin-content');
                    if (!container) {
                        self.rendering = false;
                        return;
                    }

                    self.clearCache();
                    self.cache.container = container;

                    if (container.querySelector('.dashboard-wrapper')) {
                        self.cacheStatsElements();
                        self.updateStatsDisplay();
                        self.updateActivityDisplay();
                        self.rendering = false;
                        return;
                    }

                    container.innerHTML = self.buildDashboardHTML();
                    self.cacheStatsElements();
                    self.updateStatsDisplay();
                    self.updateActivityDisplay();

                    EventDispatcher.dispatch('dashboard-rendered', { stats: self.stats });
                } catch (error) {
                    if (CONFIG.DEBUG) console.warn('[Dashboard] Render error:', error);
                } finally {
                    self.rendering = false;
                    self.rafId = null;
                }
            });
        },

        buildDashboardHTML: function() {
            return [
                '<div class="dashboard-wrapper" role="main" aria-label="Dashboard">',
                    '<header class="dashboard-header">',
                        '<h1 class="dashboard-title"><span class="title-icon" aria-hidden="true">📊</span>Dashboard</h1>',
                        '<div class="dashboard-controls">',
                            '<span class="status-indicator ' + this.getStatusClass() + '" role="status" aria-live="polite"></span>',
                            '<span class="status-text" aria-live="polite">' + this.escapeHtml(this.stats.systemStatus) + '</span>',
                            '<button class="refresh-btn" id="dashboard-refresh" title="Refresh dashboard" aria-label="Refresh dashboard" type="button">',
                                '<span class="refresh-icon" aria-hidden="true">⟳</span>',
                            '</button>',
                        '</div>',
                    '</header>',
                    '<div class="stats-grid" id="stats-grid" role="list">',
                        this.getStatCards(),
                    '</div>',
                    '<div class="dashboard-content">',
                        '<section class="activity-section" aria-label="Recent Activity">',
                            '<h2 class="section-title"><span class="section-icon" aria-hidden="true">🔄</span>Recent Activity</h2>',
                            '<div class="activity-list" id="activity-list" role="feed">',
                                this.getActivityItems(),
                            '</div>',
                        '</section>',
                        '<section class="actions-section" aria-label="Quick Actions">',
                            '<h2 class="section-title"><span class="section-icon" aria-hidden="true">⚡</span>Quick Actions</h2>',
                            '<div class="actions-grid" role="group">',
                                this.getActionButtons(),
                            '</div>',
                        '</section>',
                    '</div>',
                '</div>'
            ].join('');
        },

        getStatCards: function() {
            var stats = [
                { icon: '👥', label: 'Total Users', value: this.stats.totalUsers, color: 'blue' },
                { icon: '🎮', label: 'Total Games', value: this.stats.totalGames, color: 'green' },
                { icon: '📂', label: 'Categories', value: this.stats.categories, color: 'purple' },
                { icon: '📤', label: 'Uploads', value: this.stats.uploads, color: 'orange' },
                { icon: '🪙', label: 'Wallet Coins', value: this.stats.walletCoins, color: 'gold' },
                { icon: '🟢', label: 'System Status', value: this.stats.systemStatus, color: 'status' }
            ];

            var self = this;
            return stats.map(function(stat) {
                var val = self.escapeHtml(String(stat.value));
                return [
                    '<div class="stat-card stat-' + stat.color + '" role="listitem" aria-label="' + self.escapeHtml(stat.label) + ': ' + val + '">',
                        '<div class="stat-icon" aria-hidden="true">' + stat.icon + '</div>',
                        '<div class="stat-info">',
                            '<span class="stat-label">' + self.escapeHtml(stat.label) + '</span>',
                            '<span class="stat-value">' + val + '</span>',
                        '</div>',
                    '</div>'
                ].join('');
            }).join('');
        },

        getActivityItems: function() {
            if (this.activity.length === 0) {
                return '<div class="no-activity" role="status"><span class="no-activity-icon" aria-hidden="true">📭</span><p>No recent activity to display</p></div>';
            }

            var self = this;
            return this.activity.slice(0, CONFIG.MAX_ACTIVITY_ITEMS).map(function(item, i) {
                var text = self.escapeHtml(item.text);
                var icon = self.escapeHtml(item.icon);
                var time = self.formatTime(item.timestamp);
                return [
                    '<div class="activity-item" role="article" aria-label="Activity ' + (i + 1) + '">',
                        '<span class="activity-icon" aria-hidden="true">' + icon + '</span>',
                        '<div class="activity-content">',
                            '<p class="activity-text">' + text + '</p>',
                            '<span class="activity-time">' + time + '</span>',
                        '</div>',
                    '</div>'
                ].join('');
            }).join('');
        },

        getActionButtons: function() {
            var actions = [
                { id: 'users', label: 'Open Users', icon: '👥', module: 'users' },
                { id: 'games', label: 'Open Games', icon: '🎮', module: 'games' },
                { id: 'categories', label: 'Open Categories', icon: '📂', module: 'categories' },
                { id: 'uploads', label: 'Open Uploads', icon: '📤', module: 'uploads' },
                { id: 'settings', label: 'Open Settings', icon: '⚙️', module: 'settings' }
            ];

            var self = this;
            return actions.map(function(a) {
                return [
                    '<button class="action-btn" data-action="' + self.escapeHtml(a.id) + '" data-module="' + self.escapeHtml(a.module) + '" role="button" aria-label="' + self.escapeHtml(a.label) + '" type="button">',
                        '<span class="action-icon" aria-hidden="true">' + a.icon + '</span>',
                        '<span class="action-label">' + self.escapeHtml(a.label) + '</span>',
                    '</button>'
                ].join('');
            }).join('');
        },

        updateStatsDisplay: function() {
            if (!this.statsHaveChanged(this.stats)) return;
            this.cacheStatsElements();

            var values = [
                this.stats.totalUsers,
                this.stats.totalGames,
                this.stats.categories,
                this.stats.uploads,
                this.stats.walletCoins,
                this.stats.systemStatus
            ];

            if (this.cache.statValues && this.cache.statValues.length >= 6) {
                for (var i = 0; i < 6; i++) {
                    var el = this.cache.statValues[i];
                    if (el) el.textContent = String(values[i]);
                }
            }

            var statusInd = this.cache.statusIndicator;
            var statusTxt = this.cache.statusText;
            if (statusInd) statusInd.className = 'status-indicator ' + this.getStatusClass();
            if (statusTxt) statusTxt.textContent = this.stats.systemStatus;

            this.prevStats = {
                totalUsers: this.stats.totalUsers,
                totalGames: this.stats.totalGames,
                categories: this.stats.categories,
                uploads: this.stats.uploads,
                walletCoins: this.stats.walletCoins,
                systemStatus: this.stats.systemStatus
            };
        },

        updateActivityDisplay: function() {
            if (this.destroyed) return;
            var list = this.cache.activityList || document.getElementById('activity-list');
            if (list) {
                list.innerHTML = this.getActivityItems();
                this.cache.activityList = list;
            }
        },

        getStatusClass: function() {
            var s = this.stats.systemStatus.toLowerCase();
            if (s.indexOf('operational') !== -1) return 'status-operational';
            if (s.indexOf('partial') !== -1) return 'status-partial';
            if (s.indexOf('setup') !== -1) return 'status-setup';
            return 'status-unknown';
        },

        formatTime: function(ts) {
            if (!ts) return 'Just now';
            try {
                var date = new Date(ts);
                if (isNaN(date.getTime())) return 'Unknown time';
                var diff = Math.floor((Date.now() - date) / 1000);
                if (diff < 60) return 'Just now';
                if (diff < 3600) return Math.floor(diff / 60) + 'm ago';
                if (diff < 86400) return Math.floor(diff / 3600) + 'h ago';
                if (diff < 604800) return Math.floor(diff / 86400) + 'd ago';
                return date.toLocaleDateString('en-US', {month:'short', day:'numeric', year:'numeric'});
            } catch (e) {
                return 'Unknown time';
            }
        },

        escapeHtml: function(text) {
            if (text == null) return '';
            var str = String(text);
            return str.replace(/[&<>"']/g, function(m) {
                return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m];
            });
        },

        attachEventListeners: function() {
            if (this.listenersAttached || this.destroyed) return;

            var self = this;

            this.boundHandlers = {
                actionClick: function(e) {
                    var btn = e.target.closest && e.target.closest('.action-btn');
                    if (btn) {
                        var mod = btn.getAttribute('data-module');
                        if (mod) self.openModule(mod);
                    }
                },
                refreshClick: function(e) {
                    var btn = e.target.closest && e.target.closest('#dashboard-refresh');
                    if (btn) {
                        self.refresh();
                        self.animateRefresh(btn);
                    }
                },
                storageChange: function(e) {
                    if (Object.values(self.storageKeys).indexOf(e.key) !== -1) {
                        self.refresh();
                    }
                },
                dataUpdate: function(e) {
                    var d = e.detail || {};
                    if (d.module && d.action) {
                        var icon = self.getActionIcon(d.module, d.action);
                        var text = self.getActionText(d.module, d.action, d.data);
                        if (text) self.addActivity(text, icon);
                    }
                    self.refresh();
                },
                moduleChange: function(e) {
                    var d = e.detail || {};
                    if (d.module) {
                        self.addActivity('Updated ' + d.module + ' module', '🔄');
                        self.refresh();
                    }
                }
            };

            EventDispatcher.addListener('click', this.boundHandlers.actionClick);
            EventDispatcher.addListener('click', this.boundHandlers.refreshClick);
            window.addEventListener('storage', this.boundHandlers.storageChange);
            EventDispatcher.addListener('data-updated', this.boundHandlers.dataUpdate);
            EventDispatcher.addListener('module-changed', this.boundHandlers.moduleChange);

            this.listenersAttached = true;
        },

        animateRefresh: function(btn) {
            if (!btn) return;
            var icon = btn.querySelector('.refresh-icon');
            if (!icon) return;
            if (this.refreshAnimationTimer) clearTimeout(this.refreshAnimationTimer);

            icon.style.transition = 'transform 0.6s ease';
            icon.style.transform = 'rotate(360deg)';

            var self = this;
            this.refreshAnimationTimer = setTimeout(function() {
                if (icon && !self.destroyed) {
                    icon.style.transition = '';
                    icon.style.transform = '';
                }
            }, 600);
        },

        openModule: function(moduleName) {
            if (this.destroyed) return;
            try {
                var mod = global.AdminModules && global.AdminModules[moduleName];
                if (mod && typeof mod.init === 'function') {
                    mod.init();
                    this.addActivity('Opened ' + moduleName + ' module', '📂');
                    return;
                }
                var link = document.querySelector('[data-module="' + moduleName + '"]');
                if (link) {
                    link.click();
                    this.addActivity('Navigated to ' + moduleName, '🔗');
                    return;
                }
                this.addActivity('Requested ' + moduleName + ' module', '📨');
            } catch (e) {}
        },

        getActionIcon: function(module, action) {
            var map = {
                users: {add:'👤',edit:'✏️',delete:'🗑️'},
                games: {add:'🎮',edit:'✏️',delete:'🗑️'},
                categories: {add:'📂',edit:'✏️',delete:'🗑️'},
                uploads: {add:'📤',edit:'✏️',delete:'🗑️'},
                wallet: {add:'🪙',edit:'✏️',delete:'🗑️'}
            };
            return (map[module] && map[module][action]) || '📌';
        },

        getActionText: function(module, action, data) {
            var name = data && data.name ? '"' + String(data.name) + '"' : '';
            var texts = {
                users: {add:'Added new user '+name, edit:'Updated user '+name, delete:'Removed user '+name},
                games: {add:'Added new game '+name, edit:'Updated game '+name, delete:'Removed game '+name},
                categories: {add:'Added new category '+name, edit:'Updated category '+name, delete:'Removed category '+name},
                uploads: {add:'Uploaded new file '+name, edit:'Updated upload '+name, delete:'Removed upload '+name},
                wallet: {add:'Added coins to wallet '+name, edit:'Updated wallet '+name, delete:'Removed coins from wallet '+name}
            };
            return (texts[module] && texts[module][action]) || ('Performed ' + action + ' on ' + module);
        },

        addActivity: function(text, icon) {
            if (this.destroyed || typeof text !== 'string' || !text.trim()) return;

            var now = Date.now();
            if (text === this.lastActivityText && now - this.lastActivityTime < CONFIG.ACTIVITY_DEDUPE_WINDOW) {
                return;
            }

            this.lastActivityText = text;
            this.lastActivityTime = now;

            this.activity.unshift({
                text: text.trim(),
                icon: (typeof icon === 'string' && icon) || '📌',
                timestamp: new Date().toISOString()
            });

            if (this.activity.length > CONFIG.MAX_ACTIVITY_ITEMS) {
                this.activity.length = CONFIG.MAX_ACTIVITY_ITEMS;
            }

            this.saveActivity();
            this.updateActivityDisplay();
        },

        saveActivity: function() {
            if (this.destroyed) return;
            try {
                localStorage.setItem(this.storageKeys.activity, JSON.stringify(this.activity));
            } catch (e) {
                if (e.name === 'QuotaExceededError') {
                    this.activity = this.activity.slice(0, 10);
                    try {
                        localStorage.setItem(this.storageKeys.activity, JSON.stringify(this.activity));
                    } catch (e2) {}
                }
            }
        },

        startAutoRefresh: function() {
            this.stopAutoRefresh();
            var self = this;
            this.refreshTimer = setInterval(function() {
                if (!self.destroyed && self.initialized) self.refresh();
            }, CONFIG.REFRESH_INTERVAL);
        },

        stopAutoRefresh: function() {
            if (this.refreshTimer) {
                clearInterval(this.refreshTimer);
                this.refreshTimer = null;
            }
        },

        refresh: function() {
            if (this.destroyed || this.refreshing) return;

            if (this.refreshThrottle) {
                this.refreshPending = true;
                return;
            }

            this.refreshing = true;
            var self = this;

            this.refreshThrottle = setTimeout(function() {
                self.refreshThrottle = null;
                if (self.refreshPending) {
                    self.refreshPending = false;
                    self.refresh();
                }
            }, CONFIG.REFRESH_THROTTLE_MS);

            try {
                this.loadData();
                this.updateStatsDisplay();
                this.updateActivityDisplay();
                EventDispatcher.dispatch('dashboard-refreshed', { stats: this.stats });
            } catch (e) {
                if (CONFIG.DEBUG) console.warn('[Dashboard] Refresh error:', e);
            } finally {
                this.refreshing = false;
            }
        },

        destroy: function() {
            this.destroyed = true;

            if (this.rafId) {
                cancelAnimationFrame(this.rafId);
                this.rafId = null;
            }

            this.stopAutoRefresh();

            if (this.refreshAnimationTimer) {
                clearTimeout(this.refreshAnimationTimer);
                this.refreshAnimationTimer = null;
            }

            if (this.refreshThrottle) {
                clearTimeout(this.refreshThrottle);
                this.refreshThrottle = null;
            }

            EventDispatcher.cleanup();

            this.boundHandlers = {};
            this.listenersAttached = false;
            this.initialized = false;
            this.clearCache();

            this.activity = [];
            this.prevStats = {totalUsers:-1,totalGames:-1,categories:-1,uploads:-1,walletCoins:-1,systemStatus:''};

            EventDispatcher.dispatch('dashboard-destroyed', {});
        }
    };

    if (typeof global.AdminModules === 'undefined') {
        global.AdminModules = {};
    }

    if (!global.AdminModules.dashboard) {
        global.AdminModules.dashboard = Dashboard;
    } else {
        Object.keys(Dashboard).forEach(function(key) {
            global.AdminModules.dashboard[key] = Dashboard[key];
        });
    }
})(typeof window !== 'undefined' ? window : this);
