const coreCanvas = document.getElementById('coreCanvas');
const ctx = coreCanvas.getContext('2d');

function setupCanvas() {
    coreCanvas.width = 440;
    coreCanvas.height = 440;
}
setupCanvas();

let time = 0;
function draw() {
    ctx.clearRect(0, 0, 440, 440);
    const cx = 220;
    const cy = 220;
    time += 0.02;

    ctx.shadowBlur = 15;
    ctx.shadowColor = "#00f2ff";
    ctx.lineWidth = 2;

    for(let i=0; i<5; i++) {
        ctx.strokeStyle = `rgba(0, 242, 255, ${0.8 - i*0.15})`;
        ctx.beginPath();
        let r = 80 + i*20;
        let start = i % 2 === 0 ? time : -time;
        ctx.arc(cx, cy, r, start, start + Math.PI * 1.2);
        ctx.stroke();
    }
    
    requestAnimationFrame(draw);
}
draw();

window.addEventListener('resize', setupCanvas);

function krasneprehadzovanie(url) {
    document.body.style.opacity = "0";
    document.body.style.transition = "0.4s";
    setTimeout(() => { window.location.href = url; }, 400);
}

// OPRAVENÉ SPÚŠŤANIE HUDBY
window.addEventListener('click', () => {
    const music = document.getElementById("bgMusic");
    if (music && music.paused) {
        music.play().then(() => {
            console.log("Hudba úspešne spustená");
        }).catch(err => {
            console.warn("Autoplay blokovaný:", err);
        });
    }
}, { once: true });