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

        activeDays: 0,

        gamesPlayed: 0,

        wins: 0,

        losses: 0,

        bestMultiplier: 0,

        bestWin: 0
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
   SMASHER ENGINE
========================================= */

function startSmasherRound(stake) {

    if (!Number.isFinite(stake) ||
        stake < GAME_CONFIG.grinder.minStake ||
        stake > GAME_CONFIG.grinder.maxStake) {
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

    if (GAME_STATE.smasher.active) {
        return {
            success: false,
            message: "A Smasher round is already active."
        };
    }

    if (!spendCoins(stake)) {
        return {
            success: false,
            message: "Unable to place the coin stake."
        };
    }

    const crashAt = Number(
        (1.2 + Math.random() * 4.8).toFixed(2)
    );

    GAME_STATE.smasher.active = true;
    GAME_STATE.smasher.stake = stake;
    GAME_STATE.smasher.multiplier = 1;
    GAME_STATE.smasher.startedAt = Date.now();
    GAME_STATE.smasher.crashAt = crashAt;
    GAME_STATE.smasher.cashedOut = false;

    return {
        success: true,
        stake,
        multiplier: 1,
        crashAt
    };
}


function updateSmasherMultiplier() {

    if (!GAME_STATE.smasher.active) {
        return {
            success: false,
            message: "No active Smasher round."
        };
    }

    const elapsed =
        (Date.now() - GAME_STATE.smasher.startedAt) / 1000;

    const multiplier = Number(
        (
            1 +
            elapsed * 0.25 +
            Math.pow(elapsed, 1.35) * 0.03
        ).toFixed(2)
    );

    GAME_STATE.smasher.multiplier =
        Math.min(
            multiplier,
            GAME_STATE.smasher.crashAt
        );

    GAME_STATE.smasher.highestMultiplier =
        Math.max(
            GAME_STATE.smasher.highestMultiplier,
            GAME_STATE.smasher.multiplier
        );

    return {
        success: true,
        multiplier: GAME_STATE.smasher.multiplier,
        crashAt: GAME_STATE.smasher.crashAt
    };
}


function cashOutSmasher() {

    if (!GAME_STATE.smasher.active) {
        return {
            success: false,
            message: "No active Smasher round."
        };
    }

    updateSmasherMultiplier();

    if (
        GAME_STATE.smasher.multiplier >=
        GAME_STATE.smasher.crashAt
    ) {
        return crashSmasher();
    }

    const stake = GAME_STATE.smasher.stake;
    const multiplier = GAME_STATE.smasher.multiplier;
    const payout = Math.floor(stake * multiplier);

    addCoins(payout);

    const result = {
        success: true,
        won: true,
        crashed: false,
        stake,
        multiplier,
        payout,
        net: payout - stake,
        coins: GAME_STATE.coins
    };

    GAME_STATE.smasher.active = false;
    GAME_STATE.smasher.stake = 0;
    GAME_STATE.smasher.multiplier = 1;
    GAME_STATE.smasher.startedAt = null;
    GAME_STATE.smasher.crashAt = null;
    GAME_STATE.smasher.cashedOut = true;

    recordChampionshipResult(
        result.net,
        true,
        multiplier
    );

    return result;
}


/* =========================================
   SMASHER RESOLUTION
========================================= */

function resolveSmasherRound() {
    if (typeof crashSmasher !== "function") {
        return {
            success: false,
            message: "Smasher crash engine unavailable."
        };
    }

    return crashSmasher();
}


function crashSmasher() {

    if (!GAME_STATE.smasher.active) {
        return {
            success: false,
            message: "No active Smasher round."
        };
    }

    const stake = GAME_STATE.smasher.stake;
    const multiplier = GAME_STATE.smasher.crashAt;

    const result = {
        success: true,
        won: false,
        crashed: true,
        stake,
        multiplier,
        payout: 0,
        net: -stake,
        coins: GAME_STATE.coins
    };

    GAME_STATE.smasher.active = false;
    GAME_STATE.smasher.stake = 0;
    GAME_STATE.smasher.multiplier = 1;
    GAME_STATE.smasher.startedAt = null;
    GAME_STATE.smasher.crashAt = null;
    GAME_STATE.smasher.cashedOut = false;

    recordChampionshipResult(
        result.net,
        false,
        multiplier
    );

    return result;
}



/* =========================================
   UNDERDOG ENGINE
========================================= */

function startUnderdogRound(prediction, stake) {

    if (prediction !== "up" && prediction !== "down") {
        return {
            success: false,
            message: "Choose UP or DOWN."
        };
    }

    if (!Number.isFinite(stake) ||
        stake < GAME_CONFIG.grinder.minStake ||
        stake > GAME_CONFIG.grinder.maxStake) {
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

    if (!GAME_STATE.underdog.selectedToken) {
        return {
            success: false,
            message: "Choose an underdog token first."
        };
    }

    const marketToken =
        getMarketToken(GAME_STATE.underdog.selectedToken);

    if (!marketToken ||
        typeof marketToken.price !== "number") {
        return {
            success: false,
            message: "Live market data unavailable."
        };
    }

    if (!spendCoins(stake)) {
        return {
            success: false,
            message: "Unable to place the coin stake."
        };
    }

    GAME_STATE.underdog.active = true;
    GAME_STATE.underdog.stake = stake;
    GAME_STATE.underdog.prediction = prediction;
    GAME_STATE.underdog.startPrice = marketToken.price;
    GAME_STATE.underdog.startedAt = Date.now();

    return {
        success: true,
        stake,
        prediction,
        startPrice: marketToken.price,
        seconds: GAME_CONFIG.grinder.roundSeconds
    };
}


function resolveUnderdogRound() {

    if (!GAME_STATE.underdog.active) {
        return {
            success: false,
            message: "No active Underdog round."
        };
    }

    const marketToken =
        getMarketToken(GAME_STATE.underdog.selectedToken);

    if (!marketToken ||
        typeof marketToken.price !== "number") {
        return {
            success: false,
            message: "Waiting for live market data."
        };
    }

    const startPrice = GAME_STATE.underdog.startPrice;
    const endPrice = marketToken.price;

    let direction = "flat";

    if (endPrice > startPrice) {
        direction = "up";
    } else if (endPrice < startPrice) {
        direction = "down";
    }

    const prediction = GAME_STATE.underdog.prediction;
    const stake = GAME_STATE.underdog.stake;
    const won = direction === prediction;

    const multiplier = 2.5;

    const payout =
        won
            ? Math.floor(stake * multiplier)
            : 0;

    if (payout > 0) {
        addCoins(payout);
    }

    const result = {
        success: true,
        won,
        prediction,
        direction,
        stake,
        multiplier,
        payout,
        net: won ? payout - stake : -stake,
        startPrice,
        endPrice,
        coins: GAME_STATE.coins
    };

    GAME_STATE.underdog.active = false;
    GAME_STATE.underdog.stake = 0;
    GAME_STATE.underdog.prediction = null;
    GAME_STATE.underdog.startPrice = null;
    GAME_STATE.underdog.startedAt = null;

    recordChampionshipResult(
        result.net,
        won,
        multiplier
    );

    return result;
}



/* =========================================
   CHAMPIONSHIP TRACKING
========================================= */

function recordChampionshipResult(net, won, multiplier) {

    const championship =
        GAME_STATE.championship;

    championship.gamesPlayed++;

    if (won) {
        championship.wins++;
    } else {
        championship.losses++;
    }

    championship.cumulativeNetCoins +=
        Number(net) || 0;

    championship.bestMultiplier =
        Math.max(
            championship.bestMultiplier,
            Number(multiplier) || 0
        );

    if (won) {
        championship.bestWin =
            Math.max(
                championship.bestWin,
                Number(net) || 0
            );
    }

    return {
        ...championship
    };
}


function getChampionshipState() {

    return {
        ...GAME_STATE.championship
    };
}


function resetChampionship() {

    GAME_STATE.championship.cumulativeNetCoins = 0;
    GAME_STATE.championship.activeDays = 0;
    GAME_STATE.championship.gamesPlayed = 0;
    GAME_STATE.championship.wins = 0;
    GAME_STATE.championship.losses = 0;
    GAME_STATE.championship.bestMultiplier = 0;
    GAME_STATE.championship.bestWin = 0;

    return getChampionshipState();
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
        },

        smasher: {
            ...GAME_STATE.smasher
        },

        underdog: {
            ...GAME_STATE.underdog
        },

        championship: {
            ...GAME_STATE.championship
        }

    };

}
