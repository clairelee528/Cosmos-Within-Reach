const publicPath = (path) => `${import.meta.env.BASE_URL}${path}`;

export const HAND_TRACKING_CONFIG = Object.freeze({
  wasmPath: publicPath('mediapipe/wasm'),
  modelPath: publicPath('mediapipe/models/hand_landmarker.task'),
  runningMode: 'VIDEO',
  numHands: 1,
  minHandDetectionConfidence: 0.55,
  minHandPresenceConfidence: 0.55,
  minTrackingConfidence: 0.5,
});

