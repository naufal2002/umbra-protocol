// visioncone.js — geometry for a guard's field of view: "is this point inside the
// cone?" and "what polygon should I draw for it?". Occlusion (cover blocking sight)
// is intentionally NOT handled here — that is raycast.js's job, kept separate so
// each file answers exactly one question.

import { distanceBetween, angleBetween, shortestAngleDelta } from './vector.js';

// Pure geometric test: is (px,py) within range and within the facing half-angle of
// a guard positioned at (originX,originY) looking at `facingAngle`?
export function isPointInsideVisionCone(px, py, originX, originY, facingAngle, fieldOfViewRadians, viewDistance) {
  const distance = distanceBetween(originX, originY, px, py);
  if (distance > viewDistance) return false;
  if (distance < 1e-6) return true; // standing exactly on the guard
  const angleToPoint = angleBetween(originX, originY, px, py);
  const halfFov = fieldOfViewRadians / 2;
  return Math.abs(shortestAngleDelta(facingAngle, angleToPoint)) <= halfFov;
}

// Builds a fan of points describing the cone's filled shape, for render.js to draw
// as a single canvas path. `segments` controls how smooth the outer arc looks.
export function buildVisionConePolygon(originX, originY, facingAngle, fieldOfViewRadians, viewDistance, segments = 18) {
  const halfFov = fieldOfViewRadians / 2;
  const points = [{ x: originX, y: originY }];
  for (let i = 0; i <= segments; i++) {
    const angle = facingAngle - halfFov + (fieldOfViewRadians * i) / segments;
    points.push({
      x: originX + Math.cos(angle) * viewDistance,
      y: originY + Math.sin(angle) * viewDistance,
    });
  }
  return points;
}
