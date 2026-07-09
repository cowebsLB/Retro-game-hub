import { useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { MobileActionCluster, MobileControlDock } from "../components/MobileControlDock";

type Hazard = { id: number; lane: number; y: number; speed: number; height: number; color: string };
type Pickup = { id: number; lane: number; y: number; value: number; angle: number };
type Particle = { id: number; x: number; y: number; vx: number; vy: number; life: number; color: string; radius: number };
type RainDrop = { x: number; y: number; speed: number; length: number };

type SprintState = {
  lane: number; targetLane: number; laneBlend: number;
  hazards: Hazard[]; pickups: Pickup[]; particles: Particle[]; rain: RainDrop[];
  distance: number; bestDistance: number; integrity: number; boostCharge: number;
  boostTime: number; timeLeft: number; gameOver: boolean; victory: boolean;
  message: string; skylineOffset: number; roadOffset: number; totalTime: number; shakeTime: number;
};

const W = 700;
const H = 420;
const LANES = [175, 350, 525];
const STORAGE_KEY = "retro-game-hub-skyline-sprint-best-v2";

function randBetween(lo: number, hi: number) { return lo + Math.random() * (hi - lo); }

const HAZARD_COLORS = ["#ff4d74", "#ff6b3d", "#e040b0", "#c03060"];

function createHazard(id: number, lane: number, speedBias = 0): Hazard {
  return {
    id, lane,
    y: -160 - Math.random() * 200,
    speed: 200 + Math.random() * 80 + speedBias,
    height: 90 + Math.random() * 20,
    color: HAZARD_COLORS[Math.floor(Math.random() * HAZARD_COLORS.length)],
  };
}

function createPickup(id: number, lane: number): Pickup {
  return { id, lane, y: -100 - Math.random() * 240, value: 16 + Math.floor(Math.random() * 14), angle: 0 };
}

function randomLane() { return Math.floor(Math.random() * LANES.length); }

function drawRoundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  if (ctx.roundRect) {
    ctx.roundRect(x, y, w, h, r);
  } else {
    ctx.rect(x, y, w, h);
  }
}

function createInitialState(): SprintState {
  return {
    lane: 1, targetLane: 1, laneBlend: 1,
    hazards: Array.from({ length: 4 }, (_, i) => createHazard(i + 1, i % LANES.length)),
    pickups: Array.from({ length: 2 }, (_, i) => createPickup(i + 1, (i + 1) % LANES.length)),
    particles: [],
    rain: Array.from({ length: 60 }, () => ({ x: Math.random() * W, y: Math.random() * H, speed: randBetween(300, 500), length: randBetween(8, 18) })),
    distance: 0,
    bestDistance: Number(window.localStorage.getItem(STORAGE_KEY) ?? "0") || 0,
    integrity: 3, boostCharge: 40, boostTime: 0, timeLeft: 55,
    gameOver: false, victory: false,
    message: "Shift lanes, charge boost cells, and survive the expressway.",
    skylineOffset: 0, roadOffset: 0, totalTime: 0, shakeTime: 0,
  };
}

function makeExplosion(particles: Particle[], nextId: { current: number }, cx: number, cy: number, colors: string[], count = 14) {
  for (let i = 0; i < count; i++) {
    const a = Math.random() * Math.PI * 2;
    const spd = randBetween(40, 160);
    particles.push({ id: nextId.current++, x: cx, y: cy, vx: Math.cos(a) * spd, vy: Math.sin(a) * spd, life: 1, color: colors[Math.floor(Math.random() * colors.length)], radius: randBetween(2, 5) });
  }
}

export function SkylineSprintGame() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const stateRef = useRef<SprintState | null>(null);
  const inputRef = useRef({ left: false, right: false, boost: false, leftEdge: false, rightEdge: false });
  const gestureRef = useRef<{ pointerId: number; startX: number } | null>(null);
  const nextId = useRef(300);
  const [hud, setHud] = useState(() => createInitialState());

  const startLaneGesture = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    event.preventDefault();
    gestureRef.current = { pointerId: event.pointerId, startX: event.clientX };
    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      // Pointer capture is optional; taps and completed in-bounds swipes still work without it.
    }
  };

  const finishLaneGesture = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    const gesture = gestureRef.current;
    if (!gesture || gesture.pointerId !== event.pointerId) return;

    event.preventDefault();
    const deltaX = event.clientX - gesture.startX;
    if (Math.abs(deltaX) >= 36) {
      const state = stateRef.current;
      if (state && !state.gameOver && !state.victory) {
        const direction = deltaX < 0 ? -1 : 1;
        state.targetLane = Math.min(LANES.length - 1, Math.max(0, state.targetLane + direction));
        state.laneBlend = 0;
      }
    } else {
      const state = stateRef.current;
      const bounds = event.currentTarget.getBoundingClientRect();
      const tappedLane = Math.min(
        LANES.length - 1,
        Math.max(0, Math.floor(((event.clientX - bounds.left) / bounds.width) * LANES.length)),
      );
      if (state && !state.gameOver && !state.victory && tappedLane !== state.targetLane) {
        state.targetLane = tappedLane;
        state.laneBlend = 0;
      }
    }

    gestureRef.current = null;
  };

  const cancelLaneGesture = () => {
    gestureRef.current = null;
  };

  useEffect(() => {
    const onDown = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (["arrowleft", "arrowright", "arrowup", "arrowdown", " ", "spacebar"].includes(k)) {
        e.preventDefault();
      }
      if ((k === "arrowleft" || k === "a") && !inputRef.current.leftEdge) { inputRef.current.left = true; inputRef.current.leftEdge = true; }
      if ((k === "arrowright" || k === "d") && !inputRef.current.rightEdge) { inputRef.current.right = true; inputRef.current.rightEdge = true; }
      if (k === "arrowup" || k === "w" || k === " ") { inputRef.current.boost = true; }
    };
    const onUp = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (k === "arrowleft" || k === "a") { inputRef.current.left = false; inputRef.current.leftEdge = false; }
      if (k === "arrowright" || k === "d") { inputRef.current.right = false; inputRef.current.rightEdge = false; }
      if (k === "arrowup" || k === "w" || k === " ") inputRef.current.boost = false;
    };
    window.addEventListener("keydown", onDown);
    window.addEventListener("keyup", onUp);
    return () => { window.removeEventListener("keydown", onDown); window.removeEventListener("keyup", onUp); };
  }, []);

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
      if (s.timeLeft === 0) { s.victory = true; s.message = "Night route cleared. Dispatch logged your clean finish!"; }

      if (inputRef.current.left) { s.targetLane = Math.max(0, s.targetLane - 1); s.laneBlend = 0; inputRef.current.left = false; }
      if (inputRef.current.right) { s.targetLane = Math.min(LANES.length - 1, s.targetLane + 1); s.laneBlend = 0; inputRef.current.right = false; }
      s.laneBlend = Math.min(1, s.laneBlend + dt * 8);
      if (s.laneBlend >= 1) s.lane = s.targetLane;

      const boosting = inputRef.current.boost && s.boostCharge > 6;
      const baseSpeed = boosting ? 360 : 250;
      s.boostTime = boosting ? Math.min(5, s.boostTime + dt) : Math.max(0, s.boostTime - dt * 1.5);
      s.boostCharge = boosting ? Math.max(0, s.boostCharge - dt * 26) : Math.min(100, s.boostCharge + dt * 11);
      s.distance += baseSpeed * dt * 0.65;
      s.skylineOffset = (s.skylineOffset + baseSpeed * dt * 0.09) % W;
      s.roadOffset = (s.roadOffset + baseSpeed * dt * 0.38) % 64;

      s.rain.forEach(r => {
        r.y += r.speed * dt;
        r.x -= r.speed * dt * 0.15;
        if (r.y > H + 20) { r.y = -20; r.x = Math.random() * W; }
        if (r.x < -10) r.x = W;
      });

      const speedBias = Math.floor(s.distance / 180);
      const laneX = LANES[s.lane] + (LANES[s.targetLane] - LANES[s.lane]) * (1 - s.laneBlend);

      s.hazards = s.hazards.map(h => ({ ...h, y: h.y + (h.speed + speedBias * 12) * dt })).filter(h => {
        if (h.y > H + 180) return false;
        const overlaps = Math.abs(LANES[h.lane] - laneX) < 70 && h.y + h.height > 280 && h.y < 380;
        if (overlaps) {
          s.integrity -= 1; s.shakeTime = 0.35;
          s.message = "Traffic breach — recenter and build speed again.";
          makeExplosion(s.particles, nextId, LANES[h.lane], 330, ["#ff4d74", "#ff8888", "#ffd166"]);
          h.y = H + 300;
          if (s.integrity <= 0) { s.gameOver = true; s.message = "Chassis wrecked. Restart the night shift."; }
        }
        return true;
      });
      while (s.hazards.length < 4) s.hazards.push(createHazard(nextId.current++, randomLane(), speedBias * 5));

      s.pickups = s.pickups.map(p => ({ ...p, y: p.y + (baseSpeed + 24) * dt, angle: p.angle + dt * 3.5 })).filter(p => {
        if (p.y > H + 100) return false;
        const collected = Math.abs(LANES[p.lane] - laneX) < 60 && p.y + 36 > 295 && p.y < 375;
        if (collected) {
          s.boostCharge = Math.min(100, s.boostCharge + p.value);
          s.distance += p.value * 3;
          s.message = "Energy cell absorbed — boost bank charged.";
          makeExplosion(s.particles, nextId, LANES[p.lane], p.y + 18, ["#6fffd8", "#47f5ff", "#c4fab0"]);
          return false;
        }
        return true;
      });
      while (s.pickups.length < 2) s.pickups.push(createPickup(nextId.current++, randomLane()));

      s.particles.forEach(p => { p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 100 * dt; p.life -= dt * 1.6; p.vx *= 0.95; p.vy *= 0.95; });
      s.particles = s.particles.filter(p => p.life > 0);

      if (s.distance > s.bestDistance) { s.bestDistance = Math.floor(s.distance); window.localStorage.setItem(STORAGE_KEY, String(s.bestDistance)); }
    };

    const draw = (ts: number) => {
      const s = stateRef.current!;
      const shakeX = s.shakeTime > 0 ? Math.sin(ts * 0.1) * s.shakeTime * 9 : 0;
      const shakeY = s.shakeTime > 0 ? Math.cos(ts * 0.08) * s.shakeTime * 5 : 0;
      ctx.save();
      ctx.translate(shakeX, shakeY);
      ctx.clearRect(-10, -10, W + 20, H + 20);

      // 1. Sky Gradient (fuchsia to dark space purple)
      const sky = ctx.createLinearGradient(0, 0, 0, H);
      sky.addColorStop(0, "#080512");
      sky.addColorStop(0.35, "#1d0c35");
      sky.addColorStop(0.6, "#3c0f4f");
      ctx.fillStyle = sky;
      ctx.fillRect(-10, -10, W + 20, H + 20);

      // 2. Synthwave Horizon Sun (with horizontal scanline slice gaps)
      const sunX = W / 2;
      const sunY = 146;
      const sunRadius = 65;
      ctx.save();
      ctx.beginPath();
      ctx.arc(sunX, sunY, sunRadius, 0, Math.PI * 2);
      ctx.clip();
      
      const sunGrad = ctx.createLinearGradient(0, sunY - sunRadius, 0, sunY + sunRadius);
      sunGrad.addColorStop(0, "#ffd166");
      sunGrad.addColorStop(0.5, "#ff8c42");
      sunGrad.addColorStop(1, "#ff4fd8");
      ctx.fillStyle = sunGrad;
      ctx.fillRect(sunX - sunRadius - 5, sunY - sunRadius - 5, sunRadius * 2 + 10, sunRadius * 2 + 10);
      
      ctx.fillStyle = "#0c0818";
      for (let sy = sunY - sunRadius; sy < sunY + sunRadius; sy += 8) {
        const gapRatio = (sy - (sunY - sunRadius)) / (sunRadius * 2);
        const gapHeight = Math.max(1, gapRatio * 4.5);
        ctx.fillRect(sunX - sunRadius - 10, sy, sunRadius * 2 + 20, gapHeight);
      }
      ctx.restore();

      // Sun Glow Aura
      const sunGlow = ctx.createRadialGradient(sunX, sunY, 10, sunX, sunY, sunRadius * 1.5);
      sunGlow.addColorStop(0, "rgba(255, 79, 216, 0.2)");
      sunGlow.addColorStop(1, "rgba(255, 79, 216, 0)");
      ctx.fillStyle = sunGlow;
      ctx.beginPath();
      ctx.arc(sunX, sunY, sunRadius * 1.5, 0, Math.PI * 2);
      ctx.fill();

      // 3. Synthwave Wireframe Mountains (Background)
      ctx.strokeStyle = "rgba(176, 110, 255, 0.16)";
      ctx.lineWidth = 1;
      const drawMountain = (mx: number, my: number, mw: number, mh: number) => {
        ctx.beginPath();
        ctx.moveTo(mx - mw / 2, my);
        ctx.lineTo(mx, my - mh);
        ctx.lineTo(mx + mw / 2, my);
        ctx.stroke();
        for (let j = 1; j < 5; j++) {
          const ratio = j / 5;
          ctx.beginPath();
          ctx.moveTo(mx - (mw / 2) * (1 - ratio), my);
          ctx.lineTo(mx, my - mh * (1 - ratio));
          ctx.lineTo(mx + (mw / 2) * (1 - ratio), my);
          ctx.stroke();
        }
      };
      drawMountain(W * 0.22, 146, 180, 52);
      drawMountain(W * 0.78, 146, 220, 68);

      // 4. Parallax City Skyline
      for (let i = 0; i < 9; i++) {
        const bx = ((i * 96 - s.skylineOffset * 0.6 + W * 2) % (W + 160)) - 80;
        const bh = 45 + ((i * 29) % 55);
        const bw = 38 + (i % 3) * 8;
        const baseY = 146;
        
        ctx.fillStyle = "rgba(12, 8, 24, 0.95)";
        ctx.fillRect(bx, baseY - bh, bw, bh);
        ctx.strokeStyle = "rgba(71, 245, 255, 0.15)";
        ctx.lineWidth = 1;
        ctx.strokeRect(bx, baseY - bh, bw, bh);

        // Windows
        ctx.fillStyle = `rgba(71, 245, 255, ${0.15 + (i % 4) * 0.1})`;
        for (let r = 0; r < bh - 10; r += 8) {
          for (let c = 4; c < bw - 4; c += 8) {
            if ((i * 3 + r * 2 + c) % 4 === 0) {
              ctx.fillRect(bx + c, baseY - bh + 6 + r, 2, 2);
            }
          }
        }
      }

      // 5. Road Surface (pseudo-3D perspective grid)
      const roadPath = new Path2D();
      roadPath.moveTo(220, 146);
      roadPath.lineTo(W - 220, 146);
      roadPath.lineTo(W - 10, H);
      roadPath.lineTo(10, H);
      roadPath.closePath();
      
      const roadGrad = ctx.createLinearGradient(0, 146, 0, H);
      roadGrad.addColorStop(0, "#080512");
      roadGrad.addColorStop(0.3, "#0e091d");
      roadGrad.addColorStop(1, "#05030a");
      ctx.fillStyle = roadGrad;
      ctx.fill(roadPath);

      // Wet Sheen & Reflected Neon Lights
      const sheen = ctx.createLinearGradient(W/2 - 100, 146, W/2 + 100, H);
      sheen.addColorStop(0, "rgba(255, 79, 216, 0.05)");
      sheen.addColorStop(0.5, "rgba(71, 245, 255, 0.08)");
      sheen.addColorStop(1, "rgba(255, 79, 216, 0.05)");
      ctx.fillStyle = sheen;
      ctx.fill(roadPath);

      // 6. Perspective Road Grids
      ctx.save();
      ctx.clip(roadPath);
      
      ctx.strokeStyle = "rgba(71, 245, 255, 0.15)";
      ctx.lineWidth = 1;
      const speedParam = s.roadOffset / 64;
      for (let i = 0; i < 15; i++) {
        const t = (i + speedParam) / 15;
        const gy = 146 + Math.pow(t, 2.2) * (H - 146);
        ctx.beginPath();
        ctx.moveTo(0, gy);
        ctx.lineTo(W, gy);
        ctx.stroke();
      }

      ctx.strokeStyle = "rgba(71, 245, 255, 0.12)";
      const lStep = 100;
      for (let lx = -200; lx <= W + 200; lx += lStep) {
        ctx.beginPath();
        ctx.moveTo(W / 2 + (lx - W / 2) * 0.1, 146);
        ctx.lineTo(lx, H);
        ctx.stroke();
      }
      ctx.restore();

      // Neon road borders (glowing rails)
      ctx.strokeStyle = "rgba(255, 79, 216, 0.6)";
      ctx.shadowColor = "#ff4fd8";
      ctx.shadowBlur = 12;
      ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.moveTo(220, 146); ctx.lineTo(10, H); ctx.stroke();
      ctx.strokeStyle = "rgba(71, 245, 255, 0.6)";
      ctx.shadowColor = "#47f5ff";
      ctx.beginPath(); ctx.moveTo(W - 220, 146); ctx.lineTo(W - 10, H); ctx.stroke();
      ctx.shadowBlur = 0;

      // Lane dividers (scrolling dashed lines)
      ctx.save();
      ctx.clip(roadPath);
      ctx.setLineDash([25, 20]);
      ctx.lineDashOffset = -s.roadOffset * 1.8;
      ctx.strokeStyle = "rgba(255, 230, 100, 0.4)";
      ctx.lineWidth = 2;
      [-65, 65].forEach(offset => {
        ctx.beginPath();
        ctx.moveTo(W/2 + offset * 0.15, 146);
        ctx.lineTo(W/2 + offset * 2.3, H);
        ctx.stroke();
      });
      ctx.setLineDash([]);
      ctx.restore();

      // Rain
      ctx.globalAlpha = 0.15;
      ctx.strokeStyle = "#aadeff";
      ctx.lineWidth = 1;
      s.rain.forEach(r => {
        ctx.beginPath(); ctx.moveTo(r.x, r.y); ctx.lineTo(r.x - 2, r.y + r.length); ctx.stroke();
      });
      ctx.globalAlpha = 1;

      // 7. Hazards
      s.hazards.forEach(h => {
        const hx = LANES[h.lane];
        const yPct = (h.y - 60) / (H - 60);
        const scale = Math.max(0.18, 0.45 + yPct * 0.55);
        const carW = 82 * scale;
        const carH = h.height * scale;

        // Headlight cones
        ctx.save();
        const coneGrad = ctx.createLinearGradient(hx, h.y + carH, hx, h.y + carH + 70 * scale);
        coneGrad.addColorStop(0, "rgba(255, 240, 150, 0.28)");
        coneGrad.addColorStop(1, "rgba(255, 240, 150, 0)");
        ctx.fillStyle = coneGrad;
        ctx.beginPath();
        ctx.moveTo(hx - carW * 0.3, h.y + carH);
        ctx.lineTo(hx - carW * 0.6, h.y + carH + 70 * scale);
        ctx.lineTo(hx + carW * 0.6, h.y + carH + 70 * scale);
        ctx.lineTo(hx + carW * 0.3, h.y + carH);
        ctx.closePath();
        ctx.fill();
        ctx.restore();

        // Shadow
        ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
        ctx.beginPath();
        drawRoundRect(ctx, hx - carW / 2 + 3, h.y + 3, carW, carH, 6 * scale);
        ctx.fill();

        // Car Body
        ctx.save();
        const cg = ctx.createLinearGradient(hx - carW / 2, h.y, hx + carW / 2, h.y);
        cg.addColorStop(0, h.color + "cc");
        cg.addColorStop(0.5, h.color);
        cg.addColorStop(1, h.color + "99");
        ctx.fillStyle = cg;
        ctx.beginPath();
        drawRoundRect(ctx, hx - carW / 2, h.y, carW, carH, 6 * scale);
        ctx.fill();
        
        ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
        ctx.fillRect(hx - carW * 0.4, h.y + 4, carW * 0.8, 6 * scale);

        // Windshield
        ctx.fillStyle = "rgba(10, 12, 24, 0.8)";
        ctx.beginPath();
        ctx.moveTo(hx - carW * 0.3, h.y + carH * 0.25);
        ctx.lineTo(hx + carW * 0.3, h.y + carH * 0.25);
        ctx.lineTo(hx + carW * 0.22, h.y + carH * 0.42);
        ctx.lineTo(hx - carW * 0.22, h.y + carH * 0.42);
        ctx.closePath();
        ctx.fill();

        // Rear window grill lines
        ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
        ctx.lineWidth = 1;
        for (let ly = h.y + carH * 0.55; ly < h.y + carH * 0.75; ly += 4 * scale) {
          ctx.beginPath(); ctx.moveTo(hx - carW * 0.3, ly); ctx.lineTo(hx + carW * 0.3, ly); ctx.stroke();
        }

        // Headlights
        ctx.shadowColor = "#ffeb80";
        ctx.shadowBlur = 12 * scale;
        ctx.fillStyle = "#ffeb60";
        ctx.fillRect(hx - carW * 0.38, h.y + carH - 10, 12 * scale, 6 * scale);
        ctx.fillRect(hx + carW * 0.38 - 12 * scale, h.y + carH - 10, 12 * scale, 6 * scale);

        // Taillights
        ctx.shadowColor = "#ff2255";
        ctx.shadowBlur = 8 * scale;
        ctx.fillStyle = "#ff2244";
        ctx.fillRect(hx - carW * 0.38, h.y + 3, 10 * scale, 4 * scale);
        ctx.fillRect(hx + carW * 0.38 - 10 * scale, h.y + 3, 10 * scale, 4 * scale);
        ctx.restore();
      });

      // 8. Pickups
      s.pickups.forEach(p => {
        const pyPct = (p.y - 60) / (H - 60);
        const scale = Math.max(0.18, 0.5 + pyPct * 0.5);
        const px = LANES[p.lane];
        ctx.save();
        ctx.translate(px, p.y + 18);
        ctx.rotate(p.angle);
        ctx.shadowColor = "#6fffd8";
        ctx.shadowBlur = 18;
        ctx.strokeStyle = "#6fffd8";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, -18 * scale); ctx.lineTo(14 * scale, 0); ctx.lineTo(0, 18 * scale); ctx.lineTo(-14 * scale, 0);
        ctx.closePath();
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(0, 0, 7 * scale, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(111, 255, 216, 0.4)";
        ctx.fill();
        ctx.restore();
      });

      // 9. Player cybercar
      const playerX = LANES[s.lane] + (LANES[s.targetLane] - LANES[s.lane]) * (1 - Math.min(1, Math.max(0, s.laneBlend)));
      const carY = 300;
      const isBoost = s.boostTime > 0.1;

      // Exhaust flame
      ctx.save();
      const jetLen = isBoost ? 45 + Math.sin(s.totalTime * 30) * 12 : 12 + Math.sin(s.totalTime * 20) * 4;
      const jetGrad = ctx.createLinearGradient(0, carY + 95, 0, carY + 95 + jetLen);
      jetGrad.addColorStop(0, isBoost ? "#5cf2ff" : "#ff4fd8");
      jetGrad.addColorStop(1, "rgba(71,245,255,0)");
      ctx.fillStyle = jetGrad;
      ctx.shadowColor = isBoost ? "#47f5ff" : "#ff4fd8";
      ctx.shadowBlur = isBoost ? 24 : 12;
      ctx.beginPath();
      ctx.moveTo(playerX - 16, carY + 95);
      ctx.lineTo(playerX, carY + 95 + jetLen);
      ctx.lineTo(playerX + 16, carY + 95);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      // Cybercar Body
      ctx.save();
      const pColor = isBoost ? "#5cf2ff" : "#ffd166";
      ctx.fillStyle = pColor;
      ctx.shadowColor = pColor;
      ctx.shadowBlur = isBoost ? 22 : 12;
      ctx.beginPath();
      drawRoundRect(ctx, playerX - 44, carY, 88, 100, 8);
      ctx.fill();

      // Cockpit
      ctx.fillStyle = "rgba(15, 12, 35, 0.9)";
      ctx.beginPath();
      ctx.moveTo(playerX - 22, carY + 12);
      ctx.lineTo(playerX + 22, carY + 12);
      ctx.lineTo(playerX + 16, carY + 54);
      ctx.lineTo(playerX - 16, carY + 54);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "rgba(71, 245, 255, 0.4)";
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(playerX - 12, carY + 18); ctx.lineTo(playerX - 6, carY + 48); ctx.stroke();

      // Wing accents
      ctx.strokeStyle = isBoost ? "rgba(255, 255, 255, 0.8)" : "rgba(255, 79, 216, 0.8)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(playerX - 36, carY + 80);
      ctx.lineTo(playerX - 28, carY + 68);
      ctx.lineTo(playerX + 28, carY + 68);
      ctx.lineTo(playerX + 36, carY + 80);
      ctx.stroke();

      // Headlights
      ctx.fillStyle = "#ffffff";
      ctx.shadowColor = "#ffffff";
      ctx.shadowBlur = 18;
      ctx.fillRect(playerX - 32, carY + 4, 10, 22);
      ctx.fillRect(playerX + 22, carY + 4, 10, 22);

      // Taillights
      ctx.strokeStyle = "#ff2244";
      ctx.shadowColor = "#ff2244";
      ctx.shadowBlur = 12;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(playerX - 36, carY + 92);
      ctx.lineTo(playerX + 36, carY + 92);
      ctx.stroke();
      ctx.restore();

      // 10. Particles
      s.particles.forEach(p => {
        ctx.globalAlpha = Math.max(0, p.life); ctx.fillStyle = p.color; ctx.shadowColor = p.color; ctx.shadowBlur = 10;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.radius * p.life, 0, Math.PI * 2); ctx.fill();
      });
      ctx.globalAlpha = 1; ctx.shadowBlur = 0;

      // 11. Overlay Banner
      if (s.gameOver || s.victory) {
        ctx.fillStyle = "rgba(6,3,12,0.86)"; ctx.fillRect(-10, -10, W + 20, H + 20);
        const oc = s.victory ? "#5cf2ff" : "#ff4d74";
        ctx.shadowColor = oc; ctx.shadowBlur = 28; ctx.fillStyle = oc;
        ctx.font = "bold 26px 'Chakra Petch', sans-serif"; ctx.textAlign = "center";
        ctx.fillText(s.victory ? "ROUTE CLEARED" : "ROUTE LOST", W / 2, H / 2 - 22); ctx.shadowBlur = 0;
        ctx.fillStyle = "#e8e0f8"; ctx.font = "15px 'Chakra Petch', sans-serif";
        ctx.fillText(s.message, W / 2, H / 2 + 14);
      }
      ctx.restore();
    };

    const loop = (ts: number) => {
      const dt = Math.min((ts - prev) / 1000, 0.032); prev = ts; publishAcc += dt;
      update(dt); draw(ts);
      if (publishAcc >= 0.1 && stateRef.current) { setHud({ ...stateRef.current }); publishAcc = 0; }
      frameId = window.requestAnimationFrame(loop);
    };
    frameId = window.requestAnimationFrame(loop);
    return () => window.cancelAnimationFrame(frameId);
  }, []);

  const restart = () => { const s = createInitialState(); stateRef.current = s; setHud(s); };

  const statusTone = useMemo(() => {
    if (hud.victory) return "text-cyan-300";
    if (hud.gameOver) return "text-pink-300";
    return "text-amber-200";
  }, [hud.gameOver, hud.victory]);

  const boostPct = Math.round(hud.boostCharge);
  const integrityPct = (hud.integrity / 3) * 100;
  const finishPct = Math.min(100, ((55 - hud.timeLeft) / 55) * 100);

  return (
    <div className="cabinet-shell space-y-4 p-4 sm:p-5">
      <div className="cabinet-marquee px-4 py-4 sm:px-5">
        <div className="relative flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="pixel-title text-[0.6rem] text-fuchsia-100 neon-text-pink">Skyline Sprint GX</p>
            <p className="mt-2 text-sm text-slate-400">Neon expressway · lane shifts · boost burn · rain-slick traffic</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="cabinet-chip">Lane {hud.targetLane + 1}/3</span>
            <span className="cabinet-chip">⏱ {Math.ceil(hud.timeLeft)}s</span>
          </div>
        </div>
      </div>
      <div className="grid gap-4 xl:grid-cols-[1.3fr_0.7fr]">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              <span className="cabinet-chip">📏 {Math.floor(hud.distance)}m</span>
              <span className="cabinet-chip">🏆 {hud.bestDistance}m</span>
              <span className="cabinet-chip">⚡ {boostPct}%</span>
            </div>
            <button className="btn-pink py-2 text-sm" onClick={restart} type="button" id="skyline-restart">↺ Restart</button>
          </div>
          <div className="cabinet-playfield">
            <div className="flex items-center justify-between border-b border-white/8 px-4 py-2.5 text-xs uppercase tracking-[0.18em] text-slate-400">
              <span>Night Expressway Feed</span>
              <span className={hud.boostTime > 0.1 ? "text-cyan-300" : "text-slate-400"}>{hud.boostTime > 0.1 ? "🚀 Boost Live" : "Cruise Mode"}</span>
            </div>
            <canvas
              aria-description="Swipe left or right, or tap a road lane, to steer."
              aria-label="Skyline Sprint GX playfield"
              className="mx-auto block w-full max-w-[700px] touch-none"
              height={H}
              onPointerCancel={cancelLaneGesture}
              onPointerDown={startLaneGesture}
              onPointerUp={finishLaneGesture}
              ref={canvasRef}
              width={W}
            />
          </div>
          <MobileControlDock instruction="Swipe or tap lanes in the playfield" title="Touch steering">
            <MobileActionCluster
              actions={[
                {
                  label: "Hold boost",
                  onPress: () => { inputRef.current.boost = true; },
                  onPressEnd: () => { inputRef.current.boost = false; },
                  tone: "pink",
                },
              ]}
            />
          </MobileControlDock>
          <div className="cabinet-note"><p className={`text-sm font-semibold ${statusTone}`}>{hud.message}</p></div>
        </div>
        <aside className="space-y-3 rounded-[1.5rem] border border-white/8 bg-black/20 p-4 text-sm text-slate-300">
          <p className="section-eyebrow text-fuchsia-200/60">Dashboard</p>
          {[
            { label: "Boost Reserve", value: `${boostPct}%`, pct: boostPct, from: "#5cf2ff", to: "#b06eff", glow: "#5cf2ff" },
            { label: "Chassis Integrity", value: `${hud.integrity}/3`, pct: integrityPct, from: "#ff4d74", to: "#ff8c42", glow: "#ff4d74" },
            { label: "Route Progress", value: `${Math.round(finishPct)}%`, pct: finishPct, from: "#ffd166", to: "#ff4fd8", glow: "#ffd166" },
          ].map(({ label, value, pct, from, to, glow }) => (
            <div className="cabinet-panel" key={label}>
              <div className="flex items-center justify-between gap-3"><p className="font-semibold text-white">{label}</p><p className="text-xs">{value}</p></div>
              <div className="cabinet-meter mt-3"><div className="cabinet-meter-fill" style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${from}, ${to})`, color: glow, boxShadow: `0 0 12px ${glow}` }} /></div>
            </div>
          ))}
          <div className="cabinet-panel">
            <p className="font-semibold text-white mb-3">Controls</p>
            <ul className="space-y-2 text-xs text-slate-400 leading-6">
              <li>⬅➡ or A/D to shift lanes</li>
              <li>Hold ⬆, W, or Space for boost</li>
              <li>Collect cyan cells to recharge</li>
              <li>Avoid red vehicles — 3 strikes max</li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
