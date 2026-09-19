import * as THREE from 'three';
import { Planet } from './Planet.js';
import { sceneConfig } from '../config/sceneConfig.js';

/**
 * Creates, stores, and updates every runtime Planet instance.
 * Input: a scene and static planet data. Output: managed planet objects/meshes.
 */
export class PlanetManager {
  constructor({ scene, planetData }) {
    if (!(scene instanceof THREE.Scene)) {
      throw new Error('PlanetManager requires a valid Three.js scene.');
    }

    if (!Array.isArray(planetData)) {
      throw new TypeError('PlanetManager requires an array of planet data.');
    }

    this.scene = scene;
    this.planetData = planetData;
    this.solarSystemGroup = new THREE.Group();
    this.solarSystemGroup.name = 'solar-system';
    this.planets = new Map();
    this.focusTransition = null;
    this.returnTransition = null;
    this.selectedPlanet = null;
    this.focusBaseScale = 1;
  }

  createAll() {
    if (this.planets.size > 0) {
      return this.solarSystemGroup;
    }

    for (const data of this.planetData) {
      if (this.planets.has(data.id)) {
        throw new Error(`Duplicate planet id: ${data.id}`);
      }

      const planet = new Planet(data);
      this.solarSystemGroup.add(planet.create());
      this.planets.set(data.id, planet);
    }

    this.scene.add(this.solarSystemGroup);
    return this.solarSystemGroup;
  }

  update(deltaTime) {
    this.planets.forEach((planet) => planet.update(deltaTime));
    this.updateFocusTransition(deltaTime);
    this.updateReturnTransition(deltaTime);
  }

  getById(planetId) {
    return this.planets.get(planetId) ?? null;
  }

  getAll() {
    return [...this.planets.values()];
  }

  getInteractiveMeshes() {
    return this.getAll()
      .map((planet) => planet.hitAreaMesh)
      .filter(Boolean);
  }

  focusPlanet(planetId) {
    if (this.focusTransition) return this.focusTransition.promise;

    const selectedPlanet = this.getById(planetId);
    if (!selectedPlanet) {
      return Promise.reject(new Error(`Unknown planet: ${planetId}`));
    }

    selectedPlanet.setHovered(false);
    selectedPlanet.setSelected(true);
    const startPosition = selectedPlanet.group.position.clone();
    const startScale = selectedPlanet.currentScale;
    const compactViewport =
      typeof window !== 'undefined' && window.innerWidth < 700;
    const targetPosition = new THREE.Vector3(
      compactViewport ? -2.2 : sceneConfig.explore.focusPosition.x,
      sceneConfig.explore.focusPosition.y,
      sceneConfig.explore.focusPosition.z,
    );
    const targetScale = sceneConfig.explore.focusRadius / selectedPlanet.data.scene.radius;
    this.selectedPlanet = selectedPlanet;
    this.focusBaseScale = targetScale;

    let resolveTransition;
    const promise = new Promise((resolve) => {
      resolveTransition = resolve;
    });
    this.focusTransition = {
      planetId,
      selectedPlanet,
      startPosition,
      startScale,
      targetPosition,
      targetScale,
      elapsed: 0,
      promise,
      resolve: resolveTransition,
    };
    return promise;
  }

  rotateSelected(deltaX, deltaY) {
    this.selectedPlanet?.rotate(deltaX, deltaY);
  }

  zoomSelected(delta) {
    if (!this.selectedPlanet || this.focusTransition || this.returnTransition) return;
    const currentMultiplier = this.selectedPlanet.currentScale / this.focusBaseScale;
    const nextMultiplier = THREE.MathUtils.clamp(
      currentMultiplier - delta * sceneConfig.explore.zoomSensitivity,
      sceneConfig.explore.minScale,
      sceneConfig.explore.maxScale,
    );
    this.selectedPlanet.setScale(this.focusBaseScale * nextMultiplier);
  }

  resetFocus() {
    if (!this.selectedPlanet || this.returnTransition) return Promise.resolve();

    const selectedPlanet = this.selectedPlanet;
    let resolveTransition;
    const promise = new Promise((resolve) => {
      resolveTransition = resolve;
    });
    this.returnTransition = {
      selectedPlanet,
      startPosition: selectedPlanet.group.position.clone(),
      startScale: selectedPlanet.currentScale,
      targetPosition: new THREE.Vector3(
        Math.cos(selectedPlanet.orbitAngle) * selectedPlanet.data.scene.orbitRadius,
        Math.sin(selectedPlanet.orbitAngle) * selectedPlanet.data.scene.orbitRadius * 0.46,
        Math.sin(selectedPlanet.orbitAngle) * 0.7,
      ),
      elapsed: 0,
      promise,
      resolve: resolveTransition,
    };
    return promise;
  }

  updateReturnTransition(deltaTime) {
    if (!this.returnTransition) return;

    const transition = this.returnTransition;
    transition.elapsed += deltaTime;
    const progress = Math.min(
      transition.elapsed / sceneConfig.explore.transitionDuration,
      1,
    );
    const eased = 1 - Math.pow(1 - progress, 3);

    transition.selectedPlanet.group.position.lerpVectors(
      transition.startPosition,
      transition.targetPosition,
      eased,
    );
    transition.selectedPlanet.setScale(
      THREE.MathUtils.lerp(transition.startScale, 1, eased),
    );
    transition.selectedPlanet.setSelectedGlowFactor(1 - eased);
    this.planets.forEach((planet) => {
      if (planet === transition.selectedPlanet) return;
      planet.setBrightness(
        THREE.MathUtils.lerp(sceneConfig.explore.backgroundPlanetBrightness, 1, eased),
      );
      planet.setScale(
        THREE.MathUtils.lerp(sceneConfig.explore.backgroundPlanetScale, 1, eased),
      );
    });

    if (progress === 1) {
      transition.selectedPlanet.setSelectedGlowFactor(0);
      transition.selectedPlanet.setSelected(false);
      this.planets.forEach((planet) => {
        planet.setOpacity(1);
        planet.setBrightness(1);
        planet.setScale(1);
      });
      const resolve = transition.resolve;
      this.returnTransition = null;
      this.selectedPlanet = null;
      this.focusBaseScale = 1;
      resolve();
    }
  }

  updateFocusTransition(deltaTime) {
    if (!this.focusTransition) return;

    const transition = this.focusTransition;
    transition.elapsed += deltaTime;
    const progress = Math.min(
      transition.elapsed / sceneConfig.explore.transitionDuration,
      1,
    );
    const eased = 1 - Math.pow(1 - progress, 3);

    transition.selectedPlanet.group.position.lerpVectors(
      transition.startPosition,
      transition.targetPosition,
      eased,
    );
    transition.selectedPlanet.setScale(
      THREE.MathUtils.lerp(transition.startScale, transition.targetScale, eased),
    );
    this.planets.forEach((planet) => {
      if (planet.id === transition.planetId) {
        planet.setBrightness(1);
        return;
      }

      planet.setOpacity(1);
      planet.setBrightness(
        THREE.MathUtils.lerp(
          1,
          sceneConfig.explore.backgroundPlanetBrightness,
          eased,
        ),
      );
      planet.setScale(
        THREE.MathUtils.lerp(
          1,
          sceneConfig.explore.backgroundPlanetScale,
          eased,
        ),
      );
    });

    if (progress === 1) {
      const resolve = transition.resolve;
      this.focusTransition = null;
      resolve(transition.selectedPlanet);
    }
  }

  dispose() {
    this.planets.forEach((planet) => planet.dispose());
    this.planets.clear();
    this.solarSystemGroup.removeFromParent();
  }
}
