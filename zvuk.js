window.addEventListener('click', () => {
    const music = document.getElementById('bgMusic');
    
    // Skontrolujeme, či už náhodou nehrá, a ak nie, spustíme ju
    if (music.paused) {
        music.play().catch(error => {
            console.log("Prehliadač zablokoval zvuk:", error);
        });
    }
}, { once: true });