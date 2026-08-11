export type BreakoutPhase = "idle" | "playing" | "paused" | "won" | "game-over";

export type BreakoutDigit = "0" | "4" | "face";

export interface BreakoutBrick {
  alive: boolean;
  column: number;
  digit: BreakoutDigit;
  digitIndex: number;
  height: number;
  id: string;
  row: number;
  tone: number;
  width: number;
  x: number;
  y: number;
}

export interface BreakoutDebris {
  maxTtl: number;
  rotation: number;
  size: number;
  spin: number;
  tone: number;
  ttl: number;
  velocityX: number;
  velocityY: number;
  x: number;
  y: number;
}

export interface BreakoutImpactPulse {
  maxTtl: number;
  radius: number;
  tone: number;
  ttl: number;
  x: number;
  y: number;
}

export interface BreakoutBall {
  id: number;
  radius: number;
  velocityX: number;
  velocityY: number;
  x: number;
  y: number;
}

export type BreakoutBonusType = "plus-two" | "triple" | "pierce" | "blast";

export interface BreakoutBonus {
  id: number;
  rotation: number;
  size: number;
  spin: number;
  type: BreakoutBonusType;
  velocityY: number;
  x: number;
  y: number;
}

export interface BreakoutQueuedBonus {
  type: BreakoutBonusType;
  x: number;
  y: number;
}

export interface BreakoutModel {
  ballRadius: number;
  ballVelocityX: number;
  ballVelocityY: number;
  ballX: number;
  ballY: number;
  balls: BreakoutBall[];
  bonuses: BreakoutBonus[];
  bonusCatchSerial: number;
  bonusCatchTtl: number;
  bonusCooldown: number;
  bonusBrickTarget: 3 | 4;
  bricksSinceBonus: number;
  blastRadiusActive: boolean;
  bricks: BreakoutBrick[];
  combo: number;
  comboWindow: number;
  controlLockTtl: number;
  debris: BreakoutDebris[];
  height: number;
  hitTtl: number;
  impacts: BreakoutImpactPulse[];
  lossTtl: number;
  lastBonusType: BreakoutBonusType | null;
  nextBallId: number;
  nextBonusId: number;
  paddleHeight: number;
  piercingActive: boolean;
  paddleTargetX: number;
  paddleWidth: number;
  paddleX: number;
  paddleY: number;
  phase: BreakoutPhase;
  queuedBonus: BreakoutQueuedBonus | null;
  score: number;
  seed: number;
  serveDelay: number;
  introTtl: number;
  width: number;
  winTtl: number;
}

interface BrickContact {
  brick: BreakoutBrick;
  normalX: number;
  normalY: number;
  penetration: number;
  pointX: number;
  pointY: number;
}

interface BrickSpatialIndex {
  readonly bricks: readonly BreakoutBrick[];
  readonly buckets: ReadonlyMap<string, readonly BreakoutBrick[]>;
  readonly cellSize: number;
}

const brickSpatialIndexes = new WeakMap<BreakoutModel, BrickSpatialIndex>();

const MAX_STEP_SECONDS = 1 / 30;
const SUBSTEP_SECONDS = 1 / 240;
const MAX_DEBRIS = 48;
const MAX_IMPACTS = 6;
export const BREAKOUT_MAX_ACTIVE_BONUSES = 4;
export const BREAKOUT_BONUS_MIN_BRICKS = 3;
export const BREAKOUT_BONUS_GUARANTEE_BRICKS = 4;
export const BREAKOUT_BLAST_RADIUS_BLOCKS = 3;
const BREAKOUT_BONUS_INITIAL_COOLDOWN = 0;
const BREAKOUT_BONUS_COOLDOWN = 0;
const BREAKOUT_BONUS_QUEUE_RELEASE_DELAY = 0.05;
const TARGET_DIGITS = ["4", "0", "4"] as const;
const DIGIT_ROWS = 7;
const DIGIT_COLUMNS = 5;
const FACE_PIXEL_MASK = [
  "00000000000000011111111000000000000000",
  "00000000000001111111111110000000000000",
  "00000000001111111111111111110000000000",
  "00000000011111100000000111111000000000",
  "00000001111110000000000001111110000000",
  "00000011111000000000000000011111000000",
  "00000111110000000000000000001111100000",
  "00001111100000000000000000000111110000",
  "00001111000000000000000000000011110000",
  "00011110001000001000010000010001111000",
  "00111100011100011100111000111000111100",
  "00111100001110111000011101110000111100",
  "01111000000111110000001111100000011110",
  "01111000000011100000000111000000011110",
  "01110000000111110000001111100000001110",
  "11100000001110111000011101110000000111",
  "11100000011100011100111000111000000111",
  "11100000001000001000010000010000000111",
  "11100000000000000000000000000000000111",
  "11100000000000000000000000000000000111",
  "11100000000000000000000000000000000111",
  "11100000000000000000000000000000000111",
  "11100000000000000000000000000000000111",
  "01110000000000000000000000000000001110",
  "01111000000000001111110000000000011110",
  "01111000000000111111111100000000011110",
  "00111100000001111000011110000000111100",
  "00111100000011110000001111000000111100",
  "00011110000011100000000111000001111000",
  "00001111000000000000000000000011110000",
  "00001111100000000000000000000111110000",
  "00000111110000000000000000001111100000",
  "00000011111000000000000000011111000000",
  "00000001111110000000000001111110000000",
  "00000000011111100000000111111000000000",
  "00000000001111111111111111110000000000",
  "00000000000001111111111110000000000000",
  "00000000000000011111111000000000000000",
] as const;
const DIGIT_STROKE_BLOCKS = 6;
const DIGIT_BRICK_SUBDIVISIONS = DIGIT_STROKE_BLOCKS ** 2;

const DIGIT_MASKS: Readonly<
  Record<Exclude<BreakoutDigit, "face">, readonly string[]>
> = {
  "0": ["01110", "10001", "10011", "10101", "11001", "10001", "01110"],
  "4": ["10010", "10010", "10010", "11111", "00010", "00010", "00010"],
};

export const BREAKOUT_TARGET_CODE = "404";
export const BREAKOUT_TARGET_SEGMENTS =
  FACE_PIXEL_MASK.reduce((total, row) => total + row.split("1").length - 1, 0) +
  TARGET_DIGITS.reduce(
    (total, digit) =>
      total +
      DIGIT_MASKS[digit].reduce(
        (digitTotal, row) => digitTotal + row.split("1").length - 1,
        0,
      ) *
        DIGIT_BRICK_SUBDIVISIONS,
    0,
  );

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(maximum, Math.max(minimum, value));
}

function finiteOr(value: number, fallback: number): number {
  return Number.isFinite(value) ? value : fallback;
}

function breakoutBonusSize(width: number, height: number): number {
  return clamp(Math.min(width, height) * 0.055, 20, 30);
}

function breakoutBonusVelocity(height: number): number {
  return clamp(height * 0.24, 112, 172);
}

export function breakoutBonusDropChance(bricksSinceBonus: number): number {
  const cleared = Math.max(0, Math.floor(finiteOr(bricksSinceBonus, 0)));
  if (cleared < BREAKOUT_BONUS_MIN_BRICKS) return 0;
  if (cleared >= BREAKOUT_BONUS_GUARANTEE_BRICKS) return 1;
  return 0.5;
}

function safeDimension(value: number): number {
  return Math.max(1, finiteOr(value, 1));
}

export function breakoutPlayfieldTop(): number {
  // The canvas begins immediately below the measured site header.
  // A zero ceiling therefore makes the physical top wall exactly the
  // header's lower edge instead of reserving another hidden HUD band.
  return 0;
}

function nextRandom(model: BreakoutModel): number {
  model.seed = (model.seed * 1_664_525 + 1_013_904_223) >>> 0;
  return model.seed / 4_294_967_296;
}

function layoutBricks(
  width: number,
  height: number,
  previous?: readonly BreakoutBrick[],
): BreakoutBrick[] {
  const shortSide = Math.min(width, height);
  const compactLandscape = height < 500 && width > height;
  const digitBlockColumns = DIGIT_COLUMNS * DIGIT_STROKE_BLOCKS;
  const digitBlockRows = DIGIT_ROWS * DIGIT_STROKE_BLOCKS;
  const digitGapBlocks = 5;
  const totalDigitColumns =
    TARGET_DIGITS.length * digitBlockColumns +
    (TARGET_DIGITS.length - 1) * digitGapBlocks;

  const desiredBlockSize = compactLandscape
    ? clamp(shortSide * 0.0067, 2.4, 3.2)
    : clamp(shortSide * 0.00595, 3.6, 5.8);
  const desiredGap = compactLandscape
    ? clamp(shortSide * 0.0012, 0.6, 0.9)
    : clamp(shortSide * 0.00145, 0.8, 1.45);
  const sharedPitch = Math.max(
    1.7,
    Math.min(
      desiredBlockSize + desiredGap,
      (width * 0.82) / totalDigitColumns,
      (height * (compactLandscape ? 0.27 : 0.3)) / digitBlockRows,
    ),
  );
  const sharedGap = clamp(
    sharedPitch * 0.18,
    Math.min(0.45, sharedPitch * 0.24),
    Math.min(1.25, sharedPitch * 0.32),
  );
  const sharedBlockSize = Math.max(1.1, sharedPitch - sharedGap);
  const faceGap = sharedGap;
  const faceBlockSize = sharedBlockSize;
  const facePitch = sharedPitch;
  const digitPitch = sharedPitch;
  const digitGap = sharedGap;
  const digitBlockSize = sharedBlockSize;
  const digitLogicalPitch = DIGIT_STROKE_BLOCKS * digitPitch;
  const digitSpacing = digitGapBlocks * digitPitch;

  const faceColumns = FACE_PIXEL_MASK[0]?.length ?? 0;
  const faceRows = FACE_PIXEL_MASK.length;
  const faceWidth = faceColumns * facePitch - faceGap;
  const faceHeight = faceRows * facePitch - faceGap;
  const faceX = (width - faceWidth) * 0.5;

  const digitWidth = digitBlockColumns * digitPitch - digitGap;
  const totalDigitWidth =
    TARGET_DIGITS.length * digitWidth +
    (TARGET_DIGITS.length - 1) * digitSpacing;
  const digitStartX = (width - totalDigitWidth) * 0.5;

  const faceTop = compactLandscape
    ? clamp(height * 0.045, 16, 22)
    : clamp(height * 0.062, 26, 52);
  const compositionGap = compactLandscape
    ? clamp(shortSide * 0.14, 50, 58)
    : clamp(shortSide * 0.102, 64, 92);
  const codeTop = faceTop + faceHeight + compositionGap;

  const previousAlive = new Map(
    previous?.map((brick) => [brick.id, brick.alive]) ?? [],
  );
  const bricks: BreakoutBrick[] = [];

  for (let row = 0; row < faceRows; row += 1) {
    const maskRow = FACE_PIXEL_MASK[row] ?? "";
    for (let column = 0; column < faceColumns; column += 1) {
      if (maskRow[column] !== "1") continue;
      const id = `face:${row}:${column}`;
      bricks.push({
        alive: previousAlive.get(id) ?? true,
        column,
        digit: "face",
        digitIndex: -1,
        height: faceBlockSize,
        id,
        row,
        tone: (row + column) % 3,
        width: faceBlockSize,
        x: faceX + column * facePitch,
        y: faceTop + row * facePitch,
      });
    }
  }

  TARGET_DIGITS.forEach((digit, digitIndex) => {
    const mask = DIGIT_MASKS[digit];
    const digitX = digitStartX + digitIndex * (digitWidth + digitSpacing);
    for (let row = 0; row < DIGIT_ROWS; row += 1) {
      const maskRow = mask[row] ?? "";
      for (let column = 0; column < DIGIT_COLUMNS; column += 1) {
        if (maskRow[column] !== "1") continue;
        for (let subRow = 0; subRow < DIGIT_STROKE_BLOCKS; subRow += 1) {
          for (
            let subColumn = 0;
            subColumn < DIGIT_STROKE_BLOCKS;
            subColumn += 1
          ) {
            const id = `${digitIndex}:${row}:${column}:${subRow}:${subColumn}`;
            bricks.push({
              alive: previousAlive.get(id) ?? true,
              column,
              digit,
              digitIndex,
              height: digitBlockSize,
              id,
              row,
              tone: (row + column + subRow + subColumn + digitIndex) % 3,
              width: digitBlockSize,
              x: digitX + column * digitLogicalPitch + subColumn * digitPitch,
              y: codeTop + row * digitLogicalPitch + subRow * digitPitch,
            });
          }
        }
      }
    }
  });

  return bricks;
}

function paddleMetrics(width: number, height: number) {
  const paddleWidth = clamp(width * 0.17, 54, 96);
  const paddleHeight = clamp(height * 0.016, 6, 10);
  const paddleY = height - clamp(height * 0.085, 36, 62);
  const ballRadius = clamp(Math.min(width, height) * 0.0068, 2.4, 4.2);
  return { ballRadius, paddleHeight, paddleWidth, paddleY };
}

export interface BreakoutSpeedBounds {
  readonly initial: number;
  readonly maximum: number;
  readonly minimum: number;
}

export function breakoutSpeedBounds(
  model: Pick<BreakoutModel, "height" | "width">,
): BreakoutSpeedBounds {
  const shortSide = Math.min(model.width, model.height);
  const minimum = clamp(shortSide * 0.28, 150, 220);
  const maximum = clamp(shortSide * 0.82, 360, 560);
  return {
    initial: clamp(shortSide * 0.34, minimum + 18, Math.min(240, maximum - 70)),
    maximum,
    minimum,
  };
}

function syncLegacyFromPrimary(model: BreakoutModel): void {
  const primary = model.balls[0];
  if (!primary) {
    model.ballX = model.paddleX;
    model.ballY = model.paddleY - model.ballRadius - 2;
    model.ballVelocityX = 0;
    model.ballVelocityY = 0;
    return;
  }
  model.ballRadius = primary.radius;
  model.ballX = primary.x;
  model.ballY = primary.y;
  model.ballVelocityX = primary.velocityX;
  model.ballVelocityY = primary.velocityY;
}

function syncPrimaryFromLegacy(model: BreakoutModel): void {
  const primary = model.balls[0];
  if (!primary) return;
  primary.radius = finiteOr(model.ballRadius, primary.radius);
  primary.x = finiteOr(model.ballX, primary.x);
  primary.y = finiteOr(model.ballY, primary.y);
  primary.velocityX = finiteOr(model.ballVelocityX, primary.velocityX);
  primary.velocityY = finiteOr(model.ballVelocityY, primary.velocityY);
}

function setBallSpeed(
  model: Pick<BreakoutModel, "height" | "width">,
  ball: BreakoutBall,
  requestedSpeed: number,
): void {
  const currentSpeed = Math.hypot(ball.velocityX, ball.velocityY);
  const bounds = breakoutSpeedBounds(model);
  const nextSpeed = clamp(
    finiteOr(requestedSpeed, bounds.initial),
    bounds.minimum,
    bounds.maximum,
  );
  if (currentSpeed < 1) {
    ball.velocityX = nextSpeed * 0.42;
    ball.velocityY = -Math.sqrt(
      Math.max(1, nextSpeed * nextSpeed - ball.velocityX ** 2),
    );
    return;
  }
  const scale = nextSpeed / currentSpeed;
  ball.velocityX *= scale;
  ball.velocityY *= scale;
}

function constrainBallDirection(ball: BreakoutBall): void {
  const speed = Math.hypot(ball.velocityX, ball.velocityY);
  if (speed < 1) return;

  const minimumHorizontal = speed * 0.18;
  const maximumHorizontal = speed * 0.9;
  const horizontalSign = ball.velocityX >= 0 ? 1 : -1;
  const verticalSign = ball.velocityY >= 0 ? 1 : -1;
  let horizontal = Math.abs(ball.velocityX);

  if (horizontal < minimumHorizontal) {
    horizontal = minimumHorizontal;
  } else if (horizontal > maximumHorizontal) {
    horizontal = maximumHorizontal;
  }

  ball.velocityX = horizontal * horizontalSign;
  ball.velocityY =
    verticalSign *
    Math.sqrt(Math.max(1, speed * speed - horizontal * horizontal));
}

function applyPlayfieldMetrics(model: BreakoutModel): void {
  const metrics = paddleMetrics(model.width, model.height);
  model.paddleWidth = metrics.paddleWidth;
  model.paddleHeight = metrics.paddleHeight;
  model.paddleY = metrics.paddleY;
  model.ballRadius = metrics.ballRadius;
  for (const ball of model.balls) ball.radius = metrics.ballRadius;
  setPaddleTarget(model, model.paddleTargetX);
  model.paddleX = clamp(
    model.paddleX,
    model.paddleWidth * 0.5,
    model.width - model.paddleWidth * 0.5,
  );
}

function createServeBall(model: BreakoutModel): BreakoutBall {
  const speed = breakoutSpeedBounds(model).initial;
  const direction = model.seed % 2 === 0 ? 1 : -1;
  const horizontalRatio = 0.34 + ((model.seed >>> 8) % 19) / 100;
  const velocityX = speed * horizontalRatio * direction;
  return {
    id: model.nextBallId++,
    radius: model.ballRadius,
    velocityX,
    velocityY: -Math.sqrt(Math.max(1, speed * speed - velocityX * velocityX)),
    x: model.paddleX,
    y: model.paddleY - model.ballRadius - 2,
  };
}

function resetServe(model: BreakoutModel, delay = 0.62): void {
  model.balls = [createServeBall(model)];
  model.serveDelay = delay;
  constrainBallDirection(model.balls[0]!);
  syncLegacyFromPrimary(model);
}

export function createBreakoutModel(
  width: number,
  height: number,
  seed = 0x48454c49,
): BreakoutModel {
  const safeWidth = safeDimension(width);
  const safeHeight = safeDimension(height);
  const metrics = paddleMetrics(safeWidth, safeHeight);
  const paddleX = safeWidth * 0.5;
  const model: BreakoutModel = {
    ballRadius: metrics.ballRadius,
    ballVelocityX: 0,
    ballVelocityY: 0,
    ballX: paddleX,
    ballY: metrics.paddleY - metrics.ballRadius - 2,
    balls: [],
    bonuses: [],
    bonusCatchSerial: 0,
    bonusCatchTtl: 0,
    bonusCooldown: 0,
    bonusBrickTarget: (seed & 1) === 0 ? 3 : 4,
    bricksSinceBonus: 0,
    blastRadiusActive: false,
    bricks: layoutBricks(safeWidth, safeHeight),
    combo: 0,
    comboWindow: 0,
    controlLockTtl: 0,
    debris: [],
    height: safeHeight,
    hitTtl: 0,
    impacts: [],
    lossTtl: 0,
    lastBonusType: null,
    nextBallId: 0,
    nextBonusId: 0,
    paddleHeight: metrics.paddleHeight,
    piercingActive: false,
    paddleTargetX: paddleX,
    paddleWidth: metrics.paddleWidth,
    paddleX,
    paddleY: metrics.paddleY,
    phase: "idle",
    queuedBonus: null,
    score: 0,
    seed: seed >>> 0,
    serveDelay: 0,
    introTtl: 0,
    width: safeWidth,
    winTtl: 0,
  };
  resetServe(model, 0);
  model.phase = "idle";
  return model;
}

export function startBreakoutRun(model: BreakoutModel): void {
  model.score = 0;
  model.combo = 0;
  model.comboWindow = 0;
  model.controlLockTtl = 0.16;
  model.debris = [];
  model.hitTtl = 0;
  model.impacts = [];
  model.lossTtl = 0;
  model.winTtl = 0;
  model.bonuses = [];
  model.bonusCatchSerial = 0;
  model.bonusCatchTtl = 0;
  model.bonusCooldown = BREAKOUT_BONUS_INITIAL_COOLDOWN;
  model.bonusBrickTarget = nextRandom(model) < 0.5 ? 3 : 4;
  model.bricksSinceBonus = 0;
  model.blastRadiusActive = false;
  model.piercingActive = false;
  model.lastBonusType = null;
  model.queuedBonus = null;
  model.nextBallId = 0;
  model.nextBonusId = 0;
  model.phase = "playing";
  model.introTtl = 0.78;
  applyPlayfieldMetrics(model);
  model.paddleX = model.width * 0.5;
  model.paddleTargetX = model.paddleX;
  model.bricks = layoutBricks(model.width, model.height);
  resetServe(model, 0.48);
}

export function setBreakoutPaused(model: BreakoutModel, paused: boolean): void {
  if (paused && model.phase === "playing") model.phase = "paused";
  if (!paused && model.phase === "paused") model.phase = "playing";
}

function setPaddleTarget(model: BreakoutModel, centerX: number): void {
  const half = model.paddleWidth * 0.5;
  model.paddleTargetX = clamp(
    finiteOr(centerX, model.width * 0.5),
    half,
    model.width - half,
  );
}

export function moveBreakoutPaddle(
  model: BreakoutModel,
  centerX: number,
): void {
  setPaddleTarget(model, centerX);
}

export function resizeBreakoutModel(
  model: BreakoutModel,
  width: number,
  height: number,
): void {
  syncPrimaryFromLegacy(model);
  const nextWidth = safeDimension(width);
  const nextHeight = safeDimension(height);
  const previousWidth = safeDimension(model.width);
  const previousHeight = safeDimension(model.height);
  const xRatio = nextWidth / previousWidth;
  const yRatio = nextHeight / previousHeight;

  model.width = nextWidth;
  model.height = nextHeight;
  applyPlayfieldMetrics(model);
  model.paddleX = finiteOr(model.paddleX * xRatio, nextWidth * 0.5);
  model.paddleTargetX = finiteOr(model.paddleTargetX * xRatio, model.paddleX);
  for (const ball of model.balls) {
    ball.x = finiteOr(ball.x * xRatio, model.paddleX);
    ball.y = finiteOr(ball.y * yRatio, model.paddleY);
    ball.velocityX = finiteOr(ball.velocityX * xRatio, 0);
    ball.velocityY = finiteOr(ball.velocityY * yRatio, 0);
    ball.radius = model.ballRadius;
    setBallSpeed(model, ball, Math.hypot(ball.velocityX, ball.velocityY));
    constrainBallDirection(ball);
  }
  model.bricks = layoutBricks(nextWidth, nextHeight, model.bricks);
  const resizedBonusSize = breakoutBonusSize(nextWidth, nextHeight);
  const resizedBonusVelocity = breakoutBonusVelocity(nextHeight);
  model.bonuses = model.bonuses.map((bonus) => ({
    ...bonus,
    size: resizedBonusSize,
    velocityY: resizedBonusVelocity,
    x: clamp(bonus.x * xRatio, resizedBonusSize, nextWidth - resizedBonusSize),
    y: clamp(
      bonus.y * yRatio,
      -resizedBonusSize,
      nextHeight + resizedBonusSize,
    ),
  }));
  if (model.queuedBonus) {
    model.queuedBonus = {
      ...model.queuedBonus,
      x: clamp(
        model.queuedBonus.x * xRatio,
        resizedBonusSize,
        nextWidth - resizedBonusSize,
      ),
      y: clamp(
        model.queuedBonus.y * yRatio,
        -resizedBonusSize,
        nextHeight + resizedBonusSize,
      ),
    };
  }
  model.debris = model.debris.map((particle) => ({
    ...particle,
    velocityX: particle.velocityX * xRatio,
    velocityY: particle.velocityY * yRatio,
    x: particle.x * xRatio,
    y: particle.y * yRatio,
  }));
  model.impacts = model.impacts.map((impact) => ({
    ...impact,
    radius: impact.radius * Math.min(xRatio, yRatio),
    x: impact.x * xRatio,
    y: impact.y * yRatio,
  }));

  setPaddleTarget(model, model.paddleX);
  model.paddleX = model.paddleTargetX;
  for (const ball of model.balls) {
    ball.x = clamp(ball.x, ball.radius, nextWidth - ball.radius);
    ball.y = clamp(
      ball.y,
      ball.radius,
      Math.max(ball.radius, nextHeight + ball.radius),
    );
  }

  if (model.serveDelay > 0 || model.phase === "idle") {
    const primary = model.balls[0];
    if (primary) {
      primary.x = model.paddleX;
      primary.y = model.paddleY - primary.radius - 2;
    }
  }
  syncLegacyFromPrimary(model);
}

function brickContact(
  ball: BreakoutBall,
  brick: BreakoutBrick,
): BrickContact | null {
  const closestX = clamp(ball.x, brick.x, brick.x + brick.width);
  const closestY = clamp(ball.y, brick.y, brick.y + brick.height);
  const deltaX = ball.x - closestX;
  const deltaY = ball.y - closestY;
  const distanceSquared = deltaX * deltaX + deltaY * deltaY;
  const radiusSquared = ball.radius * ball.radius;
  if (distanceSquared > radiusSquared) return null;

  if (distanceSquared > 1e-8) {
    const distance = Math.sqrt(distanceSquared);
    return {
      brick,
      normalX: deltaX / distance,
      normalY: deltaY / distance,
      penetration: ball.radius - distance,
      pointX: closestX,
      pointY: closestY,
    };
  }

  const left = Math.abs(ball.x - brick.x);
  const right = Math.abs(brick.x + brick.width - ball.x);
  const top = Math.abs(ball.y - brick.y);
  const bottom = Math.abs(brick.y + brick.height - ball.y);
  const minimum = Math.min(left, right, top, bottom);
  if (minimum === left) {
    return {
      brick,
      normalX: -1,
      normalY: 0,
      penetration: ball.radius + left,
      pointX: brick.x,
      pointY: ball.y,
    };
  }
  if (minimum === right) {
    return {
      brick,
      normalX: 1,
      normalY: 0,
      penetration: ball.radius + right,
      pointX: brick.x + brick.width,
      pointY: ball.y,
    };
  }
  if (minimum === top) {
    return {
      brick,
      normalX: 0,
      normalY: -1,
      penetration: ball.radius + top,
      pointX: ball.x,
      pointY: brick.y,
    };
  }
  return {
    brick,
    normalX: 0,
    normalY: 1,
    penetration: ball.radius + bottom,
    pointX: ball.x,
    pointY: brick.y + brick.height,
  };
}

function spawnBreakEffects(model: BreakoutModel, contact: BrickContact): void {
  const count = model.width < 520 ? 2 : 3;
  for (let index = 0; index < count; index += 1) {
    const spread = nextRandom(model) - 0.5;
    const speed = 68 + nextRandom(model) * 126;
    const tangentX = -contact.normalY;
    const tangentY = contact.normalX;
    const maxTtl = 0.36 + nextRandom(model) * 0.34;
    model.debris.push({
      maxTtl,
      rotation: nextRandom(model) * Math.PI,
      size: 1.5 + nextRandom(model) * 3.6,
      spin: (nextRandom(model) - 0.5) * 9,
      tone: contact.brick.tone,
      ttl: maxTtl,
      velocityX:
        contact.normalX * speed * (0.42 + nextRandom(model) * 0.5) +
        tangentX * spread * speed,
      velocityY:
        contact.normalY * speed * (0.42 + nextRandom(model) * 0.5) +
        tangentY * spread * speed,
      x: contact.pointX,
      y: contact.pointY,
    });
  }
  model.debris = model.debris.slice(-MAX_DEBRIS);

  const maxTtl = 0.22;
  model.impacts.push({
    maxTtl,
    radius: model.ballRadius,
    tone: contact.brick.tone,
    ttl: maxTtl,
    x: contact.pointX,
    y: contact.pointY,
  });
  model.impacts = model.impacts.slice(-MAX_IMPACTS);
}

function spawnCompletionBurst(model: BreakoutModel): void {
  const bounds = model.bricks.reduce(
    (result, brick) => ({
      bottom: Math.max(result.bottom, brick.y + brick.height),
      left: Math.min(result.left, brick.x),
      right: Math.max(result.right, brick.x + brick.width),
      top: Math.min(result.top, brick.y),
    }),
    { bottom: 0, left: model.width, right: 0, top: model.height },
  );
  const centerX = (bounds.left + bounds.right) * 0.5;
  const centerY = (bounds.top + bounds.bottom) * 0.5;
  const particleCount = model.width < 520 ? 24 : 34;

  for (let index = 0; index < particleCount; index += 1) {
    const angle =
      (index / particleCount) * Math.PI * 2 + nextRandom(model) * 0.24;
    const speed = 90 + nextRandom(model) * 190;
    const maxTtl = 0.58 + nextRandom(model) * 0.55;
    model.debris.push({
      maxTtl,
      rotation: angle,
      size: 2 + nextRandom(model) * 4.8,
      spin: (nextRandom(model) - 0.5) * 13,
      tone: index % 5,
      ttl: maxTtl,
      velocityX: Math.cos(angle) * speed,
      velocityY: Math.sin(angle) * speed - 24,
      x:
        centerX +
        (nextRandom(model) - 0.5) * (bounds.right - bounds.left) * 0.18,
      y:
        centerY +
        (nextRandom(model) - 0.5) * (bounds.bottom - bounds.top) * 0.18,
    });
  }

  for (let index = 0; index < 3; index += 1) {
    const maxTtl = 0.42 + index * 0.12;
    model.impacts.push({
      maxTtl,
      radius: Math.max(model.ballRadius * 1.5, 10 + index * 5),
      tone: 2 + index,
      ttl: maxTtl,
      x: centerX,
      y: centerY,
    });
  }

  model.debris = model.debris.slice(-MAX_DEBRIS);
  model.impacts = model.impacts.slice(-MAX_IMPACTS);
  model.winTtl = 1.2;
}

function rotateVelocity(
  velocityX: number,
  velocityY: number,
  angle: number,
): readonly [number, number] {
  const cosine = Math.cos(angle);
  const sine = Math.sin(angle);
  return [
    velocityX * cosine - velocityY * sine,
    velocityX * sine + velocityY * cosine,
  ];
}

function addSplitBall(
  model: BreakoutModel,
  source: BreakoutBall,
  angle: number,
): void {
  const [rotatedVelocityX, rotatedVelocityY] = rotateVelocity(
    source.velocityX,
    source.velocityY,
    angle,
  );
  const direction = angle < 0 ? -1 : 1;
  const horizontalNudge = model.ballRadius * 1.35 * direction;
  const ball: BreakoutBall = {
    id: model.nextBallId++,
    radius: model.ballRadius,
    velocityX: rotatedVelocityX,
    // A caught bonus must be useful even when its source ball is descending.
    // Launch added pulses upward so they cannot fall out on the catch frame.
    velocityY: -Math.abs(rotatedVelocityY),
    x: clamp(
      source.x + horizontalNudge,
      model.ballRadius,
      model.width - model.ballRadius,
    ),
    y: clamp(
      Math.min(source.y, model.paddleY - model.ballRadius - 2),
      model.ballRadius,
      model.paddleY - model.ballRadius - 2,
    ),
  };
  setBallSpeed(model, ball, Math.hypot(ball.velocityX, ball.velocityY));
  constrainBallDirection(ball);
  model.balls.push(ball);
}

export function grantBreakoutBonus(
  model: BreakoutModel,
  type: BreakoutBonusType,
): boolean {
  const sourceBalls = [...model.balls];
  if (sourceBalls.length === 0) return false;

  let applied = false;
  if (type === "plus-two") {
    const before = model.balls.length;
    for (let index = 0; index < 2; index += 1) {
      const source =
        sourceBalls[(model.bonusCatchSerial + index) % sourceBalls.length]!;
      const direction = (model.bonusCatchSerial + index) % 2 === 0 ? 1 : -1;
      addSplitBall(model, source, direction * (0.24 + index * 0.08));
    }
    applied = model.balls.length > before;
  } else if (type === "triple") {
    const before = model.balls.length;
    // Snapshot every ball that was on screen when the bonus was caught.
    // Each source ball creates exactly two additional balls, so x3 always
    // multiplies the complete active set: N -> 3N.
    for (const angle of [-0.32, 0.32] as const) {
      for (const source of sourceBalls) {
        addSplitBall(model, source, angle);
      }
    }
    applied = model.balls.length > before;
  } else if (type === "pierce") {
    if (model.piercingActive) return false;
    model.piercingActive = true;
    model.bonuses = model.bonuses.filter((bonus) => bonus.type !== "pierce");
    if (model.queuedBonus?.type === "pierce") model.queuedBonus = null;
    applied = true;
  } else {
    if (model.blastRadiusActive) return false;
    model.blastRadiusActive = true;
    model.bonuses = model.bonuses.filter((bonus) => bonus.type !== "blast");
    if (model.queuedBonus?.type === "blast") model.queuedBonus = null;
    applied = true;
  }

  if (!applied) return false;

  const scoreByType: Record<BreakoutBonusType, number> = {
    "plus-two": 30,
    triple: 35,
    pierce: 45,
    blast: 45,
  };
  model.score += scoreByType[type];
  model.lastBonusType = type;
  model.bonusCatchSerial += 1;
  model.bonusCatchTtl = 0.9;
  model.hitTtl = Math.max(model.hitTtl, 0.14);
  syncLegacyFromPrimary(model);
  return true;
}

function spawnBreakoutBonus(
  model: BreakoutModel,
  type: BreakoutBonusType,
  x: number,
  y: number,
): void {
  if (model.bonuses.length >= BREAKOUT_MAX_ACTIVE_BONUSES) return;
  if (type === "pierce" && model.piercingActive) return;
  if (type === "blast" && model.blastRadiusActive) return;
  const size = breakoutBonusSize(model.width, model.height);
  model.bonuses.push({
    id: model.nextBonusId++,
    rotation: (nextRandom(model) - 0.5) * 0.2,
    size,
    spin: (nextRandom(model) - 0.5) * 1.8,
    type,
    velocityY: breakoutBonusVelocity(model.height),
    x: clamp(x, size * 0.5, model.width - size * 0.5),
    y,
  });
  model.bonusCooldown = BREAKOUT_BONUS_COOLDOWN;
  model.bricksSinceBonus = 0;
}

function chooseBreakoutBonusType(model: BreakoutModel): BreakoutBonusType {
  const available: BreakoutBonusType[] = ["triple", "plus-two"];
  if (!model.piercingActive) available.push("pierce");
  if (!model.blastRadiusActive) available.push("blast");
  return (
    available[Math.floor(nextRandom(model) * available.length)] ?? "plus-two"
  );
}

function queueBreakoutBonus(
  model: BreakoutModel,
  type: BreakoutBonusType,
  x: number,
  y: number,
): void {
  if (type === "pierce" && model.piercingActive) return;
  if (type === "blast" && model.blastRadiusActive) return;
  model.queuedBonus = { type, x, y };
  model.bricksSinceBonus = 0;
}

function maybeSpawnBreakoutBonus(
  model: BreakoutModel,
  contact: BrickContact,
): void {
  model.bricksSinceBonus += 1;
  if (model.bricksSinceBonus < model.bonusBrickTarget) return;

  const type = chooseBreakoutBonusType(model);
  const x = contact.brick.x + contact.brick.width * 0.5;
  const y = contact.brick.y + contact.brick.height * 0.5;
  model.bricksSinceBonus = 0;
  model.bonusBrickTarget = nextRandom(model) < 0.5 ? 3 : 4;

  if (
    model.bonusCooldown > 0 ||
    model.bonuses.length >= BREAKOUT_MAX_ACTIVE_BONUSES
  ) {
    if (!model.queuedBonus) queueBreakoutBonus(model, type, x, y);
    return;
  }

  spawnBreakoutBonus(model, type, x, y);
}

function reflectVelocity(
  ball: BreakoutBall,
  normalX: number,
  normalY: number,
): void {
  const dot = ball.velocityX * normalX + ball.velocityY * normalY;
  if (dot < 0) {
    ball.velocityX -= 2 * dot * normalX;
    ball.velocityY -= 2 * dot * normalY;
    return;
  }

  if (Math.abs(normalX) > Math.abs(normalY)) {
    ball.velocityX = -ball.velocityX;
  } else {
    ball.velocityY = -ball.velocityY;
  }
}

function spatialBucketKey(column: number, row: number): string {
  return `${column}:${row}`;
}

function brickSpatialIndex(model: BreakoutModel): BrickSpatialIndex {
  const cached = brickSpatialIndexes.get(model);
  if (cached?.bricks === model.bricks) return cached;

  const largestBrick = model.bricks.reduce(
    (largest, brick) => Math.max(largest, brick.width, brick.height),
    1,
  );
  const cellSize = clamp(largestBrick * 8, 20, 52);
  const mutableBuckets = new Map<string, BreakoutBrick[]>();

  for (const brick of model.bricks) {
    const startColumn = Math.floor(brick.x / cellSize);
    const endColumn = Math.floor((brick.x + brick.width) / cellSize);
    const startRow = Math.floor(brick.y / cellSize);
    const endRow = Math.floor((brick.y + brick.height) / cellSize);
    for (let row = startRow; row <= endRow; row += 1) {
      for (let column = startColumn; column <= endColumn; column += 1) {
        const key = spatialBucketKey(column, row);
        const bucket = mutableBuckets.get(key);
        if (bucket) bucket.push(brick);
        else mutableBuckets.set(key, [brick]);
      }
    }
  }

  const index: BrickSpatialIndex = {
    bricks: model.bricks,
    buckets: mutableBuckets,
    cellSize,
  };
  brickSpatialIndexes.set(model, index);
  return index;
}

function nearbyBricks(
  model: BreakoutModel,
  left: number,
  right: number,
  top: number,
  bottom: number,
): BreakoutBrick[] {
  const index = brickSpatialIndex(model);
  const startColumn = Math.floor(left / index.cellSize);
  const endColumn = Math.floor(right / index.cellSize);
  const startRow = Math.floor(top / index.cellSize);
  const endRow = Math.floor(bottom / index.cellSize);
  const result: BreakoutBrick[] = [];
  const seen = new Set<string>();

  for (let row = startRow; row <= endRow; row += 1) {
    for (let column = startColumn; column <= endColumn; column += 1) {
      for (const brick of index.buckets.get(spatialBucketKey(column, row)) ??
        []) {
        if (seen.has(brick.id)) continue;
        seen.add(brick.id);
        result.push(brick);
      }
    }
  }
  return result;
}

function destroyBrick(
  model: BreakoutModel,
  contact: BrickContact,
  emitEffects = true,
  countsTowardBonus = true,
): boolean {
  if (!contact.brick.alive) return false;
  contact.brick.alive = false;
  model.combo = model.comboWindow > 0 ? model.combo + 1 : 1;
  model.comboWindow = 1.15;
  model.score += 10 + Math.max(0, model.combo - 1) * 2;
  if (countsTowardBonus) maybeSpawnBreakoutBonus(model, contact);
  if (emitEffects) spawnBreakEffects(model, contact);
  model.hitTtl = Math.max(model.hitTtl, 0.14);
  return true;
}

function destroyBlastRadius(
  model: BreakoutModel,
  origin: BrickContact,
): number {
  if (!model.blastRadiusActive) return 0;
  const pitchEstimate =
    Math.max(origin.brick.width, origin.brick.height) +
    clamp(Math.max(origin.brick.width, origin.brick.height) * 0.3, 0.4, 1.5);
  const radius = pitchEstimate * BREAKOUT_BLAST_RADIUS_BLOCKS;
  const centerX = origin.brick.x + origin.brick.width * 0.5;
  const centerY = origin.brick.y + origin.brick.height * 0.5;
  let destroyed = 0;

  for (const brick of nearbyBricks(
    model,
    centerX - radius,
    centerX + radius,
    centerY - radius,
    centerY + radius,
  )) {
    if (!brick.alive) continue;
    const brickCenterX = brick.x + brick.width * 0.5;
    const brickCenterY = brick.y + brick.height * 0.5;
    if (Math.hypot(brickCenterX - centerX, brickCenterY - centerY) > radius) {
      continue;
    }
    const contact: BrickContact = {
      brick,
      normalX: origin.normalX,
      normalY: origin.normalY,
      penetration: 0,
      pointX: brickCenterX,
      pointY: brickCenterY,
    };
    if (destroyBrick(model, contact, destroyed < 2, false)) destroyed += 1;
  }

  const maxTtl = 0.36;
  model.impacts.push({
    maxTtl,
    radius,
    tone: origin.brick.tone,
    ttl: maxTtl,
    x: centerX,
    y: centerY,
  });
  model.impacts = model.impacts.slice(-MAX_IMPACTS);
  return destroyed;
}

function resolveBrickCollision(
  model: BreakoutModel,
  ball: BreakoutBall,
): number {
  const ballLeft = ball.x - ball.radius;
  const ballRight = ball.x + ball.radius;
  const ballTop = ball.y - ball.radius;
  const ballBottom = ball.y + ball.radius;
  const contacts: BrickContact[] = [];

  for (const brick of nearbyBricks(
    model,
    ballLeft,
    ballRight,
    ballTop,
    ballBottom,
  )) {
    if (!brick.alive) continue;
    if (
      brick.x > ballRight ||
      brick.x + brick.width < ballLeft ||
      brick.y > ballBottom ||
      brick.y + brick.height < ballTop
    ) {
      continue;
    }
    const contact = brickContact(ball, brick);
    if (contact) contacts.push(contact);
  }

  if (contacts.length === 0) return 0;

  if (model.piercingActive) {
    let destroyed = 0;
    for (const contact of contacts) {
      if (!contact.brick.alive) continue;
      if (destroyBrick(model, contact)) destroyed += 1;
      destroyed += destroyBlastRadius(model, contact);
    }
    if (destroyed > 0) {
      setBallSpeed(
        model,
        ball,
        Math.hypot(ball.velocityX, ball.velocityY) * 1.004,
      );
    }
    return destroyed;
  }

  const primary = contacts.reduce<BrickContact | null>(
    (best, contact) =>
      !best || contact.penetration > best.penetration ? contact : best,
    null,
  );
  if (!primary || !primary.brick.alive) return 0;

  let destroyed = destroyBrick(model, primary) ? 1 : 0;
  destroyed += destroyBlastRadius(model, primary);

  ball.x += primary.normalX * (primary.penetration + 0.2);
  ball.y += primary.normalY * (primary.penetration + 0.2);
  reflectVelocity(ball, primary.normalX, primary.normalY);
  setBallSpeed(model, ball, Math.hypot(ball.velocityX, ball.velocityY) * 1.012);
  constrainBallDirection(ball);
  return destroyed;
}

function paddleCollision(
  model: BreakoutModel,
  ball: BreakoutBall,
  previousY: number,
): void {
  if (ball.velocityY <= 0) return;
  const halfWidth = model.paddleWidth * 0.5;
  const paddleLeft = model.paddleX - halfWidth;
  const paddleRight = model.paddleX + halfWidth;
  const ballBottom = ball.y + ball.radius;
  const previousBottom = previousY + ball.radius;
  if (
    ball.x < paddleLeft - ball.radius ||
    ball.x > paddleRight + ball.radius ||
    ballBottom < model.paddleY ||
    previousBottom > model.paddleY + model.paddleHeight
  ) {
    return;
  }

  const offset = clamp((ball.x - model.paddleX) / halfWidth, -1, 1);
  const currentSpeed = Math.hypot(ball.velocityX, ball.velocityY);
  const speedBounds = breakoutSpeedBounds(model);
  const speedFactor = 0.985 + Math.abs(offset) * 0.035;
  const speed = clamp(
    currentSpeed * speedFactor,
    speedBounds.minimum,
    speedBounds.maximum,
  );
  const horizontal = clamp(offset * speed * 0.82, -speed * 0.84, speed * 0.84);
  ball.x = clamp(ball.x, paddleLeft, paddleRight);
  ball.y = model.paddleY - ball.radius - 0.5;
  ball.velocityX =
    Math.abs(horizontal) < speed * 0.12
      ? speed * 0.12 * (ball.velocityX >= 0 ? 1 : -1)
      : horizontal;
  ball.velocityY = -Math.sqrt(
    Math.max(1, speed * speed - ball.velocityX * ball.velocityX),
  );
  constrainBallDirection(ball);
}

function loseBall(model: BreakoutModel, ballId: number): void {
  model.balls = model.balls.filter((ball) => ball.id !== ballId);
  model.combo = 0;
  model.comboWindow = 0;
  model.lossTtl =
    model.balls.length === 0 ? 0.65 : Math.max(model.lossTtl, 0.24);
  if (model.balls.length > 0) {
    syncLegacyFromPrimary(model);
    return;
  }
  model.controlLockTtl = 0;
  model.phase = "game-over";
  model.serveDelay = 0;
  model.bonuses = [];
  model.queuedBonus = null;
  syncLegacyFromPrimary(model);
}

function updateBonuses(model: BreakoutModel, delta: number): void {
  const paddleLeft = model.paddleX - model.paddleWidth * 0.5;
  const paddleRight = model.paddleX + model.paddleWidth * 0.5;
  const caught: BreakoutBonus[] = [];
  const hadActiveBonus = model.bonuses.length > 0;

  for (const bonus of model.bonuses) {
    bonus.y += bonus.velocityY * delta;
    bonus.rotation += bonus.spin * delta;
    const half = bonus.size * 0.5;
    const overlapsPaddle =
      bonus.y + half >= model.paddleY &&
      bonus.y - half <= model.paddleY + model.paddleHeight + half * 0.35 &&
      bonus.x >= paddleLeft - half * 0.2 &&
      bonus.x <= paddleRight + half * 0.2;
    if (overlapsPaddle) caught.push(bonus);
  }

  if (caught.length > 0) {
    for (const bonus of caught) grantBreakoutBonus(model, bonus.type);
    const caughtIds = new Set(caught.map((bonus) => bonus.id));
    model.bonuses = model.bonuses.filter((bonus) => !caughtIds.has(bonus.id));
  }
  model.bonuses = model.bonuses.filter(
    (bonus) => bonus.y - bonus.size * 0.5 <= model.height,
  );

  if (hadActiveBonus && model.bonuses.length === 0 && model.queuedBonus) {
    model.bonusCooldown = Math.max(
      model.bonusCooldown,
      BREAKOUT_BONUS_QUEUE_RELEASE_DELAY,
    );
  }

  if (model.queuedBonus && remainingBreakoutBricks(model) <= 3) {
    model.queuedBonus = null;
  }

  if (
    model.queuedBonus &&
    model.bonuses.length < BREAKOUT_MAX_ACTIVE_BONUSES &&
    model.bonusCooldown <= 0
  ) {
    const queued = model.queuedBonus;
    model.queuedBonus = null;
    const alreadyOwned =
      (queued.type === "pierce" && model.piercingActive) ||
      (queued.type === "blast" && model.blastRadiusActive);
    if (!alreadyOwned) {
      spawnBreakoutBonus(model, queued.type, queued.x, queued.y);
    }
  }
}

function updateEffects(model: BreakoutModel, delta: number): void {
  model.bonusCatchTtl = Math.max(0, model.bonusCatchTtl - delta);
  model.bonusCooldown = Math.max(0, model.bonusCooldown - delta);
  model.comboWindow = Math.max(0, model.comboWindow - delta);
  model.controlLockTtl = Math.max(0, model.controlLockTtl - delta);
  model.hitTtl = Math.max(0, model.hitTtl - delta);
  model.introTtl = Math.max(0, model.introTtl - delta);
  if (model.comboWindow === 0) model.combo = 0;
  model.lossTtl = Math.max(0, model.lossTtl - delta);
  model.winTtl = Math.max(0, model.winTtl - delta);
  model.debris = model.debris
    .map((particle) => ({
      ...particle,
      rotation: particle.rotation + particle.spin * delta,
      ttl: particle.ttl - delta,
      velocityY: particle.velocityY + 118 * delta,
      x: particle.x + particle.velocityX * delta,
      y: particle.y + particle.velocityY * delta,
    }))
    .filter((particle) => particle.ttl > 0)
    .slice(-MAX_DEBRIS);
  model.impacts = model.impacts
    .map((impact) => ({ ...impact, ttl: impact.ttl - delta }))
    .filter((impact) => impact.ttl > 0)
    .slice(-MAX_IMPACTS);
}

function sanitizeModel(model: BreakoutModel): void {
  const fallbackX = model.width * 0.5;
  model.paddleX = finiteOr(model.paddleX, fallbackX);
  model.paddleTargetX = finiteOr(model.paddleTargetX, model.paddleX);
  const speedBounds = breakoutSpeedBounds(model);
  model.balls = model.balls.filter((ball) =>
    [ball.x, ball.y, ball.velocityX, ball.velocityY, ball.radius].every(
      Number.isFinite,
    ),
  );
  for (const ball of model.balls) {
    ball.radius = clamp(finiteOr(ball.radius, model.ballRadius), 2, 24);
    ball.x = finiteOr(ball.x, model.paddleX);
    ball.y = finiteOr(ball.y, model.paddleY - ball.radius - 2);
    ball.velocityX = finiteOr(ball.velocityX, speedBounds.initial * 0.4);
    ball.velocityY = finiteOr(ball.velocityY, -speedBounds.initial * 0.8);
    setBallSpeed(model, ball, Math.hypot(ball.velocityX, ball.velocityY));
    constrainBallDirection(ball);
  }
  model.score = Math.max(0, Math.floor(finiteOr(model.score, 0)));
  model.combo = clamp(Math.floor(finiteOr(model.combo, 0)), 0, 99);
  model.comboWindow = clamp(finiteOr(model.comboWindow, 0), 0, 1.15);
  model.controlLockTtl = clamp(finiteOr(model.controlLockTtl, 0), 0, 0.3);
  model.hitTtl = clamp(finiteOr(model.hitTtl, 0), 0, 0.14);
  model.lossTtl = clamp(finiteOr(model.lossTtl, 0), 0, 0.65);
  model.introTtl = clamp(finiteOr(model.introTtl, 0), 0, 0.9);
  model.winTtl = clamp(finiteOr(model.winTtl, 0), 0, 1.2);
  model.bonusCatchTtl = clamp(finiteOr(model.bonusCatchTtl, 0), 0, 0.9);
  model.bonusCooldown = clamp(finiteOr(model.bonusCooldown, 0), 0, 1);
  model.piercingActive = model.piercingActive === true;
  model.blastRadiusActive = model.blastRadiusActive === true;
  model.bonusBrickTarget = model.bonusBrickTarget === 4 ? 4 : 3;
  model.bricksSinceBonus = clamp(
    Math.floor(finiteOr(model.bricksSinceBonus, 0)),
    0,
    BREAKOUT_TARGET_SEGMENTS,
  );
  const safeBonusSize = breakoutBonusSize(model.width, model.height);
  const safeBonusVelocity = breakoutBonusVelocity(model.height);
  model.bonuses = model.bonuses
    .filter(
      (bonus) =>
        (bonus.type === "plus-two" ||
          bonus.type === "triple" ||
          bonus.type === "pierce" ||
          bonus.type === "blast") &&
        !(bonus.type === "pierce" && model.piercingActive) &&
        !(bonus.type === "blast" && model.blastRadiusActive) &&
        [
          bonus.x,
          bonus.y,
          bonus.velocityY,
          bonus.size,
          bonus.rotation,
          bonus.spin,
        ].every(Number.isFinite),
    )
    .map((bonus) => ({
      ...bonus,
      size: safeBonusSize,
      velocityY: safeBonusVelocity,
      x: clamp(bonus.x, safeBonusSize * 0.5, model.width - safeBonusSize * 0.5),
      y: clamp(bonus.y, -safeBonusSize, model.height + safeBonusSize),
    }))
    .slice(0, BREAKOUT_MAX_ACTIVE_BONUSES);
  if (
    model.queuedBonus &&
    (model.queuedBonus.type === "plus-two" ||
      model.queuedBonus.type === "triple" ||
      model.queuedBonus.type === "pierce" ||
      model.queuedBonus.type === "blast") &&
    !(model.queuedBonus.type === "pierce" && model.piercingActive) &&
    !(model.queuedBonus.type === "blast" && model.blastRadiusActive) &&
    [model.queuedBonus.x, model.queuedBonus.y].every(Number.isFinite)
  ) {
    model.queuedBonus = {
      ...model.queuedBonus,
      x: clamp(
        model.queuedBonus.x,
        safeBonusSize * 0.5,
        model.width - safeBonusSize * 0.5,
      ),
      y: clamp(
        model.queuedBonus.y,
        -safeBonusSize,
        model.height + safeBonusSize,
      ),
    };
  } else {
    model.queuedBonus = null;
  }
  if (remainingBreakoutBricks(model) <= 3) {
    model.queuedBonus = null;
  }
  model.debris = model.debris
    .filter((particle) =>
      [
        particle.x,
        particle.y,
        particle.velocityX,
        particle.velocityY,
        particle.ttl,
        particle.maxTtl,
        particle.size,
        particle.rotation,
        particle.spin,
      ].every(Number.isFinite),
    )
    .slice(-MAX_DEBRIS);
  model.impacts = model.impacts
    .filter((impact) =>
      [impact.x, impact.y, impact.radius, impact.ttl, impact.maxTtl].every(
        Number.isFinite,
      ),
    )
    .slice(-MAX_IMPACTS);
  setPaddleTarget(model, model.paddleTargetX);
  syncLegacyFromPrimary(model);
}

export function stepBreakoutModel(
  model: BreakoutModel,
  deltaSeconds: number,
): void {
  if (model.phase !== "playing") return;
  const delta = clamp(finiteOr(deltaSeconds, 0), 0, MAX_STEP_SECONDS);
  if (delta <= 0) return;

  syncPrimaryFromLegacy(model);
  sanitizeModel(model);
  updateEffects(model, delta);
  if (model.controlLockTtl <= 0) {
    const paddleAlpha = 1 - Math.exp(-delta * 18);
    model.paddleX += (model.paddleTargetX - model.paddleX) * paddleAlpha;
  }
  updateBonuses(model, delta);

  if (model.serveDelay > 0) {
    model.serveDelay = Math.max(0, model.serveDelay - delta);
    const primary = model.balls[0];
    if (primary) {
      primary.x = model.paddleX;
      primary.y = model.paddleY - primary.radius - 2;
    }
    syncLegacyFromPrimary(model);
    return;
  }

  const substeps = Math.max(1, Math.ceil(delta / SUBSTEP_SECONDS));
  const step = delta / substeps;
  const collidedBallIds = new Set<number>();

  for (let index = 0; index < substeps; index += 1) {
    for (const ball of [...model.balls]) {
      if (!model.balls.some((candidate) => candidate.id === ball.id)) continue;
      const previousY = ball.y;
      ball.x += ball.velocityX * step;
      ball.y += ball.velocityY * step;

      if (ball.x - ball.radius <= 0) {
        ball.x = ball.radius;
        ball.velocityX = Math.abs(ball.velocityX);
      } else if (ball.x + ball.radius >= model.width) {
        ball.x = model.width - ball.radius;
        ball.velocityX = -Math.abs(ball.velocityX);
      }

      const playfieldTop = breakoutPlayfieldTop();
      if (ball.y - ball.radius <= playfieldTop) {
        ball.y = playfieldTop + ball.radius;
        ball.velocityY = Math.abs(ball.velocityY);
      }

      paddleCollision(model, ball, previousY);

      let destroyed = 0;
      if (model.piercingActive || !collidedBallIds.has(ball.id)) {
        destroyed = resolveBrickCollision(model, ball);
        if (destroyed > 0 && !model.piercingActive) {
          collidedBallIds.add(ball.id);
        }
      }

      if (ball.y - ball.radius > model.height) {
        loseBall(model, ball.id);
        if (model.balls.length === 0) break;
        continue;
      }

      constrainBallDirection(ball);

      if (destroyed > 0 && model.bricks.every((brick) => !brick.alive)) {
        spawnCompletionBurst(model);
        model.phase = "won";
        model.serveDelay = 0;
        model.bonuses = [];
        model.queuedBonus = null;
        break;
      }
    }
    if (model.phase !== "playing") break;
  }

  sanitizeModel(model);
}

export function stepBreakoutPresentation(
  model: BreakoutModel,
  deltaSeconds: number,
): void {
  if (model.phase !== "won" && model.phase !== "game-over") return;
  const delta = clamp(finiteOr(deltaSeconds, 0), 0, MAX_STEP_SECONDS);
  if (delta <= 0) return;
  sanitizeModel(model);
  updateEffects(model, delta);
  sanitizeModel(model);
}

export function remainingBreakoutBricks(model: BreakoutModel): number {
  return model.bricks.reduce(
    (remaining, brick) => remaining + (brick.alive ? 1 : 0),
    0,
  );
}

export function activeBreakoutBalls(model: BreakoutModel): number {
  return model.balls.length;
}
