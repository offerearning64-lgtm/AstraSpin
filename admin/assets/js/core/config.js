/* AstraSpin Admin Panel Configuration */

window.AdminConfig = {
    app: {
        name: "AstraSpin Admin Panel",
        version: "1.0.0",
        environment: "development"
    },

    project: {
        name: "AstraSpin",
        maxGames: 5000,
        defaultCategory: "Arcade"
    },

    paths: {
        games: "assets/data/games.json",
        categories: "assets/data/categories.json"
    },

    modules: [
        "dashboard",
        "games",
        "categories",
        "uploads",
        "settings",
        "users"
    ],

    features: {
        gameManager: true,
        uploads: true,
        categories: true,
        wallet: true,
        redeem: true,
        ads: true,
        analytics: true,
        notifications: true,
        security: true
    }
};

console.log(
    AdminConfig.app.name +
    " v" +
    AdminConfig.app.version +
    " loaded successfully."
);
