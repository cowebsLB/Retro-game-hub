import { useEffect, useMemo, useRef, useState } from "react";

/* ──────────────────────────────────────────
   Types
────────────────────────────────────────── */

type Meteor = {
  id: number; x: number; y: number;
  vx: number; vy: number;
  radius: number; rotation: number; spin: number;
  trailAlpha: number;
};

type Spark = {
  id: number; x: number; y: number;
  value: number; radius: number;
  bobOffset: number;
};

type ShieldPickup = {
  id: number; x: number; y: number; radius: number;
  spinAngle: number;
};

type Particle = {
  id: number; x: number; y: number;
  vx: number; vy: number;
  life: number; maxLife: number;
  radius: number; color: string;
};

type TrailPoint = { x: number; y: number; life: number };

type WaveState = {
  player: {
    x: number; y: number; vx: number; vy: number;
    radius: number; health: number;
    shieldTime: number; pulseCooldown: number;
    hitFlash: number; engineFlicker: number;
  };
  meteors: Meteor[];
  sparks: Spark[];
  shieldPickup: ShieldPickup | null;
  particles: Particle[];
  playerTrail: TrailPoint[];
  stars: { x: number; y: number; speed: number; size: number; twinkle: number }[];
  score: number; highScore: number;
  combo: number; timeLeft: number; wave: number;
  gameOver: boolean; victory: boolean;
  pulseRing: number; pulseRing2: number;
  message: string;
  shakeTime: number;
  totalTime: number;
};

const W = 700;
const H = 420;
const STORAGE_KEY = "retro-game-hub-neon-meteor-best-v2";

function clamp(v: number, lo: number, hi: number) { return Math.min(Math.max(v, lo), hi); }
function randBetween(lo: number, hi: number) { return lo + Math.random() * (hi - lo); }

function makeMeteor(id: number, wave: number): Meteor {
  const radius = randBetween(10, 24);
  return {
    id,
    x: randBetween(radius, W - radius),
    y: -radius - randBetween(0, 220),
    vx: (Math.random() - 0.5) * 1.4,
    vy: 2.2 + Math.random() * 1.6 + wave * 0.22,
    radius, rotation: Math.random() * Math.PI * 2,
    spin: (Math.random() - 0.5) * 0.07,
    trailAlpha: 0.7 + Math.random() * 0.3,
  };
}

function makeSpark(id: number, wave: number): Spark {
  return {
    id,
    x: randBetween(60, W - 60),
    y: randBetween(70, H - 220),
    value: 110 + wave * 12,
    radius: 10 + Math.random() * 4,
    bobOffset: Math.random() * Math.PI * 2,
  };
}

function makeExplosion(particles: Particle[], nextId: { current: number }, cx: number, cy: number, palette: string[], count = 18) {
  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count + Math.random() * 0.4;
    const speed = randBetween(40, 180);
    particles.push({
      id: nextId.current++,
      x: cx, y: cy,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 1, maxLife: 1,
      radius: randBetween(1.5, 4.5),
      color: palette[Math.floor(Math.random() * palette.length)],
    });
  }
}

function createInitialState(): WaveState {
  const highScore = Number(window.localStorage.getItem(STORAGE_KEY) ?? "0") || 0;
  return {
    player: {
      x: W / 2, y: H - 76,
      vx: 0, vy: 0, radius: 18,
      health: 3, shieldTime: 0,
      pulseCooldown: 0, hitFlash: 0, engineFlicker: 0,
    },
    meteors: Array.from({ length: 5 }, (_, i) => makeMeteor(i + 1, 1)),
    sparks: Array.from({ length: 3 }, (_, i) => makeSpark(i + 1, 1)),
    shieldPickup: null,
    particles: [],
    playerTrail: [],
    stars: Array.from({ length: 70 }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      speed: randBetween(12, 52),
      size: randBetween(0.8, 2.4),
      twinkle: Math.random() * Math.PI * 2,
    })),
    score: 0, highScore,
    combo: 1, timeLeft: 60, wave: 1,
    gameOver: false, victory: false,
    pulseRing: 0, pulseRing2: 0,
    message: "Meteor traffic rising — stay mobile and pulse at close range.",
    shakeTime: 0, totalTime: 0,
  };
}

/* ──────────────────────────────────────────
   Component
────────────────────────────────────────── */
export function NeonMeteorRunGame() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const stateRef = useRef<WaveState | null>(null);
  const pressedKeys = useRef(new Set<string>());
  const nextId = useRef(400);
  const [hud, setHud] = useState(() => createInitialState());

  /* Key handlers */
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      pressedKeys.current.add(k);
      if (["arrowup", "arrowdown", "arrowleft", "arrowright", " ", "spacebar"].includes(k)) {
        e.preventDefault();
      }
    };
    const up = (e: KeyboardEvent) => pressedKeys.current.delete(e.key.toLowerCase());
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => { window.removeEventListener("keydown", down); window.removeEventListener("keyup", up); };
  }, []);

  /* Game loop */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    stateRef.current = createInitialState();
    setHud(stateRef.current);

    let frameId = 0;
    let prev = performance.now();
    let publishAcc = 0;

    const update = (dt: number) => {
      const s = stateRef.current!;
      if (s.gameOver || s.victory) return;

      s.totalTime += dt;
      s.timeLeft = Math.max(0, s.timeLeft - dt);
      s.shakeTime = Math.max(0, s.shakeTime - dt);

      if (s.timeLeft === 0) {
        s.victory = true;
        s.message = "Cabinet clear — you outlasted the final wave!";
        makeExplosion(s.particles, nextId, s.player.x, s.player.y, ["#47f5ff", "#ffd166", "#87f55b", "#ffffff"], 36);
      }

      const elapsed = 60 - s.timeLeft;
      s.wave = 1 + Math.floor(elapsed / 12);

      /* Player movement */
      const ACCEL = 440, MAX_V = 260, FRICTION = 0.88;
      const mx = +pressedKeys.current.has("arrowright") + +pressedKeys.current.has("d")
               - +pressedKeys.current.has("arrowleft") - +pressedKeys.current.has("a");
      const my = +pressedKeys.current.has("arrowdown") + +pressedKeys.current.has("s")
               - +pressedKeys.current.has("arrowup") - +pressedKeys.current.has("w");
      s.player.vx = clamp(s.player.vx + mx * ACCEL * dt, -MAX_V, MAX_V) * FRICTION;
      s.player.vy = clamp(s.player.vy + my * ACCEL * dt, -MAX_V, MAX_V) * FRICTION;
      s.player.x = clamp(s.player.x + s.player.vx * dt, 24, W - 24);
      s.player.y = clamp(s.player.y + s.player.vy * dt, 70, H - 30);
      s.player.shieldTime = Math.max(0, s.player.shieldTime - dt);
      s.player.pulseCooldown = Math.max(0, s.player.pulseCooldown - dt);
      s.player.hitFlash = Math.max(0, s.player.hitFlash - dt);
      s.player.engineFlicker = (s.totalTime * 18) % 1;
      s.pulseRing = Math.max(0, s.pulseRing - dt * 240);
      s.pulseRing2 = Math.max(0, s.pulseRing2 - dt * 180);

      /* Player trail */
      const speed = Math.hypot(s.player.vx, s.player.vy);
      if (speed > 30) {
        s.playerTrail.unshift({ x: s.player.x, y: s.player.y, life: 1 });
        if (s.playerTrail.length > 16) s.playerTrail.pop();
      }
      s.playerTrail.forEach(p => p.life -= dt * 4);
      s.playerTrail = s.playerTrail.filter(p => p.life > 0);

      /* Pulse burst */
      const wantsPulse = pressedKeys.current.has(" ") || pressedKeys.current.has("spacebar");
      if (wantsPulse && s.player.pulseCooldown === 0) {
        s.player.pulseCooldown = 3.2;
        s.pulseRing = 128;
        s.pulseRing2 = 100;
        s.message = "Pulse burst fired.";
        const remaining: Meteor[] = [];
        for (const m of s.meteors) {
          const dist = Math.hypot(m.x - s.player.x, m.y - s.player.y);
          if (dist <= 128) {
            s.score += 65 + s.wave * 10;
            s.combo += 1;
            makeExplosion(s.particles, nextId, m.x, m.y, ["#ff4fd8", "#ffd166", "#ff88e5"], 14);
          } else remaining.push(m);
        }
        while (remaining.length < 4 + s.wave) remaining.push(makeMeteor(nextId.current++, s.wave));
        s.meteors = remaining;
        pressedKeys.current.delete(" ");
        pressedKeys.current.delete("spacebar");
      }

      /* Stars */
      s.stars.forEach(star => {
        star.y += star.speed * dt;
        star.twinkle += dt * 2.5;
        if (star.y > H + 4) { star.y = -4; star.x = Math.random() * W; }
      });

      /* Meteors */
      const targetCount = 5 + s.wave;
      while (s.meteors.length < targetCount) s.meteors.push(makeMeteor(nextId.current++, s.wave));

      s.meteors = s.meteors
        .map(m => ({ ...m, x: m.x + m.vx, y: m.y + m.vy, rotation: m.rotation + m.spin }))
        .filter(m => m.y < H + m.radius * 2)
        .map(m => m.x < m.radius || m.x > W - m.radius ? { ...m, vx: m.vx * -1 } : m);

      /* Sparks */
      s.sparks = s.sparks.filter(spark => {
        const collected = Math.hypot(spark.x - s.player.x, spark.y - s.player.y) < spark.radius + s.player.radius + 2;
        if (collected) {
          s.score += spark.value * s.combo;
          s.combo = Math.min(5, s.combo + 0.4);
          s.message = `Spark collected · Combo ×${s.combo.toFixed(1)}`;
          makeExplosion(s.particles, nextId, spark.x, spark.y, ["#ffd166", "#ffe8a0", "#ffffff"], 10);
          return false;
        }
        return true;
      });
      while (s.sparks.length < 2 + Math.min(2, Math.floor(s.wave / 2)))
        s.sparks.push(makeSpark(nextId.current++, s.wave));

      /* Shield pickup */
      if (!s.shieldPickup && Math.random() < dt * 0.2) {
        s.shieldPickup = { id: nextId.current++, x: randBetween(60, W - 60), y: randBetween(80, H - 180), radius: 14, spinAngle: 0 };
      }
      if (s.shieldPickup) {
        s.shieldPickup.spinAngle += dt * 2;
        const picked = Math.hypot(s.shieldPickup.x - s.player.x, s.shieldPickup.y - s.player.y) < s.shieldPickup.radius + s.player.radius;
        if (picked) {
          s.player.shieldTime = 6;
          s.shieldPickup = null;
          s.message = "Shield charge armed — 6s of protection.";
          makeExplosion(s.particles, nextId, s.player.x, s.player.y, ["#87f55b", "#c4fab0"], 12);
        }
      }

      /* Collision */
      for (const m of s.meteors) {
        const hit = Math.hypot(m.x - s.player.x, m.y - s.player.y) < m.radius + s.player.radius - 2;
        if (!hit) continue;
        if (s.player.shieldTime > 0) {
          m.y = H + 80;
          s.score += 45;
          s.message = "Shield absorbed the impact.";
          makeExplosion(s.particles, nextId, m.x, m.y, ["#87f55b", "#47f5ff"], 8);
          continue;
        }
        if (s.player.hitFlash > 0) continue;
        s.player.health -= 1;
        s.player.hitFlash = 1.1;
        s.combo = 1;
        s.shakeTime = 0.3;
        s.message = "Hull breach — reset your line.";
        makeExplosion(s.particles, nextId, s.player.x, s.player.y, ["#ff4fd8", "#ff88e5", "#ffffff"], 16);
        if (s.player.health <= 0) {
          s.gameOver = true;
          s.message = "Signal lost — restart and ride the wave again.";
        }
      }

      /* Particles */
      s.particles.forEach(p => {
        p.x += p.vx * dt; p.y += p.vy * dt;
        p.vy += 80 * dt; // gravity
        p.life -= dt / p.maxLife * 1.4;
        p.vx *= 0.96; p.vy *= 0.96;
      });
      s.particles = s.particles.filter(p => p.life > 0);

      /* High score */
      if (s.score > s.highScore) {
        s.highScore = s.score;
        window.localStorage.setItem(STORAGE_KEY, String(s.highScore));
      }
    };

    /* ── Draw ─────────────────────────────────────────── */
    const draw = (ts: number) => {
      const s = stateRef.current!;

      /* Screen shake offset */
      const shakeAmt = s.shakeTime > 0 ? Math.sin(ts * 0.08) * s.shakeTime * 8 : 0;

      ctx.save();
      ctx.translate(shakeAmt, shakeAmt * 0.6);

      // Pitch & Roll inertial tilt skews based on ship velocities!
      const rollTilt = clamp(s.player.vx * 0.00065, -0.09, 0.09);
      ctx.translate(s.player.x, s.player.y);
      ctx.rotate(rollTilt);
      ctx.translate(-s.player.x, -s.player.y);

      /* Background */
      ctx.clearRect(-10, -10, W + 20, H + 20);
      const bg = ctx.createLinearGradient(0, 0, 0, H);
      bg.addColorStop(0, "#080514");
      bg.addColorStop(0.5, "#0e0924");
      bg.addColorStop(1, "#04020a");
      ctx.fillStyle = bg;
      ctx.fillRect(-10, -10, W + 20, H + 20);

      /* Nebula glow blobs */
      const nebulas: [number, number, string, number][] = [[W * 0.18, 80, "#ff4fd8", 220], [W * 0.78, 100, "#47f5ff", 200], [W * 0.5, H * 0.7, "#b06eff", 180]];
      for (const [nx, ny, nc, nr] of nebulas) {
        const neb = ctx.createRadialGradient(nx, ny, 8, nx, ny, nr);
        neb.addColorStop(0, nc + "24");
        neb.addColorStop(1, nc + "00");
        ctx.fillStyle = neb;
        ctx.fillRect(0, 0, W, H);
      }

      /* 3D Scrolling Grid (lower half of arena) */
      const hz = ctx.createLinearGradient(0, H * 0.45, 0, H);
      hz.addColorStop(0, "rgba(71,245,255,0)");
      hz.addColorStop(1, "rgba(71,245,255,0.18)");
      ctx.fillStyle = hz;
      ctx.fillRect(0, H * 0.45, W, H * 0.55);

      // Draw perspective grid lines
      ctx.strokeStyle = "rgba(71,245,255,0.08)";
      ctx.lineWidth = 1;
      const gridScroll = (s.totalTime * 85) % 36;
      for (let gy = H * 0.46; gy <= H; gy += 18) {
        const shiftedY = H * 0.46 + ((gy - H * 0.46 + gridScroll) % (H - H * 0.46));
        ctx.beginPath();
        ctx.moveTo(0, shiftedY);
        ctx.lineTo(W, shiftedY);
        ctx.stroke();
      }
      for (let gx = -100; gx <= W + 100; gx += 48) {
        ctx.beginPath();
        ctx.moveTo(W/2 + (gx - W/2) * 0.15, H * 0.46);
        ctx.lineTo(gx, H);
        ctx.stroke();
      }

      /* Stars with speed trails */
      s.stars.forEach(star => {
        const tw = 0.6 + Math.sin(star.twinkle) * 0.4;
        ctx.globalAlpha = tw * 0.85;
        ctx.fillStyle = "#77ecff";
        ctx.shadowColor = "#77ecff";
        ctx.shadowBlur = 4;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.globalAlpha = tw * 0.25;
        ctx.strokeStyle = "#47f5ff";
        ctx.lineWidth = star.size * 0.8;
        ctx.beginPath();
        ctx.moveTo(star.x, star.y);
        ctx.lineTo(star.x, star.y + star.speed * 0.1);
        ctx.stroke();
      });
      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;

      /* Sparks (Diamonds) */
      const sparkPulse = Math.sin(s.totalTime * 6) * 0.15 + 0.85;
      s.sparks.forEach(spark => {
        const bob = Math.sin(s.totalTime * 3.5 + spark.bobOffset) * 5;
        ctx.save();
        ctx.translate(spark.x, spark.y + bob);
        ctx.shadowColor = "#ffd166";
        ctx.shadowBlur = 24;
        
        ctx.beginPath();
        ctx.arc(0, 0, spark.radius + 6 * sparkPulse, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255,209,102,0.14)";
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(0, -spark.radius);
        ctx.lineTo(spark.radius * 0.7, 0);
        ctx.lineTo(0, spark.radius);
        ctx.lineTo(-spark.radius * 0.7, 0);
        ctx.closePath();
        ctx.fillStyle = "#ffd166";
        ctx.fill();
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.restore();
      });
      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;

      /* Shield pickup (rotating hexagonal frame) */
      if (s.shieldPickup) {
        const sp = s.shieldPickup;
        ctx.save();
        ctx.translate(sp.x, sp.y);
        ctx.rotate(sp.spinAngle);
        ctx.shadowColor = "#87f55b";
        ctx.shadowBlur = 24;
        
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
          const a = (Math.PI * 2 * i) / 6 - Math.PI / 6;
          const r = sp.radius;
          if (i === 0) ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r);
          else ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
        }
        ctx.closePath();
        ctx.fillStyle = "rgba(135,245,91,0.18)";
        ctx.fill();
        ctx.strokeStyle = "#87f55b";
        ctx.lineWidth = 2.5;
        ctx.stroke();
        
        ctx.strokeStyle = "rgba(255, 255, 255, 0.6)";
        ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(-6, 0); ctx.lineTo(6, 0); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, -6); ctx.lineTo(0, 6); ctx.stroke();
        ctx.restore();
      }

      /* Meteors (Holographic Geodesic Asteroids) */
      s.meteors.forEach(m => {
        ctx.save();
        ctx.translate(m.x, m.y);

        // Animated trail
        ctx.save();
        for (let t = 1; t <= 4; t++) {
          const tx = m.x - m.vx * t * 2.8;
          const ty = m.y - m.vy * t * 2.8;
          ctx.globalAlpha = (0.45 - t * 0.1) * m.trailAlpha;
          ctx.fillStyle = t < 2 ? "#ff4fd8" : "#b06eff";
          ctx.beginPath();
          ctx.arc(tx - m.x, ty - m.y, m.radius * (1 - t * 0.18), 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
        ctx.globalAlpha = 1;

        ctx.rotate(m.rotation);
        ctx.shadowColor = "#ff4fd8";
        ctx.shadowBlur = 24;

        // Draw geodesic asteroid vertices
        const points: {x: number, y: number}[] = [];
        const vertexCount = 7;
        for (let i = 0; i < vertexCount; i++) {
          const a = (Math.PI * 2 * i) / vertexCount;
          const r = m.radius * (i % 2 === 0 ? 1.0 : 0.72);
          points.push({ x: Math.cos(a) * r, y: Math.sin(a) * r });
        }

        ctx.beginPath();
        points.forEach((pt, idx) => {
          if (idx === 0) ctx.moveTo(pt.x, pt.y);
          else ctx.lineTo(pt.x, pt.y);
        });
        ctx.closePath();
        const mg = ctx.createRadialGradient(0, 0, 1, 0, 0, m.radius);
        mg.addColorStop(0, "#ff88e5");
        mg.addColorStop(0.6, "#ff4fd8");
        mg.addColorStop(1, "#9c1f7a");
        ctx.fillStyle = mg;
        ctx.fill();

        // 3D vector wireframe skeleton lines
        ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        points.forEach(pt => {
          ctx.moveTo(0, 0);
          ctx.lineTo(pt.x, pt.y);
        });
        ctx.stroke();
        
        ctx.beginPath();
        points.forEach((pt, idx) => {
          const nextPt = points[(idx + 2) % vertexCount];
          ctx.moveTo(pt.x, pt.y);
          ctx.lineTo(nextPt.x, nextPt.y);
        });
        ctx.strokeStyle = "rgba(255, 255, 255, 0.18)";
        ctx.stroke();
        ctx.restore();
      });
      ctx.shadowBlur = 0;

      /* Pulse rings */
      if (s.pulseRing > 0) {
        const alpha = s.pulseRing / 128;
        ctx.save();
        ctx.strokeStyle = `rgba(71,245,255,${alpha * 0.8})`;
        ctx.lineWidth = 5 * alpha;
        ctx.shadowColor = "#47f5ff";
        ctx.shadowBlur = 24 * alpha;
        ctx.beginPath();
        ctx.arc(s.player.x, s.player.y, 128 - s.pulseRing, 0, Math.PI * 2);
        ctx.stroke();
        
        ctx.strokeStyle = `rgba(176,110,255,${alpha * 0.4})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(s.player.x, s.player.y, 110 - s.pulseRing * 0.8, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      /* Player ship with twin engine exhaust and cockpit */
      {
        const p = s.player;
        ctx.save();
        ctx.translate(p.x, p.y);

        // Twin Combustion engine exhaust
        const flameLen = 15 + Math.min(22, Math.hypot(p.vx, p.vy) * 0.07) + (p.engineFlicker * 5);
        ctx.shadowColor = "#ff6b2b";
        ctx.shadowBlur = 20;

        const drawExhaust = (ox: number) => {
          ctx.save();
          ctx.translate(ox, 14);
          const exhaust = ctx.createLinearGradient(0, 0, 0, flameLen);
          exhaust.addColorStop(0, "rgba(255,230,120,0.95)");
          exhaust.addColorStop(0.3, "rgba(255,90,20,0.7)");
          exhaust.addColorStop(1, "rgba(255,20,0,0)");
          ctx.fillStyle = exhaust;
          ctx.beginPath();
          ctx.moveTo(-5, 0);
          ctx.quadraticCurveTo(-3 + p.engineFlicker * 1.5, flameLen * 0.6, 0, flameLen);
          ctx.quadraticCurveTo(3 - p.engineFlicker * 1.5, flameLen * 0.6, 5, 0);
          ctx.closePath();
          ctx.fill();
          ctx.restore();
        };
        drawExhaust(-6);
        drawExhaust(6);
        ctx.shadowBlur = 0;

        // Shield aura
        if (p.shieldTime > 0) {
          const shieldAlpha = 0.35 + Math.sin(s.totalTime * 8) * 0.15;
          ctx.beginPath();
          ctx.arc(0, 0, 29, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(135,245,91,${shieldAlpha + 0.45})`;
          ctx.lineWidth = 3;
          ctx.shadowColor = "#87f55b";
          ctx.shadowBlur = 24;
          ctx.stroke();
          ctx.shadowBlur = 0;
        }

        const hullColor = p.hitFlash > 0 ? "#ff88e5" : p.shieldTime > 0 ? "#87f55b" : "#47f5ff";
        ctx.shadowColor = hullColor;
        ctx.shadowBlur = p.shieldTime > 0 ? 28 : 18;

        // Futuristic delta fighter geometry
        const shipGrad = ctx.createLinearGradient(0, -22, 0, 18);
        shipGrad.addColorStop(0, "#ffffff");
        shipGrad.addColorStop(0.3, hullColor);
        shipGrad.addColorStop(1, p.shieldTime > 0 ? "#3aaa50" : "#1a8aa0");
        ctx.fillStyle = shipGrad;
        
        ctx.beginPath();
        ctx.moveTo(0, -24);
        ctx.lineTo(18, 14);
        ctx.lineTo(8, 8);
        ctx.lineTo(0, 13);
        ctx.lineTo(-8, 8);
        ctx.lineTo(-18, 14);
        ctx.closePath();
        ctx.fill();

        // Cockpit canopy
        ctx.beginPath();
        ctx.ellipse(0, -5, 5.5, 9.5, 0, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(180,248,255,0.7)";
        ctx.shadowColor = "#77ecff";
        ctx.shadowBlur = 10;
        ctx.fill();

        // Twin Engine pods
        ctx.shadowBlur = 0;
        ctx.fillStyle = "#ffd166";
        ctx.fillRect(-8, 10, 4, 8);
        ctx.fillRect(4, 10, 4, 8);

        // Wing accents
        ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(-12, 10); ctx.lineTo(-4, 4);
        ctx.moveTo(12, 10); ctx.lineTo(4, 4);
        ctx.stroke();
        ctx.restore();
      }

      /* Particles */
      s.particles.forEach(p => {
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius * p.life, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;

      /* Game over / victory overlay */
      if (s.gameOver || s.victory) {
        ctx.fillStyle = "rgba(5,3,14,0.85)";
        ctx.fillRect(-10, -10, W + 20, H + 20);

        const title = s.victory ? "CABINET CLEAR" : "SIGNAL LOST";
        const titleColor = s.victory ? "#47f5ff" : "#ff4fd8";
        ctx.shadowColor = titleColor;
        ctx.shadowBlur = 32;
        ctx.fillStyle = titleColor;
        ctx.font = "bold 26px 'Chakra Petch', sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(title, W / 2, H / 2 - 24);
        ctx.shadowBlur = 0;
        ctx.fillStyle = "#e8e4f4";
        ctx.font = "15px 'Chakra Petch', sans-serif";
        ctx.fillText(s.message, W / 2, H / 2 + 14);
        ctx.fillStyle = "rgba(200,196,216,0.6)";
        ctx.font = "13px 'Chakra Petch', sans-serif";
        ctx.fillText("Press Restart to try again", W / 2, H / 2 + 46);
      }

      ctx.restore();
    };

    const loop = (ts: number) => {
      const dt = Math.min((ts - prev) / 1000, 0.032);
      prev = ts;
      publishAcc += dt;
      update(dt);
      draw(ts);
      if (publishAcc > 0.1 && stateRef.current) {
        setHud({ ...stateRef.current });
        publishAcc = 0;
      }
      frameId = window.requestAnimationFrame(loop);
    };

    frameId = window.requestAnimationFrame(loop);
    return () => window.cancelAnimationFrame(frameId);
  }, []);

  const restart = () => {
    const s = createInitialState();
    stateRef.current = s;
    setHud(s);
  };

  const statusTone = useMemo(() => {
    if (hud.victory) return "text-cyan-300";
    if (hud.gameOver) return "text-pink-300";
    return "text-emerald-300";
  }, [hud.gameOver, hud.victory]);

  const integrityPct = (hud.player.health / 3) * 100;
  const pulsePct = Math.max(0, 100 - (hud.player.pulseCooldown / 3.2) * 100);
  const comboPct = Math.min(100, hud.combo * 20);
  const shieldPct = Math.min(100, (hud.player.shieldTime / 6) * 100);

  return (
    <div className="cabinet-shell space-y-4 p-4 sm:p-5">
      {/* Marquee header */}
      <div className="cabinet-marquee px-4 py-4 sm:px-5">
        <div className="relative flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="pixel-title text-[0.6rem] text-cyan-100 neon-text-cyan">Neon Meteor Run</p>
            <p className="mt-2 text-sm text-slate-400">Arcade survival · pulse bursts · shield cells · combo harvesting</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="cabinet-chip">Wave {hud.wave}</span>
            <span className="cabinet-chip">⏱ {Math.ceil(hud.timeLeft)}s</span>
          </div>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.3fr_0.7fr]">
        {/* Canvas side */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              <span className="cabinet-chip">⭐ {hud.score.toLocaleString()}</span>
              <span className="cabinet-chip">🏆 {hud.highScore.toLocaleString()}</span>
              <span className="cabinet-chip">✕{hud.combo.toFixed(1)}</span>
              <span className="cabinet-chip">{hud.player.shieldTime > 0 ? "🛡 Shielded" : "Shield Off"}</span>
            </div>
            <button
              className="btn-cyan py-2 text-sm"
              onClick={restart}
              type="button"
              id="neon-meteor-restart"
            >
              ↺ Restart
            </button>
          </div>

          <div className="cabinet-playfield">
            <div className="flex items-center justify-between border-b border-white/8 px-4 py-2.5 text-xs uppercase tracking-[0.18em] text-slate-400">
              <span>Deep Space Intercept Grid</span>
              <span className={hud.player.pulseCooldown > 0 ? "text-pink-300" : "text-cyan-300"}>
                Pulse {hud.player.pulseCooldown > 0 ? `Cooling ${hud.player.pulseCooldown.toFixed(1)}s` : "Armed ⚡"}
              </span>
            </div>
            <canvas
              aria-label="Neon Meteor Run local game arena"
              className="mx-auto block w-full max-w-[700px]"
              height={H}
              ref={canvasRef}
              width={W}
            />
          </div>

          <div className="cabinet-note">
            <p className={`text-sm font-semibold ${statusTone}`}>{hud.message}</p>
          </div>
        </div>

        {/* HUD sidebar */}
        <aside className="space-y-3 rounded-[1.5rem] border border-white/8 bg-black/20 p-4 text-sm text-slate-300">
          <p className="section-eyebrow text-cyan-200/60">Cabinet Systems</p>

          {[
            { label: "Hull Integrity", value: `${hud.player.health}/3`, pct: integrityPct, from: "#ff4fd8", to: "#ff88e5", glow: "#ff4fd8" },
            { label: "Pulse Charge", value: hud.player.pulseCooldown > 0 ? `${hud.player.pulseCooldown.toFixed(1)}s` : "Ready", pct: pulsePct, from: "#47f5ff", to: "#4488ff", glow: "#47f5ff" },
            { label: "Combo ×", value: `${hud.combo.toFixed(1)}`, pct: comboPct, from: "#ffd166", to: "#ff8c42", glow: "#ffd166" },
            { label: "Shield Charge", value: hud.player.shieldTime > 0 ? `${hud.player.shieldTime.toFixed(1)}s` : "Offline", pct: shieldPct, from: "#87f55b", to: "#47f5ff", glow: "#87f55b" },
          ].map(({ label, value, pct, from, to, glow }) => (
            <div className="cabinet-panel" key={label}>
              <div className="flex items-center justify-between gap-3">
                <p className="font-semibold text-white">{label}</p>
                <p className="text-xs">{value}</p>
              </div>
              <div className="cabinet-meter mt-3">
                <div
                  className="cabinet-meter-fill"
                  style={{
                    width: `${pct}%`,
                    background: `linear-gradient(90deg, ${from}, ${to})`,
                    color: glow,
                    boxShadow: `0 0 12px ${glow}`,
                  }}
                />
              </div>
            </div>
          ))}

          <div className="cabinet-panel">
            <p className="section-eyebrow text-cyan-200/60 mb-3">Mission Tempo</p>
            <div className="grid gap-2">
              {[
                ["Field density", `${4 + hud.wave} meteors`],
                ["Live sparks", `${hud.sparks.length}`],
                ["Threat state", hud.wave >= 4 ? "⚠ Critical" : hud.wave >= 2 ? "Rising" : "Nominal"],
              ].map(([k, v]) => (
                <div key={k} className="flex items-center justify-between gap-3 text-xs">
                  <span className="text-slate-400">{k}</span>
                  <span className="font-semibold text-slate-200">{v}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="cabinet-panel">
            <p className="font-semibold text-white mb-3">Controls</p>
            <ul className="space-y-2 text-xs text-slate-400 leading-6">
              <li>⬆⬇⬅➡ or WASD to steer</li>
              <li>Space for pulse burst (clears nearby meteors)</li>
              <li>Collect gold sparks to grow combo</li>
              <li>Grab green shields for 6s protection</li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
