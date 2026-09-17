export const sceneConfig = Object.freeze({
  backgroundColor: 0x02030a,
  camera: Object.freeze({
    fov: 55,
    near: 0.1,
    far: 1000,
    position: Object.freeze({ x: 0, y: 0, z: 10 }),
  }),
  renderer: Object.freeze({
    maxPixelRatio: 2,
    antialias: true,
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
  testSphere: Object.freeze({
    color: 0x547ccb,
    gridColor: 0xb8d2ff,
    markerColor: 0xffd166,
  }),
  hoverScale: 1.1,
  explore: Object.freeze({
    minScale: 1,
    maxScale: 2.5,
    rotationSensitivity: 2,
    zoomSensitivity: 8,
  }),
});
