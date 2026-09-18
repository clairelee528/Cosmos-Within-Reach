import * as THREE from 'three';
import { Planet } from './Planet.js';

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
  }

  getById(planetId) {
    return this.planets.get(planetId) ?? null;
  }

  getAll() {
    return [...this.planets.values()];
  }

  getInteractiveMeshes() {
    return this.getAll()
      .map((planet) => planet.mesh)
      .filter(Boolean);
  }

  dispose() {
    this.planets.forEach((planet) => planet.dispose());
    this.planets.clear();
    this.solarSystemGroup.removeFromParent();
  }
}

