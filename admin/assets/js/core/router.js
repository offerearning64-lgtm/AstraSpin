/**
 * AstraSpin Admin Panel - Router v11.0.0
 * data-page system preserved
 */

(function(global) {
    'use strict';

    var Router = {
        init: function() {
            this.attachListeners();
        },

        attachListeners: function() {
            var self = this;
            
            document.addEventListener('click', function(e) {
                var btn = e.target.closest('[data-page]');
                if (!btn) return;

                var page = btn.getAttribute('data-page');
                if (!page) return;

                e.preventDefault();
                self.navigate(page);
            });
        },

        navigate: function(page) {
            console.log(`[Router] Navigating to: ${page}`);

            if (!global.AdminModules) {
                console.error('[Router] AdminModules not available');
                return;
            }

            var module = global.AdminModules[page];

            if (!module) {
                console.error(`[Router] Module "${page}" not found! Check script loading order.`);
                alert(`Module "${page}" not loaded. Please refresh the page.`);
                return;
            }

            if (typeof module.init === 'function') {
                try {
                    module.init();
                } catch (err) {
                    console.error(`[Router] Error in ${page}.init():`, err);
                }
            } else {
                console.warn(`[Router] ${page} has no init() method`);
            }
        }
    };

    // Initialize router
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => Router.init());
    } else {
        Router.init();
    }

    global.AdminRouter = Router;
})(window);
