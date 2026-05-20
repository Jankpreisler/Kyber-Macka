function damagesystem(player) {
    player.hp = 100;
    player.maxhp = 100;
    player.isRaging = false;
    player.jeNezranitelny = false;
    player.casNezranitelnosti = 0;
}

const Damageudelovator = {
    uberHP: function (player, hodnota, resetPlayer) {
        if (player.hp > 0) {
            player.hp -= hodnota;

            if (player.hp <= 0) {
                player.hp = player.maxhp
                resetPlayer();
            }

        }

    },

    aktualizujNezranitelnost: function(player) {
        if (player.jeNezranitelny) {
            player.casNezranitelnosti--;
            
            // Keď čas vyprší, hráč môže opäť dostať hit
            if (player.casNezranitelnosti <= 0) {
                player.jeNezranitelny = false;
            }
        }
    },

    aktualizujRageMana: function (player, stavMana, stavMaxMana) {
        if (player.isRaging) {
            return {
                novaMana: stavMana - 0.6,
                novaMaxMana: stavMaxMana - 0.2
            };
        }
        return {
            novaMana: stavMana,
            novaMaxMana: stavMaxMana
        };
    },

    vykresliHPBar: function (player) {
        c.save();

        const barX = 1030;
        const hpY = 20;
        const barWidth = 250;
        const barHeight = 30;

        
        c.fillStyle = 'rgba(20, 20, 20, 0.8)';
        c.beginPath();
        c.roundRect(barX, hpY, barWidth, barHeight, 5); 
        c.fill();

        c.strokeStyle = '#333';
        c.lineWidth = 4;
        c.stroke();

        let percentoHP = player.hp / player.maxhp;
        if (percentoHP < 0) percentoHP = 0;

        if (percentoHP > 0) {
            let hpGrad = c.createLinearGradient(barX, 0, barX + barWidth, 0);
            hpGrad.addColorStop(0, '#990000');
            hpGrad.addColorStop(1, '#ff3333');

            
            c.fillStyle = hpGrad;
            c.beginPath();
            c.roundRect(barX + 2, hpY + 2, (barWidth - 4) * percentoHP, barHeight - 4, 3); 
            c.fill();

        
            c.fillStyle = 'rgba(255, 255, 255, 0.1)';
            c.fillRect(barX + 2, hpY + 2, (barWidth - 4) * percentoHP, (barHeight - 4) / 2);
        }

        c.fillStyle = "white";
        c.font = "bold 13px Courier New";
        c.shadowColor = "black";
        c.shadowBlur = 4;
        c.fillText(`HEALTH: ${Math.floor(player.hp)} / ${player.maxhp}`, barX + 10, hpY + 20);
        c.shadowBlur = 0;

        c.restore();
    }
};

