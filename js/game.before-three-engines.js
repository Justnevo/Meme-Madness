/* =========================================
   MEME MADNESS
   GAME ENGINE
========================================= */

const GAME_CONFIG = {

    /*
     * Change this one number whenever you want
     * a different starting coin balance.
     */
    startingCoins: 20000,

    grinder: {
        roundSeconds: 15,

        minStake: 100,
        maxStake: 5000,

        winMultiplier: 1.8
    }

};


/* =========================================
   GLOBAL GAME STATE
========================================= */

const GAME_STATE = {

    day: 1,

    coins: GAME_CONFIG.startingCoins,

    currentMode: null,
    currentToken: null,

    predictions: 0,
    netCoins: 0,

    grinder: {

        predictions: 0,

        active: false,

        prediction: null,

        stake: 0,

        startPrice: null,

        startedAt: null,

        timer: null
    },

    parlay: {
        active: false,
        stake: 0,
        legs: [],
        startedAt: null
    },

    smasher: {

        highestMultiplier: 0,

        active: false,

        stake: 0,

        multiplier: 1,

        startedAt: null,

        crashAt: null,

        cashedOut: false
    },

    underdog: {

        selectedToken: null,

        active: false,

        stake: 0,

        prediction: null,

        startPrice: null,

        startedAt: null
    },

    underdog: {

        selectedToken: null
    },

    championship: {

        cumulativeNetCoins: 0,

        activeDays: 0
    }

};


/* =========================================
   DAILY RESET
========================================= */

function resetDailyState() {

    GAME_STATE.coins =
        GAME_CONFIG.startingCoins;

    GAME_STATE.predictions = 0;

    GAME_STATE.netCoins = 0;


    GAME_STATE.grinder.predictions = 0;

    GAME_STATE.grinder.active = false;

    GAME_STATE.grinder.prediction = null;

    GAME_STATE.grinder.stake = 0;

    GAME_STATE.grinder.startPrice = null;

    GAME_STATE.grinder.startedAt = null;


    if (GAME_STATE.grinder.timer) {

        clearInterval(
            GAME_STATE.grinder.timer
        );

    }

    GAME_STATE.grinder.timer = null;


    GAME_STATE.smasher.highestMultiplier = 0;

    GAME_STATE.underdog.selectedToken = null;

}


/* =========================================
   MODE
========================================= */

function selectMode(mode) {

    GAME_STATE.currentMode = mode;

    return mode;

}


/* =========================================
   TOKEN
========================================= */

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


/* =========================================
   COINS
========================================= */

function addCoins(amount) {

    if (
        !Number.isFinite(amount) ||
        amount <= 0
    ) {

        return GAME_STATE.coins;

    }

    GAME_STATE.coins += amount;

    GAME_STATE.netCoins += amount;

    return GAME_STATE.coins;

}


function spendCoins(amount) {

    if (
        !Number.isFinite(amount) ||
        amount <= 0
    ) {

        return false;

    }

    if (amount > GAME_STATE.coins) {

        return false;

    }

    GAME_STATE.coins -= amount;

    GAME_STATE.netCoins -= amount;

    return true;

}


/* =========================================
   GRINDER
========================================= */

function getGrinderMarketToken() {

    if (!GAME_STATE.currentToken) {

        return null;

    }

    if (
        typeof getMarketToken !== "function"
    ) {

        return null;

    }

    return getMarketToken(
        GAME_STATE.currentToken.symbol
    );

}


/* =========================================
   START GRINDER ROUND
========================================= */

function startGrinderRound(
    prediction,
    stake
) {

    if (
        prediction !== "up" &&
        prediction !== "down"
    ) {

        return {
            success: false,
            message: "Choose UP or DOWN."
        };

    }


    if (
        !Number.isFinite(stake) ||
        stake < GAME_CONFIG.grinder.minStake ||
        stake > GAME_CONFIG.grinder.maxStake
    ) {

        return {
            success: false,
            message:
                `Stake must be between ${GAME_CONFIG.grinder.minStake.toLocaleString()} and ${GAME_CONFIG.grinder.maxStake.toLocaleString()} coins.`
        };

    }


    if (stake > GAME_STATE.coins) {

        return {
            success: false,
            message: "Not enough coins."
        };

    }


    if (!GAME_STATE.currentToken) {

        return {
            success: false,
            message: "Choose a meme first."
        };

    }


    const marketToken =
        getGrinderMarketToken();


    /*
     * We require an actual market price.
     * No fake price is generated here.
     */

    if (
        !marketToken ||
        typeof marketToken.price !== "number"
    ) {

        return {
            success: false,
            message:
                "Live market data is not connected yet."
        };

    }


    if (!spendCoins(stake)) {

        return {
            success: false,
            message: "Unable to place the coin stake."
        };

    }


    GAME_STATE.grinder.active = true;

    GAME_STATE.grinder.prediction =
        prediction;

    GAME_STATE.grinder.stake =
        stake;

    GAME_STATE.grinder.startPrice =
        marketToken.price;

    GAME_STATE.grinder.startedAt =
        Date.now();

    GAME_STATE.grinder.predictions++;

    GAME_STATE.predictions++;


    return {

        success: true,

        startPrice:
            marketToken.price,

        seconds:
            GAME_CONFIG.grinder.roundSeconds
    };

}


/* =========================================
   RESOLVE GRINDER ROUND
========================================= */

function resolveGrinderRound() {

    if (!GAME_STATE.grinder.active) {

        return {
            success: false,
            message: "No active round."
        };

    }


    const marketToken =
        getGrinderMarketToken();


    if (
        !marketToken ||
        typeof marketToken.price !== "number"
    ) {

        return {
            success: false,
            message:
                "Waiting for live market data."
        };

    }


    const startPrice =
        GAME_STATE.grinder.startPrice;

    const endPrice =
        marketToken.price;


    let direction = "flat";


    if (endPrice > startPrice) {

        direction = "up";

    }

    else if (endPrice < startPrice) {

        direction = "down";

    }


    const prediction =
        GAME_STATE.grinder.prediction;

    const stake =
        GAME_STATE.grinder.stake;


    const won =
        direction === prediction;


    let payout = 0;


    if (won) {

        payout =
            Math.floor(
                stake *
                GAME_CONFIG.grinder.winMultiplier
            );

        addCoins(payout);

    }


    const result = {

        success: true,

        won,

        direction,

        prediction,

        stake,

        startPrice,

        endPrice,

        payout,

        net:

            won
                ? payout - stake
                : -stake,

        coins:
            GAME_STATE.coins

    };


    GAME_STATE.grinder.active = false;

    GAME_STATE.grinder.prediction = null;

    GAME_STATE.grinder.stake = 0;

    GAME_STATE.grinder.startPrice = null;

    GAME_STATE.grinder.startedAt = null;


    return result;

}


/* =========================================
   START PARLAY
========================================= */
function startParlayRound(legs, stake) {

    if (!Array.isArray(legs) || legs.length < 2) {

        return {
            success: false,
            message: "A parlay needs at least 2 legs."
        };

    }

    if (
        !Number.isFinite(stake) ||
        stake < GAME_CONFIG.grinder.minStake ||
        stake > GAME_CONFIG.grinder.maxStake
    ) {

        return {
            success: false,
            message:
                `Stake must be between ${GAME_CONFIG.grinder.minStake.toLocaleString()} and ${GAME_CONFIG.grinder.maxStake.toLocaleString()} coins.`
        };

    }

    if (stake > GAME_STATE.coins) {

        return {
            success: false,
            message: "Not enough coins."
        };

    }

    const preparedLegs = [];

    for (const leg of legs) {

        if (
            !leg ||
            !leg.symbol ||
            (leg.prediction !== "up" &&
             leg.prediction !== "down")
        ) {

            return {
                success: false,
                message: "Every parlay leg needs UP or DOWN."
            };

        }

        const marketToken =
            typeof getMarketToken === "function"
                ? getMarketToken(leg.symbol)
                : null;

        if (
            !marketToken ||
            typeof marketToken.price !== "number"
        ) {

            return {
                success: false,
                message:
                    `Live market data unavailable for ${leg.symbol}.`
            };

        }

        preparedLegs.push({
            symbol: leg.symbol,
            display: leg.display || leg.symbol,
            prediction: leg.prediction,
            startPrice: marketToken.price
        });

    }

    /*
     * PLACE PARLAY already deducts the stake.
     * Do NOT spendCoins() again here.
     */

    GAME_STATE.parlay.active = true;
    GAME_STATE.parlay.stake = stake;
    GAME_STATE.parlay.legs = preparedLegs;
    GAME_STATE.parlay.startedAt = Date.now();

    return {
        success: true,
        seconds: GAME_CONFIG.grinder.roundSeconds
    };

}


/* =========================================
   RESOLVE PARLAY
========================================= */
function resolveParlayRound() {

    if (!GAME_STATE.parlay.active) {

        return {
            success: false,
            message: "No active parlay."
        };

    }

    const resolvedLegs = [];
    let allWon = true;

    for (const leg of GAME_STATE.parlay.legs) {

        const marketToken =
            typeof getMarketToken === "function"
                ? getMarketToken(leg.symbol)
                : null;

        if (
            !marketToken ||
            typeof marketToken.price !== "number"
        ) {

            return {
                success: false,
                message:
                    `Waiting for live market data for ${leg.symbol}.`
            };

        }

        const endPrice = marketToken.price;

        let direction = "flat";

        if (endPrice > leg.startPrice) {
            direction = "up";
        } else if (endPrice < leg.startPrice) {
            direction = "down";
        }

        const won =
            direction === leg.prediction;

        if (!won) {
            allWon = false;
        }

        resolvedLegs.push({
            symbol: leg.symbol,
            display: leg.display,
            prediction: leg.prediction,
            startPrice: leg.startPrice,
            endPrice,
            direction,
            won
        });

    }

    const stake = GAME_STATE.parlay.stake;

    const multiplier =
        Math.pow(
            GAME_CONFIG.grinder.winMultiplier,
            GAME_STATE.parlay.legs.length
        );

    const payout =
        allWon
            ? Math.floor(stake * multiplier)
            : 0;

    if (payout > 0) {
        addCoins(payout);
    }

    const result = {
        success: true,
        won: allWon,
        stake,
        multiplier,
        payout,
        net: allWon
            ? payout - stake
            : -stake,
        legs: resolvedLegs,
        coins: GAME_STATE.coins
    };

    GAME_STATE.parlay.active = false;
    GAME_STATE.parlay.stake = 0;
    GAME_STATE.parlay.legs = [];
    GAME_STATE.parlay.startedAt = null;

    return result;

}


/* =========================================
   CANCEL GRINDER ROUND

========================================= */

function cancelGrinderRound() {

    if (!GAME_STATE.grinder.active) {

        return false;

    }


    /*
     * Return the player's stake if a round
     * is cancelled before resolution.
     */

    const stake =
        GAME_STATE.grinder.stake;


    if (stake > 0) {

        addCoins(stake);

    }


    GAME_STATE.grinder.active = false;

    GAME_STATE.grinder.prediction = null;

    GAME_STATE.grinder.stake = 0;

    GAME_STATE.grinder.startPrice = null;

    GAME_STATE.grinder.startedAt = null;


    if (GAME_STATE.grinder.timer) {

        clearInterval(
            GAME_STATE.grinder.timer
        );

    }


    GAME_STATE.grinder.timer = null;


    return true;

}


/* =========================================
   GAME STATE SNAPSHOT
========================================= */

function getGameState() {

    return {

        coins:
            GAME_STATE.coins,

        currentMode:
            GAME_STATE.currentMode,

        currentToken:
            GAME_STATE.currentToken,

        predictions:
            GAME_STATE.predictions,

        netCoins:
            GAME_STATE.netCoins,

        grinder: {
            ...GAME_STATE.grinder
        }

    };

}
