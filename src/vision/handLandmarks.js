export const HAND_LANDMARKS = Object.freeze({
  WRIST: 0,
  THUMB_CMC: 1,
  THUMB_MCP: 2,
  THUMB_IP: 3,
  THUMB_TIP: 4,
  INDEX_MCP: 5,
  INDEX_PIP: 6,
  INDEX_DIP: 7,
  INDEX_TIP: 8,
  MIDDLE_MCP: 9,
  MIDDLE_PIP: 10,
  MIDDLE_DIP: 11,
  MIDDLE_TIP: 12,
  RING_MCP: 13,
  RING_PIP: 14,
  RING_DIP: 15,
  RING_TIP: 16,
  PINKY_MCP: 17,
  PINKY_PIP: 18,
  PINKY_DIP: 19,
  PINKY_TIP: 20,
});

export const FINGER_LANDMARKS = Object.freeze({
  INDEX: Object.freeze({
    mcp: HAND_LANDMARKS.INDEX_MCP,
    pip: HAND_LANDMARKS.INDEX_PIP,
    dip: HAND_LANDMARKS.INDEX_DIP,
    tip: HAND_LANDMARKS.INDEX_TIP,
  }),
  MIDDLE: Object.freeze({
    mcp: HAND_LANDMARKS.MIDDLE_MCP,
    pip: HAND_LANDMARKS.MIDDLE_PIP,
    dip: HAND_LANDMARKS.MIDDLE_DIP,
    tip: HAND_LANDMARKS.MIDDLE_TIP,
  }),
  RING: Object.freeze({
    mcp: HAND_LANDMARKS.RING_MCP,
    pip: HAND_LANDMARKS.RING_PIP,
    dip: HAND_LANDMARKS.RING_DIP,
    tip: HAND_LANDMARKS.RING_TIP,
  }),
  PINKY: Object.freeze({
    mcp: HAND_LANDMARKS.PINKY_MCP,
    pip: HAND_LANDMARKS.PINKY_PIP,
    dip: HAND_LANDMARKS.PINKY_DIP,
    tip: HAND_LANDMARKS.PINKY_TIP,
  }),
});

export const HAND_CONNECTIONS = Object.freeze([
  [0, 1], [1, 2], [2, 3], [3, 4],
  [0, 5], [5, 6], [6, 7], [7, 8],
  [5, 9], [9, 10], [10, 11], [11, 12],
  [9, 13], [13, 14], [14, 15], [15, 16],
  [13, 17], [17, 18], [18, 19], [19, 20],
  [0, 17],
]);

export const FINGERTIP_INDICES = Object.freeze([
  HAND_LANDMARKS.THUMB_TIP,
  HAND_LANDMARKS.INDEX_TIP,
  HAND_LANDMARKS.MIDDLE_TIP,
  HAND_LANDMARKS.RING_TIP,
  HAND_LANDMARKS.PINKY_TIP,
]);
