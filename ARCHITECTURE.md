# Interactive Cosmic Projector — ARCHITECTURE.md

> Version: 1.0  
> Project type: Interactive spatial projection / gesture-controlled astronomy learning prototype  
> Primary goal: Build a functional MVP within one month that supports hand tracking, planet selection, zoom, rotation, knowledge display, projection, and basic camera-to-projection calibration.

---

## 1. Architecture Goals

This document defines the technical architecture for the MVP of **Interactive Cosmic Projector**.

The MVP must allow a user to:

1. Open the application in a browser.
2. Allow webcam access.
3. Detect one hand in real time.
4. Track hand position using MediaPipe.
5. Recognize a small set of gestures.
6. Convert gestures into normalized interaction events.
7. Control a Three.js solar-system scene.
8. Select a planet.
9. Zoom and rotate the selected planet.
10. Display astronomy information.
11. Return to the solar-system overview.
12. Project the browser window to a ceiling or wall.
13. Optionally calibrate hand/camera coordinates to projection coordinates.

The system must be modular so that:
- MediaPipe can be replaced later.
- Gesture rules can be tuned independently.
- The 3D scene does not depend directly on raw MediaPipe data.
- Mouse controls can be used as a fallback during development.
- Projection calibration can be added after the core interaction works.

---

## 2. Recommended Technology Stack

### Frontend
- HTML5
- CSS3
- JavaScript
- Vite

### 3D Rendering
- Three.js

### Hand Tracking / Computer Vision
- MediaPipe Tasks Vision
- Hand Landmarker

### Gesture Recognition
Use a custom rule-based gesture engine built on top of MediaPipe hand landmarks.

Do not train a custom ML model in MVP.

### State Management
Use lightweight JavaScript modules.

Do not add React, Redux, Vue, Zustand, or another framework unless the existing codebase already uses one.

### Data
Static local JavaScript / JSON data for planets.

### Development Environment
- Node.js 20+
- npm
- VS Code
- Chrome or Edge

---

## 3. High-Level System Architecture

```text
Webcam
  ↓
MediaPipe Hand Landmarker
  ↓
Raw Hand Landmarks
  ↓
Hand Tracking Adapter
  ↓
Gesture Engine
  ↓
Interaction Event Bus
  ↓
Interaction Controller
  ↓
Three.js Scene / UI / Planet Controller
  ↓
Projector / Browser Display
```

The architecture must separate perception from interaction.

### Layer 1 — Perception
Responsibilities:
- Access webcam
- Run MediaPipe
- Return hand landmarks
- Normalize coordinates

### Layer 2 — Interpretation
Responsibilities:
- Detect POINT
- Detect PINCH
- Detect OPEN_PALM
- Calculate hand movement
- Calculate pinch distance
- Stabilize gestures across frames

### Layer 3 — Interaction
Responsibilities:
- Map gestures to semantic commands
- Determine current application state
- Prevent invalid interactions
- Convert hand movement into rotation / zoom input

### Layer 4 — Presentation
Responsibilities:
- Render solar system
- Animate planets
- Render hover state
- Render selected state
- Render knowledge panel
- Render gesture cursor
- Render calibration UI

---

## 4. MVP Interaction States

Use an explicit finite state machine.

```text
BOOT
  ↓
CALIBRATION (optional / skippable in development)
  ↓
OVERVIEW
  ↓
HOVER
  ↓
SELECTED
  ↓
EXPLORE
  ↓
OVERVIEW
```

Recommended application states:

```js
export const APP_STATES = {
  BOOT: 'BOOT',
  CALIBRATION: 'CALIBRATION',
  OVERVIEW: 'OVERVIEW',
  HOVER: 'HOVER',
  SELECTED: 'SELECTED',
  EXPLORE: 'EXPLORE',
};
```

### State behavior

#### BOOT
- Initialize renderer
- Initialize camera
- Initialize MediaPipe
- Load planet textures
- Show loading UI

#### CALIBRATION
- Optional for MVP development
- Ask user to point to four target positions
- Build mapping from camera coordinates to projection coordinates

#### OVERVIEW
- Show all planets
- Cursor active
- Planet hover enabled
- Pinch can select hovered planet

#### HOVER
- Highlight one candidate planet
- Show lightweight planet label
- Pinch confirms selection

#### SELECTED
- Lock selected planet
- Disable selecting other planets
- Begin transition animation into explore view

#### EXPLORE
- Show large planet
- Enable zoom
- Enable rotation
- Show knowledge information
- Open palm returns to overview

---

## 5. Project Directory Structure

Use the following structure.

```text
interactive-cosmic-projector/
│
├── public/
│   ├── textures/
│   │   ├── earth.jpg
│   │   ├── mars.jpg
│   │   ├── jupiter.jpg
│   │   ├── saturn.jpg
│   │   ├── neptune.jpg
│   │   └── stars.jpg
│   │
│   └── icons/
│
├── src/
│   ├── main.js
│   ├── style.css
│   │
│   ├── app/
│   │   ├── App.js
│   │   ├── AppState.js
│   │   └── EventBus.js
│   │
│   ├── config/
│   │   ├── constants.js
│   │   ├── gestureConfig.js
│   │   ├── sceneConfig.js
│   │   └── calibrationConfig.js
│   │
│   ├── vision/
│   │   ├── CameraManager.js
│   │   ├── HandTracker.js
│   │   ├── HandNormalizer.js
│   │   └── VisionDebugOverlay.js
│   │
│   ├── gestures/
│   │   ├── GestureEngine.js
│   │   ├── GestureStabilizer.js
│   │   ├── GestureUtils.js
│   │   └── gestures/
│   │       ├── detectPoint.js
│   │       ├── detectPinch.js
│   │       └── detectOpenPalm.js
│   │
│   ├── interaction/
│   │   ├── InteractionController.js
│   │   ├── CursorController.js
│   │   ├── PlanetHitTester.js
│   │   ├── ZoomController.js
│   │   └── RotationController.js
│   │
│   ├── scene/
│   │   ├── SceneManager.js
│   │   ├── CameraController.js
│   │   ├── LightingManager.js
│   │   ├── Starfield.js
│   │   ├── SolarSystem.js
│   │   ├── Planet.js
│   │   ├── PlanetManager.js
│   │   └── SceneAnimator.js
│   │
│   ├── calibration/
│   │   ├── CalibrationManager.js
│   │   ├── CoordinateMapper.js
│   │   └── CalibrationOverlay.js
│   │
│   ├── ui/
│   │   ├── UIManager.js
│   │   ├── PlanetInfoPanel.js
│   │   ├── GestureCursor.js
│   │   ├── GestureStatus.js
│   │   └── LoadingScreen.js
│   │
│   ├── data/
│   │   └── planets.js
│   │
│   └── utils/
│       ├── math.js
│       ├── smoothing.js
│       └── timing.js
│
├── index.html
├── package.json
├── vite.config.js
├── README.md
└── ARCHITECTURE.md
```

---

## 6. Core Data Model

Planet data must be separated from Three.js rendering code.

Create:

```text
src/data/planets.js
```

Recommended structure:

```js
export const planets = [
  {
    id: 'earth',
    name: 'Earth',
    type: 'Terrestrial Planet',
    texture: '/textures/earth.jpg',

    scene: {
      radius: 1.0,
      orbitRadius: 4.0,
      orbitSpeed: 0.08,
      rotationSpeed: 0.004,
      initialAngle: 0,
    },

    facts: {
      diameterKm: 12742,
      distanceFromSunMillionKm: 149.6,
      orbitalPeriodDays: 365.25,
      temperatureC: 15,
    },

    description:
      'Earth is the third planet from the Sun and the only known world to support life.',

    highlights: [
      '71% of the surface is covered by water.',
      'Earth has one natural satellite: the Moon.',
      'Its atmosphere is primarily nitrogen and oxygen.',
    ],
  },

  {
    id: 'mars',
    name: 'Mars',
    type: 'Terrestrial Planet',
    texture: '/textures/mars.jpg',

    scene: {
      radius: 0.75,
      orbitRadius: 6.0,
      orbitSpeed: 0.065,
      rotationSpeed: 0.003,
      initialAngle: 1.2,
    },

    facts: {
      diameterKm: 6779,
      distanceFromSunMillionKm: 227.9,
      orbitalPeriodDays: 687,
      temperatureC: -63,
    },

    description:
      'Mars is a cold desert world known for its reddish surface and evidence of ancient water.',

    highlights: [
      'Mars has two small moons: Phobos and Deimos.',
      'Olympus Mons is the largest known volcano in the Solar System.',
      'Its red color comes mainly from iron oxide.',
    ],
  },
];
```

Add Jupiter, Saturn, and Neptune using the same schema.

Do not hardcode planet knowledge inside UI components.

---

## 7. Planet Runtime Object

The static planet data should be converted into runtime Three.js Planet instances.

Recommended class:

```js
class Planet {
  constructor(data) {
    this.data = data;
    this.id = data.id;

    this.mesh = null;
    this.group = null;

    this.isHovered = false;
    this.isSelected = false;

    this.defaultScale = 1;
    this.currentScale = 1;
  }

  create() {}
  update(deltaTime) {}
  setHovered(value) {}
  setSelected(value) {}
  setScale(value) {}
  rotate(deltaX, deltaY) {}
  dispose() {}
}
```

The `Planet` class should own visual behavior only.

It should not:
- Access MediaPipe
- Detect gestures
- Directly read webcam input

---

## 8. MediaPipe Hand Tracking Module

Create:

```text
src/vision/HandTracker.js
```

Responsibilities:
- Initialize MediaPipe Hand Landmarker
- Load the hand landmark model
- Accept video frames
- Return normalized landmark data
- Track one hand only for MVP

Recommended output:

```js
{
  detected: true,

  handedness: 'Right',

  landmarks: [
    { x: 0.42, y: 0.63, z: -0.03 },
    ...
  ],

  timestamp: 123456789
}
```

Use normalized coordinates from 0 to 1.

Important:
MediaPipe camera coordinates may need horizontal mirroring if the webcam preview is mirrored.

Handle this in one place only.

Recommended helper:

```js
function mirrorX(x) {
  return 1 - x;
}
```

Do not mirror coordinates independently in multiple modules.

---

## 9. Hand Landmark Constants

Define named indexes.

```js
export const HAND_LANDMARKS = {
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
};
```

All gesture detectors should use these constants.

---

## 10. Gesture Engine

Create:

```text
src/gestures/GestureEngine.js
```

Input:

```js
handFrame
```

Output:

```js
{
  gesture: 'POINT',
  confidence: 0.9,

  cursor: {
    x: 0.52,
    y: 0.38,
  },

  pinchDistance: 0.08,

  movement: {
    dx: 0.01,
    dy: -0.02,
  },
}
```

Supported gestures for MVP:

```js
export const GESTURES = {
  NONE: 'NONE',
  POINT: 'POINT',
  PINCH: 'PINCH',
  OPEN_PALM: 'OPEN_PALM',
};
```

Do not add more gestures until the MVP works.

---

## 11. Gesture Detection Rules

### 11.1 POINT

Initial heuristic:

- Index finger extended
- Middle finger folded
- Ring finger folded
- Pinky folded

A simple 2D heuristic is acceptable for MVP.

Pseudo-code:

```js
const indexExtended =
  indexTip.y < indexPip.y;

const middleFolded =
  middleTip.y > middlePip.y;

const ringFolded =
  ringTip.y > ringPip.y;

const pinkyFolded =
  pinkyTip.y > pinkyPip.y;

return (
  indexExtended &&
  middleFolded &&
  ringFolded &&
  pinkyFolded
);
```

This heuristic will not work for every camera angle.

Keep it configurable.

---

### 11.2 PINCH

Measure Euclidean distance between:
- THUMB_TIP
- INDEX_TIP

```js
const pinchDistance = distance2D(
  landmarks[4],
  landmarks[8]
);
```

Initial threshold:

```js
PINCH_THRESHOLD = 0.055
```

The threshold must be stored in:

```text
src/config/gestureConfig.js
```

Do not hardcode it inside the detector.

---

### 11.3 OPEN_PALM

Initial heuristic:
- Index extended
- Middle extended
- Ring extended
- Pinky extended

Optional:
- Thumb must also be away from palm

Use a relaxed detection rule for MVP.

---

## 12. Gesture Stabilization

Raw gestures will flicker.

Create:

```text
src/gestures/GestureStabilizer.js
```

Use temporal confirmation.

Example configuration:

```js
export const GESTURE_CONFIG = {
  pinchThreshold: 0.055,

  confirmFrames: {
    POINT: 3,
    PINCH: 3,
    OPEN_PALM: 5,
  },

  cooldownMs: {
    SELECT: 700,
    BACK: 1000,
  },
};
```

Example:

```text
Frame 1: PINCH
Frame 2: PINCH
Frame 3: PINCH

→ confirmed PINCH
```

Do not trigger SELECT on a single frame.

---

## 13. Semantic Interaction Events

The Three.js scene must never consume raw MediaPipe gesture names directly.

Convert gestures into semantic events.

Create:

```text
src/app/EventBus.js
```

Supported events:

```js
export const EVENTS = {
  HAND_FOUND: 'HAND_FOUND',
  HAND_LOST: 'HAND_LOST',

  CURSOR_MOVE: 'CURSOR_MOVE',

  PLANET_HOVER_START: 'PLANET_HOVER_START',
  PLANET_HOVER_END: 'PLANET_HOVER_END',

  SELECT: 'SELECT',
  BACK: 'BACK',

  ZOOM: 'ZOOM',
  ROTATE: 'ROTATE',

  STATE_CHANGE: 'STATE_CHANGE',
};
```

Examples:

```js
eventBus.emit(EVENTS.CURSOR_MOVE, {
  x: 0.52,
  y: 0.41,
});
```

```js
eventBus.emit(EVENTS.SELECT, {
  planetId: 'saturn',
});
```

```js
eventBus.emit(EVENTS.ROTATE, {
  dx: 0.03,
  dy: -0.01,
});
```

---

## 14. Gesture-to-Interaction Mapping

Recommended MVP mapping:

| Gesture / Input | State | Result |
|---|---|---|
| Index position | OVERVIEW | Move cursor |
| Point at planet | OVERVIEW | Hover planet |
| Pinch | HOVER | Select planet |
| Horizontal hand movement | EXPLORE | Rotate planet |
| Pinch distance change | EXPLORE | Zoom planet |
| Open palm | EXPLORE | Return to overview |

Important:
The meaning of `PINCH` changes by state.

In `HOVER`:
```text
PINCH → SELECT
```

In `EXPLORE`:
```text
pinch-distance delta → ZOOM
```

State handling belongs in `InteractionController.js`.

---

## 15. Interaction Controller

Create:

```text
src/interaction/InteractionController.js
```

Responsibilities:
- Own application interaction state
- Subscribe to gesture output
- Decide what a gesture means
- Prevent invalid commands
- Control state transitions

Pseudo-code:

```js
class InteractionController {
  constructor({
    appState,
    planetManager,
    cursorController,
  }) {}

  update(gestureFrame) {
    switch (this.appState.current) {
      case APP_STATES.OVERVIEW:
        this.handleOverview(gestureFrame);
        break;

      case APP_STATES.HOVER:
        this.handleHover(gestureFrame);
        break;

      case APP_STATES.EXPLORE:
        this.handleExplore(gestureFrame);
        break;
    }
  }
}
```

---

## 16. Gesture Cursor

Create:

```text
src/ui/GestureCursor.js
```

The cursor should:
- Follow normalized hand/index-tip coordinates
- Be visually subtle
- Change appearance when hovering
- Change appearance when pinch is detected
- Hide when no hand is detected

Suggested visual states:

```text
Default:
small white ring

Hover:
larger ring

Pinch:
filled point / pulse
```

The cursor is essential for MVP usability.

Do not remove it for visual purity until user testing proves it is unnecessary.

---

## 17. Cursor Coordinate Mapping

Raw input:

```text
camera coordinates
x: 0–1
y: 0–1
```

Output:

```text
screen coordinates
x: 0–window.innerWidth
y: 0–window.innerHeight
```

Initial MVP mapping:

```js
const screenX = normalizedX * window.innerWidth;
const screenY = normalizedY * window.innerHeight;
```

Later, calibration can replace this direct mapping.

---

## 18. Planet Hit Testing

Create:

```text
src/interaction/PlanetHitTester.js
```

Use Three.js `Raycaster`.

Pipeline:

```text
gesture cursor
↓
screen coordinates
↓
Normalized Device Coordinates
↓
THREE.Raycaster
↓
planet mesh intersection
```

Convert cursor position:

```js
const mouse = new THREE.Vector2(
  (screenX / width) * 2 - 1,
  -(screenY / height) * 2 + 1
);
```

Then:

```js
raycaster.setFromCamera(mouse, camera);

const intersections = raycaster.intersectObjects(
  planetMeshes,
  true
);
```

Return the closest interactive planet.

---

## 19. Hover Behavior

When a planet becomes hovered:

- Increase scale slightly
- Add glow / outline if possible
- Show planet name
- Store `hoveredPlanetId`

Suggested scale:

```text
1.00 → 1.10
```

Avoid dramatic scale changes during overview.

Hover transitions should be animated, not instantaneous.

---

## 20. Planet Selection

Selection sequence:

```text
Hover Saturn
↓
Confirmed pinch
↓
Lock Saturn
↓
App state → SELECTED
↓
Animate camera / planet
↓
App state → EXPLORE
```

During transition:
- Ignore additional select gestures
- Hide other planet labels
- Fade or dim background planets
- Move selected planet toward screen center

---

## 21. Explore Mode

In EXPLORE:

Required behavior:
- Selected planet is visually dominant
- User can rotate planet
- User can zoom within a limited range
- Knowledge panel appears
- Open-palm gesture exits

Recommended scale constraints:

```js
MIN_EXPLORE_SCALE = 1.0;
MAX_EXPLORE_SCALE = 2.5;
```

Clamp all zoom values.

---

## 22. Rotation Controller

Create:

```text
src/interaction/RotationController.js
```

Use hand movement delta.

Example:

```js
rotationX += movement.dy * ROTATION_SENSITIVITY;
rotationY += movement.dx * ROTATION_SENSITIVITY;
```

Initial recommendation:

```js
ROTATION_SENSITIVITY = 2.0;
```

Apply smoothing.

Do not directly map absolute hand position to planet rotation.

Use movement delta.

---

## 23. Zoom Controller

Create:

```text
src/interaction/ZoomController.js
```

Use change in pinch distance.

Example:

```js
delta =
  currentPinchDistance -
  previousPinchDistance;
```

Then:

```js
zoom += delta * ZOOM_SENSITIVITY;
```

Clamp:

```js
zoom = clamp(
  zoom,
  MIN_ZOOM,
  MAX_ZOOM
);
```

Important:
Zoom should only activate in EXPLORE mode.

---

## 24. Camera / Projection Calibration

Calibration is Phase 2 of the MVP.

Do not block early development on calibration.

Create:

```text
src/calibration/
```

Use four target points:

```text
TOP_LEFT
TOP_RIGHT
BOTTOM_RIGHT
BOTTOM_LEFT
```

Collect camera-space cursor positions:

```js
[
  { x: 0.12, y: 0.14 },
  { x: 0.86, y: 0.13 },
  { x: 0.84, y: 0.89 },
  { x: 0.15, y: 0.88 },
]
```

Map them to:

```js
[
  { x: 0, y: 0 },
  { x: 1, y: 0 },
  { x: 1, y: 1 },
  { x: 0, y: 1 },
]
```

### MVP calibration implementation

Start with bilinear / perspective-like mapping if practical.

If full homography is too expensive for the first prototype:
- Use min/max normalized bounding box mapping first.
- Implement true homography later.

API:

```js
class CoordinateMapper {
  setCalibrationPoints(cameraPoints, outputPoints) {}

  map(cameraX, cameraY) {
    return {
      x: mappedX,
      y: mappedY,
    };
  }
}
```

No other module should know how calibration is calculated.

---

## 25. Scene Manager

Create:

```text
src/scene/SceneManager.js
```

Responsibilities:
- Initialize WebGLRenderer
- Create Three.js Scene
- Create PerspectiveCamera
- Handle resize
- Own animation loop
- Call update functions

Recommended renderer config:

```js
const renderer = new THREE.WebGLRenderer({
  antialias: true,
});

renderer.setPixelRatio(
  Math.min(window.devicePixelRatio, 2)
);
```

Keep performance reasonable for laptop hardware.

---

## 26. Three.js Scene Structure

Recommended scene hierarchy:

```text
Scene
├── Starfield
├── AmbientLight
├── DirectionalLight
├── SolarSystemGroup
│   ├── EarthGroup
│   │   └── EarthMesh
│   ├── MarsGroup
│   │   └── MarsMesh
│   ├── JupiterGroup
│   │   └── JupiterMesh
│   ├── SaturnGroup
│   │   ├── SaturnMesh
│   │   └── RingMesh
│   └── NeptuneGroup
│       └── NeptuneMesh
└── optional effects
```

Do not implement physically accurate orbital mechanics in MVP.

Use visually understandable positions.

---

## 27. Starfield

Start with one of:
- procedural random points
- a textured background sphere
- Three.js Points

Prefer lightweight implementation.

The starfield should not consume significant GPU resources.

---

## 28. Lighting

MVP recommendation:
- AmbientLight
- DirectionalLight

Do not implement complex physically accurate sunlight until core interactions work.

Example:

```js
const ambient = new THREE.AmbientLight(
  0xffffff,
  0.35
);

const keyLight = new THREE.DirectionalLight(
  0xffffff,
  1.5
);
```

---

## 29. Knowledge UI

Create:

```text
src/ui/PlanetInfoPanel.js
```

Input:

```js
planetData
```

Display:
- Name
- Type
- Diameter
- Distance from Sun
- Orbital period
- Short description
- 2–3 highlights

Keep UI readable from projection distance.

Use large typography.

Avoid small body text.

---

## 30. Debug Mode

The project must include a developer debug mode.

Add:

```js
DEBUG = true
```

Debug overlay should optionally show:

```text
FPS
Hand detected
Current gesture
App state
Cursor X/Y
Pinch distance
Hovered planet
Selected planet
```

This will significantly reduce development time.

Do not render debug UI in final portfolio demo.

---

## 31. Mouse Fallback

Before MediaPipe integration, all interaction must be testable with mouse input.

Mouse mapping:

```text
Mouse move → cursor
Mouse click → select
Mouse drag → rotate
Mouse wheel → zoom
Escape → back
```

This is mandatory.

Reason:
Three.js scene development and gesture debugging must remain independent.

---

## 32. App Initialization Order

Recommended boot sequence:

```text
1. Load configuration
2. Initialize Three.js scene
3. Load planet data
4. Create planets
5. Start render loop
6. Initialize UI
7. Initialize mouse fallback
8. Request webcam access
9. Initialize MediaPipe
10. Start hand tracking
11. Start gesture engine
12. Connect interaction controller
```

If webcam permission fails:
- Keep application running
- Show a warning
- Allow mouse fallback

---

## 33. Main Update Loop

Conceptual loop:

```js
function animate(time) {
  requestAnimationFrame(animate);

  const deltaTime = clock.getDelta();

  handTracker.update(videoFrame);

  const handFrame =
    handTracker.getLatestFrame();

  const gestureFrame =
    gestureEngine.update(handFrame);

  interactionController.update(
    gestureFrame,
    deltaTime
  );

  sceneManager.update(deltaTime);

  renderer.render(scene, camera);
}
```

MediaPipe may use an async inference cycle.

Do not run duplicate inference while the previous inference call is still active.

---

## 34. Performance Rules

For MVP:
- Track one hand only
- Use low-to-medium webcam resolution
- Avoid excessive post-processing
- Limit pixel ratio to 2
- Use compressed / moderate-size textures
- Avoid loading 8K planet textures

Recommended webcam starting resolution:

```text
640 × 480
```

Recommended planet texture resolution:

```text
1024–2048 px
```

---

## 35. Configuration Files

### gestureConfig.js

```js
export const gestureConfig = {
  pinchThreshold: 0.055,

  pointConfirmFrames: 3,
  pinchConfirmFrames: 3,
  openPalmConfirmFrames: 5,

  cursorSmoothing: 0.18,
  motionSmoothing: 0.2,

  selectCooldownMs: 700,
  backCooldownMs: 1000,
};
```

### sceneConfig.js

```js
export const sceneConfig = {
  cameraFov: 55,
  cameraNear: 0.1,
  cameraFar: 1000,

  hoverScale: 1.1,

  explore: {
    minScale: 1,
    maxScale: 2.5,
    rotationSensitivity: 2,
    zoomSensitivity: 8,
  },
};
```

All tuning values must be stored in config files where possible.

---

## 36. Error Handling

The application must handle:

### Webcam denied
Show:
```text
Camera access unavailable.
Mouse controls are still available.
```

### MediaPipe load failure
- Do not crash
- Fall back to mouse input

### Texture load failure
- Use fallback material

### Hand lost
- Hide cursor
- Stop rotation / zoom updates
- Remain in current app state

Do not automatically exit a selected planet just because the hand disappears briefly.

---

## 37. Development Order

Codex should implement the project in the following order.

### Phase 1 — Project Scaffold

Goal:
Get a working Vite + Three.js project.

Tasks:
- Create Vite project
- Install Three.js
- Create directory structure
- Add base CSS
- Create SceneManager
- Render test sphere
- Add resize handling

Acceptance:
A sphere renders in browser with no console errors.

---

### Phase 2 — Solar System

Goal:
Create the visual universe before hand tracking.

Tasks:
- Create planet data model
- Create Planet class
- Create PlanetManager
- Create 5 planets
- Add textures
- Add starfield
- Add lighting
- Add basic animation

Acceptance:
Five planets render and rotate correctly.

---

### Phase 3 — Mouse Interaction

Goal:
Complete the entire product interaction using mouse before gestures.

Tasks:
- Add cursor
- Add raycasting
- Add hover
- Add click selection
- Add selected planet transition
- Add mouse drag rotation
- Add wheel zoom
- Add Escape to return
- Add knowledge panel

Acceptance:
The entire flow works with mouse:

```text
Overview
→ Hover
→ Select
→ Explore
→ Rotate
→ Zoom
→ Back
```

---

### Phase 4 — Camera + MediaPipe

Goal:
Detect one hand.

Tasks:
- Add camera manager
- Request webcam permission
- Initialize MediaPipe
- Display optional webcam debug view
- Output 21 landmarks
- Track one hand
- Display landmark debug overlay

Acceptance:
Hand landmarks update smoothly in real time.

---

### Phase 5 — Gesture Engine

Goal:
Convert landmarks into stable gesture states.

Tasks:
- Detect POINT
- Detect PINCH
- Detect OPEN_PALM
- Add gesture stabilization
- Add pinch distance
- Add hand movement delta
- Add debug labels

Acceptance:
Debug panel reliably displays gesture state.

---

### Phase 6 — Gesture Cursor

Goal:
Replace mouse cursor with hand cursor.

Tasks:
- Map index fingertip to normalized cursor
- Add smoothing
- Connect to Raycaster
- Detect hover via hand cursor

Acceptance:
User can point at planets and trigger hover.

---

### Phase 7 — Gesture Selection

Goal:
Select planet with pinch.

Tasks:
- Use confirmed PINCH event
- Require hovered planet
- Add cooldown
- Enter selected / explore mode

Acceptance:
User can select a planet without mouse.

---

### Phase 8 — Gesture Explore Controls

Goal:
Control selected planet.

Tasks:
- Use hand movement for rotation
- Use pinch-distance changes for zoom
- Use open palm for return

Acceptance:
Full interaction works without mouse.

---

### Phase 9 — Calibration

Goal:
Improve projector-space accuracy.

Tasks:
- Create calibration overlay
- Implement 4-point capture
- Implement CoordinateMapper
- Use calibrated cursor mapping

Acceptance:
Hand cursor corresponds reasonably to projected positions.

---

### Phase 10 — Polish

Goal:
Portfolio-ready demo.

Tasks:
- Improve animations
- Improve typography
- Improve information panel
- Add subtle visual feedback
- Hide debug UI
- Improve loading screen
- Tune gesture thresholds
- Test on projector

Acceptance:
A user can complete the core task without developer intervention.

---

## 38. MVP Acceptance Criteria

The MVP is complete when all of the following are true:

- Application runs locally using `npm run dev`.
- Application can build using `npm run build`.
- Five planets are available.
- User can hover a planet.
- User can select a planet.
- Selected planet enters Explore Mode.
- User can zoom the planet.
- User can rotate the planet.
- Planet knowledge is displayed.
- User can return to Overview.
- Webcam hand tracking works.
- Gesture cursor works.
- Pinch selection works.
- Open-palm return works.
- Mouse fallback works.
- No critical console errors occur.
- The app can be displayed fullscreen through a projector.

---

## 39. Non-Goals for MVP

Do not implement the following before the acceptance criteria above are complete:

- Voice control
- Speech recognition
- ChatGPT / LLM integration
- AI astronomy assistant
- User accounts
- Cloud database
- Learning history
- Multi-user interaction
- Mobile app
- Raspberry Pi deployment
- Depth camera
- Real-time astronomical ephemeris
- Accurate solar-system orbital simulation
- Multiplayer
- AR / VR
- Physics engine
- Custom gesture model training
- Complex shader effects
- WebXR

These belong to future iterations.

---

## 40. Coding Conventions

Use ES modules.

Prefer:
```js
import ...
export ...
```

Use:
- PascalCase for classes
- camelCase for functions and variables
- UPPER_SNAKE_CASE for constants only when appropriate

Examples:

```js
class GestureEngine {}

function calculatePinchDistance() {}

const MAX_ZOOM = 2.5;
```

Avoid large files.

Recommended maximum:
~250 lines per module when practical.

Functions should have one clear responsibility.

Do not mix:
- MediaPipe code
- Three.js rendering
- gesture logic
- UI logic

inside the same module.

---

## 41. Documentation Requirements

Every major class should contain a short top-level comment describing:
- Responsibility
- Inputs
- Outputs

Complex math should be commented.

Do not comment obvious code.

Update this architecture document if:
- folder structure changes substantially
- event contracts change
- state machine changes
- gesture meanings change

---

## 42. Suggested First Codex Prompt

Use the following prompt to start implementation:

```text
Read README.md, PRD.md and ARCHITECTURE.md before writing code.

We are building the MVP of Interactive Cosmic Projector.

Follow ARCHITECTURE.md strictly.

Start with Phase 1 only.

Tasks:
1. Create a Vite vanilla JavaScript project.
2. Install Three.js.
3. Create the directory structure described in ARCHITECTURE.md.
4. Implement SceneManager.js.
5. Create a PerspectiveCamera, WebGLRenderer, Scene, AmbientLight and DirectionalLight.
6. Render one test sphere in the center of the screen.
7. Add responsive resize handling.
8. Add a basic dark fullscreen layout.
9. Do not implement MediaPipe yet.
10. Do not implement gesture recognition yet.

After implementation:
- explain which files were created
- explain how to run the project
- verify npm run build succeeds
- report any deviations from ARCHITECTURE.md
```

After Phase 1 is verified, proceed to Phase 2.

Do not ask Codex to implement the entire project in one prompt.

---

## 43. Recommended Codex Workflow

For every phase:

```text
Read current code
↓
Read ARCHITECTURE.md
↓
Implement one phase
↓
Run application/build
↓
Fix errors
↓
Summarize changes
↓
Commit
↓
Proceed to next phase
```

Recommended Git commits:

```text
chore: initialize project scaffold

feat: add threejs scene manager

feat: add solar system planets

feat: add mouse interaction

feat: add mediapipe hand tracking

feat: add gesture recognition engine

feat: add gesture cursor

feat: add gesture planet selection

feat: add gesture explore controls

feat: add projection calibration

style: polish final prototype
```

---

## 44. Definition of Done

The project is considered technically successful when:

> A user can stand or sit in front of the camera, point toward a projected planet, select it with a pinch gesture, enlarge and rotate it using hand movement, read its information, and return to the solar-system overview using an open-palm gesture.

The technical architecture should support this interaction without coupling raw computer-vision code directly to the Three.js scene.

The central architectural principle is:

```text
PERCEIVE
    ↓
INTERPRET
    ↓
MAP TO INTENT
    ↓
RENDER FEEDBACK
```

Or:

```text
Camera
→ Hand Landmarks
→ Gesture
→ Interaction Event
→ Application State
→ Three.js
→ Projection
```

This separation is mandatory for the MVP.
