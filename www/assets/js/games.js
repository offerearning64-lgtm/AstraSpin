/* ==========================================================================
   AstraSpin - Game Data System
   File: assets/js/games.js
   Structured game data. Add a new object to add a game. No HTML editing.
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

    /**
     * Game database.
     * Each game supports: id, title, description, thumbnailURL, iconURL,
     * gameURL, reward, category, difficulty, featured, recommended,
     * newGame, comingSoon, enabled, themeColor, themeGradient.
     *
     * To add a game: simply add an object below. The UI will auto-render it.
     * To change a title: edit the title field below. One place only.
     * To change a reward: edit the reward field below. One place only.
     */
    const games = [
        {
            id: 'jungle-quest',
            title: 'Jungle Quest',
            description: 'Embark on an epic adventure through mystical jungle temples and discover ancient treasures hidden for centuries.',
            thumbnailURL: '',  // Future: 'assets/images/games/jungle-quest-thumb.png'
            iconURL: '',       // Future: 'assets/images/games/jungle-quest-icon.png'
            gameURL: '',       // Future: URL or route for the game
            reward: 100,
            category: 'adventure',
            difficulty: 'Medium',
            featured: true,
            recommended: true,
            newGame: false,
            comingSoon: false,
            enabled: true,
            themeColor: '#2DB87B',
            themeGradient: 'linear-gradient(135deg, #2DB87B 0%, #34D399 100%)',
        },
        {
            id: 'crystal-match',
            title: 'Crystal Match',
            description: 'Match colorful crystals to solve challenging puzzles and unlock magical powers in this addicting brain teaser.',
            thumbnailURL: '',
            iconURL: '',
            gameURL: '',
            reward: 50,
            category: 'puzzle',
            difficulty: 'Easy',
            featured: true,
            recommended: true,
            newGame: false,
            comingSoon: false,
            enabled: true,
            themeColor: '#FF8A3D',
            themeGradient: 'linear-gradient(135deg, #FF8A3D 0%, #FFB86C 100%)',
        },
        {
            id: 'sky-runner',
            title: 'Sky Runner',
            description: 'Dash through floating islands in the sky, collect coins and power-ups while avoiding obstacles at high speed.',
            thumbnailURL: '',
            iconURL: '',
            gameURL: '',
            reward: 75,
            category: 'arcade',
            difficulty: 'Hard',
            featured: true,
            recommended: false,
            newGame: true,
            comingSoon: false,
            enabled: true,
            themeColor: '#4CA8E8',
            themeGradient: 'linear-gradient(135deg, #4CA8E8 0%, #7CC4F5 100%)',
        },
        {
            id: 'tempo-rush',
            title: 'Tempo Rush',
            description: 'Race against time in this fast-paced runner with dynamic tracks and thrilling speed boosts.',
            thumbnailURL: '',
            iconURL: '',
            gameURL: '',
            reward: 80,
            category: 'racing',
            difficulty: 'Hard',
            featured: false,
            recommended: true,
            newGame: true,
            comingSoon: false,
            enabled: true,
            themeColor: '#EF4444',
            themeGradient: 'linear-gradient(135deg, #EF4444 0%, #F87171 100%)',
        },
        {
            id: 'bubble-pop',
            title: 'Bubble Pop',
            description: 'Pop colorful bubbles in this relaxing casual game with surprising depth and satisfying combos.',
            thumbnailURL: '',
            iconURL: '',
            gameURL: '',
            reward: 30,
            category: 'casual',
            difficulty: 'Easy',
            featured: false,
            recommended: true,
            newGame: false,
            comingSoon: false,
            enabled: true,
            themeColor: '#A855F7',
            themeGradient: 'linear-gradient(135deg, #A855F7 0%, #C084FC 100%)',
        },
        {
            id: 'tower-defend',
            title: 'Tower Defend',
            description: 'Build strategic towers and defend your kingdom from waves of enemies in this classic strategy game.',
            thumbnailURL: '',
            iconURL: '',
            gameURL: '',
            reward: 60,
            category: 'strategy',
            difficulty: 'Medium',
            featured: false,
            recommended: true,
            newGame: false,
            comingSoon: false,
            enabled: true,
            themeColor: '#F59E0B',
            themeGradient: 'linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)',
        },
        {
            id: 'ocean-dive',
            title: 'Ocean Dive',
            description: 'Dive deep into the ocean and explore underwater worlds filled with colorful fish and hidden artifacts.',
            thumbnailURL: '',
            iconURL: '',
            gameURL: '',
            reward: 45,
            category: 'adventure',
            difficulty: 'Easy',
            featured: false,
            recommended: false,
            newGame: true,
            comingSoon: false,
            enabled: true,
            themeColor: '#06B6D4',
            themeGradient: 'linear-gradient(135deg, #06B6D4 0%, #22D3EE 100%)',
        },
        {
            id: 'word-craft',
            title: 'Word Craft',
            description: 'Create words from letters and solve crosswords in this educational and entertaining word puzzle game.',
            thumbnailURL: '',
            iconURL: '',
            gameURL: '',
            reward: 35,
            category: 'puzzle',
            difficulty: 'Medium',
            featured: false,
            recommended: true,
            newGame: false,
            comingSoon: false,
            enabled: true,
            themeColor: '#10B981',
            themeGradient: 'linear-gradient(135deg, #10B981 0%, #34D399 100%)',
        },
        {
            id: 'neon-dash',
            title: 'Neon Dash',
            description: 'Sprint through neon-lit cyberpunk cityscapes in this visually stunning fast-paced arcade experience.',
            thumbnailURL: '',
            iconURL: '',
            gameURL: '',
            reward: 90,
            category: 'arcade',
            difficulty: 'Hard',
            featured: true,
            recommended: true,
            newGame: true,
            comingSoon: false,
            enabled: true,
            themeColor: '#EC4899',
            themeGradient: 'linear-gradient(135deg, #EC4899 0%, #F472B6 100%)',
        },
        {
            id: 'farm-harvest',
            title: 'Farm Harvest',
            description: 'Grow crops, raise animals and build the farm of your dreams in this charming casual farming simulator.',
            thumbnailURL: '',
            iconURL: '',
            gameURL: '',
            reward: 25,
            category: 'casual',
            difficulty: 'Easy',
            featured: false,
            recommended: false,
            newGame: false,
            comingSoon: false,
            enabled: true,
            themeColor: '#84CC16',
            themeGradient: 'linear-gradient(135deg, #84CC16 0%, #A3E635 100%)',
        },
    ];

    /* --- Query Methods --- */

    function getById(id) {
        return games.find(g => g.id === id) || null;
    }

    function getEnabled() {
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
        return getEnabled().filter(g => g.category === catId);
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
        games,
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

