/* ==========================================================================
   AstraSpin - Configuration
   File: assets/js/config.js
   Central configuration: Edit IDs, URLs, and settings here only.
   ========================================================================== */

const AppConfig = Object.freeze({

    /* --- Application --- */
    appName: 'AstraSpin',
    version: '2.1.0',
    company: 'AstraSpin Studios',
    environment: 'production',

    /* --- Theme Colors --- */
    theme: {
        greenPrimary: '#2DB87B',
        greenLight: '#E8F8F0',
        greenDark: '#1F9A63',
        orangePrimary: '#FF8A3D',
        orangeLight: '#FFF3E8',
        orangeDark: '#E6752A',
        bluePrimary: '#4CA8E8',
        blueLight: '#E8F4FD',
    },

    /* --- Durations (ms) --- */
    durations: {
        pageTransition: 350,
        pageLoaderMin: 350,
        pageLoaderExtra: 200,
        toastDuration: 2500,
        toastAnim: 350,
        modalAnim: 350,
        scrollAnim: 400,
        loaderStep: 400,
        loaderFinalDelay: 300,
        adSimulatedWait: 2000,
        gameLoadSimulated: 1500,
    },

    /* --- Loading Screen Steps --- */
    loadingSteps: [
        { progress: 15, label: 'Initializing core...' },
        { progress: 35, label: 'Loading game data...' },
        { progress: 55, label: 'Preparing interface...' },
        { progress: 75, label: 'Setting up rewards...' },
        { progress: 90, label: 'Almost ready...' },
        { progress: 100, label: 'Welcome!' },
    ],

    /* --- Daily Bonus --- */
    dailyBonus: {
        amount: 50,
        currency: 'Coins',
    },

    /* --- Advertisement Architecture --- */
    ads: {
        enabled: true,
        showBeforePlay: true,
        networks: {
            admob: {
                appId: 'ca-app-pub-XXXXXXX~ZZZZZZZ',
                bannerId: 'ca-app-pub-XXXXXXX/YYYYYYY',
                interstitialId: 'ca-app-pub-XXXXXXX/YYYYYYY',
                rewardedId: 'ca-app-pub-XXXXXXX/YYYYYYY',
                appOpenId: 'ca-app-pub-XXXXXXX/YYYYYYY',
            },
            unity: {
                gameId: '0000000',
                interstitialPlacementId: 'placeholder_interstitial',
                rewardedPlacementId: 'placeholder_rewarded',
            },
            custom: {
                interstitialUrl: '',
                rewardedUrl: '',
                bannerUrl: '',
            }
        }
    },

    /* --- Firebase Configuration --- */
    firebase: {
        apiKey: '',
        authDomain: '',
        projectId: '',
        storageBucket: '',
        messagingSenderId: '',
        appId: '',
        measurementId: '',
        vapidKey: '',
    },

    /* --- Capacitor Configuration --- */
    capacitor: {
        appId: 'com.astraspin.app',
        appName: 'AstraSpin',
        webDir: 'www',
        serverUrl: '',
    },

    /* --- API Endpoints --- */
    api: {
        baseUrl: '',
        rewardEndpoint: '/api/rewards',
        walletEndpoint: '/api/wallet',
        redeemEndpoint: '/api/redeem',
        leaderboardEndpoint: '/api/leaderboards',
        userProfileEndpoint: '/api/profile',
        gameEndpoint: '/api/games',
        referralEndpoint: '/api/referral',
        couponEndpoint: '/api/coupons',
        eventEndpoint: '/api/events',
    },

    /* --- Feature Flags --- */
    features: {
        firebase: false,
        pushNotifications: false,
        analytics: false,
        remoteConfig: false,
        login: false,
        guestMode: true,
        referral: false,
        coupons: false,
        events: false,
        dailyMissions: false,
        weeklyMissions: false,
        luckySpin: false,
        achievements: false,
        leaderboards: false,
        cloudSave: false,
        redeem: false,
    },

    /* --- Default User --- */
    defaults: {
        guestName: 'Guest Player',
        guestId: 'GUEST-0001',
        startBalance: 0,
        startLevel: 1,
    },

    /* --- Storage Keys --- */
    storageKeys: {
        prefix: 'astraspin_',
        wallet: 'wallet',
        profile: 'profile',
        settings: 'settings',
        favorites: 'favorites',
        transactions: 'transactions',
        rewardHistory: 'rewardHistory',
        lastBonusDate: 'lastBonusDate',
        recentGames: 'recentGames',
    },

    /* --- Leveling --- */
    leveling: {
        gamesPerLevel: 5,
    }
});
