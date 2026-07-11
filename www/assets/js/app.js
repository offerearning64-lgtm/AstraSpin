/* ==========================================================================
   AstraSpin - Application Entry Point
   File: assets/js/app.js
   Initializes all modules and starts the application.
   ========================================================================== */

const AstraSpin = (() => {
    let _initialized = false;

    /**
     * Initialize the entire application.
     * Called on DOMContentLoaded.
     */
    async function init() {
        if (_initialized) return;
        _initialized = true;

        /* 1. Initialize storage & wallet */
        Wallet.init();

        /* 2. Initialize ad manager */
        AdManager.init();

        /* 3. Initialize scroll animation observer */
        Animations.initScrollObserver();

        /* 4. Setup all event listeners via Router */
        Router.init();

        /* 5. Render initial page content */
        UI.renderHome();

        /* 6. Run the premium loading screen animation */
        await Loading.runInitialLoad();

        /* 7. Trigger scroll animations after load */
        setTimeout(() => Animations.triggerScrollAnimations(), 300);

        console.info(`[AstraSpin] v${AppConfig.version} initialized`);
    }

    /* Public API */
    return Object.freeze({
        init,
    });
})();

/* --- Start Application --- */
document.addEventListener('DOMContentLoaded', () => {
    AstraSpin.init();
});

