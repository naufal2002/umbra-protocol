// alertmeter.js — the progressive "being spotted" meter. Getting seen is not an
// instant game over: the meter rises while the guard can actually see the player
// and drains when they break line of sight, giving a real window to duck for cover.

export class AlertMeter {
  constructor({ fillPerSecond = 0.62, drainPerSecond = 0.38 } = {}) {
    this.value = 0; // 0 = fully hidden, 1 = caught
    this.fillPerSecond = fillPerSecond;
    this.drainPerSecond = drainPerSecond;
  }

  update(deltaSeconds, isCurrentlySpotted) {
    const rate = isCurrentlySpotted ? this.fillPerSecond : -this.drainPerSecond;
    this.value += rate * deltaSeconds;
    if (this.value < 0) this.value = 0;
    if (this.value > 1) this.value = 1;
  }

  isFull() {
    return this.value >= 1;
  }

  reset() {
    this.value = 0;
  }

  // Simple state label for the HUD, split into three readable bands.
  statusLabel() {
    if (this.value >= 1) return 'CAUGHT';
    if (this.value > 0.08) return 'SPOTTED';
    return 'HIDDEN';
  }
}
