import { AppState, APP_STATES } from './AppState.js';
import { EventBus, EVENTS } from './EventBus.js';
import { SceneManager } from '../scene/SceneManager.js';
import { DEBUG } from '../config/constants.js';
import { DebugPanel } from '../ui/DebugPanel.js';
import { LoadingScreen } from '../ui/LoadingScreen.js';

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
    this.unsubscribeFromState = null;
  }

  async start() {
    this.unsubscribeFromState = this.state.subscribe((change) => {
      this.events.emit(EVENTS.STATE_CHANGE, change);
      this.root.dataset.appState = change.currentState;
      this.debugPanel.update('App state', change.currentState);
    });

    this.renderWelcomeScreen();
    this.loadingScreen.show('正在初始化星空场景…');
    this.loadingScreen.setMessage('正在创建 3D 场景…');
    this.sceneManager = new SceneManager({ container: this.root });
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

  renderWelcomeScreen() {
    this.root.innerHTML = `
      <section class="welcome" aria-labelledby="project-title">
        <p class="eyebrow">Cosmos Within Reach</p>
        <h1 id="project-title">咫尺星空</h1>
        <p class="status">八大行星已接入太阳系总览</p>
        <p class="hint">行星正在自转与巡游，下一阶段将加入聚焦探索。</p>
      </section>
    `;
  }

  destroy() {
    window.removeEventListener('resize', this.handleWindowResize);
    this.sceneManager?.dispose();
    this.loadingScreen.destroy();
    this.debugPanel.destroy();
    this.unsubscribeFromState?.();
    this.events.clear();
  }
}
