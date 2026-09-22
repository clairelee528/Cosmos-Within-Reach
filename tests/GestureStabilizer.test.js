import test from 'node:test';
import assert from 'node:assert/strict';
import { GESTURES } from '../src/gestures/GestureEngine.js';
import { GestureStabilizer } from '../src/gestures/GestureStabilizer.js';

const frame = (gesture, timestamp, pinchDistance = 1) => ({
  gesture,
  timestamp,
  pinchDistance,
});

test('confirms POINT only after the configured number of frames', () => {
  const stabilizer = new GestureStabilizer();
  assert.equal(stabilizer.update(frame(GESTURES.POINT, 10)).stableGesture, GESTURES.NONE);
  assert.equal(stabilizer.update(frame(GESTURES.POINT, 20)).stableGesture, GESTURES.NONE);
  const confirmed = stabilizer.update(frame(GESTURES.POINT, 30));
  assert.equal(confirmed.stableGesture, GESTURES.POINT);
  assert.equal(confirmed.changed, true);
  assert.equal(confirmed.activated, true);
});

test('ignores an isolated noisy gesture frame', () => {
  const stabilizer = new GestureStabilizer();
  stabilizer.update(frame(GESTURES.POINT, 10));
  const result = stabilizer.update(frame(GESTURES.NONE, 20));
  assert.equal(result.stableGesture, GESTURES.NONE);
  assert.equal(result.candidateFrames, 0);
});

test('keeps PINCH stable until the wider release threshold is crossed', () => {
  const stabilizer = new GestureStabilizer();
  stabilizer.update(frame(GESTURES.PINCH, 10, 0.2));
  stabilizer.update(frame(GESTURES.PINCH, 20, 0.2));
  stabilizer.update(frame(GESTURES.PINCH, 30, 0.2));

  const nearBoundary = stabilizer.update(frame(GESTURES.NONE, 40, 0.45));
  assert.equal(nearBoundary.stableGesture, GESTURES.PINCH);
  assert.equal(nearBoundary.candidateFrames, 0);

  stabilizer.update(frame(GESTURES.NONE, 50, 0.6));
  stabilizer.update(frame(GESTURES.NONE, 60, 0.6));
  const released = stabilizer.update(frame(GESTURES.NONE, 70, 0.6));
  assert.equal(released.stableGesture, GESTURES.NONE);
});

test('applies cooldown when PINCH is activated repeatedly', () => {
  const stabilizer = new GestureStabilizer();
  let result;
  [10, 20, 30].forEach((time) => {
    result = stabilizer.update(frame(GESTURES.PINCH, time, 0.2));
  });
  assert.equal(result.activated, true);

  [40, 50, 60].forEach((time) => stabilizer.update(frame(GESTURES.NONE, time, 0.8)));
  [100, 110, 120].forEach((time) => {
    result = stabilizer.update(frame(GESTURES.PINCH, time, 0.2));
  });
  assert.equal(result.stableGesture, GESTURES.PINCH);
  assert.equal(result.activated, false);

  [800, 810, 820].forEach((time) => stabilizer.update(frame(GESTURES.NONE, time, 0.8)));
  [900, 910, 920].forEach((time) => {
    result = stabilizer.update(frame(GESTURES.PINCH, time, 0.2));
  });
  assert.equal(result.activated, true);
});

