import * as THREE from 'three';
import { sceneConfig } from '../config/sceneConfig.js';

/**
 * Owns the Three.js scene, camera, renderer, and animation loop.
 * Input: a host HTML element. Output: a rendered and continuously updated scene.
 */
export class SceneManager {
  constructor({ container }) {
    if (!(container instanceof HTMLElement)) {
      throw new Error('SceneManager requires a valid container element.');
    }

    this.container = container;
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.testSphere = null;
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
    this.createTestSphere();
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

  createTestSphere() {
    const geometry = new THREE.SphereGeometry(1.7, 64, 64);
    const material = new THREE.MeshStandardMaterial({
      color: sceneConfig.testSphere.color,
      roughness: 0.52,
      metalness: 0.08,
    });

    const sphereMesh = new THREE.Mesh(geometry, material);

    const gridGeometry = new THREE.SphereGeometry(1.71, 16, 10);
    const gridMaterial = new THREE.MeshBasicMaterial({
      color: sceneConfig.testSphere.gridColor,
      transparent: true,
      opacity: 0.24,
      wireframe: true,
    });
    const gridMesh = new THREE.Mesh(gridGeometry, gridMaterial);

    const markerGeometry = new THREE.SphereGeometry(0.13, 24, 24);
    const markerMaterial = new THREE.MeshStandardMaterial({
      color: sceneConfig.testSphere.markerColor,
      emissive: sceneConfig.testSphere.markerColor,
      emissiveIntensity: 0.45,
    });
    const marker = new THREE.Mesh(markerGeometry, markerMaterial);
    marker.position.set(1.55, 0.55, 0.42);

    this.testSphere = new THREE.Group();
    this.testSphere.add(sphereMesh, gridMesh, marker);
    this.testSphere.rotation.x = 0.2;
    this.scene.add(this.testSphere);
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
    if (!this.testSphere) {
      return;
    }

    this.testSphere.rotation.y += deltaTime * 0.35;
    this.testSphere.rotation.x += deltaTime * 0.08;
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
    this.testSphere?.traverse((object) => {
      object.geometry?.dispose();

      if (Array.isArray(object.material)) {
        object.material.forEach((material) => material.dispose());
      } else {
        object.material?.dispose();
      }
    });
    this.renderer?.dispose();
    this.renderer?.domElement.remove();
  }
}
