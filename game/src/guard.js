// guard.js — a patrolling NPC: walks a closed loop of waypoints, turns its facing
// (and therefore its vision cone) smoothly toward its current direction of travel,
// and reports whether it currently sees the player once raycast occlusion is applied
// by the caller (game.js owns the "combine cone + raycast" decision; this file only
// owns the guard's own movement and facing).

import { distanceBetween, angleBetween, turnTowardAngle, resolveCircleRectOverlap } from './vector.js';
import { isPointInsideVisionCone, buildVisionConePolygon } from './visioncone.js';

const ARRIVAL_RADIUS = 6; // close enough to a waypoint to advance to the next one
const TURN_RATE_RADIANS_PER_SEC = Math.PI * 1.1;

export class Guard {
  constructor(routeDefinition) {
    this.id = routeDefinition.id;
    this.waypoints = routeDefinition.waypoints;
    this.speed = routeDefinition.speed;
    this.fieldOfViewRadians = routeDefinition.fieldOfViewRadians;
    this.viewDistance = routeDefinition.viewDistance;
    this.radius = 13;

    const start = this.waypoints[0];
    this.x = start.x;
    this.y = start.y;
    this.targetWaypointIndex = 1 % this.waypoints.length;
    const firstTarget = this.waypoints[this.targetWaypointIndex];
    this.facingAngle = angleBetween(this.x, this.y, firstTarget.x, firstTarget.y);
    this.isSpottingPlayer = false; // set externally by game.js after an occlusion check
  }

  update(deltaSeconds, coverRects) {
    const target = this.waypoints[this.targetWaypointIndex];
    const desiredAngle = angleBetween(this.x, this.y, target.x, target.y);
    this.facingAngle = turnTowardAngle(this.facingAngle, desiredAngle, TURN_RATE_RADIANS_PER_SEC * deltaSeconds);

    this.x += Math.cos(this.facingAngle) * this.speed * deltaSeconds;
    this.y += Math.sin(this.facingAngle) * this.speed * deltaSeconds;

    for (const rect of coverRects) {
      const [correctedX, correctedY] = resolveCircleRectOverlap(this.x, this.y, this.radius, rect);
      this.x = correctedX;
      this.y = correctedY;
    }

    if (distanceBetween(this.x, this.y, target.x, target.y) <= ARRIVAL_RADIUS) {
      this.targetWaypointIndex = (this.targetWaypointIndex + 1) % this.waypoints.length;
    }
  }

  // Geometric "is the player inside my cone shape" test, ignoring cover.
  // game.js is responsible for also checking raycast.js before trusting this as "sees".
  canGeometricallySee(pointX, pointY) {
    return isPointInsideVisionCone(
      pointX, pointY, this.x, this.y, this.facingAngle, this.fieldOfViewRadians, this.viewDistance,
    );
  }

  visionConePolygon() {
    return buildVisionConePolygon(this.x, this.y, this.facingAngle, this.fieldOfViewRadians, this.viewDistance);
  }
}
