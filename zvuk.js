window.addEventListener('click', () => {
    const music = document.getElementById('bgMusic');
    const savedVolume = localStorage.getItem("gameVolume");
    if (savedVolume !== null) {
        music.volume = savedVolume;
    } else {
        music.volume = 0.5;
    }
    
    if (music.paused) {
        music.play().catch(error => {
            console.log("Prehliadač zablokoval zvuk:", error);
        });
    }
}, { once: true });