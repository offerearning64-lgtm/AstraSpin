/**
 * AstraSpin Admin Panel - Module Loader v11.0.0
 * Simple & Reliable
 */

(function(global) {
    'use strict';

    if (typeof global.AdminModules === 'undefined') {
        global.AdminModules = {};
    }

    var ModuleLoader = {
        register: function(name, module) {
            if (name && module) {
                global.AdminModules[name] = module;
                console.log(`[ModuleLoader] Registered: ${name}`);
            }
        }
    };

    global.ModuleLoader = ModuleLoader;

    // Log all modules after full load
    window.addEventListener('load', function() {
        setTimeout(function() {
            console.log('[ModuleLoader] All Modules:', Object.keys(global.AdminModules));
        }, 1200);
    });
})(window);
