
/* ==========================================================================
   AstraSpin - Game Data System
   File: assets/js/games.js
   Game data layer. Retrieves data from Database API instead of hardcoded array.
   Future developers only need to update games.json to add games. No HTML editing.
   ========================================================================== */

const GameData = (() => {
    /**
     * Category definitions.
     * To add a category: add an object here and an icon in Helpers.categoryIcons.
     */
    const categories = [
        { id: 'all', name: 'All', color: '#2DB87B' },
        { id: 'adventure', name: 'Adventure', color: '#2DB87B' },
        { id: 'puzzle', name: 'Puzzle', color: '#FF8A3D' },
        { id: 'arcade', name: 'Arcade', color: '#4CA8E8' },
        { id: 'racing', name: 'Racing', color: '#EF4444' },
        { id: 'casual', name: 'Casual', color: '#A855F7' },
        { id: 'strategy', name: 'Strategy', color: '#F59E0B' },
    ];

    function getById(id) {
        return Database.getGameById(id);
    }

    function getEnabled() {
        const games = Database.getGames();
        return games.filter(g => g.enabled && !g.comingSoon);
    }

    function getFeatured() {
        return getEnabled().filter(g => g.featured);
    }

    function getPopular() {
        return getEnabled().filter(g => g.popular);
    }

    function getRecommended() {
        return getEnabled().filter(g => g.recommended);
    }

    function getRecentlyAdded() {
        return getEnabled().filter(g => g.newGame);
    }

    function getByCategory(catId) {
        if (catId === 'all') return getEnabled();
        return Database.getGamesByCategory(catId).filter(g => g.enabled && !g.comingSoon);
    }

    function getCategories() {
        return categories;
    }

    function getCategoryById(catId) {
        return categories.find(c => c.id === catId) || categories[0];
    }

    /* Public API */
    return Object.freeze({
        categories,
        /**
         * Backward compatibility getter for GameData.games.
         * Always returns the latest data from Database without caching stale copies.
         */
        get games() {
            return Database.getGames();
        },
        getById,
        getEnabled,
        getFeatured,
        getPopular,
        getRecommended,
        getRecentlyAdded,
        getByCategory,
        getCategories,
        getCategoryById,
    });
})();
