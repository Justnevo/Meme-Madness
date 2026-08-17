const GAME_STATE = {
    day: 1,

    coins: 20000,

    currentMode: null,
    currentToken: null,

    predictions: 0,
    netCoins: 0,

    grinder: {
        predictions: 0
    },

    smasher: {
        highestMultiplier: 0
    },

    underdog: {
        selectedToken: null
    },

    championship: {
        cumulativeNetCoins: 0,
        activeDays: 0
    }
};


function resetDailyState() {

    GAME_STATE.coins = 20000;

    GAME_STATE.predictions = 0;
    GAME_STATE.netCoins = 0;

    GAME_STATE.grinder.predictions = 0;

    GAME_STATE.smasher.highestMultiplier = 0;

    GAME_STATE.underdog.selectedToken = null;
}


function selectMode(mode) {

    GAME_STATE.currentMode = mode;

    return mode;
}


function selectToken(symbol) {

    const token = TOKENS.find(
        token => token.symbol === symbol
    );

    if (!token) {
        return null;
    }

    GAME_STATE.currentToken = token;

    return token;
}


function addCoins(amount) {

    if (!Number.isFinite(amount)) {
        return GAME_STATE.coins;
    }

    GAME_STATE.coins += amount;

    GAME_STATE.netCoins += amount;

    return GAME_STATE.coins;
}


function spendCoins(amount) {

    if (!Number.isFinite(amount) || amount <= 0) {
        return false;
    }

    if (amount > GAME_STATE.coins) {
        return false;
    }

    GAME_STATE.coins -= amount;

    GAME_STATE.netCoins -= amount;

    return true;
}
