/**
 * AstraSpin Admin Panel - Main App v11.0.0
 * Mobile Optimized - Fixed Module Loading
 */

(function(global) {
    'use strict';

    console.log('%c[AstraSpin] v11.0.0 Initializing...', 'color:#6366f1;font-weight:bold');

    var App = {
        init: function() {
            console.log('[App] DOM ready. Initializing Dashboard...');
            
            if (global.AdminModules && global.AdminModules.dashboard) {
                global.AdminModules.dashboard.init();
            } else {
                console.error('[App] Dashboard module not found!');
            }
        }
    };

    // Initialize after all scripts load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', App.init);
    } else {
        App.init();
    }

    global.AstraSpinApp = App;
})(window);
