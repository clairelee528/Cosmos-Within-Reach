import * as THREE from 'three';
import { EVENTS } from '../app/EventBus.js';

/** Converts pointer coordinates into a planet id using Three.js raycasting. */
export class PointerRaycaster {
  constructor({ canvas, camera, planetManager, events }) {
    this.canvas = canvas;
    this.camera = camera;
    this.planetManager = planetManager;
    this.events = events;
    this.raycaster = new THREE.Raycaster();
    this.pointer = new THREE.Vector2(2, 2);
    this.currentPlanetId = null;
    this.currentSource = null;
    this.enabled = true;

    this.handlePointerMove = this.handlePointerMove.bind(this);
    this.handlePointerLeave = this.handlePointerLeave.bind(this);
    this.handlePointerDown = this.handlePointerDown.bind(this);
  }

  init() {
    this.canvas.addEventListener('pointermove', this.handlePointerMove);
    this.canvas.addEventListener('pointerleave', this.handlePointerLeave);
    this.canvas.addEventListener('pointerdown', this.handlePointerDown);
  }

  handlePointerMove(event) {
    if (!this.enabled) return;
    const bounds = this.canvas.getBoundingClientRect();
    this.updateFromViewportPosition({
      x: (event.clientX - bounds.left) / bounds.width,
      y: (event.clientY - bounds.top) / bounds.height,
      source: 'mouse',
    });
  }

  handlePointerLeave() {
    this.clearSource('mouse');
  }

  handlePointerDown(event) {
    if (!this.enabled || event.button !== 0) return;

    // Re-evaluate the click itself so a previous hand hover can never cause a
    // mouse click elsewhere on the canvas to select the wrong planet.
    this.handlePointerMove(event);
    if (!this.currentPlanetId) return;

    this.events?.emit(EVENTS.SELECT, {
      source: 'mouse',
      planetId: this.currentPlanetId,
    });
  }

  setEnabled(value) {
    this.enabled = value;
    if (!value) this.clear();
  }

  /** Raycasts a screen position expressed from 0..1 for mouse or hand input. */
  updateFromViewportPosition({ x, y, source = 'gesture' }) {
    if (!this.enabled || !Number.isFinite(x) || !Number.isFinite(y)) {
      this.clearSource(source);
      return null;
    }

    this.pointer.set(x * 2 - 1, -(y * 2 - 1));
    this.raycaster.setFromCamera(this.pointer, this.camera);
    const [intersection] = this.raycaster.intersectObjects(
      this.planetManager.getInteractiveMeshes(),
      false,
    );
    const planetId = intersection?.object.userData.planetId ?? null;

    this.events?.emit(EVENTS.CURSOR_MOVE, {
      source,
      normalizedX: this.pointer.x,
      normalizedY: this.pointer.y,
      planetId,
    });
    this.setCurrentPlanet(planetId, source);
    return planetId;
  }

  clearSource(source) {
    if (this.currentSource !== source) return;
    this.clear();
  }

  clear() {
    this.pointer.set(2, 2);
    this.setCurrentPlanet(null, this.currentSource);
  }

  setCurrentPlanet(planetId, source = null) {
    if (planetId === this.currentPlanetId) {
      if (planetId) this.currentSource = source;
      return;
    }

    if (this.currentPlanetId) {
      this.events?.emit(EVENTS.PLANET_HOVER_END, {
        planetId: this.currentPlanetId,
        source: this.currentSource,
      });
    }

    this.currentPlanetId = planetId;
    this.currentSource = planetId ? source : null;

    if (planetId) {
      this.events?.emit(EVENTS.PLANET_HOVER_START, { planetId, source });
    }
  }

  dispose() {
    this.handlePointerLeave();
    this.canvas.removeEventListener('pointermove', this.handlePointerMove);
    this.canvas.removeEventListener('pointerleave', this.handlePointerLeave);
    this.canvas.removeEventListener('pointerdown', this.handlePointerDown);
  }
}
