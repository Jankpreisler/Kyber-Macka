const canvas = document.getElementById('gameCanvas');
const c = canvas.getContext('2d');

canvas.width = 1300;
canvas.height = 600;

const gravitacia = 0.4;
const keys = { right: false, left: false, interact: false };
let time = 0;

// === NAČÍTANIE OBRÁZKOV ===
const macky = {
    dolava: new Image(),
    doprava: new Image(),
    plazeniedoprava: new Image(),
    npc: new Image() // Miesto pre obrázok NPC
};
macky.dolava.src = 'asseti/cyber-cat main cahrakter.png';
macky.doprava.src = 'asseti/Cybermacka druhy pohlad.png';
macky.plazeniedoprava.src = 'asseti/Plaziaca_macka.png';
macky.npc.src = 'asseti/npc_robot.png'; // Ak nemáš obrázok, vykreslí sa farebný štvorec

// === DEFINÍCIA LEVELU ===
const currentLevel = {
    playerStart: { x: 50, y: 400 },
    exitZone: { x: 1180, y: 40, width: 100, height: 120 },
    
    // NOVÉ: Definícia NPC
    npc: {
        x: 250,
        y: 450,
        width: 50,
        height: 50,
        color: '#ff00ff',
        name: "PROTO-TYPE 01",
        dialog: "Mňau... Teda, PÍP! Pozor na tú kyselinu dole!",
        showDialog: false
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
        if (keys.right) {
            this.dx = this.speed;
            this.img = (this.height === 25) ? macky.plazeniedoprava : macky.dolava;
        } else if (keys.left) {
            this.dx = -this.speed;
            this.img = (this.height === 25) ? macky.plazeniedoprava : macky.doprava;
        } else {
            this.dx = 0;
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
                        if (p.type === 'moving') this.x += p.speed * p.direction;
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

        // Interakcia s NPC (kontrola vzdialenosti)
        const npc = currentLevel.npc;
        let dist = Math.abs(this.x - npc.x);
        npc.showDialog = (dist < 100); 
    },

    draw() {
        if (this.img && this.img.complete && this.img.naturalWidth !== 0) {
            c.drawImage(this.img, this.x, this.y, this.width, this.height);
        } else {
            c.fillStyle = 'cyan';
            c.fillRect(this.x, this.y, this.width, this.height);
        }
    }
};

function drawRopes(p) {
    c.strokeStyle = '#555';
    c.lineWidth = 2;
    c.beginPath();
    c.moveTo(p.x + 20, p.y); c.lineTo(p.x + 35, 0);
    c.moveTo(p.x + p.width - 20, p.y); c.lineTo(p.x + p.width - 35, 0);
    c.stroke();
}

// === OVLÁDANIE ===
window.addEventListener('keydown', (e) => {
    if (e.key === 'd' || e.key === 'ArrowRight') keys.right = true;
    if (e.key === 'a' || e.key === 'ArrowLeft') keys.left = true;
    if ((e.key === 'w' || e.key === 'ArrowUp') && player.grounded) {
        player.dy = -player.jumpForce;
        player.grounded = false;
    }
    if (e.key === 's' || e.key === 'ArrowDown') player.height = 25;
});

window.addEventListener('keyup', (e) => {
    if (e.key === 'd' || e.key === 'ArrowRight') keys.right = false;
    if (e.key === 'a' || e.key === 'ArrowLeft') keys.left = false;
    if (e.key === 's' || e.key === 'ArrowDown') player.chceSaPostavit = true;
});

// === HLAVNÁ SMYČKA ===
function animovanie() {
    requestAnimationFrame(animovanie);
    time += 0.01;
    c.clearRect(0, 0, canvas.width, canvas.height);

    // Pozadie
    c.fillStyle = '#0a0a0a';
    c.fillRect(0, 0, canvas.width, canvas.height);

    // Platformy
    currentLevel.platforms.forEach(p => {
        if (p.type === 'moving') {
            p.x += p.speed * p.direction;
            if (p.x > p.startX + p.range || p.x < p.startX) p.direction *= -1;
            if (p.hasRope) drawRopes(p);
        }
        if (p.type === 'moving_v') {
            p.y += p.speed * p.direction;
            if (p.y > p.startY + p.range || p.y < p.startY) p.direction *= -1;
        }
        c.fillStyle = p.color;
        c.fillRect(p.x, p.y, p.width, p.height);
    });

    // === VYKRESLENIE NPC ===
    const n = currentLevel.npc;
    if (macky.npc.complete && macky.npc.naturalWidth !== 0) {
        c.drawImage(macky.npc, n.x, n.y, n.width, n.height);
    } else {
        c.fillStyle = n.color;
        c.fillRect(n.x, n.y, n.width, n.height);
    }

    // Bublina s dialógom
    if (n.showDialog) {
        c.fillStyle = "rgba(0, 0, 0, 0.8)";
        c.strokeStyle = "#00ffff";
        c.lineWidth = 2;
        c.beginPath();
        c.roundRect(n.x - 50, n.y - 70, 300, 50, 10);
        c.fill();
        c.stroke();

        c.fillStyle = "#00ffff";
        c.font = "bold 12px Arial";
        c.fillText(n.name, n.x - 40, n.y - 55);
        c.fillStyle = "white";
        c.font = "14px Arial";
        c.fillText(n.dialog, n.x - 40, n.y - 35);
    }

    // Oranžový cieľ
    c.fillStyle = 'orange';
    c.fillRect(currentLevel.exitZone.x, currentLevel.exitZone.y, currentLevel.exitZone.width, currentLevel.exitZone.height);
    c.fillStyle = 'black';
    c.font = "bold 16px Arial";
    c.fillText("CIEĽ", currentLevel.exitZone.x + 30, currentLevel.exitZone.y + 65);

    player.update();
    player.draw();

    // Výhra
    if (player.x + player.width > currentLevel.exitZone.x && 
        player.x < currentLevel.exitZone.x + currentLevel.exitZone.width &&
        player.y < currentLevel.exitZone.y + currentLevel.exitZone.height) {
        c.fillStyle = "white";
        c.font = "40px Arial";
        c.fillText("LEVEL COMPLETE!", 450, 300);
    }
}

animovanie();