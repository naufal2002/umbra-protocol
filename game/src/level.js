// level.js — the one hand-built level for Umbra Protocol: a facility floor with a
// perimeter wall, scattered cover (crates, pillars, a short wall stub), three guard
// patrol loops, a player spawn point and a single glowing exit door.
//
// This is pure data (no behaviour) so render.js, guard.js and game.js can all read
// the same source of truth without importing each other.

export const WORLD_WIDTH = 960;
export const WORLD_HEIGHT = 600;

// Playable bounds — the room's interior, inset from the canvas edge so the wall
// itself is visible as a drawn border.
export const ROOM_BOUNDS = { x: 40, y: 40, w: 880, h: 520 };

// Cover rects double as both occluders (raycast.js) and solid obstacles (vector.js
// collision). `kind` only affects rendering.
export const COVER_OBJECTS = [
  { x: 210, y: 110, w: 70, h: 70, kind: 'crate' },
  { x: 210, y: 390, w: 70, h: 70, kind: 'crate' },
  { x: 430, y: 240, w: 44, h: 120, kind: 'pillar' },
  { x: 590, y: 70, w: 24, h: 190, kind: 'wall' },
  { x: 590, y: 410, w: 90, h: 60, kind: 'crate' },
  { x: 760, y: 240, w: 44, h: 120, kind: 'pillar' },
];

export const PLAYER_SPAWN = { x: 90, y: 300 };

export const EXIT_ZONE = { x: 858, y: 255, w: 46, h: 80 };

// Each guard patrols a closed loop of 3+ waypoints, walking leg by leg and looping
// back to the first point. Index 0 is also the guard's spawn position.
export const GUARD_ROUTES = [
  {
    id: 'north-corridor',
    speed: 72,
    fieldOfViewRadians: (58 * Math.PI) / 180,
    viewDistance: 165,
    waypoints: [
      { x: 150, y: 95 },
      { x: 520, y: 95 },
      { x: 520, y: 175 },
      { x: 150, y: 175 },
    ],
  },
  {
    id: 'centre-sweep',
    speed: 66,
    fieldOfViewRadians: (62 * Math.PI) / 180,
    viewDistance: 155,
    waypoints: [
      { x: 300, y: 300 },
      { x: 650, y: 300 },
      { x: 650, y: 460 },
      { x: 300, y: 460 },
    ],
  },
  {
    id: 'exit-watch',
    speed: 60,
    fieldOfViewRadians: (56 * Math.PI) / 180,
    viewDistance: 150,
    waypoints: [
      { x: 820, y: 150 },
      { x: 820, y: 480 },
      { x: 715, y: 480 },
      { x: 715, y: 150 },
    ],
  },
];
