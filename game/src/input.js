// input.js — keyboard + mouse state tracking for a single canvas.
// No game logic lives here; this module just answers "what is currently held down"
// and "where is the mouse, in canvas/world coordinates" for whoever asks.

export class InputState {
  constructor(canvasElement) {
    this.canvas = canvasElement;
    this.heldKeys = new Set();
    this.mouseX = 0;
    this.mouseY = 0;
    this.restartRequested = false;

    window.addEventListener('keydown', (event) => {
      this.heldKeys.add(event.key.toLowerCase());
      if (event.key.toLowerCase() === 'r') this.restartRequested = true;
    });
    window.addEventListener('keyup', (event) => {
      this.heldKeys.delete(event.key.toLowerCase());
    });
    canvasElement.addEventListener('mousemove', (event) => {
      const bounds = canvasElement.getBoundingClientRect();
      const scaleX = canvasElement.width / bounds.width;
      const scaleY = canvasElement.height / bounds.height;
      this.mouseX = (event.clientX - bounds.left) * scaleX;
      this.mouseY = (event.clientY - bounds.top) * scaleY;
    });
  }

  isDown(key) {
    return this.heldKeys.has(key);
  }

  // Returns a normalised movement vector [x, y] in [-1,1] from the current WASD state.
  readMovementAxis() {
    let x = 0, y = 0;
    if (this.isDown('a')) x -= 1;
    if (this.isDown('d')) x += 1;
    if (this.isDown('w')) y -= 1;
    if (this.isDown('s')) y += 1;
    if (x !== 0 && y !== 0) {
      const inverseLength = 1 / Math.sqrt(2);
      x *= inverseLength;
      y *= inverseLength;
    }
    return [x, y];
  }

  consumeRestartRequest() {
    const requested = this.restartRequested;
    this.restartRequested = false;
    return requested;
  }
}
