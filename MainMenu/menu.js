const volumeBar = document.getElementById('volumeControl');

window.addEventListener('DOMContentLoaded', () => {
    const savedVolume = localStorage.getItem('gameVolume') || 0.5;
    if (music) music.volume = savedVolume;
    if (volumeBar) volumeBar.value = savedVolume;
});

if (volumeBar) {
    volumeBar.addEventListener('input', (e) => {
        const value = e.target.value;
        if (music) music.volume = value;
        
        localStorage.setItem('gameVolume', value);
    });
}

function krasneprehadzovanie(url) {
    
    const menu = document.querySelector('.menu-overlay');
    menu.classList.add('fade-out');

    setTimeout(() => {
        window.location.href = url;
    }, 500);
}

const music = document.getElementById("bgMusic");

window.addEventListener('click', () => {
    if (music.paused) {
        music.play().catch(error => {
            console.log("Autoplay bol zablokovaný, čakám na interakciu.");
        });
    }
}, { once: true }); 
