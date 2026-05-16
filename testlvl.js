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
    npc: new Image(),
    enemy: new Image()
};
macky.dolava.src = 'asseti/cyber-cat main cahrakter.png';
macky.doprava.src = 'asseti/Cybermacka druhy pohlad.png';
macky.plazeniedoprava.src = 'asseti/Plaziaca_macka.png';
macky.npc.src = 'asseti/npc_robot.png';
macky.enemy.src = 'asseti/enemy_drone.png';

// === DEFINÍCIA LEVELU ===
const currentLevel = {
    playerStart: { x: 50, y: 400 },
    exitZone: { x: 1180, y: 40, width: 100, height: 120 },
    
    // NPC ROBOT S DETEKČNÝM DOSAHOM
    npc: {
        x: 450,
        y: 450,
        width: 50,
        height: 50,
        color: '#ff00ff',
        name: "PROTO-TYPE 01",
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
        canInteract: false,
        
        // Vlastnosti pre útok a detekciu
        isHostile: false,
        speed: 2,
        damage: 20,
        detectionRange: 350 // DOSAH DETEKCIE V PIXELOCH
    },

    enemies: [
        {
            x: 750,
            y: 200,
            width: 40,
            height: 40,
            color: 'red',
            startX: 750,
            range: 200,
            speed: 3,
            direction: 1
        }
    ],

    platforms: [
        { x: 0, y: 500, width: 600, height: 100, type: 'wall', color: '#222' },
        { x: 650, y: 420, width: 60, height: 20, type: 'pipe_h', color: '#333' },
        { x: 750, y: 340, width: 60, height: 20, type: 'pipe_h', color: '#333' },
        { x: 850, y: 260, width: 120, height: 20, type: 'moving', 
            startX: 820, range: 150, speed: 2, direction: 1, hasRope: true, color: '#444' 
        },
        { x: 1050, y: 300, width: 100, height: 20, type: 'moving_v', 
            startY: 150, range: 300, speed: 2.5, direction: 1, color: 'blue' 
        },
        { x: 1180, y: 160, width: 100, height: 40, type: 'wall', color: 'blue' },
        { x: 0, y: 585, width: 1300, height: 15, type: 'acid', color: '#00ff41' }
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

    maxHp: 100,
    hp: 100,
    invincibleTimer: 0,

    reset() {
        this.x = currentLevel.playerStart.x;
        this.y = currentLevel.playerStart.y;
        this.dy = 0;
        this.height = 50;
        this.hp = this.maxHp;
        
        // Reset robota pri smrti mačky
        currentLevel.npc.x = 450;
        currentLevel.npc.y = 450;
        currentLevel.npc.isHostile = false;
        currentLevel.npc.currentLine = 0;
        currentLevel.npc.isTalking = false;
    },

    takeDamage(amount) {
        if (Date.now() < this.invincibleTimer) return;

        this.hp -= amount;
        this.invincibleTimer = Date.now() + 800; // 800ms nesmrteľnosť

        if (this.hp <= 0) {
            this.reset();
        }
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

        // Kolízie s plošinami
        currentLevel.platforms.forEach(p => {
            if (this.x < p.x + p.width && this.x + this.width > p.x &&
                this.y < p.y + p.height && this.y + this.height > p.y) {
                
                if (p.type === 'acid') {
                    this.takeDamage(200);
                    this.dy = -6; 
                    this.grounded = false;
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

        // Kolízie s dronmi
        currentLevel.enemies.forEach(en => {
            if (this.x < en.x + en.width && this.x + this.width > en.x &&
                this.y < en.y + en.height && this.y + this.height > en.y) {
                this.takeDamage(25);
            }
        });

        // Kolízia s NPC (ak útočí)
        const npc = currentLevel.npc;
        if (npc.isHostile) {
            if (this.x < npc.x + npc.width && this.x + this.width > npc.x &&
                this.y < npc.y + npc.height && this.y + this.height > npc.y) {
                this.takeDamage(npc.damage);
            }
        }

        if (this.height === 25 && this.chceSaPostavit) {
            this.height = 50;
            this.y -= 25;
            this.chceSaPostavit = false;
        }

        // Interakcia s NPC funguje len vtedy, ak po tebe práve nejde
        let dist = Math.sqrt((this.x - npc.x)**2 + (this.y - npc.y)**2);
        npc.canInteract = (dist < 120) && !npc.isHostile; 
        if (!npc.canInteract) npc.isTalking = false;
    },

    draw() {
        if (Date.now() < this.invincibleTimer) {
            c.globalAlpha = Math.sin(Date.now() * 0.04) > 0 ? 0.3 : 0.8;
        }

        if (this.img && this.img.complete && this.img.naturalWidth !== 0) {
            c.drawImage(this.img, this.x, this.y, this.width, this.height);
        } else {
            c.fillStyle = 'cyan';
            c.fillRect(this.x, this.y, this.width, this.height);
        }
        c.globalAlpha = 1.0;
    }
};

// === VYKRESLENIE HEALTH BARU ===
function drawUI() {
    const startX = 20;
    const startY = 20;
    const barWidth = 200;
    const barHeight = 20;

    c.fillStyle = '#333';
    c.fillRect(startX, startY, barWidth, barHeight);

    const currentBarWidth = (player.hp / player.maxHp) * barWidth;

    if (player.hp > 50) c.fillStyle = '#00ff00';
    else if (player.hp > 25) c.fillStyle = '#ffaa00';
    else c.fillStyle = '#ff0000';

    c.fillRect(startX, startY, currentBarWidth, barHeight);

    c.strokeStyle = '#fff';
    c.lineWidth = 2;
    c.strokeRect(startX, startY, barWidth, barHeight);

    c.fillStyle = '#fff';
    c.font = 'bold 14px Arial';
    c.fillText(`HP: ${player.hp} / ${player.maxHp}`, startX + barWidth + 15, startY + 15);
}

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
});

// === HLAVNÁ SMYČKA ===
function animovanie() {
    requestAnimationFrame(animovanie);
    c.clearRect(0, 0, canvas.width, canvas.height);

    c.fillStyle = '#0a0a0a';
    c.fillRect(0, 0, canvas.width, canvas.height);

    // Vykreslenie plošín
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

    // Pohyb a vykreslenie dronov
    currentLevel.enemies.forEach(en => {
        en.x += en.speed * en.direction;
        if (en.x > en.startX + en.range || en.x < en.startX) {
            en.direction *= -1;
        }

        if (macky.enemy.complete && macky.enemy.naturalWidth !== 0) {
            c.drawImage(macky.enemy, en.x, en.y, en.width, en.height);
        } else {
            c.fillStyle = en.color;
            c.fillRect(en.x, en.y, en.width, en.height);
        }
    });

    // === LOGIKA DETEKCIE A UTÚKU NPC ROBOTA ===
    const n = currentLevel.npc;
    
    // Výpočet vzdialenosti medzi mačkou a robotom
    let vzdialenostODMacki = Math.sqrt((player.x - n.x)**2 + (player.y - n.y)**2);

    if (vzdialenostODMacki < n.detectionRange) {
        n.isHostile = true;
        n.isTalking = false; // Preruší dialóg, ak hráč vbehne príliš blízko a spustí agro
        
        // Prenasledovanie mačky (AI)
        if (n.x < player.x) n.x += n.speed;
        if (n.x > player.x) n.x -= n.speed;
        if (n.y < player.y) n.y += n.speed;
        if (n.y > player.y) n.y -= n.speed;
    } else {
        // Ak mačka odbehne ďalej ako 350 pixelov, robot ju stratí a upokojí sa
        n.isHostile = false;
    }

    // VIZUÁLNY KRUH DOSAHU DETEKCIE (Dá sa vymazať, ak ho v hre nechceš vidieť)
    c.strokeStyle = n.isHostile ? 'rgba(255, 0, 0, 0.25)' : 'rgba(0, 255, 255, 0.1)';
    c.lineWidth = 2;
    c.beginPath();
    c.arc(n.x + n.width/2, n.y + n.height/2, n.detectionRange, 0, Math.PI * 2);
    c.stroke();

    // Vykreslenie NPC robota
    if (macky.npc.complete && macky.npc.naturalWidth !== 0) {
        c.drawImage(macky.npc, n.x, n.y, n.width, n.height);
    } else {
        c.fillStyle = n.isHostile ? '#ff0055' : n.color;
        c.fillRect(n.x, n.y, n.width, n.height);
    }

    // Výkričník nad NPC (len ak neútočí a nehovorí)
    if (n.canInteract && !n.isTalking && !n.isHostile) {
        c.fillStyle = "#ffff00";
        c.font = "bold 26px Arial";
        c.fillText("!", n.x + n.width/2 - 5, n.y - 15);
    }

    // Dialógový systém
    if (n.isTalking) {
        const line = n.dialogues[n.currentLine];
        const isCat = (line.hovori === "MAČKA");

        c.fillStyle = "rgba(10, 10, 10, 0.95)";
        c.strokeStyle = isCat ? "#00ff00" : "#00ffff"; 
        c.lineWidth = 3;
        c.beginPath();
        c.roundRect(250, 460, 800, 110, 15);
        c.fill();
        c.stroke();

        c.fillStyle = isCat ? "#00ff00" : "#00ffff";
        c.font = "bold 18px Courier New";
        c.fillText(line.hovori, 280, 490);
        
        c.fillStyle = "white";
        c.font = "20px Arial";
        c.fillText(line.text, 280, 525);

        c.fillStyle = "#666";
        c.font = "12px Arial";
        c.fillText("Stlač [E]...", 1000, 555);
    }

    // Exit zóna
    c.fillStyle = 'orange';
    c.fillRect(currentLevel.exitZone.x, currentLevel.exitZone.y, currentLevel.exitZone.width, currentLevel.exitZone.height);

    // Update a vykreslenie hráča
    player.update();
    player.draw();

    // Vykreslenie Health Baru navrchu scény
    drawUI();
}

animovanie();