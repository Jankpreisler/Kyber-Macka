const canvas = document.getElementById('gameCanvas');
const c = canvas.getContext('2d');

canvas.width = 1300;
canvas.height = 600;

const gravitacia = 0.4;

// Exit zóna
const exitZone = {
    x: 2400,
    y: 330,
    width: 60,
    height: 80
};

// Kamera
const Karera = {
    x: 0,
    y: 0,
    width: canvas.height,
    height: canvas.height
};

// === PLATFORMY (logika nemenena) ===
const platforms = [
    { x: 0, y: 1700, width: 2750, height: 20, color: '#050505', type: 'floor' },
    { x: 0, y: 1000, width: 150, height: 2000, color: '#333', type: 'pipe_v' },
    { x: -150, y: 100, width: 150, height: 2000, color: '#333', type: 'pipe_v' },
    { x: 200, y: 1200, width: 200, height: 100, color: '#333', type: 'pipe_v', range: 400, id: 'vetrak' },
    { x: 580, y: 900, width: 300, height: 100, color: '#333', type: 'pipe_v' },
    { x: 780, y: 200, width: 100, height: 670, color: '#333', type: 'pipe_v' },
    { x: 650, y: 1000, width: 150, height: 300, color: '#333', type: 'pipe_v' },
    { x: 800, y: 1280, width: 300, height: 300, color: '#333', type: 'pipe_v' },
    { x: 800, y: 1230, width: 50, height: 50, color: '#333', type: 'trigger', id: 'tlacidlo3', isPressed: false },
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
    { x: 2100, y: 470, width: 150, height: 830, type: 'pipe_h', range: 1100, id: 'vetrak2', zapnuty: true, maxForce: 1.2 }
];

// === Textúry postavy ===
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

// === Hráč ===
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
    friction:  0.9
};

let time = 0;
let fogParticles = [];
let windParticles = [];
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
    p.width = 64; p.height = 64;

    pc.fillStyle = '#0d0000';
    pc.fillRect(0, 0, 64, 64);

    // Špina s červeným nádychom
    pc.fillStyle = 'rgba(50, 0, 0, 0.4)';
    pc.beginPath();
    pc.arc(32, 32, 25, 0, Math.PI * 2);
    pc.fill();

    // Červené mikro-káble v špárach
    pc.strokeStyle = '#220000';
    pc.lineWidth = 1;
    pc.strokeRect(0, 0, 64, 32);

    pc.strokeStyle = '#660000';
    pc.beginPath();
    pc.moveTo(0, 32); pc.lineTo(64, 32);
    pc.stroke();

    return c.createPattern(p, 'repeat');
}
const brickPattern = getBrickPattern();

function drawRealPipe(p, isVertical) {
    c.save();
    // Čierny vysoko leštený základ
    c.fillStyle = '#000';
    c.fillRect(p.x, p.y, p.width, p.height);

    // Bočné žiariace linky (Tron Style)
    c.shadowBlur = 10;
    c.shadowColor = '#ff0000';
    c.fillStyle = '#ff0000';

    if (isVertical) {
        c.fillRect(p.x, p.y, 2, p.height); // Ľavá linka
        c.fillRect(p.x + p.width - 2, p.y, 2, p.height); // Pravá linka

        // Digitálny pulz (bežiaci kód)
        let offset = (Date.now() / 10) % p.height;
        c.fillStyle = '#fff'; // Biely záblesk dát
        c.fillRect(p.x + 2, p.y + offset, p.width - 4, 10);
    } else {
        c.fillRect(p.x, p.y, p.width, 2);
        c.fillRect(p.x, p.y + p.height - 2, p.width, 2);

        let offset = (Date.now() / 10) % p.width;
        c.fillStyle = '#fff';
        c.fillRect(p.x + offset, p.y + 2, 10, p.height - 4);
    }
    c.restore();
}

function drawStyledButton(btn, isHovered = false, isPressed = false) {
    c.save();

    // Vonkajšia žiara (Glow)
    c.shadowBlur = isHovered ? 15 : 5;
    c.shadowColor = isPressed ? '#ff0000' : '#4b0082';

    // Telo tlačidla
    const grad = c.createLinearGradient(btn.x, btn.y, btn.x, btn.y + btn.height);
    if (isPressed) {
        grad.addColorStop(0, '#660000');
        grad.addColorStop(1, '#220000');
    } else {
        grad.addColorStop(0, isHovered ? '#2a0044' : '#150022');
        grad.addColorStop(1, '#000000');
    }

    c.fillStyle = grad;
    c.beginPath();
    c.roundRect(btn.x, btn.y, btn.width, btn.height, 4);
    c.fill();

    // Červené "dátové" linky na tlačidle
    c.strokeStyle = isPressed ? '#ff0000' : 'rgba(255, 0, 0, 0.2)';
    c.lineWidth = 1;
    for (let i = 6; i < btn.height - 6; i += 8) {
        c.beginPath();
        c.moveTo(btn.x + 5, btn.y + i);
        c.lineTo(btn.x + btn.width - 5, btn.y + i);
        c.stroke();
    }

    c.restore();
}

function drawRealServer(p) {
    c.save();
    c.fillStyle = '#050000';
    c.fillRect(p.x, p.y, p.width, p.height);

    // Červená mriežka
    c.strokeStyle = '#330000';
    for (let i = p.y + 5; i < p.y + p.height; i += 8) {
        c.beginPath();
        c.moveTo(p.x + 5, i);
        c.lineTo(p.x + p.width - 5, i);
        c.stroke();
    }

    // Intenzívne červené LEDky
    for (let i = p.y + 10; i < p.y + p.height; i += 12) {
        let active = Math.random() > 0.7;
        c.fillStyle = active ? '#ff0000' : '#220000';
        if (active) {
            c.shadowBlur = 5;
            c.shadowColor = '#ff0000';
        }
        c.fillRect(p.x + 4, i, 4, 2);
        c.shadowBlur = 0;
    }
    c.restore();
}

function drawFog() {
    c.save();
    c.globalCompositeOperation = 'screen';

    fogParticles.forEach(p => {
        let grad = c.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r);
        grad.addColorStop(0, 'rgba(150, 0, 0, 0.2)'); // Červený opar
        grad.addColorStop(1, 'transparent');

        c.fillStyle = grad;
        c.beginPath();
        c.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        c.fill();

        p.x += Math.sin(time + p.r) * 0.2;
    });
    c.restore();
}

// === Kontrola priestoru na postavenie ===
function mozeSaPostavit() {
    const buducaVyska = 50;
    const buduceY = player.y - 25;

    for (let platform of platforms) {
        if (
            player.x < platform.x + platform.width &&
            player.x + player.width > platform.x &&
            buduceY < platform.y + platform.height &&
            buduceY + buducaVyska > platform.y
        ) {
            return false;
        }
    }
    return true;
}

// === Kolízia ===
function isTouching(a, b) {
    return (
        a.x < b.x + b.width &&
        a.x + a.width > b.x &&
        a.y < b.y + b.height &&
        a.y + a.height > b.y
    );
}

// === Ovládanie ===
window.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W' || e.code === 'Space') { // doprava
        keys.right = true;
        actualnaakciacici = macky.dolava;
    }

    if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S' || e.key === 'Shift') { //dolava
        keys.left = true;
        actualnaakciacici = macky.doprava;
    }

    if ((e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') && player.grounded) { //skok
        player.dy = -player.jumpForce;
        player.grounded = false;
    }


    if ((e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') && player.grounded) { //shift
        player.height = 25;
        player.grounded = false;
        actualnaakciacici = macky.plazeniedoprava;
    }
    if ((e.key === 'Tab' || e.code === 'Tab')) {
        window.location.href = "/MenunaTab/tab.html";
    }
});

window.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W' || e.code === 'Space') keys.right = false; //doprava
    if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S' || e.key === 'Shift') keys.left = false; //dolava

    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') { //dole
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


// Prepínanie viditeľnosti
function nastavViditelnost(id, stav) {
    const p = platforms.find(obj => obj.id === id);
    if (p) p.zapnuty = stav;
}

// Reset hráča
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

    // === Pozadie (tmavšie fialovo-modré) ===
  let bgGrad = c.createRadialGradient(400, 200, 50, 400, 200, 400);
    bgGrad.addColorStop(0, '#0a100a');
    bgGrad.addColorStop(1, '#010501');
    c.fillStyle = bgGrad;
    c.fillRect(0, 0, canvas.width, canvas.height);

    c.fillStyle = brickPattern;
    c.fillRect(0, 0, 30000, 30000)

    drawFog();

    // === Platformy ===
    platforms.forEach(p => {
        if (p.visible === false) return;

        if (p.type === 'floor') {
            c.fillStyle = '#000';
            c.fillRect(p.x, p.y, p.width, p.height);

            let sliz = c.createLinearGradient(0, p.y, 0, p.y + p.height);
            sliz.addColorStop(0, '#220000');
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
        else if (p.type === 'trigger') {
            drawStyledButton(p, false, p.isPressed);
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
        }
        else {
            c.fillStyle = 'transparent';
            c.fillRect(p.x, p.y, p.width, p.height);
        }
    });

    // Pohybujúce platformy
    platforms.forEach(p => {
        if (p.speed) {
            if (p.type === 'valve') {
                p.y += p.speed * p.direction;
                if (p.y > p.startY + p.range || p.y < p.startY) p.direction *= -1;
            } else {
                p.x += p.speed * p.direction;
                if (p.x > p.startX + p.range || p.x < p.startX) p.direction *= -1;
            }
        }
    });

    // === Fyzika hráča ===
    if (keys.right) player.dx += 0.8;
    else if (keys.left) player.dx -= 0.8;

    player.dx *= player.friction;

    // limit rýchlosti
    if (player.dx > player.speed) player.dx = player.speed;
    if (player.dx < -player.speed) player.dx = -player.speed;

    player.x += player.dx;
    player.dy += gravitacia;
    player.y += player.dy;
    player.grounded = false;

    // kamera
    Karera.x = player.x - canvas.width / 2;
    Karera.y = player.y - canvas.height / 2;

    if (Karera.y < 0) Karera.y = 0;
    if (Karera.x < 0) Karera.x = 0;

    // === Vetráky a glitch vietor ===
    platforms.forEach(p => {

        // horný vetrák
        if (p.id === 'vetrak') {
            const vnutri =
                player.x + player.width > p.x &&
                player.x < p.x + p.width &&
                player.y + player.height > p.y - p.range &&
                player.y + player.height <= p.y;

            if (vnutri) {
                let dist = p.y - (player.y + player.height);
                player.dy -= dist > p.range * 0.8 ? 0.35 : 0.8;
                if (player.dy < -5) player.dy = -5;
            }

            // glitch čiary
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

        // bočný vetrák
        if (p.id === 'vetrak2' && p.zapnuty === true) {

            const vnutri =
                player.y + player.height > p.y &&
                player.y < p.y + p.height &&
                player.x < p.x &&
                player.x + player.width > p.x - p.range;

            if (vnutri) {
                player.dx -= 0.67;
            }

            // glitch vietor
            if (Math.random() > 0.4) {
                windParticles.push({
                    x: p.x - Math.random() * p.range,
                    y: p.y + Math.random() * p.height,
                    speed: Math.random() * 5 + 2,
                    opacity: Math.random() * 0.5 + 0.5,
                    direction: 'left',
                    minX: p.x - p.range
                });
            }
        }
    });

    // === Render glitch vetra ===
    c.save();
    windParticles.forEach((part, index) => {

        if (part.direction === 'left') part.x -= part.speed;
        else part.y -= part.speed;

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

    // === Kolízie ===
    platforms.forEach(platform => {
        if (platform.visible === false) return;

        if (
            player.x < platform.x + platform.width &&
            player.x + player.width > platform.x &&
            player.y < platform.y + platform.height &&
            player.y + player.height > platform.y
        ) {
            // podlaha = smrť
            if (platform.type === 'floor') {
                resetPlayer();
                return;
            }

            // dopad zhora
            if (player.dy > 0 && (player.y + player.height - player.dy) <= platform.y) {
                player.y = platform.y - player.height;
                player.dy = 0;
                player.grounded = true;
            }

            // náraz sprava
            else if (player.dx > 0 && (player.x + player.width - player.dx) <= platform.x) {
                player.x = platform.x - player.width;
                player.dx = 0;
            }

            // náraz zľava
            else if (player.dx < 0 && (player.x - player.dx) >= platform.x + platform.width) {
                player.x = platform.x + platform.width;
                player.dx = 0;
            }

            // náraz hlavou
            else if (player.dy < 0 && (player.y - player.dy) >= platform.y + platform.height) {
                player.y = platform.y + platform.height;
                player.dy = 0;
            }

            // tlačidlo
            if (platform.type === 'trigger') {
                vykonajAkciu(platform.id);
            }
            if (isTouching(player, exitZone)) {
                ProgresManazer.ulozLevel(7);
                window.location.href = "BugTown/Level2/level2.html";
            }
        }
    });

    // === Kamera a postavenie ===
    Karera.x = player.x - canvas.width / 2;
    Karera.y = player.y - canvas.height / 2;

    if (Karera.y < 0) Karera.y = 0;
    if (Karera.x < 0) Karera.x = 0;

    if (player.height === 25 && player.chceSaPostavit) {
        if (mozeSaPostavit()) {
            player.height = 50;
            player.y -= 25;
            player.chceSaPostavit = false;
            actualnaakciacici = macky.doprava;
        }
    }

    // === Tlačidlo akcie ===
    function vykonajAkciu(id) {
        const btn = platforms.find(p => p.id === id);
        if (btn) btn.isPressed = true;

        if (id === 'tlacidlo3') {
            nastavViditelnost('vetrak2', false);
            console.log("Cesta je voľná!");
        }
    }

    // === Prechod do ďalšieho levelu ===
    if (isTouching(player, exitZone)) {
        if (typeof ProgresManazer !== 'undefined') {
            ProgresManazer.ulozLevel(7);
        }
        window.location.href = "SerWers/Level2/level2.html";
        window.location.href = "/BugTown/Level2/level2.html";
    }

    // === Postava ===
    if (actualnaakciacici && actualnaakciacici.complete && actualnaakciacici.naturalWidth !== 0) {
        c.drawImage(actualnaakciacici, player.x, player.y, player.width, player.height);
    } else {
        c.fillStyle = 'red';
        c.fillRect(player.x, player.y, player.width, player.height);
    }

    c.restore();
}

animovanie();
