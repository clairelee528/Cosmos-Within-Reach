import * as THREE from 'three';

/** Displays the currently hovered planet name beside its projected position. */
export class PlanetHoverLabel {
  constructor({ container, camera, planetManager }) {
    this.container = container;
    this.camera = camera;
    this.planetManager = planetManager;
    this.element = null;
    this.planet = null;
    this.worldPosition = new THREE.Vector3();
  }

  init() {
    this.element = document.createElement('div');
    this.element.className = 'planet-hover-label';
    this.element.hidden = true;
    this.container.append(this.element);
  }

  show(planetId) {
    const planet = this.planetManager.getById(planetId);
    if (!planet || !this.element) return;

    this.planet = planet;
    this.element.innerHTML = `
      <strong>${planet.data.name.zh}</strong>
      <span>${planet.data.name.en}</span>
    `;
    this.element.hidden = false;
    this.update();
  }

  hide(planetId) {
    if (!this.planet || (planetId && this.planet.id !== planetId)) return;
    this.planet = null;
    if (this.element) this.element.hidden = true;
  }

  update() {
    if (!this.planet || !this.element || this.element.hidden) return;

    this.planet.group.getWorldPosition(this.worldPosition);
    this.worldPosition.project(this.camera);
    const x = (this.worldPosition.x * 0.5 + 0.5) * this.container.clientWidth;
    const y = (-this.worldPosition.y * 0.5 + 0.5) * this.container.clientHeight;
    this.element.style.transform = `translate(${x}px, ${y}px)`;
  }

  destroy() {
    this.element?.remove();
    this.element = null;
    this.planet = null;
  }
}
