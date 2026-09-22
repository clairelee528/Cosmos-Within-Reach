import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateMotion,
  distance2D,
  distance3D,
  getFingerExtensionRatio,
  getPalmScale,
  isFingerExtended,
  normalizedDistance,
} from '../src/gestures/GestureUtils.js';

const makeLandmarks = () => {
  const landmarks = Array.from({ length: 21 }, () => ({ x: 0, y: 0, z: 0 }));
  landmarks[0] = { x: 0.5, y: 0.9, z: 0 };
  landmarks[5] = { x: 0.35, y: 0.65, z: 0 };
  landmarks[9] = { x: 0.5, y: 0.6, z: 0 };
  landmarks[17] = { x: 0.65, y: 0.65, z: 0 };
  landmarks[6] = { x: 0.35, y: 0.5, z: 0 };
  landmarks[7] = { x: 0.35, y: 0.35, z: 0 };
  landmarks[8] = { x: 0.35, y: 0.2, z: 0 };
  return landmarks;
};

test('calculates 2D and 3D landmark distances', () => {
  assert.equal(distance2D({ x: 0, y: 0 }, { x: 3, y: 4 }), 5);
  assert.equal(distance3D({ x: 0, y: 0, z: 0 }, { x: 2, y: 3, z: 6 }), 7);
});

test('normalizes distance using the current hand size', () => {
  const landmarks = makeLandmarks();
  const palmScale = getPalmScale(landmarks);
  assert.ok(palmScale > 0.29 && palmScale < 0.31);
  assert.equal(
    normalizedDistance(landmarks[5], landmarks[17], landmarks),
    1,
  );
});

test('detects a straight index finger independently of screen direction', () => {
  const landmarks = makeLandmarks();
  assert.ok(getFingerExtensionRatio(landmarks, 'INDEX') > 0.99);
  assert.equal(isFingerExtended(landmarks, 'INDEX'), true);

  landmarks[7] = { x: 0.43, y: 0.55, z: 0 };
  landmarks[8] = { x: 0.36, y: 0.62, z: 0 };
  assert.equal(isFingerExtended(landmarks, 'INDEX'), false);
});

test('calculates normalized movement and applies the dead zone', () => {
  const still = calculateMotion({ x: 0.5, y: 0.5 }, { x: 0.504, y: 0.5 }, 0.2);
  const moving = calculateMotion({ x: 0.5, y: 0.5 }, { x: 0.52, y: 0.51 }, 0.2);
  assert.equal(still.moving, false);
  assert.equal(moving.moving, true);
  assert.ok(moving.normalized > 0.11);
});

test('rejects incomplete landmark input with a useful error', () => {
  assert.throws(() => distance2D(undefined, { x: 0, y: 0 }), TypeError);
  assert.throws(() => isFingerExtended(makeLandmarks(), 'THUMB'), RangeError);
});
