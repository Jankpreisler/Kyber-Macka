

/* PRECHOD */

function krasneprehadzovanie(url) {

    document.body.style.opacity = "0";
    document.body.style.transition = "0.4s";

    setTimeout(() => {

        window.location.href = url;

    }, 400);
}

/* MUSIC */

window.addEventListener('click', () => {

    const music = document.getElementById("bgMusic");

    if (music && music.paused) {

        music.play().catch(err => {

            console.warn("Autoplay blokovaný:", err);

        });
    }

}, { once: true });

/* VOLUME */

const music =
    document.getElementById("bgMusic");

const volumeControl =
    document.getElementById("volumeControl");

if(volumeControl && music){

    const savedVolume =
        localStorage.getItem("gameVolume");

    if(savedVolume !== null){

        music.volume = savedVolume;
        volumeControl.value = savedVolume;

    } else {

        music.volume = 0.5;
    }

    volumeControl.addEventListener("input", () => {

        music.volume = volumeControl.value;

        localStorage.setItem(
            "gameVolume",
            volumeControl.value
        );
    });
}