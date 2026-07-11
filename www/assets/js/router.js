/* ==========================================================================
   AstraSpin - Router
   File: assets/js/router.js
   Navigation, page switching, screen transitions, event binding, history.
   ========================================================================== */

const Router = (() => {
    let _history = ['home'];

    /**
     * Initialize all event listeners for navigation and interactions.
     */
    function init() {
        _bindBottomNav();
        _bindSectionActions();
        _bindHeroPlay();
        _bindModalControls();
        _bindDailyBonus();
        _bindSettingsToggles();
        _bindHeaderButtons();
        _bindRewardActions();
        _bindProfileActions();
        _bindKeyboardNav();
    }

    /* --- Bottom Navigation --- */

    function _bindBottomNav() {
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', () => {
                const page = item.dataset.page;
                if (page) {
                    _pushHistory(page);
                    UI.navigateTo(page);
                }
            });
        });
    }

    /* --- Section "See All" Links --- */

    function _bindSectionActions() {
        document.querySelectorAll('.section-action').forEach(btn => {
            btn.addEventListener('click', () => {
                const page = btn.dataset.nav;
                if (page) {
                    _pushHistory(page);
                    UI.navigateTo(page);
                }
            });
        });
    }

    /* --- Hero Play Button --- */

    function _bindHeroPlay() {
        const heroBtn = Helpers.el('hero-play-btn');
        if (heroBtn) {
            heroBtn.addEventListener('click', () => {
                const gameId = heroBtn.dataset.gameId;
                if (gameId) UI.launchGame(gameId);
            });
        }
    }

    /* --- Modal Controls --- */

    function _bindModalControls() {
        const overlay = Helpers.el('modal-overlay');
        const closeBtn = Helpers.el('modal-close');
        const playBtn = Helpers.el('modal-play-btn');

        if (overlay) overlay.addEventListener('click', () => UI.closeGameDetail());
        if (closeBtn) closeBtn.addEventListener('click', () => UI.closeGameDetail());

        if (playBtn) {
            playBtn.addEventListener('click', () => {
                const gameId = playBtn.dataset.gameId;
                if (gameId) UI.launchGame(gameId);
            });
        }
    }

    /* --- Daily Bonus --- */

    function _bindDailyBonus() {
        const bonusBtn = Helpers.el('bonus-claim-btn');
        if (bonusBtn) {
            bonusBtn.addEventListener('click', () => Wallet.claimDailyBonus());
        }
    }

    /* --- Settings Toggles --- */

    function _bindSettingsToggles() {
        document.querySelectorAll('.toggle').forEach(toggle => {
            toggle.addEventListener('click', () => {
                toggle.classList.toggle('active');
                const setting = toggle.dataset.setting;
                const settings = Storage.getSettings();
                settings[setting] = toggle.classList.contains('active');
                Storage.setSettings(settings);
            });
        });
    }

    /* --- Header Buttons --- */

    function _bindHeaderButtons() {
        const settingsBtn = Helpers.el('btn-settings-header');
        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => UI.navigateTo('profile'));
        }

        const notifBtn = Helpers.el('btn-notifications');
        if (notifBtn) {
            notifBtn.addEventListener('click', () => UI.navigateTo('rewards'));
        }
    }

    /* --- Reward Action Buttons --- */

    function _bindRewardActions() {
        _bindButton('btn-daily-mission', 'Daily Missions coming soon!');
        _bindButton('btn-lucky-spin', 'Lucky Spin coming soon!');
        _bindButton('btn-achievements', 'Achievements coming soon!');
    }

    /* --- Profile Action Buttons --- */

    function _bindProfileActions() {
        _bindButton('btn-login', 'Sign In coming soon!');
        _bindButton('btn-cloud-save', 'Cloud Save coming soon!');
        _bindButton('btn-referral', 'Referral Program coming soon!');
        _bindButton('btn-privacy', 'Privacy Policy coming soon!');
    }

    /* --- Helper: Bind a button to a toast message --- */

    function _bindButton(id, message) {
        const btn = Helpers.el(id);
        if (btn) {
            btn.addEventListener('click', () => UI.showToast(message));
        }
    }

    /* --- Keyboard Navigation (Accessibility) --- */

    function _bindKeyboardNav() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                UI.closeGameDetail();
            }
        });
    }

    /* --- History Management (Future Deep Linking) --- */

    function _pushHistory(page) {
        if (_history[_history.length - 1] !== page) {
            _history.push(page);
        }
        /* Future: window.history.pushState for deep linking */
    }

    function goBack() {
        if (_history.length > 1) {
            _history.pop();
            const prev = _history[_history.length - 1];
            UI.navigateTo(prev);
        }
    }

    function getHistory() {
        return [..._history];
    }

    /* Public API */
    return Object.freeze({
        init,
        goBack,
        getHistory,
    });
})();

