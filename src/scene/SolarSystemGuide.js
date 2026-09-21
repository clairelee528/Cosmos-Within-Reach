import * as THREE from 'three';
import { getOrbitPosition } from './orbitMath.js';

const textureLoader = new THREE.TextureLoader();

const vertexShader = `
  varying vec2 vUv;
  varying vec3 vNormal;

  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  uniform float uTime;
  uniform float uBrightness;
  uniform sampler2D uSurface;
  varying vec2 vUv;
  varying vec3 vNormal;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
      mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0)), f.x), f.y);
  }

  float fbm(vec2 p) {
    float value = 0.0;
    float amplitude = 0.55;
    for (int i = 0; i < 4; i++) {
      value += amplitude * noise(p);
      p = p * 2.03 + 7.17;
      amplitude *= 0.48;
    }
    return value;
  }

  void main() {
    float facing = max(dot(vNormal, vec3(0.0, 0.0, 1.0)), 0.0);
    float limb = pow(facing, 0.24);
    vec3 surface = texture2D(uSurface, vUv).rgb;
    float fineVariation = fbm(vUv * vec2(18.0, 9.0) + uTime * 0.002);
    vec3 color = surface * mix(0.93, 1.05, fineVariation);
    color *= mix(0.68, 1.0, limb) * uBrightness;
    gl_FragColor = vec4(color, 1.0);
  }
`;

/** Draws the restrained Sun and compressed orbital guides. */
export class SolarSystemGuide {
  constructor({ config, planetData }) {
    this.config = config;
    this.planetData = planetData;
    this.group = new THREE.Group();
    this.sunMesh = null;
    this.glowSprite = null;
    this.orbitMaterials = [];
    this.uniforms = null;
    this.exploreTarget = 0;
    this.exploreProgress = 0;
    this.glowTexture = null;
    this.surfaceTexture = null;
    this.fallbackSurfaceTexture = null;
  }

  create() {
    this.group.name = 'solar-system-guide';
    this.group.position.y = this.config.verticalOffset;
    this.createOrbits();
    this.createSun();
    return this.group;
  }

  createOrbits() {
    this.planetData.forEach((planet, index) => {
      const points = [];
      const segments = 192;
      for (let step = 0; step < segments; step += 1) {
        const angle = (step / segments) * Math.PI * 2;
        points.push(
          getOrbitPosition(
            angle,
            planet.scene.orbitRadius,
            this.config.orbitInclination,
          ),
        );
      }
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const material = new THREE.LineBasicMaterial({
        color: 0xc0c4ca,
        transparent: true,
        opacity: this.config.orbitOpacity,
        depthWrite: false,
      });
      const orbit = new THREE.LineLoop(geometry, material);
      orbit.name = `orbit-${planet.id}`;
      this.group.add(orbit);
      this.orbitMaterials.push(material);
    });
  }

  createSun() {
    const { sun } = this.config;
    this.fallbackSurfaceTexture = new THREE.DataTexture(
      new Uint8Array([255, 168, 45, 255]),
      1,
      1,
    );
    this.fallbackSurfaceTexture.colorSpace = THREE.SRGBColorSpace;
    this.fallbackSurfaceTexture.needsUpdate = true;
    this.uniforms = {
      uTime: { value: 0 },
      uBrightness: { value: sun.brightness },
      uSurface: { value: this.fallbackSurfaceTexture },
    };
    const geometry = new THREE.SphereGeometry(sun.radius, 64, 64);
    const material = new THREE.ShaderMaterial({
      uniforms: this.uniforms,
      vertexShader,
      fragmentShader,
    });
    this.sunMesh = new THREE.Mesh(geometry, material);
    this.sunMesh.name = 'sun';
    this.sunMesh.position.z = 0.05;
    this.group.add(this.sunMesh);

    if (typeof document === 'undefined') return;
    textureLoader.load(
      sun.texture,
      (texture) => {
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.anisotropy = 4;
        texture.wrapS = THREE.RepeatWrapping;
        this.surfaceTexture = texture;
        this.uniforms.uSurface.value = texture;
      },
      undefined,
      () => {
        console.warn('Sun texture unavailable; using the fallback surface.');
      },
    );
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const context = canvas.getContext('2d');
    const gradient = context.createRadialGradient(128, 128, 46, 128, 128, 128);
    gradient.addColorStop(0, 'rgba(255, 225, 145, 0)');
    gradient.addColorStop(0.1, 'rgba(255, 220, 125, 0.24)');
    gradient.addColorStop(0.22, 'rgba(255, 195, 76, 0.62)');
    gradient.addColorStop(0.55, 'rgba(255, 152, 42, 0.25)');
    gradient.addColorStop(1, 'rgba(255, 110, 25, 0)');
    context.fillStyle = gradient;
    context.fillRect(0, 0, 256, 256);
    this.glowTexture = new THREE.CanvasTexture(canvas);
    const glowMaterial = new THREE.SpriteMaterial({
      map: this.glowTexture,
      color: 0xffc26a,
      transparent: true,
      opacity: sun.glowOpacity,
      depthTest: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    this.glowSprite = new THREE.Sprite(glowMaterial);
    const diameter = sun.radius * sun.glowScale;
    this.glowSprite.scale.set(diameter, diameter, 1);
    this.glowSprite.position.z = -0.05;
    this.glowSprite.renderOrder = 1;
    this.group.add(this.glowSprite);
  }

  setExploring(value) {
    this.exploreTarget = value ? 1 : 0;
  }

  update(deltaTime) {
    const { sun } = this.config;
    this.exploreProgress = THREE.MathUtils.damp(
      this.exploreProgress,
      this.exploreTarget,
      4.5,
      deltaTime,
    );
    this.uniforms.uTime.value += deltaTime;
    this.sunMesh.rotation.y += sun.rotationSpeed * deltaTime * 60;
    this.uniforms.uBrightness.value = THREE.MathUtils.lerp(
      sun.brightness,
      sun.exploreBrightness,
      this.exploreProgress,
    );
    const scale = THREE.MathUtils.lerp(1, sun.exploreScale, this.exploreProgress);
    this.sunMesh.scale.setScalar(scale);
    if (this.glowSprite) {
      this.glowSprite.material.opacity = THREE.MathUtils.lerp(
        sun.glowOpacity,
        sun.glowOpacity * 0.35,
        this.exploreProgress,
      );
    }
    this.orbitMaterials.forEach((material, index) => {
      const baseOpacity = this.config.orbitOpacity;
      material.opacity = THREE.MathUtils.lerp(
        baseOpacity,
        baseOpacity * 0.22,
        this.exploreProgress,
      );
    });
  }

  dispose() {
    this.glowTexture?.dispose();
    this.surfaceTexture?.dispose();
    this.fallbackSurfaceTexture?.dispose();
    this.group.traverse((object) => {
      object.geometry?.dispose();
      object.material?.dispose();
    });
    this.group.removeFromParent();
  }
}
