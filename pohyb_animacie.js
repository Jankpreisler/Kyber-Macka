// === POHYBOVÉ ANIMÁCIE MAČKY ===

// Načítanie obrázkov
const animacie = {
    dopredu: [
        new Image(),
        new Image(),
        new Image()
    ],
    dozadu: [
        new Image(),
        new Image(),
        new Image()
    ]
};

// Cesty k obrázkom
animacie.dopredu[0].src = "../../asseti/pohyb_dopredu_1.png";
animacie.dopredu[1].src = "../../asseti/pohyb_dopredu_2.png";
animacie.dopredu[2].src = "../../asseti/pohyb_dopredu_3.png";

animacie.dozadu[0].src = "../../asseti/pohyb_dozadu_1.png";
animacie.dozadu[1].src = "../../asseti/pohyb_dozadu_2.png";
animacie.dozadu[2].src = "../../asseti/pohyb_dozadu_3.png";
animacie.plazenie = new Image();
animacie.plazenie.src = "../../asseti/Plaziaca macka.png";


let frameForward = 0;
let frameBackward = 0;
let timerForward = 0;
let timerBackward = 0;
function ziskajAnimaciu(player, keys) {

    // === PLAZENIE ===
    if (player.height === 25) {
        return animacie.plazenie;
    }

    // === POHYB DOPREDU ===
    if (keys.right) {
        timerForward++;
        if (timerForward > 10) {
            frameForward = (frameForward + 1) % animacie.dopredu.length;
            timerForward = 0;
        }
        player.direction = "doprava";
        return animacie.dopredu[frameForward];
    }

    // === POHYB DOZADU ===
    if (keys.left) {
        timerBackward++;
        if (timerBackward > 10) {
            frameBackward = (frameBackward + 1) % animacie.dozadu.length;
            timerBackward = 0;
        }
        player.direction = "dolava";
        return animacie.dozadu[frameBackward];
    }

    // === STÁTIE ===
    if (player.direction === "doprava") {
        return animacie.dopredu[0];
    } else {
        return animacie.dozadu[0];
    }
}
