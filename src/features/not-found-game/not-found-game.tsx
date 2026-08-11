"use client";

import Link from "next/link";
import {
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";

import type { Locale } from "@/lib/i18n/locale";

import {
  BREAKOUT_TARGET_CODE,
  BREAKOUT_TARGET_SEGMENTS,
  activeBreakoutBalls,
  breakoutSpeedBounds,
  createBreakoutModel,
  moveBreakoutPaddle,
  remainingBreakoutBricks,
  resizeBreakoutModel,
  setBreakoutPaused,
  startBreakoutRun,
  stepBreakoutModel,
  stepBreakoutPresentation,
  type BreakoutModel,
  type BreakoutPhase,
} from "./not-found-breakout-model";
import {
  gameRenderBudget,
  normalizeStoredBestScore,
  normalizedGameDelta,
  type GameRenderBudget,
} from "./not-found-game-policy";
import styles from "./not-found-game.module.css";

const BEST_SCORE_KEY = "helios-404-breakout-best-score";

const gameCopy = {
  en: {
    eyebrow: "404 · Transmission interrupted",
    gameTitle: "Signal Breaker",
    gameLead:
      "Break apart the 404 transmission, clear the broken signal blocks, and keep the pulse inside the relay field.",
    pause: "Pause",
    resume: "Resume",
    restart: "Restart game",
    retry: "Try again",
    score: "Signal",
    best: "Best",
    remaining: "Segments",
    balls: "Balls",
    bonusPlus: "+2 pulses caught",
    bonusTriple: "×3 applied to every pulse",
    bonusPierce: "Piercing permanently activated for every pulse",
    bonusBlast: "Permanent blast radius 3 activated for every pulse",
    paused: "Signal paused",
    gameOver: "You lost · Pulse dropped",
    gameOverBody:
      "The signal pulse left the relay field before 404 was cleared.",
    won: "You won · 404 cleared",
    wonBody: "Every segment is gone. The transmission has been restored.",
    controls:
      "Move the reflector with pointer, touch, A and D, or the arrow keys. P pauses.",
    canvasLabel:
      "Signal Breaker. A Breakout game where the signal pulse destroys the 404 error code segment by segment.",
    canvasIdleHint: "Click the playfield or press Enter to begin.",
    gameRole: "Breakout game",
    returnHome: "Return to the Solar System",
    playPrompt: "( MIGHT AS WELL PLAY )",
  },
  tr: {
    eyebrow: "404 · İletim kesildi",
    gameTitle: "Sinyal Kırıcı",
    gameLead:
      "Enerji darbesiyle kırık 404 iletimini temizle ve darbeyi röle alanının içinde tut.",
    pause: "Duraklat",
    resume: "Devam et",
    restart: "Oyunu yeniden başlat",
    retry: "Tekrar dene",
    score: "Sinyal",
    best: "En iyi",
    remaining: "Parça",
    balls: "Top",
    bonusPlus: "+2 top bonusu yakalandı",
    bonusTriple: "×3 ekrandaki bütün toplara uygulandı",
    bonusPierce: "Delip geçme bütün toplarda kalıcı olarak etkin",
    bonusBlast: "Patlama yarıçapı 3 bütün toplarda kalıcı olarak etkin",
    paused: "Sinyal duraklatıldı",
    gameOver: "Kaybettin · Top düştü",
    gameOverBody:
      "404 temizlenmeden enerji darbesi röle alanının dışına çıktı.",
    won: "Kazandın · 404 temizlendi",
    wonBody: "Bütün parçalar yok edildi. İletim yeniden kuruldu.",
    controls:
      "Yansıtıcıyı fare, dokunma, A ve D ya da ok tuşlarıyla hareket ettir. P duraklatır.",
    canvasLabel:
      "Sinyal Kırıcı. Enerji darbesiyle 404 hata kodunu parça parça yok ettiğin Breakout oyunu.",
    canvasIdleHint: "Başlamak için oyun alanına dokun veya Enter tuşuna bas.",
    gameRole: "Breakout oyunu",
    returnHome: "Güneş Sistemi'ne dön",
    playPrompt: "( HAZIR BURADAYKEN OYNA )",
  },
} as const;

function roundedRect(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
): void {
  const resolved = Math.min(radius, width * 0.5, height * 0.5);
  context.beginPath();
  context.moveTo(x + resolved, y);
  context.lineTo(x + width - resolved, y);
  context.quadraticCurveTo(x + width, y, x + width, y + resolved);
  context.lineTo(x + width, y + height - resolved);
  context.quadraticCurveTo(
    x + width,
    y + height,
    x + width - resolved,
    y + height,
  );
  context.lineTo(x + resolved, y + height);
  context.quadraticCurveTo(x, y + height, x, y + height - resolved);
  context.lineTo(x, y + resolved);
  context.quadraticCurveTo(x, y, x + resolved, y);
  context.closePath();
}

function drawGame(
  canvas: HTMLCanvasElement,
  model: BreakoutModel,
  budget: GameRenderBudget,
  playPrompt: string,
): void {
  const context = canvas.getContext("2d");
  if (!context) return;
  context.setTransform(budget.pixelRatio, 0, 0, budget.pixelRatio, 0, 0);
  context.clearRect(0, 0, model.width, model.height);

  // transparent playfield: let the page background show through

  const targetBounds = model.bricks.reduce(
    (bounds, brick) => ({
      bottom: Math.max(bounds.bottom, brick.y + brick.height),
      left: Math.min(bounds.left, brick.x),
      right: Math.max(bounds.right, brick.x + brick.width),
      top: Math.min(bounds.top, brick.y),
    }),
    { bottom: 0, left: model.width, right: 0, top: model.height },
  );
  context.save();
  context.globalAlpha = 0.42;
  context.fillStyle = "#9aa3b1";
  context.font = `${Math.max(9, Math.min(14, model.width * 0.022))}px ui-monospace, monospace`;
  context.textAlign = "center";
  context.textBaseline = "top";
  context.fillText(playPrompt, model.width * 0.5, targetBounds.bottom + 18);
  context.restore();

  const tones = ["#a9b2c0", "#b7c0cd", "#c5ccd7"];
  context.save();
  for (let toneIndex = 0; toneIndex < tones.length; toneIndex += 1) {
    context.fillStyle = tones[toneIndex]!;
    for (const brick of model.bricks) {
      if (!brick.alive || brick.tone % tones.length !== toneIndex) continue;
      context.fillRect(brick.x, brick.y, brick.width, brick.height);
    }
  }
  context.restore();

  if (!budget.reducedMotion) {
    for (const impact of model.impacts) {
      const progress = 1 - impact.ttl / impact.maxTtl;
      const tone = tones[impact.tone] ?? tones[0];
      context.save();
      context.globalAlpha = Math.max(0, 1 - progress) * 0.8;
      context.strokeStyle = tone;
      context.lineWidth = 1.5;
      context.beginPath();
      context.arc(
        impact.x,
        impact.y,
        impact.radius * (1.15 + progress * 4.4),
        0,
        Math.PI * 2,
      );
      context.stroke();
      context.restore();
    }

    for (const particle of model.debris) {
      const tone = tones[particle.tone] ?? tones[0];
      context.save();
      context.globalAlpha = Math.max(0, particle.ttl / particle.maxTtl);
      context.translate(particle.x, particle.y);
      context.rotate(particle.rotation);
      context.fillStyle = tone;
      context.fillRect(
        -particle.size * 0.5,
        -particle.size * 0.22,
        particle.size,
        particle.size * 0.44,
      );
      context.restore();
    }
  }

  if (model.combo > 1 && model.comboWindow > 0) {
    context.save();
    context.globalAlpha = Math.min(1, model.comboWindow * 1.3);
    context.fillStyle = "#dbe2eb";
    context.font = `${Math.max(9, Math.min(14, model.width * 0.022))}px ui-monospace, monospace`;
    context.textAlign = "center";
    context.textBaseline = "middle";
    const newest = model.impacts.at(-1);
    context.fillText(
      `×${model.combo}`,
      newest?.x ?? model.ballX,
      (newest?.y ?? model.ballY) - model.ballRadius * 3.2,
    );
    context.restore();
  }

  if (model.phase !== "idle") {
    const paddleLeft = model.paddleX - model.paddleWidth * 0.5;
    context.save();
    roundedRect(
      context,
      paddleLeft,
      model.paddleY,
      model.paddleWidth,
      model.paddleHeight,
      model.paddleHeight * 0.5,
    );
    context.fillStyle = "#dbe2eb";
    context.fill();
    context.restore();
  }

  for (const bonus of model.bonuses) {
    const half = bonus.size * 0.5;
    context.save();
    context.translate(bonus.x, bonus.y);
    context.rotate(budget.reducedMotion ? 0 : bonus.rotation);
    context.shadowColor = "rgba(0,0,0,0.1)";
    context.shadowBlur = Math.max(1, budget.shadowBlur * 0.24);
    roundedRect(
      context,
      -half,
      -half,
      bonus.size,
      bonus.size,
      Math.max(3, bonus.size * 0.16),
    );
    context.fillStyle = "#11151c";
    context.fill();
    context.shadowBlur = 0;
    context.lineWidth = Math.max(1.2, bonus.size * 0.065);
    context.strokeStyle = "#c8cfda";
    context.stroke();
    context.fillStyle = "#e4e9ef";
    context.font = `700 ${Math.max(8, bonus.size * 0.3)}px ui-monospace, monospace`;
    context.textAlign = "center";
    context.textBaseline = "middle";
    const bonusLabel =
      bonus.type === "triple"
        ? "×3"
        : bonus.type === "plus-two"
          ? "+2"
          : bonus.type === "pierce"
            ? "P"
            : "R3";
    context.fillText(bonusLabel, 0, 0.5);
    context.restore();
  }

  const speedBounds = breakoutSpeedBounds(model);
  if (model.phase !== "idle") {
    for (const ball of model.balls) {
      const ballSpeed = Math.hypot(ball.velocityX, ball.velocityY);
      if (!budget.reducedMotion && ballSpeed > 1 && model.serveDelay <= 0) {
        const speedProgress = Math.min(
          1,
          Math.max(
            0,
            (ballSpeed - speedBounds.minimum) /
              Math.max(1, speedBounds.maximum - speedBounds.minimum),
          ),
        );
        const trailLength = 5 + speedProgress * 10;
        const trailX = ball.x - (ball.velocityX / ballSpeed) * trailLength;
        const trailY = ball.y - (ball.velocityY / ballSpeed) * trailLength;
        const trailGradient = context.createLinearGradient(
          trailX,
          trailY,
          ball.x,
          ball.y,
        );
        trailGradient.addColorStop(0, "rgba(230,236,243,0)");
        trailGradient.addColorStop(
          0.58,
          `rgba(230,236,243,${0.06 + speedProgress * 0.07})`,
        );
        trailGradient.addColorStop(
          1,
          `rgba(230,236,243,${0.12 + speedProgress * 0.12})`,
        );
        context.save();
        context.strokeStyle = trailGradient;
        context.lineWidth = Math.max(
          1.5,
          ball.radius * (0.52 + speedProgress * 0.34),
        );
        context.lineCap = "round";
        context.beginPath();
        context.moveTo(trailX, trailY);
        context.lineTo(ball.x, ball.y);
        context.stroke();
        context.restore();
      }

      context.save();
      context.fillStyle = "#e8edf3";
      context.beginPath();
      context.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
      context.fill();
      if (model.piercingActive || model.blastRadiusActive) {
        context.globalAlpha = 0.8;
        context.strokeStyle = "#f3f6fa";
        context.lineWidth = Math.max(1, ball.radius * 0.34);
        context.beginPath();
        context.arc(
          ball.x,
          ball.y,
          ball.radius * (model.blastRadiusActive ? 1.85 : 1.5),
          0,
          Math.PI * 2,
        );
        context.stroke();
      }
      context.restore();
    }
  }

  if (model.bonusCatchTtl > 0 && model.lastBonusType) {
    const progress = 1 - model.bonusCatchTtl / 0.9;
    const alpha = budget.reducedMotion
      ? Math.min(1, model.bonusCatchTtl * 2.4)
      : Math.max(0, Math.sin(Math.min(1, progress) * Math.PI));
    context.save();
    context.globalAlpha = alpha * 0.92;
    context.fillStyle = "#dbe2eb";
    context.font = `700 ${Math.max(12, Math.min(20, model.width * 0.034))}px ui-monospace, monospace`;
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText(
      model.lastBonusType === "triple"
        ? "×3 ALL BALLS"
        : model.lastBonusType === "plus-two"
          ? "+2 BALLS"
          : model.lastBonusType === "pierce"
            ? "PIERCE ∞"
            : "BLAST R3 ∞",
      model.width * 0.5,
      model.paddleY - Math.max(42, model.height * 0.085),
    );
    context.restore();
  }

  if (model.winTtl > 0) {
    const intensity = budget.reducedMotion
      ? 0.5
      : Math.min(1, model.winTtl / 0.8);
    const vignette = context.createRadialGradient(
      model.width * 0.5,
      model.height * 0.55,
      model.width * 0.08,
      model.width * 0.5,
      model.height * 0.55,
      Math.max(model.width, model.height) * 0.68,
    );
    vignette.addColorStop(0, "rgba(24,108,65,0)");
    vignette.addColorStop(1, `rgba(34,148,84,${0.3 * intensity})`);
    context.fillStyle = vignette;
    context.fillRect(0, 0, model.width, model.height);
    context.save();
    context.globalAlpha = intensity * 0.86;
    context.strokeStyle = "#8fe0ae";
    context.lineWidth = 2;
    context.strokeRect(1, 1, model.width - 2, model.height - 2);
    context.restore();
  }

  if (model.lossTtl > 0) {
    const intensity = budget.reducedMotion
      ? 0.5
      : Math.min(1, model.lossTtl / 0.5);
    const vignette = context.createRadialGradient(
      model.width * 0.5,
      model.height * 0.55,
      model.width * 0.08,
      model.width * 0.5,
      model.height * 0.55,
      Math.max(model.width, model.height) * 0.68,
    );
    vignette.addColorStop(0, "rgba(127,24,20,0)");
    vignette.addColorStop(1, `rgba(176,47,31,${0.32 * intensity})`);
    context.fillStyle = vignette;
    context.fillRect(0, 0, model.width, model.height);
    context.save();
    context.globalAlpha = intensity * 0.84;
    context.strokeStyle = "#ffb19c";
    context.lineWidth = 2;
    context.strokeRect(1, 1, model.width - 2, model.height - 2);
    context.restore();
  }
}

function syncIdleHomePosition(
  page: HTMLElement | null,
  model: BreakoutModel,
): void {
  if (!page || model.phase !== "idle") return;

  let targetBottom = 0;
  for (const brick of model.bricks) {
    targetBottom = Math.max(targetBottom, brick.y + brick.height);
  }

  const promptFontSize = Math.max(9, Math.min(14, model.width * 0.022));
  const homeTop = targetBottom + 18 + promptFontSize + 12;
  page.style.setProperty("--idle-home-top", `${homeTop}px`);
}

export function NotFoundGame({
  body,
  homeLabel,
  locale,
  title,
}: {
  readonly body: string;
  readonly homeLabel: string;
  readonly locale: Locale;
  readonly title: string;
}) {
  const copy = gameCopy[locale];
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<number | null>(null);
  const uiFramesRef = useRef<Set<number>>(new Set());
  const lastFrameAtRef = useRef(0);
  const lastDiagnosticsAtRef = useRef(0);
  const modelRef = useRef<BreakoutModel | null>(null);
  const pageRef = useRef<HTMLElement>(null);
  const shellRef = useRef<HTMLDivElement>(null);
  const budgetRef = useRef<GameRenderBudget>({
    pixelRatio: 1,
    reducedMotion: false,
    shadowBlur: 8,
    starAreaDivisor: 15_500,
    starMaximum: 78,
    tier: "economy",
  });
  const keysRef = useRef({ left: false, right: false });
  const activePointerRef = useRef<{ id: number; offsetX: number } | null>(null);
  const bestRef = useRef(0);
  const persistedBestRef = useRef(0);
  const retryRef = useRef<HTMLButtonElement>(null);
  const resumeRef = useRef<HTMLButtonElement>(null);
  const wonRef = useRef<HTMLDivElement>(null);
  const pausedByVisibilityRef = useRef(false);
  const hudSnapshotRef = useRef({
    balls: 1,
    bonusCatchSerial: 0,
    phase: "idle" as BreakoutPhase,
    remaining: BREAKOUT_TARGET_SEGMENTS,
    score: 0,
  });
  const gameOverTitleId = useId();
  const titleId = useId();
  const wonTitleId = useId();
  const [phase, setPhase] = useState<BreakoutPhase>("idle");
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [balls, setBalls] = useState(1);
  const [bonusAnnouncement, setBonusAnnouncement] = useState("");
  const [remaining, setRemaining] = useState(BREAKOUT_TARGET_SEGMENTS);
  const [pausedByVisibility, setPausedByVisibility] = useState(false);

  const scheduleUiFrame = useCallback((callback: () => void) => {
    const frame = window.requestAnimationFrame(() => {
      uiFramesRef.current.delete(frame);
      callback();
    });
    uiFramesRef.current.add(frame);
    return frame;
  }, []);

  const cancelUiFrames = useCallback(() => {
    for (const frame of uiFramesRef.current) {
      window.cancelAnimationFrame(frame);
    }
    uiFramesRef.current.clear();
  }, []);

  const persistBestScore = useCallback(() => {
    const currentScore = modelRef.current?.score ?? 0;
    const normalized = normalizeStoredBestScore(
      String(Math.max(bestRef.current, currentScore)),
    );
    if (normalized <= persistedBestRef.current) return;
    try {
      localStorage.setItem(BEST_SCORE_KEY, String(normalized));
      persistedBestRef.current = normalized;
    } catch {
      // Storage can be unavailable in private or hardened browsing modes.
    }
  }, []);

  const syncHud = useCallback(() => {
    const model = modelRef.current;
    const canvas = canvasRef.current;
    if (!model) return;

    const snapshot = hudSnapshotRef.current;
    const scoreChanged = snapshot.score !== model.score;
    const phaseChanged = snapshot.phase !== model.phase;
    const activeBalls = activeBreakoutBalls(model);
    const ballsChanged = snapshot.balls !== activeBalls;
    const bonusChanged = snapshot.bonusCatchSerial !== model.bonusCatchSerial;
    const remainingSegments =
      scoreChanged || phaseChanged
        ? remainingBreakoutBricks(model)
        : snapshot.remaining;

    if (phaseChanged) {
      snapshot.phase = model.phase;
      setPhase(model.phase);
    }
    if (scoreChanged) {
      snapshot.score = model.score;
      setScore(model.score);
    }
    if (snapshot.remaining !== remainingSegments) {
      snapshot.remaining = remainingSegments;
      setRemaining(remainingSegments);
    }
    if (ballsChanged) {
      snapshot.balls = activeBalls;
      setBalls(activeBalls);
    }
    if (bonusChanged) {
      snapshot.bonusCatchSerial = model.bonusCatchSerial;
      const nextAnnouncement =
        model.lastBonusType === "triple"
          ? copy.bonusTriple
          : model.lastBonusType === "plus-two"
            ? copy.bonusPlus
            : model.lastBonusType === "pierce"
              ? copy.bonusPierce
              : model.lastBonusType === "blast"
                ? copy.bonusBlast
                : "";
      setBonusAnnouncement("");
      if (nextAnnouncement) {
        scheduleUiFrame(() => setBonusAnnouncement(nextAnnouncement));
      }
    }

    if (model.score > bestRef.current) {
      bestRef.current = model.score;
      setBest(model.score);
    }

    if (!canvas) return;
    const now = performance.now();
    const diagnosticsDue =
      phaseChanged ||
      scoreChanged ||
      ballsChanged ||
      bonusChanged ||
      now - lastDiagnosticsAtRef.current >= 120;
    if (!diagnosticsDue) return;
    lastDiagnosticsAtRef.current = now;

    const currentSpeed = model.balls.reduce(
      (maximum, ball) =>
        Math.max(maximum, Math.hypot(ball.velocityX, ball.velocityY)),
      0,
    );
    const speedBounds = breakoutSpeedBounds(model);
    const setDiagnostic = (key: string, value: string) => {
      if (canvas.dataset[key] !== value) canvas.dataset[key] = value;
    };
    setDiagnostic("paddleX", model.paddleX.toFixed(2));
    setDiagnostic("activeBalls", String(activeBalls));
    setDiagnostic("activeBonuses", String(model.bonuses.length));
    setDiagnostic("bonusQueued", model.queuedBonus?.type ?? "none");
    setDiagnostic("lastBonus", model.lastBonusType ?? "none");
    setDiagnostic("bricksSinceBonus", String(model.bricksSinceBonus));
    setDiagnostic("bonusCooldown", model.bonusCooldown.toFixed(2));
    setDiagnostic("bonusBrickTarget", String(model.bonusBrickTarget));
    setDiagnostic("piercingActive", model.piercingActive ? "true" : "false");
    setDiagnostic(
      "blastRadiusActive",
      model.blastRadiusActive ? "true" : "false",
    );
    setDiagnostic("bricksRemaining", String(remainingSegments));
    setDiagnostic("combo", String(model.combo));
    setDiagnostic("debrisCount", String(model.debris.length));
    setDiagnostic("impactCount", String(model.impacts.length));
    setDiagnostic("lossFeedback", model.lossTtl > 0 ? "active" : "idle");
    setDiagnostic("hitFeedback", model.hitTtl > 0 ? "active" : "idle");
    setDiagnostic("controlLock", model.controlLockTtl > 0 ? "locked" : "ready");
    setDiagnostic("intro", model.introTtl > 0 ? "active" : "idle");
    setDiagnostic("ballSpeed", String(Math.round(currentSpeed)));
    setDiagnostic("minimumSpeed", String(Math.round(speedBounds.minimum)));
    setDiagnostic("maximumSpeed", String(Math.round(speedBounds.maximum)));
    setDiagnostic(
      "pointerControl",
      activePointerRef.current ? "dragging" : "idle",
    );
    setDiagnostic("winFeedback", model.winTtl > 0 ? "active" : "idle");
    setDiagnostic("targetCode", BREAKOUT_TARGET_CODE);
    setDiagnostic("targetSegments", String(model.bricks.length));
    setDiagnostic("reducedMotion", String(budgetRef.current.reducedMotion));
    setDiagnostic("logicalWidth", String(Math.round(model.width)));
    setDiagnostic("logicalHeight", String(Math.round(model.height)));
  }, [
    copy.bonusBlast,
    copy.bonusPierce,
    copy.bonusPlus,
    copy.bonusTriple,
    scheduleUiFrame,
  ]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const model = modelRef.current;
    if (!canvas || !model) return;
    drawGame(canvas, model, budgetRef.current, copy.playPrompt);
    syncIdleHomePosition(pageRef.current, model);
    syncHud();
  }, [copy.playPrompt, syncHud]);

  const cancelFrame = useCallback(() => {
    if (frameRef.current !== null) {
      window.cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }
    lastFrameAtRef.current = 0;
  }, []);

  const tick = useCallback(
    function animationTick(timestamp: number) {
      frameRef.current = null;
      const model = modelRef.current;
      if (!model) return;

      const delta = normalizedGameDelta(
        lastFrameAtRef.current === 0
          ? 16.67
          : timestamp - lastFrameAtRef.current,
      );
      lastFrameAtRef.current = timestamp;
      const previousPhase = model.phase;

      if (model.phase === "playing") {
        const direction =
          Number(keysRef.current.right) - Number(keysRef.current.left);
        if (direction !== 0) {
          moveBreakoutPaddle(
            model,
            model.paddleTargetX + direction * model.width * delta * 0.9,
          );
        }
        stepBreakoutModel(model, delta);
      } else if (model.phase === "won" || model.phase === "game-over") {
        stepBreakoutPresentation(model, delta);
      }

      if (previousPhase !== model.phase) {
        if (model.phase === "won") {
          scheduleUiFrame(() => wonRef.current?.focus({ preventScroll: true }));
        }
        if (model.phase === "game-over") {
          scheduleUiFrame(() =>
            retryRef.current?.focus({ preventScroll: true }),
          );
        }
      }
      draw();
      if (
        previousPhase !== model.phase &&
        (model.phase === "won" || model.phase === "game-over")
      ) {
        persistBestScore();
      }

      const presentationActive =
        model.winTtl > 0 ||
        model.lossTtl > 0 ||
        model.debris.length > 0 ||
        model.impacts.length > 0;
      if (model.phase === "playing" || presentationActive) {
        frameRef.current = window.requestAnimationFrame(animationTick);
      }
    },
    [draw, persistBestScore, scheduleUiFrame],
  );

  const scheduleFrame = useCallback(() => {
    if (frameRef.current !== null) return;
    frameRef.current = window.requestAnimationFrame(tick);
  }, [tick]);

  const clearActiveInput = useCallback(() => {
    const activePointer = activePointerRef.current;
    const canvas = canvasRef.current;
    if (activePointer && canvas?.hasPointerCapture?.(activePointer.id)) {
      try {
        canvas.releasePointerCapture(activePointer.id);
      } catch {
        // Pointer capture can already be released by the browser during teardown.
      }
    }
    activePointerRef.current = null;
    keysRef.current = { left: false, right: false };
    if (canvas) canvas.dataset.pointerControl = "idle";
  }, []);

  const startGame = useCallback(() => {
    let model = modelRef.current;
    if (!model) {
      const rect = shellRef.current?.getBoundingClientRect();
      model = createBreakoutModel(
        Math.max(280, Math.round(rect?.width ?? 640)),
        Math.max(260, Math.round(rect?.height ?? 400)),
      );
      modelRef.current = model;
    }
    persistBestScore();
    cancelFrame();
    cancelUiFrames();
    clearActiveInput();
    pausedByVisibilityRef.current = false;
    startBreakoutRun(model);
    setPausedByVisibility(false);
    syncHud();
    draw();
    scheduleUiFrame(() => canvasRef.current?.focus({ preventScroll: true }));
    scheduleFrame();
  }, [
    cancelFrame,
    cancelUiFrames,
    clearActiveInput,
    draw,
    persistBestScore,
    scheduleFrame,
    scheduleUiFrame,
    syncHud,
  ]);

  const pauseGame = useCallback(
    (nextPaused?: boolean) => {
      const model = modelRef.current;
      if (!model) return;
      const shouldPause = nextPaused ?? model.phase === "playing";
      cancelUiFrames();
      setBreakoutPaused(model, shouldPause);
      clearActiveInput();
      if (shouldPause) {
        cancelFrame();
        if (
          !pausedByVisibilityRef.current &&
          document.visibilityState === "visible"
        ) {
          scheduleUiFrame(() =>
            resumeRef.current?.focus({ preventScroll: true }),
          );
        }
      } else {
        pausedByVisibilityRef.current = false;
        setPausedByVisibility(false);
        lastFrameAtRef.current = 0;
        scheduleFrame();
        scheduleUiFrame(() =>
          canvasRef.current?.focus({ preventScroll: true }),
        );
      }
      syncHud();
      draw();
    },
    [
      cancelFrame,
      cancelUiFrames,
      clearActiveInput,
      draw,
      scheduleFrame,
      scheduleUiFrame,
      syncHud,
    ],
  );

  useEffect(() => {
    const page = pageRef.current;
    const header = document.querySelector<HTMLElement>(".site-header");
    const previousDocumentOverflow = document.documentElement.style.overflow;
    const previousBodyOverflow = document.body.style.overflow;

    const updateHeaderHeight = () => {
      const height = Math.max(
        0,
        Math.ceil(header?.getBoundingClientRect().height ?? 0),
      );
      page?.style.setProperty("--not-found-header-height", `${height}px`);
    };

    updateHeaderHeight();
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";

    const observer = header ? new ResizeObserver(updateHeaderHeight) : null;
    if (header && observer) observer.observe(header);
    window.addEventListener("resize", updateHeaderHeight);

    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", updateHeaderHeight);
      document.documentElement.style.overflow = previousDocumentOverflow;
      document.body.style.overflow = previousBodyOverflow;
    };
  }, []);

  useEffect(() => {
    let stored = 0;
    try {
      stored = normalizeStoredBestScore(localStorage.getItem(BEST_SCORE_KEY));
    } catch {
      stored = 0;
    }

    bestRef.current = stored;
    persistedBestRef.current = stored;
    const frame = window.requestAnimationFrame(() => setBest(stored));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    return () => {
      persistBestScore();
    };
  }, [persistBestScore]);

  useEffect(() => {
    const shell = shellRef.current;
    const canvas = canvasRef.current;
    if (!shell || !canvas) return;

    const coarsePointerQuery = window.matchMedia("(pointer: coarse)");
    const reducedMotionQuery = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );
    const resize = () => {
      const rect = shell.getBoundingClientRect();
      const width = Math.max(280, Math.round(rect.width));
      const height = Math.max(260, Math.round(rect.height));
      const budget = gameRenderBudget(
        width,
        height,
        window.devicePixelRatio,
        coarsePointerQuery.matches,
        reducedMotionQuery.matches,
      );
      budgetRef.current = budget;
      canvas.width = Math.max(1, Math.round(width * budget.pixelRatio));
      canvas.height = Math.max(1, Math.round(height * budget.pixelRatio));
      canvas.dataset.pixelRatio = String(budget.pixelRatio);
      canvas.dataset.renderTier = budget.tier;
      canvas.dataset.reducedMotion = String(budget.reducedMotion);

      if (modelRef.current)
        resizeBreakoutModel(modelRef.current, width, height);
      else modelRef.current = createBreakoutModel(width, height);
      draw();
    };

    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(shell);
    coarsePointerQuery.addEventListener("change", resize);
    reducedMotionQuery.addEventListener("change", resize);
    window.addEventListener("orientationchange", resize);
    return () => {
      observer.disconnect();
      coarsePointerQuery.removeEventListener("change", resize);
      reducedMotionQuery.removeEventListener("change", resize);
      window.removeEventListener("orientationchange", resize);
      cancelFrame();
      cancelUiFrames();
      clearActiveInput();
    };
  }, [cancelFrame, cancelUiFrames, clearActiveInput, draw]);

  useEffect(() => {
    const focusResumeControl = () => {
      scheduleUiFrame(() => {
        const model = modelRef.current;
        if (
          pausedByVisibilityRef.current &&
          model?.phase === "paused" &&
          document.visibilityState === "visible"
        ) {
          resumeRef.current?.focus({ preventScroll: true });
        }
      });
    };

    const pauseForInterruption = () => {
      const model = modelRef.current;
      if (!model || model.phase !== "playing") return;
      pausedByVisibilityRef.current = true;
      setPausedByVisibility(true);
      persistBestScore();
      clearActiveInput();
      pauseGame(true);
    };

    const handleVisibility = () => {
      if (document.visibilityState === "hidden") pauseForInterruption();
      else if (pausedByVisibilityRef.current) focusResumeControl();
    };

    const handleWindowBlur = () => pauseForInterruption();
    const handleWindowFocus = () => {
      if (pausedByVisibilityRef.current) focusResumeControl();
    };
    const handleWindowPointerEnd = (event: PointerEvent) => {
      if (activePointerRef.current?.id !== event.pointerId) return;
      clearActiveInput();
      syncHud();
    };

    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("blur", handleWindowBlur);
    window.addEventListener("focus", handleWindowFocus);
    window.addEventListener("pagehide", pauseForInterruption);
    window.addEventListener("pointerup", handleWindowPointerEnd, true);
    window.addEventListener("pointercancel", handleWindowPointerEnd, true);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("blur", handleWindowBlur);
      window.removeEventListener("focus", handleWindowFocus);
      window.removeEventListener("pagehide", pauseForInterruption);
      window.removeEventListener("pointerup", handleWindowPointerEnd, true);
      window.removeEventListener("pointercancel", handleWindowPointerEnd, true);
    };
  }, [clearActiveInput, pauseGame, persistBestScore, scheduleUiFrame, syncHud]);

  const clientXToLogical = useCallback((clientX: number): number | null => {
    const canvas = canvasRef.current;
    const model = modelRef.current;
    if (!canvas || !model) return null;
    const rect = canvas.getBoundingClientRect();
    if (rect.width <= 0) return null;
    return ((clientX - rect.left) / rect.width) * model.width;
  }, []);

  const pointerToPaddle = useCallback(
    (clientX: number, offsetX = 0) => {
      const model = modelRef.current;
      const logicalX = clientXToLogical(clientX);
      if (!model || logicalX === null) return;
      moveBreakoutPaddle(model, logicalX + offsetX);
      if (model.phase !== "playing") draw();
    },
    [clientXToLogical, draw],
  );

  const releasePointer = useCallback(
    (event: ReactPointerEvent<HTMLCanvasElement>) => {
      if (event.currentTarget.hasPointerCapture?.(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }
      if (activePointerRef.current?.id === event.pointerId) {
        activePointerRef.current = null;
        syncHud();
      }
    },
    [syncHud],
  );

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLCanvasElement>) => {
    const model = modelRef.current;
    if (!model) return;
    const key = event.key.toLowerCase();
    if (key === "arrowleft" || key === "a") {
      event.preventDefault();
      keysRef.current.left = true;
      scheduleFrame();
      return;
    }
    if (key === "arrowright" || key === "d") {
      event.preventDefault();
      keysRef.current.right = true;
      scheduleFrame();
      return;
    }
    if ((key === "p" || key === "escape") && !event.repeat) {
      event.preventDefault();
      if (model.phase === "playing" || model.phase === "paused") pauseGame();
      return;
    }
    if ((key === " " || key === "enter") && !event.repeat) {
      event.preventDefault();
      if (model.phase === "idle" || model.phase === "game-over") startGame();
      else if (model.phase === "paused") pauseGame(false);
    }
  };

  const handleKeyUp = (event: ReactKeyboardEvent<HTMLCanvasElement>) => {
    const key = event.key.toLowerCase();
    if (key === "arrowleft" || key === "a") keysRef.current.left = false;
    if (key === "arrowright" || key === "d") keysRef.current.right = false;
  };

  return (
    <section
      className={styles.page}
      data-game-phase={phase}
      data-testid="not-found-game"
      ref={pageRef}
    >
      <h1 className={styles.srOnly}>{title}</h1>
      <div className={styles.copyBlock}>
        <div>
          <p className={styles.eyebrow}>404</p>
          <h1>404</h1>
          <p>{body}</p>
        </div>
        <Link
          className={styles.homeLink}
          data-testid="not-found-home-link"
          href="/"
        >
          {homeLabel || copy.returnHome}
        </Link>
      </div>

      <section
        aria-labelledby={titleId}
        className={styles.gameCard}
        data-game-target={BREAKOUT_TARGET_CODE}
      >
        <header className={styles.srOnly}>
          <h2 id={titleId}>{copy.gameTitle}</h2>
          <p>{copy.gameLead}</p>
        </header>

        <p aria-live="polite" className={styles.srOnly}>
          {bonusAnnouncement}
        </p>

        <div
          className={styles.canvasShell}
          onClick={() => {
            if (modelRef.current?.phase === "idle") startGame();
          }}
          ref={shellRef}
        >
          <dl
            aria-label={copy.gameTitle}
            className={styles.hud}
            data-testid="not-found-hud"
          >
            <div>
              <dt>{copy.score}</dt>
              <dd data-testid="not-found-score">{score}</dd>
            </div>
            <div>
              <dt>{copy.best}</dt>
              <dd data-testid="not-found-best-score">{best}</dd>
            </div>
            <div>
              <dt>{copy.remaining}</dt>
              <dd data-testid="not-found-remaining">{remaining}</dd>
            </div>
            <div>
              <dt>{copy.balls}</dt>
              <dd data-testid="not-found-balls">{balls}</dd>
            </div>
          </dl>

          <canvas
            aria-label={
              phase === "idle"
                ? `${copy.canvasLabel} ${copy.canvasIdleHint}`
                : copy.canvasLabel
            }
            aria-keyshortcuts="ArrowLeft ArrowRight A D P Escape Space Enter"
            aria-roledescription={copy.gameRole}
            className={styles.canvas}
            data-ball-visibility={phase === "idle" ? "hidden" : "visible"}
            data-bricks-remaining={remaining}
            data-target-code={BREAKOUT_TARGET_CODE}
            data-target-segments={BREAKOUT_TARGET_SEGMENTS}
            data-testid="not-found-game-canvas"
            onBlur={clearActiveInput}
            onContextMenu={(event: ReactMouseEvent<HTMLCanvasElement>) =>
              event.preventDefault()
            }
            onKeyDown={handleKeyDown}
            onKeyUp={handleKeyUp}
            onPointerDown={(event: ReactPointerEvent<HTMLCanvasElement>) => {
              if (
                !event.isPrimary ||
                (event.pointerType === "mouse" && event.button !== 0)
              ) {
                return;
              }
              event.currentTarget.focus();
              if (phase === "idle") {
                startGame();
                return;
              }

              const logicalX = clientXToLogical(event.clientX);
              const model = modelRef.current;
              if (logicalX === null || !model) return;
              const offsetX =
                event.pointerType === "touch" ? model.paddleX - logicalX : 0;
              activePointerRef.current = { id: event.pointerId, offsetX };
              event.currentTarget.setPointerCapture?.(event.pointerId);
              pointerToPaddle(event.clientX, offsetX);
              syncHud();
            }}
            onPointerMove={(event: ReactPointerEvent<HTMLCanvasElement>) => {
              if (!event.isPrimary) return;
              if (event.pointerType === "mouse") {
                pointerToPaddle(event.clientX);
                return;
              }
              const activePointer = activePointerRef.current;
              if (activePointer && activePointer.id === event.pointerId) {
                pointerToPaddle(event.clientX, activePointer.offsetX);
              }
            }}
            onPointerUp={releasePointer}
            onPointerCancel={releasePointer}
            onLostPointerCapture={releasePointer}
            ref={canvasRef}
            role="application"
            tabIndex={0}
          />

          {phase === "paused" ? (
            <div
              className={styles.overlay}
              data-overlay="paused"
              data-pause-source={pausedByVisibility ? "interruption" : "manual"}
            >
              <div className={styles.resultPanel} role="status">
                <strong>{copy.paused}</strong>
                <p>{copy.controls}</p>
                <div className={styles.resultActions}>
                  <button
                    onClick={() => pauseGame(false)}
                    ref={resumeRef}
                    type="button"
                  >
                    {copy.resume}
                  </button>
                </div>
              </div>
            </div>
          ) : null}

          {phase === "game-over" ? (
            <div className={styles.overlay} data-overlay="game-over">
              <div
                aria-labelledby={gameOverTitleId}
                aria-atomic="true"
                className={styles.resultPanel}
                role="alert"
              >
                <strong id={gameOverTitleId}>{copy.gameOver}</strong>
                <p>{copy.gameOverBody}</p>
                <dl className={styles.resultStats}>
                  <div>
                    <dt>{copy.score}</dt>
                    <dd>{score}</dd>
                  </div>
                  <div>
                    <dt>{copy.best}</dt>
                    <dd>{best}</dd>
                  </div>
                </dl>
                <div className={styles.resultActions}>
                  <button onClick={startGame} ref={retryRef} type="button">
                    {copy.retry}
                  </button>
                  <Link href="/">{homeLabel || copy.returnHome}</Link>
                </div>
              </div>
            </div>
          ) : null}

          {phase === "won" ? (
            <div className={styles.overlay} data-overlay="won">
              <div
                aria-labelledby={wonTitleId}
                aria-atomic="true"
                className={styles.resultPanel}
                ref={wonRef}
                role="alert"
                tabIndex={-1}
              >
                <strong id={wonTitleId}>{copy.won}</strong>
                <p>{copy.wonBody}</p>
                <dl className={styles.resultStats}>
                  <div>
                    <dt>{copy.score}</dt>
                    <dd>{score}</dd>
                  </div>
                  <div>
                    <dt>{copy.best}</dt>
                    <dd>{best}</dd>
                  </div>
                </dl>
                <div className={styles.resultActions}>
                  <Link href="/">{homeLabel || copy.returnHome}</Link>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </section>
    </section>
  );
}
