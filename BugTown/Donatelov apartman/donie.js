const canvas = document.getElementById('gameCanvas');
const c = canvas.getContext('2d');

canvas.width = 1300; // na normal leevely
canvas.height = 600;

let zobrazitHUD = false; 
let mana = 100;
let maximalnaMana = 100;
let minmana = 0;

const gravitacia = 0.4;

const exitZone = {
    x: 0,
    y: 1300,
    width: 60,
    height: 80
};

const Karera = {
    x: 0,
    y: 0,
    width: canvas.height,
    height: canvas.height
};

//                  === DEFINÍCIA PLATFORIEM ===
const platforms = [
    { x: 0, y: 2900, width: 1000750, height: 20, color: '#050505', type: 'floor' }, //kill
    { x: 0, y: 1900, width: 750, height: 2000, color: '#333', type: 'pipe_v' }, //spawn
    { x: -150, y: 100, width: 150, height: 2000, color: '#333', type: 'pipe_v' }, //left border
    { x: 300, y: 1370, width: 380, height: 490, color: '#333', type: 'pipe_v'},
    { x: 900, y: 1800, width: 280, height: 70, color: '#333', type: 'pipe_v'  },
    { x: 1350, y: 1700, width: 530, height: 70, color: '#333', type: 'pipe_v'  },
    { x: 1680, y: 1370, width: 210, height: 400, color: '#333', type: 'pipe_v', id: 'stienkaprechodna' },
    { x: 2000, y: 1600, width: 200, height: 70, color: '#333', type: 'pipe_v'  },
    { x: 2350, y: 1800, width: 400, height: 70, color: '#333', type: 'pipe_h',startX: 2350, range: 270, speed: 1.8, direction: -1, id: 'stienkaprechodna' },
    { x: 2350, y: 2000, width: 400, height: 70, color: '#333', type: 'pipe_h',startX: 2350, range: 270, speed: 1.8, direction: -1,  },
    { x: 3150, y: 1300, width: 180, height: 70, color: '#333', type: 'valve',startY: 1300, range: 750, speed: 1, direction: 1, },
    { x: 3350, y: 0, width: 2080, height: 1200, color: '#333', type: 'pipe_h',id: 'tajne_dvere', visible: true },
    { x: 3350, y: 1200, width: 2080, height: 100000, color: '#333', type: 'pipe_h'},
    { x: 0, y: 1300, width: 300, height: 70, color: '#333', type: 'pipe_h' },
    { x: 300, y: 1300, width: 300, height: 70, color: '#333', type: 'pipe_h' },
    { x: 600, y: 1300, width: 300, height: 70, color: '#333', type: 'pipe_h' },
    { x: 900, y: 1300, width: 300, height: 70, color: '#333', type: 'pipe_h' },
    { x: 1200, y: 1300, width: 300, height: 70, color: '#333', type: 'pipe_h'},
    { x: 1500, y: 1300, width: 300, height: 70, color: '#333', type: 'pipe_h' },
    { x: 1800, y: 1300, width: 300, height: 70, color: '#333', type: 'pipe_h'},
    { x: 2100, y: 1300, width: 300, height: 70, color: '#333', type: 'pipe_h' },
    { x: 2400, y: 1300, width: 300, height: 70, color: '#333', type: 'pipe_h' },
    { x: 2700, y: 1300, width: 300, height: 70, color: '#333', type: 'pipe_h' },
];

const Donatelo   = {
        x: 50,
        y: 1220,
        width: 50,
        height: 50,
        color: '#5901a0',
        name: "Donatelo",
        
        dialogues: [
            { hovori: "MAČKA", text: "Mňau?" },
            { hovori: "MAČKA", text: "Teda Halo?" },
            { hovori: "Donatelo", text: "Ano" },
            { hovori: "Donatelo", text: "Kto si?" },
            { hovori: "Donatelo", text: "Som Macka asi neviem nepamatam si na svoje meno" },
            { hovori: "Donatelo", text: "He He si vtipny ako moj dobry priatel JKP." },
            { hovori: "Donatelo", text: "Ako si sa o mne dozvedel" },
            { hovori: "MAČKA", text: "Dr. Rokvel ma poslal" },
            { hovori: "Donatelo", text: "Trochu som dufal ze jeden z mojich bratov" },
            { hovori: "MAČKA", text: "Ty mas bratov" },
            { hovori: "Donatelo", text: "Ano, 3 Lea, Michaela, Raynolda ako ty novodobi umelci" },
            { hovori: "MAČKA", text: "Ja som mal ties ale neviem co sa stalo" },
            { hovori: "MAČKA", text: "Dufam ze..." },
            { hovori: "MAČKA", text: "Alw nic... Nechaj to tak." },
            { hovori: "MAČKA", text: "Co sa stalo tvojim" },
            { hovori: "Donatelo", text: "Pohadal som sa snimi" },
            { hovori: "Donatelo", text: "A oni teda my sme sa...." },
            { hovori: "Donatelo", text: "Odcudzili" },
            { hovori: "Donatelo", text: "Kazdopadne. Si jeden z prototypov" },
            { hovori: "Donatelo", text: "Minule som videl jedneho z vas ako skakal ako divy" },
            { hovori: "Donatelo", text: "Musis ho aktivovat a budes neporazitelny" },
            { hovori: "MAČKA", text: "Dakujem za rada...Pockat" },
            { hovori: "MAČKA", text: "Ako...Ja..?" },
            { hovori: "Donatelo", text: "Mozno su to tvoji surodenci.." },
            { hovori: "MAČKA", text: "Neviem dufam alebo nie" },
            { hovori: "Donatelo", text: "Najdi LEA" },
            { hovori: "Donatelo", text: "Malby byt tu v meste" },
            { hovori: "MAČKA", text: "Jasne, chapem" },
            { hovori: "Donatelo", text: "A......" },
            { hovori: "Donatelo", text: "Povedz mu ze ma to mrzi" },
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

    if ((e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W'|| e.code === 'Space') && player.grounded) {
        player.dy = -player.jumpForce;
        player.grounded = false;
        console.log(e.key);
    }

    if ((e.code === 'Backspace') && player.grounded) {
        player.dy = -player.jumpForce;
        player.grounded = false;
         console.log(e.code);
    }

    if ((e.key === 'ArrowDown' || e.key === 's' || e.key === 'S'|| e.key === 'Shift') && player.grounded) {
        player.height = 25;
        player.grounded = false;
        actualnaakciacici = macky.plazeniedoprava;
    }
    if (e.key.toLowerCase() === 'e' && Donatelo.canInteract) {
        if (!Donatelo.isTalking) {
            Donatelo.isTalking = true;
            Donatelo.currentLine = 0;
        } else {
            Donatelo.currentLine++;
            if (Donatelo.currentLine >= Donatelo.dialogues.length) {
                Donatelo.isTalking = false; 
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
     if ((e.key === 'Q' || e.key === 'q' ) && mana >= 20) {
        mana -= 20;
        player.isdashing = true;
        let smer = 0;
        if (keys.right) {
            smer = 1;
        }
        else if (keys.left){
            smer = -1;
        } 
        else smer = (actualnaakciacici === macky.dolava) ? 1 : -1; 
        player.dx = smer * player.dashspeed;
    }
});

canvas.addEventListener('click', (e) => {
    if (Donatelo.canInteract) {
        if (!Donatelo.isTalking) {
            Donatelo.isTalking = true;
            Donatelo.currentLine = 0;
            
        } else {
            Donatelo.currentLine++;
            if (Donatelo.currentLine >= Donatelo.dialogues.length){
                Donatelo.isTalking = false;
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

    

    // --- LOGIKA DASHU (DOPLNENIE) ---
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
    if(player.isdashing == true) {
        
         if (player.dx > player.dashspeed) player.dx = player.dashspeed;
        if (player.dx < -player.dashspeed) player.dx = -player.dashspeed;
    }
    else{
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

    if (macky.npc.complete && macky.npc.naturalWidth !== 0) {
        c.drawImage(macky.npc, Donatelo.x, Donatelo.y, Donatelo.width, Donatelo.height);
    } else {
        c.fillStyle = Donatelo.color; 
        c.fillRect(Donatelo.x, Donatelo.y, Donatelo.width, Donatelo.height);
    }

    let dist = Math.sqrt((player.x - Donatelo.x)**2 + (player.y - Donatelo.y)**2);
    Donatelo.canInteract = dist < 120;

    if (Donatelo.canInteract && !Donatelo.isTalking) {
        c.fillStyle = "#ffff00"; 
        c.font = "bold 15px Arial";
        c.fillText("Stlac E na komunikaciu", player.x + 20, player.y - 20); 
    }
    


    // 4. Kolízie
    platforms.forEach(platform => {
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
            nastavViditelnost('vetrak2', false); // Stena zmizne
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

    if (Donatelo.isTalking) {
        const dialog = Donatelo.dialogues[Donatelo.currentLine];
        const isCat = dialog.hovori === "MAČKA";

        // Box
        c.fillStyle = "rgba(0, 0, 0, 0.85)";
        c.strokeStyle = isCat ? "#00ff41" : "#5901a0";
        c.lineWidth = 3;
        c.beginPath();
        c.roundRect(250, 450, 800, 110, 15);
        c.fill();
        c.stroke();

        // Meno hovoriaceho
        c.fillStyle = isCat ? "#00ff41" : "#5901a0";
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
        c.fillText("• Error 404  [LOCKED]", barX + 10, barY + 500);
        c.fillText("• Error 404 [LOCKED]", barX + 10, barY + 520);
        c.fillText("• Error 404 [LOCKED]", barX + 10, barY + 540);

        c.restore();
    }


}

animovanie();