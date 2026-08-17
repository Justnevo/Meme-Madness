/* =========================================
   MEME MADNESS
   APP CONTROLLER
========================================= */

document.addEventListener("DOMContentLoaded", () => {

    const homeScreen =
        document.getElementById("home-screen");

    const modeScreen =
        document.getElementById("mode-screen");

    const gameScreen =
        document.getElementById("game-screen");


    const enterArcade =
        document.getElementById("enter-arcade");

    const backHome =
        document.getElementById("back-home");

    const backModes =
        document.getElementById("back-modes");


    const modeCards =
        document.querySelectorAll(".mode-card");


    const activeModeLabel =
        document.getElementById("active-mode-label");

    const activeModeTitle =
        document.getElementById("active-mode-title");

    const gameContent =
        document.getElementById("game-content");


    /* =========================================
       SCREEN CONTROL
    ========================================= */

    function showScreen(screen) {

        if (!screen) {
            return;
        }

        document
            .querySelectorAll(".screen")
            .forEach(item => {

                item.classList.remove("active");

            });


        screen.classList.add("active");


        window.scrollTo({
            top: 0,
            behavior: "instant"
        });

    }


    /* =========================================
       COINS
    ========================================= */

    function formatCoins(amount) {

        return Math.max(
            0,
            Math.floor(amount)
        ).toLocaleString();

    }


    function updateCoins() {

        document
            .querySelectorAll("[data-coins]")
            .forEach(element => {

                element.textContent =
                    formatCoins(
                        GAME_STATE.coins
                    );

            });


        const grinderCoins =
            document.getElementById(
                "grinder-coins"
            );


        if (grinderCoins) {

            grinderCoins.textContent =
                formatCoins(
                    GAME_STATE.coins
                );

        }

    }


    /* =========================================
       MARKET FORMATTING
    ========================================= */

    function formatPrice(price) {

        if (
            typeof price !== "number" ||
            !Number.isFinite(price)
        ) {

            return "WAITING";

        }


        if (price >= 1) {

            return price.toLocaleString(
                undefined,
                {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 6
                }
            );

        }


        return price.toLocaleString(
            undefined,
            {
                minimumFractionDigits: 4,
                maximumFractionDigits: 10
            }
        );

    }


    function formatChange(change) {

        if (
            typeof change !== "number" ||
            !Number.isFinite(change)
        ) {

            return "";

        }


        const sign =
            change > 0
                ? "+"
                : "";


        return `${sign}${change.toFixed(2)}%`;

    }


    function directionText(direction) {

        if (direction === "up") {
            return "▲ UP";
        }


        if (direction === "down") {
            return "▼ DOWN";
        }


        if (direction === "flat") {
            return "— FLAT";
        }


        return "WAITING";

    }


    /* =========================================
       MARKET UI
    ========================================= */

    function updateMarketUI() {

        if (
            typeof getMarketSnapshot !==
            "function"
        ) {

            return;

        }


        const snapshot =
            getMarketSnapshot();


        const statusText =
            document.getElementById(
                "market-status-text"
            );


        const statusDot =
            document.getElementById(
                "market-status-dot"
            );


        if (statusText) {

            statusText.textContent =
                snapshot.connected
                    ? "LIVE MARKET CONNECTED"
                    : "LIVE DATA NOT CONNECTED";

        }


        if (statusDot) {

            statusDot.classList.toggle(
                "connected",
                Boolean(snapshot.connected)
            );

        }


        document
            .querySelectorAll(".token-choice")
            .forEach(button => {

                const symbol =
                    button.dataset.token;


                const marketToken =
                    snapshot.tokens[symbol];


                if (!marketToken) {
                    return;
                }


                const priceElement =
                    button.querySelector(
                        ".token-price"
                    );


                const changeElement =
                    button.querySelector(
                        ".token-change"
                    );


                const directionElement =
                    button.querySelector(
                        ".token-direction"
                    );


                if (priceElement) {

                    priceElement.textContent =
                        typeof marketToken.price ===
                        "number"

                            ? formatPrice(
                                marketToken.price
                            )

                            : "WAITING";

                }


                if (changeElement) {

                    changeElement.textContent =
                        formatChange(
                            marketToken.change24h
                        );

                }


                if (directionElement) {

                    directionElement.textContent =
                        directionText(
                            marketToken.direction
                        );

                }

            });


        updateSelectedToken();

    }


    /* =========================================
       SELECTED TOKEN
    ========================================= */

    function updateSelectedToken() {

        const selectedToken =
            document.getElementById(
                "selected-token"
            );


        if (
            !selectedToken ||
            !GAME_STATE.currentToken
        ) {

            return;

        }


        const token =
            GAME_STATE.currentToken;


        const marketToken =
            typeof getMarketToken ===
            "function"

                ? getMarketToken(
                    token.symbol
                )

                : null;


        const price =
            marketToken &&
            typeof marketToken.price ===
            "number"

                ? formatPrice(
                    marketToken.price
                )

                : "LIVE PRICE WAITING";


        const change =
            marketToken
                ? formatChange(
                    marketToken.change24h
                )
                : "";


        const direction =
            marketToken
                ? directionText(
                    marketToken.direction
                )
                : "WAITING";


        selectedToken.innerHTML = `

            <div class="selected-token-symbol">

                <strong>
                    ${token.display}
                </strong>

                <span>
                    ${token.symbol}
                </span>

            </div>


            <div class="selected-token-market">

                <strong>
                    ${price}
                </strong>

                <small>
                    ${direction}
                    ${change
                        ? ` · ${change}`
                        : ""}
                </small>

            </div>

        `;

    }


    /* =========================================
       HOME → ARCADE
    ========================================= */

    if (enterArcade) {

        enterArcade.addEventListener(
            "click",
            () => {

                updateCoins();

                showScreen(
                    modeScreen
                );

            }
        );

    }


    /* =========================================
       ARCADE → HOME
    ========================================= */

    if (backHome) {

        backHome.addEventListener(
            "click",
            () => {

                showScreen(
                    homeScreen
                );

            }
        );

    }


    /* =========================================
       GAME → ARCADE
    ========================================= */

    if (backModes) {

        backModes.addEventListener(
            "click",
            () => {

                showScreen(
                    modeScreen
                );

            }
        );

    }


    /* =========================================
       MODE CARDS
    ========================================= */

    modeCards.forEach(card => {

        card.addEventListener(
            "click",
            () => {

                const mode =
                    card.dataset.mode;


                openGame(mode);

            }
        );

    });


    /* =========================================
       OPEN GAME
    ========================================= */

    function openGame(mode) {

        selectMode(mode);


        const names = {

            grinder: "GRINDER",

            smasher: "SMASHER",

            underdog: "UNDERDOG",

            championship: "CHAMPIONSHIP"

        };


        if (activeModeLabel) {

            activeModeLabel.textContent =
                "MEME MADNESS";

        }


        if (activeModeTitle) {

            activeModeTitle.textContent =
                names[mode] || "ARCADE";

        }


        if (mode === "grinder") {

            renderGrinder();

        }

        else {

            renderComingSoon(
                names[mode] || "ARCADE"
            );

        }


        showScreen(
            gameScreen
        );

    }


    /* =========================================
       GRINDER SCREEN
    ========================================= */

    function renderGrinder() {

        gameContent.innerHTML = `

            <section
                class="game-intro grinder-game"
            >

                <span class="section-kicker">
                    GRINDER
                </span>


                <h1>
                    Make your call.
                </h1>


                <p>
                    Pick a token, choose UP or DOWN,
                    and stake your coins.
                </p>


                <div class="grinder-coins">

                    <span>
                        YOUR COINS
                    </span>


                    <strong id="grinder-coins">
                        ${formatCoins(
                            GAME_STATE.coins
                        )}
                    </strong>

                </div>


                <div class="market-status">

                    <span
                        id="market-status-dot"
                        class="status-dot"
                    ></span>


                    <span
                        id="market-status-text"
                    >
                        LIVE DATA NOT CONNECTED
                    </span>

                </div>


                <div class="token-selector">

                    <label>
                        CHOOSE YOUR TOKEN
                    </label>


                    <div
                        class="token-grid"
                        id="grinder-token-grid"
                    >

                        ${TOKENS.map(token => `

                            <button
                                type="button"
                                class="token-choice"
                                data-token="${token.symbol}"
                            >

                                <strong
                                    class="token-symbol"
                                >
                                    ${token.display}
                                </strong>


                                <span
                                    class="token-price"
                                >
                                    WAITING
                                </span>


                                <span
                                    class="token-direction"
                                >
                                    WAITING
                                </span>


                                <small
                                    class="token-change"
                                ></small>

                            </button>

                        `).join("")}

                    </div>

                </div>


                <div
                    id="selected-token"
                    class="selected-token"
                >

                    <span>
                        SELECT A TOKEN TO BEGIN
                    </span>

                </div>


                <div class="prediction-section">

                    <label>
                        WHAT HAPPENS NEXT?
                    </label>


                    <div
                        class="prediction-buttons"
                    >

                        <button
                            type="button"
                            class="prediction-button"
                            data-prediction="up"
                        >

                            ▲

                            <span>
                                UP
                            </span>

                        </button>


                        <button
                            type="button"
                            class="prediction-button"
                            data-prediction="down"
                        >

                            ▼

                            <span>
                                DOWN
                            </span>

                        </button>

                    </div>

                </div>


                <div class="stake-section">

                    <label
                        for="grinder-stake"
                    >
                        STAKE COINS
                    </label>


                    <input
                        id="grinder-stake"
                        type="number"
                        min="${GAME_CONFIG.grinder.minStake}"
                        max="${GAME_CONFIG.grinder.maxStake}"
                        step="100"
                        value="500"
                    >


                    <small>

                        ${GAME_CONFIG.grinder.minStake.toLocaleString()}

                        –

                        ${GAME_CONFIG.grinder.maxStake.toLocaleString()}

                        coins

                    </small>

                </div>


                <button
                    type="button"
                    id="start-grinder"
                    class="primary-button"
                >

                    MAKE YOUR CALL

                    <span>
                        →
                    </span>

                </button>


                <div
                    id="grinder-message"
                    class="grinder-message"
                ></div>

            </section>

        `;


        setupGrinder();

        updateMarketUI();

    }


    /* =========================================
       GRINDER CONTROLLER
    ========================================= */

    function setupGrinder() {

        let selectedPrediction =
            null;


        const tokenButtons =
            document.querySelectorAll(
                ".token-choice"
            );


        const predictionButtons =
            document.querySelectorAll(
                ".prediction-button"
            );


        const startButton =
            document.getElementById(
                "start-grinder"
            );


        const stakeInput =
            document.getElementById(
                "grinder-stake"
            );


        const message =
            document.getElementById(
                "grinder-message"
            );


        const selectedToken =
            document.getElementById(
                "selected-token"
            );


        /* -------------------------
           TOKEN SELECTION
        ------------------------- */

        tokenButtons.forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    tokenButtons.forEach(
                        item => {

                            item.classList.remove(
                                "selected"
                            );

                        }
                    );


                    button.classList.add(
                        "selected"
                    );


                    const token =
                        selectToken(
                            button.dataset.token
                        );


                    if (!token) {
                        return;
                    }


                    updateSelectedToken();


                    if (selectedToken) {

                        selectedToken.scrollIntoView(
                            {
                                behavior: "smooth",
                                block: "nearest"
                            }
                        );

                    }

                }
            );

        });


        /* -------------------------
           UP / DOWN
        ------------------------- */

        predictionButtons.forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        predictionButtons.forEach(
                            item => {

                                item.classList.remove(
                                    "selected"
                                );

                            }
                        );


                        button.classList.add(
                            "selected"
                        );


                        selectedPrediction =
                            button.dataset.prediction;

                    }
                );

            }
        );


        /* -------------------------
           START ROUND
        ------------------------- */

        startButton.addEventListener(
            "click",
            () => {

                if (
                    !GAME_STATE.currentToken
                ) {

                    message.textContent =
                        "Choose a token first.";

                    return;

                }


                if (
                    !selectedPrediction
                ) {

                    message.textContent =
                        "Choose UP or DOWN.";

                    return;

                }


                const stake =
                    Number(
                        stakeInput.value
                    );


                const result =
                    startGrinderRound(
                        selectedPrediction,
                        stake
                    );


                if (!result.success) {

                    message.textContent =
                        result.message;

                    return;

                }


                updateCoins();


                message.textContent =
                    `ROUND LIVE · ${r
