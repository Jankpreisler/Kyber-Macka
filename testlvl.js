const canvas = document.getElementById('gameCanvas');
const c = canvas.getContext('2d');

canvas.width = 1300;
canvas.height = 600;

const gravitacia = 0.4;
const keys = { right: false, left: false };

// === NAČÍTANIE OBRÁZKOV ===
const macky = {
    dolava: new Image(),
    doprava: new Image(),
    plazeniedoprava: new Image(),
    npc: new Image()
};
macky.dolava.src = 'asseti/cyber-cat main cahrakter.png';
macky.doprava.src = 'asseti/Cybermacka druhy pohlad.png';
macky.plazeniedoprava.src = 'asseti/Plaziaca_macka.png';
macky.npc.src = 'asseti/npc_robot.png';

// === DEFINÍCIA LEVELU ===
const currentLevel = {
    playerStart: { x: 50, y: 400 },
    exitZone: { x: 1180, y: 40, width: 100, height: 120 },
    
    npc: {
        x: 250,
        y: 450,
        width: 50,
        height: 50,
        color: '#ff00ff',
        name: "PROTO-TYPE 01",
        // DIALÓG AKO POLE OBJEKTOV (striedanie postáv)
        dialogues: [
            { hovori: "PROTO-TYPE 01", text: "PÍP! Detekujem organickú formu života. Kto si?" },
            { hovori: "MAČKA", text: "Mňau! Som kyber-mačka a hľadám cestu von." },
            { hovori: "PROTO-TYPE 01", text: "Cesta von vedie cez kyselinové jazero. Je to nebezpečné." },
            { hovori: "MAČKA", text: "Neboj sa, viem dobre skákať. Máš nejakú radu?" },
            { hovori: "PROTO-TYPE 01", text: "Použi pohyblivé plošiny a hlavne nespadni do zelenej vody!" },
            { hovori: "MAČKA", text: "Rozumiem. Idem na to!" }
        ],
        currentLine: 0,
        isTalking: false,
        canInteract: false
    },

    platforms: [
        { x: 0, y: 500, width: 300, height: 100, type: 'wall', color: '#222' },
        { x: 350, y: 420, width: 60, height: 20, type: 'pipe_h', color: '#333' },
        { x: 450, y: 340, width: 60, height: 20, type: 'pipe_h', color: '#333' },
        { x: 550, y: 260, width: 120, height: 20, type: 'moving', 
            startX: 520, range: 150, speed: 2, direction: 1, hasRope: true, color: '#444' 
        },
        { x: 800, y: 260, width: 120, height: 20, type: 'moving', 
            startX: 750, range: 150, speed: 1.8, direction: -1, hasRope: true, color: '#444' 
        },
        { x: 1050, y: 300, width: 100, height: 20, type: 'moving_v', 
            startY: 150, range: 300, speed: 2.5, direction: 1, color: 'red' 
        },
        { x: 1180, y: 160, width: 100, height: 40, type: 'wall', color: 'blue' },
        { x: 300, y: 585, width: 1000, height: 15, type: 'acid', color: '#00ff41' }
    ]
};

// === OBJEKT HRÁČA ===
let player = {
    x: currentLevel.playerStart.x,
    y: currentLevel.playerStart.y,
    width: 50,
    height: 50,
    dx: 0,
    dy: 0,
    speed: 5,
    jumpForce: 10,
    grounded: false,
    chceSaPostavit: false,
    img: macky.doprava,

    reset() {
        this.x = currentLevel.playerStart.x;
        this.y = currentLevel.playerStart.y;
        this.dy = 0;
        this.height = 50;
    },

    update() {
        if (currentLevel.npc.isTalking) {
            this.dx = 0;
        } else {
            if (keys.right) {
                this.dx = this.speed;
                this.img = (this.height === 25) ? macky.plazeniedoprava : macky.dolava;
            } else if (keys.left) {
                this.dx = -this.speed;
                this.img = (this.height === 25) ? macky.plazeniedoprava : macky.doprava;
            } else {
                this.dx = 0;
            }
        }

        this.x += this.dx;
        this.dy += gravitacia;
        this.y += this.dy;
        this.grounded = false;

        currentLevel.platforms.forEach(p => {
            if (this.x < p.x + p.width && this.x + this.width > p.x &&
                this.y < p.y + p.height && this.y + this.height > p.y) {
                
                if (p.type === 'acid') {
                    this.reset();
                } else {
                    if (this.dy > 0 && (this.y + this.height - this.dy) <= p.y) {
                        this.y = p.y - this.height;
                        this.dy = 0;
                        this.grounded = true;
                        if (p.type === 'moving' && !currentLevel.npc.isTalking) this.x += p.speed * p.direction;
                    } 
                    else if (this.dx > 0 && (this.x + this.width - this.dx) <= p.x) this.x = p.x - this.width;
                    else if (this.dx < 0 && (this.x - this.dx) >= p.x + p.width) this.x = p.x + p.width;
                    else if (this.dy < 0 && (this.y - this.dy) >= p.y + p.height) { this.y = p.y + p.height; this.dy = 0; }
                }
            }
        });

        if (this.height === 25 && this.chceSaPostavit) {
            this.height = 50;
            this.y -= 25;
            this.chceSaPostavit = false;
        }

        const npc = currentLevel.npc;
        let dist = Math.sqrt((this.x - npc.x)**2 + (this.y - npc.y)**2);
        npc.canInteract = (dist < 120); 
        if (!npc.canInteract) npc.isTalking = false;
    },

    draw() {
        // Mačka sa pri hovorení jemne trasie
        let shake = (currentLevel.npc.isTalking) ? Math.sin(Date.now() * 0.2) * 2 : 0;
        if (this.img && this.img.complete && this.img.naturalWidth !== 0) {
            c.drawImage(this.img, this.x, this.y + shake, this.width, this.height);
        } else {
            c.fillStyle = 'cyan';
            c.fillRect(this.x, this.y + shake, this.width, this.height);
        }
    }
};

// === OVLÁDANIE ===
window.addEventListener('keydown', (e) => {
    if (e.key === 'd' || e.key === 'ArrowRight') keys.right = true;
    if (e.key === 'a' || e.key === 'ArrowLeft') keys.left = true;
    if ((e.key === 'w' || e.key === 'ArrowUp') && player.grounded && !currentLevel.npc.isTalking) {
        player.dy = -player.jumpForce;
        player.grounded = false;
    }
    if (e.key === 's' || e.key === 'ArrowDown') player.height = 25;

    // Dialóg
    if (e.key.toLowerCase() === 'e' && currentLevel.npc.canInteract) {
        const n = currentLevel.npc;
        
        // Otočenie mačky k robotovi
        if (player.x < n.x) player.img = macky.dolava;
        else player.img = macky.doprava;

        if (!n.isTalking) {
            n.isTalking = true;
            n.currentLine = 0;
        } else {
            n.currentLine++;
            if (n.currentLine >= n.dialogues.length) {
                n.isTalking = false;
            }
        }
    }
});

window.addEventListener('keyup', (e) => {
    if (e.key === 'd' || e.key === 'ArrowRight') keys.right = false;
    if (e.key === 'a' || e.key === 'ArrowLeft') keys.left = false;
    if (e.key === 's' || e.key === 'ArrowDown') player.chceSaPostavit = true;

    if (e.key.toLowerCase() === 'e' && npc.canInteract) {
        if (!npc.isTalking) {
            npc.isTalking = true;
            npc.currentLine = 0;
        } else {
            npc.currentLine++;
            if (npc.currentLine >= npc.dialogues.length) npc.isTalking = false;
        }
    }
});

// === HLAVNÁ SMYČKA ===
function animovanie() {
    requestAnimationFrame(animovanie);
    c.clearRect(0, 0, canvas.width, canvas.height);

    c.fillStyle = '#0a0a0a';
    c.fillRect(0, 0, canvas.width, canvas.height);

    currentLevel.platforms.forEach(p => {
        if (p.type === 'moving') {
            p.x += p.speed * p.direction;
            if (p.x > p.startX + p.range || p.x < p.startX) p.direction *= -1;
        }
        if (p.type === 'moving_v') {
            p.y += p.speed * p.direction;
            if (p.y > p.startY + p.range || p.y < p.startY) p.direction *= -1;
        }
        c.fillStyle = p.color;
        c.fillRect(p.x, p.y, p.width, p.height);
    });

    if (macky.npc.complete) {
        c.drawImage(macky.npc, npc.x, npc.y, npc.width, npc.height);
    } else {
        c.fillStyle = 'purple'; c.fillRect(npc.x, npc.y, npc.width, npc.height);
    }

    const n = currentLevel.npc;
    if (macky.npc.complete && macky.npc.naturalWidth !== 0) {
        c.drawImage(macky.npc, n.x, n.y, n.width, n.height);
    } else {
        c.fillStyle = n.color;
        c.fillRect(n.x, n.y, n.width, n.height);
    }

    // Výkričník nad mačkou
    if (n.canInteract && !n.isTalking) {
        c.fillStyle = "#ffff00";
        c.font = "bold 26px Arial";
        c.fillText("!", player.x + player.width/2 - 5, player.y - 15);
    }

    // === VYLEPŠENÝ DIALÓGOVÝ SYSTÉM ===
    if (n.isTalking) {
        const line = n.dialogues[n.currentLine];
        const isCat = (line.hovori === "MAČKA");

        // Pozadie boxu
        c.fillStyle = "rgba(10, 10, 10, 0.95)";
        c.strokeStyle = isCat ? "#00ff00" : "#00ffff"; // Mačka má zelený okraj, robot modrý
        c.lineWidth = 3;
        c.beginPath();
        c.roundRect(250, 460, 800, 110, 15);
        c.fill();
        c.stroke();

        // Meno hovoriaceho
        c.fillStyle = isCat ? "#00ff00" : "#00ffff";
        c.font = "bold 18px Courier New";
        c.fillText(line.hovori, 280, 490);
        
        // Text repliky
        c.fillStyle = "white";
        c.font = "20px Arial";
        c.fillText(line.text, 280, 525);

        c.fillStyle = "#666";
        c.font = "12px Arial";
        c.fillText("Stlač [E]...", 1000, 555);
    }

    c.fillStyle = 'orange';
    c.fillRect(currentLevel.exitZone.x, currentLevel.exitZone.y, currentLevel.exitZone.width, currentLevel.exitZone.height);

    player.update();
    player.draw();
}

animovanie();