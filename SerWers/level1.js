const canvas = document.getElementById('gameCanvas');
const c = canvas.getContext('2d');

canvas.width = 1300;
canvas.height = 600;

const gravitacia = 0.4;

// === EXIT ZÓNA ===
const exitZone = {
    x: 1210,
    y: 20,
    width: 60,
    height: 60
};

// === DEFINÍCIA PLATFORIEM ===
const platforms = [
    { x: 0, y: 580, width: 100, height: 20, color: '#050505', type: 'floor' },
    { x: 0, y: 0, width: 1300, height: 1 },
    { x: 0, y: 0, width: 1, height: 600 },
    { x: 1300, y: 0, width: 1, height: 600 }, 
    { x: 0, y: 535, width: 800, height: 400, color: '#1a1a1a', type: 'wall' }, 
    { x: 130, y: 0, width: 150, height: 500, color: '#333', type: 'pipe_v' }, 
    { x: 280, y: 300, width: 150, height: 200, color: '#333', type: 'pipe_v' }, 
    { x: 280, y: 200, width: 470, height: 20, color: '#555', type: 'pipe_h' }, 
    { x: 750, y: 350, width: 250, height: 400, color: '#1a1a1a', type: 'wall' }, 
    { x: 700, y: 450, width: 50, height: 150, color: '#400', type: 'valve' }, 
    { x: 450, y: 90, width: 920, height: 20, color: '#555', type: 'pipe_h' }, 
    { x: 900, y: 240, width: 100, height: 400, color: '#333', type: 'pipe_v' }, 
    { x: 1000, y: 70, width: 300, height: 900, color: '#1a1a1a', type: 'wall' }, 
];

// === NAČÍTANIE OBRÁZKOV ===
const macky = {
    dolava: new Image(),
    doprava: new Image(),
    plazeniedoprava: new Image(),
};

macky.dolava.src = 'asseti/cyber-cat main cahrakter.png';
macky.doprava.src = 'asseti/Cybermacka druhy pohlad.png';
macky.plazeniedoprava.src = 'asseti/Plaziaca macka.png';

const keys = { right: false, left: false };

// === VLASTNOSTI HRÁČA ===
let player = {
    x: 50,
    y: 475,
    width: 50,
    height: 50,
    dx: 0,
    dy: 0,
    speed: 5,
    jumpForce: 10,
    grounded: false,
    friction: 0.5,
    direction: 'doprava', // Spawn otočený doprava
    chceSaPostavit: false  // Logika pre plynulé vstávanie
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

// === POMOCNÉ FUNKCIE ===

function ziskajAktualnuTexturu() {
    if (player.height === 25) {
        return macky.plazeniedoprava; 
    }
    // Ak sa pozerá doprava, vráť obrázok 'doprava'
    return (player.direction === 'doprava') ? macky.dolava : macky.doprava;
}
function mozeSaPostavit() {
    const buducaVyska = 50;
    const buduceY = player.y - 25; // Simulujeme posun hlavy hore
    
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
    if (e.key === 'ArrowRight' || e.key === 'd'|| e.key === 'D') {
        keys.right = true;
        player.direction = 'doprava';
    }
    if (e.key === 'ArrowLeft' || e.key === 'a'|| e.key === 'A') {
        keys.left = true;
        player.direction = 'dolava';
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

    if ((e.key === 'ArrowDown' || e.key === 's'|| e.key === 'S'|| e.key === 'Shift')) {
        player.height = 25;
        player.chceSaPostavit = false;
    }
});

window.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') keys.right = false;
    if (e.key === 'ArrowLeft' || e.key === 'a'|| e.key === 'A') keys.left = false;
    if (e.key === 'ArrowDown' || e.key === 's'|| e.key === 'S'|| e.key === 'Shift') {
        player.chceSaPostavit = true; 
    }
});
let lastTime = 0;
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
        else if (p.type === 'wall') drawRealServer(p);
        else if (p.type === 'pipe_v') drawRealPipe(p, true);
        else if (p.type === 'pipe_h') drawRealPipe(p, false);
        else if (p.type === 'valve') {
            c.fillStyle = '#400';
            c.fillRect(p.x, p.y, p.width, p.height);
            c.fillStyle = '#600';
            c.fillRect(p.x + 5, p.y + 20, 10, 10);
        }
    });

    // 3. Pohyb a fyzika
    if (keys.right) player.dx += player.speed;
    else if (keys.left) player.dx += -player.speed;
    else player.dx = 0;

    player.dx *= player.friction;
    player.x += player.dx;
    player.dy += gravitacia;
    player.y += player.dy;
    player.grounded = false;

    // 4. Kolízie
    platforms.forEach(platform => {
        if (isTouching(player, platform)) {
            if (player.dy > 0 && (player.y + player.height - player.dy) <= platform.y) {
                player.y = platform.y - player.height;
                player.dy = 0;
                player.grounded = true;
            }
            else if (player.dx > 0 && (player.x + player.width - player.dx) <= platform.x) {
                player.x = platform.x - player.width;
            }
            else if (player.dx < 0 && (player.x - player.dx) >= platform.x + platform.width) {
                player.x = platform.x + platform.width;
            }
            else if (player.dy < 0 && (player.y - player.dy) >= platform.y + platform.height) {
                player.y = platform.y + platform.height;
                player.dy = 0;
            }
            if (isTouching(player, exitZone)) {
                ProgresManazer.ulozLevel(2); // Odomkne level 6 v pamäti
                window.location.href = "SerWers/Level2/Level2.html";
            }
        }
    });

    // KONTROLA VSTÁVANIA (Mimo cyklu kolízií pre plynulosť)
    if (player.chceSaPostavit && player.height === 25) {
        if (mozeSaPostavit()) {
            player.height = 50;
            player.y -= 25; 
            player.chceSaPostavit = false;
        }
    }

    // 5. PRECHOD DO ĎALŠIEHO LEVELU
    if (isTouching(player, exitZone)) {
        window.location.href = "SerWers/Level2/level2.html";
    }

  // 6. Vykreslenie postavy
  const aktImg = ziskajAktualnuTexturu();
    
  if (aktImg && aktImg.complete && aktImg.naturalWidth !== 0) {
      if (player.height === 25) {
          // PLAZENIE: 
          // Namiesto 50x25 ju vykreslíme napr. 90x30
          c.drawImage(aktImg, player.x - 20, player.y - 5, 100, 40);
      } else {
          // STÁTIE: Klasických 50x50
          c.drawImage(aktImg, player.x, player.y, player.width, player.height);
      }
  } else {
      c.fillStyle = 'red';
      c.fillRect(player.x, player.y, player.width, player.height);
  }
}

animovanie();