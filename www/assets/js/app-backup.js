/**
 * AstraSpin - 游戏数据与管理模块
 * 所有游戏在此注册，添加新游戏只需新增一个对象
 * 预留：在线游戏URL、API获取游戏列表
 */

const AstraGames = (() => {
    'use strict';

    const STORAGE_KEY = 'astraspin_play_history';

    /* =========================================
       游戏数据库
       添加新游戏：在数组末尾新增一个对象即可
       ========================================= */
    const GAMES_DB = [
        {
            id: 'neon-racer',
            name: 'Neon Racer',
            icon: '🏎️',
            description: 'High-speed futuristic racing through neon-lit cyberpunk streets. Dodge traffic, collect power-ups, and dominate the leaderboard.',
            category: 'Racing',
            featured: true,
            trending: true,
            reward: 15,
            players: '12.4K',
            gradient: 'linear-gradient(135deg, #FF006E 0%, #8338EC 100%)'
        },
        {
            id: 'pixel-dungeon',
            name: 'Pixel Dungeon',
            icon: '⚔️',
            description: 'Descend into procedurally generated dungeons filled with monsters, traps, and legendary loot. Every run is unique.',
            category: 'RPG',
            featured: true,
            trending: false,
            reward: 20,
            players: '8.7K',
            gradient: 'linear-gradient(135deg, #06D6A0 0%, #073B4C 100%)'
        },
        {
            id: 'cosmic-blast',
            name: 'Cosmic Blast',
            icon: '🚀',
            description: 'Defend the galaxy from alien invaders in this classic space shooter with modern graphics and devastating weapon upgrades.',
            category: 'Arcade',
            featured: true,
            trending: true,
            reward: 10,
            players: '15.2K',
            gradient: 'linear-gradient(135deg, #0EA5E9 0%, #1E1B4B 100%)'
        },
        {
            id: 'mind-maze',
            name: 'Mind Maze',
            icon: '🧩',
            description: 'Challenge your brain with increasingly complex puzzles. Over 500 handcrafted levels that will test your logic and creativity.',
            category: 'Puzzle',
            featured: false,
            trending: true,
            reward: 12,
            players: '22.1K',
            gradient: 'linear-gradient(135deg, #F59E0B 0%, #DC2626 100%)'
        },
        {
            id: 'shadow-strike',
            name: 'Shadow Strike',
            icon: '🥷',
            description: 'Become the ultimate ninja assassin. Sneak through enemy compounds, execute silent takedowns, and vanish into the shadows.',
            category: 'Action',
            featured: true,
            trending: false,
            reward: 18,
            players: '9.3K',
            gradient: 'linear-gradient(135deg, #374151 0%, #111827 100%)'
        },
        {
            id: 'star-commander',
            name: 'Star Commander',
            icon: '🛸',
            description: 'Build your fleet, explore uncharted star systems, and wage galactic warfare in this epic real-time strategy game.',
            category: 'Strategy',
            featured: false,
            trending: true,
            reward: 25,
            players: '6.8K',
            gradient: 'linear-gradient(135deg, #6366F1 0%, #0F172A 100%)'
        },
        {
            id: 'turbo-drift',
            name: 'Turbo Drift',
            icon: '🏁',
            description: 'Master the art of drifting across mountain passes, city circuits, and desert tracks. Upgrade your garage with exotic supercars.',
            category: 'Racing',
            featured: false,
            trending: false,
            reward: 12,
            players: '11.5K',
            gradient: 'linear-gradient(135deg, #F97316 0%, #7C2D12 100%)'
        },
        {
            id: 'dragon-saga',
            name: 'Dragon Saga',
            icon: '🐉',
            description: 'Hatch, raise, and battle dragons in a rich fantasy world. Collect over 200 unique dragon species and become a Dragon Master.',
            category: 'RPG',
            featured: false,
            trending: true,
            reward: 22,
            players: '18.9K',
            gradient: 'linear-gradient(135deg, #DC2626 0%, #450A0A 100%)'
        },
        {
            id: 'block-breaker',
            name: 'Block Breaker',
            icon: '🧱',
            description: 'The classic brick-breaking game reimagined with physics-based gameplay, explosive power-ups, and boss battles.',
            category: 'Arcade',
            featured: false,
            trending: false,
            reward: 8,
            players: '25.6K',
            gradient: 'linear-gradient(135deg, #EAB308 0%, #A16207 100%)'
        },
        {
            id: 'word-wizard',
            name: 'Word Wizard',
            icon: '📝',
            description: 'Form words from scrambled letters before time runs out. Expand your vocabulary and compete in daily tournaments.',
            category: 'Puzzle',
            featured: false,
            trending: false,
            reward: 10,
            players: '14.3K',
            gradient: 'linear-gradient(135deg, #10B981 0%, #064E3B 100%)'
        },
        {
            id: 'cyber-arena',
            name: 'Cyber Arena',
            icon: '🤖',
            description: 'Fight in intense 1v1 cyberpunk battles. Customize your fighter with cybernetic enhancements and climb the ranked ladder.',
            category: 'Action',
            featured: true,
            trending: true,
            reward: 20,
            players: '7.1K',
            gradient: 'linear-gradient(135deg, #EC4899 0%, #1E1B4B 100%)'
        },
        {
            id: 'empire-builder',
            name: 'Empire Builder',
            icon: '🏛️',
            description: 'Construct and manage a thriving civilization from the Stone Age to the Space Age. Trade, diplomacy, and conquest await.',
            category: 'Strategy',
            featured: false,
            trending: false,
            reward: 30,
            players: '5.4K',
            gradient: 'linear-gradient(135deg, #78716C 0%, #1C1917 100%)'
        },
        {
            id: 'fruit-frenzy',
            name: 'Fruit Frenzy',
            icon: '🍉',
            description: 'Match colorful fruits in this addictive puzzle game. Chain combos, trigger fruit explosions, and beat your high score.',
            category: 'Casual',
            featured: false,
            trending: true,
            reward: 5,
            players: '42.8K',
            gradient: 'linear-gradient(135deg, #F43F5E 0%, #FB923C 100%)'
        },
        {
            id: 'zombie-siege',
            name: 'Zombie Siege',
            icon: '🧟',
            description: 'Survive waves of undead in this tense tower defense shooter. Scavenge weapons, build barricades, and hold the line.',
            category: 'Action',
            featured: false,
            trending: false,
            reward: 16,
            players: '13.7K',
            gradient: 'linear-gradient(135deg, #16A34A 0%, #052E16 100%)'
        },
        {
            id: 'chess-master',
            name: 'Chess Master',
            icon: '♚',
            description: 'Play chess against AI opponents ranging from beginner to grandmaster level. Analyze your games and improve your rating.',
            category: 'Strategy',
            featured: false,
            trending: false,
            reward: 15,
            players: '19.2K',
            gradient: 'linear-gradient(135deg, #A8A29E 0%, #292524 100%)'
        },
        {
            id: 'bubble-pop',
            name: 'Bubble Pop',
            icon: '🫧',
            description: 'A relaxing bubble-popping experience with satisfying physics and beautiful particle effects. Perfect for quick sessions.',
            category: 'Casual',
            featured: false,
            trending: false,
            reward: 5,
            players: '31.4K',
            gradient: 'linear-gradient(135deg, #38BDF8 0%, #7DD3FC 100%)'
        }
    ];

    /* =========================================
       分类配置
       添加新分类：在此数组新增对象
       ========================================= */
    const CATEGORIES = [
        { id: 'all', name: 'All Games', icon: '🎮', color: 'rgba(245, 158, 11, 0.15)' },
        { id: 'action', name: 'Action', icon: '💥', color: 'rgba(239, 68, 68, 0.15)' },
        { id: 'racing', name: 'Racing', icon: '🏁', color: 'rgba(249, 115, 22, 0.15)' },
        { id: 'puzzle', name: 'Puzzle', icon: '🧩', color: 'rgba(234, 179, 8, 0.15)' },
        { id: 'arcade', name: 'Arcade', icon: '👾', color: 'rgba(14, 165, 233, 0.15)' },
        { id: 'rpg', name: 'RPG', icon: '⚔️', color: 'rgba(6, 214, 160, 0.15)' },
        { id: 'strategy', name: 'Strategy', icon: '🧠', color: 'rgba(99, 102, 241, 0.15)' },
        { id: 'casual', name: 'Casual', icon: '🎯', color: 'rgba(244, 63, 94, 0.15)' }
    ];

    /* ---- 游玩历史 ---- */
    let _playHistory = [];

    function _loadHistory() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            _playHistory = raw ? JSON.parse(raw) : [];
        } catch (e) {
            _playHistory = [];
        }
    }

    function _saveHistory() {
        try {
            /* 只保留最近100条 */
            if (_playHistory.length > 100) _playHistory = _playHistory.slice(0, 100);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(_playHistory));
        } catch (e) { /* 静默 */ }
    }

    /* ---- 工具函数 ---- */
    function _normalizeCategory(cat) {
        return cat.toLowerCase().replace(/[^a-z0-9]/g, '');
    }

    /* ---- 公开 API ---- */

    /**
     * 获取所有游戏
     */
    function getAllGames() {
        return GAMES_DB.slice();
    }

    /**
     * 根据ID获取游戏
     */
    function getGameById(id) {
        return GAMES_DB.find(g => g.id === id) || null;
    }

    /**
     * 获取精选游戏
     */
    function getFeaturedGames() {
        return GAMES_DB.filter(g => g.featured);
    }

    /**
     * 获取热门游戏
     */
    function getTrendingGames() {
        return GAMES_DB.filter(g => g.trending);
    }

    /**
     * 按分类获取游戏
     * @param {string} categoryId - 分类ID（小写无空格）
     */
    function getGamesByCategory(categoryId) {
        if (!categoryId || categoryId === 'all') return GAMES_DB.slice();
        return GAMES_DB.filter(g => _normalizeCategory(g.category) === categoryId);
    }

    /**
     * 获取所有分类
     */
    function getCategories() {
        return CATEGORIES.slice();
    }

    /**
     * 搜索游戏（名称和描述）
     * @param {string} query
     */
    function searchGames(query) {
        query = query.trim().toLowerCase();
        if (!query) return [];
        return GAMES_DB.filter(g =>
            g.name.toLowerCase().includes(query) ||
            g.description.toLowerCase().includes(query) ||
            g.category.toLowerCase().includes(query)
        );
    }

    /**
     * 获取最近游玩的游戏
     * @param {number} limit
     */
    function getRecentGames(limit) {
        limit = limit || 6;
        const recentIds = _playHistory.slice(0, limit);
        return recentIds
            .map(h => GAMES_DB.find(g => g.id === h.id))
            .filter(Boolean);
    }

    /**
     * 获取推荐游戏（排除最近游玩的）
     * @param {number} limit
     */
    function getRecommendedGames(limit) {
        limit = limit || 6;
        const recentIds = new Set(_playHistory.slice(0, 10).map(h => h.id));
        const available = GAMES_DB.filter(g => !recentIds.has(g.id));
        /* 随机打乱后取前N个 */
        const shuffled = available.sort(() => Math.random() - 0.5);
        return shuffled.slice(0, limit);
    }

    /**
     * 记录游玩
     * @param {string} gameId
     */
    function recordPlay(gameId) {
        /* 移除已有的相同记录 */
        _playHistory = _playHistory.filter(h => h.id !== gameId);
        /* 插入到最前 */
        _playHistory.unshift({ id: gameId, timestamp: Date.now() });
        _saveHistory();
    }

    /**
     * 获取游戏总数
     */
    function getTotalCount() {
        return GAMES_DB.length;
    }

    /**
     * 获取所有分类的游戏数量
     */
    function getCategoryCounts() {
        const counts = { all: GAMES_DB.length };
        GAMES_DB.forEach(g => {
            const cat = _normalizeCategory(g.category);
            counts[cat] = (counts[cat] || 0) + 1;
        });
        return counts;
    }

    /* ==== 未来功能占位 ==== */

    /**
     * [占位] 从API获取游戏列表
     * @param {object} params - 分页、过滤参数
     */
    async function fetchGamesFromAPI(/* params */) {
        // TODO: 实现API获取
        // 1. 构建请求参数
        // 2. 调用后端API
        // 3. 合并到本地数据
        // 4. 缓存结果
        console.log('[Games] fetchGamesFromAPI - 占位，待实现');
        return GAMES_DB.slice();
    }

    /**
     * [占位] 获取游戏在线URL
     * @param {string} gameId
     */
    function getGameURL(gameId) {
        // TODO: 替换为实际的游戏URL
        // 目前返回空字符串，表示离线/本地游戏
        const game = getGameById(gameId);
        return game ? (game.url || '') : '';
    }

    /* ---- 初始化 ---- */
    _loadHistory();

    return {
        getAllGames,
        getGameById,
        getFeaturedGames,
        getTrendingGames,
        getGamesByCategory,
        getCategories,
        searchGames,
        getRecentGames,
        getRecommendedGames,
        recordPlay,
        getTotalCount,
        getCategoryCounts,
        fetchGamesFromAPI,
        getGameURL
    };
})();


