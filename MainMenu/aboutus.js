/* PRECHOD STRÁNOK */

function krasneprehadzovanie(url){

    document.body.style.opacity = "0";
    document.body.style.transition = "0.4s";

    setTimeout(() => {

        window.location.href = url;

    }, 400);
}

/* HUDBA */

const music = document.getElementById("bgMusic");

/* NAČÍTANIE HLASITOSTI */

const savedVolume = localStorage.getItem("gameVolume");

if(savedVolume !== null){

    music.volume = savedVolume;

}else{

    music.volume = 0.5;
}

/* AUTOPLAY FIX */

window.addEventListener('click', () => {

    if(music && music.paused){

        music.play().catch(err => {

            console.warn("Autoplay blokovaný:", err);

        });
    }

}, { once:true });