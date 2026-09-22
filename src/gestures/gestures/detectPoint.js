import { isFingerExtended } from '../GestureUtils.js';

export const detectPoint = (landmarks) =>
  isFingerExtended(landmarks, 'INDEX') &&
  !isFingerExtended(landmarks, 'MIDDLE') &&
  !isFingerExtended(landmarks, 'RING') &&
  !isFingerExtended(landmarks, 'PINKY');

