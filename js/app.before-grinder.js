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

    const modeCards = document.querySelectorAll(".mode-card");

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
       HOME → ARCADE
    ========================================= */

    enterArcade.addEventListener("click", () => {

        showScreen(modeScreen);

    });


    /* =========================================
       ARCADE → HOME
    ========================================= */

    backHome.addEventListener("click", () => {

        showScreen(homeScreen);

    });


    /* =========================================
       GAME → ARCADE
    ========================================= */

    backModes.addEventListener("click", () => {

        showScreen(modeScreen);

    });


    /* =========================================
       MODE SELECTION
    ========================================= */

    modeCards.forEach(card => {

        card.addEventListener("click", () => {

            const mode = card.dataset.mode;

            openGame(mode);

        });

    });


    /* =========================================
       OPEN GAME
    ========================================= */

    function openGame(mode) {

        const modeNames = {
            grinder: "GRINDER",
            smasher: "SMASHER",
            underdog: "UNDERDOG",
            championship: "CHAMPIONSHIP"
        };

        const modeDescriptions = {
            grinder:
                "Make smart calls and build your coin stack.",

            smasher:
                "Take bigger risks and chase bigger scores.",

            underdog:
                "Back the unexpected and prove your instincts.",

            championship:
                "Put your prediction skills to the ultimate test."
        };

        const title =
            modeNames[mode] || "ARCADE";

        const description =
            modeDescriptions[mode] || "";


        activeModeLabel.textContent = "MEME MADNESS";

        activeModeTitle.textContent = title;


        /*
         * This is the game entrance only.
         * The actual game mechanics will be built next.
         */

        gameContent.innerHTML = `
            <section class="game-intro">

                <span class="section-kicker">
                    ${title}
                </span>

                <h1>
                    ${description}
                </h1>

                <p>
                    Choose your meme and get ready
                    to make your call.
                </p>

            </section>
        `;


        showScreen(gameScreen);

    }


    /* =========================================
       INITIAL STATE
    ========================================= */

    showScreen(homeScreen);

});
