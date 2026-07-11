/* ==========================================================================
   AstraSpin - Loading Controller
   File: assets/js/loading.js
   Controls global, page, game, and advertisement loading states.
   ========================================================================== */

const Loading = (() => {
    const _barEl = () => Helpers.el('loader-bar');
    const _textEl = () => Helpers.el('loader-text');
    const _screenEl = () => Helpers.el('loading-screen');
    const _pageLoaderEl = () => Helpers.el('page-loader');
    const _pageLoaderTextEl = () => Helpers.el('page-loader-text');

    /**
     * Run the premium 3-second initial loading animation.
     */
    async function runInitialLoad() {
        const bar = _barEl();
        const text = _textEl();

        for (const step of AppConfig.loadingSteps) {
            await Helpers.wait(AppConfig.durations.loaderStep);
            if (bar) bar.style.width = step.progress + '%';
            if (text) text.textContent = step.label;
        }

        await Helpers.wait(AppConfig.durations.loaderFinalDelay);

        const screen = _screenEl();
        if (screen) screen.classList.add('hidden');
    }

    /**
     * Show the inline page loader overlay.
     * @param {string} text - Loading text to display
     */
    function showPageLoader(text = 'Loading...') {
        const loader = _pageLoaderEl();
        const loaderText = _pageLoaderTextEl();
        if (loaderText) loaderText.textContent = text;
        if (loader) loader.classList.add('active');
    }

    /**
     * Hide the inline page loader overlay.
     */
    function hidePageLoader() {
        const loader = _pageLoaderEl();
        if (loader) loader.classList.remove('active');
    }

    /**
     * Show game-specific loading state.
     * @param {string} gameTitle
     */
    function showGameLoader(gameTitle) {
        showPageLoader('Preparing ' + gameTitle + '...');
    }

    /**
     * Show advertisement loading state.
     */
    function showAdLoader() {
        showPageLoader('Ad playing...');
    }

    /**
     * Update the page loader text.
     * @param {string} text
     */
    function updateText(text) {
        const loaderText = _pageLoaderTextEl();
        if (loaderText) loaderText.textContent = text;
    }

    /* Public API */
    return Object.freeze({
        runInitialLoad,
        showPageLoader,
        hidePageLoader,
        showGameLoader,
        showAdLoader,
        updateText,
    });
})();
