import { AppState, APP_STATES } from './AppState.js';
import { EventBus, EVENTS } from './EventBus.js';
import { SceneManager } from '../scene/SceneManager.js';
import { DEBUG } from '../config/constants.js';
import { DebugPanel } from '../ui/DebugPanel.js';
import { LoadingScreen } from '../ui/LoadingScreen.js';
import { PlanetInfoPanel } from '../ui/PlanetInfoPanel.js';

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

    window.addEventListener('resize', this.handleWindowResize);
  }

  handleWindowResize = () => {
    this.debugPanel.update(
      'Viewport',
      `${window.innerWidth} × ${window.innerHeight}`,
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
        <p class="status">八大行星已接入太阳系总览</p>
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
    this.unsubscribeFromState?.();
    this.unsubscribeFromInteraction.forEach((unsubscribe) => unsubscribe());
    this.unsubscribeFromInteraction = [];
    this.events.clear();
  }
}
