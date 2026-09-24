import test from 'node:test';
import assert from 'node:assert/strict';
import { GestureEngine, GESTURES } from '../src/gestures/GestureEngine.js';

const FINGERS = [
  [5, 6, 7, 8, 0.34],
  [9, 10, 11, 12, 0.45],
  [13, 14, 15, 16, 0.56],
  [17, 18, 19, 20, 0.67],
];

const makeOpenHand = () => {
  const points = Array.from({ length: 21 }, () => ({ x: 0.5, y: 0.7, z: 0 }));
  points[0] = { x: 0.5, y: 0.92, z: 0 };
  points[1] = { x: 0.4, y: 0.8, z: 0 };
  points[2] = { x: 0.3, y: 0.7, z: 0 };
  points[3] = { x: 0.22, y: 0.61, z: 0 };
  points[4] = { x: 0.14, y: 0.52, z: 0 };

  FINGERS.forEach(([mcp, pip, dip, tip, x]) => {
    points[mcp] = { x, y: 0.68, z: 0 };
    points[pip] = { x, y: 0.5, z: 0 };
    points[dip] = { x, y: 0.34, z: 0 };
    points[tip] = { x, y: 0.18, z: 0 };
  });
  return points;
};

const foldFinger = (points, [mcp, pip, dip, tip, x]) => {
  points[mcp] = { x, y: 0.68, z: 0 };
  points[pip] = { x, y: 0.52, z: 0 };
  points[dip] = { x: x + 0.05, y: 0.59, z: 0 };
  points[tip] = { x, y: 0.66, z: 0 };
};

const frame = (landmarks) => ({
  detected: true,
  handedness: 'Right',
  landmarks,
  timestamp: 100,
});

test('returns NONE when no complete hand is present', () => {
  const engine = new GestureEngine();
  assert.equal(engine.update({ detected: false }).gesture, GESTURES.NONE);
});

test('detects an open palm when four fingers are extended', () => {
  const engine = new GestureEngine();
  const result = engine.update(frame(makeOpenHand()));
  assert.equal(result.gesture, GESTURES.OPEN_PALM);
});

test('detects point when only the index finger is extended', () => {
  const engine = new GestureEngine();
  const points = makeOpenHand();
  FINGERS.slice(1).forEach((finger) => foldFinger(points, finger));
  assert.equal(engine.update(frame(points)).gesture, GESTURES.POINT);
});

test('detects thumb-and-pinky spread when the middle fingers are folded', () => {
  const engine = new GestureEngine();
  const points = makeOpenHand();
  FINGERS.slice(0, 3).forEach((finger) => foldFinger(points, finger));
  const result = engine.update(frame(points));
  assert.equal(result.gesture, GESTURES.SHAKA);
  assert.equal(result.shakaPose, true);
  assert.ok(result.shakaSpan > 1.35);
});

test('gives pinch priority over other overlapping poses', () => {
  const engine = new GestureEngine();
  const points = makeOpenHand();
  points[4] = { ...points[8], x: points[8].x + 0.01 };
  const result = engine.update(frame(points));
  assert.equal(result.gesture, GESTURES.PINCH);
  assert.ok(result.pinchDistance < 0.1);
});
