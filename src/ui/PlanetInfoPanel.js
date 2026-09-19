import { EVENTS } from '../app/EventBus.js';
import { getPlanetById } from '../data/planets.js';

const numberFormatter = new Intl.NumberFormat('zh-CN', {
  maximumFractionDigits: 2,
});

/** Displays astronomy facts for the planet currently in explore mode. */
export class PlanetInfoPanel {
  constructor({ root, events }) {
    this.root = root;
    this.events = events;
    this.element = null;
    this.identityElement = null;
    this.hideTimer = null;
  }

  init() {
    this.element = document.createElement('aside');
    this.element.className = 'planet-info-panel';
    this.element.hidden = true;
    this.element.setAttribute('aria-live', 'polite');
    this.identityElement = document.createElement('div');
    this.identityElement.className = 'planet-identity';
    this.identityElement.hidden = true;
    this.root.append(this.identityElement, this.element);
  }

  show(planetId) {
    const planet = getPlanetById(planetId);
    if (!planet || !this.element || !this.identityElement) return;

    window.clearTimeout(this.hideTimer);
    const { facts } = planet;
    this.identityElement.innerHTML = `
      <p class="planet-info-kicker">${planet.name.en}</p>
      <h2>${planet.name.zh}</h2>
      <p class="planet-info-type">${planet.type.en}</p>
    `;
    this.element.innerHTML = `
      <div class="planet-panel-actions">
        <button class="planet-info-back" type="button" aria-label="返回太阳系总览">
          <span>ESC</span> Back
        </button>
      </div>
      <dl class="planet-facts">
        <div><dt>Diameter</dt><dd>${numberFormatter.format(facts.diameterKm)} km</dd></div>
        <div><dt>Distance from Sun</dt><dd>${numberFormatter.format(facts.distanceFromSunMillionKm)} million km</dd></div>
        <div><dt>Orbital Period</dt><dd>${numberFormatter.format(facts.orbitalPeriodDays)} Earth days</dd></div>
        <div><dt>Average Temperature</dt><dd>${numberFormatter.format(facts.averageTemperatureC)} °C</dd></div>
      </dl>
      <p class="planet-description">${planet.descriptionEn}</p>
      <div class="planet-highlights">
        <h3>Exploration Highlights</h3>
        <ul>${planet.highlightsEn.map((item) => `<li>${item}</li>`).join('')}</ul>
      </div>
      <p class="planet-control-hint">Drag to rotate · Scroll to zoom</p>
    `;
    this.element.querySelector('.planet-info-back').addEventListener('click', () => {
      this.events.emit(EVENTS.BACK, { source: 'button' });
    });
    this.identityElement.hidden = false;
    this.element.hidden = false;
    window.requestAnimationFrame(() => {
      this.element?.classList.add('is-visible');
      this.identityElement?.classList.add('is-visible');
    });
  }

  hide() {
    if (!this.element || this.element.hidden) return;
    this.element.classList.remove('is-visible');
    this.identityElement?.classList.remove('is-visible');
    this.hideTimer = window.setTimeout(() => {
      if (this.element) this.element.hidden = true;
      if (this.identityElement) this.identityElement.hidden = true;
    }, 320);
  }

  destroy() {
    window.clearTimeout(this.hideTimer);
    this.element?.remove();
    this.identityElement?.remove();
    this.element = null;
    this.identityElement = null;
  }
}
