# 咫尺星空 | Cosmos Within Reach
## Product Requirements Document — PRD V1.0

> Project type: Interactive spatial projection / gesture-controlled astronomy learning experience  
> Product name: 咫尺星空  
> English name: Cosmos Within Reach  
> Version: 1.0  
> MVP target: Complete a functional, portfolio-ready prototype within one month.

---

# 1. Product Overview

## 1.1 Product Positioning

**咫尺星空 | Cosmos Within Reach** is an immersive astronomy exploration experience that combines:

- Spatial projection
- Computer vision
- Natural hand gestures
- Interactive 3D content
- Astronomy knowledge

The system projects planets and cosmic scenes onto a ceiling or wall.

Instead of controlling the experience with a mouse, touch screen, or remote control, the user interacts directly through natural hand gestures.

The user can:

```text
Watch
↓
Point
↓
Select
↓
Explore
↓
Learn
```

The product transforms a traditional passive star projector into an interactive spatial learning environment.

Its core design idea is:

> Bring the distant universe within reach.

---

# 2. Product Vision

Traditional star projectors mainly provide ambient lighting and passive visual experiences.

Cosmos Within Reach aims to transform projected space into an interactive interface.

The ceiling is no longer only a display surface.

It becomes a:

**Spatial Interface**

Through natural hand gestures, the user can directly interact with projected celestial objects.

The experience should feel closer to:

```text
Exploring the universe
```

rather than:

```text
Watching an astronomy video
```

---

# 3. Product Goals

The first version is not intended to be a commercial hardware product.

The goal is to build a functional prototype that proves the feasibility of the interaction concept.

The MVP should validate the following assumptions:

1. A user can interact with projected content using natural hand gestures.
2. Gesture interaction can replace a mouse or remote control for basic spatial exploration.
3. Projection can support both immersive visual experience and knowledge learning.
4. Computer vision, gesture recognition, 3D graphics, and projection can work together as one system.
5. Users can complete a full exploration loop:

```text
Discover
→ Select
→ Explore
→ Learn
→ Return
```

---

# 4. Target Users

## 4.1 Primary Users

The primary target users are:

**Young users aged approximately 12–25 who are interested in astronomy, space, science, or immersive technology.**

Typical characteristics:

- Interested in planets, astronomy, or space exploration
- Comfortable with digital interfaces
- Familiar with gesture concepts such as pinch and zoom
- Interested in interactive and immersive learning experiences
- May find traditional text-heavy astronomy education less engaging
- Enjoy technology-driven experiences

---

# 5. Core Usage Scenario

The MVP focuses on one main scenario:

**Bedroom / nighttime / single-user exploration**

Example scenario:

```text
The user lies on a bed.

↓
The ceiling displays a solar-system scene.

↓
The user raises a hand.

↓
The system detects the hand.

↓
A gesture cursor appears.

↓
The user points toward Saturn.

↓
Saturn becomes highlighted.

↓
The user performs a pinch gesture.

↓
Saturn is selected.

↓
The planet moves toward the center and enlarges.

↓
The user moves their hand to rotate Saturn.

↓
Astronomy information appears.

↓
The user opens their palm.

↓
The system returns to the solar-system overview.
```

---

# 6. MVP Scope

The MVP must remain intentionally limited.

The goal is to demonstrate the complete interaction experience rather than simulate the entire universe.

## 6.1 Included in MVP

The first version should contain all eight major planets:

- Mercury
- Venus
- Earth
- Mars
- Jupiter
- Saturn
- Uranus
- Neptune

The core experience must support:

```text
Solar System Overview
↓
Hover
↓
Select
↓
Zoom
↓
Rotate
↓
Learn
↓
Return
```

## 6.2 Not Included in MVP

The following features are explicitly outside the MVP scope:

- Voice control
- AI astronomy assistant
- Real-time LLM conversations
- Multi-user interaction
- User accounts
- Cloud database
- Learning history
- Personalized recommendations
- Full solar-system simulation
- Accurate orbital mechanics
- Depth camera
- VR / AR headset support
- Raspberry Pi deployment
- Commercial hardware integration
- Real-time astronomical ephemeris
- Complex physics simulation

These features may appear in the **Future Vision** section of the portfolio.

---

# 7. Core Functions

## 7.1 Cosmic Projection

### Description

The system projects an interactive cosmic environment onto a ceiling or wall.

The projected scene should include:

- Starfield background
- Multiple interactive planets
- Planet names
- Selection feedback
- Knowledge information
- Gesture cursor

### Design Requirement

The visual interface should avoid looking like a traditional desktop application.

The experience should emphasize:

**Space as interface**

rather than:

**Screen with controls**

---

## 7.2 Hand Detection

### Description

The webcam captures the user's hand in real time.

The system detects:

- Hand presence
- Hand position
- Finger landmarks
- Hand movement
- Gesture state

### Required Output

The system should be able to produce:

```text
Hand detected / not detected

Hand X

Hand Y

Gesture

Pinch distance

Movement delta
```

---

## 7.3 Gesture Cursor

### Description

A lightweight digital cursor represents the user's hand position inside the projected interface.

### Purpose

The cursor provides system visibility.

It helps the user understand:

> Where does the system think my hand is pointing?

### Behavior

The cursor should:

- Follow the user's hand
- Hide when no hand is detected
- Change appearance during hover
- Change appearance during pinch
- Remain visually subtle

Possible styles:

```text
Small ring
Light point
Soft circular marker
```

---

## 7.4 Planet Hover

### Gesture

Point toward a planet.

### System Response

When the cursor approaches a planet:

- Planet becomes highlighted
- Planet scale increases slightly
- Planet name appears
- Hover state is activated

Example:

```text
Cursor approaches Saturn
↓
Saturn scale: 1.00 → 1.10
↓
"SATURN" label appears
```

---

## 7.5 Planet Selection

### Gesture

Pinch:

```text
Thumb + Index Finger
```

### System Response

If the user performs a pinch while a planet is hovered:

```text
Hovered Planet
↓
Pinch Confirmed
↓
Planet Selected
↓
Enter Explore Mode
```

---

## 7.6 Planet Zoom

### Description

The user can enlarge or reduce the selected planet.

### Interaction

Use the distance between the thumb and index finger.

Conceptually:

```text
Pinch distance increases
→ Zoom In

Pinch distance decreases
→ Zoom Out
```

Zoom must only work inside:

**Explore Mode**

---

## 7.7 Planet Rotation

### Description

The user can rotate the selected planet.

### MVP Interaction

Use horizontal and vertical hand movement.

Example:

```text
Hand moves right
→ Planet rotates right

Hand moves left
→ Planet rotates left
```

The MVP does not require full 3D wrist orientation tracking.

---

## 7.8 Planet Knowledge

### Description

When a planet enters Explore Mode, the system displays astronomy information.

Information may include:

- Planet name
- Planet type
- Diameter
- Distance from the Sun
- Orbital period
- Average temperature
- Short description
- Interesting facts

For the MVP, all astronomy information should be stored locally.

No AI API is required.

---

## 7.9 Return

### Gesture

Open palm.

### System Response

```text
Open Palm
↓
Exit Explore Mode
↓
Planet returns to original position
↓
Solar System Overview
```

---

# 8. Gesture Vocabulary

The first version should use as few gestures as possible.

| Gesture / Behavior | Function |
|---|---|
| Point / index position | Cursor / Hover |
| Pinch | Select |
| Pinch-distance change | Zoom |
| Hand movement | Rotate |
| Open palm | Return |

The interaction system should follow this rule:

> One gesture should have one primary meaning within one interaction state.

---

# 9. User Flow

```text
START
↓
Launch application
↓
Initialize projector scene
↓
Initialize camera
↓
Initialize hand tracking
↓
Optional calibration
↓
Enter Solar System Overview
↓
User raises hand
↓
Hand detected
↓
Gesture cursor appears
↓
User points toward planet
↓
Planet hover state
↓
User pinches
↓
Planet selected
↓
Transition to Explore Mode
↓
Planet enlarges
↓
Planet information appears
↓
User moves hand
↓
Planet rotates
↓
User changes pinch distance
↓
Planet zooms
↓
User reads astronomy information
↓
User opens palm
↓
Exit Explore Mode
↓
Return to Solar System Overview
```

---

# 10. Application States

Recommended states:

```text
BOOT
CALIBRATION
OVERVIEW
HOVER
SELECTED
EXPLORE
```

### BOOT
- Initialize application
- Load Three.js
- Load textures
- Load planet data
- Request camera permission
- Initialize MediaPipe
- Show loading feedback

### CALIBRATION
Map webcam coordinates to projection coordinates.

### OVERVIEW
- Move gesture cursor
- Hover planets
- Select a planet

### HOVER
- Highlight target planet
- Slight scale increase
- Show planet label
- Allow pinch selection

### SELECTED
- Lock selected planet
- Prevent additional selection
- Begin transition animation

### EXPLORE
- Rotate
- Zoom
- Read information
- Return

---

# 11. Interaction Feedback Requirements

Every meaningful user action must produce immediate visual feedback.

Examples:

- Hover → scale / glow / outline / label
- Select → pulse / camera transition / dim background
- Gesture tracking → moving cursor
- Zoom → smooth scale response
- Return → animated transition back to overview

---

# 12. Spatial Calibration

Camera coordinates and projection coordinates will not naturally match.

The system should support:

```text
Camera Space
↓
Coordinate Mapping
↓
Projection Space
```

The MVP should use four calibration targets:

```text
Top Left
Top Right
Bottom Right
Bottom Left
```

The user points to each target, and the system records the corresponding camera-space coordinate.

Calibration can be implemented after the core interaction system works.

---

# 13. Technical Requirements

## 13.1 Hardware

### Required
- Laptop or desktop computer
- Webcam
- Projector

### Optional
- External wide-angle webcam
- Tripod
- Speaker

### Future Hardware
- Depth camera
- Raspberry Pi
- Mini PC
- Integrated projection hardware

---

# 14. Recommended Software Stack

## Frontend
- HTML5
- CSS3
- JavaScript
- Vite

## 3D Graphics
**Three.js**

Responsibilities:
- Starfield
- Planet models
- Planet textures
- Lighting
- Planet rotation
- Camera transitions
- Hover states
- Selected states
- Explore animations

## Computer Vision
**MediaPipe Tasks Vision — Hand Landmarker**

Responsibilities:
- Hand detection
- Hand landmarks
- Hand position
- Finger position
- Real-time tracking

The MVP should track one hand only.

---

# 15. Gesture Recognition Requirements

Gesture recognition should be rule-based.

Do not train a custom machine-learning model.

Required gesture states:

```text
NONE
POINT
PINCH
OPEN_PALM
```

The gesture engine should additionally calculate:

```text
Cursor X
Cursor Y
Pinch Distance
Movement X
Movement Y
```

---

# 16. Gesture Stability

Important interactions must not trigger from a single video frame.

Use temporal confirmation.

Example:

```text
Frame 1: PINCH
Frame 2: PINCH
Frame 3: PINCH
↓
Confirmed PINCH
```

Important interactions such as `SELECT` and `BACK` should use multi-frame confirmation and cooldown logic.

---

# 17. Planet Data Requirements

Planet information must be stored separately from rendering code.

Recommended schema:

```js
{
  id: 'saturn',
  name: 'Saturn',
  type: 'Gas Giant',
  texture: '/textures/saturn.jpg',

  scene: {
    radius: 1.2,
    orbitRadius: 10,
    orbitSpeed: 0.03,
    rotationSpeed: 0.004,
    initialAngle: 2.4
  },

  facts: {
    diameterKm: 116460,
    distanceFromSunMillionKm: 1434,
    orbitalPeriodDays: 10759,
    temperatureC: -178
  },

  description:
    'Saturn is the sixth planet from the Sun and is famous for its extensive ring system.',

  highlights: [
    'Saturn is a gas giant.',
    'Its rings are made mostly of ice particles.',
    'Titan is Saturn’s largest moon.'
  ]
}
```

The MVP should contain data for all eight major planets:

```text
Mercury
Venus
Earth
Mars
Jupiter
Saturn
Uranus
Neptune
```

---

# 18. Planet Interaction Requirements

Each planet should support:

```text
DEFAULT
HOVERED
SELECTED
EXPLORE
```

Required behaviors:

- Basic rotation
- Hover scale animation
- Selection animation
- Explore scale
- User-controlled rotation
- User-controlled zoom
- Reset to overview

---

# 19. Interaction Event Requirements

Raw MediaPipe landmarks should never directly control the Three.js scene.

Required architecture:

```text
MediaPipe
↓
Hand Tracking
↓
Gesture Engine
↓
Semantic Interaction Event
↓
Interaction Controller
↓
Three.js
```

Recommended semantic events:

```text
HAND_FOUND
HAND_LOST
CURSOR_MOVE
SELECT
BACK
ZOOM
ROTATE
PLANET_HOVER_START
PLANET_HOVER_END
```

---

# 20. Mouse Fallback

The entire experience must work with a mouse before gesture interaction is integrated.

```text
Mouse Move → Cursor
Mouse Click → Select
Mouse Drag → Rotate
Mouse Wheel → Zoom
Escape → Return
```

Mouse fallback should remain available in the MVP.

---

# 21. Performance Requirements

Recommended initial targets:

### Webcam
```text
640 × 480
```

### Hand Tracking
One hand only.

### Planet Textures
```text
1024–2048 px
```

Avoid 8K textures.

The user should not perceive significant delay during cursor movement.

---

# 22. Error Handling

## Camera Permission Denied

The application should continue running.

Show:

```text
Camera access unavailable.
Mouse controls are still available.
```

## Hand Lost
- Hide gesture cursor
- Stop gesture-controlled movement
- Keep current planet state

## MediaPipe Failure
Fall back to mouse interaction.

## Texture Failure
Use a fallback planet material.

---

# 23. User Experience Requirements

## Immediate Feedback
Every major action must have feedback.

## Low Learning Cost
Gestures should build on familiar behavior.

## Avoid Gorilla Arm
The user should not need to hold their arm in the air continuously.

Recommended concept:

```text
Raise hand
↓
Interaction active

Hand lowered
↓
Ambient state
```

## Projection Readability
Avoid small typography and dense information panels.

Prefer:
- Large typography
- Short information blocks
- Strong visual hierarchy

---

# 24. MVP Validation Goals

The prototype should prove:

1. The webcam can reliably track a user's hand.
2. The user can point toward a projected object.
3. The user can select a planet using a natural gesture.
4. The user can manipulate the selected planet.
5. The user can complete:

```text
Discover
→ Select
→ Explore
→ Learn
→ Return
```

---

# 25. User Testing Requirements

Test with approximately **3–5 users**.

Evaluate:

1. Can users understand how to select a planet without explanation?
2. Is the pinch gesture intuitive?
3. Can users understand the cursor feedback?
4. Is planet rotation understandable?
5. Is zoom controllable?
6. Do users accidentally trigger gestures?
7. Does arm fatigue appear?
8. Can users read projected astronomy information comfortably?
9. Does the interaction feel more engaging than passive viewing?

---

# 26. MVP Success Criteria

The MVP is successful when:

- The application runs in a browser.
- The solar-system scene loads correctly.
- All eight major planets are available.
- Hand tracking works.
- Gesture cursor works.
- Planet hover works.
- Pinch selection works.
- Planet Explore Mode works.
- Gesture-controlled rotation works.
- Gesture-controlled zoom works.
- Planet information is displayed.
- Open-palm return works.
- Mouse fallback works.
- The system can run fullscreen through a projector.
- A user can complete the main flow without developer intervention.

---

# 27. Final Project Deliverables

## Functional Prototype

```text
Camera
+
MediaPipe
+
Gesture Recognition
+
Three.js
+
Projection
```

## Interaction Design
- Gesture vocabulary
- User flow
- Interaction states
- Spatial calibration logic
- Feedback design

## User Testing
At least 3–5 participants.

## Demo Video

Demonstrate:

```text
User sees projected solar system
↓
Raises hand
↓
Points toward planet
↓
Selects planet
↓
Planet enlarges
↓
Rotates planet
↓
Reads information
↓
Returns to overview
```

## Portfolio Case Study

Recommended structure:

```text
01 Opportunity
02 User / Context
03 Design Challenge
04 Research
05 Gesture Exploration
06 Interaction System
07 Technical Architecture
08 Prototype
09 Spatial Calibration
10 User Testing
11 Iteration
12 Final Experience
13 Future Vision
```

---

# 28. Future Vision

Possible future extensions:

- Voice interaction
- AI astronomy assistant
- Voice + gesture multimodal interaction
- Depth camera / XYZ spatial interaction
- Room-scale astronomy learning
- Multi-user exploration
- Parent-child interaction
- Museum installation
- Standalone integrated hardware

---

# 29. Core Product Value

**Cosmos Within Reach** is not simply a star projector.

It is a:

**Spatial Interactive Learning System**

The product transforms:

```text
Passive Watching
```

into:

```text
Active Exploration
```

Its central design question is:

> How might we transform projected space into an intuitive interface for exploring and learning about the universe?

The core experience can be summarized as:

```text
Gesture
↓
Spatial Interaction
↓
Exploration
↓
Knowledge
```

The ultimate goal is to transform the user's relationship with astronomy from:

> Watching the universe

to:

> Exploring the universe.
