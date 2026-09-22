import { isFingerExtended } from '../GestureUtils.js';
import { gestureConfig } from '../../config/gestureConfig.js';

const PALM_FINGERS = Object.freeze(['INDEX', 'MIDDLE', 'RING', 'PINKY']);

export const detectOpenPalm = (landmarks) =>
  PALM_FINGERS.every((finger) =>
    isFingerExtended(
      landmarks,
      finger,
      gestureConfig.openPalmFingerExtensionRatio,
    ),
  );
