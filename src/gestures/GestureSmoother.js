import { gestureConfig } from '../config/gestureConfig.js';

const lerp = (from, to, amount) => from + (to - from) * amount;
const applyCursorGain = (value, gain) =>
  gain === 1
    ? value
    : Math.min(1, Math.max(0, 0.5 + (value - 0.5) * gain));

/** Smooths cursor, movement, and pinch values without changing gesture labels. */
export class GestureSmoother {
  constructor({ config = gestureConfig } = {}) {
    this.config = config;
    this.smoothedCursor = null;
    this.smoothedMovement = { dx: 0, dy: 0 };
    this.smoothedPinchDistance = null;
    this.smoothedShakaSpan = null;
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
        rawShakaSpan: gestureFrame.shakaSpan,
        shakaSpan: null,
        movement: { dx: 0, dy: 0, magnitude: 0, moving: false },
      };
    }

    const rawCursor = { ...gestureFrame.cursor };
    const amplifiedCursor = {
      x: applyCursorGain(gestureFrame.cursor.x, this.config.cursorGainX),
      y: applyCursorGain(gestureFrame.cursor.y, this.config.cursorGainY),
    };
    const previousCursor = this.smoothedCursor;

    if (!previousCursor) {
      this.smoothedCursor = amplifiedCursor;
    } else {
      this.smoothedCursor = {
        x: lerp(
          previousCursor.x,
          amplifiedCursor.x,
          this.config.cursorSmoothing,
        ),
        y: lerp(
          previousCursor.y,
          amplifiedCursor.y,
          this.config.cursorSmoothing,
        ),
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

    const rawShakaSpan = gestureFrame.shakaSpan;
    if (Number.isFinite(rawShakaSpan)) {
      this.smoothedShakaSpan = Number.isFinite(this.smoothedShakaSpan)
        ? lerp(
            this.smoothedShakaSpan,
            rawShakaSpan,
            this.config.shakaSpanSmoothing,
          )
        : rawShakaSpan;
    } else {
      this.smoothedShakaSpan = null;
    }

    return {
      ...gestureFrame,
      rawCursor,
      cursor: { ...this.smoothedCursor },
      rawPinchDistance,
      pinchDistance: this.smoothedPinchDistance,
      rawShakaSpan,
      shakaSpan: this.smoothedShakaSpan,
      movement,
    };
  }

  reset() {
    this.smoothedCursor = null;
    this.smoothedMovement = { dx: 0, dy: 0 };
    this.smoothedPinchDistance = null;
    this.smoothedShakaSpan = null;
  }
}
