// hud.js — draws on-screen status: the alert meter bar, a short status line, a
// mini-map in the corner, and the "caught" / "escaped" overlay banners. Pure
// rendering: reads game state, draws, never mutates anything.

export function drawAlertMeter(ctx, alertMeter, x, y, width, height) {
  ctx.save();
  ctx.fillStyle = 'rgba(10, 14, 22, 0.85)';
  ctx.fillRect(x - 4, y - 4, width + 8, height + 8);
  ctx.strokeStyle = 'rgba(140, 160, 190, 0.6)';
  ctx.lineWidth = 1;
  ctx.strokeRect(x - 4, y - 4, width + 8, height + 8);

  ctx.fillStyle = 'rgba(255,255,255,0.08)';
  ctx.fillRect(x, y, width, height);

  const fillWidth = width * alertMeter.value;
  const gradient = ctx.createLinearGradient(x, y, x + width, y);
  gradient.addColorStop(0, '#2bd4c0');
  gradient.addColorStop(0.55, '#f2c14e');
  gradient.addColorStop(1, '#ef4444');
  ctx.fillStyle = gradient;
  ctx.fillRect(x, y, fillWidth, height);

  ctx.strokeStyle = 'rgba(255,255,255,0.35)';
  ctx.strokeRect(x, y, width, height);

  ctx.fillStyle = '#e8edf5';
  ctx.font = '600 13px "Segoe UI", sans-serif';
  ctx.textBaseline = 'middle';
  ctx.fillText(`ALERT — ${alertMeter.statusLabel()}`, x, y - 12);
  ctx.restore();
}

export function drawStatusLine(ctx, text, x, y) {
  ctx.save();
  ctx.fillStyle = 'rgba(190, 205, 225, 0.85)';
  ctx.font = '13px "Segoe UI", sans-serif';
  ctx.textBaseline = 'top';
  ctx.fillText(text, x, y);
  ctx.restore();
}

// Tiny top-down abstraction of the room in the corner: dots for guards, a cyan dot
// for the player, grey marks for cover, a gold mark for the exit.
export function drawMiniMap(ctx, { roomBounds, coverObjects, guards, player, exitZone }, x, y, scale) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = 'rgba(8, 11, 18, 0.88)';
  ctx.fillRect(0, 0, roomBounds.w * scale, roomBounds.h * scale);
  ctx.strokeStyle = 'rgba(140, 160, 190, 0.5)';
  ctx.strokeRect(0, 0, roomBounds.w * scale, roomBounds.h * scale);

  const toMini = (worldX, worldY) => [(worldX - roomBounds.x) * scale, (worldY - roomBounds.y) * scale];

  ctx.fillStyle = 'rgba(150, 160, 175, 0.9)';
  for (const rect of coverObjects) {
    const [mx, my] = toMini(rect.x, rect.y);
    ctx.fillRect(mx, my, rect.w * scale, rect.h * scale);
  }

  ctx.fillStyle = '#f2b24a';
  const [ex, ey] = toMini(exitZone.x, exitZone.y);
  ctx.fillRect(ex, ey, exitZone.w * scale, exitZone.h * scale);

  ctx.fillStyle = '#ff6b4a';
  for (const guard of guards) {
    const [gx, gy] = toMini(guard.x, guard.y);
    ctx.beginPath();
    ctx.arc(gx, gy, 2.5, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = '#3fe3e0';
  const [px, py] = toMini(player.x, player.y);
  ctx.beginPath();
  ctx.arc(px, py, 3, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

export function drawCentreBanner(ctx, canvasWidth, canvasHeight, title, subtitle, tint) {
  ctx.save();
  ctx.fillStyle = 'rgba(5, 7, 12, 0.72)';
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  ctx.textAlign = 'center';
  ctx.fillStyle = tint;
  ctx.font = '700 40px "Segoe UI", sans-serif';
  ctx.fillText(title, canvasWidth / 2, canvasHeight / 2 - 10);

  ctx.fillStyle = 'rgba(220, 230, 245, 0.9)';
  ctx.font = '16px "Segoe UI", sans-serif';
  ctx.fillText(subtitle, canvasWidth / 2, canvasHeight / 2 + 30);
  ctx.textAlign = 'left';
  ctx.restore();
}
