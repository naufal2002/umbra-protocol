// game.js — orchestration layer: owns the player, the guards, the alert meter and
// the win/caught state machine, and ties raycast.js + visioncone.js together into
// the single rule that matters: "a guard sees the player only if the player is
// geometrically inside its cone AND no cover rectangle blocks the straight line
// between them." Rendering is delegated to render.js / hud.js; this file is logic
// only, so it can be read top-to-bottom as "how does a round of Umbra Protocol run".

import { Player } from './player.js';
import { Guard } from './guard.js';
import { AlertMeter } from './alertmeter.js';
import { isLineOfSightBlocked } from './raycast.js';
import {
  COVER_OBJECTS, GUARD_ROUTES, PLAYER_SPAWN, EXIT_ZONE, ROOM_BOUNDS,
} from './level.js';

export const RoundOutcome = Object.freeze({
  PLAYING: 'playing',
  CAUGHT: 'caught',
  ESCAPED: 'escaped',
});

export class Game {
  constructor() {
    this.roomBounds = ROOM_BOUNDS;
    this.coverObjects = COVER_OBJECTS;
    this.exitZone = EXIT_ZONE;
    this.alertMeter = new AlertMeter();
    this.outcome = RoundOutcome.PLAYING;
    this.elapsedSeconds = 0;
    this.resetRound();
  }

  resetRound() {
    this.player = new Player(PLAYER_SPAWN.x, PLAYER_SPAWN.y);
    this.guards = GUARD_ROUTES.map((route) => new Guard(route));
    this.alertMeter.reset();
    this.outcome = RoundOutcome.PLAYING;
  }

  // Returns true if the player's centre is currently visible to at least one guard
  // (inside that guard's cone AND no cover rect occludes the line between them).
  // Also stamps `guard.isSpottingPlayer` on each guard so render.js can tint cones
  // and bodies without recomputing anything.
  recomputeGuardSightLines() {
    let anyGuardSeesPlayer = false;
    for (const guard of this.guards) {
      const insideConeShape = guard.canGeometricallySee(this.player.x, this.player.y);
      const blocked = insideConeShape
        ? isLineOfSightBlocked(guard.x, guard.y, this.player.x, this.player.y, this.coverObjects)
        : true;
      guard.isSpottingPlayer = insideConeShape && !blocked;
      if (guard.isSpottingPlayer) anyGuardSeesPlayer = true;
    }
    return anyGuardSeesPlayer;
  }

  // One tick of simulation. `axisX/axisY` is the player's movement input for this
  // frame; returns nothing — read `this.outcome` / `this.alertMeter` afterwards.
  update(deltaSeconds, axisX, axisY) {
    if (this.outcome !== RoundOutcome.PLAYING) return;

    this.elapsedSeconds += deltaSeconds;
    this.player.applyMovement(axisX, axisY, deltaSeconds, this.coverObjects, this.roomBounds);
    for (const guard of this.guards) guard.update(deltaSeconds, this.coverObjects);

    const isSpotted = this.recomputeGuardSightLines();
    this.alertMeter.update(deltaSeconds, isSpotted);

    if (this.alertMeter.isFull()) {
      this.outcome = RoundOutcome.CAUGHT;
      return;
    }
    if (this.player.isInsideZone(this.exitZone)) {
      this.outcome = RoundOutcome.ESCAPED;
    }
  }
}
