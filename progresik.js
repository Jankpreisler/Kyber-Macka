const ProgresManazer = {
            nacitaj: function() {
                let data = localStorage.getItem('cyber_cat_progres');
                return data ? JSON.parse(data) : { odomknute: 1 };
            },
            ulozLevel: function(level) {
                let data = this.nacitaj();
                if (level >= data.odomknute) {
                    data.odomknute = level + 1;
                    localStorage.setItem('cyber_cat_progres', JSON.stringify(data));
                    renderMenu(); // Obnoví stav tlačidiel po uložení
                }
            },
            resetujProgres: function() {
                localStorage.removeItem('cyber_cat_progres');
                window.location.reload();
            }
        };

        function renderMenu() {
            let progres = ProgresManazer.nacitaj();

            for (let i = 1; i <= 23; i++) {
                let btn = document.getElementById('lvl-' + i);
                if (btn) {
                    if (i <= progres.odomknute) {
                        btn.disabled = false;
                        if (btn.innerText.includes('🔒')) {
                            btn.innerText = btn.innerText.replace('🔒 ', '');
                        }
                    } else {
                        btn.disabled = true;
                        if (!btn.innerText.includes('🔒')) {
                            btn.innerText = '🔒 ' + btn.innerText;
                        }
                    }
                }
            }
        }

        // Akcia po kliknutí na tlačidlo levelu
        function selectLevel(levelNumber, url) {
            let progres = ProgresManazer.nacitaj();

            if (levelNumber <= progres.odomknute) {
                // Odstránili sme ukladanie progresu pri kliknutí, 
                // aby sa levely neodomkli predčasne.
                
                // Presmerovanie na zvolený súbor
                window.location.href = url;
            } else {
                alert("Tento level je zamknutý!");
            }
        }

        function resetProgress() {
            if (confirm("Naozaj chcete vymazať všetok postup?")) {
                ProgresManazer.resetujProgres();
            }
        }

        document.addEventListener('DOMContentLoaded', renderMenu);