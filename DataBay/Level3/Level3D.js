const canvas = document.getElementById('gameCanvas');
const c = canvas.getContext('2d');
let facingRight = true;

canvas.width = 1300; // na normal leevely
canvas.height = 600;

let zobrazitHUD = true;
let mana = 100;
let maximalnaMana = 100;
let minmana = 0;
let abilityUnlocked = false;

const gravitacia = 0.4;

const exitZone = {
    x: 100,
    y: 2400,
    width: 60,
    height: 80
};

const Karera = {
    x: 0,
    y: 0,
    width: canvas.height,
    height: canvas.height
};

//=== DEFINÍCIA PLATFORIEM ===
const platforms = [
    { x: 0, y: 3500, width: 1000750, height: 20, color: '#050505', type: 'floor' }, //kill
    { x: 0, y: 1900, width: 750, height: 230, color: '#333', type: 'pipe_v' }, //spawn
    { x: 0, y: 100, width: 1, height: 2000000, color: '#333', type: 'pipe_v' }, //left border
    { x: 3500, y: 100, width: 150, height: 2000, color: '#333', type: 'pipe_v' }, //left border
    { x: 0, y: 2500, width: 550, height: 230, color: '#333', type: 'pipe_v' },
    { x: 400, y: 2050, width: 50, height: 530, color: '#333', type: 'pipe_v', id: "Dvierka", visible: true },
    { x: 900, y: 2400, width: 350, height: 250, color: '#333', type: 'pipe_h', id: "Buttona_na_dokoncenielevelu", visible: false },
    { x: 2000, y: 1900, width: 2550, height: 230, color: '#333', type: 'pipe_v' },
    { x: 1200, y: 1800, width: 350, height: 250, color: '#333', type: 'pipe_h' },
    { x: 3900, y: 1870, width: 100, height: 50, color: '#333', type: 'trigger', id: 'tlacidlo3', isPressed: false },

];

const Mikey = {
    x: 2300,
    y: 1850,
    width: 50,
    height: 50,
    color: '#ffa200',
    name: "Mikey",

    dialogues: [
        { hovori: "MAČKA", text: "Mňau?" },
        { hovori: "MAČKA", text: "Teda Halo? Do mnau uz zasa" },
        { hovori: "Mikey", text: "Kto ta poslal ? Cor" },
        { hovori: "MAČKA", text: "EEe nie tvoj Brat. Leo" },
        { hovori: "Mikey", text: "Neverim ti ako vyzeral" },
        { hovori: "MAČKA", text: "Bol to modry kior.." },
        { hovori: "Mikey", text: "Jaj tak to je on" },
        { hovori: "Mikey", text: "Ako ti pomozem" },
        { hovori: "MAČKA", text: "No chcel by som sa dostat do toho..." },
        { hovori: "Mikey", text: "Myslis Coru vsak" },
        { hovori: "MAČKA", text: "No vlastne a" },
        { hovori: "Mikey", text: "Nikdy ma neprerusuj" },
        { hovori: "MAČKA", text: "Okej ale.." },
        { hovori: "Mikey", text: "Co som vravel" },
        { hovori: "MAČKA", text: "Jasne, prep..." },
        { hovori: "Mikey", text: "Hej" },
        { hovori: "Mikey", text: "No kazdopadne" },
        { hovori: "Mikey", text: "Ja to presne neviem ale.." },
        { hovori: "Mikey", text: "Moj Brat Rafeal to vie" },
        { hovori: "Mikey", text: "On sa ho snazil uz dobit" },
        { hovori: "Mikey", text: "Ale nyvislo to" },
        { hovori: "Mikey", text: "Dufam, ale to je jedno." },
        { hovori: "Mikey", text: "Kazdopadne Cor zacal cistit zony" },
        { hovori: "Mikey", text: "Dialnica bola prva a teraz" },
        { hovori: "Mikey", text: "Databay" },
        { hovori: "Mikey", text: "A niciaho" },
        { hovori: "Mikey", text: "Prototypy rady C teda tej najvysej" },
        { hovori: "Mikey", text: "Teda ak ty" },
        { hovori: "MAČKA", text: "Moja rodina je...." },
        { hovori: "Mikey", text: "Asi pod nadvladou Coru" },
        { hovori: "MAČKA", text: "Ja som mal byt ako oni" },
        { hovori: "Mikey", text: "Ano" },
        { hovori: "Mikey", text: "Ale mozeme teda mozes" },
        { hovori: "Mikey", text: "ich zachranit" },
        { hovori: "MAČKA", text: "To je moje poslanie" },
        { hovori: "Mikey", text: "Vies liest po stenach" },
        { hovori: "MAČKA", text: "E ani nie" },
        { hovori: "Mikey", text: "Si macka a to nevies" },
        { hovori: "MAČKA", text: "No ziadnu som dlho nevidel" },
        { hovori: "Mikey", text: "Tvoji brati to dokazu" },
        { hovori: "Mikey", text: "Tak chod a zachran nas" },
        { hovori: "Mikey", text: "A pozdravuj Raf" },
        { hovori: "Mikey", text: "Clovece jeho som uz davno nevidel" },
    ],
    currentLine: 0,
    isTalking: false,
    canInteract: false
};

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
    lozenie: new Image(),
    test: new Image(),
};

macky.dolava.src = '../../asseti/cyber-cat main cahrakter.png';
macky.doprava.src = '../../asseti/Cybermacka druhy pohlad.png';
macky.plazeniedoprava.src = '../../asseti/Plaziaca macka.png';
macky.npc.src = '../../asseti/rokwel.png';
macky.lozenie.src = '../../asseti/cyber-cat main cahrakter - zlava otoceny.png'
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
    y: 1850,
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
    isRaging: false,
    hp: 100,
    maxhp: 100,
    jeNezranitelny: false,
    casNezranitelnosti: 0,
    isDead: false,
    direction: "doprava"
};
const utocnici = [
    {
        x: 2700,
        y: 1850,
        width: 50,
        height: 50,
        startX: 2700,
        range: 300,
        speed: 0.5,
        direction: 1,
        detectionRange: 250,
        isHostile: false,
        hp: 50,
        isDead: false,
        damage: 15,
        color: '#ff0055'
    },
    {
        x: 2900,
        y: 1850,
        width: 50,
        height: 50,
        startX: 2900,
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
        x: 2850,
        y: 1850,
        width: 50,
        height: 50,
        startX: 2850,
        range: 200,
        speed: 1.5,
        direction: -1,
        detectionRange: 300,
        isHostile: false,
        hp: 50,
        isDead: false,
        damage: 15,
        color: '#ff0055'
    },
    {
        x: 2750,
        y: 1850,
        width: 50,
        height: 50,
        startX: 2750,
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
    p.width = 64; p.height = 64;
    // Základná farba - "Gunmetal Blue" (oceľová)
    pc.fillStyle = '#ff7300';
    pc.fillRect(0, 0, 64, 64);
    pc.fillStyle = 'rgba(243, 151, 59, 0.3)';
    pc.beginPath();
    pc.arc(10, 10, 20, 0, Math.PI * 2);
    pc.fill();
    return c.createPattern(p, 'repeat');
}

const brickPattern = getBrickPattern();

function drawRealPipe(p, isVertical) {
    c.save();
    // Farba dreva (naplavené drevo - Driftwood)
    let grad = isVertical
        ? c.createLinearGradient(p.x, p.y, p.x + p.width, p.y)
        : c.createLinearGradient(p.x, p.y, p.x, p.y + p.height);

    grad.addColorStop(0, '#8d6e63'); // Tmavšie hnedé okraje
    grad.addColorStop(0.5, '#bcaaa4'); // Svetlejší stred (vypálený slnkom)
    grad.addColorStop(1, '#8d6e63');
    c.fillStyle = grad;
    c.fillRect(p.x, p.y, p.width, p.height);
    c.restore();
}

function drawStyledButton(btn, isHovered = false, isPressed = false) {
    c.save();

    // Základná farba
    if (isPressed) {
        c.fillStyle = '#ffcc00'; // Žiarivá žltá pri stlačení
    } else {
        c.fillStyle = isHovered ? '#334455' : '#223344';
    }
    c.fillRect(btn.x, btn.y, btn.width, btn.height);

    // Výstražné pruhy na okrajoch (Hazard Stripes)
    c.strokeStyle = '#ffcc00';
    c.lineWidth = 2;
    c.strokeRect(btn.x, btn.y, btn.width, btn.height);

    // Vnútro tlačidla - industriálny mriežkový vzor
    c.strokeStyle = isPressed ? '#000' : 'rgba(255, 204, 0, 0.3)';
    for (let i = 4; i < btn.width; i += 8) {
        c.beginPath();
        c.moveTo(btn.x + i, btn.y);
        c.lineTo(btn.x + i, btn.y + btn.height);
        c.stroke();
    }

    c.restore();
}

function drawFog() {
    c.save();
    c.globalCompositeOperation = 'screen';

    fogParticles.forEach(p => {
        let grad = c.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r);
        grad.addColorStop(0, 'rgba(200, 155, 100, 0.15)');
        grad.addColorStop(1, 'transparent');

        c.fillStyle = grad;
        c.beginPath();
        c.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        c.fill();

        p.x += Math.sin(time + p.r) * 0.15;
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

// === KOLÍZIA ===
function isTouching(a, b) {
    return (
        a.x < b.x + b.width &&
        a.x + a.width > b.x &&
        a.y < b.y + b.height &&
        a.y + a.height > b.y
    );
}

// Nová funkcia pre detekciu šplhania po stene (trochu širší hitbox)
function isTouchingWall(a, b) {
    return (
        a.x - 2 < b.x + b.width &&
        a.x + a.width + 2 > b.x &&
        a.y < b.y + b.height &&
        a.y + a.height > b.y
    );
}

// === OVLÁDANIE ===
window.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        if (player.isdashing == true) return;
        keys.right = true;

    }

    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        keys.left = true;

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
        }
    }

    if (e.key === 't' || e.key === 'T') {
        keys.t = true;

    }

    if (e.key.toLowerCase() === 'e' && Mikey.canInteract) {
        if (!Mikey.isTalking) {
            Mikey.isTalking = true;
            Mikey.currentLine = 0;
        } else {
            Mikey.currentLine++;
            if (Mikey.currentLine >= Mikey.dialogues.length) {
                Mikey.isTalking = false;
                zobrazitHUD = true;
                console.log("Vitaj v mojom hude")
                const dvere = platforms.find(p => p.id === 'tajne_dvere');
                if (dvere) {
                    dvere.visible = false;
                    dvere.id = 'stienkaprechodna';
                }
            }
        }
    }
});
canvas.addEventListener('click', (e) => {
    if (Mikey.canInteract) {
        if (!Mikey.isTalking) {
            Mikey.isTalking = true;
            Mikey.currentLine = 0;

        } else {
            Mikey.currentLine++;
            if (Mikey.currentLine >= Mikey.dialogues.length) {
                Mikey.isTalking = false;
                zobrazitHUD = true;
                console.log("Vitaj v mojom hude")
                const dvere = platforms.find(p => p.id === 'tajne_dvere');
                if (dvere) {
                    dvere.visible = false;
                    dvere.id = 'stienkaprechodna';
                }
            }
        }
    }
});

window.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') keys.right = false;
    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') keys.left = false;

    // Opravené na false pre správne fungovanie šplhania
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
        p.visible = stav;
    }
}

function resetPlayer() {
    player.x = 50;
    player.y = 1850;
    player.dx = 0;
    player.dy = 0;
    player.height = 50;
}

// === HLAVNÁ SMYČKA ===
function animovanie() {
    requestAnimationFrame(animovanie);
    time += 0.01;

    c.clearRect(0, 0, canvas.width, canvas.height);

    c.save();
    c.translate(-Karera.x, 0 - Karera.y);

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
        } else if (p.type === 'wall') {
            drawRealServer(p);
        } else if (p.type === 'pipe_v') {
            drawRealPipe(p, true);
        } else if (p.type === 'pipe_h') {
            drawRealPipe(p, false);
        } else if (p.type === 'trigger') {
            drawStyledButton(p, false, p.isPressed);
        } else if (p.type === 'valve') {
            c.fillStyle = '#400';
            c.fillRect(p.x, p.y, p.width, p.height);
            c.fillStyle = '#600';
            c.fillRect(p.x + 5, p.y + 20, 10, 10);
        } else if (p.speed) {
            p.x += p.speed * p.direction;
            if (p.x > p.startX + p.range || p.x < p.startX) p.direction *= -1;
            if (p.hasRope) drawRopes(p);
        } else {
            c.fillStyle = 'transparent';
            c.fillRect(p.x, p.y, p.width, p.height);
        }
    });

    // Funguje nedotykat sa nikdydw
    platforms.forEach(p => {
        if (p.speed) {
            if (p.type === 'valve') {
                p.y += p.speed * p.direction;
                if (p.y > p.startY + p.range || p.y < p.startY) {
                    p.direction *= -1;
                }
            } else {
                p.x += p.speed * p.direction;
                if (p.x > p.startX + p.range || p.x < p.startX) {
                    p.direction *= -1;
                }
            }
        }
    });

    if (player.isRaging) {
        maximalnaMana -= 0.5;
        mana -= 0.5;

    }
    else if (mana < maximalnaMana) {
        mana += 0.1;
    }

    // --- LOGIKA DASHU ---
    if (player.isdashing) {
        if (Math.abs(player.dx) < 5) {
            player.isdashing = false;
        }
    }


    // 3. Pohyb a fyzika
    if (!player.isdashing) {
        if (keys.right) player.dx += 0.8;
        else if (keys.left) player.dx -= 0.8;
    }
    player.dx *= player.friction;

    // Limit maximálnej rýchlosti hráča
    if (player.isdashing == true) {
        if (player.dx > player.dashspeed) player.dx = player.dashspeed;
        if (player.dx < -player.dashspeed) player.dx = -player.dashspeed;
    } else {
        if (player.dx > player.speed) player.dx = player.speed;
        if (player.dx < -player.speed) player.dx = -player.speed;

        // Logika šplhania
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
            actualnaakciacici = macky.lozenie;   // ← PREPÍŠ OBRAZOK NA LOZENIE

            player.dy = 0;
            player.dx = 0;

            if (keys.up) {
                player.dy = -player.speed * 0.7;
            } else if (keys.down) {
                player.dy = player.speed * 0.7;
            }
        } else {
            // keď prestane liezť, vráť normálny obrázok
            actualnaakciacici = (player.direction === "doprava")
                ? macky.doprava
                : macky.dolava;

            player.dy += gravitacia;
        }
    }

    player.x += player.dx;
    player.y += player.dy;
    player.grounded = false;

    facingRight = (actualnaakciacici === macky.dolava);
    DashTrail.update(player, player.isdashing, facingRight);
    DashTrail.updateDeath();
    DashTrail.updateRageAura(player.isRaging, player);


    Karera.x = player.x - canvas.width / 2;
    Karera.y = player.y - canvas.height / 2;

    if (Karera.y < 0) Karera.y = 0;
    if (Karera.x < 0) Karera.x = 0;

    // --- LOGIKA A VIZUÁL VETRÁKA ---
    platforms.forEach(p => {
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

    Karera.x = player.x - canvas.width / 2;
    if (Karera.x < 0) Karera.x = 0;

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

    if (macky.npc.complete && macky.npc.naturalWidth !== 0) {
        c.drawImage(macky.npc, Mikey.x, Mikey.y, Mikey.width, Mikey.height);
    } else {
        c.fillStyle = Mikey.color;
        c.fillRect(Mikey.x, Mikey.y, Mikey.width, Mikey.height);
    }

    let dist = Math.sqrt((player.x - Mikey.x) ** 2 + (player.y - Mikey.y) ** 2);
    Mikey.canInteract = dist < 120;

    if (Mikey.canInteract && !Mikey.isTalking) {
        c.fillStyle = "#ffff00";
        c.font = "bold 15px Arial";
        c.fillText("Stlac E na komunikaciu", player.x + 20, player.y - 20);
    }

    if (player.height === 25 && player.chceSaPostavit) {
        if (mozeSaPostavit()) {
            player.height = 50;
            player.y -= 25;
            player.chceSaPostavit = false;

        }
    }

    aktualizujUtocnikov();
    vykresliUtocnikov();

    Damageudelovator.aktualizujNezranitelnost(player);

    function vykonajAkciu(id) {
        const btn = platforms.find(p => p.id === id);
        if (btn) btn.isPressed = true;

        if (id === 'tlacidlo3') {
            nastavViditelnost('Buttona_na_dokoncenielevelu', true);
            nastavViditelnost('Dvierka', false);
        }
    }

    if (isTouching(player, exitZone)) {
        if (typeof ProgresManazer !== 'undefined') {
            ProgresManazer.ulozLevel(14);
        }
        window.location.href = "/DataBay/Level4/level4.js";
    }

    DashTrail.draw(c);
    DashTrail.drawDeath(c);
    DashTrail.drawRageAura(c);

    let aktImg = ziskajAnimaciu(player, keys);
    c.drawImage(aktImg, player.x, player.y, player.width, player.height);


    c.restore();

    if (Mikey.isTalking) {
        const dialog = Mikey.dialogues[Mikey.currentLine];
        const isCat = dialog.hovori === "MAČKA";
        abilityUnlocked = true;

        // Box
        c.fillStyle = "rgba(0, 0, 0, 0.85)";
        c.strokeStyle = isCat ? "#00ff41" : "#ffa200";
        c.lineWidth = 3;
        c.beginPath();
        c.roundRect(250, 450, 800, 110, 15);
        c.fill();
        c.stroke();

        // Meno hovoriaceho
        c.fillStyle = isCat ? "#00ff41" : "#ffa200";
        c.font = "bold 20px Courier New";
        c.fillText(dialog.hovori, 280, 480);

        // Text
        c.fillStyle = "white";
        c.font = "22px Arial";
        c.fillText(dialog.text, 280, 520);

        c.fillStyle = "#666";
        c.font = "14px Arial";
        c.fillText("Clikni pre pokračovanie...", 850, 545);
    }

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


        if (!abilityUnlocked) {
            c.drawImage(ability2Img, barX + 1, barY + 425, 150, 150);
        }
        if (abilityUnlocked) {
            c.drawImage(ability3Img, barX + 1, barY + 425, 150, 150);
        }
        c.restore();
    }
}

animovanie();