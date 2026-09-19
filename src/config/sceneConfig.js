export const sceneConfig = Object.freeze({
  backgroundColor: 0x010611,
  camera: Object.freeze({
    fov: 55,
    near: 0.1,
    far: 1000,
    position: Object.freeze({ x: 0, y: 0, z: 25 }),
  }),
  renderer: Object.freeze({
    maxPixelRatio: 2,
    antialias: true,
  }),
  starfield: Object.freeze({
    count: 30000,
    minRadius: 42,
    maxRadius: 115,
    starBrightness: 0.94,
    starSizeScale: 2.25,
    twinkleStrength: 0.18,
    twinkleSpeed: 0.75,
    driftSpeed: 0.0022,
    // Milky Way tuning panel. These values can be changed without editing
    // the shaders in Starfield.js.
    milkyWay: Object.freeze({
      opacity: 0.52,
      width: 0.34,
      starDensity: 2.5,
      starSizeScale: 1.7,
      dustBrightness: 0.78,
      dustSaturation: 0.28,
      dustContrast: 1.7,
      darkLaneStrength: 0.72,
      fineNoiseStrength: 0.74,
      coreBrightness: 0.75,
      angle: -45,
      animationSpeed: 0.08,
    }),
  }),
  lighting: Object.freeze({
    ambient: Object.freeze({
      color: 0x8da6d6,
      intensity: 0.75,
    }),
    directional: Object.freeze({
      color: 0xffffff,
      intensity: 3.2,
      position: Object.freeze({ x: 4, y: 3, z: 6 }),
    }),
  }),
  hoverScale: 1.1,
  interaction: Object.freeze({
    hitAreaScale: 1.45,
    minimumHitRadius: 0.52,
  }),
  explore: Object.freeze({
    minScale: 0.78,
    maxScale: 1.5,
    focusRadius: 2.55,
    focusPosition: Object.freeze({ x: -6.8, y: -0.35, z: 4 }),
    transitionDuration: 1.15,
    backgroundPlanetScale: 0.62,
    backgroundPlanetBrightness: 0.42,
    selectedRotationScale: 0.5,
    rotationSensitivity: 2,
    zoomSensitivity: 8,
  }),
});
