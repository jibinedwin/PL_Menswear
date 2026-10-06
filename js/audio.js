/* =========================================
   BACKGROUND MUSIC
========================================= */

const siteMusic = document.getElementById("siteMusic");
const musicToggle = document.getElementById("musicToggle");
const musicIcon = document.getElementById("musicIcon");

siteMusic.volume = 0.5;
let musicIntentionallyStarted = false;

// Invisible interaction listeners to unlock audio element for iOS Safari
let audioUnlocked = false;
const unlockAudio = () => {
    if (!audioUnlocked) {
        audioUnlocked = true;
        
        // Temporarily play and pause to unlock the audio context
        if (siteMusic.paused && !musicIntentionallyStarted) {
            const p = siteMusic.play();
            if (p !== undefined) {
                p.then(() => {
                    if (!musicIntentionallyStarted) {
                        siteMusic.pause();
                        siteMusic.currentTime = 0;
                    }
                }).catch(() => {});
            }
        }
        
        document.removeEventListener("click", unlockAudio);
        document.removeEventListener("touchstart", unlockAudio);
    }
};
document.addEventListener("click", unlockAudio, { once: true });
document.addEventListener("touchstart", unlockAudio, { once: true });

/* =========================================
   START MUSIC AFTER PRELOADER
========================================= */

function startSiteMusic() {
    musicIntentionallyStarted = true;
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