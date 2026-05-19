

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
    drawDeath,
    updateRageAura,
    drawRageAura
};


})();

//================== RAGE ===================

// AURA
const rageAura = [];
const RAGE_AURA_LIFE = 22;

// PULZ
const ragePulse = [];
const RAGE_PULSE_LIFE = 18;

// ISKRY
const rageSparks = [];
const RAGE_SPARK_LIFE = 14;

// SHOCKWAVE
const rageShockwaves = [];
const RAGE_SHOCKWAVE_LIFE = 25;


function spawnRageAura(player) {
    rageAura.push({
        x: player.x + player.width / 2,
        y: player.y + player.height / 2,
        r: Math.random() * 20 + 35,
        life: RAGE_AURA_LIFE
    });
}

function spawnRagePulse(player) {
    ragePulse.push({
        x: player.x + player.width / 2,
        y: player.y + player.height / 2,
        r: 10,
        life: RAGE_PULSE_LIFE
    });
}

function spawnRageSpark(player) {
    rageSparks.push({
        x: player.x + player.width / 2,
        y: player.y + player.height / 2,
        dx: (Math.random() - 0.5) * 10,
        dy: (Math.random() - 0.5) * 10,
        life: RAGE_SPARK_LIFE
    });
}

function spawnRageShockwave(player) {
    rageShockwaves.push({
        x: player.x + player.width / 2,
        y: player.y + player.height / 2,
        r: 5,
        life: RAGE_SHOCKWAVE_LIFE
    });
}


function updateRageAura(isRaging, player) {
    if (isRaging) {
        spawnRageAura(player);

        if (Math.random() > 0.7) spawnRagePulse(player);
        if (Math.random() > 0.6) spawnRageSpark(player);
        if (Math.random() > 0.92) spawnRageShockwave(player);
    }

    // AURA
    for (let i = rageAura.length - 1; i >= 0; i--) {
        const a = rageAura[i];
        a.life--;
        a.r += 0.9;
        if (a.life <= 0) rageAura.splice(i, 1);
    }

    // PULSE
    for (let i = ragePulse.length - 1; i >= 0; i--) {
        const p = ragePulse[i];
        p.life--;
        p.r += 2.2;
        if (p.life <= 0) ragePulse.splice(i, 1);
    }

    // SPARKS
    for (let i = rageSparks.length - 1; i >= 0; i--) {
        const s = rageSparks[i];
        s.x += s.dx;
        s.y += s.dy;
        s.life--;
        if (s.life <= 0) rageSparks.splice(i, 1);
    }

    // SHOCKWAVE
    for (let i = rageShockwaves.length - 1; i >= 0; i--) {
        const sw = rageShockwaves[i];
        sw.life--;
        sw.r += 3.5;
        if (sw.life <= 0) rageShockwaves.splice(i, 1);
    }
}


function drawRageAura(ctx) {

    // AURA
    rageAura.forEach(a => {
        const alpha = a.life / RAGE_AURA_LIFE;

        const grad = ctx.createRadialGradient(
            a.x, a.y, 0,
            a.x, a.y, a.r
        );

        grad.addColorStop(0, `rgba(0, 200, 255, ${0.45 * alpha})`);
        grad.addColorStop(0.5, `rgba(0, 120, 255, ${0.25 * alpha})`);
        grad.addColorStop(1, `rgba(0, 80, 255, 0)`);

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(a.x, a.y, a.r, 0, Math.PI * 2);
        ctx.fill();
    });

    // PULSE
    ragePulse.forEach(p => {
        const alpha = p.life / RAGE_PULSE_LIFE;

        ctx.strokeStyle = `rgba(0, 255, 255, ${alpha})`;
        ctx.lineWidth = 4;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.stroke();
    });

    // SPARKS
    rageSparks.forEach(s => {
        const alpha = s.life / RAGE_SPARK_LIFE;

        ctx.fillStyle = `rgba(0, 255, 255, ${alpha})`;
        ctx.fillRect(s.x, s.y, 4, 4);
    });

    // SHOCKWAVE
    rageShockwaves.forEach(sw => {
        const alpha = sw.life / RAGE_SHOCKWAVE_LIFE;

        ctx.strokeStyle = `rgba(0, 180, 255, ${alpha})`;
        ctx.lineWidth = 6;

        ctx.beginPath();
        ctx.arc(sw.x, sw.y, sw.r, 0, Math.PI * 2);
        ctx.stroke();
    });
}
