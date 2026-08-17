/* =========================================
   MEME MADNESS
   APP CONTROLLER
========================================= */

document.addEventListener("DOMContentLoaded", () => {

    const homeScreen = document.getElementById("home-screen");
    const modeScreen = document.getElementById("mode-screen");
    const gameScreen = document.getElementById("game-screen");

    const enterArcade = document.getElementById("enter-arcade");
    const backHome = document.getElementById("back-home");
    const backModes = document.getElementById("back-modes");

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

        document.querySelectorAll(".screen").forEach(item => {
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
            Math.floor(Number(amount) || 0)
        ).toLocaleString();

    }


    function updateCoins() {

        document
            .querySelectorAll("[data-coins]")
            .forEach(element => {

                element.textContent =
                    formatCoins(GAME_STATE.coins);

            });

        const grinderCoins =
            document.getElementById("grinder-coins");

        if (grinderCoins) {

            grinderCoins.textContent =
                formatCoins(GAME_STATE.coins);

        }

    }


    /* =========================================
       MARKET HELPERS
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
            change > 0 ? "+" : "";

        return `${sign}${change.toFixed(2)}%`;

    }


    function getDirection(direction) {

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


    function updateMarketUI() {

        if (
            typeof getMarketSnapshot !== "function"
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


                const price =
                    button.querySelector(
                        ".token-price"
                    );

                const direction =
                    button.querySelector(
                        ".token-direction"
                    );

                const change =
                    button.querySelector(
                        ".token-change"
                    );


                if (price) {

                    price.textContent =
                        typeof marketToken.price === "number"
                            ? formatPrice(marketToken.price)
                            : "WAITING";

                }


                if (direction) {

                    direction.textContent =
                        getDirection(
                            marketToken.direction
                        );

                }


                if (change) {

                    change.textContent =
                        formatChange(
                            marketToken.change24h
                        );

                }

            });


        updateSelectedToken();

    }


    function updateSelectedToken() {

        const container =
            document.getElementById(
                "selected-token"
            );

        if (
            !container ||
            !GAME_STATE.currentToken
        ) {
            return;
        }


        const token =
            GAME_STATE.currentToken;

        const marketToken =
            typeof getMarketToken === "function"
                ? getMarketToken(token.symbol)
                : null;


        const price =
            marketToken
            && typeof marketToken.price === "number"
                ? formatPrice(marketToken.price)
                : "WAITING";


        const direction =
            marketToken
                ? getDirection(marketToken.direction)
                : "WAITING";


        const change =
            marketToken
                ? formatChange(marketToken.change24h)
                : "";


        container.innerHTML = `

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
                    ${change ? ` · ${change}` : ""}
                </small>

            </div>

        `;

    }


    /* =========================================
       HOME → ARCADE
    ========================================= */

    if (enterArcade) {

        enterArcade.addEventListener("click", () => {

            updateCoins();
            showScreen(modeScreen);

        });

    }


    /* =========================================
       ARCADE → HOME
    ========================================= */

    if (backHome) {

        backHome.addEventListener("click", () => {

            showScreen(homeScreen);

        });

    }


    /* =========================================
       GAME → ARCADE
    ========================================= */

    if (backModes) {

        backModes.addEventListener("click", () => {

            showScreen(modeScreen);

        });

    }


    /* =========================================
       MODE CARDS
    ========================================= */

    document
        .querySelectorAll(".mode-card")
        .forEach(card => {

            card.addEventListener("click", () => {

                openGame(
                    card.dataset.mode
                );

            });

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


        const title =
            names[mode] || "ARCADE";


        if (activeModeLabel) {
            activeModeLabel.textContent =
                "MEME MADNESS";
        }


        if (activeModeTitle) {
            activeModeTitle.textContent =
                title;
        }


        if (mode === "grinder") {

            renderGrinder();

        } else if (mode === "smasher") {

            renderSmasher();

        } else if (mode === "underdog") {

            renderUnderdog();

        } else if (mode === "championship") {

            renderChampionship();

        } else {

            renderComingSoon(title);

        }


        showScreen(gameScreen);

    }


    /* =========================================
       GRINDER
    ========================================= */

    function renderGrinder() {

        gameContent.innerHTML = `

            <section class="game-intro grinder-game">

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
                        ${formatCoins(GAME_STATE.coins)}
                    </strong>

                </div>


                <div class="market-status">

                    <span
                        id="market-status-dot"
                        class="status-dot"
                    ></span>

                    <span id="market-status-text">
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

                        ${TOKENS.map(token => {

                            const marketToken =
                                typeof getMarketToken === "function"
                                    ? getMarketToken(token.symbol)
                                    : null;

                            const imageUrl =
                                marketToken?.imageUrl || "";

                            const displayName =
                                marketToken?.name ||
                                token.display;

                            const displaySymbol =
                                marketToken?.symbol ||
                                token.symbol;

                            return `

                            <button
                                type="button"
                                class="token-choice"
                                data-token="${token.symbol}"
                            >

                                <div class="token-image-wrap">

                                    ${
                                        imageUrl
                                            ? `<img
                                                class="token-image"
                                                src="${imageUrl}"
                                                alt="${displayName}"
                                                loading="lazy"
                                            >`
                                            : `<div class="token-image-placeholder">
                                                ${displaySymbol}
                                            </div>`
                                    }

                                </div>

                                <div class="token-info">

                                    <strong class="token-symbol">
                                        ${displaySymbol}
                                    </strong>

                                    <span class="token-name">
                                        ${displayName}
                                    </span>

                                    <span class="token-price">
                                        WAITING
                                    </span>

                                    <span class="token-direction">
                                        WAITING
                                    </span>

                                    <small class="token-change"></small>

                                </div>

                            </button>

                            `;

                        }).join("")}

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


                <div
                    id="token-action-panel"
                    class="token-action-panel"
                >

                    <button
                        type="button"
                        id="play-token"
                        class="token-action-button play"
                    >
                        PLAY
                    </button>


                    <button
                        type="button"
                        id="parlay-token"
                        class="token-action-button parlay"
                    >
                        PARLAY
                    </button>

                </div>


                <div
                    class="prediction-section grinder-play-controls"
                    id="grinder-play-controls"
                >

                    <label>
                        WHAT HAPPENS NEXT?
                    </label>

                    <div class="prediction-buttons">

                        <button
                            type="button"
                            class="prediction-button"
                            data-prediction="up"
                        >
                            ▲
                            <span>UP</span>
                        </button>

                        <button
                            type="button"
                            class="prediction-button"
                            data-prediction="down"
                        >
                            ▼
                            <span>DOWN</span>
                        </button>

                    </div>

                </div>


                <div class="stake-section grinder-play-controls">

                    <label for="grinder-stake">
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
                    class="primary-button grinder-play-controls"
                >

                    MAKE YOUR CALL

                    <span>→</span>

                </button>


                <div
                    id="parlay-slip"
                    class="parlay-slip"
                >
                    <div class="parlay-slip-header">
                        <strong>PARLAY SLIP</strong>
                        <span id="parlay-leg-count">0 LEGS</span>
                    </div>

                    <div
                        id="parlay-legs"
                        class="parlay-legs"
                    ></div>

                    <div class="parlay-stake">
                        <label for="parlay-stake">
                            STAKE COINS
                        </label>

                        <input
                            id="parlay-stake"
                            type="number"
                            min="100"
                            max="5000"
                            step="100"
                            value="500"
                        />

                        <small>
                            100 – 5,000 coins
                        </small>
                    </div>

                    <button
                        type="button"
                        id="place-parlay"
                        class="primary-button parlay-place-button"
                    >
                        PLACE PARLAY
                        <span>→</span>
                    </button>
                </div>

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

        let selectedPrediction = null;

        /*
         * PARLAY BUILDER
         *
         * Each leg stores:
         * - token symbol
         * - token display name
         * - prediction (up/down)
         */
        let parlayMode = false;
        let parlayLegs = [];


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


        const parlaySlip =
            document.getElementById(
                "parlay-slip"
            );

        const parlayLegsContainer =
            document.getElementById(
                "parlay-legs"
            );

        const parlayLegCount =
            document.getElementById(
                "parlay-leg-count"
            );


        function updateParlaySlip() {

            if (
                !parlaySlip ||
                !parlayLegsContainer
            ) {
                return;
            }


            const count =
                parlayLegs.length;


            if (parlayLegCount) {

                parlayLegCount.textContent =
                    `${count} LEG${count === 1 ? "" : "S"}`;

            }


            if (!parlayMode || count < 2) {

                parlaySlip.classList.remove(
                    "visible"
                );

                parlayLegsContainer.innerHTML = "";

                return;

            }


            parlaySlip.classList.add(
                "visible"
            );


            parlayLegsContainer.innerHTML =
                parlayLegs.map(
                    (leg, index) => `

                        <div
                            class="parlay-leg-row"
                            data-parlay-symbol="${leg.symbol}"
                        >

                            <span class="parlay-leg-token">
                                ${index + 1}. ${leg.display || leg.symbol}
                            </span>

                            <div class="parlay-leg-actions">

                                <button
                                    type="button"
                                    class="parlay-prediction-button ${
                                        leg.prediction === "up"
                                            ? "selected"
                                            : ""
                                    }"
                                    data-parlay-prediction="up"
                                    data-parlay-symbol="${leg.symbol}"
                                >
                                    UP
                                </button>

                                <button
                                    type="button"
                                    class="parlay-prediction-button ${
                                        leg.prediction === "down"
                                            ? "selected"
                                            : ""
                                    }"
                                    data-parlay-prediction="down"
                                    data-parlay-symbol="${leg.symbol}"
                                >
                                    DOWN
                                </button>

                            </div>

                        </div>

                    `
                ).join("");


            parlayLegsContainer
                .querySelectorAll(
                    ".parlay-prediction-button"
                )
                .forEach(button => {

                    button.addEventListener(
                        "click",
                        () => {

                            const symbol =
                                button.dataset.parlaySymbol;

                            const prediction =
                                button.dataset.parlayPrediction;


                            const leg =
                                parlayLegs.find(
                                    item =>
                                        item.symbol === symbol
                                );


                            if (!leg) {
                                return;
                            }


                            leg.prediction =
                                prediction;


                            updateParlaySlip();


                            if (message) {

                                const completed =
                                    parlayLegs.filter(
                                        item =>
                                            item.prediction
                                    ).length;

                                message.textContent =
                                    `PARLAY · ${completed}/${parlayLegs.length} LEGS HAVE A PREDICTION.`;

                            }

                        }
                    );

                });

        }


        tokenButtons.forEach(button => {

            button.addEventListener("click", () => {

                tokenButtons.forEach(item => {

                    item.classList.remove("selected");

                });


                button.classList.add("selected");


                const token =
                    selectToken(
                        button.dataset.token
                    );


                if (!token) {
                    return;
                }


                /*
                 * PARLAY MODE
                 *
                 * Selecting another token adds it as
                 * another leg instead of opening PLAY.
                 */
                if (parlayMode) {

                    const alreadyAdded =
                        parlayLegs.some(
                            leg =>
                                leg.symbol === token.symbol
                        );

                    if (!alreadyAdded) {

                        parlayLegs.push({
                            symbol: token.symbol,
                            display: token.display,
                            prediction: null
                        });

                    }

                    button.classList.add("parlay-leg");

                    updateSelectedToken();

                    updateParlaySlip();

                    const message =
                        document.getElementById(
                            "grinder-message"
                        );

                    if (message) {

                        message.textContent =
                            `PARLAY · ${parlayLegs.length} LEG${parlayLegs.length === 1 ? "" : "S"} SELECTED · CHOOSE UP OR DOWN.`;
                    }

                    return;
                }


                updateSelectedToken();


                const actionPanel =
                    document.getElementById(
                        "token-action-panel"
                    );


                if (actionPanel) {

                    
                    const playControls =
                        document.querySelectorAll(
                            ".grinder-play-controls"
                        );

                    playControls.forEach(control => {
                        control.classList.remove("visible");
                    });

                    actionPanel.classList.add("visible");

                }

            });

        });


        const playTokenButton =
            document.getElementById(
                "play-token"
            );

        const parlayTokenButton =
            document.getElementById(
                "parlay-token"
            );


        if (playTokenButton) {

            playTokenButton.addEventListener(
                "click",
                () => {

                    const playControls =
                        document.querySelectorAll(
                            ".grinder-play-controls"
                        );

                    playControls.forEach(control => {
                        control.classList.add("visible");
                    });

                    const predictionSection =
                        document.querySelector(
                            ".prediction-section"
                        );

                    if (predictionSection) {

                        predictionSection.scrollIntoView({
                            behavior: "smooth",
                            block: "nearest"
                        });

                    }

                }
            );

        }


        if (parlayTokenButton) {

            parlayTokenButton.addEventListener(
                "click",
                () => {

                    const token =
                        GAME_STATE.currentToken;

                    const message =
                        document.getElementById(
                            "grinder-message"
                        );

                    if (!token) {
                        return;
                    }

                    /*
                     * Enter parlay-building mode.
                     * The currently selected token becomes
                     * the first leg.
                     */
                    parlayMode = true;

                    parlayLegs = [{
                        symbol: token.symbol,
                        display: token.display,
                        prediction: null
                    }];

                    /*
                     * Hide the token action buttons.
                     * The player now chooses another token.
                     */
                    const actionPanel =
                        document.getElementById(
                            "token-action-panel"
                        );

                    if (actionPanel) {
                        actionPanel.classList.remove("visible");
                    }

                    /*
                     * Hide normal single-play controls.
                     */
                    document
                        .querySelectorAll(
                            ".grinder-play-controls"
                        )
                        .forEach(control => {
                            control.classList.remove("visible");
                        });

                    if (message) {

                        message.textContent =
                            "PARLAY MODE · SELECT ANOTHER TOKEN.";
                    }

                    /*
                     * Mark the first token as a parlay leg.
                     */
                    const selectedButton =
                        document.querySelector(
                            `.token-choice[data-token="${token.symbol}"]`
                        );

                    if (selectedButton) {
                        selectedButton.classList.add(
                            "parlay-leg"
                        );
                    }

                }
            );

        }


        const placeParlayButton =
            document.getElementById(
                "place-parlay"
            );

        const parlayStakeInput =
            document.getElementById(
                "parlay-stake"
            );


        if (placeParlayButton) {

            placeParlayButton.addEventListener(
                "click",
                () => {

                    const message =
                        document.getElementById(
                            "grinder-message"
                        );


                    if (!parlayMode) {

                        if (message) {
                            message.textContent =
                                "PARLAY · START BY CHOOSING PARLAY.";
                        }

                        return;
                    }


                    if (parlayLegs.length < 2) {

                        if (message) {
                            message.textContent =
                                "PARLAY · SELECT AT LEAST 2 TOKENS.";
                        }

                        return;
                    }


                    const missingPrediction =
                        parlayLegs.some(
                            leg => !leg.prediction
                        );


                    if (missingPrediction) {

                        if (message) {
                            message.textContent =
                                "PARLAY · EVERY LEG NEEDS UP OR DOWN.";
                        }

                        return;
                    }


                    const stake =
                        Number(
                            parlayStakeInput
                                ? parlayStakeInput.value
                                : 0
                        );


                    if (
                        !Number.isFinite(stake) ||
                        stake < 100 ||
                        stake > 5000
                    ) {

                        if (message) {
                            message.textContent =
                                "PARLAY · STAKE MUST BE 100–5,000 COINS.";
                        }

                        return;
                    }


                    if (stake > GAME_STATE.coins) {

                        if (message) {
                            message.textContent =
                                "PARLAY · NOT ENOUGH COINS.";
                        }

                        return;
                    }


                    const result =
                        startParlayRound(
                            parlayLegs,
                            stake
                        );

                    if (!result.success) {

                        if (message) {
                            message.textContent =
                                result.message;
                        }

                        return;
                    }

                    if (!spendCoins(stake)) {

                        GAME_STATE.parlay.active = false;
                        GAME_STATE.parlay.stake = 0;
                        GAME_STATE.parlay.legs = [];
                        GAME_STATE.parlay.startedAt = null;

                        if (message) {
                            message.textContent =
                                "PARLAY · UNABLE TO PLACE STAKE.";
                        }

                        return;
                    }

                    updateCoins();

                    if (message) {
                        message.textContent =
                            `PARLAY LIVE · ${parlayLegs.length} LEGS · ${result.seconds}s`;
                    }

                    placeParlayButton.disabled = true;

                    if (parlayStakeInput) {
                        parlayStakeInput.disabled = true;
                    }

                    parlaySlip.classList.add("placed");

                    runParlayCountdown(
                        result.seconds,
                        placeParlayButton,
                        message
                    );

                }
            );

        }


        predictionButtons.forEach(button => {

            button.addEventListener("click", () => {

                predictionButtons.forEach(item => {

                    item.classList.remove(
                        "selected"
                    );

                });


                button.classList.add(
                    "selected"
                );


                selectedPrediction =
                    button.dataset.prediction;


                if (parlayMode && GAME_STATE.currentToken) {

                    const leg =
                        parlayLegs.find(
                            item =>
                                item.symbol ===
                                GAME_STATE.currentToken.symbol
                        );

                    if (leg) {
                        leg.prediction =
                            selectedPrediction;
                    }

                    const message =
                        document.getElementById(
                            "grinder-message"
                        );

                    if (message) {

                        const completed =
                            parlayLegs.filter(
                                item => item.prediction
                            ).length;

                        message.textContent =
                            `PARLAY · ${completed}/${parlayLegs.length} LEGS HAVE A PREDICTION.`;
                    }

                    updateParlaySlip();

                }

            });

        });


        if (!startButton) {
            return;
        }


        startButton.addEventListener("click", () => {

            if (!GAME_STATE.currentToken) {

                message.textContent =
                    "Choose a token first.";

                return;

            }


            if (!selectedPrediction) {

                message.textContent =
                    "Choose UP or DOWN.";

                return;

            }


            const stake =
                Number(stakeInput.value);


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
                `ROUND LIVE · ${result.seconds}s`;


            startButton.disabled = true;
            startButton.textContent =
                "ROUND LIVE";


            runGrinderCountdown(
                result.seconds,
                startButton,
                message
            );

        });

    }


    /* =========================================
       GRINDER COUNTDOWN
    ========================================= */

    function runGrinderCountdown(
        seconds,
        button,
        message
    ) {

        let remaining =
            Number(seconds) || 0;


        const timer =
            setInterval(() => {

                remaining--;


                if (remaining > 0) {

                    message.textContent =
                        `ROUND LIVE · ${remaining}s`;

                    return;

                }


                clearInterval(timer);


                const result =
                    resolveGrinderRound();


                if (!result.success) {

                    message.textContent =
                        result.message;

                    button.disabled = false;
                    button.textContent =
                        "MAKE YOUR CALL";

                    return;

                }


                updateCoins();


                if (result.won) {

                    message.textContent =
                        `YOU WIN · +${result.net.toLocaleString()} COINS`;

                } else {

                    message.textContent =
                        `ROUND LOST · ${result.net.toLocaleString()} COINS`;

                }


                button.disabled = false;
                button.textContent =
                    "PLAY AGAIN";


                updateMarketUI();

            }, 1000);

    }


    /* =========================================
       PARLAY COUNTDOWN
    ========================================= */
    function runParlayCountdown(
        seconds,
        button,
        message
    ) {

        let remaining =
            Number(seconds) || 0;

        const timer =
            setInterval(() => {

                remaining--;

                if (remaining > 0) {

                    message.textContent =
                        `PARLAY LIVE · ${remaining}s`;

                    return;
                }

                clearInterval(timer);

                const result =
                    resolveParlayRound();

                if (!result.success) {

                    message.textContent =
                        result.message;

                    button.disabled = false;
                    button.textContent =
                        "PLACE PARLAY";

                    if (parlayStakeInput) {
                        parlayStakeInput.disabled = false;
                    }

                    return;
                }

                updateCoins();

                const legSummary =
                    result.legs
                        .map((leg) => {

                            const status =
                                leg.won ? "WIN" : "LOSS";

                            const start =
                                Number(leg.startPrice).toFixed(6);

                            const end =
                                Number(leg.endPrice).toFixed(6);

                            return (
                                `${status} · ${leg.display} · ` +
                                `${leg.prediction.toUpperCase()} · ` +
                                `ACTUAL ${leg.direction.toUpperCase()} · ` +
                                `${start} → ${end}`
                            );

                        })
                        .join(" | ");

                if (result.won) {

                    message.textContent =
                        `PARLAY WON · STAKE ${result.stake.toLocaleString()} · RETURN ${result.payout.toLocaleString()} · PROFIT +${result.net.toLocaleString()} · BALANCE ${result.coins.toLocaleString()} · ${legSummary}`;

                } else {

                    message.textContent =
                        `PARLAY LOST · STAKE ${result.stake.toLocaleString()} · LOSS -${Math.abs(result.net).toLocaleString()} · BALANCE ${result.coins.toLocaleString()} · ${legSummary}`;

                }

                button.disabled = false;
                button.textContent =
                    "PLACE PARLAY";

                if (parlayStakeInput) {
                    parlayStakeInput.disabled = false;
                }

                parlaySlip.classList.remove("placed");

                updateMarketUI();

            }, 1000);

    }


    /* =========================================
       OTHER GAMES
    ========================================= */


    /* =========================================
       SMASHER
    ========================================= */

    function renderSmasher() {
        gameContent.innerHTML = `
            <section class="game-intro">
                <span class="section-kicker">SMASHER</span>
                <h1>CHASE THE MULTIPLIER.</h1>
                <p>Start a round and cash out before the crash.</p>

                <div class="grinder-coins">
                    <span>YOUR COINS</span>
                    <strong data-coins>
                        ${formatCoins(GAME_STATE.coins)}
                    </strong>
                </div>

                <div class="smasher-display">
                    <span class="section-kicker">CURRENT MULTIPLIER</span>
                    <strong id="smasher-multiplier">1.00×</strong>
                    <span id="smasher-status">READY</span>
                </div>

                <div class="stake-section">
                    <label for="smasher-stake">STAKE COINS</label>
                    <input
                        id="smasher-stake"
                        type="number"
                        min="${GAME_CONFIG.grinder.minStake}"
                        max="${GAME_CONFIG.grinder.maxStake}"
                        step="100"
                        value="500"
                    >
                </div>

                <button
                    type="button"
                    id="smasher-start"
                    class="primary-button"
                >
                    START SMASHER <span>→</span>
                </button>

                <button
                    type="button"
                    id="smasher-cashout"
                    class="primary-button"
                    disabled
                >
                    CASH OUT
                </button>

                <div id="smasher-message" class="game-message">
                    Ready to play.
                </div>
            </section>
        `;

        const stakeInput = document.getElementById("smasher-stake");
        const startButton = document.getElementById("smasher-start");
        const cashoutButton = document.getElementById("smasher-cashout");
        const multiplierElement =
            document.getElementById("smasher-multiplier");
        const statusElement =
            document.getElementById("smasher-status");
        const message =
            document.getElementById("smasher-message");

        let timer = null;

        startButton.addEventListener("click", () => {
            const stake = Number(stakeInput.value);

            if (typeof startSmasherRound !== "function") {
                message.textContent = "SMASHER ENGINE NOT READY.";
                return;
            }

            const result = startSmasherRound(stake);

            if (!result.success) {
                message.textContent = result.message;
                return;
            }

            updateCoins();

            startButton.disabled = true;
            stakeInput.disabled = true;
            cashoutButton.disabled = false;

            statusElement.textContent = "LIVE";
            message.textContent =
                "SMASHER LIVE · CASH OUT BEFORE THE CRASH.";

            let multiplier = Number(result.multiplier) || 1;
            multiplierElement.textContent =
                `${multiplier.toFixed(2)}×`;

            timer = setInterval(() => {
                if (!GAME_STATE.smasher.active) {
                    clearInterval(timer);
                    timer = null;
                    return;
                }

                multiplier += 0.05;
                multiplierElement.textContent =
                    `${multiplier.toFixed(2)}×`;

                if (
                    typeof GAME_STATE.smasher.crashAt === "number" &&
                    multiplier >= GAME_STATE.smasher.crashAt
                ) {
                    clearInterval(timer);
                    timer = null;

                    const resolved =
                        typeof resolveSmasherRound === "function"
                            ? resolveSmasherRound()
                            : null;

                    if (!resolved) {
                        message.textContent =
                            "SMASHER RESOLUTION UNAVAILABLE.";
                        return;
                    }

                    updateCoins();

                    multiplierElement.textContent =
                        `${Number(resolved.multiplier || multiplier).toFixed(2)}×`;

                    statusElement.textContent = "CRASHED";

                    message.textContent =
                        `SMASHER LOST · ${resolved.net.toLocaleString()} COINS`;

                    startButton.disabled = false;
                    stakeInput.disabled = false;
                    cashoutButton.disabled = true;
                }
            }, 1000);
        });

        cashoutButton.addEventListener("click", () => {
            if (typeof cashOutSmasher !== "function") {
                message.textContent =
                    "SMASHER CASH-OUT ENGINE NOT READY.";
                return;
            }

            const result = cashOutSmasher();

            if (!result.success) {
                message.textContent = result.message;
                return;
            }

            if (timer) {
                clearInterval(timer);
                timer = null;
            }

            updateCoins();

            multiplierElement.textContent =
                `${Number(result.multiplier || 1).toFixed(2)}×`;

            statusElement.textContent = "CASHED OUT";

            message.textContent =
                `SMASHER WON · +${result.net.toLocaleString()} COINS`;

            startButton.disabled = false;
            stakeInput.disabled = false;
            cashoutButton.disabled = true;
        });
    }


    /* =========================================
       UNDERDOG
    ========================================= */

    function renderUnderdog() {
        gameContent.innerHTML = `
            <section class="game-intro">
                <span class="section-kicker">UNDERDOG</span>
                <h1>BACK THE UNEXPECTED.</h1>
                <p>Pick a meme, choose a direction, and play the round.</p>

                <div class="grinder-coins">
                    <span>YOUR COINS</span>
                    <strong data-coins>
                        ${formatCoins(GAME_STATE.coins)}
                    </strong>
                </div>

                <div class="token-grid">
                    ${TOKENS.map(token => `
                        <button
                            type="button"
                            class="token-choice underdog-token"
                            data-token="${token.symbol}"
                        >
                            <strong>${token.symbol}</strong>
                            <span>${token.display}</span>
                        </button>
                    `).join("")}
                </div>

                <div class="prediction-buttons">
                    <button
                        type="button"
                        class="prediction-button"
                        data-underdog-prediction="up"
                    >
                        ▲ <span>UP</span>
                    </button>

                    <button
                        type="button"
                        class="prediction-button"
                        data-underdog-prediction="down"
                    >
                        ▼ <span>DOWN</span>
                    </button>
                </div>

                <div class="stake-section">
                    <label for="underdog-stake">STAKE COINS</label>
                    <input
                        id="underdog-stake"
                        type="number"
                        min="${GAME_CONFIG.grinder.minStake}"
                        max="${GAME_CONFIG.grinder.maxStake}"
                        step="100"
                        value="500"
                    >
                </div>

                <button
                    type="button"
                    id="underdog-start"
                    class="primary-button"
                >
                    START UNDERDOG <span>→</span>
                </button>

                <div id="underdog-message" class="game-message">
                    Select a token and direction.
                </div>
            </section>
        `;

        let selectedToken = null;
        let prediction = null;

        const message =
            document.getElementById("underdog-message");
        const stakeInput =
            document.getElementById("underdog-stake");
        const startButton =
            document.getElementById("underdog-start");

        document.querySelectorAll(".underdog-token").forEach(button => {
            button.addEventListener("click", () => {
                document
                    .querySelectorAll(".underdog-token")
                    .forEach(item => item.classList.remove("selected"));

                button.classList.add("selected");

                selectedToken = button.dataset.token;

                if (GAME_STATE.underdog) {
                    GAME_STATE.underdog.selectedToken = selectedToken;
                }

                message.textContent =
                    `TOKEN SELECTED · ${selectedToken}`;
            });
        });

        document
            .querySelectorAll("[data-underdog-prediction]")
            .forEach(button => {
                button.addEventListener("click", () => {
                    document
                        .querySelectorAll("[data-underdog-prediction]")
                        .forEach(item =>
                            item.classList.remove("selected")
                        );

                    button.classList.add("selected");

                    prediction =
                        button.dataset.underdogPrediction;

                    message.textContent =
                        `PREDICTION · ${prediction.toUpperCase()}`;
                });
            });

        startButton.addEventListener("click", () => {
            if (!selectedToken) {
                message.textContent =
                    "UNDERDOG · CHOOSE A TOKEN.";
                return;
            }

            if (!prediction) {
                message.textContent =
                    "UNDERDOG · CHOOSE UP OR DOWN.";
                return;
            }

            const stake = Number(stakeInput.value);

            if (typeof startUnderdogRound !== "function") {
                message.textContent =
                    "UNDERDOG ENGINE NOT READY.";
                return;
            }

            const result =
                startUnderdogRound(prediction, stake);

            if (!result.success) {
                message.textContent = result.message;
                return;
            }

            updateCoins();

            startButton.disabled = true;
            stakeInput.disabled = true;

            let remaining = Number(result.seconds) || 0;

            message.textContent =
                `UNDERDOG LIVE · ${remaining}s`;

            const timer = setInterval(() => {
                remaining--;

                if (remaining > 0) {
                    message.textContent =
                        `UNDERDOG LIVE · ${remaining}s`;
                    return;
                }

                clearInterval(timer);

                if (typeof resolveUnderdogRound !== "function") {
                    message.textContent =
                        "UNDERDOG RESOLUTION UNAVAILABLE.";
                    startButton.disabled = false;
                    stakeInput.disabled = false;
                    return;
                }

                const resolved = resolveUnderdogRound();

                if (!resolved.success) {
                    message.textContent = resolved.message;
                } else if (resolved.won) {
                    message.textContent =
                        `UNDERDOG WON · +${resolved.net.toLocaleString()} COINS`;
                } else {
                    message.textContent =
                        `UNDERDOG LOST · ${resolved.net.toLocaleString()} COINS`;
                }

                updateCoins();

                startButton.disabled = false;
                stakeInput.disabled = false;
            }, 1000);
        });
    }


    /* =========================================
       CHAMPIONSHIP
    ========================================= */

    function renderChampionship() {
        gameContent.innerHTML = `
            <section class="game-intro">
                <span class="section-kicker">CHAMPIONSHIP</span>
                <h1>BUILD YOUR RECORD.</h1>
                <p>Play through the championship and track your season.</p>

                <div class="grinder-coins">
                    <span>YOUR COINS</span>
                    <strong data-coins>
                        ${formatCoins(GAME_STATE.coins)}
                    </strong>
                </div>

                <div class="game-message" id="championship-message">
                    Championship ready.
                </div>

                <button
                    type="button"
                    id="championship-start"
                    class="primary-button"
                >
                    START CHAMPIONSHIP <span>→</span>
                </button>

                <button
                    type="button"
                    id="championship-reset"
                    class="primary-button"
                >
                    RESET RECORD
                </button>
            </section>
        `;

        const message =
            document.getElementById("championship-message");

        const startButton =
            document.getElementById("championship-start");

        const resetButton =
            document.getElementById("championship-reset");

        startButton.addEventListener("click", () => {
            if (typeof startChampionshipDay !== "function") {
                message.textContent =
                    "CHAMPIONSHIP ENGINE NOT READY.";
                return;
            }

            const result = startChampionshipDay();

            message.textContent =
                result && result.message
                    ? result.message
                    : "CHAMPIONSHIP STARTED.";
        });

        resetButton.addEventListener("click", () => {
            if (typeof resetChampionship !== "function") {
                message.textContent =
                    "CHAMPIONSHIP RESET ENGINE NOT READY.";
                return;
            }

            resetChampionship();

            message.textContent =
                "CHAMPIONSHIP RECORD RESET.";

            updateCoins();
        });
    }


    function renderComingSoon(title) {

        gameContent.innerHTML = `

            <section class="game-intro">

                <span class="section-kicker">
                    ${title}
                </span>

                <h1>
                    ${title} IS LOADING
                </h1>

                <p>
                    This game will use the
                    same live market system.
                </p>

            </section>

        `;

    }


    /* =========================================
       MARKET REFRESH
    ========================================= */

    setInterval(() => {

        updateMarketUI();

    }, 1000);


    /* =========================================
       INITIAL STATE
    ========================================= */

    showScreen(homeScreen);
    updateCoins();

});
