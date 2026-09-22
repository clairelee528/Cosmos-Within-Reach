import { HAND_LANDMARKS } from '../vision/handLandmarks.js';
import { detectOpenPalm } from './gestures/detectOpenPalm.js';
import { detectPinch, getPinchDistance } from './gestures/detectPinch.js';
import { detectPoint } from './gestures/detectPoint.js';

export const GESTURES = Object.freeze({
  NONE: 'NONE',
  POINT: 'POINT',
  PINCH: 'PINCH',
  OPEN_PALM: 'OPEN_PALM',
});

/** Converts one normalized MediaPipe hand frame into a raw gesture frame. */
export class GestureEngine {
  update(handFrame) {
    if (!handFrame?.detected || handFrame.landmarks?.length !== 21) {
      return this.emptyFrame(handFrame?.timestamp);
    }

    const { landmarks } = handFrame;
    const pinchDistance = getPinchDistance(landmarks);
    let gesture = GESTURES.NONE;

    // Pinch wins when gestures overlap, so a deliberate select stays observable.
    if (detectPinch(landmarks)) {
      gesture = GESTURES.PINCH;
    } else if (detectOpenPalm(landmarks)) {
      gesture = GESTURES.OPEN_PALM;
    } else if (detectPoint(landmarks)) {
      gesture = GESTURES.POINT;
    }

    const indexTip = landmarks[HAND_LANDMARKS.INDEX_TIP];

    return {
      gesture,
      handedness: handFrame.handedness,
      cursor: { x: indexTip.x, y: indexTip.y },
      pinchDistance,
      timestamp: handFrame.timestamp,
    };
  }

  emptyFrame(timestamp = performance.now()) {
    return {
      gesture: GESTURES.NONE,
      handedness: null,
      cursor: null,
      pinchDistance: null,
      timestamp,
    };
  }
}

