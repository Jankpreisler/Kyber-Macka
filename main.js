const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d');

canvas.width = 800;
canvas.height = 400;

const gravitacia = 0.5;


const platforms = [
    { x: 0, y: 380, width: 800, height: 20 },  //zem bordedr
    { x: 0, y: 0, width: 800, height: 1 },  // hore border
    { x: 0, y: 0, width: 1, height: 400 }, // bariera
    { x: 800, y: 0, width: 1, height: 400 }, //bariera
    { x: 0, y: 335, width:300, height: 400 }, //spawn zone
    { x: 100, y: 0, width: 100, height: 320 }, //1trupka
    { x: 200, y: 230, width: 100, height: 90 }, //1.5 trupky hore
    { x: 200, y: 150, width: 220, height: 20 },
    { x: 450, y: 270, width: 250, height: 400 }, //2 kanal
    { x: 430, y: 320, width: 20, height: 350 }, // 1vyko
    { x: 550, y: 60, width: 150, height: 400 }, // veza 2casti kanalov
    { x: 530, y: 200, width: 30, height: 200 },
    { x: 450, y: 60, width: 420, height: 20 },
    
];

let player = {
    x: 0,
    y: 0,
    width: 30,
    height: 30,
    dx: 9,
    dy: 9,
    speed: 3,
    jumpForce: 10,
    grounded: false
};

const keys = { right: false, left: false };

//tutaj mechanika na ovladanie klavesov ked stalece
window.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight' || e.key === 'd') keys.right = true;
    if (e.key === 'ArrowLeft' || e.key === 'a') keys.left = true;
    if ((e.key === 'ArrowUp' || e.key === 'w' || e.key === 'Backspace')  && player.grounded) {
        player.dy = -player.jumpForce;
        player.grounded = false;
    }
    if ((e.key === 'ArrowDown' || e.key === 's') && player.grounded) {
        player.height = 15;S
        player.grounded = false;
    }
});

// tutaj ked nie stalecene tak vratenie do origanl pose
window.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowRight' || e.key === 'd') keys.right = false;
    if (e.key === 'ArrowLeft' || e.key === 'a') keys.left = false;
    if ((e.key === 'ArrowDown' || e.key === 's') && player.grounded) {
        player.height = 30;
        player.y -= 15;
    }
});

function animovanie() {

    requestAnimationFrame(animovanie);
    c.clearRect(0, 0, canvas.width, canvas.height);

    // farbenie platforiem
    c.fillStyle = '#45a049'; 
    platforms.forEach(platform => {
        c.fillRect(platform.x, platform.y, platform.width, platform.height);
    });


    if (keys.right) player.dx = player.speed;
    else if (keys.left) player.dx = -player.speed;
    else player.dx = 0;

    player.x += player.dx;

    player.dy += gravitacia;
    player.y += player.dy;

    player.grounded = false; 

    // kolizie sa deju tu
    platforms.forEach(platform => {
    
    if (player.x < platform.x + platform.width &&
        player.x + player.width > platform.x &&
        player.y < platform.y + platform.height &&
        player.y + player.height > platform.y 
    )   {

       
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
            player.grounded = true;
            console.log("Som tu jej");
    }   }
    });

    // Zobrazenie hraca
    c.fillStyle = 'red';
    c.fillRect(player.x, player.y, player.width, player.height);
}

animovanie();