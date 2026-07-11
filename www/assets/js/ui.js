/* ==========================================================================
   AstraSpin - UI Controller
   File: assets/js/ui.js
   Rendering, cards, categories, sections, dynamic creation, toast, modal.
   Never duplicate HTML. All dynamic DOM creation happens here.
   ========================================================================== */

const UI = (() => {
    let _currentPage = 'home';
    let _currentFilter = 'all';
    let _toastTimeout = null;

    /* ======================================================================
       TOAST NOTIFICATION
       ====================================================================== */

    function showToast(message, duration) {
        duration = duration || AppConfig.durations.toastDuration;
        const toast = Helpers.el('toast');
        if (!toast) return;
        toast.textContent = message;
        toast.classList.add('show');
        if (_toastTimeout) clearTimeout(_toastTimeout);
        _toastTimeout = setTimeout(() => {
            toast.classList.remove('show');
        }, duration);
    }

    /* ======================================================================
       PAGE NAVIGATION
       ====================================================================== */

    async function navigateTo(pageName) {
        if (_currentPage === pageName) return;

        Loading.showPageLoader();
        await Helpers.wait(AppConfig.durations.pageLoaderMin);

        /* Hide all pages */
        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));

        /* Show target page */
        const target = Helpers.el('page-' + pageName);
        if (target) target.classList.add('active');

        /* Update nav */
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.toggle('active', item.dataset.page === pageName);
        });

        _currentPage = pageName;

        /* Scroll to top */
        window.scrollTo({ top: 0, behavior: 'instant' });

        /* Render page content */
        renderPage(pageName);

        await Helpers.wait(AppConfig.durations.pageLoaderExtra);
        Loading.hidePageLoader();

        /* Trigger scroll animations */
        setTimeout(() => Animations.triggerScrollAnimations(), 100);
    }

    function getCurrentPage() {
        return _currentPage;
    }

    /* ======================================================================
       PAGE RENDERERS
       ====================================================================== */

    function renderPage(pageName) {
        switch (pageName) {
            case 'home': renderHome(); break;
            case 'games': renderGamesPage(); break;
            case 'rewards': renderRewardsPage(); break;
            case 'wallet': renderWalletPage(); break;
            case 'profile': renderProfilePage(); break;
        }
    }

    /* --- HOME PAGE --- */

    function renderHome() {
        renderHero();
        renderCategories();
        renderGameScroll('featured-games', GameData.getFeatured(), 'lg');
        Wallet.checkDailyBonus();
        renderGameScroll('popular-games', GameData.getPopular());
        renderGameScroll('recommended-games', GameData.getRecommended());
        renderGameScroll('recent-games', GameData.getRecentlyAdded());
    }

    function renderHero() {
        const featured = GameData.getFeatured();
        if (featured.length === 0) return;
        const game = featured[0];

        const heroTitle = Helpers.el('hero-title');
        const heroDesc = Helpers.el('hero-desc');
        const heroBtn = Helpers.el('hero-play-btn');
        const heroCard = Helpers.el('hero-card');

        if (heroTitle) heroTitle.textContent = game.title;
        if (heroDesc) heroDesc.textContent = game.description;
        if (heroBtn) heroBtn.dataset.gameId = game.id;
        if (heroCard) heroCard.style.background = game.themeGradient;
    }

    /* --- CATEGORIES --- */

    function renderCategories() {
        const container = Helpers.el('categories-scroll');
        if (!container) return;
        container.innerHTML = '';

        GameData.getCategories().forEach(cat => {
            const chip = document.createElement('button');
            chip.className = 'category-chip' + (cat.id === 'all' ? ' active' : '');
            chip.dataset.category = cat.id;
            const iconSvg = Helpers.categoryIcons[cat.id] || Helpers.categoryIcons.all;
            chip.innerHTML = iconSvg + '<span>' + cat.name + '</span>';
            chip.addEventListener('click', () => {
                document.querySelectorAll('.category-chip').forEach(c => c.classList.remove('active'));
                chip.classList.add('active');
                navigateTo('games').then(() => filterGames(cat.id));
            });
            container.appendChild(chip);
        });
    }

    /* --- GAME SCROLL SECTIONS --- */

    function renderGameScroll(containerId, games, size) {
        size = size || 'sm';
        const container = Helpers.el(containerId);
        if (!container) return;
        container.innerHTML = '';

        if (games.length === 0) {
            container.innerHTML = '<p style="color:var(--text-muted);font-size:0.8125rem;padding:16px 0;">No games available</p>';
            return;
        }

        const fragment = document.createDocumentFragment();
        games.forEach(game => {
            fragment.appendChild(createGameCard(game, size));
        });
        container.appendChild(fragment);
    }

    /* ======================================================================
       GAME CARD CREATION
       Single source of truth for game card HTML. Never duplicated.
       ====================================================================== */

    function createGameCard(game, size) {
        const isLarge = size === 'lg';
        const card = document.createElement('div');
        card.className = isLarge ? 'game-card-lg' : 'game-card';
        card.dataset.gameId = game.id;

        const isFav = Storage.isFavorite(game.id);

        /* Determine badge */
        let badgeHTML = '';
        if (game.comingSoon) {
            badgeHTML = '<div class="game-card-badge" style="background:var(--text-muted);">Soon</div>';
        } else if (game.newGame) {
            badgeHTML = '<div class="game-card-badge badge-new">New</div>';
        } else if (game.featured) {
            badgeHTML = '<div class="game-card-badge badge-featured">Featured</div>';
        }

        const thumbContent = game.thumbnailURL
            ? '<img src="' + game.thumbnailURL + '" alt="' + game.title + '" style="width:100%;height:100%;object-fit:cover;">'
            : '<div class="game-card-thumb-placeholder" style="background:' + game.themeGradient + ';">' + Helpers.icons.play + '</div>';

        const favSvg = isFav ? Helpers.icons.heartFilled : Helpers.icons.heart;

        card.innerHTML = 
            '<div class="game-card-thumb">' +
                thumbContent +
                badgeHTML +
                '<button class="game-card-fav ' + (isFav ? 'active' : '') + '" data-fav-id="' + game.id + '" aria-label="Favorite">' +
                    favSvg +
                '</button>' +
            '</div>' +
            '<div class="game-card-body">' +
                '<div class="game-card-title">' + game.title + '</div>' +
                '<div class="game-card-desc">' + game.description + '</div>' +
                '<div class="game-card-footer">' +
                    '<div class="game-card-meta">' +
                        Helpers.icons.reward +
                        '+' + game.reward +
                    '</div>' +
                    '<button class="game-card-play" data-play-id="' + game.id + '" aria-label="Play ' + game.title + '">' +
                        Helpers.icons.playSmall +
                    '</button>' +
                '</div>' +
            '</div>';

        /* Card click -> detail modal */
        card.addEventListener('click', (e) => {
            if (e.target.closest('.game-card-fav') || e.target.closest('.game-card-play')) return;
            openGameDetail(game.id);
        });

        /* Favorite toggle */
        const favBtn = card.querySelector('.game-card-fav');
        if (favBtn) {
            favBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                toggleFavorite(game.id, favBtn);
            });
        }

        /* Play button */
        const playBtn = card.querySelector('.game-card-play');
        if (playBtn) {
            playBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                launchGame(game.id);
            });
        }

        return card;
    }

    /* --- FAVORITE TOGGLE --- */

    function toggleFavorite(gameId, btn) {
        if (Storage.isFavorite(gameId)) {
            Storage.removeFavorite(gameId);
            btn.classList.remove('active');
            btn.innerHTML = Helpers.icons.heart;
            showToast('Removed from favorites');
        } else {
            Storage.addFavorite(gameId);
            btn.classList.add('active');
            btn.innerHTML = Helpers.icons.heartFilled;
            showToast('Added to favorites');
        }
    }

    /* ======================================================================
       GAME DETAIL MODAL
       ====================================================================== */

    function openGameDetail(gameId) {
        const game = GameData.getById(gameId);
        if (!game) return;

        const thumb = Helpers.el('modal-thumb');
        const thumbPlaceholder = Helpers.el('modal-thumb-placeholder');
        const title = Helpers.el('modal-title');
        const category = Helpers.el('modal-category');
        const desc = Helpers.el('modal-desc');
        const reward = Helpers.el('modal-reward');
        const difficulty = Helpers.el('modal-difficulty');
        const categoryStat = Helpers.el('modal-category-stat');
        const playBtn = Helpers.el('modal-play-btn');

        if (thumb) thumb.style.background = game.themeGradient;
        if (thumbPlaceholder) {
            thumbPlaceholder.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="width:56px;height:56px;opacity:0.3;"><polygon points="5 3 19 12 5 21 5 3"/></svg>';
        }
        if (title) title.textContent = game.title;
        if (category) {
            const catSpan = category.querySelector('span');
            if (catSpan) catSpan.textContent = Helpers.capitalize(game.category);
        }
        if (desc) desc.textContent = game.description;
        if (reward) reward.textContent = '+' + game.reward;
        if (difficulty) difficulty.textContent = game.difficulty;
        if (categoryStat) categoryStat.textContent = Helpers.capitalize(game.category);
        if (playBtn) playBtn.dataset.gameId = game.id;

        const overlay = Helpers.el('modal-overlay');
        const sheet = Helpers.el('modal-sheet');
        if (overlay) overlay.classList.add('active');
        if (sheet) sheet.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeGameDetail() {
        const overlay = Helpers.el('modal-overlay');
        const sheet = Helpers.el('modal-sheet');
        if (overlay) overlay.classList.remove('active');
        if (sheet) sheet.classList.remove('active');
        document.body.style.overflow = '';
    }

    /* ======================================================================
       GAME LAUNCH (With Ad Attempt)
       ====================================================================== */

    async function launchGame(gameId) {
        const game = GameData.getById(gameId);
        if (!game) return;
        if (!game.enabled || game.comingSoon) {
            showToast('This game is not available yet');
            return;
        }

        closeGameDetail();
        Loading.showGameLoader(game.title);

        /* Step 1: Attempt advertisement */
        const adShown = await AdManager.showInterstitialOrSkip();

        if (adShown) {
            Loading.showAdLoader();
            await Helpers.wait(AppConfig.durations.adSimulatedWait);
        }

        /* Step 2: Launch game */
        Loading.updateText('Starting game...');
        await Helpers.wait(AppConfig.durations.gameLoadSimulated);

        /* Future: Open game in fullscreen WebView/iframe */
        /* if (game.gameURL) { window.open(game.gameURL, '_blank'); } */

        Loading.hidePageLoader();

        /* Award coins */
        Wallet.addCoins(game.reward, game.title + ' Reward');

        /* Track recent game */
        Storage.addRecentGame(game.id);

        /* Update profile stats */
        const profile = Storage.getProfile();
        profile.gamesPlayed = (profile.gamesPlayed || 0) + 1;
        profile.level = Math.floor(profile.gamesPlayed / AppConfig.leveling.gamesPerLevel) + 1;
        Storage.setProfile(profile);
    }

    /* ======================================================================
       GAMES PAGE
       ====================================================================== */

    function renderGamesPage() {
        renderGamesFilter();
        renderGamesGrid(_currentFilter);
    }

    function renderGamesFilter() {
        const container = Helpers.el('games-filter');
        if (!container) return;
        container.innerHTML = '';

        GameData.getCategories().forEach(cat => {
            const chip = document.createElement('button');
            chip.className = 'filter-chip' + (cat.id === _currentFilter ? ' active' : '');
            chip.textContent = cat.name;
            chip.dataset.category = cat.id;
            chip.addEventListener('click', () => {
                filterGames(cat.id);
            });
            container.appendChild(chip);
        });
    }

    function filterGames(categoryId) {
        _currentFilter = categoryId;
        document.querySelectorAll('.filter-chip').forEach(c => {
            c.classList.toggle('active', c.dataset.category === categoryId);
        });
        renderGamesGrid(categoryId);
    }

    function renderGamesGrid(categoryId) {
        const container = Helpers.el('games-grid');
        if (!container) return;
        container.innerHTML = '';

        const games = GameData.getByCategory(categoryId);
        if (games.length === 0) {
            container.innerHTML = '<p style="color:var(--text-muted);font-size:0.8125rem;padding:32px 0;text-align:center;grid-column:1/-1;">No games in this category</p>';
            return;
        }

        const fragment = document.createDocumentFragment();
        games.forEach(game => {
            fragment.appendChild(createGameCard(game, 'sm'));
        });
        container.appendChild(fragment);
    }

    /* ======================================================================
       REWARDS PAGE
       ====================================================================== */

    function renderRewardsPage() {
        Wallet.updateUI();
        renderRewardHistory();
    }

    function renderRewardHistory() {
        const container = Helpers.el('reward-history-list');
        if (!container) return;
        const history = Storage.getRewardHistory();

        if (history.length === 0) {
            container.innerHTML = '<p style="color:var(--text-muted);font-size:0.8125rem;padding:16px 0;text-align:center;">Play games to earn rewards</p>';
            return;
        }

        container.innerHTML = '';
        const fragment = document.createDocumentFragment();

        history.forEach(item => {
            const isCredit = item.type === 'credit';
            const el = document.createElement('div');
            el.className = 'reward-history-item';
            el.innerHTML = 
                '<div class="reward-history-icon" style="background:' + (isCredit ? 'var(--green-light)' : 'var(--orange-light)') + ';">' +
                    (isCredit
                        ? '<svg viewBox="0 0 24 24" fill="none" stroke="var(--green-primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:18px;height:18px;"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>'
                        : '<svg viewBox="0 0 24 24" fill="none" stroke="var(--orange-primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:18px;height:18px;"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>'
                    ) +
                '</div>' +
                '<div class="reward-history-info">' +
                    '<div class="reward-history-title">' + item.title + '</div>' +
                    '<div class="reward-history-time">' + Helpers.formatTimeAgo(item.date) + '</div>' +
                '</div>' +
                '<div class="reward-history-amount ' + (isCredit ? 'positive' : 'negative') + '">' + item.amount + '</div>';
            fragment.appendChild(el);
        });

        container.appendChild(fragment);
    }

    /* ======================================================================
       WALLET PAGE
       ====================================================================== */

    function renderWalletPage() {
        Wallet.updateUI();
        renderTransactions();
    }

    function renderTransactions() {
        const container = Helpers.el('wallet-transactions');
        if (!container) return;
        const txs = Storage.getTransactions();

        if (txs.length === 0) {
            container.innerHTML = '<p style="color:var(--text-muted);font-size:0.8125rem;padding:32px 0;text-align:center;">No transactions yet</p>';
            return;
        }

        container.innerHTML = '';
        const fragment = document.createDocumentFragment();

        txs.forEach(tx => {
            const isCredit = tx.type === 'credit';
            const el = document.createElement('div');
            el.className = 'wallet-tx-item';
            el.innerHTML = 
                '<div class="wallet-tx-icon" style="background:' + (isCredit ? 'var(--green-light)' : 'var(--orange-light)') + ';">' +
                    (isCredit ? Helpers.icons.arrowUp : Helpers.icons.arrowDown) +
                '</div>' +
                '<div class="wallet-tx-info">' +
                    '<div class="wallet-tx-title">' + tx.source + '</div>' +
                    '<div class="wallet-tx-date">' + Helpers.formatDate(tx.date) + '</div>' +
                '</div>' +
                '<div class="wallet-tx-amount" style="color:' + (isCredit ? 'var(--green-primary)' : 'var(--text-secondary)') + ';">' +
                    (isCredit ? '+' : '-') + tx.amount +
                '</div>';
            fragment.appendChild(el);
        });

        container.appendChild(fragment);
    }

    /* ======================================================================
       PROFILE PAGE
       ====================================================================== */

    function renderProfilePage() {
        const profile = Storage.getProfile();
        const wallet = Storage.getWallet();

        const nameEl = Helpers.el('profile-name');
        const idEl = Helpers.el('profile-id');
        const gamesEl = Helpers.el('stat-games');
        const coinsEl = Helpers.el('stat-coins');
        const levelEl = Helpers.el('stat-level');
        const versionEl = Helpers.el('app-version-display');

        if (nameEl) nameEl.textContent = profile.name;
        if (idEl) idEl.textContent = 'ID: ' + profile.id;
        if (gamesEl) gamesEl.textContent = profile.gamesPlayed || 0;
        if (coinsEl) coinsEl.textContent = wallet.balance || 0;
        if (levelEl) levelEl.textContent = profile.level || 1;
        if (versionEl) versionEl.textContent = AppConfig.version;

        /* Settings toggles */
        const settings = Storage.getSettings();
        updateToggle('toggle-sound', settings.sound);
        updateToggle('toggle-music', settings.music);
        updateToggle('toggle-notifications', settings.notifications);
    }

    function updateToggle(id, value) {
        const toggle = Helpers.el(id);
        if (toggle) toggle.classList.toggle('active', value);
    }

    /* ======================================================================
       PUBLIC API
       ====================================================================== */

    return Object.freeze({
        showToast,
        navigateTo,
        getCurrentPage,
        renderPage,
        renderHome,
        renderGamesPage,
        renderRewardsPage,
        renderWalletPage,
        renderProfilePage,
        renderGameScroll,
        renderGamesGrid,
        createGameCard,
        openGameDetail,
        closeGameDetail,
        launchGame,
        filterGames,
        toggleFavorite,
        updateToggle,
    });
})();
