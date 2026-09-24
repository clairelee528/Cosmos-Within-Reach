import { isFingerExtended, normalizedDistance } from '../GestureUtils.js';
import { HAND_LANDMARKS } from '../../vision/handLandmarks.js';
import { gestureConfig } from '../../config/gestureConfig.js';

export const hasShakaPose = (landmarks) =>
  !isFingerExtended(landmarks, 'INDEX') &&
  !isFingerExtended(landmarks, 'MIDDLE') &&
  !isFingerExtended(landmarks, 'RING') &&
  isFingerExtended(landmarks, 'PINKY');

export const getShakaSpan = (landmarks) =>
  normalizedDistance(
    landmarks[HAND_LANDMARKS.THUMB_TIP],
    landmarks[HAND_LANDMARKS.PINKY_TIP],
    landmarks,
  );

export const detectShaka = (landmarks) =>
  hasShakaPose(landmarks) &&
  getShakaSpan(landmarks) >= gestureConfig.shakaActivationSpan;
