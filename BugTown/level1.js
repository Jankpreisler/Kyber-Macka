const canvas = document.getElementById('gameCanvas');
const c = canvas.getContext('2d');

canvas.width = 1300; // na normal leevely
canvas.height = 600;

const gravitacia = 0.4;

const exitZone = {
    x: 0,
    y: 450,
    width: 60,
    height: 80
};

const Karera = {
    x: 0,
    y: 0,
    width: canvas.height,
    height: canvas.height
};

//                  === DEFINÍCIA PLATFORIEM ===
const platforms = [
    /* { x: 0, y: 500, width: 1200, height: 100, color: '#333', type: 'pipe_h' },
      { x: 0, y: 200, width: 1200, height: 100, color: '#333', type: 'pipe_h' },
      { x: 400, y: 200, width: 100, height: 400, color: '#333', type: 'pipe_v', id: 'papa', visible: true},
      { x: 400, y: 0, width: 100, height: 400, color: '#333', type: 'pipe_v', id: 'papi', visible: true},
      { x: 1850, y: 500, width: 650, height: 100, color: '#333', type: 'pipe_h' },
      { x: 1850, y: 300, width: 650, height: 100, color: '#333', type: 'pipe_h' },
      { x: 2050, y: 400, width: 100, height: 100, color: '#333', type: 'pipe_v',id: 'papo', visible: true },
  
      */

    { x: 0, y: 1300, width: 2250, height: 20, color: '#050505', type: 'floor' }, //kill
    { x: 0, y: 1000, width: 150, height: 2000, color: '#333', type: 'pipe_v' }, //spawn
    { x: -150, y: 100, width: 150, height: 2000, color: '#333', type: 'pipe_v' }, //left border
    { x: 200, y: 1200, width: 200, height: 100, color: '#333', type: 'pipe_v', range: 400, id: 'vetrak' }, //vetrak c1
    { x: 580, y: 900, width: 300, height: 100, color: '#333', type: 'pipe_v' },
    { x: 780, y: 200, width: 100, height: 670, color: '#333', type: 'pipe_v' },
    { x: 650, y: 1000, width: 150, height: 300, color: '#333', type: 'pipe_v' },


 { x: 0, y: 1000, width: 600, height: 300, color: '#333', type: 'pipe_v' }, //toto potom vymazat (len na testing)



    { x: 800, y: 1280, width: 300, height: 300, color: '#333', type: 'pipe_v' },
    { x: 800, y: 1230, width: 50, height: 50, color: '#333', type: 'pipe_v' }, //BUTTON (janko urobi)
    { x: 1250, y: 1200, width: 150, height: 100, color: '#333', type: 'pipe_v' },
    { x: 1500, y: 1080, width: 150, height: 90, color: '#333', type: 'pipe_v' },
    { x: 1800, y: 1000, width: 150, height: 90, color: '#333', type: 'pipe_v' },
    { x: 1500, y: 900, width: 150, height: 90, color: '#333', type: 'pipe_v' },
    { x: 1200, y: 800, width: 150, height: 90, color: '#333', type: 'pipe_v' },
    { x: 900, y: 700, width: 150, height: 90, color: '#333', type: 'pipe_v' },
    { x: 1200, y: 600, width: 150, height: 90, color: '#333', type: 'pipe_v' },
    { x: 1520, y: 500, width: 150, height: 90, color: '#333', type: 'pipe_v' },
    { x: 1800, y: 381, width: 150, height: 90, color: '#333', type: 'pipe_v' },
    { x: 2000, y: 381, width: 500, height: 90, color: '#333', type: 'pipe_v' },
    { x: 2500, y: -30, width: 150, height: 500, color: '#333', type: 'pipe_v' },

    { x: 2100, y: 470, width: 150, height: 830, type: 'pipe_h', range: 1100, id: 'vetrak2', zapnuty: true, maxForce: 1.2 } //vetrak ktory fuka dolava



    /*

      { x: 150, y: 1000, width: 2350, height: 50, color: '#333', type: 'wall' },
      { x: 750, y: 900, width: 250, height: 50, color: '#333', type: 'wall' },
      { x: 950, y: 800, width: 250, height: 50, color: '#333', type: 'wall' },
      { x: 1050, y: 700, width: 250, height: 50, color: '#333', type: 'wall' },
      { x: 1350, y: 600, width: 450, height: 50, color: '#333', type: 'wall' },
      { x: 1450, y: 500, width: 250, height: 50, color: '#333', type: 'wall' },
      { x: 1550, y: 400, width: 250, height: 50, color: '#333', type: 'wall' },
      { x: 1450, y: 300, width: 250, height: 50, color: '#333', type: 'wall' },
      { x: 1250, y: 200, width: 250, height: 50, color: '#333', type: 'wall' },
      { x: 2050, y: 980, width: 250, height: 50, color: '#ec0000', type: 'trigger', id: 'tlacidlo1' },
      { x: 0, y: 195, width: 250, height: 50, color: '#ec0000', type: 'trigger', id: 'tlacidlo2' },
      { x: 2150, y: 490, width: 250, height: 50, color: '#ec0000', type: 'trigger', id: 'tlacidlo3' },
      { x: 0, y: 0, width: 1300, height: 1 },
      { x: 0, y: 0, width: 1, height: 1000 },
      { x: 2500, y: 0, width: 1, height: 1000 },
  
    */
];

const macky = {
    dolava: new Image(),
    doprava: new Image(),
    plazeniedoprava: new Image(),
};

macky.dolava.src = '../../asseti/cyber-cat main cahrakter.png';
macky.doprava.src = '../../asseti/Cybermacka druhy pohlad.png';
macky.plazeniedoprava.src = '../../asseti/Plaziaca_macka.png';

let actualnaakciacici = macky.dolava;
const keys = { right: false, left: false };

// === VLASTNOSTI HRÁČA ===
let player = {
    x: 50,
    y: 950,
    width: 50,
    height: 50,
    dx: 0,
    dy: 0,
    speed: 4,
    jumpForce: 10,
    grounded: false,
    friction: 0.9 // ZMENENÉ pre plynulosť
};

// --- ATMOSFÉRICKÉ EFEKTY ---
let time = 0;
let fogParticles = [];
let windParticles = []; // Toto pridaj
for (let i = 0; i < 30; i++) {
    fogParticles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 50 + 20,
        s: Math.random() * 0.5 + 0.1
    });
}

// === GRAFICKÉ RUTINY ===

function getBrickPattern() {
    const p = document.createElement('canvas');
    const pc = p.getContext('2d');
    p.width = 32;
    p.height = 16;
    pc.fillStyle = '#141a14';
    pc.fillRect(0, 0, 32, 16);
    pc.fillStyle = '#0a100a';
    pc.fillRect(0, 0, 30, 14);
    pc.fillStyle = '#1a251a';
    pc.fillRect(1, 1, 28, 12);
    return c.createPattern(p, 'repeat');
}
const brickPattern = getBrickPattern();

function drawRealPipe(p, isVertical) {
    c.save();
    let grad;

    if (isVertical) {
        grad = c.createLinearGradient(p.x, p.y, p.x + p.width, p.y);
    } else {
        grad = c.createLinearGradient(p.x, p.y, p.x, p.y + p.height);
    }

    grad.addColorStop(0, '#111');
    grad.addColorStop(0.2, '#3a403a');
    grad.addColorStop(0.5, '#222');
    grad.addColorStop(0.8, '#443020');
    grad.addColorStop(1, '#050505');

    c.fillStyle = grad;
    c.fillRect(p.x, p.y, p.width, p.height);

    c.fillStyle = 'rgba(0,0,0,0.4)';
    if (isVertical) {
        for (let i = 10; i < p.height; i += 20) {
            c.fillRect(p.x + 2, p.y + i, p.width - 4, 2);
        }
    } else {
        for (let i = 10; i < p.width; i += 20) {
            c.fillRect(p.x + i, p.y + 2, 2, p.height - 4);
        }
    }
    c.restore();
}

function drawRealServer(p) {
    c.save();
    c.fillStyle = '#0d0f12';
    c.fillRect(p.x, p.y, p.width, p.height);

    c.strokeStyle = '#1a1d24';
    c.lineWidth = 1;
    for (let i = p.y + 10; i < p.y + p.height; i += 10) {
        c.beginPath();
        c.moveTo(p.x + 10, i);
        c.lineTo(p.x + p.width - 10, i);
        c.stroke();
    }

    for (let i = p.y + 15; i < p.y + p.height; i += 20) {
        c.fillStyle = Math.random() > 0.98 ? '#ff0055' : (Math.random() > 0.5 ? '#00ff41' : '#004411');
        c.fillRect(p.x + 5, i, 4, 3);
    }

    c.restore();
}

function drawFog() {
    c.save();
    c.globalCompositeOperation = 'screen';

    fogParticles.forEach(p => {
        let grad = c.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r);
        grad.addColorStop(0, 'rgba(0, 100, 30, 0.1)');
        grad.addColorStop(1, 'transparent');

        c.fillStyle = grad;
        c.beginPath();
        c.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        c.fill();

        p.x += Math.sin(time + p.r) * 0.2;
    });

    c.restore();
}

function mozeSaPostavit() {
    // Simulujeme pozíciu a výšku po postavení
    const buducaVyska = 50;
    const buduceY = player.y - 25;

    // Skontrolujeme kolíziu s každou platformou pre túto novú polohu
    for (let platform of platforms) {
        if (
            player.x < platform.x + platform.width &&
            player.x + player.width > platform.x &&
            buduceY < platform.y + platform.height &&
            buduceY + buducaVyska > platform.y
        ) {
            return false; // Našli sme prekážku, nemôže sa postaviť
        }
    }
    return true; // Miesto je voľné
}

// === KOLÍZIA ===
function isTouching(a, b) {
    return (
        a.x < b.x + b.width &&
        a.x + a.width > b.x &&
        a.y < b.y + b.height &&
        a.y + a.height > b.y
    );
}

// === OVLÁDANIE ===
window.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        keys.right = true;
        actualnaakciacici = macky.dolava;
    }

    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        keys.left = true;
        actualnaakciacici = macky.doprava;
    }

    if ((e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') && player.grounded) {
        player.dy = -player.jumpForce;
        player.grounded = false;
    }

    if ((e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') && player.grounded) {
        player.height = 25;
        player.grounded = false;
        actualnaakciacici = macky.plazeniedoprava;
    }

});


window.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') keys.right = false;
    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') keys.left = false;

    if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {

        if (player.height === 25) {
            if (mozeSaPostavit()) {
                player.height = 50;
                player.y -= 25;
                actualnaakciacici = macky.doprava;
            } else {
                player.chceSaPostavit = true;
            }
        }
    }
});

function nastavViditelnost(id, stav) {
    const p = platforms.find(obj => obj.id === id);
    if (p) {
        p.visible = stav;
    }
}

function resetPlayer() {
    player.x = 0;
    player.y = 950;
    player.dx = 0;
    player.dy = 0;
    player.height = 50;
    actualnaakciacici = macky.dolava;
}
// === HLAVNÁ SMYČKA ===
function animovanie() {
    requestAnimationFrame(animovanie);
    time += 0.01;

    c.clearRect(0, 0, canvas.width, canvas.height);

    c.save();
    c.translate(-Karera.x, 0 - Karera.y, 0);


    // 1. Pozadie
    let bgGrad = c.createRadialGradient(400, 200, 50, 400, 200, 400);
    bgGrad.addColorStop(0, '#0a100a');
    bgGrad.addColorStop(1, '#010501');
    c.fillStyle = bgGrad;
    c.fillRect(0, 0, canvas.width, canvas.height);

    c.fillStyle = brickPattern;
    c.fillRect(0, 0, 30000, 30000);

    drawFog();

    // 2. Vykreslenie objektov
    platforms.forEach(p => {
        if (p.visible === false) return;
        if (p.type === 'floor') {
            c.fillStyle = '#000';
            c.fillRect(p.x, p.y, p.width, p.height);

            let sliz = c.createLinearGradient(0, p.y, 0, p.y + p.height);
            sliz.addColorStop(0, '#000000');
            sliz.addColorStop(1, 'transparent');
            c.fillStyle = sliz;
            c.fillRect(p.x, p.y, p.width, 3);
        }
        else if (p.type === 'wall') {
            drawRealServer(p);
        }
        else if (p.type === 'pipe_v') {
            drawRealPipe(p, true);
        }
        else if (p.type === 'pipe_h') {
            drawRealPipe(p, false);
        }
        else if (p.type === 'valve') {
            c.fillStyle = '#400';
            c.fillRect(p.x, p.y, p.width, p.height);
            c.fillStyle = '#600';
            c.fillRect(p.x + 5, p.y + 20, 10, 10);
        }
        else if (p.speed) {
            p.x += p.speed * p.direction;
            if (p.x > p.startX + p.range || p.x < p.startX) p.direction *= -1;
            if (p.hasRope) drawRopes(p);

        }
        else {
            c.fillStyle = 'transparent';
            c.fillRect(p.x, p.y, p.width, p.height);
        }

    });
    // Funguje nedotykat sa nikdydw
    platforms.forEach(p => {
        if (p.speed) {
            if (p.type === 'valve') {
                // Vertikálny pohyb pre ventil/plošinu
                p.y += p.speed * p.direction;
                // Ak narazí na hranicu rozsahu (startY + range), otočí smer
                if (p.y > p.startY + p.range || p.y < p.startY) {
                    p.direction *= -1;
                }
            } else {
                // Horizontálny pohyb pre ostatné plošiny
                p.x += p.speed * p.direction;
                if (p.x > p.startX + p.range || p.x < p.startX) {
                    p.direction *= -1;
                }
            }
        }
    });

    // 3. Pohyb a fyzika
    if (keys.right) player.dx += 0.8; // ZMENENÉ na zrýchlenie
    else if (keys.left) player.dx -= 0.8; // ZMENENÉ na zrýchlenie

    player.dx *= player.friction; // Aplikácia trenia (0.9 namiesto natvrdo 0)
    
    // Limit maximálnej rýchlosti hráča
    if (player.dx > player.speed) player.dx = player.speed;
    if (player.dx < -player.speed) player.dx = -player.speed;

    player.x += player.dx;
    player.dy += gravitacia;
    player.y += player.dy;
    player.grounded = false;

    Karera.x = player.x - canvas.width / 2;
    Karera.y = player.y - canvas.height / 2;

    if (Karera.y < 0) Karera.y = 0;
    if (Karera.x < 0) Karera.x = 0;




    // --- LOGIKA A VIZUÁL VETRÁKA ---
    platforms.forEach(p => {

        // ===== PRVÝ VETRÁK (HORE) =====
        if (p.id === 'vetrak') {
            if (
                player.x + player.width > p.x &&
                player.x < p.x + p.width &&
                player.y + player.height > p.y - p.range &&
                player.y + player.height <= p.y
            ) {
                let vzdialenostOdVetráka = p.y - (player.y + player.height);
                if (vzdialenostOdVetráka > p.range * 0.8) {
                    player.dy -= 0.35;
                } else {
                    player.dy -= 0.8;
                }
                if (player.dy < -5) player.dy = -5;
            }

            if (Math.random() > 0.6) {
                windParticles.push({
                    x: p.x + Math.random() * p.width,
                    y: p.y,
                    speed: Math.random() * 5 + 3,
                    opacity: 1,
                    maxHeight: p.y - p.range
                });
            }
        }

       // ===== DRUHÝ VETRÁK (DOĽAVA) =====
if (p.id === 'vetrak2' && p.zapnuty) {

    const vnutri =
        player.y + player.height > p.y &&
        player.y < p.y + p.height &&
        player.x < p.x &&
        player.x + player.width > p.x - p.range;

    if (vnutri) {
        player.dx -= 0.67; 
    }

    // Častice - UPRAVENÉ ŠPAWNOVANIE
    if (Math.random() > 0.4) { // Trochu sme zvýšili šancu, aby bol hustejší
        windParticles.push({
            // TOTO JE KĽÚČ: x nebude len p.x, ale náhodný bod v celom dosahu
            x: p.x - Math.random() * p.range, 
            y: p.y + Math.random() * p.height,
            speed: Math.random() * 5 + 2,
            opacity: Math.random() * 0.5 + 0.5, // Náhodná priehľadnosť pre prirodzenejší vzhľad
            direction: 'left',
            minX: p.x - p.range
        });
    }
}

    });


    // ⬇⬇⬇ DRUHÁ ZMENA – ČASTICE ⬇⬇⬇

    c.save();
    windParticles.forEach((part, index) => {

        // smer
        if (part.direction === 'left') {
            part.x -= part.speed;
        } else {
            part.y -= part.speed;
        }

        part.opacity -= 0.015;

        c.strokeStyle = `rgba(255, 0, 0, ${part.opacity})`;
        c.lineWidth = 2;
        c.beginPath();

        if (part.direction === 'left') {
            c.moveTo(part.x, part.y);
            c.lineTo(part.x + 15, part.y);
        } else {
            c.moveTo(part.x, part.y);
            c.lineTo(part.x, part.y + 15);
        }

        c.stroke();

        if (
            part.opacity <= 0 ||
            (part.direction === 'left' && part.x < part.minX) ||
            (!part.direction && part.y < part.maxHeight)
        ) {
            windParticles.splice(index, 1);
        }

    });
    c.restore();





    // 4. Kolízie
    platforms.forEach(platform => {
        if (platform.visible === false) return;
        if (
            player.x < platform.x + platform.width &&
            player.x + player.width > platform.x &&
            player.y < platform.y + platform.height &&
            player.y + player.height > platform.y
        ) {
            if (platform.type === 'floor') {
                resetPlayer();
                return; // Ukončíme kontrolu pre túto platformu
            }

            // dopad zhora
            if (player.dy > 0 && (player.y + player.height - player.dy) <= platform.y) {
                player.y = platform.y - player.height;
                player.dy = 0;
                player.grounded = true;

            }

            // náraz sprava do steny
            else if (player.dx > 0 && (player.x + player.width - player.dx) <= platform.x) {
                player.x = platform.x - player.width;
                player.dx = 0; // Pridané pre stabilitu
            }

            // náraz zľava do steny
            else if (player.dx < 0 && (player.x - player.dx) >= platform.x + platform.width) {
                player.x = platform.x + platform.width;
                player.dx = 0; // Pridané pre stabilitu
            }

            // náraz hlavou zdola
            else if (player.dy < 0 && (player.y - player.dy) >= platform.y + platform.height) {
                player.y = platform.y + platform.height;
                player.dy = 0;
            }
            if (platform.type === 'trigger') {
                vykonajAkciu(platform.id);
            }
        }
    });

    // === 5. DOPLNKOVÁ LOGIKA (Kamera a postavenie sa) ===
    Karera.x = player.x - canvas.width / 2;
    Karera.y = player.y - canvas.height / 2;

    if (Karera.y < 0) Karera.y = 0;
    if (Karera.x < 0) Karera.x = 0;

    if (player.height === 25 && player.chceSaPostavit) {
        if (mozeSaPostavit()) {
            player.height = 50;
            player.y -= 25;
            player.chceSaPostavit = false;
            // Opravené: priraďujeme k premennej, ktorú používaš na kreslenie
            actualnaakciacici = macky.doprava;
        }
    }

    function vykonajAkciu(id) {
        if (id === 'tlacidlo1') {
            nastavViditelnost('papi', false); // Stena zmizne
            console.log("Cesta je voľná!");
        }
        if (id === 'tlacidlo2') {
            nastavViditelnost('papo', false); // Stena zmizne
            console.log("Cesta je voľná!");
        }
        if (id === 'tlacidlo3') {
            nastavViditelnost('papa', false); // Stena zmizne
            console.log("Cesta je voľná!");
        }
    }

    //PRECHOD DO ĎALŠIEHO LEVELU
    if (isTouching(player, exitZone)) {
        window.location.href = "/SerWers/Level6-prechod_do_bugtown/Prechod.html";
    }



    // 6. Vykreslenie postavy
    if (actualnaakciacici && actualnaakciacici.complete && actualnaakciacici.naturalWidth !== 0) {
        c.drawImage(actualnaakciacici, player.x, player.y, player.width, player.height);
    } else {
        c.fillStyle = 'red';
        c.fillRect(player.x, player.y, player.width, player.height);
    }


    c.restore();

}

animovanie();