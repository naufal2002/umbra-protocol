// raycast.js — line-of-sight occlusion tests against the level's cover rectangles.
// This is the piece that makes "hide behind a crate" actually work: a guard's vision
// cone can geometrically contain the player while still not *seeing* them, because a
// straight line from the guard's eye to the player's centre crosses a solid cover rect.

// Classic segment/segment intersection via orientation + the standard parametric solve.
// Returns true if segment (ax,ay)-(bx,by) crosses segment (cx,cy)-(dx,dy).
function segmentsIntersect(ax, ay, bx, by, cx, cy, dx, dy) {
  const d1x = bx - ax, d1y = by - ay;
  const d2x = dx - cx, d2y = dy - cy;
  const denom = d1x * d2y - d1y * d2x;
  if (denom === 0) return false; // parallel (or collinear) — treat as a non-blocking edge case
  const t = ((cx - ax) * d2y - (cy - ay) * d2x) / denom;
  const u = ((cx - ax) * d1y - (cy - ay) * d1x) / denom;
  return t > 0 && t < 1 && u > 0 && u < 1;
}

// Does the segment from (x1,y1) to (x2,y2) cross any edge of an axis-aligned rect?
function segmentCrossesRect(x1, y1, x2, y2, rect) {
  const left = rect.x, right = rect.x + rect.w;
  const top = rect.y, bottom = rect.y + rect.h;
  return (
    segmentsIntersect(x1, y1, x2, y2, left, top, right, top) ||
    segmentsIntersect(x1, y1, x2, y2, right, top, right, bottom) ||
    segmentsIntersect(x1, y1, x2, y2, right, bottom, left, bottom) ||
    segmentsIntersect(x1, y1, x2, y2, left, bottom, left, top)
  );
}

// Public entry point: is the straight line between two points blocked by any
// rectangle in `occluders`? Used by the vision system before it trusts a raw
// "is the player inside the cone shape" test.
export function isLineOfSightBlocked(x1, y1, x2, y2, occluders) {
  for (const rect of occluders) {
    if (segmentCrossesRect(x1, y1, x2, y2, rect)) return true;
  }
  return false;
}
