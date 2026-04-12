const canvas = document.getElementById('gameCanvas');
const c = canvas.getContext('2d');

canvas.width = 1300; // na normal leevely
canvas.height = 600;

const gravitacia = 0.4;

const exitZone = {
    x: 1210,
    y: 180,
    width: 60,
    height: 60
};


// === DEFINÍCIA PLATFORIEM ===
const platforms = [ 
    { x: 140, y: 2, width: 11250, height: 50, color: '#333', type: 'pipe_h' },
    { x: 140, y: 500, width: 11250, height: 100, color: '#333', type: 'pipe_h' },
    { x: 140, y: 370, width: 11250, height: 100, color: '#333', type: 'pipe_h' },
    { x: 300, y: 590, width: 1100, height: 20, color: '#050505', type: 'floor' }, // kill virus
    { x: 0, y: 0, width: 1300, height: 1 },
    { x: 0, y: 0, width: 1, height: 600 },
    { x: 1300, y: 0, width: 1, height: 600 },
    { x: 0, y: 250, width: 150, height: 350, color: '#333', type: 'pipe_v' }, 
    { x: 150, y: 370, width: 150, height: 270, color: '#333', type: 'pipe_v' }, // 1 skok
    { x: 400, y: 370, width: 150, height: 270, color: '#333', type: 'pipe_v' }, //2. skok
    { x: 0, y: 2, width: 150, height: 170, color: '#333', type: 'pipe_v' },
    
];

const npc   = {
        x: 1050,
        y: 315,
        width: 50,
        height: 50,
        color: '#ff00ff',
        name: "Robo mouse",
        
        dialogues: [
            { hovori: "Robo mouse", text: "PÍP! Detekujem organickú formu života. Kto si?" },
            { hovori: "MAČKA", text: "Mňau! Som kyber-mačka a hľadám cestu von." },
            { hovori: "Robo mouse", text: "Cesta von vedie cez kyselinové jazero. Je to nebezpečné." },
            { hovori: "MAČKA", text: "Neboj sa, viem dobre skákať. Máš nejakú radu?" },
            { hovori: "Robo mouse", text: "Použi pohyblivé plošiny a hlavne nespadni do zelenej vody!" },
            { hovori: "MAČKA", text: "Rozumiem. Idem na to!" }
        ],
        currentLine: 0,
        isTalking: false,
        canInteract: false
    };

function drawRopes(p) {
    c.strokeStyle = '#555';
    c.lineWidth = 2;
    c.beginPath();
    c.moveTo(p.x + 20, p.y); c.lineTo(p.x + 35, 0);
    c.moveTo(p.x + p.width - 20, p.y); c.lineTo(p.x + p.width - 35, 0);
    c.stroke();
}

const macky = {
    dolava: new Image(),
    doprava: new Image(),
    plazeniedoprava: new Image(),
    npc: new Image(),
};

macky.dolava.src = '../../asseti/cyber-cat main cahrakter.png';
macky.doprava.src = '../../asseti/Cybermacka druhy pohlad.png';
macky.plazeniedoprava.src = '../../asseti/Plaziaca_macka.png';
macky.npc.src = '../../asseti/Plaziaca_macka.png';

let actualnaakciacici = macky.doprava;
const keys = { right: false, left: false };

// === VLASTNOSTI HRÁČA ===
let player = {
    x: 50,
    y: 200,
    width: 50,
    height: 50,
    dx: 0,
    dy: 0,
    speed: 5,
    jumpForce: 10,
    grounded: false,
    friction: 0.5
};

// --- ATMOSFÉRICKÉ EFEKTY ---
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
    if (e.key === 'ArrowRight' || e.key === 'd') {
        keys.right = true;
        actualnaakciacici = macky.dolava;
    }

    if (e.key === 'ArrowLeft' || e.key === 'a') {
        keys.left = true;
        actualnaakciacici = macky.doprava;
    }

    if ((e.key === 'ArrowUp' || e.key === 'w') && player.grounded) {
        player.dy = -player.jumpForce;
        player.grounded = false;
    }

    if ((e.key === 'ArrowDown' || e.key === 's') && player.grounded) {
        player.height = 25;
        player.grounded = false;
        actualnaakciacici = macky.plazeniedoprava;
    }

    if (e.key.toLowerCase() === 'mousedown', 'e' && npc.canInteract) {
        if (!npc.isTalking) {
            npc.isTalking = true;
            npc.currentLine = 0;
        } else {
            npc.currentLine++;
            if (npc.currentLine >= npc.dialogues.length) npc.isTalking = false;
        }
    }
});

canvas.addEventListener('click', (e) => {
    if (npc.canInteract) {
        if (!npc.isTalking) {
            npc.isTalking = true;
            npc.currentLine = 0;
        } else {
            npc.currentLine++;
            if (npc.currentLine >= npc.dialogues.length) npc.isTalking = false;
        }
    }
});

window.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowRight' || e.key === 'd') keys.right = false;
    if (e.key === 'ArrowLeft' || e.key === 'a') keys.left = false;

    if (e.key === 'ArrowDown' || e.key === 's') {
        
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

function resetPlayer() {
    player.x = 50;   
    player.y = 475;  
    player.dx = 0;   
    player.dy = 0;   
    player.height = 200; 
    actualnaakciacici = macky.doprava;
}

// === HLAVNÁ SMYČKA ===
function animovanie() {
    requestAnimationFrame(animovanie);
    time += 0.01;

    c.clearRect(0, 0, canvas.width, canvas.height);

    // 1. Pozadie
    let bgGrad = c.createRadialGradient(400, 200, 50, 400, 200, 400);
    bgGrad.addColorStop(0, '#0a100a');
    bgGrad.addColorStop(1, '#010501');
    c.fillStyle = bgGrad;
    c.fillRect(0, 0, canvas.width, canvas.height);

    c.fillStyle = brickPattern;
    c.fillRect(0, 0, canvas.width, canvas.height);

    drawFog();

    // 2. Vykreslenie objektov
    platforms.forEach(p => {
        if (p.type === 'floor') {
            c.fillStyle = '#000';
            c.fillRect(p.x, p.y, p.width, p.height);

            let sliz = c.createLinearGradient(0, p.y, 0, p.y + p.height);
            sliz.addColorStop(0, '#00ff41');
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
        else if(p.speed){
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
            p.x += p.speed * p.direction;
            if (p.x > p.startX + p.range || p.x < p.startX) p.direction *= -1;
            if (p.hasRope) drawRopes(p);
        } 
    });

   if (macky.npc.complete && macky.npc.naturalWidth !== 0) {
        c.drawImage(macky.npc, npc.x, npc.y, npc.width, npc.height);
    } else {
        c.fillStyle = npc.color; 
        c.fillRect(npc.x, npc.y, npc.width, npc.height);
    }

    // 4. Detekcia a interakcia
    let dist = Math.sqrt((player.x - npc.x)**2 + (player.y - npc.y)**2);
    npc.canInteract = dist < 120;

    if (npc.canInteract && !npc.isTalking) {
        c.fillStyle = "#ffff00"; 
        c.font = "bold 15px Arial";
        c.fillText("Stlac E na komunikaciu", player.x + 20, player.y - 20); 
    }

    // 3. Pohyb a fyzika
    if (keys.right) player.dx += player.speed;
    else if (keys.left) player.dx += -player.speed;
    else player.dx = 0;

    player.dx *= player.friction;
    player.x += player.dx;
    player.dy += gravitacia;
    player.y += player.dy;
    player.grounded = false;

    // box na hovorenie pre cici

    if (npc.isTalking) {
        const dialog = npc.dialogues[npc.currentLine];
        const isCat = dialog.hovori === "MAČKA";

        // Box
        c.fillStyle = "rgba(0, 0, 0, 0.85)";
        c.strokeStyle = isCat ? "#00ff41" : "#ff00ff";
        c.lineWidth = 3;
        c.beginPath();
        c.roundRect(250, 450, 800, 110, 15);
        c.fill();
        c.stroke();

        // Meno hovoriaceho
        c.fillStyle = isCat ? "#00ff41" : "#ff00ff";
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

    // 4. Kolízie
    platforms.forEach(platform => {
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
            }

            // náraz zľava do steny
            else if (player.dx < 0 && (player.x - player.dx) >= platform.x + platform.width) {
                player.x = platform.x + platform.width;
            }

            // náraz hlavou zdola
            else if (player.dy < 0 && (player.y - player.dy) >= platform.y + platform.height) {
                player.y = platform.y + platform.height;
                player.dy = 0;
            }
            
            if (player.height === 25 && player.chceSaPostavit) {
                if (mozeSaPostavit()) {
                    player.height = 50;
                    player.y -= 25;
                    player.actualnaakciacici = macky.doprava;
                    player.chceSaPostavit = false;
                }
            }
        }
        
    });

//PRECHOD DO ĎALŠIEHO LEVELU
    if (isTouching(player, exitZone)) {
        window.location.href = "SerWers/Level3/level3.html";
    }

    // 6. Vykreslenie postavy
    if (actualnaakciacici && actualnaakciacici.complete && actualnaakciacici.naturalWidth !== 0) {
        c.drawImage(actualnaakciacici, player.x, player.y, player.width, player.height);
    } else {
        c.fillStyle = 'red';
        c.fillRect(player.x, player.y, player.width, player.height);
    }
}

animovanie();