
function krasneprehadzovanie(url) {
    
    const menu = document.querySelector('.menu-overlay');
    menu.classList.add('fade-out');

    setTimeout(() => {
        window.location.href = url;
    }, 500);
}