import { useEffect, useMemo, useRef, useState } from "react";
import { MobileActionCluster, MobileControlDock } from "../components/MobileControlDock";

type Bullet = { id: number; x: number; y: number; vy: number };
type Enemy = { id: number; x: number; y: number; row: number; col: number; alive: boolean; hitFlash: number };
type GoldShield = { id: number; x: number; y: number; spinAngle: number };
type Particle = { id: number; x: number; y: number; vx: number; vy: number; life: number; color: string; radius: number };
type Star = { x: number; y: number; speed: number; size: number; twinkle: number };

type BreachState = {
  playerX: number;
  playerHealth: number;
  playerHitFlash: number;
  playerFireRate: number;
  bullets: Bullet[];
  enemyBullets: Bullet[];
  enemies: Enemy[];
  shields: GoldShield[];
  particles: Particle[];
  stars: Star[];
  score: number;
  highScore: number;
  combo: number;
  comboTimer: number;
  wave: number;
  enemyDir: number;
  gameOver: boolean;
  victory: boolean;
  message: string;
  totalTime: number;
  enemyFireTimer: number;
  shakeTime: number;
  waveIntroTime: number;
};

const W = 700;
const H = 420;
const ECOLS = 9;
const EROWS = 4;
const STORAGE_KEY = "retro-game-hub-pixel-breach-best";
const ENEMY_COLORS = [
  ["#ff4fd8", "#cc00aa"],
  ["#ff4fd8", "#cc00aa"],
  ["#ff8c42", "#cc5500"],
  ["#ffd166", "#cc9900"],
];

function rand(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function burst(
  particles: Particle[],
  idRef: { current: number },
  centerX: number,
  centerY: number,
  colors: string[],
  count = 16,
) {
  for (let index = 0; index < count; index += 1) {
    const angle = (Math.PI * 2 * index) / count + Math.random() * 0.3;
    const speed = rand(30, 160);
    particles.push({
      id: idRef.current++,
      x: centerX,
      y: centerY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 1,
      color: colors[index % colors.length],
      radius: rand(2, 5),
    });
  }
}

function makeGrid(): Enemy[] {
  const enemies: Enemy[] = [];
  let id = 1;

  for (let row = 0; row < EROWS; row += 1) {
    for (let col = 0; col < ECOLS; col += 1) {
      enemies.push({
        id: id++,
        x: 80 + col * 60,
        y: 36 + row * 44,
        row,
        col,
        alive: true,
        hitFlash: 0,
      });
    }
  }

  return enemies;
}

function init(): BreachState {
  const highScore = Number(window.localStorage.getItem(STORAGE_KEY) ?? "0") || 0;

  return {
    playerX: W / 2,
    playerHealth: 3,
    playerHitFlash: 0,
    playerFireRate: 0,
    bullets: [],
    enemyBullets: [],
    enemies: makeGrid(),
    shields: [
      { id: 1, x: 140, y: 320, spinAngle: 0 },
      { id: 2, x: 350, y: 310, spinAngle: 2.1 },
      { id: 3, x: 560, y: 320, spinAngle: 4.2 },
    ],
    particles: [],
    stars: Array.from({ length: 65 }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      speed: rand(10, 40),
      size: rand(0.7, 2.2),
      twinkle: Math.random() * Math.PI * 2,
    })),
    score: 0,
    highScore,
    combo: 0,
    comboTimer: 0,
    wave: 1,
    enemyDir: 1,
    gameOver: false,
    victory: false,
    message: "Intercept incoming alien formations - hold the line!",
    totalTime: 0,
    enemyFireTimer: rand(1.5, 3),
    shakeTime: 0,
    waveIntroTime: 0,
  };
}

export function PixelBreachGame() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const stateRef = useRef<BreachState | null>(null);
  const keys = useRef(new Set<string>());
  const nextId = useRef(1000);
  const [hud, setHud] = useState(() => init());

  const setVirtualKey = (key: string, active: boolean) => {
    if (active) {
      keys.current.add(key);
      return;
    }

    keys.current.delete(key);
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      keys.current.add(key);

      if (["arrowleft", "arrowright", "arrowup", "arrowdown", " ", "spacebar"].includes(key)) {
        event.preventDefault();
      }
    };

    const onKeyUp = (event: KeyboardEvent) => {
      keys.current.delete(event.key.toLowerCase());
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return undefined;
    }

    const context = canvas.getContext("2d");
    if (!context) {
      return undefined;
    }

    stateRef.current = init();
    setHud(stateRef.current);

    let frameId = 0;
    let previous = performance.now();
    let publishAccumulator = 0;

    const tick = (deltaSeconds: number) => {
      const state = stateRef.current!;
      if (state.gameOver || state.victory) {
        return;
      }

      state.totalTime += deltaSeconds;
      state.shakeTime = Math.max(0, state.shakeTime - deltaSeconds);
      state.playerHitFlash = Math.max(0, state.playerHitFlash - deltaSeconds);
      state.comboTimer = Math.max(0, state.comboTimer - deltaSeconds);
      state.waveIntroTime = Math.max(0, state.waveIntroTime - deltaSeconds);
      if (state.comboTimer === 0) {
        state.combo = 0;
      }

      if (keys.current.has("arrowleft") || keys.current.has("a")) {
        state.playerX = Math.max(30, state.playerX - 320 * deltaSeconds);
      }

      if (keys.current.has("arrowright") || keys.current.has("d")) {
        state.playerX = Math.min(W - 30, state.playerX + 320 * deltaSeconds);
      }

      state.playerFireRate = Math.max(0, state.playerFireRate - deltaSeconds);
      if ((keys.current.has(" ") || keys.current.has("z")) && state.playerFireRate === 0) {
        state.playerFireRate = 0.16;
        state.bullets.push({ id: nextId.current++, x: state.playerX, y: H - 55, vy: -620 });
      }

      state.bullets = state.bullets
        .map((bullet) => ({ ...bullet, y: bullet.y + bullet.vy * deltaSeconds }))
        .filter((bullet) => bullet.y > -10);

      state.enemyFireTimer -= deltaSeconds;
      if (state.enemyFireTimer <= 0) {
        const aliveEnemies = state.enemies.filter((enemy) => enemy.alive);
        if (aliveEnemies.length > 0) {
          const shooter = aliveEnemies[Math.floor(Math.random() * aliveEnemies.length)];
          state.enemyBullets.push({
            id: nextId.current++,
            x: shooter.x,
            y: shooter.y + 14,
            vy: 280 + state.wave * 30,
          });
        }

        state.enemyFireTimer = Math.max(0.3, rand(0.8, 2.5) - state.wave * 0.1);
      }

      state.enemyBullets = state.enemyBullets
        .map((bullet) => ({ ...bullet, y: bullet.y + bullet.vy * deltaSeconds }))
        .filter((bullet) => bullet.y < H + 10);

      const aliveEnemies = state.enemies.filter((enemy) => enemy.alive);
      const formationSpeed = 40 + state.wave * 14 + (1 - aliveEnemies.length / (ECOLS * EROWS)) * 60;
      let touchedWall = false;

      aliveEnemies.forEach((enemy) => {
        enemy.x += state.enemyDir * formationSpeed * deltaSeconds;
        enemy.hitFlash = Math.max(0, enemy.hitFlash - deltaSeconds);

        if (enemy.x < 24 || enemy.x > W - 24) {
          touchedWall = true;
        }
      });

      if (touchedWall) {
        state.enemyDir *= -1;
        aliveEnemies.forEach((enemy) => {
          enemy.y += 14;
        });
      }

      for (const enemy of aliveEnemies) {
        if (enemy.y > H - 60) {
          state.gameOver = true;
          state.message = "Formation breached the perimeter - the line has fallen.";
        }
      }

      state.bullets = state.bullets.filter((bullet) => {
        for (const enemy of state.enemies) {
          if (!enemy.alive) {
            continue;
          }

          if (Math.abs(bullet.x - enemy.x) < 22 && Math.abs(bullet.y - enemy.y) < 16) {
            enemy.alive = false;
            state.combo += 1;
            state.comboTimer = 2;
            const rowBonus = (EROWS - enemy.row) * 20;
            state.score += (100 + rowBonus) * Math.max(1, Math.floor(state.combo / 3));

            if (state.score > state.highScore) {
              state.highScore = state.score;
              window.localStorage.setItem(STORAGE_KEY, String(state.highScore));
            }

            const [primary, secondary] = ENEMY_COLORS[enemy.row];
            burst(state.particles, nextId, enemy.x, enemy.y, [primary, secondary, "#ffffff", "#ffd166"]);
            state.message = `Enemy down${state.combo > 3 ? ` - Combo x${state.combo}!` : ""}`;
            return false;
          }
        }

        return true;
      });

      state.enemyBullets = state.enemyBullets.filter((bullet) => {
        if (state.playerHitFlash > 0) {
          return true;
        }

        if (Math.abs(bullet.x - state.playerX) < 24 && Math.abs(bullet.y - (H - 50)) < 22) {
          state.playerHealth -= 1;
          state.playerHitFlash = 1.2;
          state.shakeTime = 0.28;
          state.combo = 0;
          state.message = state.playerHealth > 0 ? "Hull hit - stay mobile!" : "Fighter destroyed. Restart the intercept.";

          if (state.playerHealth <= 0) {
            state.gameOver = true;
            burst(state.particles, nextId, state.playerX, H - 50, ["#47f5ff", "#ff4fd8", "#ffffff"], 28);
          } else {
            burst(state.particles, nextId, state.playerX, H - 50, ["#ff4fd8", "#ffffff"], 12);
          }

          return false;
        }

        return true;
      });

      state.shields.forEach((shield) => {
        shield.spinAngle += deltaSeconds * 2.2;
      });

      state.shields = state.shields.filter((shield) => {
        const collected = Math.abs(shield.x - state.playerX) < 28 && Math.abs(shield.y - (H - 50)) < 28;
        if (collected) {
          if (state.playerHealth < 3) {
            state.playerHealth = Math.min(3, state.playerHealth + 1);
            state.message = "Shield absorbed - hull repaired!";
            burst(state.particles, nextId, shield.x, shield.y, ["#87f55b", "#c4fab0"], 10);
          }
          return false;
        }

        return true;
      });

      if (state.enemies.filter((enemy) => enemy.alive).length === 0) {
        state.wave += 1;
        if (state.wave > 5) {
          state.victory = true;
          state.message = "All five waves intercepted - the breach is sealed!";
          burst(state.particles, nextId, W / 2, H / 2, ["#47f5ff", "#ffd166", "#87f55b", "#ff4fd8", "#ffffff"], 48);
        } else {
          state.enemies = makeGrid();
          state.enemyDir = 1;
          state.waveIntroTime = 2.5;
          state.message = `Wave ${state.wave} inbound - hold the line!`;
          state.shields.push({
            id: nextId.current++,
            x: rand(80, W - 80),
            y: rand(250, 330),
            spinAngle: 0,
          });
        }
      }

      state.stars.forEach((star) => {
        star.y += star.speed * deltaSeconds;
        star.twinkle += deltaSeconds * 2.2;
        if (star.y > H + 4) {
          star.y = -4;
          star.x = Math.random() * W;
        }
      });

      state.particles.forEach((particle) => {
        particle.x += particle.vx * deltaSeconds;
        particle.y += particle.vy * deltaSeconds;
        particle.vy += 60 * deltaSeconds;
        particle.life -= deltaSeconds * 1.2;
        particle.vx *= 0.96;
        particle.vy *= 0.96;
      });
      state.particles = state.particles.filter((particle) => particle.life > 0);
    };

    const draw = (timestamp: number) => {
      const state = stateRef.current!;
      const shakeX = state.shakeTime > 0 ? Math.sin(timestamp * 0.12) * state.shakeTime * 10 : 0;
      const shakeY = state.shakeTime > 0 ? Math.cos(timestamp * 0.09) * state.shakeTime * 6 : 0;

      context.save();
      context.translate(shakeX, shakeY);
      context.clearRect(-10, -10, W + 20, H + 20);

      const background = context.createLinearGradient(0, 0, 0, H);
      background.addColorStop(0, "#05020f");
      background.addColorStop(0.6, "#0a061c");
      background.addColorStop(1, "#030208");
      context.fillStyle = background;
      context.fillRect(-10, -10, W + 20, H + 20);

      (
        [
          [W * 0.22, H * 0.25, "#ff4fd8", 170],
          [W * 0.78, H * 0.18, "#47f5ff", 150],
          [W * 0.5, H * 0.8, "#b06eff", 130],
        ] as [number, number, string, number][]
      ).forEach(([x, y, color, radius]) => {
        const nebula = context.createRadialGradient(x, y, 8, x, y, radius);
        nebula.addColorStop(0, `${color}24`);
        nebula.addColorStop(1, `${color}00`);
        context.fillStyle = nebula;
        context.fillRect(0, 0, W, H);
      });

      state.stars.forEach((star) => {
        const twinkle = 0.5 + Math.sin(star.twinkle) * 0.5;
        context.globalAlpha = twinkle * 0.85;
        context.fillStyle = "#aadeff";
        context.shadowColor = "#aadeff";
        context.shadowBlur = 3;
        context.beginPath();
        context.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        context.fill();
      });
      context.globalAlpha = 1;
      context.shadowBlur = 0;

      context.strokeStyle = "rgba(71,245,255,0.18)";
      context.lineWidth = 1;
      context.beginPath();
      context.moveTo(0, H - 30);
      context.lineTo(W, H - 30);
      context.stroke();

      context.strokeStyle = "rgba(71,245,255,0.05)";
      for (let gridX = 0; gridX <= W; gridX += 40) {
        context.beginPath();
        context.moveTo(gridX, H - 30);
        context.lineTo(gridX, H);
        context.stroke();
      }

      state.shields.forEach((shield) => {
        context.save();
        context.translate(shield.x, shield.y);
        context.rotate(shield.spinAngle);
        context.shadowColor = "#ffd166";
        context.shadowBlur = 20;

        context.beginPath();
        for (let index = 0; index < 6; index += 1) {
          const angle = (Math.PI * 2 * index) / 6 - Math.PI / 6;
          const radius = 16;
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;
          if (index === 0) {
            context.moveTo(x, y);
          } else {
            context.lineTo(x, y);
          }
        }
        context.closePath();
        context.strokeStyle = "#ffd166";
        context.lineWidth = 2.5;
        context.stroke();
        context.fillStyle = "rgba(255,209,102,0.15)";
        context.fill();

        context.rotate(-shield.spinAngle * 2.2);
        context.beginPath();
        for (let index = 0; index < 3; index += 1) {
          const angle = (Math.PI * 2 * index) / 3 - Math.PI / 2;
          const radius = 8;
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;
          if (index === 0) {
            context.moveTo(x, y);
          } else {
            context.lineTo(x, y);
          }
        }
        context.closePath();
        context.strokeStyle = "rgba(255,255,255,0.6)";
        context.lineWidth = 1.5;
        context.stroke();

        context.shadowBlur = 0;
        context.restore();
      });

      state.enemies.forEach((enemy) => {
        if (!enemy.alive) {
          return;
        }

        const [primary] = ENEMY_COLORS[enemy.row];
        const fillColor = enemy.hitFlash > 0 ? "#ffffff" : primary;
        context.save();
        context.translate(enemy.x, enemy.y);
        context.shadowColor = fillColor;
        context.shadowBlur = enemy.hitFlash > 0 ? 24 : 10;
        context.fillStyle = fillColor;
        context.strokeStyle = fillColor;
        context.lineWidth = 2;

        const pulse = Math.sin(state.totalTime * 5 + enemy.col) * 0.12 + 0.88;

        if (enemy.row === 0) {
          context.beginPath();
          context.ellipse(0, -5, 12, 10, 0, 0, Math.PI * 2);
          context.fill();

          context.fillStyle = "#ffffff";
          context.fillRect(-6, -6, 12, 3);
          context.fillStyle = fillColor;

          for (let tentacleX = -8; tentacleX <= 8; tentacleX += 4) {
            context.beginPath();
            context.moveTo(tentacleX, 5);
            context.quadraticCurveTo(
              tentacleX + Math.sin(state.totalTime * 6 + tentacleX) * 4,
              10,
              tentacleX + Math.sin(state.totalTime * 6 + tentacleX) * 2,
              16 * pulse,
            );
            context.stroke();
          }
        } else if (enemy.row === 1) {
          context.beginPath();
          context.ellipse(0, 0, 16, 8, 0, 0, Math.PI * 2);
          context.fill();
          context.beginPath();
          context.arc(0, -6, 7, 0, Math.PI * 2);
          context.fill();

          context.beginPath();
          context.moveTo(-16, 2);
          context.quadraticCurveTo(-22, -2, -20 * pulse, -8);
          context.moveTo(16, 2);
          context.quadraticCurveTo(22, -2, 20 * pulse, -8);
          context.stroke();

          context.fillStyle = "#000000";
          context.beginPath();
          context.arc(0, -5, 4, 0, Math.PI * 2);
          context.fill();
          context.fillStyle = "#ff2255";
          context.fillRect(-1, -6, 2, 2);
        } else if (enemy.row === 2) {
          context.beginPath();
          context.moveTo(0, -12);
          context.lineTo(15, 6);
          context.lineTo(-15, 6);
          context.closePath();
          context.fill();

          context.strokeStyle = "#ffffff";
          context.beginPath();
          context.moveTo(-16, -6);
          context.lineTo(-20, 8);
          context.moveTo(16, -6);
          context.lineTo(20, 8);
          context.stroke();

          context.fillStyle = "#ffffff";
          context.beginPath();
          context.arc(0, 0, 4, 0, Math.PI * 2);
          context.fill();
        } else {
          context.beginPath();
          context.moveTo(0, -14);
          context.lineTo(13, 8);
          context.lineTo(5, 5);
          context.lineTo(0, 10);
          context.lineTo(-5, 5);
          context.lineTo(-13, 8);
          context.closePath();
          context.fill();
        }

        context.shadowBlur = 0;
        context.restore();
      });

      state.bullets.forEach((bullet) => {
        const gradient = context.createLinearGradient(bullet.x, bullet.y - 12, bullet.x, bullet.y + 12);
        gradient.addColorStop(0, "rgba(255,255,255,1)");
        gradient.addColorStop(0.3, "rgba(71,245,255,1)");
        gradient.addColorStop(1, "rgba(71,245,255,0)");
        context.fillStyle = gradient;
        context.shadowColor = "#47f5ff";
        context.shadowBlur = 16;
        context.fillRect(bullet.x - 3, bullet.y - 14, 6, 28);
        context.shadowBlur = 0;
      });

      state.enemyBullets.forEach((bullet) => {
        context.shadowColor = "#ff4fd8";
        context.shadowBlur = 14;
        context.fillStyle = "#ffffff";
        context.beginPath();
        context.arc(bullet.x, bullet.y, 4, 0, Math.PI * 2);
        context.fill();
        context.strokeStyle = "#ff4fd8";
        context.lineWidth = 2;
        context.beginPath();
        context.arc(bullet.x, bullet.y, 7, 0, Math.PI * 2);
        context.stroke();
        context.shadowBlur = 0;
      });

      const playerY = H - 50;
      const hullColor = state.playerHitFlash > 0 ? "#ff88e5" : "#47f5ff";
      context.save();
      context.translate(state.playerX, playerY);
      context.shadowColor = hullColor;
      context.shadowBlur = 22;

      const flareLength = 14 + Math.sin(state.totalTime * 32) * 5;
      const engineGradient = context.createLinearGradient(0, 16, 0, 16 + flareLength);
      engineGradient.addColorStop(0, "#ffffff");
      engineGradient.addColorStop(0.4, hullColor);
      engineGradient.addColorStop(1, "rgba(0,0,0,0)");
      context.fillStyle = engineGradient;
      context.fillRect(-8, 14, 4, flareLength);
      context.fillRect(4, 14, 4, flareLength);

      const playerGradient = context.createLinearGradient(0, -22, 0, 20);
      playerGradient.addColorStop(0, "#ffffff");
      playerGradient.addColorStop(0.4, hullColor);
      playerGradient.addColorStop(1, "#084a60");
      context.fillStyle = playerGradient;
      context.beginPath();
      context.moveTo(0, -24);
      context.lineTo(16, 16);
      context.lineTo(7, 10);
      context.lineTo(0, 15);
      context.lineTo(-7, 10);
      context.lineTo(-16, 16);
      context.closePath();
      context.fill();

      context.beginPath();
      context.ellipse(0, -5, 5, 9, 0, 0, Math.PI * 2);
      context.fillStyle = "rgba(180,248,255,0.7)";
      context.fill();

      context.strokeStyle = "#ffffff";
      context.lineWidth = 1;
      context.beginPath();
      context.moveTo(-2, -8);
      context.lineTo(2, -2);
      context.stroke();

      context.fillStyle = "#ffd166";
      context.fillRect(-17, 6, 2, 8);
      context.fillRect(15, 6, 2, 8);

      if (state.playerHitFlash > 0) {
        context.beginPath();
        context.arc(0, 0, 30, 0, Math.PI * 2);
        context.strokeStyle = `rgba(255, 79, 216, ${state.playerHitFlash})`;
        context.lineWidth = 2.5;
        context.shadowColor = "#ff4fd8";
        context.shadowBlur = 24;
        context.stroke();
      }

      context.restore();

      state.particles.forEach((particle) => {
        context.globalAlpha = Math.max(0, particle.life);
        context.fillStyle = particle.color;
        context.shadowColor = particle.color;
        context.shadowBlur = 10;
        context.beginPath();
        context.arc(particle.x, particle.y, particle.radius * particle.life, 0, Math.PI * 2);
        context.fill();
      });
      context.globalAlpha = 1;
      context.shadowBlur = 0;

      if (state.combo > 2) {
        context.fillStyle = `rgba(255, 209, 102, ${Math.min(1, state.comboTimer * 1.5)})`;
        context.font = "bold 14px 'Press Start 2P', monospace";
        context.textAlign = "left";
        context.fillText(`x${state.combo} CHAIN`, 30, H - 46);
      }

      if (state.waveIntroTime > 0 && state.wave > 1) {
        context.fillStyle = `rgba(71,245,255,${Math.max(0, state.waveIntroTime / 2.5) * 0.9})`;
        context.font = "bold 22px 'Chakra Petch', sans-serif";
        context.textAlign = "center";
        context.fillText(`WAVE ${state.wave}`, W / 2, H / 2);
      }

      if (state.gameOver || state.victory) {
        context.fillStyle = "rgba(4,2,12,0.85)";
        context.fillRect(-10, -10, W + 20, H + 20);
        const overlayColor = state.victory ? "#47f5ff" : "#ff4d74";
        context.shadowColor = overlayColor;
        context.shadowBlur = 32;
        context.fillStyle = overlayColor;
        context.font = "bold 28px 'Chakra Petch', sans-serif";
        context.textAlign = "center";
        context.fillText(state.victory ? "BREACH SEALED" : "LINE LOST", W / 2, H / 2 - 24);
        context.shadowBlur = 0;
        context.fillStyle = "#e0d8f8";
        context.font = "15px 'Chakra Petch', sans-serif";
        context.fillText(state.message, W / 2, H / 2 + 14);
      }

      context.restore();
    };

    const loop = (timestamp: number) => {
      const deltaSeconds = Math.min((timestamp - previous) / 1000, 0.032);
      previous = timestamp;
      publishAccumulator += deltaSeconds;

      tick(deltaSeconds);
      draw(timestamp);

      if (publishAccumulator > 0.1 && stateRef.current) {
        setHud({ ...stateRef.current });
        publishAccumulator = 0;
      }

      frameId = window.requestAnimationFrame(loop);
    };

    frameId = window.requestAnimationFrame(loop);
    return () => window.cancelAnimationFrame(frameId);
  }, []);

  const restart = () => {
    const nextState = init();
    stateRef.current = nextState;
    setHud(nextState);
  };

  const statusTone = useMemo(() => {
    if (hud.victory) {
      return "text-cyan-300";
    }

    if (hud.gameOver) {
      return "text-pink-300";
    }

    return "text-blue-200";
  }, [hud.gameOver, hud.victory]);

  const hpPercent = (hud.playerHealth / 3) * 100;
  const comboPercent = Math.min(100, hud.combo * 10);
  const aliveCount = hud.enemies.filter((enemy) => enemy.alive).length;
  const clearPercent = ((ECOLS * EROWS - aliveCount) / (ECOLS * EROWS)) * 100;

  return (
    <div className="cabinet-shell space-y-4 p-4 sm:p-5">
      <div className="cabinet-marquee px-4 py-4 sm:px-5">
        <div className="relative flex flex-wrap items-center justify-between gap-3">
          <div>
            <p
              className="pixel-title text-[0.6rem] text-blue-100"
              style={{ textShadow: "0 0 8px rgba(100,180,255,0.9),0 0 20px rgba(100,180,255,0.5)" }}
            >
              Pixel Breach
            </p>
            <p className="mt-2 text-sm text-slate-400">Space invader interception - laser combos - shield pickups - 5 escalating waves</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="cabinet-chip">Wave {hud.wave}/5</span>
            <span className="cabinet-chip">{aliveCount} Enemies</span>
          </div>
        </div>
      </div>
      <div className="grid gap-4 xl:grid-cols-[1.3fr_0.7fr]">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              <span className="cabinet-chip">Score {hud.score.toLocaleString()}</span>
              <span className="cabinet-chip">Best {hud.highScore.toLocaleString()}</span>
              <span className="cabinet-chip">Combo x{hud.combo}</span>
              <span className="cabinet-chip">Hull {hud.playerHealth}/3</span>
            </div>
            <button className="btn-cyan py-2 text-sm" id="pixel-breach-restart" onClick={restart} type="button">
              Restart
            </button>
          </div>
          <div className="cabinet-playfield">
            <div className="flex items-center justify-between border-b border-white/8 px-4 py-2.5 text-xs uppercase tracking-[0.18em] text-slate-400">
              <span>Deep Field Intercept Grid</span>
              <span className={hud.combo > 5 ? "text-yellow-300" : "text-slate-400"}>
                {hud.combo > 5 ? `Hot combo x${hud.combo}` : `Wave ${hud.wave}`}
              </span>
            </div>
            <canvas
              aria-label="Pixel Breach game arena"
              className="mx-auto block w-full max-w-[700px]"
              height={H}
              ref={canvasRef}
              width={W}
            />
          </div>
          <MobileControlDock title="Pixel Breach touch controls">
            <MobileActionCluster
              actions={[
                {
                  label: "Strafe left",
                  onPress: () => setVirtualKey("arrowleft", true),
                  onPressEnd: () => setVirtualKey("arrowleft", false),
                },
                {
                  label: "Strafe right",
                  onPress: () => setVirtualKey("arrowright", true),
                  onPressEnd: () => setVirtualKey("arrowright", false),
                },
                {
                  label: "Hold fire",
                  onPress: () => setVirtualKey(" ", true),
                  onPressEnd: () => setVirtualKey(" ", false),
                  tone: "pink",
                },
                {
                  label: "Restart",
                  onPress: restart,
                  tone: "gold",
                },
              ]}
            />
          </MobileControlDock>
          <div className="cabinet-note">
            <p className={`text-sm font-semibold ${statusTone}`}>{hud.message}</p>
          </div>
        </div>
        <aside className="space-y-3 rounded-[1.5rem] border border-white/8 bg-black/20 p-4 text-sm text-slate-300">
          <p className="section-eyebrow text-blue-200/60">Combat Systems</p>
          {[
            {
              label: "Hull Integrity",
              value: `${hud.playerHealth}/3`,
              pct: hpPercent,
              from: "#47f5ff",
              to: "#87f55b",
              glow: "#47f5ff",
            },
            {
              label: "Combo Chain",
              value: `x${hud.combo}`,
              pct: comboPercent,
              from: "#ffd166",
              to: "#ff8c42",
              glow: "#ffd166",
            },
            {
              label: "Wave Clear",
              value: `${Math.round(clearPercent)}%`,
              pct: clearPercent,
              from: "#ff4fd8",
              to: "#b06eff",
              glow: "#ff4fd8",
            },
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
                    background: `linear-gradient(90deg,${from},${to})`,
                    color: glow,
                    boxShadow: `0 0 12px ${glow}`,
                  }}
                />
              </div>
            </div>
          ))}
          <div className="cabinet-panel">
            <p className="section-eyebrow mb-3 text-blue-200/60">Enemy Intel</p>
            <div className="grid gap-2 text-xs">
              {[
                ["Alive", `${aliveCount} / ${ECOLS * EROWS}`],
                ["Shields live", hud.shields.length],
                ["Formation dir", hud.enemyDir > 0 ? "Right" : "Left"],
              ].map(([key, value]) => (
                <div className="flex items-center justify-between gap-3" key={String(key)}>
                  <span className="text-slate-400">{key}</span>
                  <span className="font-semibold text-slate-200">{value}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="cabinet-panel">
            <p className="mb-3 font-semibold text-white">Controls</p>
            <ul className="space-y-2 text-xs leading-6 text-slate-400">
              <li>Left and Right arrows or A and D to move fighter</li>
              <li>Space or Z to fire and hold for auto-fire</li>
              <li>Collect gold shields to repair hull</li>
              <li>Clear all 5 waves to seal the breach</li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
