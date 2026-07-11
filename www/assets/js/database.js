const Database = (() => {
    'use strict';

    const JSON_PATH = 'assets/data/games.json';

    const VALID_CATEGORIES = [
        'adventure',
        'puzzle',
        'arcade',
        'racing',
        'casual',
        'strategy'
    ];

    const REQUIRED_GAME_FIELDS = [
        'id',
        'title',
        'description',
        'category',
        'difficulty',
        'reward',
        'featured',
        'recommended',
        'newGame',
        'comingSoon',
        'enabled',
        'themeColor',
        'themeGradient'
    ];

    let _cache = null;
    let _idIndex = null;
    let _categoryIndex = null;
    let _ready = false;
    let _loading = false;
    let _loadError = null;

    const FALLBACK_DATA = Object.freeze({
        version: '1.0',
        games: []
    });

    function _validateDataStructure(data) {
        if (!data || typeof data !== 'object') {
            console.error('[Database] Invalid data: Expected an object.');
            return false;
        }

        if (!Array.isArray(data.games)) {
            console.error('[Database] Invalid data: "games" must be an array.');
            return false;
        }

        for (let i = 0; i < data.games.length; i++) {
            const game = data.games[i];
            if (!game || typeof game !== 'object') {
                console.error('[Database] Invalid game at index ' + i + ': Expected an object.');
                return false;
            }

            for (let j = 0; j < REQUIRED_GAME_FIELDS.length; j++) {
                if (!(REQUIRED_GAME_FIELDS[j] in game)) {
                    console.error('[Database] Game "' + (game.id || 'unknown') + '" missing required field: "' + REQUIRED_GAME_FIELDS[j] + '"');
                    return false;
                }
            }

            if (game.id === undefined || game.id === null || String(game.id).trim() === '') {
                console.error('[Database] Game at index ' + i + ' has an invalid "id".');
                return false;
            }

            if (typeof game.reward !== 'number' || game.reward < 0) {
                console.error('[Database] Game "' + game.id + '" has an invalid "reward" value.');
                return false;
            }
        }

        return true;
    }

    function _processData(data) {
        const processedGames = new Array(data.games.length);

        for (let i = 0; i < data.games.length; i++) {
            const game = data.games[i];

            processedGames[i] = Object.freeze({
                id: String(game.id).trim(),
                title: String(game.title || '').trim(),
                description: String(game.description || '').trim(),
                category: String(game.category || 'casual').trim(),
                difficulty: String(game.difficulty || 'Easy').trim(),
                thumbnailURL: String(game.thumbnailURL || '').trim(),
                iconURL: String(game.iconURL || '').trim(),
                bannerURL: String(game.bannerURL || '').trim(),
                gameURL: String(game.gameURL || '').trim(),
                reward: Math.max(0, Math.floor(game.reward || 0)),
                featured: Boolean(game.featured),
                recommended: Boolean(game.recommended),
                newGame: Boolean(game.newGame),
                comingSoon: Boolean(game.comingSoon),
                enabled: Boolean(game.enabled),
                themeColor: String(game.themeColor || '#2DB87B').trim(),
                themeGradient: String(game.themeGradient || 'linear-gradient(135deg, #2DB87B 0%, #34D399 100%)').trim(),
                releaseDate: String(game.releaseDate || '').trim(),
                tags: Array.isArray(game.tags) ? Object.freeze(game.tags.map(t => String(t).trim())) : Object.freeze([])
            });
        }

        return Object.freeze({
            version: String(data.version || '1.0').trim(),
            games: Object.freeze(processedGames)
        });
    }

    function _buildIndexes(processedData) {
        _idIndex = new Map();
        _categoryIndex = new Map();

        for (let i = 0; i < VALID_CATEGORIES.length; i++) {
            _categoryIndex.set(VALID_CATEGORIES[i], []);
        }

        for (let i = 0; i < processedData.games.length; i++) {
            const game = processedData.games[i];

            _idIndex.set(game.id, game);

            if (_categoryIndex.has(game.category)) {
                _categoryIndex.get(game.category).push(game);
            } else {
                _categoryIndex.set(game.category, [game]);
            }
        }

        for (const [key, value] of _categoryIndex.entries()) {
            _categoryIndex.set(key, Object.freeze(value));
        }
    }

    async function init() {
        if (_ready || _loading) {
            return _ready;
        }

        _loading = true;
        _loadError = null;

        try {
            const response = await fetch(JSON_PATH);

            if (!response.ok) {
                throw new Error('HTTP ' + response.status + ': ' + response.statusText);
            }

            const data = await response.json();

            if (!_validateDataStructure(data)) {
                throw new Error('Data validation failed. Check console for details.');
            }

            _cache = _processData(data);
            _buildIndexes(_cache);
            _ready = true;

            console.info('[Database] Loaded ' + _cache.games.length + ' games (v' + _cache.version + ') with O(1) indexes built.');

        } catch (error) {
            _loadError = error;
            _ready = false;
            _cache = FALLBACK_DATA;
            _idIndex = new Map();
            _categoryIndex = new Map();

            console.error('[Database] Failed to load games.json:', error.message);
            console.warn('[Database] Using fallback empty data to prevent app crash.');
        } finally {
            _loading = false;
        }

        return _ready;
    }

    function isReady() {
        return _ready;
    }

    function hasError() {
        return _loadError !== null;
    }

    function getError() {
        return _loadError;
    }

    function getVersion() {
        return _cache ? _cache.version : FALLBACK_DATA.version;
    }

    function getGames() {
        if (!_cache) {
            return FALLBACK_DATA.games;
        }
        return Array.from(_cache.games);
    }

    function getGameById(id) {
        if (!_idIndex || !id) {
            return null;
        }
        return _idIndex.get(String(id).trim()) || null;
    }

    function getGamesByCategory(category) {
        if (!_categoryIndex || !category) {
            return [];
        }
        const games = _categoryIndex.get(String(category).trim());
        if (!games) {
            return [];
        }
        return Array.from(games);
    }

    function getCategories() {
        return Array.from(VALID_CATEGORIES);
    }

    function getTotalCount() {
        return _cache ? _cache.games.length : 0;
    }

    function clearCache() {
        _cache = null;
        _idIndex = null;
        _categoryIndex = null;
        _ready = false;
        _loading = false;
        _loadError = null;
    }

    return Object.freeze({
        init,
        isReady,
        hasError,
        getError,
        getVersion,
        getGames,
        getGameById,
        getGamesByCategory,
        getCategories,
        getTotalCount,
        clearCache
    });
})();
