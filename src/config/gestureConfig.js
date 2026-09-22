export const gestureConfig = Object.freeze({
  // Distances are divided by palm size, so thresholds work at different depths.
  // A tighter threshold avoids triggering while thumb and index are merely
  // approaching one another. A real closed pinch usually measures < 0.2.
  pinchThreshold: 0.27,
  pinchReleaseThreshold: 0.4,
  minimumPalmScale: 0.025,
  fingerExtensionRatio: 0.72,
  openPalmFingerExtensionRatio: 0.6,
  motionDeadZone: 0.008,
  smoothedMotionDeadZone: 0.003,
  pointConfirmFrames: 3,
  pinchConfirmFrames: 4,
  openPalmConfirmFrames: 5,
  noneConfirmFrames: 3,
  cursorSmoothing: 0.18,
  // Expands movement around the camera frame centre so a smaller physical
  // hand movement can reach the whole projected screen.
  cursorGainX: 2.5,
  cursorGainY: 3.4,
  motionSmoothing: 0.2,
  selectCooldownMs: 700,
  backCooldownMs: 1000,
});
