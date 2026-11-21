// player.js — the player-controlled operative: position, radius, movement and
// collision against cover. No rendering and no input reading here; main.js hands
// this an axis vector each frame and this module just moves and resolves overlap.

import { resolveCircleRectOverlap, clamp } from './vector.js';

export class Player {
  constructor(spawnX, spawnY) {
    this.x = spawnX;
    this.y = spawnY;
    this.radius = 11;
    this.moveSpeed = 150; // pixels per second
    this.facingAngle = 0;
  }

  // axisX/axisY come from InputState.readMovementAxis(), already normalised.
  applyMovement(axisX, axisY, deltaSeconds, coverRects, roomBounds) {
    if (axisX !== 0 || axisY !== 0) {
      this.facingAngle = Math.atan2(axisY, axisX);
    }
    this.x += axisX * this.moveSpeed * deltaSeconds;
    this.y += axisY * this.moveSpeed * deltaSeconds;

    // Keep inside the room's interior walls.
    this.x = clamp(this.x, roomBounds.x + this.radius, roomBounds.x + roomBounds.w - this.radius);
    this.y = clamp(this.y, roomBounds.y + this.radius, roomBounds.y + roomBounds.h - this.radius);

    // Push back out of any crate/pillar/wall the movement just stepped into.
    for (const rect of coverRects) {
      const [correctedX, correctedY] = resolveCircleRectOverlap(this.x, this.y, this.radius, rect);
      this.x = correctedX;
      this.y = correctedY;
    }
  }

  teleportTo(x, y) {
    this.x = x;
    this.y = y;
  }

  isInsideZone(zone) {
    return this.x >= zone.x && this.x <= zone.x + zone.w && this.y >= zone.y && this.y <= zone.y + zone.h;
  }
}
