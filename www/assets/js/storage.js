/* ==========================================================================
   AstraSpin - Storage Manager
   File: assets/js/storage.js
   Local storage abstraction with typed accessors.
   ========================================================================== */

const Storage = (() => {
    const _prefix = AppConfig.storageKeys.prefix;

    function _key(key) {
        return _prefix + key;
    }

    function set(key, value) {
        try {
            localStorage.setItem(_key(key), JSON.stringify(value));
            return true;
        } catch (e) {
            console.warn('[Storage] Set failed:', e);
            return false;
        }
    }

    function get(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(_key(key));
            return item ? JSON.parse(item) : defaultValue;
        } catch (e) {
            console.warn('[Storage] Get failed:', e);
            return defaultValue;
        }
    }

    function remove(key) {
        try {
            localStorage.removeItem(_key(key));
        } catch (e) {
            console.warn('[Storage] Remove failed:', e);
        }
    }

    /* --- Typed Accessors --- */

    function getWallet() {
        return get(AppConfig.storageKeys.wallet, {
            balance: AppConfig.defaults.startBalance,
            earned: 0,
            spent: 0
        });
    }

    function setWallet(data) {
        set(AppConfig.storageKeys.wallet, data);
    }

    function getProfile() {
        return get(AppConfig.storageKeys.profile, {
            name: AppConfig.defaults.guestName,
            id: AppConfig.defaults.guestId,
            gamesPlayed: 0,
            level: AppConfig.defaults.startLevel
        });
    }

    function setProfile(data) {
        set(AppConfig.storageKeys.profile, data);
    }

    function getFavorites() {
        return get(AppConfig.storageKeys.favorites, []);
    }

    function addFavorite(gameId) {
        const favs = getFavorites();
        if (!favs.includes(gameId)) {
            favs.push(gameId);
            set(AppConfig.storageKeys.favorites, favs);
        }
    }

    function removeFavorite(gameId) {
        let favs = getFavorites();
        favs = favs.filter(id => id !== gameId);
        set(AppConfig.storageKeys.favorites, favs);
    }

    function isFavorite(gameId) {
        return getFavorites().includes(gameId);
    }

    function getSettings() {
        return get(AppConfig.storageKeys.settings, {
            sound: true,
            music: true,
            notifications: true
        });
    }

    function setSettings(data) {
        set(AppConfig.storageKeys.settings, data);
    }

    function getLastBonusDate() {
        return get(AppConfig.storageKeys.lastBonusDate, null);
    }

    function setLastBonusDate(dateStr) {
        set(AppConfig.storageKeys.lastBonusDate, dateStr);
    }

    function getTransactions() {
        return get(AppConfig.storageKeys.transactions, []);
    }

    function addTransaction(tx) {
        const txs = getTransactions();
        txs.unshift(tx);
        if (txs.length > 50) txs.length = 50;
        set(AppConfig.storageKeys.transactions, txs);
    }

    function getRewardHistory() {
        return get(AppConfig.storageKeys.rewardHistory, []);
    }

    function addRewardHistory(item) {
        const history = getRewardHistory();
        history.unshift(item);
        if (history.length > 30) history.length = 30;
        set(AppConfig.storageKeys.rewardHistory, history);
    }

    function getRecentGames() {
        return get(AppConfig.storageKeys.recentGames, []);
    }

    function addRecentGame(gameId) {
        let recent = getRecentGames();
        recent = recent.filter(id => id !== gameId);
        recent.unshift(gameId);
        if (recent.length > 10) recent.length = 10;
        set(AppConfig.storageKeys.recentGames, recent);
    }

    /* Public API */
    return Object.freeze({
        set,
        get,
        remove,
        getWallet,
        setWallet,
        getProfile,
        setProfile,
        getFavorites,
        addFavorite,
        removeFavorite,
        isFavorite,
        getSettings,
        setSettings,
        getLastBonusDate,
        setLastBonusDate,
        getTransactions,
        addTransaction,
        getRewardHistory,
        addRewardHistory,
        getRecentGames,
        addRecentGame,
    });
})();
