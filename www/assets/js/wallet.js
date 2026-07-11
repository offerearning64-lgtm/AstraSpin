/* ==========================================================================
   AstraSpin - Wallet Manager
   File: assets/js/wallet.js
   Wallet, transactions, daily rewards, reward history.
   ========================================================================== */

const Wallet = (() => {
    let _data = null;

    /**
     * Initialize wallet from storage.
     */
    function init() {
        _data = Storage.getWallet();
        updateUI();
    }

    function getBalance() { return _data.balance; }
    function getEarned() { return _data.earned; }
    function getSpent() { return _data.spent; }

    /**
     * Add coins to wallet.
     * @param {number} amount
     * @param {string} source - Description of the source
     */
    function addCoins(amount, source = 'Game Reward') {
        _data.balance += amount;
        _data.earned += amount;
        Storage.setWallet(_data);

        const tx = {
            id: Helpers.uniqueId(),
            type: 'credit',
            amount: amount,
            source: source,
            date: Helpers.nowISO(),
        };
        Storage.addTransaction(tx);
        Storage.addRewardHistory({
            title: source,
            amount: '+' + amount,
            type: 'credit',
            date: Helpers.nowISO(),
        });

        updateUI();
        UI.showToast('+' + amount + ' Coins earned!');
    }

    /**
     * Spend coins from wallet.
     * @param {number} amount
     * @param {string} source
     * @returns {boolean} Success
     */
    function spendCoins(amount, source = 'Redemption') {
        if (_data.balance < amount) {
            UI.showToast('Insufficient balance');
            return false;
        }
        _data.balance -= amount;
        _data.spent += amount;
        Storage.setWallet(_data);

        const tx = {
            id: Helpers.uniqueId(),
            type: 'debit',
            amount: amount,
            source: source,
            date: Helpers.nowISO(),
        };
        Storage.addTransaction(tx);

        updateUI();
        UI.showToast('-' + amount + ' Coins spent');
        return true;
    }

    /**
     * Update all wallet-related UI elements across pages.
     */
    function updateUI() {
        const elements = {
            'wallet-balance': _data.balance + ' <span style="font-size:0.875rem;font-weight:500;">Coins</span>',
            'wallet-earned': _data.earned,
            'wallet-spent': _data.spent,
            'reward-balance': _data.balance,
            'stat-coins': _data.balance,
        };

        Object.entries(elements).forEach(([id, value]) => {
            const el = Helpers.el(id);
            if (el) el.innerHTML = value;
        });
    }

    /**
     * Check and update daily bonus state.
     */
    function checkDailyBonus() {
        const btn = Helpers.el('bonus-claim-btn');
        if (!btn) return;

        const lastDate = Storage.getLastBonusDate();
        const today = Helpers.getTodayString();

        if (lastDate === today) {
            btn.textContent = 'Claimed';
            btn.classList.add('claimed');
            btn.disabled = true;
        } else {
            btn.textContent = 'Claim';
            btn.classList.remove('claimed');
            btn.disabled = false;
        }
    }

    /**
     * Claim the daily bonus.
     */
    function claimDailyBonus() {
        const today = Helpers.getTodayString();
        const lastDate = Storage.getLastBonusDate();

        if (lastDate === today) {
            UI.showToast('Already claimed today!');
            return;
        }

        Storage.setLastBonusDate(today);
        addCoins(AppConfig.dailyBonus.amount, 'Daily Bonus');

        const btn = Helpers.el('bonus-claim-btn');
        if (btn) {
            btn.textContent = 'Claimed';
            btn.classList.add('claimed');
            btn.disabled = true;
        }
    }

    /* Public API */
    return Object.freeze({
        init,
        getBalance,
        getEarned,
        getSpent,
        addCoins,
        spendCoins,
        updateUI,
        checkDailyBonus,
        claimDailyBonus,
    });
})();
