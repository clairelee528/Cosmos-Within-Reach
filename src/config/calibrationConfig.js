export const CALIBRATION_TARGETS = Object.freeze([
  Object.freeze({ id: 'TOP_LEFT', x: 0, y: 0 }),
  Object.freeze({ id: 'TOP_RIGHT', x: 1, y: 0 }),
  Object.freeze({ id: 'BOTTOM_RIGHT', x: 1, y: 1 }),
  Object.freeze({ id: 'BOTTOM_LEFT', x: 0, y: 1 }),
]);

export const calibrationConfig = Object.freeze({
  enabledByDefault: false,
  storageKey: 'cosmos-within-reach:calibration',
  targetHoldMs: 700,
});

