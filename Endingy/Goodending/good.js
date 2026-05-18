const obrazky = [
            "../../asseti/Cybermacka druhy pohlad.png",
            "../../asseti/Plaziaca macka.png",
            "../../asseti/cyber-cat main cahrakter.png",
            "../../asseti/rokwel.png"
        ];
        let aktualnyIndex = 0;

        const imgElement = document.getElementById('fullscreen-image');

        imgElement.addEventListener('click', function () {
            aktualnyIndex = (aktualnyIndex + 1) % obrazky.length;
            imgElement.src = obrazky[aktualnyIndex];
            console.log(aktualnyIndex);

            if (aktualnyIndex === 3) {
                window.location.href = "/Endingy/Credits/Credits.html";
                console.log("Som tu");

            }
        });