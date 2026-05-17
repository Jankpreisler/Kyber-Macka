const canvas = document.getElementById('gameCanvas');
const c = canvas.getContext('2d');

canvas.width = 1300;
canvas.height = 600;

let zobrazitHUD = true;
let mana = 100;
let maximalnaMana = 100;
let minmana = 0;
let abilityUnlocked = true;

const gravitacia = 0.4;

const exitZone = {
    x: 0,
    y: 100,
    width: 60,
    height: 80
};

const Karera = {
    x: 0,
    y: 0,
    width: canvas.height,
    height: canvas.height
};

// === DEFINÍCIA PLATFORIEM ===
const platforms = [
    { x: 0, y: 3500, width: 1000750, height: 20, color: '#050505', type: 'floor' }, //kill
    { x: 0, y: 1200, width: 550, height: 230, color: '#333', type: 'pipe_h' }, //spawn
    { x: -150, y: 100, width: 150, height: 2000000, color: '#333', type: 'pipe_v' }, //left border
    { x: 850, y: 1250, width: 180, height: 20, color: '#555', type: 'pipe_h', startX: 850, range: 150, speed: 2.8, direction: 1 }, // hybajuce sa plosinky
    { x: 1250, y: 1150, width: 180, height: 20, color: '#555', type: 'pipe_h', startX: 1250, range: 150, speed: 2.8, direction: -1 }, // hybajuce sa plosinky
    { x: 1850, y: 500, width: 150, height: 50, color: '#333', type: 'valve', startY: 500, range: 500, speed: 2.5, direction: 1, },
    { x: 2250, y: 500, width: 750, height: 50, color: '#333', type: 'pipe_h' },
    { x: 3250, y: 200, width: 200, height: 300, color: '#333', type: 'pipe_h', range: 700, id: 'vetrak2', zapnuty: true },
    { x: 3050, y: 800, width: 750, height: 50, color: '#333', type: 'pipe_h' },
    { x: 3250, y: 750, width: 100, height: 50, color: '#333', type: 'trigger', id: 'tlacidlo3', isPressed: false },
    { x: 5750, y: 170, width: 100, height: 50, color: '#333', type: 'trigger', id: 'tlacidlo2', isPressed: false },
    { x: 5050, y: 750, width: 100, height: 50, color: '#333', type: 'trigger', id: 'tlacidlo1', isPressed: false, visible: false },
    { x: 3750, y: 200, width: 200, height: 50, color: '#333', type: 'pipe_h' },
    { x: 3650, y: 200, width: 750, height: 50, color: '#333', type: 'pipe_h' },
    { x: 5250, y: 200, width: 750, height: 50, color: '#333', type: 'pipe_h' },
    { x: 4450, y: 800, width: 1150, height: 50, color: '#333', type: 'pipe_v', visible: false, id:"totajnehnedpozoskoku" },
    { x: 6250, y: 1500, width: 1050, height: 50, color: '#333', type: 'pipe_h' },
    { x: 6550, y: 1470, width: 100, height: 50, color: '#333', type: 'trigger', id: 'tlacidlo4', isPressed: false },
    { x: 4300, y: 1500, width: 2350, height: 50, color: '#333', type: 'pipe_h', visible: false, id: "poslednepatro" },
    { x: 4500, y: 1450, width: 100, height: 50, color: '#333', type: 'trigger', id: 'tlacidlo5', isPressed: false, visible: true, },
    { x: 6250, y: 800, width: 50, height: 550, color: '#333', type: 'pipe_h' },
    { x: 8500, y: 800, width: 250, height: 1050, color: '#333', type: 'pipe_h',id:"totonakoniecties", visible:false },
    { x: 8750, y: 800, width: 950, height: 50, color: '#333', type: 'pipe_h',id:"totonakoniec", visible:false }, 
    { x: 7000, y: 1500, width: 1050, height: 50, color: '#333', type: 'pipe_h', id: "plosinka", visible: false },
];

const boxy = [
    { x: 4600, y: 500, width: 50, height: 50, dx: 0, dy: 0, friction: 0.8 },
];

const jamka = {
    x: 6750,
    y: 1500,
    width: 100,
    height: 30,
    aktivna: false
};

const zadavac = {
    x: 7000,
    y: 1450,
    width: 60,
    height: 60,
    spravnykodik: "31975",
    kodzadany:"",
    jeodomknuty: false,
    jeprinom: false,
};

const macky = {
    dolava: new Image(),
    doprava: new Image(),
    plazeniedoprava: new Image(),
    npc: new Image(),
};

macky.dolava.src = '../../asseti/cyber-cat main cahrakter.png';
macky.doprava.src = '../../asseti/Cybermacka druhy pohlad.png';
macky.plazeniedoprava.src = '../../asseti/Plaziaca macka.png';
macky.npc.src = '../../asseti/rokwel.png';

let actualnaakciacici = macky.dolava;

const keys = {
    right: false,
    left: false,
    up: false,
    down: false,
    t: false,
    u: false 
};

let timeScale = 1.0;

let player = {
    x: 50,
    y: 1150,
    width: 50,
    height: 50,
    dx: 0,
    dy: 0,
    speed: 5,
    jumpForce: 10,
    grounded: false,
    friction: 0.9,
    isdashing: false,
    dashspeed: 45,
    chceSaPostavit: false,
    isRaging: false
};

if(typeof damagesystem === 'function') damagesystem(player);

// === CONFIG BOSSA S PREHRIEVANÍM (ČASOVÉ STRIEDANIE FÁZ) ===
let boss = {
    x: 1000,         
    y: 1120,         
    width: 80,
    height: 80,
    hp: 5,                  // Zvýšené HP, keďže sa fázy menia časom
    vlna: 1,
    jeAktivny: true,
    timerUtoku: 0,
    timerFazy: 0,           // Časovač pre aktuálnu fázu
    maxCasFazy: 550,        // Ako dlho trvá jedna fáza (cca 6 sekúnd pri 60fps)
    farba: '#ff0055'
};

let bossLasery = [];
let bossProjektily = [];
let docasnePlosinky = []; 

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

function getBrickPattern() {
    const p = document.createElement('canvas');
    const pc = p.getContext('2d');
    p.width = 32;
    p.height = 16;
    pc.fillStyle = '#ffffff';
    pc.fillRect(0, 0, 32, 16);
    pc.fillStyle = '#ffffff';
    pc.fillRect(0, 0, 30, 14);
    pc.fillStyle = '#ffffff';
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

    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(0.2, '#f5eae2');
    grad.addColorStop(0.5, '#ffffff');
    grad.addColorStop(0.8, '#f5eae2');
    grad.addColorStop(1, '#ffffff');

    c.fillStyle = grad;
    c.fillRect(p.x, p.y, p.width, p.height);

    c.fillStyle = 'rgba(0,0,0,0.4)';
    if (isVertical) {
        for (let i = 10; i < p.height; i += 20) {
            c.fillRect(p.x + 2, p.y + i, p.width - 4, 2);
        }
    }
    c.restore();
}

function drawStyledButton(btn, isHovered = false, isPressed = false) {
    c.save();
    if (isPressed) {
        c.fillStyle = '#989a98';
    } else {
        c.fillStyle = isHovered ? '#64666c' : '#65686e';
    }
    c.fillRect(btn.x, btn.y, btn.width, btn.height);
    c.strokeStyle = isPressed ? '#04ff00' : '#eaf1ff';
    c.lineWidth = isPressed ? 4 : 2;
    c.strokeRect(btn.x, btn.y, btn.width, btn.height);

    c.strokeStyle = isPressed ? '#00ff37' : '#e6eeff';
    c.lineWidth = 1;
    for (let i = btn.y + 8; i < btn.y + btn.height - 5; i += 6) {
        c.beginPath();
        c.moveTo(btn.x + 15, i);
        c.lineTo(btn.x + btn.width - 15, i);
        c.stroke();
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
        actualnaakciacici = macky.dolava;
    }

    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        keys.left = true;
        actualnaakciacici = macky.doprava;
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
        actualnaakciacici = macky.plazeniedoprava;
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

    if (e.key === 'u' || e.key === 'U') {
        if (abilityUnlocked && mana > 0) {
            keys.u = true;
        }
    }
    if ((e.key === 'Tab' || e.code === 'Tab')) {
        window.location.href = "/MenunaTab/tab.html";
    }

    if (e.key === 'r' || e.key === 'R') {
        if (mana > 20 && !player.isNahnevany) {
            player.isRaging = true;
        } else {
            player.isRaging = false; 
        }
    }

    if (zadavac.jeprinom && !zadavac.jeodomknuty) {
        if (e.key >= '0' && e.key <= '9' && zadavac.kodzadany.length < 5) {
            zadavac.kodzadany += e.key;
            
            if (zadavac.kodzadany === zadavac.spravnykodik) {
                zadavac.jeodomknuty = true;
                nastavViditelnost('plosinka', true); 
            }
        }
        
        if (e.key === 'Escape') {
            zadavac.kodzadany = "";
        }
    }
});

window.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') keys.right = false;
    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') keys.left = false;
    if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') keys.up = false;
    if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') keys.down = false;
    if (e.key === 't' || e.key === 'T') keys.t = false;

    if (e.key === 'u' || e.key === 'U') {
        keys.u = false;
    }

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
    if (p) {
        p.visible = stav;
    }
}

function resetPlayer() {
    player.x = 50;
    player.y = 1150;
    player.dx = 0;
    player.dy = 0;
    player.height = 50;
    actualnaakciacici = macky.dolava;
}

// === LOGIKA BOSSA (AUTOMATICKÉ PREHRIEVANIE / STRIEDANIE FÁZ) ===
function updateBoss() {
    if (!boss.jeAktivny) return;

    // Definovanie pevného spawnu bossa
    const bossSpawnX = 1000;
    const bossSpawnY = 1120;

    // Bezpečné nainicializovanie nových stavov, ak ešte v objekte boss neexistujú
    if (boss.isOverheated === undefined) boss.isOverheated = false;
    if (boss.overheatTimer === undefined) boss.overheatTimer = 0;

    // --- MANAŽMENT ČASOVAČOV (ÚTOK VS PREHRIATIE) ---
    if (!boss.isOverheated) {
        // Normálny stav: Boss sa postupne zahrieva
        boss.timerFazy += 1 * timeScale;
        
        if (boss.timerFazy > boss.maxCasFazy) {
            // AKTIVÁCIA PREHRIATIA po dosiahnutí limitu
            boss.isOverheated = true;
            boss.overheatTimer = 0;

            // Vymazanie všetkých aktívnych útokov, aby bol pokoj na skákanie
            bossLasery = [];
            bossProjektily = [];
            docasnePlosinky = []; 
        }
    } else {
        // Stav prehriatia: Odpočítava sa 10 sekúnd (10s * 60fps = 600)
        boss.overheatTimer += 1 * timeScale;
        
        if (boss.overheatTimer > 600) {
            // TREST: Hráč nestihol skočiť do 10 sekúnd -> Obnovuje sa tá istá fáza znova
            boss.isOverheated = false;
            boss.timerFazy = 0;
            boss.timerUtoku = 0;
        }
    }

    // --- URČENIE FARBY BOSSA ---
    if (boss.isOverheated) {
        boss.farba = '#555555'; // Sivá farba vyjadruje vypnutie / zraniteľnosť
    } else {
        // Návrat k pôvodným farbám fáz po reboote alebo postupe
        if (boss.vlna === 1) boss.farba = '#ff0055';
        else if (boss.vlna === 2) boss.farba = '#a200ff';
        else if (boss.vlna === 3) boss.farba = '#ff5500';
    }

    // Vykreslenie tela bossa
    c.fillStyle = boss.farba;
    c.fillRect(boss.x, boss.y, boss.width, boss.height);

    // --- VIZUÁLNE TEXTY NAD HEADOM BOSSA ---
    if (boss.isOverheated) {
        // Dynamické zobrazenie zostávajúcich sekúnd (60 snímkov = 1 sekunda)
        let sekundyDoKonca = Math.ceil((600 - boss.overheatTimer) / 60);
        if (sekundyDoKonca < 0) sekundyDoKonca = 0;
        
        c.fillStyle = '#00ffcc';
        c.font = "bold 14px Courier New";
        c.fillText(`!! OVERHEATED! HIT HEAD (${sekundyDoKonca}s) !!`, boss.x - 60, boss.y - 15);
    } else if (boss.timerFazy > boss.maxCasFazy - 80) {
        c.fillStyle = '#ff0000';
        c.font = "bold 12px Courier New";
        c.fillText("!! OVERHEAT WARNING !!", boss.x - 30, boss.y - 15);
    }

    // --- KOLÍZIA HRÁČA S BOSSOM ---
    if (isTouching(player, boss)) {
        // Kontrola skoku na hlavu
        if (player.dy > 0 && player.y + player.height - player.dy <= boss.y + 15) {
            player.dy = -15; // Odraz hráča do výšky
            player.y = boss.y - player.height;
            
            // Poškodenie a posun fázy nastane LEN vtedy, ak je boss v stave prehriatia
            if (boss.isOverheated) {
                boss.hp--;
                boss.vlna++; // Úspešný zásah posúva bossa do ďalšej fázy
                resetPlayer();
                
                if (boss.vlna > 3) boss.vlna = 3; // Strop fáz je fixne 3
                
                // Ukončenie prehriatia a reset časovačov pre novú fázu
                boss.isOverheated = false;
                boss.timerFazy = 0;
                boss.timerUtoku = 0;

                // Reset pozície pre istotu
                boss.x = bossSpawnX;
                boss.y = bossSpawnY;
                
                if (boss.hp <= 0) {
                    boss.jeAktivny = false; // Definitívna smrť bossa
                }
            }
        } else {
            // Ak do neho narazíš z boku, uberie ti to život/odhodí ťa to iba vtedy, ak NIE JE prehriaty
            if (!boss.isOverheated) {
                player.x -= 60; 
            }
        }
    }

    // === SPÚŠŤANIE ÚTOKOV (FUNGUJÚ LEN AK NIE JE PREHRIATY) ===
    if (!boss.isOverheated) {
        if (boss.vlna === 1) {
            boss.timerUtoku += 1 * timeScale;
            if (boss.timerUtoku > 100) {
                // Výška lasera je 15, takže náhodná pozícia je od vrchu bossa po jeho spodok mínus jeho vlastná výška
                let nahodnaVyskaLasera = boss.y + Math.random() * (boss.height - 15);

                bossLasery.push({
                    x: boss.x - 75,
                    y: nahodnaVyskaLasera,
                    width: 150,
                    height: 15,
                    speed: -7  
                });
                boss.timerUtoku = 0;
            }
        }

        // === 2. VLNA: SPAWNOVANIE PLOŠINIEK ===
        if (boss.vlna === 2) {
            boss.timerUtoku += 1 * timeScale;
            if (boss.timerUtoku > 120) {
                docasnePlosinky = []; 
                for(let i = 0; i < 3; i++) {
                    docasnePlosinky.push({
                        x: boss.x - 200 - (i * 200),
                        y: boss.y + 30 + (Math.random() * 60 - 30), 
                        width: 100,
                        height: 20,
                        type: 'pipe_h'
                    });
                }
                boss.timerUtoku = 0;
            }
        }

        // === 3. VLNA: HÁDZANIE PROJEKTILOV A MIZNUTIE PLOŠINIEK ===
        if (boss.vlna === 3) {
            boss.timerUtoku += 1 * timeScale;
            if (boss.timerUtoku > 60) {
                let uhol = Math.atan2((player.y + player.height/2) - (boss.y + 40), (player.x + player.width/2) - boss.x);
                bossProjektily.push({
                    x: boss.x,
                    y: boss.y + 40,
                    radius: 15,
                    dx: Math.cos(uhol) * 6,
                    dy: Math.sin(uhol) * 6
                });
                boss.timerUtoku = 0;
            }

            platforms.forEach(p => {
                if (p.type !== 'floor' && isTouching(player, p)) {
                    if (p.viditelnostTimer === undefined) p.viditelnostTimer = 100;
                    p.viditelnostTimer -= 1 * timeScale;
                    if (p.viditelnostTimer <= 0) {
                        p.visible = false; 
                    }
                }
            });
        }
    }

    // --- LOGIKA DOČASNÝCH PLOŠINIEK Z 2. FÁZY (vykresľovanie a fyzika) ---
    docasnePlosinky.forEach(p => {
        c.fillStyle = '#aa00ff';
        c.fillRect(p.x, p.y, p.width, p.height);
        
        if (player.x < p.x + p.width && player.x + player.width > p.x &&
            player.dy >= 0 && player.y + player.height <= p.y + 15 && 
            player.y + player.height + player.dy >= p.y) {
            
            player.y = p.y - player.height;
            player.dy = 0;
            player.grounded = true;
        }
    });

    // --- UPDATE EXISTING LASERS ---
    for (let i = bossLasery.length - 1; i >= 0; i--) {
        let l = bossLasery[i];
        l.x += l.speed * timeScale;
        
        c.fillStyle = '#ff0000';
        c.shadowColor = "red";
        c.shadowBlur = 15;
        c.fillRect(l.x, l.y, l.width, l.height);
        c.shadowBlur = 0; 

        if (isTouching(player, l)) {
            player.x -= 20; 
        }
        if (l.x < -1000) bossLasery.splice(i, 1);
    }

    // --- UPDATE EXISTING PROJECTILES ---
    for (let i = bossProjektily.length - 1; i >= 0; i--) {
        let pr = bossProjektily[i];
        pr.x += pr.dx * timeScale;
        pr.y += pr.dy * timeScale;
        
        c.beginPath();
        c.arc(pr.x, pr.y, pr.radius, 0, Math.PI * 2);
        c.fillStyle = '#ff9900';
        c.fill();
        c.closePath();

        if (pr.x > player.x && pr.x < player.x + player.width && 
            pr.y > player.y && pr.y < player.y + player.height) {
            bossProjektily.splice(i, 1);
            continue;
        }
        if (pr.x < -1000 || pr.x > 15000 || pr.y > 5000) {
            bossProjektily.splice(i, 1);
        }
    }
}

// === HLAVNÁ SMYČKA ===
function animovanie() {
    requestAnimationFrame(animovanie);
    time += 0.01;

    c.clearRect(0, 0, canvas.width, canvas.height);

    c.save();
    c.translate(-Karera.x, 0 - Karera.y);

    let bgGrad = c.createRadialGradient(400, 200, 50, 400, 200, 400);
    bgGrad.addColorStop(0, '#0a100a');
    bgGrad.addColorStop(1, '#010501');
    c.fillStyle = bgGrad;
    c.fillRect(0, 0, canvas.width, canvas.height);

    c.fillStyle = brickPattern;
    c.fillRect(0, 0, 30000, 30000);

    drawFog();

    // Spomalenie času
    if (keys.u && abilityUnlocked && mana > 0) {
        timeScale = 0.3;
        mana -= 0.5;
    } else {
        timeScale = 1.0;
        if (mana < maximalnaMana) {
            mana += 0.1;
        }
        else if (player.isRaging) {
        maximalnaMana -= 0.5;
        mana -= 0.5;
        }
    }

    if (mana <= 0) {
        keys.u = false;
        timeScale = 1.0;
    }

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
            if (typeof drawRealServer === 'function') drawRealServer(p);
        } else if (p.type === 'pipe_v') {
            drawRealPipe(p, true);
        } else if (p.type === 'pipe_h') {
            if (p.speed) {
                p.x += p.speed * p.direction * timeScale;
                if (p.x > p.startX + p.range || p.x < p.startX) p.direction *= -1;
            }
            drawRealPipe(p, false);
        } else if (p.type === 'trigger') {
            drawStyledButton(p, false, p.isPressed);
        } else if (p.type === 'valve') {
            if (p.speed !== undefined) {
                p.y += p.speed * p.direction * timeScale;
                if (p.y > p.startY + p.range || p.y < p.startY) {
                    p.direction *= -1;
                }
            }
            c.fillStyle = 'rgb(250, 230, 230)';
            c.fillRect(p.x, p.y, p.width, p.height);
        } else if (p.speed) {
            p.x += p.speed * p.direction * timeScale;
            if (p.x > p.startX + p.range || p.x < p.startX) p.direction *= -1;
            if (p.hasRope && typeof drawRopes === 'function') drawRopes(p);
        } else {
            c.fillStyle = 'transparent';
            c.fillRect(p.x, p.y, p.width, p.height);
        }
    });

    if (mana < maximalnaMana) {
        mana += 0.1;
    }

    if (player.isdashing) {
        if (Math.abs(player.dx) < 5) {
            player.isdashing = false;
        }
    }

    let activeFriction = player.friction;
    let activeSpeed = player.speed;

    platforms.forEach(p => {
        if (p.visible === false) return;

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
        if (keys.right) player.dx += 0.8 * timeScale;
        else if (keys.left) player.dx -= 0.8 * timeScale;
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
                player.dy = -activeSpeed * 0.7 * timeScale;
            } else if (keys.down) {
                player.dy = activeSpeed * 0.7 * timeScale;
            }
        } else {
            player.dy += gravitacia * timeScale;
        }
    }

    player.x += player.dx;
    player.y += player.dy;
    player.grounded = false;

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
                    player.dy -= 0.35 * timeScale;
                } else {
                    player.dy -= 0.8 * timeScale;
                }
                if (player.dy < -5) player.dy = -5;
            }
            if (Math.random() > 0.6) {
                windParticles.push({
                    x: p.x + Math.random() * p.width,
                    y: p.y,
                    speed: (Math.random() * 5 + 3) * timeScale,
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
                player.dx -= 0.67 * timeScale;
            }

            if (Math.random() > 0.4) {
                windParticles.push({
                    x: p.x - Math.random() * p.range,
                    y: p.y + Math.random() * p.height,
                    speed: (Math.random() * 5 + 2) * timeScale,
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

    platforms.forEach(platform => {
        if (platform.id === "stienkaprechodna") return;
        if (platform.visible === false) return;

        if (
            player.x < platform.x + platform.width &&
            player.x + player.width > platform.x &&
            player.y < platform.y + platform.height &&
            player.y + player.height > platform.y
        ) {
            if (platform.type === 'floor') {
                resetPlayer();
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
        box.dy += gravitacia * timeScale;
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
                nastavViditelnost('totonakoniecties', true);
                nastavViditelnost('totonakoniec', true);
            } else {
                nastavViditelnost('totonakoniecties', false);
                nastavViditelnost('totonakoniec', false);
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

    zadavac.jeprinom = isTouching(player, zadavac);
    c.fillStyle = zadavac.jeodomknuty ? '#00ff41' : '#444'; 
    c.fillRect(zadavac.x, zadavac.y, zadavac.width, zadavac.height);

    c.fillStyle = '#000';
    c.fillRect(zadavac.x + 5, zadavac.y + 10, zadavac.width - 10, 25);

    c.fillStyle = '#00ff41';
    c.font = "bold 12px Courier New";
    c.textAlign = "center";

    if (zadavac.jeodomknuty) {
        c.fillText("OPEN", zadavac.x + zadavac.width / 2, zadavac.y + 26);
    } else {
        let zobrazenyText = zadavac.kodzadany.padEnd(4, '_');
        c.fillText(zobrazenyText, zadavac.x + zadavac.width / 2, zadavac.y + 26);
    }
    c.textAlign = "left"; 

    if (zadavac.jeprinom && !zadavac.jeodomknuty) {
        c.fillStyle = '#000000';
        c.font = "11px Arial";
        c.fillText("ZADAJ KÓD (0-9)", zadavac.x - 15, zadavac.y - 25);
        c.fillText("[Esc] na reset", zadavac.x - 10, zadavac.y - 10);
    }
    
    Karera.x = player.x - canvas.width / 2;
    Karera.y = player.y - canvas.height / 2;

    if (Karera.y < 0) Karera.y = 0;
    if (Karera.x < 0) Karera.x = 0;

    // === VOLANIE AKTUÁLNEHO BOSSA ===
    updateBoss();

    function vykonajAkciu(id) {
        const btn = platforms.find(p => p.id === id);
        if (btn) btn.isPressed = true;

        if (id === 'tlacidlo3') {
            nastavViditelnost('vetrak2', false);
        }
         if (id === 'tlacidlo4') {
              nastavViditelnost('tlacidlo5', false);
        }
        if (id === 'tlacidlo2') {
            nastavViditelnost('tlacidlo1', true);
             nastavViditelnost('totajnehnedpozoskoku', true);
        }
         if (id === 'tlacidlo1') {
            nastavViditelnost('poslednepatro', true);
            nastavViditelnost('tlacidlo4', false);
        }
         if (id === 'tlacidlo5') {
            nastavViditelnost('tlacidlo4', true);
        }
    }

    if (isTouching(player, exitZone)) {
        if (typeof ProgresManazer !== 'undefined') {
            ProgresManazer.ulozLevel(22);
        }
        window.location.href = "/SerWers/Level6-prechod_do_bugtown/Prechod.html";
    }

    if (actualnaakciacici && actualnaakciacici.complete && actualnaakciacici.naturalWidth !== 0) {
        c.drawImage(actualnaakciacici, player.x, player.y, player.width, player.height);
    } else {
        c.fillStyle = 'red';
        c.fillRect(player.x, player.y, player.width, player.height);
    }

    c.restore();

    if (zobrazitHUD === true) {
        c.save();
        const barX = 20;
        const barY = 20;
        const barWidth = 250;
        const barHeight = 30;

        c.fillStyle = 'rgba(20, 20, 20, 0.8)';
        c.beginPath();
        c.roundRect(barX, barY, barWidth, barHeight, 5);
        c.fill();
        c.strokeStyle = '#333';
        c.lineWidth = 4;
        c.stroke();

        if(typeof Damageudelovator !== 'undefined') Damageudelovator.vykresliHPBar(player);

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

        // --- HUD PRE BOSSA (Ak je nažive) ---
        if (boss.jeAktivny) {
            c.fillStyle = "rgba(255, 0, 0, 0.7)";
            c.font = "bold 14px Courier New";
            c.fillText(`BOSS HP: ${boss.hp}  |  STATE: VLNA ${boss.vlna}`, barX + 5, barY + 60);
            
            // Indikátor prehrievania
            c.fillStyle = "rgba(255, 255, 255, 0.3)";
            c.fillRect(barX + 5, barY + 70, 200, 8);
            c.fillStyle = boss.farba;
            c.fillRect(barX + 5, barY + 70, (boss.timerFazy / boss.maxCasFazy) * 200, 8);
        }

        c.fillStyle = "rgba(0, 0, 0, 0.6)";
        c.beginPath();
        c.roundRect(barX, barY + 455, 200, 100, 5);
        c.fill();

        c.fillStyle = "#ffffff";
        c.font = "bold 11px Arial";
        c.fillText("• Cyber Dash [Q]", barX + 10, barY + 480);
        c.fillText("• Cyber Rage  [R]", barX + 10, barY + 500);
        c.fillText("• Wall Climb [T + W/S]", barX + 10, barY + 520);
        c.fillText("• Lietanie [U + W]", barX + 10, barY + 540);

        c.restore();
    }
}

animovanie();