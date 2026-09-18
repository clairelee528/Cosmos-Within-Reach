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
    count: 24000,
    minRadius: 42,
    maxRadius: 115,
    starBrightness: 0.94,
    driftSpeed: 0.00095,
    // Milky Way tuning panel. These values can be changed without editing
    // the shaders in Starfield.js.
    milkyWay: Object.freeze({
      opacity: 0.52,
      width: 0.34,
      starDensity: 2.2,
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
  explore: Object.freeze({
    minScale: 1,
    maxScale: 2.5,
    rotationSensitivity: 2,
    zoomSensitivity: 8,
  }),
});
