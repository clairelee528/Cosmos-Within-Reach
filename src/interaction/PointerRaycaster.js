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
    this.pointer.set(
      ((event.clientX - bounds.left) / bounds.width) * 2 - 1,
      -((event.clientY - bounds.top) / bounds.height) * 2 + 1,
    );

    this.raycaster.setFromCamera(this.pointer, this.camera);
    const [intersection] = this.raycaster.intersectObjects(
      this.planetManager.getInteractiveMeshes(),
      false,
    );
    const planetId = intersection?.object.userData.planetId ?? null;

    this.events?.emit(EVENTS.CURSOR_MOVE, {
      source: 'mouse',
      normalizedX: this.pointer.x,
      normalizedY: this.pointer.y,
      planetId,
    });
    this.setCurrentPlanet(planetId);
  }

  handlePointerLeave() {
    this.pointer.set(2, 2);
    this.setCurrentPlanet(null);
  }

  handlePointerDown(event) {
    if (!this.enabled || event.button !== 0 || !this.currentPlanetId) return;
    this.events?.emit(EVENTS.SELECT, {
      source: 'mouse',
      planetId: this.currentPlanetId,
    });
  }

  setEnabled(value) {
    this.enabled = value;
    if (!value) this.handlePointerLeave();
  }

  setCurrentPlanet(planetId) {
    if (planetId === this.currentPlanetId) return;

    if (this.currentPlanetId) {
      this.events?.emit(EVENTS.PLANET_HOVER_END, {
        planetId: this.currentPlanetId,
      });
    }

    this.currentPlanetId = planetId;

    if (planetId) {
      this.events?.emit(EVENTS.PLANET_HOVER_START, { planetId });
    }
  }

  dispose() {
    this.handlePointerLeave();
    this.canvas.removeEventListener('pointermove', this.handlePointerMove);
    this.canvas.removeEventListener('pointerleave', this.handlePointerLeave);
    this.canvas.removeEventListener('pointerdown', this.handlePointerDown);
  }
}
