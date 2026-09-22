import { gestureConfig } from '../../config/gestureConfig.js';
import { HAND_LANDMARKS } from '../../vision/handLandmarks.js';
import { normalizedDistance } from '../GestureUtils.js';

export const getPinchDistance = (landmarks) =>
  normalizedDistance(
    landmarks[HAND_LANDMARKS.THUMB_TIP],
    landmarks[HAND_LANDMARKS.INDEX_TIP],
    landmarks,
  );

export const detectPinch = (
  landmarks,
  threshold = gestureConfig.pinchThreshold,
) => getPinchDistance(landmarks) <= threshold;

