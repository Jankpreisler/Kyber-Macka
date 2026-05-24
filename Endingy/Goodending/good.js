const obrazky = [
    "../../asseti/good_1.png",   
    "../../asseti/good_2.png",           
    "../../asseti/good_3.png",  
    "../../asseti/good_4.png" , 
    "../../asseti/good_5.png"                       
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
