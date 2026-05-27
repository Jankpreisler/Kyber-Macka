const canvas = document.getElementById('gameCanvas');
const c = canvas.getContext('2d');


canvas.width = 1300; // na normal leevely
canvas.height = 600;

let zobrazitHUD = true;
let mana = 100;
let maximalnaMana = 100;
let minmana = 0;
let abilityUnlocked = false;

const gravitacia = 0.4;

const exitZone = {
    x: 3250,
    y: 1200,
    width: 5000,
    height: 80
};

const Karera = {
    x: 0,
    y: 0,
    width: canvas.height,
    height: canvas.height
};

// === DEFINÍCIA PLATFORIEM === Pridanie speedMultiho a frictionu
const platforms = [
    { x: 0, y: 3500, width: 1000750, height: 20, color: '#050505', type: 'floor' }, //kill
    { x: 0, y: 800, width: 750, height: 230, color: '#333', type: 'pipe_v' }, //spawn
    { x: -150, y: 100, width: 150, height: 2000000, color: '#333', type: 'pipe_v' }, //left border
    { x: 1000, y: 0, width: 250, height: 1230, color: '#333', type: 'pipe_v' },
    { x: 0, y: 2300, width: 2250, height: 100, color: '#333', type: 'pipe_h', friction: 0.2 },
    { x: 2500, y: 2700, width: 250, height: 150, color: '#333', type: 'pipe_v', range: 3000, id: 'vetrak', zapnuty: true },
    { x: 0, y: 2900, width: 1900, height: 150, color: '#333', type: 'pipe_h', speedMultiplier: 25 },
    { x: 1250, y: 600, width: 750, height: 230, color: '#333', type: 'pipe_v' },
    { x: 1350, y: 550, width: 150, height: 50, color: '#333', type: 'trigger', id: 'tlacidlo3', isPressed: false, },
    { x: 50, y: 2850, width: 150, height: 50, color: '#333', type: 'trigger', id: 'tlacidlo2', isPressed: false, },
    { x: 3100, y: 450, width: 250, height: 3333, color: '#333', type: 'pipe_v' },
    { x: 3300, y: 0, width: 150, height: 450, type: 'pipe_h', range: 1100, id: 'vetrak2', zapnuty: true, range: 450 },
    { x: 3350, y: 1250, width: 550, height: 250, color: '#333', type: 'pipe_v' },


];

const boxy = [
    { x: 55555555, y: 1850, width: 50, height: 50, dx: 0, dy: 0, friction: 0.8 },
];

const jamka = {
    x: 5555555555555555,
    y: 1,
    width: 1,
    height: 30,
    aktivna: false
};

const macky = {
    dolava: new Image(),
    doprava: new Image(),
    plazeniedoprava: new Image(),
    npc: new Image(),
    test: new Image(),
};

macky.dolava.src = '../../asseti/cyber-cat main cahrakter.png';
macky.doprava.src = '../../asseti/Cybermacka druhy pohlad.png';
macky.plazeniedoprava.src = '../../asseti/Plaziaca macka.png';
macky.npc.src = '../../asseti/rokwel.png';
macky.test.src = '../../asseti/EvilFujCat.png'

let actualnaakciacici = macky.dolava;

const keys = {
    right: false,
    left: false,
    up: false,
    down: false,
    t: false
};

// === VLASTNOSTI HRÁČA ===
let player = {
    x: 50,
    y: 750,
    width: 50,
    height: 50,
    dx: 0,
    dy: 0,
    speed: 4,
    jumpForce: 10,
    grounded: false,
    friction: 0.9,
    isdashing: false,
    dashspeed: 35,
    chceSaPostavit: false,
    hp: 100,
    maxhp: 100,
    jeNezranitelny: false,
    casNezranitelnosti: 0,
    isRaging: false,
    direction: "doprava"
};
const utocnici = [
    {
        x: 1050,
        y: 2250,
        width: 50,
        height: 50,
        startX: 1050,
        range: 300,
        speed: 2,
        direction: 1,
        detectionRange: 250,
        isHostile: false,
        hp: 50,
        isDead: false,
        damage: 15,
        color: '#ff0055'
    },
    {
        x: 750,
        y: 2250,
        width: 50,
        height: 50,
        startX: 750,
        range: 200,
        speed: 2.5,
        direction: -1,
        detectionRange: 300,
        isHostile: false,
        hp: 50,
        isDead: false,
        damage: 15,
        color: '#ff0055'
    },
    {
        x: 850,
        y: 2250,
        width: 50,
        height: 50,
        startX: 850,
        range: 200,
        speed: 2.5,
        direction: -1,
        detectionRange: 300,
        isHostile: false,
        hp: 50,
        isDead: false,
        damage: 15,
        color: '#ff0055'
    },
    {
        x: 950,
        y: 2250,
        width: 50,
        height: 50,
        startX: 950,
        range: 200,
        speed: 2.5,
        direction: -1,
        detectionRange: 300,
        isHostile: false,
        hp: 50,
        isDead: false,
        damage: 15,
        color: '#ff0055'
    },
];

function aktualizujUtocnikov() {
    utocnici.forEach(en => {
        if (en.isDead) return;

        let vzdialenostOdHraca = Math.sqrt((player.x - en.x) ** 2 + (player.y - en.y) ** 2);

        if (vzdialenostOdHraca < en.detectionRange) {
            en.isHostile = true;

            if (en.x < player.x) {
                en.x += en.speed * 1.5;
                en.direction = 1;
            } else if (en.x > player.x) {
                en.x -= en.speed * 1.5;
                en.direction = -1;
            }
        } else {
            en.isHostile = false;
            en.x += en.speed * en.direction;
            if (en.x > en.startX + en.range || en.x < en.startX) {
                en.direction *= -1;
            }
        }

        if (
            player.x < en.x + en.width &&
            player.x + player.width > en.x &&
            player.y < en.y + en.height &&
            player.y + player.height > en.y
        ) {
            const playerPadal = player.dy > 0;
            const jeZhora =
                player.y + player.height - player.dy <= en.y + 10;

            if (playerPadal && jeZhora) {
                en.hp -= 50;
                player.dy = -8;
                player.grounded = false;

                // smrť enemyho
                if (en.hp <= 0) {
                    en.isDead = true;
                    DashTrail.triggerDeath(player);
                }

                return;
            }
            if (!player.jeNezranitelny && !player.isRaging) {
                player.jeNezranitelny = true;
                player.casNezranitelnosti = 60;
                Damageudelovator.uberHP(
                    player,
                    en.damage,
                    resetPlayer,
                    DashTrail.triggerDeath(player)
                );
            }
            if (player.isRaging && isTouching(player, en)) {
                en.isDead = true;
                player.dx *= -0.4;
                return;
            }
        }

    });
}
function vykresliUtocnikov() {
    utocnici.forEach(en => {
        if (en.isDead) return;

        // Vykreslenie vizuálneho okruhu detekcie (voliteľné, super pre debug a sci-fi atmosféru)
        c.save();
        c.strokeStyle = en.isHostile ? 'rgba(255, 0, 85, 0.3)' : 'rgba(0, 255, 255, 0.08)';
        c.lineWidth = 2;
        c.beginPath();
        c.arc(en.x + en.width / 2, en.y + en.height / 2, en.detectionRange, 0, Math.PI * 2);
        c.stroke();
        c.restore();

        if (macky.test && macky.test.complete && macky.test.naturalWidth !== 0) {
            c.save();
            if (en.direction === -1) {
                c.translate(en.x + en.width / 2, en.y);
                c.scale(-1, 1);
                c.drawImage(macky.test, -en.width / 2, 0, en.width, en.height);
            } else {
                c.drawImage(macky.test, en.x, en.y, en.width, en.height);
            }

            c.restore();
        }
    });
}

// --- ATMOSFÉRICKÉ EFEKTY ---
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

function drawStyledButton(btn, isHovered = false, isPressed = false) {
    c.save();

    if (isPressed) {
        c.fillStyle = '#0d1bff';
    } else {
        c.fillStyle = isHovered ? '#1a1d24' : '#0d0f12';
    }

    c.fillRect(btn.x, btn.y, btn.width, btn.height);

    c.strokeStyle = isPressed ? '#4f7dff' : '#323741';
    c.lineWidth = isPressed ? 4 : 2;
    c.strokeRect(btn.x, btn.y, btn.width, btn.height);

    c.strokeStyle = isPressed ? 'rgba(120,180,255,0.5)' : '#1a1d24';
    c.lineWidth = 1;

    for (let i = btn.y + 8; i < btn.y + btn.height - 5; i += 6) {
        c.beginPath();
        c.moveTo(btn.x + 15, i);
        c.lineTo(btn.x + btn.width - 15, i);
        c.stroke();
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

function isTouching(a, b) {
    return (
        a.x < b.x + b.width &&
        a.x + a.width > b.x &&
        a.y < b.y + b.height &&
        a.y + a.height > b.y
    );
}

function isTouchingWall(a, b) {
    return (
        a.x - 2 < b.x + b.width &&
        a.x + a.width + 2 > b.x &&
        a.y < b.y + b.height &&
        a.y + a.height > b.y
    );
}

window.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        if (player.isdashing == true) return;
        keys.right = true;
        player.direction = "doprava";

    }

    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        keys.left = true;
        player.direction = "dolava";

    }

    if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        keys.up = true;
    }

    if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        keys.down = true;
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

    if (e.key === 't' || e.key === 'T') {
        keys.t = true;
    }
    if ((e.key === 'Tab' || e.code === 'Tab')) {
        window.location.href = "/MenunaTab/tab.html";
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

    if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') keys.up = false;
    if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') keys.down = false;

    if (e.key === 't' || e.key === 'T') keys.t = false;

    if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S' || e.key === 'Shift') {
        if (player.height === 25) {
            if (mozeSaPostavit()) {
                player.height = 50;
                player.y -= 25;
    
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

function nastavViditelnost(id, stav) {
    const p = platforms.find(obj => obj.id === id);
    if (p) {
        p.zapnuty = stav;
    }
}

function resetPlayer() {
    player.x = 50;
    player.y = 750;
    player.dx = 0;
    player.dy = 0;
    player.height = 50;

}

// === HLAVNÁ SMYČKA ===
function animovanie() {
    requestAnimationFrame(animovanie);
    time += 0.01;

    c.clearRect(0, 0, canvas.width, canvas.height);



    let bg = c.createLinearGradient(0, 0, 0, canvas.height);
    bg.addColorStop(0, '#0a0d14');
    bg.addColorStop(1, '#0f1622');

    c.fillStyle = bg;
    c.fillRect(0, 0, canvas.width, canvas.height);

    let glow = c.createRadialGradient(
        canvas.width / 2, canvas.height / 3, 50,
        canvas.width / 2, canvas.height / 3, 600
    );
    glow.addColorStop(0, 'rgba(80,120,200,0.15)');
    glow.addColorStop(1, 'transparent');

    c.fillStyle = glow;
    c.fillRect(0, 0, canvas.width, canvas.height);

    c.save();
    c.globalCompositeOperation = 'screen';
    fogParticles.forEach(p => {
        let fogGrad = c.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r);
        fogGrad.addColorStop(0, 'rgba(120,160,220,0.08)');
        fogGrad.addColorStop(1, 'transparent');

        c.fillStyle = fogGrad;
        c.beginPath();
        c.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        c.fill();

        p.x += Math.sin(time + p.r) * 0.15;
    });
    c.restore();


    c.save();
    c.translate(-Karera.x, 0 - Karera.y);


    platforms.forEach(p => {
        if (p.visible === false) return;
        if (p.type === 'trigger') {
            drawStyledButton(p, false, p.isPressed);
            return;
        }

        const jeSpomalovacia = p.friction !== undefined && p.friction < 1;
        const jeZrychlovacia = p.friction !== undefined && p.friction > 1;
        const jeNormalna = p.friction === undefined;

        c.save();

        // NORMALNA PLATFORMA
        if (jeNormalna) {
            let grad = c.createLinearGradient(p.x, p.y, p.x + p.width, p.y + p.height);
            grad.addColorStop(0, '#0b1220');
            grad.addColorStop(1, '#132544');

            c.fillStyle = grad;
            c.fillRect(p.x, p.y, p.width, p.height);

            c.shadowColor = 'rgba(80,150,255,0.35)';
            c.shadowBlur = 18;
            c.fillRect(p.x, p.y, p.width, p.height);
        }

        // SPOMALOVACIA
        else if (jeSpomalovacia) {
            let grad = c.createLinearGradient(p.x, p.y, p.x + p.width, p.y);
            grad.addColorStop(0, '#06080f');
            grad.addColorStop(1, '#0d1524');

            c.fillStyle = grad;
            c.fillRect(p.x, p.y, p.width, p.height);

            c.fillStyle = 'rgba(0,0,0,0.25)';
            c.fillRect(p.x, p.y, p.width, p.height);
        }

        // ZRYCHLOVACIA
        else if (jeZrychlovacia) {
            let grad = c.createLinearGradient(p.x, p.y, p.x, p.y + p.height);
            grad.addColorStop(0, '#1a4fff');
            grad.addColorStop(1, '#6fc3ff');

            c.fillStyle = grad;
            c.fillRect(p.x, p.y, p.width, p.height);

            c.shadowColor = 'rgba(120,200,255,0.45)';
            c.shadowBlur = 25;
            c.fillRect(p.x, p.y, p.width, p.height);
        }

        c.restore();
    });



    if (player.isRaging) {
        maximalnaMana -= 0.5;
        mana -= 0.5;
    }
    else if (mana < maximalnaMana) {
        mana += 0.1;
    }

    if (player.isdashing) {
        if (Math.abs(player.dx) < 5) {
            player.isdashing = false;
        }
    }

    // 3. Pohyb a fyzika s vlastnosťami
    let activeFriction = player.friction;
    let activeSpeed = player.speed;

    // Zistíme, či sa mačka nachádza na špeciálnej platforme
    platforms.forEach(p => {
        if (p.visible === false) return;

        // Kontrola, či hráč stojí na vrchole platformy
        if (
            player.x < p.x + p.width &&
            player.x + player.width > p.x &&
            player.y + player.height >= p.y &&
            player.y + player.height <= p.y + 12
        ) {
            if (p.friction !== undefined) {
                activeFriction = p.friction;
            }
            if (p.speedMultiplier !== undefined) {
                activeSpeed = player.speed * p.speedMultiplier;
            }
        }
    });

    if (!player.isdashing) {
        if (keys.right) player.dx += 0.8;
        else if (keys.left) player.dx -= 0.8;
    }

    player.dx *= activeFriction;

    if (player.isdashing) {
        if (player.dx > player.dashspeed) player.dx = player.dashspeed;
        if (player.dx < -player.dashspeed) player.dx = -player.dashspeed;
    } else {
        if (player.dx > activeSpeed) player.dx = activeSpeed;
        if (player.dx < -activeSpeed) player.dx = -activeSpeed;

        let isClimbing = false;
        if (keys.t) {
            platforms.forEach(p => {
                if (p.visible === false || p.id === "stienkaprechodna" || p.type === 'trigger') return;
                if (isTouchingWall(player, p)) {
                    isClimbing = true;
                }
            });
        }

        if (isClimbing) {
            player.dy = 0;
            player.dx = 0;
            if (keys.up) {
                player.dy = -activeSpeed * 0.7;
            } else if (keys.down) {
                player.dy = activeSpeed * 0.7;
            }
        } else {
            player.dy += gravitacia;
        }
    }

    player.x += player.dx;
    player.y += player.dy;
    player.grounded = false;

    const facingRight = (actualnaakciacici === macky.dolava);
    DashTrail.update(player, player.isdashing, facingRight);
    DashTrail.updateDeath();
    DashTrail.updateRageAura(player.isRaging, player);



    // Logika ventilátora
    platforms.forEach(p => {
        if (p.id === 'vetrak' && p.zapnuty === true) {
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

    // Vykreslenie častíc vetra
    c.save();
    windParticles.forEach((part, index) => {
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
    aktualizujUtocnikov();
    vykresliUtocnikov();

    Damageudelovator.aktualizujNezranitelnost(player);
    // 4. Kolízie
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


            if (player.dy >= 0 && (player.y + player.height - player.dy) <= platform.y + 5) {
                player.y = platform.y - player.height;
                player.dy = 0;
                player.grounded = true;

                if (platform.type === 'valve' && platform.speed) {
                    player.y += platform.speed * platform.direction;
                } else if (platform.type === 'pipe_h' && platform.speed) {
                    player.x += platform.speed * platform.direction;
                }
            } else if (player.dx > 0 && (player.x + player.width - player.dx) <= platform.x) {
                player.x = platform.x - player.width;
                player.dx = 0;
            } else if (player.dx < 0 && (player.x - player.dx) >= platform.x + platform.width) {
                player.x = platform.x + platform.width;
                player.dx = 0;
            } else if (player.dy < 0 && (player.y - player.dy) >= platform.y + platform.height) {
                player.y = platform.y + platform.height;
                player.dy = 0;
            }

            if (platform.type === 'trigger') {
                vykonajAkciu(platform.id);
            }
        }
    });

    boxy.forEach(box => {
        box.dy += gravitacia;
        box.y += box.dy;
        box.x += box.dx;
        box.dx *= box.friction;

        platforms.forEach(p => {
            if (isTouching(box, p)) {
                if (box.dy > 0 && box.y + box.height - box.dy <= p.y + 5) {
                    box.y = p.y - box.height;
                    box.dy = 0;
                } else if (box.dx > 0 && box.x + box.width - box.dx <= p.x) {
                    box.x = p.x - box.width;
                    box.dx = 0;
                } else if (box.dx < 0 && box.x - box.dx >= p.x + p.width) {
                    box.x = p.x + p.width;
                    box.dx = 0;
                }
            }
        });

        jamka.aktivna = false;
        boxy.forEach(box => {
            let stredKockyX = box.x + box.width / 2;

            if (stredKockyX > jamka.x && stredKockyX < jamka.x + jamka.width) {
                if (box.y + box.height >= jamka.y) {
                    jamka.aktivna = true;
                }
            }

            if (jamka.aktivna) {
                nastavViditelnost('nakocku', true);
            } else {
                nastavViditelnost('nakocku', false);
            }
        });

        c.fillStyle = '#050505';
        c.fillRect(jamka.x, jamka.y, jamka.width, jamka.height);

        c.strokeStyle = jamka.aktivna ? '#00ff41' : '#333';
        c.lineWidth = 2;
        c.strokeRect(jamka.x + 5, jamka.y + 5, jamka.width - 10, jamka.height - 10);

        if (isTouching(player, box)) {
            if (player.x + player.width > box.x && player.x < box.x && player.y + player.height > box.y + 5) {
                box.dx = player.dx;
                player.x = box.x - player.width;
            } else if (player.x < box.x + box.width && player.x + player.width > box.x + box.width && player.y + player.height > box.y + 5) {
                box.dx = player.dx;
                player.x = box.x + box.width;
            }

            if (player.dy >= 0 && player.y + player.height - player.dy <= box.y + 10) {
                player.y = box.y - player.height;
                player.dy = 0;
                player.grounded = true;
                player.x += box.dx;
            }
        }

        c.fillStyle = '#8B4513';
        c.fillRect(box.x, box.y, box.width, box.height);
        c.strokeStyle = '#5D2E0A';
        c.strokeRect(box.x + 5, box.y + 5, box.width - 10, box.height - 10);
    });

    Karera.x = player.x - canvas.width / 2;
    Karera.y = player.y - canvas.height / 2;

    if (Karera.y < 0) Karera.y = 0;
    if (Karera.x < 0) Karera.x = 0;

    function vykonajAkciu(id) {
        const btn = platforms.find(p => p.id === id);
        if (btn) btn.isPressed = true;

        if (id === 'tlacidlo3') {
            nastavViditelnost('vetrak', false);
        }
        if (id === 'tlacidlo2') {
            nastavViditelnost('vetrak2', false);
            nastavViditelnost('vetrak', true);
        }
    }

    if (isTouching(player, exitZone)) {
        if (typeof ProgresManazer !== 'undefined') {
            ProgresManazer.ulozLevel(18);
        }
        window.location.href = "../../UploadHighway/Level3/level3UH.html";
    }

    DashTrail.draw(c);
    DashTrail.drawDeath(c);
    DashTrail.drawRageAura(c);

    aktualizujUtocnikov();
    vykresliUtocnikov();

    let aktImg = ziskajAnimaciu(player, keys);

if (aktImg && aktImg.complete && aktImg.naturalWidth !== 0) {
    c.drawImage(aktImg, player.x, player.y, player.width, player.height);
} else {
    c.fillStyle = "red";
    c.fillRect(player.x, player.y, player.width, player.height);
}

    c.restore();

    if (zobrazitHUD === true) {
        c.save();
        const barX = 20;
        const barY = 20;
        const barWidth = 250;
        const barHeight = 30;
        Damageudelovator.vykresliHPBar(player);

        c.fillStyle = 'rgba(20, 20, 20, 0.8)';
        c.beginPath();
        c.roundRect(barX, barY, barWidth, barHeight, 5);
        c.fill();
        c.strokeStyle = '#333';
        c.lineWidth = 4;
        c.stroke();

        let percento = mana / maximalnaMana;
        if (percento < 0) percento = 0;

        let manaGrad = c.createLinearGradient(barX, 0, barX + barWidth, 0);
        manaGrad.addColorStop(0, '#0044ff');
        manaGrad.addColorStop(1, '#00d4ff');

        c.fillStyle = manaGrad;
        c.beginPath();
        c.roundRect(barX + 2, barY + 2, (barWidth - 4) * percento, barHeight - 4, 3);
        c.fill();

        c.fillStyle = 'rgba(255, 255, 255, 0.1)';
        c.fillRect(barX + 2, barY + 2, (barWidth - 4) * percento, (barHeight - 4) / 2);

        c.fillStyle = "white";
        c.font = "bold 13px Courier New";
        c.shadowColor = "black";
        c.shadowBlur = 4;
        c.fillText(`ENERGY: ${Math.floor(mana)} / ${maximalnaMana}`, barX + 10, barY + 20);
        c.shadowBlur = 0;

         c.drawImage(ability3Img, barX + 1, barY + 425, 150, 150);
        c.restore();
    }
}

animovanie();