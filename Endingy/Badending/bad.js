const obrazky = [
    "../../asseti/bad_1.png",   
    "../../asseti/bad_2.png",           
    "../../asseti/bad_3.png",  
    "../../asseti/bad_4.png" 
                    
];

let aktualnyIndex = 0;
const imgElement = document.getElementById('fullscreen-image');

imgElement.src = obrazky[aktualnyIndex];
imgElement.style.opacity = 1;

function prepniObrazok() {
    imgElement.style.opacity = 0;

    setTimeout(() => {
        aktualnyIndex = (aktualnyIndex + 1) % obrazky.length;
        imgElement.src = obrazky[aktualnyIndex];
        imgElement.style.opacity = 1;

        if (aktualnyIndex === obrazky.length - 1) {
            setTimeout(() => {
                window.location.href = "/Endingy/Credits/Credits.html";
            }, 3000);
        }
    }, 2000);
}

setInterval(prepniObrazok, 5000);
