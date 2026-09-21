import { AppState, APP_STATES } from './AppState.js';
import { EventBus, EVENTS } from './EventBus.js';
import { SceneManager } from '../scene/SceneManager.js';
import { DEBUG } from '../config/constants.js';
import { DebugPanel } from '../ui/DebugPanel.js';
import { LoadingScreen } from '../ui/LoadingScreen.js';
import { PlanetInfoPanel } from '../ui/PlanetInfoPanel.js';
import { CameraManager, CAMERA_STATES } from '../input/CameraManager.js';
import { CameraStatus } from '../ui/CameraStatus.js';
import { HandTracker, HAND_TRACKER_STATES } from '../vision/HandTracker.js';
import { HandDebugView } from '../ui/HandDebugView.js';

/**
 * Coordinates the project's top-level modules.
 * Input: the root page element. Output: an initialized application instance.
 */
export class App {
  constructor({ root }) {
    if (!(root instanceof HTMLElement)) {
      throw new Error('App requires a valid root HTML element.');
    }

    this.root = root;
    this.events = new EventBus();
    this.state = new AppState();
    this.sceneManager = null;
    this.loadingScreen = new LoadingScreen({ root });
    this.debugPanel = new DebugPanel({ root, enabled: DEBUG });
    this.planetInfoPanel = new PlanetInfoPanel({ root, events: this.events });
    this.cameraStatus = new CameraStatus({ root });
    this.cameraManager = new CameraManager({
      onStateChange: this.handleCameraStateChange,
    });
    this.handTracker = new HandTracker({
      onStateChange: this.handleHandTrackerStateChange,
      onResult: this.handleHandTrackingResult,
    });
    this.handDebugView = new HandDebugView({ root });
    this.wasHandDetected = false;
    this.unsubscribeFromState = null;
    this.unsubscribeFromInteraction = [];
  }

  async start() {
    this.unsubscribeFromState = this.state.subscribe((change) => {
      this.events.emit(EVENTS.STATE_CHANGE, change);
      this.root.dataset.appState = change.currentState;
      this.debugPanel.update('App state', change.currentState);
    });

    this.renderWelcomeScreen();
    this.planetInfoPanel.init();
    this.cameraStatus.init();
    this.handDebugView.init();
    this.loadingScreen.show('正在初始化星空场景…');
    this.loadingScreen.setMessage('正在创建 3D 场景…');
    this.sceneManager = new SceneManager({
      container: this.root,
      events: this.events,
    });
    this.sceneManager.init();
    this.debugPanel.init();
    this.debugPanel.update('Renderer', 'WebGL');
    this.debugPanel.update(
      'Planets',
      this.sceneManager.planetManager.getAll().length,
    );
    this.debugPanel.update(
      'Viewport',
      `${window.innerWidth} × ${window.innerHeight}`,
    );
    this.unsubscribeFromInteraction.push(
      this.events.on(EVENTS.PLANET_HOVER_START, ({ planetId }) => {
        this.debugPanel.update('Pointer target', planetId);
      }),
      this.events.on(EVENTS.PLANET_HOVER_END, () => {
        this.debugPanel.update('Pointer target', '—');
      }),
      this.events.on(EVENTS.SELECT, this.handlePlanetSelect),
      this.events.on(EVENTS.BACK, this.handleBack),
    );
    this.state.transitionTo(APP_STATES.OVERVIEW, {
      reason: 'Three.js scene is ready',
    });
    this.loadingScreen.hide();

    // Camera failure must never block the existing mouse interaction flow.
    this.initializeHandInput();

    window.addEventListener('resize', this.handleWindowResize);
  }

  handleWindowResize = () => {
    this.debugPanel.update(
      'Viewport',
      `${window.innerWidth} × ${window.innerHeight}`,
    );
  };

  handleCameraStateChange = ({ state, width, height, message }) => {
    this.cameraStatus.update({ state, message });

    const labels = {
      [CAMERA_STATES.IDLE]: 'Idle',
      [CAMERA_STATES.REQUESTING]: 'Requesting permission',
      [CAMERA_STATES.READY]: `${width} × ${height}`,
      [CAMERA_STATES.ERROR]: 'Unavailable · mouse fallback',
      [CAMERA_STATES.STOPPED]: 'Stopped',
    };
    this.debugPanel.update('Camera', labels[state] ?? state);
  };

  handleHandTrackerStateChange = ({ state, message }) => {
    const labels = {
      [HAND_TRACKER_STATES.IDLE]: 'Idle',
      [HAND_TRACKER_STATES.LOADING]: 'Loading',
      [HAND_TRACKER_STATES.READY]: 'Ready · 1 hand',
      [HAND_TRACKER_STATES.ERROR]: 'Unavailable · mouse fallback',
      [HAND_TRACKER_STATES.DISPOSED]: 'Disposed',
    };
    this.debugPanel.update('Hand model', labels[state] ?? state);

    if (state === HAND_TRACKER_STATES.LOADING) {
      this.cameraStatus.show('正在加载手部识别模型…');
    } else if (state === HAND_TRACKER_STATES.READY) {
      this.cameraStatus.showTemporary('手部识别模型已就绪');
    } else if (state === HAND_TRACKER_STATES.ERROR) {
      this.cameraStatus.showTemporary(message, {
        state: CAMERA_STATES.ERROR,
        duration: 6000,
      });
    }
  };

  async initializeHandInput() {
    try {
      const [video] = await Promise.all([
        this.cameraManager.start(),
        this.handTracker.init(),
      ]);
      this.handTracker.start(video);
      this.handDebugView.setVideo(video);
      this.debugPanel.update('Hand tracking', 'Running');
      this.debugPanel.update('Hand view', '按 H 显示');
    } catch (error) {
      console.warn(
        'Hand input is unavailable; continuing with mouse input.',
        error,
      );
      this.debugPanel.update('Hand tracking', 'Mouse fallback');
    }
  }

  handleHandTrackingResult = (result) => {
    this.handDebugView.update(result);
    this.events.emit(EVENTS.HAND_TRACK_UPDATE, result);

    if (result.detected !== this.wasHandDetected) {
      this.wasHandDetected = result.detected;
      this.events.emit(
        result.detected ? EVENTS.HAND_FOUND : EVENTS.HAND_LOST,
        result,
      );
    }

    this.debugPanel.update(
      'Hand detected',
      result.detected
        ? `Yes · ${result.handedness ?? 'Unknown'} · ${result.landmarks.length} points`
        : 'No',
    );
  };

  handleBack = async () => {
    if (this.state.current !== APP_STATES.EXPLORE) return;

    this.planetInfoPanel.hide();
    this.state.transitionTo(APP_STATES.TRANSITION, {
      reason: 'Returning to overview',
    });
    await this.sceneManager.resetFocus();
    if (this.state.current === APP_STATES.TRANSITION) {
      this.state.transitionTo(APP_STATES.OVERVIEW, {
        reason: 'Return transition complete',
      });
    }
  };

  handlePlanetSelect = async ({ planetId }) => {
    if (this.state.current !== APP_STATES.OVERVIEW) return;

    this.state.transitionTo(APP_STATES.TRANSITION, {
      reason: 'Planet selected',
      planetId,
    });
    this.planetInfoPanel.show(planetId);
    await this.sceneManager.focusPlanet(planetId);

    if (this.state.current === APP_STATES.TRANSITION) {
      this.state.transitionTo(APP_STATES.EXPLORE, {
        reason: 'Planet focus transition complete',
        planetId,
      });
    }
  };

  renderWelcomeScreen() {
    this.root.innerHTML = `
      <section class="welcome" aria-labelledby="project-title">
        <p class="eyebrow">Cosmos Within Reach</p>
        <h1 id="project-title">咫尺星空</h1>
        <p class="status">沿轨道探索太阳系八大行星</p>
        <p class="hint">悬停识别行星，点击进入近距离探索。</p>
      </section>
    `;
  }

  destroy() {
    window.removeEventListener('resize', this.handleWindowResize);
    this.sceneManager?.dispose();
    this.loadingScreen.destroy();
    this.debugPanel.destroy();
    this.planetInfoPanel.destroy();
    this.cameraManager.stop();
    this.handTracker.dispose();
    this.handDebugView.destroy();
    this.cameraStatus.destroy();
    this.unsubscribeFromState?.();
    this.unsubscribeFromInteraction.forEach((unsubscribe) => unsubscribe());
    this.unsubscribeFromInteraction = [];
    this.events.clear();
  }
}
