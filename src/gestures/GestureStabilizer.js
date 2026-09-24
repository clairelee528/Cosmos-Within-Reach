import { gestureConfig } from '../config/gestureConfig.js';
import { GESTURES } from './GestureEngine.js';

const CONFIRM_FRAME_KEYS = Object.freeze({
  [GESTURES.NONE]: 'noneConfirmFrames',
  [GESTURES.POINT]: 'pointConfirmFrames',
  [GESTURES.PINCH]: 'pinchConfirmFrames',
  [GESTURES.OPEN_PALM]: 'openPalmConfirmFrames',
  [GESTURES.SHAKA]: 'shakaConfirmFrames',
});

const COOLDOWN_KEYS = Object.freeze({
  [GESTURES.PINCH]: 'selectCooldownMs',
  [GESTURES.OPEN_PALM]: 'backCooldownMs',
});

/** Converts noisy per-frame gesture labels into deliberate stable states. */
export class GestureStabilizer {
  constructor({ config = gestureConfig } = {}) {
    this.config = config;
    this.stableGesture = GESTURES.NONE;
    this.candidateGesture = GESTURES.NONE;
    this.candidateFrames = 0;
    this.lastActivation = new Map();
  }

  update(rawFrame) {
    const timestamp = rawFrame.timestamp ?? performance.now();
    const rawGesture = rawFrame.gesture ?? GESTURES.NONE;
    const observedGesture = this.applyPinchHysteresis(rawFrame);
    let changed = false;
    let activated = false;

    if (observedGesture === this.stableGesture) {
      this.resetCandidate();
    } else {
      if (observedGesture !== this.candidateGesture) {
        this.candidateGesture = observedGesture;
        this.candidateFrames = 1;
      } else {
        this.candidateFrames += 1;
      }

      if (this.candidateFrames >= this.getConfirmFrames(observedGesture)) {
        this.stableGesture = observedGesture;
        changed = true;
        activated = this.tryActivate(observedGesture, timestamp);
        this.resetCandidate();
      }
    }

    return {
      ...rawFrame,
      gesture: this.stableGesture,
      rawGesture,
      stableGesture: this.stableGesture,
      candidateGesture: this.candidateGesture,
      candidateFrames: this.candidateFrames,
      changed,
      activated,
      cooldownRemainingMs: this.getCooldownRemaining(
        this.stableGesture,
        timestamp,
      ),
    };
  }

  applyPinchHysteresis(rawFrame) {
    const isHoldingPinch =
      this.stableGesture === GESTURES.PINCH &&
      Number.isFinite(rawFrame.pinchDistance) &&
      rawFrame.pinchDistance <= this.config.pinchReleaseThreshold;

    return isHoldingPinch ? GESTURES.PINCH : rawFrame.gesture;
  }

  getConfirmFrames(gesture) {
    return this.config[CONFIRM_FRAME_KEYS[gesture]] ?? 1;
  }

  getCooldownMs(gesture) {
    return this.config[COOLDOWN_KEYS[gesture]] ?? 0;
  }

  tryActivate(gesture, timestamp) {
    if (gesture === GESTURES.NONE) return false;

    const cooldown = this.getCooldownMs(gesture);
    const lastActivatedAt = this.lastActivation.get(gesture) ?? -Infinity;
    if (timestamp - lastActivatedAt < cooldown) return false;

    this.lastActivation.set(gesture, timestamp);
    return true;
  }

  getCooldownRemaining(gesture, timestamp) {
    const cooldown = this.getCooldownMs(gesture);
    const lastActivatedAt = this.lastActivation.get(gesture);
    if (!cooldown || lastActivatedAt === undefined) return 0;
    return Math.max(0, cooldown - (timestamp - lastActivatedAt));
  }

  resetCandidate() {
    this.candidateGesture = this.stableGesture;
    this.candidateFrames = 0;
  }

  reset() {
    this.stableGesture = GESTURES.NONE;
    this.candidateGesture = GESTURES.NONE;
    this.candidateFrames = 0;
    this.lastActivation.clear();
  }
}
