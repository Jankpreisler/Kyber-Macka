const obrazky = [
            "../../asseti/Credits.png",
        ];
        let aktualnyIndex = 0;

        const imgElement = document.getElementById('fullscreen-image');

        imgElement.addEventListener('click', function () {
            aktualnyIndex = (aktualnyIndex + 1) % obrazky.length;
            imgElement.src = obrazky[aktualnyIndex];
            console.log(aktualnyIndex);

            if (aktualnyIndex === 0) {
                window.location.href = "/MainMenu/menu.html";
                console.log("Som tu");

            }
        });