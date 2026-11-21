// render.js — all drawing of the playfield itself (room, cover, guards, cones,
// player, exit). hud.js handles the on-screen overlay widgets separately; this file
// only draws "the world".

export function clearBackground(ctx, canvasWidth, canvasHeight) {
  const gradient = ctx.createLinearGradient(0, 0, 0, canvasHeight);
  gradient.addColorStop(0, '#0a0f1a');
  gradient.addColorStop(1, '#141a28');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);
}

export function drawRoomFloorAndWalls(ctx, roomBounds) {
  ctx.save();
  // Floor: subtle tile grid so the room reads as a built facility, not empty space.
  ctx.fillStyle = '#10151f';
  ctx.fillRect(roomBounds.x, roomBounds.y, roomBounds.w, roomBounds.h);

  ctx.strokeStyle = 'rgba(70, 90, 120, 0.12)';
  ctx.lineWidth = 1;
  const tileSize = 40;
  for (let gx = roomBounds.x; gx <= roomBounds.x + roomBounds.w; gx += tileSize) {
    ctx.beginPath();
    ctx.moveTo(gx, roomBounds.y);
    ctx.lineTo(gx, roomBounds.y + roomBounds.h);
    ctx.stroke();
  }
  for (let gy = roomBounds.y; gy <= roomBounds.y + roomBounds.h; gy += tileSize) {
    ctx.beginPath();
    ctx.moveTo(roomBounds.x, gy);
    ctx.lineTo(roomBounds.x + roomBounds.w, gy);
    ctx.stroke();
  }

  // Perimeter wall.
  ctx.strokeStyle = '#3a4a63';
  ctx.lineWidth = 6;
  ctx.strokeRect(roomBounds.x, roomBounds.y, roomBounds.w, roomBounds.h);
  ctx.restore();
}

export function drawCoverObjects(ctx, coverObjects) {
  for (const rect of coverObjects) {
    ctx.save();
    if (rect.kind === 'crate') {
      ctx.fillStyle = '#5b6578';
      ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
      ctx.strokeStyle = '#8891a2';
      ctx.lineWidth = 2;
      ctx.strokeRect(rect.x + 2, rect.y + 2, rect.w - 4, rect.h - 4);
      ctx.beginPath();
      ctx.moveTo(rect.x, rect.y);
      ctx.lineTo(rect.x + rect.w, rect.y + rect.h);
      ctx.moveTo(rect.x + rect.w, rect.y);
      ctx.lineTo(rect.x, rect.y + rect.h);
      ctx.strokeStyle = 'rgba(140,150,165,0.5)';
      ctx.stroke();
    } else if (rect.kind === 'pillar') {
      ctx.fillStyle = '#464f61';
      ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
      ctx.fillStyle = 'rgba(0,0,0,0.25)';
      ctx.fillRect(rect.x, rect.y, rect.w * 0.4, rect.h);
      ctx.strokeStyle = '#6b7690';
      ctx.lineWidth = 2;
      ctx.strokeRect(rect.x, rect.y, rect.w, rect.h);
    } else {
      // short wall stub
      ctx.fillStyle = '#505a6e';
      ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
      ctx.strokeStyle = '#78839a';
      ctx.lineWidth = 2;
      ctx.strokeRect(rect.x, rect.y, rect.w, rect.h);
    }
    ctx.restore();
  }
}

export function drawExitZone(ctx, exitZone, timeSeconds) {
  const centreX = exitZone.x + exitZone.w / 2;
  const centreY = exitZone.y + exitZone.h / 2;
  const pulse = 0.55 + 0.25 * Math.sin(timeSeconds * 2.4);

  ctx.save();
  const glow = ctx.createRadialGradient(centreX, centreY, 4, centreX, centreY, 70);
  glow.addColorStop(0, `rgba(255, 196, 102, ${0.55 * pulse})`);
  glow.addColorStop(1, 'rgba(255, 196, 102, 0)');
  ctx.fillStyle = glow;
  ctx.fillRect(centreX - 80, centreY - 80, 160, 160);

  ctx.fillStyle = '#2c2416';
  ctx.fillRect(exitZone.x, exitZone.y, exitZone.w, exitZone.h);
  ctx.strokeStyle = `rgba(255, 196, 102, ${0.7 + 0.3 * pulse})`;
  ctx.lineWidth = 3;
  ctx.strokeRect(exitZone.x, exitZone.y, exitZone.w, exitZone.h);

  ctx.fillStyle = '#ffdca0';
  ctx.font = '700 11px "Segoe UI", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('EXIT', centreX, exitZone.y - 10);
  ctx.textAlign = 'left';
  ctx.restore();
}

export function drawVisionCone(ctx, polygonPoints, isCurrentlySpotting) {
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(polygonPoints[0].x, polygonPoints[0].y);
  for (let i = 1; i < polygonPoints.length; i++) ctx.lineTo(polygonPoints[i].x, polygonPoints[i].y);
  ctx.closePath();
  ctx.fillStyle = isCurrentlySpotting ? 'rgba(239, 68, 68, 0.38)' : 'rgba(255, 150, 60, 0.20)';
  ctx.fill();
  ctx.strokeStyle = isCurrentlySpotting ? 'rgba(255, 90, 90, 0.75)' : 'rgba(255, 170, 90, 0.4)';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.restore();
}

export function drawGuard(ctx, guard) {
  ctx.save();
  // Body
  ctx.translate(guard.x, guard.y);
  ctx.fillStyle = guard.isSpottingPlayer ? '#ff5252' : '#ff8a3d';
  ctx.beginPath();
  ctx.arc(0, 0, guard.radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(20,10,5,0.6)';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Facing indicator (small nose pointing where the guard looks)
  ctx.rotate(guard.facingAngle);
  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  ctx.beginPath();
  ctx.moveTo(guard.radius - 1, 0);
  ctx.lineTo(guard.radius + 7, -4);
  ctx.lineTo(guard.radius + 7, 4);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

export function drawPlayer(ctx, player, isHiddenInCover) {
  ctx.save();
  ctx.translate(player.x, player.y);

  // Faint ground shadow for depth.
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.beginPath();
  ctx.ellipse(0, player.radius * 0.7, player.radius * 0.9, player.radius * 0.4, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.arc(0, 0, player.radius, 0, Math.PI * 2);
  ctx.fillStyle = isHiddenInCover ? 'rgba(63, 227, 224, 0.55)' : '#3fe3e0';
  ctx.fill();
  ctx.strokeStyle = '#d9fbfa';
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.rotate(player.facingAngle);
  ctx.fillStyle = '#0a2a2a';
  ctx.beginPath();
  ctx.arc(player.radius * 0.45, 0, player.radius * 0.28, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}
