export const gestureConfig = Object.freeze({
  // Distances are divided by palm size, so thresholds work at different depths.
  pinchThreshold: 0.38,
  pinchReleaseThreshold: 0.5,
  minimumPalmScale: 0.025,
  fingerExtensionRatio: 0.72,
  openPalmFingerExtensionRatio: 0.6,
  motionDeadZone: 0.008,
  smoothedMotionDeadZone: 0.003,
  pointConfirmFrames: 3,
  pinchConfirmFrames: 3,
  openPalmConfirmFrames: 5,
  noneConfirmFrames: 3,
  cursorSmoothing: 0.18,
  motionSmoothing: 0.2,
  selectCooldownMs: 700,
  backCooldownMs: 1000,
});
