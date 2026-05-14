const canvas = document.getElementById('gameCanvas');
const c = canvas.getContext('2d');
let windParticles = [];


canvas.width = 1300;
canvas.height = 600;

const gravitacia = 0.4;

const exitZone = {
    x: 2800,
    y: 450,
    width: 60,
    height: 80
};

const Karera = {
    x: 0,
    y: 0,
    width: canvas.width,
    height: canvas.height
};

// === PLATFORMY – UPRAVENÝ, ŤAŽŠÍ LEVEL 5 ===
const platforms = [
    // hlavná zem – nechávam, ale je to "bezpečná" línia
    { x: 0, y: 520, width: 3200, height: 80, type: 'ground' },

    // malé schodíky / skoky – mierne posunuté, aby boli skoky náročnejšie
    { x: 420, y: 470, width: 110, height: 50, type: 'pipe_v' },
    { x: 700, y: 430, width: 130, height: 50, type: 'pipe_v' },
    { x: 1020, y: 390, width: 150, height: 50, type: 'pipe_v' },

    // vyššia plošina – trochu ďalej, aby bol skok dlhší
    { x: 1380, y: 340, width: 200, height: 60, type: 'pipe_v' },

    // dvojskok – viac rozostúpené, vyšší risk
    { x: 1750, y: 430, width: 140, height: 60, type: 'pipe_v' },
    { x: 2030, y: 370, width: 140, height: 60, type: 'pipe_v' },

    // plošina pred koncom – posunutá nižšie, aby vetrák viac ovplyvňoval
    { x: 2350, y: 440, width: 220, height: 60, type: 'pipe_v' },

    // plošina pri exite
    { x: 2720, y: 460, width: 200, height: 60, type: 'pipe_v' },

    // --- VETRÁKY (INŠPIRÁCIA Z LEVELU 4) ---

   

    // Vetrák 2 – horizontálny ťah doľava pri konci levelu
    {
        x: 2950,
        y: 380,
        width: 150,
        height: 150,
        type: 'valve',
        id: 'vetrak5_side',
        range: 900,
        zapnuty: true,
        maxForce: 7.2
    }
];

// === ENEMY – HOVER DRONES (ŤAŽŠIA VERZIA) ===
const enemies = [
    // pôvodní, mierne upravené rýchlosti a rozsahy
    {
        x: 550,
        y: 430,
        width: 28,
        height: 28,
        baseY: 430,
        amplitude: 12,
        phase: 0,
        speed: 1.5,
        dir: 1,
        leftBound: 480,
        rightBound: 820,
        alive: true,
        startX: 550
    },
    {
        x: 1150,
        y: 350,
        width: 28,
        height: 28,
        baseY: 350,
        amplitude: 14,
        phase: 1.4,
        speed: 1.6,
        dir: -1,
        leftBound: 1080,
        rightBound: 1380,
        alive: true,
        startX: 1150
    },
    {
        x: 2000,
        y: 330,
        width: 28,
        height: 28,
        baseY: 330,
        amplitude: 16,
        phase: 2.1,
        speed: 1.8,
        dir: 1,
        leftBound: 1930,
        rightBound: 2250,
        alive: true,
        startX: 2000
    },

    // nový dron – nad prvými schodíkmi
    {
        x: 650,
        y: 360,
        width: 28,
        height: 28,
        baseY: 360,
        amplitude: 18,
        phase: 0.7,
        speed: 1.9,
        dir: -1,
        leftBound: 580,
        rightBound: 880,
        alive: true,
        startX: 650
    },

    // nový dron – nad vyššou plošinou
    {
        x: 1450,
        y: 280,
        width: 28,
        height: 28,
        baseY: 280,
        amplitude: 20,
        phase: 1.9,
        speed: 2.0,
        dir: 1,
        leftBound: 1380,
        rightBound: 1680,
        alive: true,
        startX: 1450
    },

    // nový dron – pri vetráku 1 (kombinácia vetrák + enemy)
    {
        x: 1650,
        y: 420,
        width: 28,
        height: 28,
        baseY: 420,
        amplitude: 22,
        phase: 2.7,
        speed: 2.1,
        dir: -1,
        leftBound: 1550,
        rightBound: 1900,
        alive: true,
        startX: 1650
    },

    // nový dron – pred koncom, nad poslednými platformami
    {
        x: 2450,
        y: 360,
        width: 28,
        height: 28,
        baseY: 360,
        amplitude: 18,
        phase: 3.2,
        speed: 2.2,
        dir: 1,
        leftBound: 2350,
        rightBound: 2750,
        alive: true,
        startX: 2450
    }
];

// === TEXTÚRY HRÁČA ===
const macky = {
    dolava: new Image(),
    doprava: new Image(),
    plazeniedoprava: new Image()
};

macky.dolava.src = '../../asseti/cyber-cat main cahrakter.png';
macky.doprava.src = '../../asseti/Cybermacka druhy pohlad.png';
macky.plazeniedoprava.src = '../../asseti/Plaziaca macka.png';

let actualnaakciacici = macky.dolava;
const keys = { right: false, left: false };

// === HRÁČ ===
let player = {
    x: 80,
    y: 400,
    width: 50,
    height: 50,
    dx: 0,
    dy: 0,
    speed: 4,
    jumpForce: 10,
    grounded: false,
    friction: 0.9,
    chceSaPostavit: false
};

// --- ATMOSFÉRA ---
let time = 0;
let fogParticles = [];
for (let i = 0; i < 30; i++) {
    fogParticles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 50 + 20,
        s: Math.random() * 0.5 + 0.1
    });
}
// === GRAFIKA – TEHLY / PIPES / SERVER ===

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

// === KOLÍZIA ===
function isTouching(a, b) {
    return (
        a.x < b.x + b.width &&
        a.x + a.width > b.x &&
        a.y < b.y + b.height &&
        a.y + a.height > b.y
    );
}

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

// === OVLÁDANIE ===
window.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        if (player.isdashing == true) return;
        keys.right = true;
        actualnaakciacici = macky.dolava;
    }

    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        keys.left = true;
        actualnaakciacici = macky.doprava;
    }

    if ((e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W' || e.code === 'Space') && player.grounded) {
        player.dy = -player.jumpForce;
        player.grounded = false;
    }

    if ((e.key === 'ArrowDown' || e.key === 's' || e.key === 'S' || e.key === 'Shift') && player.grounded) {
        player.height = 25;
        player.grounded = false;
        actualnaakciacici = macky.plazeniedoprava;
    }
    if ((e.key === 'Tab' || e.code === 'Tab')) {
        window.location.href = "/MenunaTab/tab.html";
    }
    
});

window.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') keys.right = false;
    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') keys.left = false;

    if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S' || e.key === 'Shift') {
        if (player.height === 25) {
            if (mozeSaPostavit()) {
                player.height = 50;
                player.y -= 25;
                player.chceSaPostavit = false;
                actualnaakciacici = macky.doprava;
            } else {
                player.chceSaPostavit = true;
            }
        }
    }

    if (e.key === 'Q' || e.key === 'q') {
        player.isdashing = false;
        player.dx = 0; 
    }
});

// === RESET HRÁČA ===
function resetPlayer() {
    player.x = 80;
    player.y = 400;
    player.dx = 0;
    player.dy = 0;
    player.height = 50;
    player.chceSaPostavit = false;
    actualnaakciacici = macky.dolava;

    enemies.forEach(e => {
        e.alive = true;
        e.x = e.startX;
        e.y = e.baseY;
        e.dir = Math.random() > 0.5 ? 1 : -1;
    });
}
// === HLAVNÁ SMYČKA ===
function animovanie() {
    requestAnimationFrame(animovanie);
    time += 0.01;

    const prevY = player.y;

    c.clearRect(0, 0, canvas.width, canvas.height);

    c.save();
    c.translate(-Karera.x, -Karera.y);

    // === POZADIE ===
    let bgGrad = c.createRadialGradient(400, 200, 50, 400, 200, 400);
    bgGrad.addColorStop(0, '#0a100a');
    bgGrad.addColorStop(1, '#010501');
    c.fillStyle = bgGrad;
    c.fillRect(0, 0, canvas.width, canvas.height);

    c.fillStyle = brickPattern;
    c.fillRect(0, 0, 10000, 3000);

    drawFog();

    // === ENEMY POHYB ===
    enemies.forEach(e => {
        if (!e.alive) return;

        e.x += e.speed * e.dir;
        if (e.x < e.leftBound || e.x > e.rightBound) e.dir *= -1;

        e.y = e.baseY + Math.sin(time * 3 + e.phase) * e.amplitude;
    });

    // === PLATFORMY ===
    platforms.forEach(p => {
        if (p.type === 'ground') {
            c.fillStyle = '#000';
            c.fillRect(p.x, p.y, p.width, p.height);
        }
        else if (p.type === 'pipe_v') {
            drawRealPipe(p, true);
        }
        else if (p.type === 'pipe_h') {
            drawRealPipe(p, false);
        }
        else if (p.type === 'wall') {
            drawRealServer(p);
        }
    });

    // === POHYB HRÁČA ===
    if (keys.right) player.dx += 0.8;
    else if (keys.left) player.dx -= 0.8;

    player.dx *= player.friction;

    if (player.dx > player.speed) player.dx = player.speed;
    if (player.dx < -player.speed) player.dx = -player.speed;

    player.x += player.dx;
    player.dy += gravitacia;
    player.y += player.dy;
    player.grounded = false;

    // === KAMERA ===
    Karera.x = player.x - canvas.width / 2;
    Karera.y = player.y - canvas.height / 2;

    if (Karera.x < 0) Karera.x = 0;
    if (Karera.y < 0) Karera.y = 0;

    // === KOLÍZIE S PLATFORMAMI ===
    platforms.forEach(platform => {
        if (
            player.x < platform.x + platform.width &&
            player.x + player.width > platform.x &&
            player.y < platform.y + platform.height &&
            player.y + player.height > platform.y
        ) {
            // pristátie na platforme
            if (player.dy > 0 && prevY + player.height <= platform.y) {
                player.y = platform.y - player.height;
                player.dy = 0;
                player.grounded = true;
            }
            // náraz z prava
            else if (player.dx > 0) {
                player.x = platform.x - player.width;
                player.dx = 0;
            }
            // náraz z ľava
            else if (player.dx < 0) {
                player.x = platform.x + platform.width;
                player.dx = 0;
            }
            // náraz zospodu
            else if (player.dy < 0) {
                player.y = platform.y + platform.height;
                player.dy = 0;
            }
        }
    });

    // === VETRÁKY – FYZIKA ===
    platforms.forEach(p => {
        // vertikálny vetrák
        if (p.id === 'vetrak5_up' && p.zapnuty) {
            const vnutri =
                player.x + player.width > p.x &&
                player.x < p.x + p.width &&
                player.y + player.height > p.y &&
                player.y < p.y + p.height + p.range;

            if (vnutri) {
                let sila = 0.6;
                if (player.y > p.y - p.range * 0.5) sila = 1.0;
                if (player.y > p.y - p.range * 0.2) sila = 1.4;

                player.dy -= sila;
                if (player.dy < -p.maxForce) player.dy = -p.maxForce;
            }
        }

        // horizontálny vetrák
        if (p.id === 'vetrak5_side' && p.zapnuty) {
            const vnutri =
                player.y + player.height > p.y &&
                player.y < p.y + p.height &&
                player.x < p.x &&
                player.x + player.width > p.x - p.range;

            if (vnutri) {
                player.dx -= 0.7;
                if (player.dx < -p.maxForce) player.dx = -p.maxForce;
            }
        }
    });

    // === GENEROVANIE VETERNÝCH PARTIKLOV ===
platforms.forEach(p => {

    // Vertikálny vetrák (vietor ide hore)
    if (p.id === 'vetrak5_up' && p.zapnuty) {
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

    // Horizontálny vetrák (vietor ide doľava)
    if (p.id === 'vetrak5_side' && p.zapnuty) {
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


    // === KOLÍZIE S ENEMY ===
    enemies.forEach(e => {
        if (!e.alive) return;

        if (isTouching(player, e)) {
            const playerBottomPrev = prevY + player.height;

            // hráč skočí na enemy
            if (player.dy > 0 && playerBottomPrev <= e.y) {
                e.alive = false;
                player.dy = -player.jumpForce * 0.6;
            }
            // hráč dostane zásah
            else {
                resetPlayer();
            }
        }
    });

    // === RENDER ENEMY ===
    enemies.forEach(e => {
        if (!e.alive) return;

        const cx = e.x + e.width / 2;
        const cy = e.y + e.height / 2;

        const grad = c.createRadialGradient(cx, cy, 2, cx, cy, 20);
        grad.addColorStop(0, '#ff4444');
        grad.addColorStop(0.5, '#aa0022');
        grad.addColorStop(1, 'black');

        c.fillStyle = grad;
        c.beginPath();
        c.arc(cx, cy, e.width / 2, 0, Math.PI * 2);
        c.fill();
    });

    // === HRÁČ ===
    if (actualnaakciacici.complete && actualnaakciacici.naturalWidth !== 0) {
        c.drawImage(actualnaakciacici, player.x, player.y, player.width, player.height);
    } else {
        c.fillStyle = 'yellow';
        c.fillRect(player.x, player.y, player.width, player.height);
    }
    // === RENDER VETERNÝCH PARTIKLOV ===
c.save();
windParticles.forEach((part, index) => {

    // pohyb
    if (part.direction === 'left') {
        part.x -= part.speed;
    } else {
        part.y -= part.speed;
    }

    part.opacity -= 0.015;

    // kreslenie
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

    // mazanie
    if (
        part.opacity <= 0 ||
        (part.direction === 'left' && part.x < part.minX) ||
        (!part.direction && part.y < part.maxHeight)
    ) {
        windParticles.splice(index, 1);
    }
});
c.restore();


    c.restore();

    // === EXIT ===
    if (isTouching(player, exitZone)) {
        if (typeof ProgresManazer !== 'undefined') {
            ProgresManazer.ulozLevel(11);
        }
        window.location.href = "/DataBay/Level1/level1.html";
    }
}

animovanie();
