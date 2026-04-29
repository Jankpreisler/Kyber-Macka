const ProgresManazer = {
    nacitaj: function() {
        const data = localStorage.getItem('macacipurrgres');
        if (data) {
            return JSON.parse(data);
        } else {
            
            return { odomknute: 1 };
        }
    },

    ulozLevel: function(cisloLevelu) {
        let aktualnyProgres = this.nacitaj();
        
        if (cisloLevelu > aktualnyProgres.odomknute) {
            aktualnyProgres.odomknute = cisloLevelu;
            localStorage.setItem('macacipurrgres', JSON.stringify(aktualnyProgres));
            console.log(`Progres uložený: Level ${cisloLevelu} odomknutý.`);
        }
    },

    skontrolujPristup: function(cisloLevelu) {
        let aktualnyProgres = this.nacitaj();
        if (aktualnyProgres.odomknute < cisloLevelu) {
            alert("Tento level ešte nemáš odomknutý!");
            window.location.href = "index.html"; 
        }
    }
};