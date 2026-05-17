

(function () {

    // DASH
    const dashSegments = [];
    const DASH_LIFE = 18;

    function spawnDash(player, facingRight) {
        const len = Math.max(40, Math.abs(player.dx) * 2);
        const dir = facingRight ? 1 : -1;

        dashSegments.push({
            x: player.x + player.width / 2,
            y: player.y + player.height / 2,
            len: len * dir,
            life: DASH_LIFE
        });
    }

    function update(player, isDashing, facingRight) {
        if (isDashing) spawnDash(player, facingRight);

        for (let i = dashSegments.length - 1; i >= 0; i--) {
            dashSegments[i].life--;
            if (dashSegments[i].life <= 0) dashSegments.splice(i, 1);
        }
    }

    function draw(ctx) {
        dashSegments.forEach(seg => {
            const alpha = seg.life / DASH_LIFE;

            const grad = ctx.createLinearGradient(
                seg.x - seg.len,
                seg.y,
                seg.x,
                seg.y
            );

            grad.addColorStop(0, 'rgba(0, 180, 255, 0)');
            grad.addColorStop(0.3, `rgba(0, 210, 255, ${0.25 * alpha})`);
            grad.addColorStop(0.6, `rgba(0, 255, 255, ${0.45 * alpha})`);
            grad.addColorStop(1, 'rgba(0, 255, 255, 0)');

            ctx.strokeStyle = grad;
            ctx.lineWidth = 16;
            ctx.lineCap = 'round';

            ctx.beginPath();
            ctx.moveTo(seg.x - seg.len, seg.y);
            ctx.lineTo(seg.x, seg.y);
            ctx.stroke();
        });
    }

    // FLY 
    const flyParticles = [];
    const FLY_LIFE = 25;

    function updateFly(isFlying, player) {
        if (isFlying) {
            flyParticles.push({
                x: player.x + player.width / 2,
                y: player.y + player.height,
                dx: (Math.random() - 0.5) * 2,
                dy: Math.random() * 2 + 1,
                life: FLY_LIFE
            });
        }

        for (let i = flyParticles.length - 1; i >= 0; i--) {
            const p = flyParticles[i];
            p.x += p.dx;
            p.y += p.dy;
            p.life--;
            if (p.life <= 0) flyParticles.splice(i, 1);
        }
    }

    function drawFly(ctx) {
        flyParticles.forEach(p => {
            const alpha = p.life / FLY_LIFE;
            ctx.fillStyle = `rgba(0,180,255,${alpha})`;
            ctx.beginPath();
            ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
            ctx.fill();
        });
    }

    function startFly(player) {
    }


    // DEATH
    const deathPieces = [];
    const DEATH_LIFE = 40;

    function triggerDeath(player) {
        deathPieces.length = 0;

        for (let i = 0; i < 25; i++) {
            deathPieces.push({
                x: player.x + player.width / 2,
                y: player.y + player.height / 2,
                dx: (Math.random() - 0.5) * 12,
                dy: (Math.random() - 0.5) * 12,
                life: DEATH_LIFE
            });
        }
    }

    function updateDeath() {
        for (let i = deathPieces.length - 1; i >= 0; i--) {
            const p = deathPieces[i];
            p.x += p.dx;
            p.y += p.dy;
            p.life--;
            if (p.life <= 0) deathPieces.splice(i, 1);
        }
    }

    function drawDeath(ctx) {
        deathPieces.forEach(p => {
            const alpha = p.life / DEATH_LIFE;
            ctx.fillStyle = `rgba(0,255,255,${alpha})`;
            ctx.fillRect(p.x, p.y, 6, 6);
        });
    }


    window.DashTrail = {
        update,
        draw,
        updateFly,
        drawFly,
        startFly,
        triggerDeath,
        updateDeath,
        drawDeath
    };

})();
