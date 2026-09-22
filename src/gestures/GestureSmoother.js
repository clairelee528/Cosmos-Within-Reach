import { gestureConfig } from '../config/gestureConfig.js';

const lerp = (from, to, amount) => from + (to - from) * amount;

/** Smooths cursor, movement, and pinch values without changing gesture labels. */
export class GestureSmoother {
  constructor({ config = gestureConfig } = {}) {
    this.config = config;
    this.smoothedCursor = null;
    this.smoothedMovement = { dx: 0, dy: 0 };
    this.smoothedPinchDistance = null;
  }

  update(gestureFrame) {
    if (!gestureFrame.cursor) {
      this.reset();
      return {
        ...gestureFrame,
        rawCursor: null,
        cursor: null,
        rawPinchDistance: gestureFrame.pinchDistance,
        pinchDistance: null,
        movement: { dx: 0, dy: 0, magnitude: 0, moving: false },
      };
    }

    const rawCursor = { ...gestureFrame.cursor };
    const previousCursor = this.smoothedCursor;

    if (!previousCursor) {
      this.smoothedCursor = rawCursor;
    } else {
      this.smoothedCursor = {
        x: lerp(previousCursor.x, rawCursor.x, this.config.cursorSmoothing),
        y: lerp(previousCursor.y, rawCursor.y, this.config.cursorSmoothing),
      };
    }

    const rawMovement = previousCursor
      ? {
          dx: this.smoothedCursor.x - previousCursor.x,
          dy: this.smoothedCursor.y - previousCursor.y,
        }
      : { dx: 0, dy: 0 };

    this.smoothedMovement = {
      dx: lerp(
        this.smoothedMovement.dx,
        rawMovement.dx,
        this.config.motionSmoothing,
      ),
      dy: lerp(
        this.smoothedMovement.dy,
        rawMovement.dy,
        this.config.motionSmoothing,
      ),
    };

    const magnitude = Math.hypot(
      this.smoothedMovement.dx,
      this.smoothedMovement.dy,
    );
    const moving = magnitude >= this.config.smoothedMotionDeadZone;
    const movement = moving
      ? { ...this.smoothedMovement, magnitude, moving }
      : { dx: 0, dy: 0, magnitude: 0, moving: false };

    const rawPinchDistance = gestureFrame.pinchDistance;
    if (Number.isFinite(rawPinchDistance)) {
      this.smoothedPinchDistance = Number.isFinite(this.smoothedPinchDistance)
        ? lerp(
            this.smoothedPinchDistance,
            rawPinchDistance,
            this.config.motionSmoothing,
          )
        : rawPinchDistance;
    } else {
      this.smoothedPinchDistance = null;
    }

    return {
      ...gestureFrame,
      rawCursor,
      cursor: { ...this.smoothedCursor },
      rawPinchDistance,
      pinchDistance: this.smoothedPinchDistance,
      movement,
    };
  }

  reset() {
    this.smoothedCursor = null;
    this.smoothedMovement = { dx: 0, dy: 0 };
    this.smoothedPinchDistance = null;
  }
}
