import { useEffect, useMemo, useRef, useState } from "react";

type Meteor = {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  rotation: number;
  spin: number;
};

type Spark = {
  id: number;
  x: number;
  y: number;
  value: number;
  radius: number;
};

type ShieldPickup = {
  id: number;
  x: number;
  y: number;
  radius: number;
};

type WaveState = {
  player: {
    x: number;
    y: number;
    vx: number;
    vy: number;
    radius: number;
    health: number;
    shieldTime: number;
    pulseCooldown: number;
    hitFlash: number;
  };
  meteors: Meteor[];
  sparks: Spark[];
  shieldPickup: ShieldPickup | null;
  stars: { x: number; y: number; speed: number; size: number }[];
  score: number;
  highScore: number;
  combo: number;
  timeLeft: number;
  wave: number;
  gameOver: boolean;
  victory: boolean;
  pulseRing: number;
  message: string;
};

const arenaWidth = 700;
const arenaHeight = 420;
const storageKey = "retro-game-hub-neon-meteor-best";

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function makeMeteor(id: number, wave: number): Meteor {
  const radius = 12 + Math.random() * 18;
  return {
    id,
    x: Math.random() * (arenaWidth - radius * 2) + radius,
    y: -radius - Math.random() * 200,
    vx: (Math.random() - 0.5) * 1.2,
    vy: 2.2 + Math.random() * 1.4 + wave * 0.18,
    radius,
    rotation: Math.random() * Math.PI * 2,
    spin: (Math.random() - 0.5) * 0.06,
  };
}

function makeSpark(id: number, wave: number): Spark {
  return {
    id,
    x: 60 + Math.random() * (arenaWidth - 120),
    y: 70 + Math.random() * (arenaHeight - 220),
    value: 110 + wave * 10,
    radius: 10 + Math.random() * 4,
  };
}

function createInitialState(): WaveState {
  const highScore = Number(window.localStorage.getItem(storageKey) ?? "0") || 0;

  return {
    player: {
      x: arenaWidth / 2,
      y: arenaHeight - 76,
      vx: 0,
      vy: 0,
      radius: 18,
      health: 3,
      shieldTime: 0,
      pulseCooldown: 0,
      hitFlash: 0,
    },
    meteors: Array.from({ length: 5 }, (_, index) => makeMeteor(index + 1, 1)),
    sparks: Array.from({ length: 3 }, (_, index) => makeSpark(index + 1, 1)),
    shieldPickup: null,
    stars: Array.from({ length: 56 }, () => ({
      x: Math.random() * arenaWidth,
      y: Math.random() * arenaHeight,
      speed: 16 + Math.random() * 44,
      size: 1 + Math.random() * 2.2,
    })),
    score: 0,
    highScore,
    combo: 1,
    timeLeft: 60,
    wave: 1,
    gameOver: false,
    victory: false,
    pulseRing: 0,
    message: "Meteor traffic rising. Stay mobile and pulse at close range.",
  };
}

export function LocalGameFrame() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const stateRef = useRef<WaveState | null>(null);
  const pressedKeys = useRef(new Set<string>());
  const nextMeteorId = useRef(100);
  const nextSparkId = useRef(200);
  const nextShieldId = useRef(300);
  const [hud, setHud] = useState(() => createInitialState());

  useEffect(() => {
    stateRef.current = createInitialState();
    setHud(stateRef.current);
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      pressedKeys.current.add(key);

      if (key === " " || key === "spacebar") {
        event.preventDefault();
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      pressedKeys.current.delete(event.key.toLowerCase());
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas || !stateRef.current) {
      return undefined;
    }

    const context = canvas.getContext("2d");

    if (!context) {
      return undefined;
    }

    let frameId = 0;
    let previousTimestamp = performance.now();
    let statePublishAccumulator = 0;

    const updateState = (deltaSeconds: number) => {
      const state = stateRef.current;

      if (!state || state.gameOver || state.victory) {
        return;
      }

      state.timeLeft = Math.max(0, state.timeLeft - deltaSeconds);

      if (state.timeLeft === 0) {
        state.victory = true;
        state.message = "Cabinet clear. You outlasted the final wave.";
      }

      const elapsed = 60 - state.timeLeft;
      state.wave = 1 + Math.floor(elapsed / 12);

      const acceleration = 420;
      const maxVelocity = 240;
      const friction = 0.9;
      const moveX =
        Number(pressedKeys.current.has("arrowright") || pressedKeys.current.has("d")) -
        Number(pressedKeys.current.has("arrowleft") || pressedKeys.current.has("a"));
      const moveY =
        Number(pressedKeys.current.has("arrowdown") || pressedKeys.current.has("s")) -
        Number(pressedKeys.current.has("arrowup") || pressedKeys.current.has("w"));

      state.player.vx = clamp(state.player.vx + moveX * acceleration * deltaSeconds, -maxVelocity, maxVelocity);
      state.player.vy = clamp(state.player.vy + moveY * acceleration * deltaSeconds, -maxVelocity, maxVelocity);
      state.player.vx *= friction;
      state.player.vy *= friction;
      state.player.x = clamp(state.player.x + state.player.vx * deltaSeconds, 24, arenaWidth - 24);
      state.player.y = clamp(state.player.y + state.player.vy * deltaSeconds, 70, arenaHeight - 30);
      state.player.shieldTime = Math.max(0, state.player.shieldTime - deltaSeconds);
      state.player.pulseCooldown = Math.max(0, state.player.pulseCooldown - deltaSeconds);
      state.player.hitFlash = Math.max(0, state.player.hitFlash - deltaSeconds);
      state.pulseRing = Math.max(0, state.pulseRing - deltaSeconds * 220);

      const wantsPulse = pressedKeys.current.has(" ") || pressedKeys.current.has("spacebar");

      if (wantsPulse && state.player.pulseCooldown === 0) {
        state.player.pulseCooldown = 3.2;
        state.pulseRing = 120;
        state.message = "Pulse burst fired.";

        const remainingMeteors: Meteor[] = [];

        for (const meteor of state.meteors) {
          const distance = Math.hypot(meteor.x - state.player.x, meteor.y - state.player.y);

          if (distance <= 120) {
            state.score += 65 + state.wave * 10;
            state.combo += 1;
          } else {
            remainingMeteors.push(meteor);
          }
        }

        while (remainingMeteors.length < 4 + state.wave) {
          remainingMeteors.push(makeMeteor(nextMeteorId.current++, state.wave));
        }

        state.meteors = remainingMeteors;
        pressedKeys.current.delete(" ");
        pressedKeys.current.delete("spacebar");
      }

      state.stars.forEach((star) => {
        star.y += star.speed * deltaSeconds;

        if (star.y > arenaHeight + 4) {
          star.y = -4;
          star.x = Math.random() * arenaWidth;
        }
      });

      const meteorTargetCount = 5 + state.wave;
      while (state.meteors.length < meteorTargetCount) {
        state.meteors.push(makeMeteor(nextMeteorId.current++, state.wave));
      }

      state.meteors = state.meteors
        .map((meteor) => ({
          ...meteor,
          x: meteor.x + meteor.vx,
          y: meteor.y + meteor.vy,
          rotation: meteor.rotation + meteor.spin,
        }))
        .filter((meteor) => meteor.y < arenaHeight + meteor.radius * 2)
        .map((meteor) =>
          meteor.x < meteor.radius || meteor.x > arenaWidth - meteor.radius
            ? { ...meteor, vx: meteor.vx * -1 }
            : meteor,
        );

      state.sparks = state.sparks.filter((spark) => {
        const sparkCollected =
          Math.hypot(spark.x - state.player.x, spark.y - state.player.y) <
          spark.radius + state.player.radius + 2;

        if (sparkCollected) {
          state.score += spark.value * state.combo;
          state.combo = Math.min(5, state.combo + 0.4);
          state.message = `Spark collected. Combo x${state.combo.toFixed(1)}.`;
          return false;
        }

        return true;
      });

      while (state.sparks.length < 2 + Math.min(2, Math.floor(state.wave / 2))) {
        state.sparks.push(makeSpark(nextSparkId.current++, state.wave));
      }

      if (!state.shieldPickup && Math.random() < deltaSeconds * 0.18) {
        state.shieldPickup = {
          id: nextShieldId.current++,
          x: 60 + Math.random() * (arenaWidth - 120),
          y: 80 + Math.random() * (arenaHeight - 180),
          radius: 14,
        };
      }

      if (state.shieldPickup) {
        const pickedShield =
          Math.hypot(state.shieldPickup.x - state.player.x, state.shieldPickup.y - state.player.y) <
          state.shieldPickup.radius + state.player.radius;

        if (pickedShield) {
          state.player.shieldTime = 6;
          state.shieldPickup = null;
          state.message = "Shield charge armed.";
        }
      }

      for (const meteor of state.meteors) {
        const collided =
          Math.hypot(meteor.x - state.player.x, meteor.y - state.player.y) <
          meteor.radius + state.player.radius - 2;

        if (!collided) {
          continue;
        }

        if (state.player.shieldTime > 0) {
          meteor.y = arenaHeight + 80;
          state.score += 45;
          state.message = "Shield absorbed the impact.";
          continue;
        }

        if (state.player.hitFlash > 0) {
          continue;
        }

        state.player.health -= 1;
        state.player.hitFlash = 1.1;
        state.combo = 1;
        state.message = "Hull breach. Reset your line.";

        if (state.player.health <= 0) {
          state.gameOver = true;
          state.message = "Signal lost. Restart and ride the wave again.";
          break;
        }
      }

      if (state.score > state.highScore) {
        state.highScore = state.score;
        window.localStorage.setItem(storageKey, String(state.highScore));
      }
    };

    const drawScene = () => {
      const state = stateRef.current;

      if (!state) {
        return;
      }

      context.clearRect(0, 0, arenaWidth, arenaHeight);

      const gradient = context.createLinearGradient(0, 0, 0, arenaHeight);
      gradient.addColorStop(0, "#1f1653");
      gradient.addColorStop(0.55, "#090713");
      gradient.addColorStop(1, "#05030a");
      context.fillStyle = gradient;
      context.fillRect(0, 0, arenaWidth, arenaHeight);

      context.globalAlpha = 0.7;
      state.stars.forEach((star) => {
        context.fillStyle = "#77ecff";
        context.beginPath();
        context.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        context.fill();
      });
      context.globalAlpha = 1;

      context.strokeStyle = "rgba(71, 245, 255, 0.16)";
      context.lineWidth = 1;
      for (let x = 0; x <= arenaWidth; x += 42) {
        context.beginPath();
        context.moveTo(x, arenaHeight * 0.48);
        context.lineTo(x, arenaHeight);
        context.stroke();
      }

      for (let y = arenaHeight * 0.52; y <= arenaHeight; y += 24) {
        context.beginPath();
        context.moveTo(0, y);
        context.lineTo(arenaWidth, y);
        context.stroke();
      }

      if (state.shieldPickup) {
        context.save();
        context.translate(state.shieldPickup.x, state.shieldPickup.y);
        context.strokeStyle = "#8cf6ff";
        context.fillStyle = "rgba(140, 246, 255, 0.18)";
        context.lineWidth = 3;
        context.beginPath();
        context.arc(0, 0, state.shieldPickup.radius, 0, Math.PI * 2);
        context.fill();
        context.stroke();
        context.restore();
      }

      state.sparks.forEach((spark) => {
        context.save();
        context.translate(spark.x, spark.y);
        context.fillStyle = "#ffd166";
        context.shadowColor = "#ffd166";
        context.shadowBlur = 18;
        context.beginPath();
        context.moveTo(0, -spark.radius);
        context.lineTo(spark.radius * 0.55, 0);
        context.lineTo(0, spark.radius);
        context.lineTo(-spark.radius * 0.55, 0);
        context.closePath();
        context.fill();
        context.restore();
      });

      state.meteors.forEach((meteor) => {
        context.save();
        context.translate(meteor.x, meteor.y);
        context.rotate(meteor.rotation);
        context.fillStyle = "#ff4fd8";
        context.shadowColor = "#ff4fd8";
        context.shadowBlur = 20;
        context.beginPath();
        for (let index = 0; index < 7; index += 1) {
          const angle = (Math.PI * 2 * index) / 7;
          const radius = meteor.radius * (index % 2 === 0 ? 1 : 0.72);
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;

          if (index === 0) {
            context.moveTo(x, y);
          } else {
            context.lineTo(x, y);
          }
        }
        context.closePath();
        context.fill();
        context.restore();
      });

      if (state.pulseRing > 0) {
        context.save();
        context.strokeStyle = "rgba(71, 245, 255, 0.7)";
        context.lineWidth = 3;
        context.beginPath();
        context.arc(state.player.x, state.player.y, state.pulseRing, 0, Math.PI * 2);
        context.stroke();
        context.restore();
      }

      context.save();
      context.translate(state.player.x, state.player.y);
      context.fillStyle = state.player.hitFlash > 0 ? "#ff88e5" : "#47f5ff";
      context.shadowColor = state.player.shieldTime > 0 ? "#87f55b" : "#47f5ff";
      context.shadowBlur = state.player.shieldTime > 0 ? 24 : 18;
      context.beginPath();
      context.moveTo(0, -22);
      context.lineTo(17, 18);
      context.lineTo(0, 10);
      context.lineTo(-17, 18);
      context.closePath();
      context.fill();
      context.fillStyle = "#ffd166";
      context.fillRect(-6, 16, 4, 12);
      context.fillRect(2, 16, 4, 12);

      if (state.player.shieldTime > 0) {
        context.strokeStyle = "rgba(135, 245, 91, 0.75)";
        context.lineWidth = 3;
        context.beginPath();
        context.arc(0, 0, 26, 0, Math.PI * 2);
        context.stroke();
      }

      context.restore();

      if (state.gameOver || state.victory) {
        context.fillStyle = "rgba(5, 4, 12, 0.72)";
        context.fillRect(0, 0, arenaWidth, arenaHeight);
        context.fillStyle = "#f8f5ec";
        context.font = "24px 'Chakra Petch', sans-serif";
        context.textAlign = "center";
        context.fillText(state.victory ? "Cabinet Clear" : "Signal Lost", arenaWidth / 2, arenaHeight / 2 - 18);
        context.font = "16px 'Chakra Petch', sans-serif";
        context.fillText(state.message, arenaWidth / 2, arenaHeight / 2 + 18);
      }
    };

    const loop = (timestamp: number) => {
      const deltaSeconds = Math.min((timestamp - previousTimestamp) / 1000, 0.032);
      previousTimestamp = timestamp;
      statePublishAccumulator += deltaSeconds;

      updateState(deltaSeconds);
      drawScene();

      if (statePublishAccumulator > 0.1 && stateRef.current) {
        setHud({ ...stateRef.current });
        statePublishAccumulator = 0;
      }

      frameId = window.requestAnimationFrame(loop);
    };

    frameId = window.requestAnimationFrame(loop);

    return () => window.cancelAnimationFrame(frameId);
  }, []);

  const restart = () => {
    const nextState = createInitialState();
    stateRef.current = nextState;
    setHud(nextState);
  };

  const statusTone = useMemo(() => {
    if (hud.victory) {
      return "text-cyan-200";
    }

    if (hud.gameOver) {
      return "text-pink-200";
    }

    return "text-green-300";
  }, [hud.gameOver, hud.victory]);

  return (
    <div className="space-y-4 rounded-[1.75rem] border border-cyan-300/20 bg-[#090713] p-4">
      <div className="grid gap-4 xl:grid-cols-[1.25fr_0.75fr]">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-3 text-sm text-slate-200">
              <span className="rounded-full border border-white/10 px-3 py-1">Score: {hud.score}</span>
              <span className="rounded-full border border-white/10 px-3 py-1">Best: {hud.highScore}</span>
              <span className="rounded-full border border-white/10 px-3 py-1">Wave: {hud.wave}</span>
              <span className="rounded-full border border-white/10 px-3 py-1">Time: {Math.ceil(hud.timeLeft)}s</span>
            </div>
            <button
              className="rounded-full border border-cyan-300/40 bg-cyan-300/12 px-4 py-2 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-300/20"
              onClick={restart}
              type="button"
            >
              Restart run
            </button>
          </div>
          <canvas
            aria-label="Local game arena"
            className="mx-auto w-full max-w-[700px] rounded-[1.5rem] border border-white/10 bg-[#090713]"
            height={arenaHeight}
            ref={canvasRef}
            width={arenaWidth}
          />
          <p className={`text-sm font-semibold ${statusTone}`}>{hud.message}</p>
        </div>
        <aside className="space-y-4 rounded-[1.5rem] border border-white/10 bg-white/6 p-4 text-sm text-slate-300">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-cyan-200/70">Cabinet systems</p>
            <div className="mt-3 grid gap-3">
              <div className="rounded-[1rem] border border-white/8 bg-[#120d29]/95 px-4 py-3">
                <p className="font-semibold text-white">Hull integrity</p>
                <p className="mt-1">{hud.player.health} / 3</p>
              </div>
              <div className="rounded-[1rem] border border-white/8 bg-[#120d29]/95 px-4 py-3">
                <p className="font-semibold text-white">Pulse cooldown</p>
                <p className="mt-1">{hud.player.pulseCooldown > 0 ? `${hud.player.pulseCooldown.toFixed(1)}s` : "Ready"}</p>
              </div>
              <div className="rounded-[1rem] border border-white/8 bg-[#120d29]/95 px-4 py-3">
                <p className="font-semibold text-white">Combo multiplier</p>
                <p className="mt-1">x{hud.combo.toFixed(1)}</p>
              </div>
              <div className="rounded-[1rem] border border-white/8 bg-[#120d29]/95 px-4 py-3">
                <p className="font-semibold text-white">Shield charge</p>
                <p className="mt-1">{hud.player.shieldTime > 0 ? `${hud.player.shieldTime.toFixed(1)}s` : "Offline"}</p>
              </div>
            </div>
          </div>
          <div>
            <p className="font-semibold text-white">How this run works</p>
            <ul className="mt-3 space-y-3 pl-5 leading-7">
              <li className="list-disc">Steer across the arena and avoid direct impacts.</li>
              <li className="list-disc">Use the pulse burst on `Space` to clear nearby meteor clusters.</li>
              <li className="list-disc">Collect sparks for score and shield cells for temporary protection.</li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
