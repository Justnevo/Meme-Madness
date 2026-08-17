/* =========================================
   MEME MADNESS
   LIVE SOLANA MARKET DATA
   ========================================= */

const MARKET_DATA = {
    updatedAt: null,
    connected: false,
    tokens: {}
};


/* =========================================
   INITIALIZE MARKET DATA
   ========================================= */

function initializeMarketData() {

    if (typeof TOKENS === "undefined") {
        console.error("TOKENS is not available.");
        return;
    }

    TOKENS.forEach(token => {

        MARKET_DATA.tokens[token.symbol] = {
            symbol: token.symbol,
            display: token.display,
            name: token.display,
            address: token.address,
            chain: token.chain,

            price: null,
            change24h: null,

            previousPrice: null,
            direction: null,

            pairAddress: null,
            dexId: null,

            liquidity: null,
            volume24h: null,

            history: []
        };

    });

}


/* =========================================
   GET MARKET TOKEN
   ========================================= */

function getMarketToken(symbol) {

    return MARKET_DATA.tokens[symbol] || null;

}


/* =========================================
   UPDATE MARKET TOKEN
   ========================================= */

function updateMarketToken(symbol, data = {}) {

    const token =
        MARKET_DATA.tokens[symbol];

    if (!token) {
        return false;
    }


    if (
        typeof data.name === "string" &&
        data.name.trim()
    ) {

        token.name =
            data.name.trim();

    }


    if (
        typeof data.symbol === "string" &&
        data.symbol.trim()
    ) {

        token.symbol =
            data.symbol.trim();

    }


    if (
        typeof data.imageUrl === "string" &&
        data.imageUrl.trim()
    ) {

        token.imageUrl =
            data.imageUrl.trim();

    }


    if (
        typeof data.price === "number" &&
        Number.isFinite(data.price)
    ) {

        token.previousPrice =
            token.price;

        token.price =
            data.price;


        if (
            token.previousPrice !== null
        ) {

            if (
                token.price >
                token.previousPrice
            ) {

                token.direction = "up";

            } else if (
                token.price <
                token.previousPrice
            ) {

                token.direction = "down";

            } else {

                token.direction = "flat";

            }

        }


        token.history.push({

            price: token.price,

            time: Date.now()

        });


        if (
            token.history.length > 60
        ) {

            token.history.shift();

        }

    }


    if (
        typeof data.change24h === "number" &&
        Number.isFinite(data.change24h)
    ) {

        token.change24h =
            data.change24h;

    }


    if (
        typeof data.pairAddress === "string"
    ) {

        token.pairAddress =
            data.pairAddress;

    }


    if (
        typeof data.dexId === "string"
    ) {

        token.dexId =
            data.dexId;

    }


    if (
        typeof data.liquidity === "number" &&
        Number.isFinite(data.liquidity)
    ) {

        token.liquidity =
            data.liquidity;

    }


    if (
        typeof data.volume24h === "number" &&
        Number.isFinite(data.volume24h)
    ) {

        token.volume24h =
            data.volume24h;

    }


    MARKET_DATA.updatedAt =
        Date.now();


    return true;

}


/* =========================================
   FIND BEST SOLANA PAIR
   ========================================= */

function findBestPair(pairs, address) {

    if (
        !Array.isArray(pairs) ||
        pairs.length === 0
    ) {

        return null;

    }


    const matchingPairs =
        pairs.filter(pair => {

            if (
                !pair ||
                !pair.baseToken
            ) {

                return false;

            }


            return (
                String(
                    pair.baseToken.address || ""
                ).toLowerCase() ===
                String(address).toLowerCase()
            );

        });


    if (
        matchingPairs.length === 0
    ) {

        return null;

    }


    matchingPairs.sort((a, b) => {

        const liquidityA =
            Number(
                a?.liquidity?.usd || 0
            );

        const liquidityB =
            Number(
                b?.liquidity?.usd || 0
            );

        return liquidityB - liquidityA;

    });


    return matchingPairs[0];

}


/* =========================================
   FETCH TOKEN BY CONTRACT ADDRESS
   ========================================= */

async function fetchLiveToken(token) {

    if (
        !token ||
        !token.address
    ) {

        return false;

    }


    const url =
        "https://api.dexscreener.com/latest/dex/tokens/" +
        encodeURIComponent(token.address);


    try {

        const response =
            await fetch(url, {

                method: "GET",

                cache: "no-store"

            });


        if (!response.ok) {

            throw new Error(
                `HTTP ${response.status}`
            );

        }


        const data =
            await response.json();


        const pair =
            findBestPair(
                data.pairs,
                token.address
            );


        if (!pair) {

            console.warn(
                `No live Solana pair found for ${token.symbol}`
            );

            return false;

        }


        if (
            pair.chainId &&
            pair.chainId !== "solana"
        ) {

            console.warn(
                `Ignoring non-Solana pair for ${token.symbol}`
            );

            return false;

        }


        const baseToken =
            pair.baseToken || {};


        const price =
            Number(pair.priceUsd);


        const change24h =
            Number(
                pair.priceChange?.h24
            );


        const liquidity =
            Number(
                pair.liquidity?.usd
            );


        const volume24h =
            Number(
                pair.volume?.h24
            );


        updateMarketToken(
            token.symbol,
            {

                name:
                    baseToken.name ||
                    token.display,

                symbol:
                    baseToken.symbol ||
                    token.symbol,

                imageUrl:
                    pair.info?.imageUrl ||
                    null,

                price:
                    Number.isFinite(price)
                        ? price
                        : null,

                change24h:
                    Number.isFinite(change24h)
                        ? change24h
                        : null,

                pairAddress:
                    pair.pairAddress ||
                    null,

                dexId:
                    pair.dexId ||
                    null,

                liquidity:
                    Number.isFinite(liquidity)
                        ? liquidity
                        : null,

                volume24h:
                    Number.isFinite(volume24h)
                        ? volume24h
                        : null

            }
        );


        return true;

    } catch (error) {

        console.error(
            `Market error for ${token.symbol}:`,
            error
        );

        return false;

    }

}


/* =========================================
   REFRESH ALL TOKENS
   ========================================= */

async function refreshLiveMarket() {

    if (
        typeof TOKENS === "undefined"
    ) {

        return;

    }


    let successful = 0;


    for (
        const token of TOKENS
    ) {

        const success =
            await fetchLiveToken(token);


        if (success) {

            successful++;

        }

    }


    setMarketConnectionStatus(
        successful > 0
    );


    MARKET_DATA.updatedAt =
        Date.now();


    console.log(
        `LIVE MARKET: ${successful}/${TOKENS.length} tokens`
    );

}


/* =========================================
   CONNECTION STATUS
   ========================================= */

function setMarketConnectionStatus(
    connected
) {

    MARKET_DATA.connected =
        Boolean(connected);

}


/* =========================================
   MARKET SNAPSHOT
   ========================================= */

function getMarketSnapshot() {

    return {

        updatedAt:
            MARKET_DATA.updatedAt,

        connected:
            MARKET_DATA.connected,

        tokens:
            { ...MARKET_DATA.tokens }

    };

}


/* =========================================
   START LIVE FEED
   ========================================= */

function startLiveMarketFeed() {

    refreshLiveMarket();


    setInterval(() => {

        refreshLiveMarket();

    }, 10000);

}


/* =========================================
   STARTUP
   ========================================= */

initializeMarketData();

startLiveMarketFeed();
