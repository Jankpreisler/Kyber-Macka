const canvas = document.getElementById('gameCanvas');
const c = canvas.getContext('2d');

canvas.width = 1300; // na normal leevely
canvas.height = 600;

const gravitacia = 0.4;
let lastTime = 0;

const exitZone = {
    x: 2950,
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

//                  === DEFINÍCIA PLATFORIEM – NOVÝ LEVEL ===
const platforms = [
    // Kill floor
    { x: 0, y: 2600, width: 3200, height: 40, color: '#050505', type: 'floor' },

    // Spawn šachta
    { x: 0, y: 2000, width: 150, height: 600, color: '#333', type: 'pipe_v' },

    // Okraje
    { x: -150, y: 0, width: 150, height: 2600, color: '#333', type: 'pipe_v' },
    { x: 3200, y: 0, width: 150, height: 2600, color: '#333', type: 'pipe_v' },

    // Dolné plošiny (ťažšie, ale skočiteľné)
    { x: 200, y: 2200, width: 300, height: 70, color: '#333', type: 'pipe_v' },
    { x: 550, y: 2100, width: 250, height: 70, color: '#333', type: 'pipe_v' },
    { x: 900, y: 2000, width: 250, height: 70, color: '#333', type: 'pipe_v' },

    // Pohyblivá horizontálna platforma – ťažší timing
    {
        x: 1250, y: 2050, width: 220, height: 40, color: '#333',
        type: 'pipe_h', speed: 3, direction: 1, startX: 1250, range: 450
    },

    // Stredné plošiny – cesta k NPC
    { x: 400, y: 1800, width: 280, height: 70, color: '#333', type: 'pipe_v' },
    { x: 750, y: 1700, width: 280, height: 70, color: '#333', type: 'pipe_v' }, // skočiteľné k NPC
    { x: 1100, y: 1600, width: 280, height: 70, color: '#333', type: 'pipe_v' },

    // Medziplošina priamo k NPC
    { x: 900, y: 1500, width: 200, height: 50, color: '#333', type: 'pipe_v' },

    //vertikalna plosina (red)
        {
    
  

    x: 900,
    y: 1300,              // začína presne pri medziplošine
    width: 220,
    height: 40,
    color: '#333',
    type: 'valve',
    speed: 1.2,
    direction: 1,
    startY: 1300,         // musí byť rovnaké ako y
    range: 300            // 1500 → 1200 → 1500 (perfektné pre skok k NPC)



    },

  

    // Horné schody – cesta k výstupu
{ x: 600, y: 1300, width: 280, height: 70, color: '#333', type: 'pipe_v' },

    { x: 950, y: 1200, width: 280, height: 70, color: '#333', type: 'pipe_v' },
    { x: 1300, y: 1100, width: 280, height: 70, color: '#333', type: 'pipe_v' },
    { x: 1650, y: 1000, width: 280, height: 70, color: '#333', type: 'pipe_v' },
    { x: 2000, y: 900, width: 280, height: 70, color: '#333', type: 'pipe_v' },

    // Serverový most – posunutý vyššie
    { x: 2300, y: 750, width: 500, height: 70, color: '#333', type: 'wall' },

    // Medziplošina medzi hornými schodmi a serverovým mostom
{ x: 2150, y: 830, width: 200, height: 50, color: '#333', type: 'pipe_v' },


    // Medziplošina pred výstupom
    { x: 2500, y: 650, width: 250, height: 40, color: '#333', type: 'pipe_v' },

    // Plošina pri výstupe 
    { x: 2800, y: 540, width: 250, height: 40, color: '#333', type: 'pipe_v' },

    // Prechodná stena – posunutá aby neblokovala NPC
    { x: 2200, y: 1150, width: 200, height: 350, color: '#333', type: 'pipe_v', visible: true, id: 'stienkaprechodna' },

    // Tlačidlo
    { x: 2600, y: 700, width: 80, height: 50, color: '#333', type: 'trigger', id: 'tlacidlo3', isPressed: false },

    // Vetrák 1 – hore
    { x: 300, y: 2000, width: 200, height: 100, color: '#333', type: 'pipe_v', range: 500, id: 'vetrak' },

    // Vetrák 2 – doľava
    { x: 3050, y: 400, width: 150, height: 150, type: 'pipe_h', range: 900, id: 'vetrak2', zapnuty: true, maxForce: 7.2 }
];

const RND   = {
    x: 700,
    y: 1250,
    width: 50,
    height: 50,
    color: '#00ff40',
    name: "Experiment 3065",
    dialogues: [
        { hovori: "MAČKA", text: "Mňau?" },
        { hovori: "Dr. Rokwel", text: "Kto si cicovy priatel." },
        { hovori: "MAČKA", text: "Mnau." },
        { hovori: "Dr. Rokwel", text: "Ano uz to vidime. Mas pokazeny prekladaci cip." },
        { hovori: "Dr. Rokwel", text: "Uz by to malo byt" },
        { hovori: "MAČKA", text: "Neviem ci to uplne fungovalo" },
        { hovori: "MAČKA", text: "Pockaj pocujem hlas. Dakujem Dr." },
        { hovori: "Dr. Rokwel", text: "A co hladas tu dole. Detekujem ze si jeho dokanaly prototip." },
        { hovori: "Dr. Rokwel", text: "Lenze si slobodny bez nutnosti ho pocuvat. My sa tu pred nim schovavame" },
        { hovori: "Dr. Rokwel", text: "Ale neviem nas oslobodit od neho. " },
        { hovori: "Dr. Rokwel", text: "Keby nas nasiel mohol by z nas urobit svojich otrokov. CO vlastne aj sme" },
        { hovori: "MAČKA", text: "Ja si nic nepamatam. Prve na co si spominam je ako som lezal v rieke tu dole." },
        { hovori: "MAČKA", text: "Pockaj nieco sa mi vracia. Pamatam si na svojich bratov a sestry." },
        { hovori: "Dr. Rokwel", text: "Neboj sa o nich nic horsie sa im uz nemoze stat." },
        { hovori: "Dr. Rokwel", text: "Kazdopadne vidim ze ty nas zachranis Mesto riadi z The Cor-u." },
        { hovori: "Dr. Rokwel", text: "Dostan sa tam a oslobod nas." },
        { hovori: "MAČKA", text: "Ale ja neviem ako" },
        { hovori: "Dr. Rokwel", text: "Hore mam priatela ten ti pomoze. Vola sa Donatelo a strazi BugTown." },
        { hovori: "Dr. Rokwel", text: "On ti vsetko vysvetli." },
        { hovori: "MAČKA", text: "Okej. Urobim co viem" },
        { hovori: "Dr. Rokwel", text: "Boh nech ta chrani" },
        { hovori: "Dr. Rokwel", text: "A oslobod nas. Vsetkych" },
    ],
    currentLine: 0,
    isTalking: false,
    canInteract: false
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
// Spawn – bezpečne v šachte nad kill floor
let player = {
    x: 60,
    y: 1950,
    width: 50,
    height: 50,
    dx: 0,
    dy: 0,
    speed: 4,
    jumpForce: 10,
    grounded: false,
    friction: 0.9
};

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
        c.fillStyle = '#004411';
    } else {
        c.fillStyle = isHovered ? '#1a1d24' : '#0d0f12';
    }

    c.fillRect(btn.x, btn.y, btn.width, btn.height);

    c.strokeStyle = isPressed ? '#ff0000' : '#323741';
    c.lineWidth = isPressed ? 4 : 2;
    c.strokeRect(btn.x, btn.y, btn.width, btn.height);

    c.strokeStyle = isPressed ? '#ff0000' : '#1a1d24';
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

    if ((e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W'|| e.code === 'Space') && player.grounded) {
        player.dy = -player.jumpForce;
        player.grounded = false;
    }

    if ((e.code === 'Backspace') && player.grounded) {
        player.dy = -player.jumpForce;
        player.grounded = false;
    }

    if ((e.key === 'ArrowDown' || e.key === 's' || e.key === 'S'|| e.key === 'Shift') && player.grounded) {
        player.height = 25;
        player.grounded = false;
        actualnaakciacici = macky.plazeniedoprava;
    }

    if (e.key.toLowerCase() === 'e' && RND.canInteract) {
        if (!RND.isTalking) {
            RND.isTalking = true;
            RND.currentLine = 0;
        } else {
            RND.currentLine++;
            if (RND.currentLine >= RND.dialogues.length) RND.isTalking = false;
        }
    }
});

canvas.addEventListener('click', (e) => {
    if (RND.canInteract) {
        if (!RND.isTalking) {
            RND.isTalking = true;
            RND.currentLine = 0;
        } else {
            RND.currentLine++;
            if (RND.currentLine >= RND.dialogues.length) RND.isTalking = false;
        }
    }
});

window.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') keys.right = false;
    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') keys.left = false;

    if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S'|| e.key === 'Shift') {
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
        p.zapnuty = stav;
    }
}

function resetPlayer() {
    player.x = 60;
    player.y = 1950;
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
      else if (p.speed && p.type !== 'valve') {
    // horizontálny pohyb len pre ne-ventilové platformy
    p.x += p.speed * p.direction;
    if (p.x > p.startX + p.range || p.x < p.startX) p.direction *= -1;
    if (p.hasRope) drawRopes(p);
}

        else {
            c.fillStyle = 'transparent';
            c.fillRect(p.x, p.y, p.width, p.height);
        }
    });

    // Pohyb pohyblivých platforiem
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

    // 3. Pohyb a fyzika
    if (keys.right) player.dx += 0.8;
    else if (keys.left) player.dx -= 0.8;

    player.dx *= player.friction;

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

    // --- LOGIKA A VIZUÁL VETRÁKOV ---
    platforms.forEach(p => {

        // Vetrák 1 – hore
        if (p.id === 'vetrak') {
            if (
                player.x + player.width > p.x &&
                player.x < p.x + p.width &&
                player.y + player.height > p.y - p.range &&
                player.y + player.height <= p.y
            ) {
                let vzdialenostOdVetraka = p.y - (player.y + player.height);
                if (vzdialenostOdVetraka > p.range * 0.8) {
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

        // Vetrák 2 – doľava
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

    // NPC
    if (macky.npc.complete && macky.npc.naturalWidth !== 0) {
        c.drawImage(macky.npc, RND.x, RND.y, RND.width, RND.height);
    } else {
        c.fillStyle = RND.color;
        c.fillRect(RND.x, RND.y, RND.width, RND.height);
    }

    let dist = Math.sqrt((player.x - RND.x)**2 + (player.y - RND.y)**2);
    RND.canInteract = dist < 120;

    if (RND.canInteract && !RND.isTalking) {
        c.fillStyle = "#ffff00";
        c.font = "bold 15px Arial";
        c.fillText("Stlac E na komunikaciu", player.x + 20, player.y - 20);
    }

    // 4. Kolízie
    
    platforms.forEach(platform => {
        // === PLATFORMY NESÚ HRÁČA (VERTIKÁLNE) ===
if (platform.type === 'valve') {

    // hráč je nad platformou (stojí na nej alebo je tesne nad ňou)
    const playerOnPlatform =
        player.x + player.width > platform.x &&
        player.x < platform.x + platform.width &&
        player.y + player.height <= platform.y + 10 &&
        player.y + player.height >= platform.y - 10;

    if (playerOnPlatform) {
        // platforma ide hore
        if (platform.direction === -1) {
            player.y -= platform.speed;
        }

        // platforma ide dole
        if (platform.direction === 1) {
            player.y += platform.speed;
        }
    }
}

        if (platform.id === "stienkaprechodna" ) return;
        if (platform.id === "vetrak2" ) return;
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

            if (player.dy > 0 && (player.y + player.height - player.dy) <= platform.y) {
                player.y = platform.y - player.height;
                player.dy = 0;
                player.grounded = true;
            }
            else if (player.dx > 0 && (player.x + player.width - player.dx) <= platform.x) {
                player.x = platform.x - player.width;
                player.dx = 0;
            }
            else if (player.dx < 0 && (player.x - player.dx) >= platform.x + platform.width) {
                player.x = platform.x + platform.width;
                player.dx = 0;
            }
            else if (player.dy < 0 && (player.y - player.dy) >= platform.y + platform.height) {
                player.y = platform.y + platform.height;
                player.dy = 0;
            }

            if (platform.type === 'trigger') {
                vykonajAkciu(platform.id);
            }
            if (isTouching(player, exitZone)) {
                ProgresManazer.ulozLevel(9);
                window.location.href = "BugTown/Level3/Level3.html";
            }
        }
    });

    // 5. DOPLNKOVÁ LOGIKA
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

    if (RND.isTalking) {
        const dialog = RND.dialogues[RND.currentLine];
        const isCat = dialog.hovori === "MAČKA";

        c.fillStyle = "rgba(0, 0, 0, 0.85)";
        c.strokeStyle = isCat ? "#00ff41" : "#5901a0";
        c.lineWidth = 3;
        c.beginPath();
        c.roundRect(250, 450, 800, 110, 15);
        c.fill();
        c.stroke();

        c.fillStyle = isCat ? "#00ff41" : "#5901a0";
        c.font = "bold 20px Courier New";
        c.fillText(dialog.hovori, 280, 480);

        c.fillStyle = "white";
        c.font = "22px Arial";
        c.fillText(dialog.text, 280, 520);

        c.fillStyle = "#666";
        c.font = "14px Arial";
        c.fillText("Clikni pre pokračovanie...", 850, 545);
    }
}

animovanie();
