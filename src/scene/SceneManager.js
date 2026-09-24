import * as THREE from 'three';
import { sceneConfig } from '../config/sceneConfig.js';
import { planets } from '../data/planets.js';
import { PlanetManager } from './PlanetManager.js';
import { Starfield } from './Starfield.js';
import { SolarSystemGuide } from './SolarSystemGuide.js';
import { PointerRaycaster } from '../interaction/PointerRaycaster.js';
import { ExploreControls } from '../interaction/ExploreControls.js';
import { PlanetHoverLabel } from '../ui/PlanetHoverLabel.js';
import { EVENTS } from '../app/EventBus.js';

/**
 * Owns the Three.js scene, camera, renderer, and animation loop.
 * Input: a host HTML element. Output: a rendered and continuously updated scene.
 */
export class SceneManager {
  constructor({ container, events }) {
    if (!(container instanceof HTMLElement)) {
      throw new Error('SceneManager requires a valid container element.');
    }

    this.container = container;
    this.events = events;
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.planetManager = null;
    this.starfield = null;
    this.solarSystemGuide = null;
    this.pointerRaycaster = null;
    this.exploreControls = null;
    this.hoverLabel = null;
    this.unsubscribeFromInteraction = [];
    this.animationFrameId = null;
    this.lastFrameTime = null;
    this.resizeObserver = null;

    this.animate = this.animate.bind(this);
    this.handleResize = this.handleResize.bind(this);
  }

  init() {
    this.createScene();
    this.createCamera();
    this.createRenderer();
    this.createLights();
    this.createStarfield();
    this.createSolarSystemGuide();
    this.createPlanets();
    this.createPointerRaycaster();
    this.createExploreControls();
    this.createHoverFeedback();
    this.observeResize();
    this.start();
  }

  createScene() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(sceneConfig.backgroundColor);
  }

  createCamera() {
    const { fov, near, far, position } = sceneConfig.camera;
    const { width, height } = this.getViewportSize();

    this.camera = new THREE.PerspectiveCamera(fov, width / height, near, far);
    this.camera.position.set(position.x, position.y, position.z);
    this.camera.lookAt(0, 0, 0);
  }

  createRenderer() {
    const { antialias, maxPixelRatio } = sceneConfig.renderer;
    const { width, height } = this.getViewportSize();

    this.renderer = new THREE.WebGLRenderer({ antialias, alpha: false });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, maxPixelRatio));
    this.renderer.setSize(width, height, false);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.domElement.className = 'cosmos-canvas';
    this.renderer.domElement.setAttribute('aria-label', '咫尺星空 3D 场景');
    this.container.append(this.renderer.domElement);
  }

  createLights() {
    const ambientLight = new THREE.AmbientLight(
      sceneConfig.lighting.ambient.color,
      sceneConfig.lighting.ambient.intensity,
    );

    const keyLight = new THREE.DirectionalLight(
      sceneConfig.lighting.directional.color,
      sceneConfig.lighting.directional.intensity,
    );
    const { x, y, z } = sceneConfig.lighting.directional.position;
    keyLight.position.set(x, y, z);

    this.scene.add(ambientLight, keyLight);
  }

  createPlanets() {
    this.planetManager = new PlanetManager({
      scene: this.scene,
      planetData: planets,
    });
    this.planetManager.createAll();
  }

  createStarfield() {
    this.starfield = new Starfield(sceneConfig.starfield);
    const starfieldGroup = this.starfield.create();
    starfieldGroup.position.copy(this.camera.position);
    this.scene.add(starfieldGroup);
  }

  createSolarSystemGuide() {
    this.solarSystemGuide = new SolarSystemGuide({
      config: sceneConfig.solarSystem,
      planetData: planets,
    });
    this.scene.add(this.solarSystemGuide.create());
  }

  createPointerRaycaster() {
    this.pointerRaycaster = new PointerRaycaster({
      canvas: this.renderer.domElement,
      camera: this.camera,
      planetManager: this.planetManager,
      events: this.events,
    });
    this.pointerRaycaster.init();
  }

  createHoverFeedback() {
    this.hoverLabel = new PlanetHoverLabel({
      container: this.container,
      camera: this.camera,
      planetManager: this.planetManager,
    });
    this.hoverLabel.init();

    this.unsubscribeFromInteraction.push(
      this.events.on(EVENTS.PLANET_HOVER_START, ({ planetId }) => {
        this.planetManager.getById(planetId)?.setHovered(true);
        this.hoverLabel.show(planetId);
      }),
      this.events.on(EVENTS.PLANET_HOVER_END, ({ planetId }) => {
        this.planetManager.getById(planetId)?.setHovered(false);
        this.hoverLabel.hide(planetId);
      }),
    );
  }

  createExploreControls() {
    this.exploreControls = new ExploreControls({
      canvas: this.renderer.domElement,
      events: this.events,
    });
    this.exploreControls.init();
    this.unsubscribeFromInteraction.push(
      this.events.on(EVENTS.ROTATE, ({ deltaX, deltaY }) => {
        const sensitivity = sceneConfig.explore.rotationSensitivity * 0.001;
        this.planetManager.rotateSelected(deltaX * sensitivity, deltaY * sensitivity);
      }),
      this.events.on(EVENTS.ZOOM, ({ delta }) => {
        this.planetManager.zoomSelected(delta);
      }),
    );
  }

  getViewportSize() {
    return {
      width: Math.max(this.container.clientWidth, 1),
      height: Math.max(this.container.clientHeight, 1),
    };
  }

  observeResize() {
    if ('ResizeObserver' in window) {
      this.resizeObserver = new ResizeObserver(this.handleResize);
      this.resizeObserver.observe(this.container);
      return;
    }

    window.addEventListener('resize', this.handleResize);
  }

  handleResize() {
    if (!this.camera || !this.renderer) {
      return;
    }

    const { width, height } = this.getViewportSize();
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setPixelRatio(
      Math.min(window.devicePixelRatio, sceneConfig.renderer.maxPixelRatio),
    );
    this.renderer.setSize(width, height, false);
  }

  update(deltaTime) {
    this.starfield?.update(deltaTime);
    this.solarSystemGuide?.update(deltaTime);
    this.planetManager?.update(deltaTime);
    this.hoverLabel?.update();
  }

  updateGesturePointer(cursor) {
    if (!cursor) {
      this.pointerRaycaster?.clearSource('gesture');
      return null;
    }

    return this.pointerRaycaster?.updateFromViewportPosition({
      x: cursor.x,
      y: cursor.y,
      source: 'gesture',
    }) ?? null;
  }

  clearGesturePointer() {
    this.pointerRaycaster?.clearSource('gesture');
  }

  getSelectedZoomMultiplier() {
    return this.planetManager?.getSelectedZoomMultiplier() ?? null;
  }

  setSelectedZoomMultiplier(multiplier) {
    return this.planetManager?.setSelectedZoomMultiplier(multiplier) ?? null;
  }

  setSelectedZoomPreset(preset) {
    return this.planetManager?.setSelectedZoomPreset(preset) ?? null;
  }

  setSelectedZoomOpenness(openness) {
    return this.planetManager?.setSelectedZoomOpenness(openness) ?? null;
  }

  focusPlanet(planetId) {
    this.pointerRaycaster?.setEnabled(false);
    this.solarSystemGuide?.setExploring(true);
    return this.planetManager.focusPlanet(planetId).then((planet) => {
      this.exploreControls?.setEnabled(true);
      return planet;
    });
  }

  resetFocus() {
    this.exploreControls?.setEnabled(false);
    this.solarSystemGuide?.setExploring(false);
    return this.planetManager.resetFocus().then(() => {
      this.pointerRaycaster?.setEnabled(true);
    });
  }

  animate(time) {
    this.animationFrameId = window.requestAnimationFrame(this.animate);
    const deltaTime =
      this.lastFrameTime === null
        ? 0
        : Math.min((time - this.lastFrameTime) / 1000, 0.1);
    this.lastFrameTime = time;

    this.update(deltaTime);
    this.renderer.render(this.scene, this.camera);
  }

  start() {
    if (this.animationFrameId !== null) {
      return;
    }

    this.lastFrameTime = null;
    this.animationFrameId = window.requestAnimationFrame(this.animate);
  }

  stop() {
    if (this.animationFrameId === null) {
      return;
    }

    window.cancelAnimationFrame(this.animationFrameId);
    this.animationFrameId = null;
    this.lastFrameTime = null;
  }

  dispose() {
    this.stop();
    this.resizeObserver?.disconnect();
    window.removeEventListener('resize', this.handleResize);
    this.planetManager?.dispose();
    this.starfield?.dispose();
    this.solarSystemGuide?.dispose();
    this.pointerRaycaster?.dispose();
    this.exploreControls?.dispose();
    this.unsubscribeFromInteraction.forEach((unsubscribe) => unsubscribe());
    this.unsubscribeFromInteraction = [];
    this.hoverLabel?.destroy();
    this.renderer?.dispose();
    this.renderer?.domElement.remove();
  }
}
