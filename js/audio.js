/* =========================================
   BACKGROUND MUSIC
========================================= */

const siteMusic = document.getElementById("siteMusic");
const musicToggle = document.getElementById("musicToggle");
const musicIcon = document.getElementById("musicIcon");

siteMusic.volume = 0.5;


/* =========================================
   START MUSIC AFTER PRELOADER
========================================= */

function startSiteMusic() {

    siteMusic.currentTime = 0;

    const playPromise = siteMusic.play();

    if (playPromise !== undefined) {

        playPromise
            .then(() => {

                // Music successfully started
                musicToggle.classList.add("playing");
                musicIcon.textContent = "♫";

            })
            .catch(() => {

                // Browser blocked autoplay
                musicToggle.classList.remove("playing");
                musicIcon.textContent = "🔇";

                console.log(
                    "Browser blocked automatic audio playback."
                );

            });
    }
}


/* =========================================
   MUSIC ON / OFF
========================================= */

musicToggle.addEventListener("click", async () => {

    if (siteMusic.paused) {

        try {

            await siteMusic.play();

            musicToggle.classList.add("playing");
            musicIcon.textContent = "♫";

        } catch (error) {

            console.log("Unable to play music.");

        }

    } else {

        siteMusic.pause();

        musicToggle.classList.remove("playing");
        musicIcon.textContent = "🔇";

    }

});


/* =========================================
   KEEP BUTTON STATE CORRECT
========================================= */

siteMusic.addEventListener("play", () => {

    musicToggle.classList.add("playing");
    musicIcon.textContent = "♫";

});


siteMusic.addEventListener("pause", () => {

    musicToggle.classList.remove("playing");
    musicIcon.textContent = "🔇";

});