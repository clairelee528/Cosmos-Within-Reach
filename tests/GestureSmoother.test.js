import test from 'node:test';
import assert from 'node:assert/strict';
import { GestureSmoother } from '../src/gestures/GestureSmoother.js';

const frame = (x, y, pinchDistance = 1) => ({
  cursor: { x, y },
  pinchDistance,
  rawGesture: 'POINT',
  stableGesture: 'POINT',
});

test('smooths a sudden cursor position change', () => {
  const smoother = new GestureSmoother();
  smoother.update(frame(0.2, 0.3));
  const result = smoother.update(frame(0.8, 0.9));
  assert.ok(result.cursor.x > 0.2 && result.cursor.x < 0.4);
  assert.ok(result.cursor.y > 0.3 && result.cursor.y < 0.5);
  assert.deepEqual(result.rawCursor, { x: 0.8, y: 0.9 });
});

test('treats tiny camera jitter as still', () => {
  const smoother = new GestureSmoother();
  smoother.update(frame(0.5, 0.5));
  const result = smoother.update(frame(0.502, 0.499));
  assert.equal(result.movement.moving, false);
  assert.equal(result.movement.magnitude, 0);
});

test('reports sustained intentional movement', () => {
  const smoother = new GestureSmoother();
  smoother.update(frame(0.2, 0.5));
  let result;
  [0.35, 0.5, 0.65, 0.8].forEach((x) => {
    result = smoother.update(frame(x, 0.5));
  });
  assert.equal(result.movement.moving, true);
  assert.ok(result.movement.dx > 0);
});

test('smooths pinch distance and resets when the hand disappears', () => {
  const smoother = new GestureSmoother();
  smoother.update(frame(0.5, 0.5, 1));
  const pinching = smoother.update(frame(0.5, 0.5, 0.2));
  assert.ok(pinching.pinchDistance > 0.2 && pinching.pinchDistance < 1);

  const lost = smoother.update({ cursor: null, pinchDistance: null });
  assert.equal(lost.cursor, null);
  assert.equal(lost.movement.moving, false);

  const reacquired = smoother.update(frame(0.9, 0.1, 0.2));
  assert.deepEqual(reacquired.cursor, { x: 0.9, y: 0.1 });
  assert.equal(reacquired.movement.moving, false);
});

