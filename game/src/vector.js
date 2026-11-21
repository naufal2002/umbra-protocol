// vector.js — small 2D math helpers shared by every system in the game.
// Deliberately tiny and dependency-free: a handful of pure functions, no classes,
// because almost everything else in game/src/ just needs "distance" and "clamp".

export function clamp(value, min, max) {
  return value < min ? min : value > max ? max : value;
}

export function distanceBetween(ax, ay, bx, by) {
  const dx = bx - ax;
  const dy = by - ay;
  return Math.sqrt(dx * dx + dy * dy);
}

export function angleBetween(ax, ay, bx, by) {
  return Math.atan2(by - ay, bx - ax);
}

// Smallest signed difference between two angles, result in (-PI, PI].
// Used to decide which way a guard should turn to face a new heading.
export function shortestAngleDelta(fromAngle, toAngle) {
  let delta = (toAngle - fromAngle) % (Math.PI * 2);
  if (delta > Math.PI) delta -= Math.PI * 2;
  if (delta < -Math.PI) delta += Math.PI * 2;
  return delta;
}

// Rotates `fromAngle` towards `toAngle` by at most `maxStep` radians.
// Lets a guard's facing (and thus its vision cone) turn smoothly instead of snapping.
export function turnTowardAngle(fromAngle, toAngle, maxStep) {
  const delta = shortestAngleDelta(fromAngle, toAngle);
  if (Math.abs(delta) <= maxStep) return fromAngle + delta;
  return fromAngle + Math.sign(delta) * maxStep;
}

// Clamps a circle (cx,cy,radius) so it does not overlap an axis-aligned rect.
// Returns the corrected [x, y] for the circle's centre, or the original point if no overlap.
// Used for both player-vs-cover and guard-vs-cover collision.
export function resolveCircleRectOverlap(cx, cy, radius, rect) {
  const closestX = clamp(cx, rect.x, rect.x + rect.w);
  const closestY = clamp(cy, rect.y, rect.y + rect.h);
  const dx = cx - closestX;
  const dy = cy - closestY;
  const distSq = dx * dx + dy * dy;
  if (distSq >= radius * radius) return [cx, cy];
  if (distSq === 0) {
    // Centre is exactly inside the rect (rare, e.g. first frame spawn) — push out
    // along whichever axis needs the smaller nudge.
    const pushLeft = cx - rect.x;
    const pushRight = rect.x + rect.w - cx;
    const pushUp = cy - rect.y;
    const pushDown = rect.y + rect.h - cy;
    const smallest = Math.min(pushLeft, pushRight, pushUp, pushDown);
    if (smallest === pushLeft) return [rect.x - radius, cy];
    if (smallest === pushRight) return [rect.x + rect.w + radius, cy];
    if (smallest === pushUp) return [cx, rect.y - radius];
    return [cx, rect.y + rect.h + radius];
  }
  const dist = Math.sqrt(distSq);
  const overlap = radius - dist;
  return [cx + (dx / dist) * overlap, cy + (dy / dist) * overlap];
}
