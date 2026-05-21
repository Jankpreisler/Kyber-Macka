const canvas = document.getElementById('gameCanvas');
const c = canvas.getContext('2d');
let facingRight = true;
let windParticles = [];


canvas.width = 1300;
canvas.height = 600;

let zobrazitHUD = true;
let mana = 100;
let maximalnaMana = 100;
let minmana = 0;

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
        width: 50,
        height: 50,
        type: 'valve',
        id: 'vetrak5_side',
        range: 900,
        zapnuty: true,
        maxForce: 7.2
    }
];

const enemies = [
    {
        x: 400,
        y: 430,
        width: 50,
        height: 50,
        baseY: 420,
        phase: 0,
        speed: 1,
        dir: 1,
        leftBound: 400,
        rightBound: 500,
        alive: true,
        startX: 400
    },
    {
        x: 1050,
        y: 340,
        width: 50,
        height: 50,
        baseY: 340,
        phase: 1.4,
        speed: 1,
        dir: -1,
        leftBound: 1050,
        rightBound: 1100,
        alive: true,
        startX: 1050
    },
   
    // nový dron – nad prvými schodíkmi
    {
        x: 700,
        y: 450,
        width: 50,
        height: 50,
        baseY: 380,  
        phase: 0.7,
        speed: 1,
        dir: -1,
        leftBound: 700,
        rightBound: 770,
        alive: true,
        startX: 700
    },

    // nový dron – nad vyššou plošinou
    {
        x: 50,
        y: 280,
        width: 50,
        height: 50,
        baseY: 280,
        phase: 1.9,
        speed: 2,
        dir: 1,
        leftBound: 1380,
        rightBound: 1680,
        alive: true,
        startX: 1450
    },

    // nový dron – pri vetráku 1 (kombinácia vetrák + enemy)
    {
        x: 1750,
        y: 420,
        width: 50,
        height: 50,
        baseY: 380,
        phase: 2.7,
        speed: 1,
        dir: -1,
        leftBound: 1750,
        rightBound: 1850,
        alive: true,
        startX: 1750
    },

    // nový dron – pred koncom, nad poslednými platformami
    
];

const enemak = {
    test: new Image(),
}

// === TEXTÚRY HRÁČA ===
const macky = {
    dolava: new Image(),
    doprava: new Image(),
    plazeniedoprava: new Image()
};

macky.dolava.src = '../../asseti/cyber-cat main cahrakter.png';
macky.doprava.src = '../../asseti/Cybermacka druhy pohlad.png';
macky.plazeniedoprava.src = '../../asseti/Plaziaca macka.png';

enemak.test.src = '../../asseti/pixil-frame-0.png'

let actualnaakciacici = macky.dolava;
const keys = { right: false, left: false };

// === HRÁČ ===
let player = {
    x: 50,
    y: 400,
    width: 50,
    height: 50,
    dx: 0,
    dy: 0,
    speed: 4,
    jumpForce: 10,
    grounded: false,
    isdashing: false,
    friction: 0.9,
    chceSaPostavit: false,
    dashspeed: 35,
    isRaging: false,
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
    if ((e.key === 'Q' || e.key === 'q') && mana >= 20) {
        if (player.isdashing == true) return;

        mana -= 20;
        player.isdashing = true;
        let smer = 0;
        if (keys.right) {
            smer = 1;
        } else if (keys.left) {
            smer = -1;
        } else {
            smer = (actualnaakciacici === macky.dolava) ? 1 : -1;
        }
        player.dx = smer * player.dashspeed;
    }
    if (e.key === 'r' || e.key === 'R') {
        if (mana > 20 && !player.isNahnevany) {
            player.isRaging = true;
        } else {
            player.isRaging = false; // Opätovné stlačenie vypne mód
        }
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
    if (e.key === 'R' || e.key === 'r') {
        player.isRaging = false;
       
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

    const prevY = player.y; // Potrebné pre správnu detekciu skoku na hlavu enemy

    c.clearRect(0, 0, canvas.width, canvas.height);

    c.save();
    c.translate(-Karera.x, -Karera.y);


    // 1. Pozadie
    let bgGrad = c.createRadialGradient(400, 200, 50, 400, 200, 400);
    bgGrad.addColorStop(0, '#0a100a');
    bgGrad.addColorStop(1, '#010501');
    c.fillStyle = bgGrad;
    c.fillRect(0, 0, canvas.width, canvas.height);

    c.fillStyle = brickPattern;
    c.fillRect(0, 0, 30000, 30000);

    drawFog();


    if (player.isRaging) {
        maximalnaMana -= 0.5; 
        mana -= 0.5; 
    } 
    else if (mana < maximalnaMana) {
        mana += 0.1; 
    }

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
        else if (p.type === 'trigger') {
            drawStyledButton(p, false, p.isPressed);
        }
        else if (p.type === 'valve') {
            c.save();
            c.translate(p.x + p.width / 2, p.y + p.height / 2);
            c.shadowBlur = 15;
            c.shadowColor = '#ff0000';
            c.strokeStyle = '#ff0000';
            c.lineWidth = 2;
            c.strokeRect(-p.width / 2, -p.height / 2, p.width, p.height);
            c.fillStyle = '#000';
            c.fillRect(-p.width / 2, -p.height / 2, p.width, p.height);
            c.shadowBlur = 0; // Vypnutie žiary pre vnútorné detaily
            c.strokeStyle = 'rgba(255, 0, 0, 0.6)';
            c.lineWidth = 1;
            c.restore();
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

    // === ENEMY POHYB (Z PRVÉHO KÓDU) ===
    enemies.forEach(e => {
        if (!e.alive) return;

        e.x += e.speed * e.dir;
        if (e.x < e.leftBound || e.x > e.rightBound) 
            e.dir *= -1;

        e.y = e.baseY;
    });

    // --- LOGIKA DASHU (DOPLNENIE) ---
    if (player.isdashing) {
        if (Math.abs(player.dx) < 5) {
            player.isdashing = false;
        }
    }
    
    // 3. Pohyb a fyzika hráča
    if (!player.isdashing) {
        if (keys.right) player.dx += 0.8;
        else if (keys.left) player.dx -= 0.8;
    }
    player.dx *= player.friction;

    // Limit maximálnej rýchlosti hráča
    if (player.isdashing == true) {
        if (player.dx > player.dashspeed) player.dx = player.dashspeed;
        if (player.dx < -player.dashspeed) player.dx = -player.dashspeed;
    }
    else {
        if (player.dx > player.speed) player.dx = player.speed;
        if (player.dx < -player.speed) player.dx = -player.speed;
        player.dy += gravitacia;
    }

    player.x += player.dx;
    player.y += player.dy;
    player.grounded = false;

    facingRight = (actualnaakciacici === macky.dolava);
DashTrail.update(player, player.isdashing, facingRight);
DashTrail.updateDeath();
DashTrail.updateRageAura(player.isRaging, player); 

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
        if (p.id === 'vetrak2' && p.zapnuty === true) {

            const vnutri =
                player.y + player.height > p.y &&
                player.y < p.y + p.height &&
                player.x < p.x &&
                player.x + player.width > p.x - p.range;

            if (vnutri) {
                player.dx -= 0.67;
            }

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

    // 4. Kolízie s platformami
    platforms.forEach(platform => {
        if (platform.id === "stienkaprechodna") return;
        if (platform.id === "vetrak2") return;
        if (platform.visible === false) return;
        if (
            player.x < platform.x + platform.width &&
            player.x + player.width > platform.x &&
            player.y < platform.y + platform.height &&
            player.y + player.height > platform.y
        ) {
         if (platform.type === 'floor') {

    // === DEATH ANIMATION ===
    DashTrail.triggerDeath(player);

    player.width = 0;
    player.height = 0;
    player.dx = 0;
    player.dy = 0;

    setTimeout(() => {
        player.width = 50;
        player.height = 50;
        resetPlayer();
    }, 350);

    return;
}


            // dopad zhora
            if (player.dy >= 0 && (player.y + player.height - player.dy) <= platform.y + 5) {
                player.y = platform.y - player.height;
                player.dy = 0;
                player.grounded = true;

                if (platform.type === 'valve' && platform.speed) {
                    player.y += platform.speed * platform.direction;
                }
                else if (platform.type === 'pipe_h' && platform.speed) {
                    player.x += platform.speed * platform.direction;
                }
            }

            // náraz sprava do steny
            else if (player.dx > 0 && (player.x + player.width - player.dx) <= platform.x) {
                player.x = platform.x - player.width;
                player.dx = 0; 
            }

            // náraz zľava do steny
            else if (player.dx < 0 && (player.x - player.dx) >= platform.x + platform.width) {
                player.x = platform.x + platform.width;
                player.dx = 0; 
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

    enemies.forEach(e => {
        if (!e.alive) return;
    
        if (isTouching(player, e)) {
            if (player.isRaging) {
                e.alive = false; // Zomrie z každej strany počas Cyber Rage
                player.dx *= -0.5; 
            } 
            else {
                const playerBottomPrev = prevY + player.height;
                
                if (player.dy > 0 && playerBottomPrev <= e.y) {
                    e.alive = false;
                    player.dy = -player.jumpForce * 0.6;
                } else {
                    resetPlayer(); 
                }
            }
        }
    });

    // === RENDER ENEMY (Z PRVÉHO KÓDU) ===
    enemies.forEach(e => {
        if (!e.alive) return;

        const cx = e.x + e.width / 2;
        const cy = e.y + e.height / 2;

        const grad = c.createRadialGradient(cx, cy, 2, cx, cy, 20);
        c.drawImage(enemak.test, e.x, e.y, e.width, e.height);

        c.fillStyle = grad;
        c.beginPath();
        c.arc(cx, cy, e.width / 2, 0, Math.PI * 2);
        c.fill();
    });

    // === 5. KAMERA A POSTAVENIE SA ===
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

    function vykonajAkciu(id) {
        const btn = platforms.find(p => p.id === id);
        if (btn) btn.isPressed = true;

        if (id === 'tlacidlo3') {
            nastavViditelnost('vetrak2', false); 
            console.log("Cesta je voľná!");
        }
    }

    // PRECHOD DO ĎALŠIEHO LEVELU
    if (isTouching(player, exitZone)) {
        if (typeof ProgresManazer !== 'undefined') {
            ProgresManazer.ulozLevel(9);
        }
        window.location.href = "/BugTown/Level4/level4.html";
    }

DashTrail.draw(c);
DashTrail.drawDeath(c);
DashTrail.drawRageAura(c); 

    // 6. Vykreslenie postavy
    if (actualnaakciacici && actualnaakciacici.complete && actualnaakciacici.naturalWidth !== 0) {
        c.drawImage(actualnaakciacici, player.x, player.y, player.width, player.height);
    } else {
        c.fillStyle = 'red';
        c.fillRect(player.x, player.y, player.width, player.height);
    }

    c.restore();

    // === VYKRESLENIE HUD ===
    if (zobrazitHUD === true) {
        c.save();

        const barX = 20;
        const barY = 20;
        const barWidth = 250;
        const barHeight = 30;

        // 1. Pozadie baru (tmavý podklad)
        c.fillStyle = 'rgba(20, 20, 20, 0.8)';
        c.beginPath();
        c.roundRect(barX, barY, barWidth, barHeight, 5);
        c.fill();
        c.strokeStyle = '#333';
        c.lineWidth = 4;
        c.stroke();

        // 2. Samotný Progress (Výplň many)
        let percento = mana / maximalnaMana;
        if (percento < 0) percento = 0; 

        let manaGrad = c.createLinearGradient(barX, 0, barX + barWidth, 0);
        manaGrad.addColorStop(0, '#0044ff'); 
        manaGrad.addColorStop(1, '#00d4ff'); 

        c.fillStyle = manaGrad;
        c.beginPath();
        c.roundRect(barX + 2, barY + 2, (barWidth - 4) * percento, barHeight - 4, 3);
        c.fill();

        // 3. Efekt "lesku" na bare
        c.fillStyle = 'rgba(255, 255, 255, 0.1)';
        c.fillRect(barX + 2, barY + 2, (barWidth - 4) * percento, (barHeight - 4) / 2);

        // 4. Textové info
        c.fillStyle = "white";
        c.font = "bold 13px Courier New";
        c.shadowColor = "black";
        c.shadowBlur = 4;
        c.fillText(`ENERGY: ${Math.floor(mana)} / ${maximalnaMana}`, barX + 10, barY + 20);
        c.shadowBlur = 0;

        // --- JEDNODUCHÝ INVENTÁR ---
        c.fillStyle = "rgba(0, 0, 0, 0.6)";
        c.beginPath();
        c.roundRect(barX, barY + 455, 200, 100, 5); 
        c.fill();

        c.fillStyle = "#aaa";
        c.font = "11px Arial";
        c.fillText("• Cyber Dash [Q]", barX + 10, barY + 480);
        // Ak je aktívny Rage, vykreslí sa v inventári (zmenené z "Error 404 [LOCKED]" podľa kódu 1)
        c.fillText(player.isRaging ? "• Cyber Rage  [R]" : "• Cyber Rage  [R]", barX + 10, barY + 500);
        c.fillText("• Error 404 [LOCKED]", barX + 10, barY + 520);
        c.fillText("• Error 404 [LOCKED]", barX + 10, barY + 540);

        c.restore();
    }
}

animovanie();