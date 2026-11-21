// main.js — entry point: wires up the canvas, input, the Game instance, and runs
// the requestAnimationFrame loop. Also owns the small pre-round "title" state and
// the post-round "caught"/"escaped" banners, since those are just presentation
// states layered over the same Game object rather than separate screens.

import { Game, RoundOutcome } from './game.js';
import { InputState } from './input.js';
import {
  clearBackground, drawRoomFloorAndWalls, drawCoverObjects, drawExitZone,
  drawVisionCone, drawGuard, drawPlayer,
} from './render.js';
import { drawAlertMeter, drawStatusLine, drawMiniMap, drawCentreBanner } from './hud.js';
import { WORLD_WIDTH, WORLD_HEIGHT } from './level.js';

const canvas = document.getElementById('game-canvas');
canvas.width = WORLD_WIDTH;
canvas.height = WORLD_HEIGHT;
const ctx = canvas.getContext('2d');

const input = new InputState(canvas);
const game = new Game();

const Phase = Object.freeze({ TITLE: 'title', RUNNING: 'running', RESULT: 'result' });
let phase = Phase.TITLE;
let resultHoldSeconds = 0;

function beginRound() {
  game.resetRound();
  phase = Phase.RUNNING;
  resultHoldSeconds = 0;
}

function renderWorld() {
  clearBackground(ctx, canvas.width, canvas.height);
  drawRoomFloorAndWalls(ctx, game.roomBounds);
  drawExitZone(ctx, game.exitZone, game.elapsedSeconds);

  // Cones drawn before cover and player so solid objects visually sit "above" the
  // translucent light, which is what sells the "crate blocks the beam" read.
  for (const guard of game.guards) {
    drawVisionCone(ctx, guard.visionConePolygon(), guard.isSpottingPlayer);
  }

  drawCoverObjects(ctx, game.coverObjects);
  for (const guard of game.guards) drawGuard(ctx, guard);

  const isHiddenInCover = game.alertMeter.value < 0.05;
  drawPlayer(ctx, game.player, isHiddenInCover);
}

function renderHud() {
  drawAlertMeter(ctx, game.alertMeter, 24, 36, 220, 16);
  drawStatusLine(ctx, 'WASD to move · reach the glowing EXIT · R to restart', 24, 64);
  drawMiniMap(
    ctx,
    { roomBounds: game.roomBounds, coverObjects: game.coverObjects, guards: game.guards, player: game.player, exitZone: game.exitZone },
    canvas.width - 180,
    16,
    0.16,
  );
}

let lastTimestampMs = performance.now();

function frame(nowMs) {
  const deltaSeconds = Math.min((nowMs - lastTimestampMs) / 1000, 1 / 20);
  lastTimestampMs = nowMs;

  if (input.consumeRestartRequest()) beginRound();

  if (phase === Phase.TITLE) {
    game.recomputeGuardSightLines(); // keep cones/guards animated-looking behind the title text
    for (const guard of game.guards) guard.update(deltaSeconds, game.coverObjects);
    renderWorld();
    drawCentreBanner(ctx, canvas.width, canvas.height, 'UMBRA PROTOCOL', 'Press any WASD key to infiltrate', '#3fe3e0');
    if (input.isDown('w') || input.isDown('a') || input.isDown('s') || input.isDown('d')) beginRound();
  } else if (phase === Phase.RUNNING) {
    const [axisX, axisY] = input.readMovementAxis();
    game.update(deltaSeconds, axisX, axisY);
    renderWorld();
    renderHud();
    if (game.outcome !== RoundOutcome.PLAYING) phase = Phase.RESULT;
  } else if (phase === Phase.RESULT) {
    resultHoldSeconds += deltaSeconds;
    renderWorld();
    renderHud();
    if (game.outcome === RoundOutcome.CAUGHT) {
      drawCentreBanner(ctx, canvas.width, canvas.height, 'CAUGHT', 'Spotted with no cover left — press R to try again', '#ef4444');
    } else {
      drawCentreBanner(ctx, canvas.width, canvas.height, 'ESCAPED', 'Facility cleared without raising the alarm — press R to replay', '#3fe3e0');
    }
  }

  requestAnimationFrame(frame);
}

requestAnimationFrame(frame);
