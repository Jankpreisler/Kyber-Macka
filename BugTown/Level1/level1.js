const canvas = document.getElementById('gameCanvas');
const c = canvas.getContext('2d');

canvas.width = 1300;
canvas.height = 600;

const gravitacia = 0.4;

// Exit zóna
const exitZone = {
    x: 0,
    y: 450,
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
    friction: 2
};

// === Atmosféra BUGTOWN (tmavá, zeleno-čierna, červené bugy) ===
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

// === Tehlová textúra (tmavá, nie červená) ===
function getBrickPattern() {
    const p = document.createElement('canvas');
    const pc = p.getContext('2d');
    p.width = 32;
    p.height = 16;

    pc.fillStyle = '#0a0f0a';
    pc.fillRect(0, 0, 32, 16);

    pc.fillStyle = '#050805';
    pc.fillRect(0, 0, 30, 14);

    pc.fillStyle = '#111811';
    pc.fillRect(1, 1, 28, 12);

    return c.createPattern(p, 'repeat');
}
const brickPattern = getBrickPattern();

// === Rúry (tmavé, len jemné červené odlesky) ===
// === Rúry (tmavé, futuristické, stabilné) ===
function drawRealPipe(p, isVertical) {
    c.save();

    // --- tmavý kovový gradient ---
    let grad;
    if (isVertical) {
        grad = c.createLinearGradient(p.x, p.y, p.x + p.width, p.y);
    } else {
        grad = c.createLinearGradient(p.x, p.y, p.x, p.y + p.height);
    }

    grad.addColorStop(0,   '#0b0710');   // veľmi tmavá fialová
    grad.addColorStop(0.25,'#1a1125');   // jemný kovový odlesk
    grad.addColorStop(0.5, '#050208');   // stredový tieň
    grad.addColorStop(0.75,'#1a1125');   // späť odlesk
    grad.addColorStop(1,   '#0b0710');   // tmavý okraj

    c.fillStyle = grad;
    c.fillRect(p.x, p.y, p.width, p.height);

    // --- jemný tmavo-fialový okraj ---
    c.strokeStyle = 'rgba(120, 40, 180, 0.25)';
    c.lineWidth = 2.5;
    c.strokeRect(p.x, p.y, p.width, p.height);

    // --- jemné červené technické linky (pevné, neblikajú) ---
    c.strokeStyle = 'rgba(255, 0, 40, 0.18)';
    c.lineWidth = 1;

    if (isVertical) {
        for (let i = p.y + 12; i < p.y + p.height - 12; i += 26) {
            c.beginPath();
            c.moveTo(p.x + 4, i);
            c.lineTo(p.x + p.width - 4, i);
            c.stroke();
        }
    } else {
        for (let i = p.x + 12; i < p.x + p.width - 12; i += 26) {
            c.beginPath();
            c.moveTo(i, p.y + 4);
            c.lineTo(i, p.y + p.height - 4);
            c.stroke();
        }
    }

    // --- jemné červené body (pevné, tmavšie) ---
    const bugPoints = [
        { ox: 0.25, oy: 0.25 },
        { ox: 0.7,  oy: 0.35 },
        { ox: 0.4,  oy: 0.7  },
        { ox: 0.8,  oy: 0.75 }
    ];

    bugPoints.forEach(pt => {
        const bx = p.x + p.width * pt.ox;
        const by = p.y + p.height * pt.oy;
        const r = 3;

        let bug = c.createRadialGradient(bx, by, 0, bx, by, r * 2);
        bug.addColorStop(0, 'rgba(180,0,20,0.8)');
        bug.addColorStop(0.4, 'rgba(120,0,20,0.4)');
        bug.addColorStop(1, 'rgba(0,0,0,0)');

        c.fillStyle = bug;
        c.beginPath();
        c.arc(bx, by, r * 2, 0, Math.PI * 2);
        c.fill();
    });

    c.restore();
}


// === Tlačidlo (BUG červené) ===
function drawStyledButton(btn, isHovered = false, isPressed = false) {
    c.save();

    c.fillStyle = isPressed ? '#440000' : (isHovered ? '#2a2a2a' : '#111');
    c.fillRect(btn.x, btn.y, btn.width, btn.height);

    c.strokeStyle = isPressed ? '#ff0000' : '#550000';
    c.lineWidth = isPressed ? 4 : 2;
    c.strokeRect(btn.x, btn.y, btn.width, btn.height);

    c.strokeStyle = isPressed ? '#ff0000' : '#330000';
    c.lineWidth = 1;
    for (let i = btn.y + 8; i < btn.y + btn.height - 5; i += 6) {
        c.beginPath();
        c.moveTo(btn.x + 15, i);
        c.lineTo(btn.x + btn.width - 15, i);
        c.stroke();
    }

    c.restore();
}

// === Server (tmavý, červené error LED) ===
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
        c.fillStyle = Math.random() > 0.97 ? '#ff0033' : '#330000';
        c.fillRect(p.x + 5, i, 4, 3);
    }

    c.restore();
}


// === BUG MESTO (výraznejšie, neonové, viac vibrat farby) ===
function drawBugCity() {
    c.save();

    const baseY = 1600;
    const cityWidth = 4000;

    // --- Jemné fialové pásy (tmavšie pozadie) ---
    for (let i = 0; i < 40; i++) {
        const y = baseY - 600 + i * 30;
        c.fillStyle = `rgba(140, 80, 255, 0.05)`;
        c.fillRect(-500, y, cityWidth + 1000, 2);
    }

    // --- Jemné fialovo-ružové mraky ---
    for (let i = 0; i < 20; i++) {
        const cx = (i * 200 + time * 200) % (cityWidth + 400) - 200;
        const cy = baseY - 300 + Math.sin(i + time) * 80;
        const r = 140;

        let cloud = c.createRadialGradient(cx, cy, 0, cx, cy, r);
        cloud.addColorStop(0, 'rgba(200,120,255,0.18)');
        cloud.addColorStop(1, 'transparent');

        c.fillStyle = cloud;
        c.beginPath();
        c.arc(cx, cy, r, 0, Math.PI * 2);
        c.fill();
    }

    // --- Budovy (výrazné, neonové, cyberpunk) ---
    for (let x = -400; x < cityWidth; x += 180) {

        const noise = Math.sin((x + time * 200) / 200);
        const height = 500 + noise * 120;
        const y = baseY - height;

        // telo budovy (výraznejšia fialová)
        let bGrad = c.createLinearGradient(x, y, x, baseY);
        bGrad.addColorStop(0, 'rgba(90,0,120,0.35)');
        bGrad.addColorStop(0.4, 'rgba(120,0,160,0.55)');
        bGrad.addColorStop(1, 'rgba(40,0,60,0.95)');
        c.fillStyle = bGrad;
        c.fillRect(x, y, 140, height);

        // neonový obrys
        c.strokeStyle = 'rgba(255,0,60,0.45)';
        c.lineWidth = 3;
        c.strokeRect(x, y, 140, height);

        // okná (výrazné, neonovo červené)
        const windowSize = 10;
        const windowGapX = 16;
        const windowGapY = 18;

        for (let wy = y + 20; wy < baseY - 20; wy += windowGapY) {
            for (let wx = x + 12; wx < x + 140 - 12; wx += windowGapX) {

                c.fillStyle = 'rgba(255, 40, 80, 0.9)';
                c.fillRect(wx, wy, windowSize, windowSize);

                // jemný glow okolo okna
                let glow = c.createRadialGradient(wx + 5, wy + 5, 0, wx + 5, wy + 5, 12);
                glow.addColorStop(0, 'rgba(255,40,80,0.4)');
                glow.addColorStop(1, 'transparent');

                c.fillStyle = glow;
                c.beginPath();
                c.arc(wx + 5, wy + 5, 12, 0, Math.PI * 2);
                c.fill();
            }
        }

        // červené glitch pruhy (pevné, výraznejšie)
        c.fillStyle = 'rgba(255,0,60,0.25)';
        const gx = x + 20;
        c.fillRect(gx, y, 3, height);

        // infekčné uzly (výraznejšie)
        const bugPoints = [
            { ox: 0.25, oy: 0.15 },
            { ox: 0.7,  oy: 0.25 },
            { ox: 0.4,  oy: 0.55 },
            { ox: 0.8,  oy: 0.65 }
        ];

        bugPoints.forEach(pt => {
            const bx = x + 140 * pt.ox;
            const by = y + height * pt.oy;
            const r = 10;

            let bug = c.createRadialGradient(bx, by, 0, bx, by, r * 2);
            bug.addColorStop(0, 'rgba(255,0,60,1)');
            bug.addColorStop(0.4, 'rgba(255,80,120,0.7)');
            bug.addColorStop(1, 'rgba(0,0,0,0)');

            c.fillStyle = bug;
            c.beginPath();
            c.arc(bx, by, r * 2, 0, Math.PI * 2);
            c.fill();
        });

        // anténa (výraznejšia)
        c.strokeStyle = 'rgba(255,0,80,0.8)';
        c.lineWidth = 2;
        c.beginPath();
        c.moveTo(x + 70, y);
        c.lineTo(x + 70, y - 50);
        c.stroke();

        // neonový bod
        c.fillStyle = 'rgba(255,0,80,1)';
        c.beginPath();
        c.arc(x + 70, y - 55, 4, 0, Math.PI * 2);
        c.fill();
    }

    c.restore();
}

 


// === Fog (zeleno-čierny digitálny smog) ===
function drawFog() {
    c.save();
    c.globalCompositeOperation = 'screen';

    fogParticles.forEach(p => {
        let grad = c.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r);
        grad.addColorStop(0, 'rgba(0, 255, 80, 0.05)');
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
    if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
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

    if ((e.code === 'Backspace') && player.grounded) {
        player.dy = -player.jumpForce;
        player.grounded = false;
    }

    if ((e.key === 'ArrowDown' || e.key === 's' || e.key === 'S' || e.key === 'Shift') && player.grounded) {
        player.height = 25;
        player.grounded = false;
        actualnaakciacici = macky.plazeniedoprava;
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
let bgGrad = c.createLinearGradient(0, 900, 0, canvas.height + 900);
bgGrad.addColorStop(0, '#1d1f4d');   // tmavá modro-fialová
bgGrad.addColorStop(0.5, '#2a1a55'); // tmavá fialová
bgGrad.addColorStop(1, '#120a22');   // veľmi tmavá fialová, ale nie čierna

c.fillStyle = bgGrad;
c.fillRect(0, -900, canvas.width, canvas.height + 1800);


    // BUG MESTO (za platformami, pred tehlami)
    drawBugCity();

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
        window.location.href = "SerWers/Level6-prechod_do_bugtown/Prechod.html";
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
