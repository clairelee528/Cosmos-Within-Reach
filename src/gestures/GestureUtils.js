import {
  FINGER_LANDMARKS,
  HAND_LANDMARKS,
} from '../vision/handLandmarks.js';
import { gestureConfig } from '../config/gestureConfig.js';

const requirePoint = (point, name) => {
  if (!point || !Number.isFinite(point.x) || !Number.isFinite(point.y)) {
    throw new TypeError(`${name} must contain finite x and y coordinates.`);
  }
};

export const distance2D = (a, b) => {
  requirePoint(a, 'First landmark');
  requirePoint(b, 'Second landmark');
  return Math.hypot(b.x - a.x, b.y - a.y);
};

export const distance3D = (a, b) => {
  requirePoint(a, 'First landmark');
  requirePoint(b, 'Second landmark');
  const az = Number.isFinite(a.z) ? a.z : 0;
  const bz = Number.isFinite(b.z) ? b.z : 0;
  return Math.hypot(b.x - a.x, b.y - a.y, bz - az);
};

export const getPalmScale = (landmarks) => {
  const wristToMiddle = distance2D(
    landmarks[HAND_LANDMARKS.WRIST],
    landmarks[HAND_LANDMARKS.MIDDLE_MCP],
  );
  const palmWidth = distance2D(
    landmarks[HAND_LANDMARKS.INDEX_MCP],
    landmarks[HAND_LANDMARKS.PINKY_MCP],
  );
  return Math.max(
    (wristToMiddle + palmWidth) / 2,
    gestureConfig.minimumPalmScale,
  );
};

export const normalizedDistance = (a, b, landmarks) =>
  distance2D(a, b) / getPalmScale(landmarks);

export const getFingerExtensionRatio = (
  landmarks,
  finger,
) => {
  const joints = typeof finger === 'string' ? FINGER_LANDMARKS[finger] : finger;

  if (!joints) {
    throw new RangeError(`Unknown finger: ${finger}`);
  }

  const mcp = landmarks[joints.mcp];
  const pip = landmarks[joints.pip];
  const dip = landmarks[joints.dip];
  const tip = landmarks[joints.tip];
  const directLength = distance2D(mcp, tip);
  const articulatedLength =
    distance2D(mcp, pip) + distance2D(pip, dip) + distance2D(dip, tip);

  return articulatedLength > 0 ? directLength / articulatedLength : 0;
};

export const isFingerExtended = (
  landmarks,
  finger,
  minimumRatio = gestureConfig.fingerExtensionRatio,
) => {
  const joints = typeof finger === 'string' ? FINGER_LANDMARKS[finger] : finger;

  if (!joints) {
    throw new RangeError(`Unknown finger: ${finger}`);
  }

  const wrist = landmarks[HAND_LANDMARKS.WRIST];
  const pip = landmarks[joints.pip];
  const tip = landmarks[joints.tip];
  const pointsAwayFromPalm = distance2D(wrist, tip) > distance2D(wrist, pip);

  return (
    pointsAwayFromPalm &&
    getFingerExtensionRatio(landmarks, joints) >= minimumRatio
  );
};

export const calculateMotion = (previous, current, palmScale = 1) => {
  requirePoint(previous, 'Previous point');
  requirePoint(current, 'Current point');
  const safeScale = Math.max(palmScale, gestureConfig.minimumPalmScale);
  const dx = current.x - previous.x;
  const dy = current.y - previous.y;
  const distance = Math.hypot(dx, dy);
  const normalized = distance / safeScale;

  return {
    dx,
    dy,
    distance,
    normalized,
    moving: distance >= gestureConfig.motionDeadZone,
  };
};
