// === VLASTNOSTI HRÁČA ===
let player = {
    x: 50,
    y: 475,
    width: 50, 
    height: 50,
    dx: 0, 
    dy: 0, 
    speed: 3, 
    jumpForce: 10,
    grounded: false
};


// === OVLÁDANIE ===
window.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight' || e.key === 'd'){ keys.right = true; actualnaakciacici = macky.dolava; } 
    if (e.key === 'ArrowLeft' || e.key === 'a') { keys.left = true; actualnaakciacici = macky.doprava; }
    if ((e.key === 'ArrowUp' || e.key === 'w') && player.grounded) {
        player.dy = -player.jumpForce;
        player.grounded = false;
    }
    if ((e.key === 'ArrowDown' || e.key === 's') && player.grounded) {
        player.height = 25;
        player.grounded = false;
        actualnaakciacici = macky.plazeniedoprava;
    }
});

window.addEventListener('keyup', (e) => {
    
    if (e.key === 'ArrowRight' || e.key === 'd') keys.right = false;
    if (e.key === 'ArrowLeft' || e.key === 'a') keys.left = false;
    if ((e.key === 'ArrowDown' || e.key === 's') && player.grounded) {
        player.height = 50;
        player.y -= 25;
        actualnaakciacici = macky.doprava;
    }
});


// 3. Pohyb a Fyzika
if (keys.right) player.dx = player.speed;
else if (keys.left) player.dx = -player.speed;
else player.dx = 0;

player.x += player.dx;
player.dy += gravitacia;
player.y += player.dy;
player.grounded = false; 