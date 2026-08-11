import { describe, expect, it } from "vitest";

import {
  BREAKOUT_BONUS_GUARANTEE_BRICKS,
  BREAKOUT_BONUS_MIN_BRICKS,
  BREAKOUT_MAX_ACTIVE_BONUSES,
  BREAKOUT_TARGET_CODE,
  BREAKOUT_TARGET_SEGMENTS,
  breakoutBonusDropChance,
  breakoutPlayfieldTop,
  breakoutSpeedBounds,
  createBreakoutModel,
  grantBreakoutBonus,
  moveBreakoutPaddle,
  remainingBreakoutBricks,
  resizeBreakoutModel,
  startBreakoutRun,
  stepBreakoutModel,
  stepBreakoutPresentation,
} from "./not-found-breakout-model";
import {
  gameRenderBudget,
  normalizeStoredBestScore,
  normalizedGameDelta,
} from "./not-found-game-policy";

function digitSignature(
  model: ReturnType<typeof createBreakoutModel>,
  digitIndex: number,
): string[] {
  return Array.from({ length: 7 }, (_, row) =>
    Array.from({ length: 5 }, (_, column) =>
      model.bricks.some(
        (brick) =>
          brick.digitIndex === digitIndex &&
          brick.row === row &&
          brick.column === column,
      )
        ? "1"
        : "0",
    ).join(""),
  );
}

function preparePaddleHit(
  model: ReturnType<typeof createBreakoutModel>,
  offsetRatio: number,
): number {
  startBreakoutRun(model);
  model.controlLockTtl = 0;
  model.introTtl = 0;
  model.serveDelay = 0;
  model.ballX = model.paddleX + model.paddleWidth * 0.5 * offsetRatio;
  model.ballY = model.paddleY - model.ballRadius - 0.5;
  model.ballVelocityX = 90;
  model.ballVelocityY = 300;
  return Math.hypot(model.ballVelocityX, model.ballVelocityY);
}

describe("404 Signal Breaker model", () => {
  it.each([
    [320, 568],
    [390, 844],
    [844, 390],
    [1280, 720],
  ])(
    "creates a finite single-round playfield for %sx%s",
    (width: number, height: number) => {
      const model = createBreakoutModel(width, height);
      const bounds = breakoutSpeedBounds(model);

      expect(model.width).toBe(width);
      expect(model.height).toBe(height);
      expect(model.bricks).toHaveLength(BREAKOUT_TARGET_SEGMENTS);
      expect(bounds.minimum).toBeLessThan(bounds.initial);
      expect(bounds.initial).toBeLessThan(bounds.maximum);
      expect(bounds.initial).toBeLessThanOrEqual(240);
      expect(model.bricks.every((brick) => brick.x >= 0)).toBe(true);
      expect(
        model.bricks.every(
          (brick) => brick.x + brick.width <= model.width + 0.01,
        ),
      ).toBe(true);
      expect(
        [
          model.ballX,
          model.ballY,
          model.paddleX,
          model.paddleY,
          ...model.bricks.flatMap((brick) => [
            brick.x,
            brick.y,
            brick.width,
            brick.height,
          ]),
        ].every(Number.isFinite),
      ).toBe(true);
    },
  );

  it.each([
    [320, 568],
    [390, 844],
    [844, 390],
    [1280, 720],
  ])(
    "keeps the face separated from the 404 at %sx%s",
    (width: number, height: number) => {
      const model = createBreakoutModel(width, height);
      const face = model.bricks.filter((brick) => brick.digit === "face");
      const code = model.bricks.filter((brick) => brick.digit !== "face");
      const faceBottom = Math.max(
        ...face.map((brick) => brick.y + brick.height),
      );
      const codeTop = Math.min(...code.map((brick) => brick.y));

      expect(faceBottom).toBeLessThan(codeTop);
      expect(codeTop - faceBottom).toBeGreaterThanOrEqual(50);
    },
  );

  it.each([
    [390, 760],
    [844, 390],
    [1560, 900],
  ])(
    "uses the canvas top edge as the header boundary at %sx%s",
    (width: number, height: number) => {
      const model = createBreakoutModel(width, height);
      const ceiling = breakoutPlayfieldTop();
      expect(ceiling).toBe(0);
      const targetTop = Math.min(...model.bricks.map((brick) => brick.y));
      expect(targetTop).toBeGreaterThan(ceiling);

      startBreakoutRun(model);
      model.controlLockTtl = 0;
      model.introTtl = 0;
      model.serveDelay = 0;
      for (let frame = 0; frame < 1_200; frame += 1) {
        stepBreakoutModel(model, 1 / 60);
        if (model.phase !== "playing") break;
        expect(
          model.balls.every((ball) => ball.y - ball.radius >= ceiling - 0.01),
        ).toBe(true);
      }
    },
  );

  it("uses direct face pixels and a uniform 6 by 6 404 micro-block grid", () => {
    const model = createBreakoutModel(1280, 720);
    const face = model.bricks.filter((brick) => brick.digit === "face");
    const digits = model.bricks.filter((brick) => brick.digit !== "face");
    const digitGroups = new Map<string, typeof model.bricks>();

    for (const brick of digits) {
      const groupId = brick.id.split(":").slice(0, 3).join(":");
      const group = digitGroups.get(groupId) ?? [];
      group.push(brick);
      digitGroups.set(groupId, group);
    }

    expect(model.bricks).toHaveLength(BREAKOUT_TARGET_SEGMENTS);
    expect(BREAKOUT_TARGET_SEGMENTS).toBe(2152);
    expect(face).toHaveLength(460);
    expect(face.every((brick) => brick.id.split(":").length === 3)).toBe(true);
    expect(
      [...digitGroups.values()].every((group) => group.length === 36),
    ).toBe(true);

    const firstGroup = [...digitGroups.values()][0]!;
    const widths = new Set(firstGroup.map((brick) => brick.width.toFixed(4)));
    const heights = new Set(firstGroup.map((brick) => brick.height.toFixed(4)));
    const xPositions = [...new Set(firstGroup.map((brick) => brick.x))].sort(
      (left, right) => left - right,
    );
    const yPositions = [...new Set(firstGroup.map((brick) => brick.y))].sort(
      (top, bottom) => top - bottom,
    );
    const horizontalGaps = xPositions
      .slice(1)
      .map(
        (position, index) =>
          position - xPositions[index]! - firstGroup[0]!.width,
      );
    const verticalGaps = yPositions
      .slice(1)
      .map(
        (position, index) =>
          position - yPositions[index]! - firstGroup[0]!.height,
      );

    expect(widths.size).toBe(1);
    expect(heights.size).toBe(1);
    expect(xPositions).toHaveLength(6);
    expect(yPositions).toHaveLength(6);
    expect(
      horizontalGaps.every((gap) => Math.abs(gap - horizontalGaps[0]!) < 1e-6),
    ).toBe(true);
    expect(
      verticalGaps.every((gap) => Math.abs(gap - verticalGaps[0]!) < 1e-6),
    ).toBe(true);
    expect(horizontalGaps[0]).toBeCloseTo(verticalGaps[0]!, 6);
    expect(face[0]!.width).toBeCloseTo(firstGroup[0]!.width, 6);
    expect(face[0]!.height).toBeCloseTo(firstGroup[0]!.height, 6);
  });

  it("builds the destructible target itself as a readable 404", () => {
    const model = createBreakoutModel(640, 520);
    expect(BREAKOUT_TARGET_CODE).toBe("404");
    expect(
      model.bricks
        .map((brick) => brick.digit)
        .filter((value, index, all) => index === 0 || value !== all[index - 1]),
    ).toEqual(["face", "4", "0", "4"]);
    expect(digitSignature(model, 0)).toEqual([
      "10010",
      "10010",
      "10010",
      "11111",
      "00010",
      "00010",
      "00010",
    ]);
    expect(digitSignature(model, 1)).toEqual([
      "01110",
      "10001",
      "10011",
      "10101",
      "11001",
      "10001",
      "01110",
    ]);
    expect(digitSignature(model, 2)).toEqual(digitSignature(model, 0));
  });

  it("starts only after the explicit start action", () => {
    const model = createBreakoutModel(390, 520);
    const initialBall = [model.ballX, model.ballY];
    stepBreakoutModel(model, 1 / 30);
    expect([model.ballX, model.ballY]).toEqual(initialBall);
    expect(model.phase).toBe("idle");

    startBreakoutRun(model);
    expect(model.phase).toBe("playing");
    expect(model.score).toBe(0);
    expect(model.introTtl).toBeGreaterThan(0);
    expect(model.controlLockTtl).toBeGreaterThan(0);
  });

  it("paces bonus drops between a minimum gap and a finite guarantee", () => {
    expect(breakoutBonusDropChance(BREAKOUT_BONUS_MIN_BRICKS - 1)).toBe(0);
    expect(breakoutBonusDropChance(BREAKOUT_BONUS_MIN_BRICKS)).toBeGreaterThan(
      0,
    );
    expect(
      breakoutBonusDropChance(BREAKOUT_BONUS_GUARANTEE_BRICKS - 1),
    ).toBeLessThan(1);
    expect(breakoutBonusDropChance(BREAKOUT_BONUS_GUARANTEE_BRICKS)).toBe(1);

    const chances = Array.from(
      { length: BREAKOUT_BONUS_GUARANTEE_BRICKS + 1 },
      (_, index) => breakoutBonusDropChance(index),
    );
    expect(
      chances.every(
        (chance, index) => index === 0 || chance >= chances[index - 1]!,
      ),
    ).toBe(true);
  });

  it("adds balls without a global cap and triples the complete active set", () => {
    const model = createBreakoutModel(640, 520);
    startBreakoutRun(model);
    model.controlLockTtl = 0;
    model.introTtl = 0;
    model.serveDelay = 0;

    expect(grantBreakoutBonus(model, "plus-two")).toBe(true);
    expect(model.balls).toHaveLength(3);
    expect(model.lastBonusType).toBe("plus-two");

    expect(grantBreakoutBonus(model, "triple")).toBe(true);
    expect(model.balls).toHaveLength(9);
    expect(model.lastBonusType).toBe("triple");

    expect(grantBreakoutBonus(model, "triple")).toBe(true);
    expect(model.balls).toHaveLength(27);

    expect(grantBreakoutBonus(model, "plus-two")).toBe(true);
    expect(model.balls).toHaveLength(29);

    expect(grantBreakoutBonus(model, "triple")).toBe(true);
    expect(model.balls).toHaveLength(87);
  });

  it("applies x3 to every ball present when caught", () => {
    const model = createBreakoutModel(640, 520);
    startBreakoutRun(model);
    model.serveDelay = 0;
    expect(grantBreakoutBonus(model, "plus-two")).toBe(true);
    expect(model.balls).toHaveLength(3);

    expect(grantBreakoutBonus(model, "triple")).toBe(true);
    expect(model.balls).toHaveLength(9);
  });

  it("activates global piercing and radius-three blast powerups", () => {
    const model = createBreakoutModel(640, 520);
    startBreakoutRun(model);
    model.serveDelay = 0;

    expect(grantBreakoutBonus(model, "pierce")).toBe(true);
    expect(model.piercingActive).toBe(true);
    expect(grantBreakoutBonus(model, "blast")).toBe(true);
    expect(model.blastRadiusActive).toBe(true);

    stepBreakoutModel(model, 30);
    expect(model.piercingActive).toBe(true);
    expect(model.blastRadiusActive).toBe(true);

    expect(grantBreakoutBonus(model, "plus-two")).toBe(true);
    expect(model.balls).toHaveLength(3);
    expect(model.piercingActive).toBe(true);
    expect(model.blastRadiusActive).toBe(true);
  });

  it("does not grant permanent powerups more than once", () => {
    const model = createBreakoutModel(640, 520);
    startBreakoutRun(model);
    model.serveDelay = 0;

    expect(grantBreakoutBonus(model, "pierce")).toBe(true);
    expect(grantBreakoutBonus(model, "pierce")).toBe(false);
    expect(grantBreakoutBonus(model, "blast")).toBe(true);
    expect(grantBreakoutBonus(model, "blast")).toBe(false);
  });

  it("renders every active 404 mask cell as a six by six block stroke", () => {
    const model = createBreakoutModel(1280, 720);
    const firstStrokeCell = model.bricks.filter(
      (brick) =>
        brick.digitIndex === 0 && brick.row === 0 && brick.column === 0,
    );
    expect(firstStrokeCell).toHaveLength(36);
  });

  it("launches bonus-created balls upward and above the paddle", () => {
    const model = createBreakoutModel(640, 520);
    startBreakoutRun(model);
    model.controlLockTtl = 0;
    model.introTtl = 0;
    model.serveDelay = 0;
    model.ballX = model.width - model.ballRadius * 0.5;
    model.ballY = model.height + model.ballRadius;
    model.ballVelocityX = 110;
    model.ballVelocityY = 330;

    expect(grantBreakoutBonus(model, "plus-two")).toBe(true);
    const added = model.balls[1];
    expect(added).toBeDefined();
    if (!added) return;

    expect(added.velocityY).toBeLessThan(0);
    expect(added.y + added.radius).toBeLessThanOrEqual(model.paddleY - 1.99);
    expect(added.x).toBeGreaterThanOrEqual(added.radius);
    expect(added.x).toBeLessThanOrEqual(model.width - added.radius);

    stepBreakoutModel(model, 1 / 60);
    expect(model.balls.some((ball) => ball.id === added.id)).toBe(true);
  });

  it("recenters the paddle for a deliberate restart", () => {
    const model = createBreakoutModel(640, 520);
    startBreakoutRun(model);
    model.paddleX = model.paddleWidth * 0.5;
    model.paddleTargetX = model.paddleX;

    startBreakoutRun(model);

    expect(model.paddleX).toBe(model.width * 0.5);
    expect(model.paddleTargetX).toBe(model.width * 0.5);
    expect(model.ballX).toBe(model.width * 0.5);
  });

  it("continues after one multiball pulse drops and loses only after all pulses leave", () => {
    const model = createBreakoutModel(640, 520);
    startBreakoutRun(model);
    model.controlLockTtl = 0;
    model.introTtl = 0;
    model.serveDelay = 0;
    grantBreakoutBonus(model, "plus-two");

    const extras = model.balls.slice(1);
    expect(extras).toHaveLength(2);
    for (const extra of extras) {
      extra.y = model.height + extra.radius + 2;
      extra.velocityY = 300;
    }
    stepBreakoutModel(model, 1 / 60);

    expect(model.phase).toBe("playing");
    expect(model.balls).toHaveLength(1);
    expect(model.lossTtl).toBeGreaterThan(0);

    model.ballY = model.height + model.ballRadius + 2;
    model.ballVelocityY = 300;
    stepBreakoutModel(model, 1 / 60);
    expect(model.phase).toBe("game-over");
    expect(model.balls).toHaveLength(0);
  });

  it("catches a falling +2 bonus on the paddle", () => {
    const model = createBreakoutModel(640, 520);
    startBreakoutRun(model);
    model.controlLockTtl = 0;
    model.introTtl = 0;
    model.serveDelay = 0;
    model.bonuses.push({
      id: 99,
      rotation: 0,
      size: 24,
      spin: 0,
      type: "plus-two",
      velocityY: 120,
      x: model.paddleX,
      y: model.paddleY - 10,
    });

    stepBreakoutModel(model, 1 / 60);

    expect(model.bonuses).toHaveLength(0);
    expect(model.balls).toHaveLength(3);
    expect(model.lastBonusType).toBe("plus-two");
    expect(model.bonusCatchTtl).toBeGreaterThan(0);
    expect(model.bonusCatchSerial).toBe(1);
  });

  it("removes a missed bonus after it leaves the playfield", () => {
    const model = createBreakoutModel(640, 520);
    startBreakoutRun(model);
    model.controlLockTtl = 0;
    model.introTtl = 0;
    model.serveDelay = 0;
    model.bonuses.push({
      id: 101,
      rotation: 0,
      size: 24,
      spin: 0,
      type: "plus-two",
      velocityY: 120,
      x: model.width * 0.5,
      y: model.height + 24,
    });

    stepBreakoutModel(model, 1 / 60);

    expect(model.bonuses).toHaveLength(0);
  });

  it("releases one queued bonus after the active drop has cleared", () => {
    const model = createBreakoutModel(640, 520);
    startBreakoutRun(model);
    model.controlLockTtl = 0;
    model.introTtl = 0;
    model.serveDelay = 0;
    model.bonusCooldown = 0;
    model.queuedBonus = {
      type: "triple",
      x: model.width * 0.5,
      y: model.height * 0.3,
    };

    stepBreakoutModel(model, 1 / 60);

    expect(model.queuedBonus).toBeNull();
    expect(model.bonuses).toHaveLength(1);
    expect(model.bonuses[0]?.type).toBe("triple");
  });

  it("keeps ball speed inside a finite minimum and maximum", () => {
    const model = createBreakoutModel(640, 520);
    const bounds = breakoutSpeedBounds(model);
    startBreakoutRun(model);
    model.controlLockTtl = 0;
    model.introTtl = 0;
    model.serveDelay = 0;
    model.ballVelocityX = bounds.maximum * 8;
    model.ballVelocityY = bounds.maximum * 8;

    stepBreakoutModel(model, 1 / 120);
    const speed = Math.hypot(model.ballVelocityX, model.ballVelocityY);
    expect(speed).toBeGreaterThanOrEqual(bounds.minimum - 0.01);
    expect(speed).toBeLessThanOrEqual(bounds.maximum + 0.01);
  });

  it("can slow on a centered paddle hit and accelerate on an edge hit", () => {
    const centered = createBreakoutModel(640, 520);
    const centeredBefore = preparePaddleHit(centered, 0);
    stepBreakoutModel(centered, 1 / 60);
    const centeredAfter = Math.hypot(
      centered.ballVelocityX,
      centered.ballVelocityY,
    );

    const edge = createBreakoutModel(640, 520);
    const edgeBefore = preparePaddleHit(edge, 0.9);
    stepBreakoutModel(edge, 1 / 60);
    const edgeAfter = Math.hypot(edge.ballVelocityX, edge.ballVelocityY);

    expect(centeredAfter).toBeLessThan(centeredBefore);
    expect(edgeAfter).toBeGreaterThan(edgeBefore);
    expect(centeredAfter).toBeGreaterThanOrEqual(
      breakoutSpeedBounds(centered).minimum - 0.01,
    );
    expect(edgeAfter).toBeLessThanOrEqual(
      breakoutSpeedBounds(edge).maximum + 0.01,
    );
  });

  it("accelerates after destroying a 404 segment without exceeding the cap", () => {
    const model = createBreakoutModel(640, 520);
    startBreakoutRun(model);
    model.controlLockTtl = 0;
    model.introTtl = 0;
    model.serveDelay = 0;
    const brick = model.bricks.find(
      (candidate) => candidate.id === "1:0:2:5:2",
    );
    expect(brick).toBeDefined();
    if (!brick) return;

    model.ballX = brick.x + brick.width * 0.5;
    model.ballY = brick.y + brick.height + model.ballRadius + 0.5;
    model.ballVelocityX = 0;
    model.ballVelocityY = -270;
    const before = Math.hypot(model.ballVelocityX, model.ballVelocityY);

    stepBreakoutModel(model, 1 / 60);
    const after = Math.hypot(model.ballVelocityX, model.ballVelocityY);
    expect(brick.alive).toBe(false);
    expect(after).toBeGreaterThan(before);
    expect(after).toBeLessThanOrEqual(
      breakoutSpeedBounds(model).maximum + 0.01,
    );
    expect(model.score).toBe(10);
    expect(model.impacts.length).toBeGreaterThan(0);
    expect(model.debris.length).toBeGreaterThan(0);
  });

  it("prevents near-horizontal and near-vertical dead loops", () => {
    const model = createBreakoutModel(640, 520);
    startBreakoutRun(model);
    model.controlLockTtl = 0;
    model.introTtl = 0;
    model.serveDelay = 0;
    model.ballVelocityX = 520;
    model.ballVelocityY = 2;
    stepBreakoutModel(model, 1 / 60);
    const speed = Math.hypot(model.ballVelocityX, model.ballVelocityY);
    expect(Math.abs(model.ballVelocityX) / speed).toBeLessThanOrEqual(0.901);
    expect(Math.abs(model.ballVelocityX) / speed).toBeGreaterThanOrEqual(0.179);
  });

  it("clamps pointer and keyboard paddle targets inside the field", () => {
    const model = createBreakoutModel(390, 520);
    moveBreakoutPaddle(model, -1_000);
    expect(model.paddleTargetX).toBe(model.paddleWidth * 0.5);
    moveBreakoutPaddle(model, 10_000);
    expect(model.paddleTargetX).toBe(model.width - model.paddleWidth * 0.5);
  });

  it("wins once and preserves the cleared 404 instead of starting another round", () => {
    const model = createBreakoutModel(640, 520);
    startBreakoutRun(model);
    for (const brick of model.bricks.slice(0, -1)) brick.alive = false;
    const last = model.bricks.at(-1);
    expect(last).toBeDefined();
    if (!last) return;
    model.controlLockTtl = 0;
    model.introTtl = 0;
    model.serveDelay = 0;
    model.ballX = last.x + last.width * 0.5;
    model.ballY = last.y + last.height + model.ballRadius + 0.5;
    model.ballVelocityX = 0;
    model.ballVelocityY = -280;

    stepBreakoutModel(model, 1 / 60);
    expect(remainingBreakoutBricks(model)).toBe(0);
    expect(model.phase).toBe("won");

    const score = model.score;
    const cleared = model.bricks.map((brick) => brick.alive);
    stepBreakoutModel(model, 10);
    expect(model.phase).toBe("won");
    expect(model.score).toBe(score);
    expect(model.bricks.map((brick) => brick.alive)).toEqual(cleared);
  });

  it("plays a bounded completion burst after the final 404 segment", () => {
    const model = createBreakoutModel(640, 520);
    startBreakoutRun(model);
    for (const brick of model.bricks.slice(0, -1)) brick.alive = false;
    const last = model.bricks.at(-1);
    expect(last).toBeDefined();
    if (!last) return;

    model.controlLockTtl = 0;
    model.introTtl = 0;
    model.serveDelay = 0;
    model.ballX = last.x + last.width * 0.5;
    model.ballY = last.y + last.height + model.ballRadius + 0.5;
    model.ballVelocityX = 40;
    model.ballVelocityY = -280;

    stepBreakoutModel(model, 1 / 60);
    expect(model.phase).toBe("won");
    expect(model.winTtl).toBeGreaterThan(0);
    expect(model.debris.length).toBeGreaterThan(20);
    expect(model.debris.length).toBeLessThanOrEqual(48);
    expect(model.impacts.length).toBeGreaterThanOrEqual(3);
    expect(model.impacts.length).toBeLessThanOrEqual(6);

    const firstTtl = model.winTtl;
    stepBreakoutPresentation(model, 1 / 30);
    expect(model.winTtl).toBeLessThan(firstTtl);
    expect(model.phase).toBe("won");

    for (let frame = 0; frame < 180; frame += 1) {
      stepBreakoutPresentation(model, 1 / 60);
    }
    expect(model.winTtl).toBe(0);
    expect(model.debris).toHaveLength(0);
    expect(model.impacts).toHaveLength(0);
    expect(model.phase).toBe("won");
  });

  it("loses immediately when the ball leaves the bottom of the field", () => {
    const model = createBreakoutModel(390, 520);
    startBreakoutRun(model);
    model.controlLockTtl = 0;
    model.introTtl = 0;
    model.serveDelay = 0;
    model.ballY = model.height + model.ballRadius + 2;
    model.ballVelocityY = 300;

    stepBreakoutModel(model, 1 / 60);
    expect(model.phase).toBe("game-over");
    expect(model.lossTtl).toBeGreaterThan(0);
    expect(remainingBreakoutBricks(model)).toBeGreaterThan(0);
  });

  it("preserves cleared 404 segments across orientation changes", () => {
    const model = createBreakoutModel(390, 844);
    const clearedId = model.bricks[0]!.id;
    model.bricks[0]!.alive = false;
    const remaining = remainingBreakoutBricks(model);
    resizeBreakoutModel(model, 844, 390);

    expect(remainingBreakoutBricks(model)).toBe(remaining);
    expect(model.bricks.find((brick) => brick.id === clearedId)?.alive).toBe(
      false,
    );
    expect(
      [model.ballX, model.ballY, model.paddleX, model.paddleTargetX].every(
        Number.isFinite,
      ),
    ).toBe(true);
    const speed = Math.hypot(model.ballVelocityX, model.ballVelocityY);
    const bounds = breakoutSpeedBounds(model);
    expect(speed).toBeGreaterThanOrEqual(bounds.minimum - 0.01);
    expect(speed).toBeLessThanOrEqual(bounds.maximum + 0.01);
  });

  it("keeps falling bonuses readable through repeated orientation changes", () => {
    const model = createBreakoutModel(390, 844);
    startBreakoutRun(model);
    model.bonuses.push({
      id: 88,
      rotation: 0,
      size: 24,
      spin: 0.5,
      type: "triple",
      velocityY: 120,
      x: model.width * 0.5,
      y: model.height * 0.4,
    });

    for (const [width, height] of [
      [844, 390],
      [320, 568],
      [1280, 720],
      [390, 844],
    ] as const) {
      resizeBreakoutModel(model, width, height);
      const bonus = model.bonuses[0];
      expect(bonus).toBeDefined();
      if (!bonus) return;
      expect(bonus.size).toBeGreaterThanOrEqual(20);
      expect(bonus.size).toBeLessThanOrEqual(30);
      expect(bonus.velocityY).toBeGreaterThanOrEqual(112);
      expect(bonus.velocityY).toBeLessThanOrEqual(172);
      expect(bonus.x).toBeGreaterThanOrEqual(bonus.size);
      expect(bonus.x).toBeLessThanOrEqual(model.width - bonus.size);
      expect(bonus.y).toBeGreaterThanOrEqual(-bonus.size);
      expect(bonus.y).toBeLessThanOrEqual(model.height + bonus.size);
    }
  });

  it("survives long repeated single-round sessions with bounded effects", () => {
    const model = createBreakoutModel(844, 390);
    startBreakoutRun(model);
    for (let frame = 0; frame < 72_000; frame += 1) {
      if (model.phase === "game-over" || model.phase === "won") {
        startBreakoutRun(model);
      }
      const target = model.width * (0.5 + Math.sin(frame * 0.017) * 0.43);
      moveBreakoutPaddle(model, target);
      stepBreakoutModel(model, 1 / 60);
    }

    const speed = Math.hypot(model.ballVelocityX, model.ballVelocityY);
    const bounds = breakoutSpeedBounds(model);
    expect(model.bricks.length).toBe(BREAKOUT_TARGET_SEGMENTS);
    expect(
      [
        model.ballX,
        model.ballY,
        model.ballVelocityX,
        model.ballVelocityY,
        model.paddleX,
        model.score,
        model.lossTtl,
        model.hitTtl,
        model.controlLockTtl,
        model.introTtl,
        model.comboWindow,
        model.bonusCatchTtl,
        model.bonusCooldown,
        model.bonusBrickTarget,
        ...model.balls.flatMap((ball) => [
          ball.x,
          ball.y,
          ball.velocityX,
          ball.velocityY,
          ball.radius,
        ]),
        ...model.bonuses.flatMap((bonus) => [
          bonus.x,
          bonus.y,
          bonus.velocityY,
          bonus.size,
          bonus.rotation,
          bonus.spin,
        ]),
        ...(model.queuedBonus
          ? [model.queuedBonus.x, model.queuedBonus.y]
          : []),
        ...model.debris.flatMap((particle) => [
          particle.x,
          particle.y,
          particle.velocityX,
          particle.velocityY,
          particle.ttl,
        ]),
      ].every(Number.isFinite),
    ).toBe(true);
    if (model.balls.length > 0) {
      expect(speed).toBeGreaterThanOrEqual(bounds.minimum - 0.01);
      expect(speed).toBeLessThanOrEqual(bounds.maximum + 0.01);
    }
    expect(model.bonuses.length).toBeLessThanOrEqual(
      BREAKOUT_MAX_ACTIVE_BONUSES,
    );
    expect(model.debris.length).toBeLessThanOrEqual(48);
    expect(model.impacts.length).toBeLessThanOrEqual(6);
  });

  it("handles a seam hit without trapping or cancelling the rebound", () => {
    const model = createBreakoutModel(640, 520);
    startBreakoutRun(model);
    model.controlLockTtl = 0;
    model.introTtl = 0;
    model.serveDelay = 0;
    const row = model.bricks.filter(
      (brick) => brick.digitIndex === 0 && brick.row === 3,
    );
    expect(row.length).toBeGreaterThan(1);
    const left = row.find((brick) => brick.id === "0:3:1:5:2");
    const right = row.find((brick) => brick.id === "0:3:1:5:3");
    expect(left).toBeDefined();
    expect(right).toBeDefined();
    if (!left || !right) return;
    const seam = (left.x + left.width + right.x) * 0.5;
    model.ballX = seam;
    model.ballY = left.y + left.height + model.ballRadius + 0.2;
    model.ballVelocityX = 0;
    model.ballVelocityY = -360;

    stepBreakoutModel(model, 1 / 60);

    expect(model.ballVelocityY).toBeGreaterThan(0);
    expect(row.filter((brick) => !brick.alive).length).toBeGreaterThanOrEqual(
      1,
    );
    expect(
      Math.hypot(model.ballVelocityX, model.ballVelocityY),
    ).toBeGreaterThan(200);
  });
});

describe("404 game policies", () => {
  it("caps high-DPR handheld rendering", () => {
    expect(gameRenderBudget(390, 520, 3, true)).toMatchObject({
      pixelRatio: 1,
      tier: "economy",
    });
    expect(gameRenderBudget(1280, 720, 2, false).pixelRatio).toBe(1.25);
    expect(gameRenderBudget(1560, 900, 2, false).pixelRatio).toBe(1);
  });

  it("reduces decorative render cost when reduced motion is requested", () => {
    const regular = gameRenderBudget(1280, 720, 2, false);
    const reduced = gameRenderBudget(1280, 720, 2, false, true);

    expect(regular.reducedMotion).toBe(false);
    expect(reduced.reducedMotion).toBe(true);
    expect(reduced.shadowBlur).toBeLessThan(regular.shadowBlur);
    expect(reduced.pixelRatio).toBe(regular.pixelRatio);
    expect(reduced.tier).toBe(regular.tier);
  });

  it("clamps frame gaps and stored scores", () => {
    expect(normalizedGameDelta(5_000)).toBe(1 / 30);
    expect(normalizedGameDelta(Number.NaN)).toBe(0);
    expect(normalizeStoredBestScore("999999999999")).toBe(999_999);
    expect(normalizeStoredBestScore("broken")).toBe(0);
  });
});
