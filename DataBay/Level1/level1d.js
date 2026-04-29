const canvas = document.getElementById('gameCanvas');
const c = canvas.getContext('2d');

canvas.width = 1300; // na normal leevely
canvas.height = 600;

let zobrazitHUD = true;
let mana = 100;
let maximalnaMana = 100;
let minmana = 0;

const gravitacia = 0.4;

const exitZone = {
    x: 5000,
    y: 1800,
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
    { x: 1500, y: 1470, width: 100, height: 50, color: '#333', type: 'trigger', id: 'tlacidlo3', isPressed: false },
    { x: 0, y: 2900, width: 1000750, height: 20, color: '#050505', type: 'floor' }, //kill
    { x: 0, y: 1900, width: 750, height: 2000, color: '#333', type: 'pipe_v' }, //spawn
    { x: -150, y: 100, width: 150, height: 2000, color: '#333', type: 'pipe_v' }, //left border
    { x: 1300, y: 1900, width: 150, height: 2000, color: '#333', type: 'pipe_v' },
    { x: 1900, y: 1900, width: 5550, height: 2000, color: '#333', type: 'pipe_v' },
    { x: 200, y: 1900, width: 1750, height: 50, color: '#333', type: 'pipe_h', visible:false, id:"kockotlac" },
    { x: 3700, y: 1400, width: 200, height: 1050, color: '#333', type: 'pipe_v', visible: true, id: "nazovlol" },
    { x: 2800, y: 1750, width: 250, height: 50, color: '#333', type: 'pipe_v' },
    { x: 3100, y: 1600, width: 250, height: 50, color: '#333', type: 'pipe_v' },
    { x: 2500, y: 1600, width: 250, height: 50, color: '#333', type: 'pipe_v' },
    { x: 2500, y: 1250, width: 250, height: 250, color: '#333', type: 'pipe_v', visible: false, id:"blokiblok" }, // blokada na ten skok
    { x: 100, y: 1500, width: 2450, height: 50, color: '#333', type: 'pipe_v' },
   { x: 3450, y: 1500, width: 250, height: 50, color: '#333', type: 'pipe_v', visible: false, id:"skokotvorovy" },
    { x: 3700, y: 1350, width: 1750, height: 50, color: '#333', type: 'pipe_h', visible:true,  id: "pred" },
   { x: 4300, y: 1400, width: 200, height: 1050, color: '#333', type: 'pipe_v', visible:true,  id: "druhedvere" },
    { x: 4800, y: 1400, width: 200, height: 1050, color: '#333', type: 'pipe_v' , visible: true, id: "poslednedvere"},
    
];

const boxy = [
    { x: 2100, y: 1850, width: 50, height: 50, dx: 0, dy: 0, friction: 0.8, },
    { x: 2100, y: 1250, width: 50, height: 50, dx: 0, dy: 0, friction: 0.8 },
    { x: 4000, y: 1250, width: 50, height: 50, dx: 0, dy: 0, friction: 0.8 },
];

const jamka = {
    x: 2500,
    y: 1900,
    width: 60,
    height: 30,
    aktivna: false
};

const jamka2 = {
    x: 4000,
    y: 1900,
    width: 60,
    height: 30,
    aktivna: false
};

const jamka3 = {
    x: 150,
    y: 1900,
    width: 60,
    height: 30,
    aktivna: false
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
const keys = { right: false, left: false };

// === VLASTNOSTI HRÁČA ===
let player = {
    x: 2200,
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

function drawStyledButton(btn, isHovered = false, isPressed = false) {
    c.save();

    if (isPressed) {
        c.fillStyle = '#004411';
    } else {
        c.fillStyle = isHovered ? '#1a1d24' : '#0d0f12';
    }

    c.fillRect(btn.x, btn.y, btn.width, btn.height);

    c.strokeStyle = isPressed ? '#04ff00' : '#323741';
    c.lineWidth = isPressed ? 4 : 2;
    c.strokeRect(btn.x, btn.y, btn.width, btn.height);

    c.strokeStyle = isPressed ? '#00ff37' : '#1a1d24';
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

    if ((e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W' || e.code === 'Space') && player.grounded) {
        player.dy = -player.jumpForce;
        player.grounded = false;
        console.log(e.key);
    }

    if ((e.code === 'Backspace') && player.grounded) {
        player.dy = -player.jumpForce;
        player.grounded = false;
        console.log(e.code);
    }

    if ((e.key === 'ArrowDown' || e.key === 's' || e.key === 'S' || e.key === 'Shift') && player.grounded) {
        player.height = 25;
        player.grounded = false;
        actualnaakciacici = macky.plazeniedoprava;
    }


    if ((e.key === 'Q' || e.key === 'q') && mana >= 20) {
        mana -= 20;
        player.isdashing = true;
        let smer = 0;
        if (keys.right) {
            smer = 1;
        }
        else if (keys.left) {
            smer = -1;
        }
        else smer = (actualnaakciacici === macky.dolava) ? 1 : -1;
        player.dx = smer * player.dashspeed;
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

    if (mana < maximalnaMana) {
        mana += 0.1;
    }
    // --- LOGIKA DASHU ---
    if (player.isdashing) {

        if (Math.abs(player.dx) < 5) {
            player.isdashing = false;
        }
    }

    // 3. Pohyb a fyzik
    if (keys.right) player.dx += 0.8;
    else if (keys.left) player.dx -= 0.8;

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
        if (p.id === 'vetrak2' && p.zapnuty === true) {

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
                resetPlayer();
                return; // Ukončíme kontrolu pre túto platformu
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

    boxy.forEach(box => {
       
        box.dy += gravitacia;
        box.y += box.dy;
        box.x += box.dx;
        box.dx *= box.friction; // Trenie, aby kocka zastavila

        platforms.forEach(p => {
            if (isTouching(box, p)) {
                if (box.dy > 0 && box.y + box.height - box.dy <= p.y + 5) {
                    box.y = p.y - box.height;
                    box.dy = 0;
                }
                // Kolízia kocky so stenami zboku
                else if (box.dx > 0 && box.x + box.width - box.dx <= p.x) {
                    box.x = p.x - box.width;
                    box.dx = 0;
                }
                else if (box.dx < 0 && box.x - box.dx >= p.x + p.width) {
                    box.x = p.x + p.width;
                    box.dx = 0;
                }
            }
        });
        jamka.aktivna = false;
        jamka2.aktivna = false
        jamka3.aktivna = false
        boxy.forEach(box => {
            let stredKockyX = box.x + box.width / 2;

            if (stredKockyX > jamka.x && stredKockyX < jamka.x + jamka.width) {
                if (box.y + box.height >= jamka.y) {
        
                    jamka.aktivna = true;
                }
            }

            if (jamka.aktivna) {
                nastavViditelnost('nazovlol', false);
                nastavViditelnost('blokiblok', true); 
            }
            else{
                nastavViditelnost('nazovlol', true);
                nastavViditelnost('blokiblok', false);
            }
        });

        boxy.forEach(box => {
            let stredKockyX = box.x + box.width / 2;

            if (stredKockyX > jamka2.x && stredKockyX < jamka2.x + jamka2.width) {
                if (box.y + box.height >= jamka2.y) {
        
                    jamka2.aktivna = true;
                }
            }

            if (jamka2.aktivna) {
                nastavViditelnost('druhedvere', false);
                nastavViditelnost('skokotvorovy', true); 
            }
            else{
               nastavViditelnost('druhedvere', true);
                nastavViditelnost('skokotvorovy', false); 
            }
        });

        
        boxy.forEach(box => {
            let stredKockyX = box.x + box.width / 2;

            if (stredKockyX > jamka3.x && stredKockyX < jamka3.x + jamka3.width) {
                if (box.y + box.height >= jamka3.y) {
        
                    jamka3.aktivna = true;
                }
            }

            if (jamka3.aktivna) {
                 nastavViditelnost('poslednedvere', false);
            }
            else{
               nastavViditelnost('poslednedvere', true);
            }
        });


        c.fillStyle = '#050505';
        c.fillRect(jamka.x, jamka.y, jamka.width, jamka.height);

        c.strokeStyle = jamka.aktivna ? '#00ff41' : '#333';
        c.lineWidth = 2;
        c.strokeRect(jamka.x + 5, jamka.y + 5, jamka.width - 10, jamka.height - 10);



        c.fillStyle = '#050505';
        c.fillRect(jamka2.x, jamka2.y, jamka2.width, jamka2.height);

        c.strokeStyle = jamka2.aktivna ? '#00ff41' : '#333';
        c.lineWidth = 2;
        c.strokeRect(jamka2.x + 5, jamka2.y + 5, jamka2.width - 10, jamka2.height - 10);



        c.fillStyle = '#050505';
        c.fillRect(jamka3.x, jamka3.y, jamka3.width, jamka3.height);

        c.strokeStyle = jamka3.aktivna ? '#00ff41' : '#333';
        c.lineWidth = 2;
        c.strokeRect(jamka3.x + 5, jamka3.y + 5, jamka3.width - 10, jamka3.height - 10);



        if (isTouching(player, box)) {
            // Tlačenie sprava
            if (player.x + player.width > box.x && player.x < box.x && player.y + player.height > box.y + 5) {
                box.dx = player.dx; // Kocka preberá rýchlosť hráča
                player.x = box.x - player.width; // Hráč neprejde cez kocku
            }
            // Tlačenie zľava
            else if (player.x < box.x + box.width && player.x + player.width > box.x + box.width && player.y + player.height > box.y + 5) {
                box.dx = player.dx;
                player.x = box.x + box.width;
            }

            // Hráč stojí na kocke
            if (player.dy >= 0 && player.y + player.height - player.dy <= box.y + 10) {
                player.y = box.y - player.height;
                player.dy = 0;
                player.grounded = true;
                player.x += box.dx; // Hráč sa hýbe spolu s kockou, ak na nej stojí
            }
        }

        // 4. Vykreslenie kocky
        c.fillStyle = '#8B4513'; // Hnedá farba drevenej debny
        c.fillRect(box.x, box.y, box.width, box.height);
        // Detail na kocku (X-ko ako na debne)
        c.strokeStyle = '#5D2E0A';
        c.strokeRect(box.x + 5, box.y + 5, box.width - 10, box.height - 10);
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
        const btn = platforms.find(p => p.id === id);
        if (btn) btn.isPressed = true;

        if (id === 'tlacidlo3') {
            nastavViditelnost('kockotlac', true); // Stena zmizne
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
        if (percento < 0) percento = 0; // Ochrana proti zápornej mane

        // Vytvoríme gradient (prechod farieb z tmavomodrej do svetlomodrej)
        let manaGrad = c.createLinearGradient(barX, 0, barX + barWidth, 0);
        manaGrad.addColorStop(0, '#0044ff'); // Tmavšia modrá na začiatku
        manaGrad.addColorStop(1, '#00d4ff'); // Žiarivá azúrová na konci

        c.fillStyle = manaGrad;
        c.beginPath();
        // Vykreslíme výplň podľa aktuálnej many
        c.roundRect(barX + 2, barY + 2, (barWidth - 4) * percento, barHeight - 4, 3);
        c.fill();

        // 3. Efekt "lesku" na bare (biely prúžok navrchu)
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
        c.roundRect(barX, barY + 455, 200, 100, 5); //nasjkor vyska sirka height invertara zaoblenie
        c.fill();

        c.fillStyle = "#aaa";
        c.font = "11px Arial";
        c.fillText("• Cyber Dash [Q]", barX + 10, barY + 480);
        c.fillText("• Cyber Rage  [R]", barX + 10, barY + 500);
        c.fillText("• Error 404 [LOCKED]", barX + 10, barY + 520);
        c.fillText("• Error 404 [LOCKED]", barX + 10, barY + 540);

        c.restore();
    }
}

animovanie();