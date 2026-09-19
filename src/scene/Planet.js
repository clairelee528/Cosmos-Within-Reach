import * as THREE from 'three';
import { sceneConfig } from '../config/sceneConfig.js';

const textureLoader = new THREE.TextureLoader();

/**
 * Owns the visual state and animation of one planet.
 * Input: one static planet data object. Output: a Three.js group and mesh.
 */
export class Planet {
  constructor(data) {
    this.data = data;
    this.id = data.id;
    this.group = new THREE.Group();
    this.visualGroup = new THREE.Group();
    this.mesh = null;
    this.cloudMesh = null;
    this.ringMesh = null;
    this.hitAreaMesh = null;
    this.glowSprite = null;
    this.hoverProgress = 0;
    this.orbitAngle = data.scene.initialAngle;
    this.isHovered = false;
    this.isSelected = false;
    this.selectedGlowFactor = 1;
    this.defaultScale = 1;
    this.currentScale = 1;
    this.loadedTextures = new Set();
    this.isDisposed = false;
    this.materialStates = new Map();
  }

  create() {
    const geometry = new THREE.SphereGeometry(this.data.scene.radius, 48, 48);
    const material = new THREE.MeshStandardMaterial({
      color: this.data.scene.fallbackColor,
      roughness: 0.72,
      metalness: 0.02,
    });

    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.name = `planet-${this.id}`;
    this.mesh.userData.planetId = this.id;
    this.group.name = `planet-group-${this.id}`;
    this.group.userData.planetId = this.id;
    this.visualGroup.name = `planet-visual-${this.id}`;
    this.visualGroup.add(this.mesh);
    this.group.add(this.visualGroup);
    this.createHitArea();
    this.createHoverGlow();
    this.loadSurfaceTexture(material);

    if (this.data.scene.clouds) {
      this.createCloudLayer();
    }

    if (this.data.scene.ring) {
      this.visualGroup.rotation.z = THREE.MathUtils.degToRad(26.7);
      this.createRing();
    }

    this.updateOrbitPosition();

    return this.group;
  }

  createHitArea() {
    const radius = Math.max(
      this.data.scene.radius * sceneConfig.interaction.hitAreaScale,
      sceneConfig.interaction.minimumHitRadius,
    );
    const geometry = new THREE.SphereGeometry(radius, 16, 12);
    const material = new THREE.MeshBasicMaterial({
      transparent: true,
      opacity: 0,
      depthWrite: false,
      colorWrite: false,
    });

    this.hitAreaMesh = new THREE.Mesh(geometry, material);
    this.hitAreaMesh.name = `planet-hit-area-${this.id}`;
    this.hitAreaMesh.userData.planetId = this.id;
    this.group.add(this.hitAreaMesh);
  }

  createHoverGlow() {
    if (typeof document === 'undefined') return;

    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const context = canvas.getContext('2d');
    const gradient = context.createRadialGradient(64, 64, 28, 64, 64, 64);
    gradient.addColorStop(0, 'rgba(140, 190, 255, 0)');
    gradient.addColorStop(0.48, 'rgba(140, 190, 255, 0.28)');
    gradient.addColorStop(0.72, 'rgba(105, 165, 255, 0.14)');
    gradient.addColorStop(1, 'rgba(75, 130, 255, 0)');
    context.fillStyle = gradient;
    context.fillRect(0, 0, 128, 128);

    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      depthTest: false,
      blending: THREE.AdditiveBlending,
    });
    const diameter = this.data.scene.radius * 3.1;
    this.glowSprite = new THREE.Sprite(material);
    this.glowSprite.name = `planet-hover-glow-${this.id}`;
    this.glowSprite.scale.set(diameter, diameter, 1);
    this.glowSprite.renderOrder = 2;
    this.group.add(this.glowSprite);
    this.loadedTextures.add(texture);
  }

  createCloudLayer() {
    const {
      texture: texturePath,
      scale = 1.015,
      opacity = 0.8,
    } = this.data.scene.clouds;
    const geometry = new THREE.SphereGeometry(
      this.data.scene.radius * scale,
      64,
      64,
    );
    const material = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      transparent: true,
      opacity,
      alphaTest: 0.02,
      depthWrite: false,
      roughness: 0.9,
      metalness: 0,
    });

    this.cloudMesh = new THREE.Mesh(geometry, material);
    this.cloudMesh.name = `planet-clouds-${this.id}`;
    this.cloudMesh.userData.planetId = this.id;
    this.cloudMesh.renderOrder = 1;
    this.visualGroup.add(this.cloudMesh);

    if (typeof document === 'undefined') {
      return;
    }

    textureLoader.load(
      texturePath,
      (texture) => {
        if (this.isDisposed) {
          texture.dispose();
          return;
        }

        texture.colorSpace = THREE.SRGBColorSpace;
        texture.anisotropy = 4;
        material.map = texture;
        material.needsUpdate = true;
        this.loadedTextures.add(texture);
      },
      undefined,
      () => {
        console.warn(`Cloud texture unavailable for ${this.id}.`);
      },
    );
  }

  loadSurfaceTexture(material) {
    if (typeof document === 'undefined') {
      return;
    }

    textureLoader.load(
      this.data.texture,
      (texture) => {
        if (this.isDisposed) {
          texture.dispose();
          return;
        }

        texture.colorSpace = THREE.SRGBColorSpace;
        texture.anisotropy = 4;
        material.map = texture;
        material.color.set(0xffffff);
        material.needsUpdate = true;
        this.loadedTextures.add(texture);
      },
      undefined,
      () => {
        console.warn(
          `Texture unavailable for ${this.id}; using the fallback material.`,
        );
      },
    );
  }

  createRing() {
    const { innerRadius, outerRadius, texture: texturePath } =
      this.data.scene.ring;
    const geometry = new THREE.RingGeometry(innerRadius, outerRadius, 128, 1);

    // RingGeometry's default UVs are planar. Convert the radial distance into
    // the horizontal coordinate expected by the thin ring texture strip.
    const positions = geometry.attributes.position;
    const uvs = geometry.attributes.uv;
    const radialSpan = outerRadius - innerRadius;

    for (let index = 0; index < positions.count; index += 1) {
      const radius = Math.hypot(positions.getX(index), positions.getY(index));
      uvs.setXY(index, (radius - innerRadius) / radialSpan, 0.5);
    }

    const material = new THREE.MeshStandardMaterial({
      color: 0xc9b98f,
      opacity: 0.48,
      transparent: true,
      alphaTest: 0.02,
      depthWrite: false,
      side: THREE.DoubleSide,
      roughness: 0.82,
      metalness: 0,
    });

    this.ringMesh = new THREE.Mesh(geometry, material);
    this.ringMesh.name = `planet-ring-${this.id}`;
    this.ringMesh.userData.planetId = this.id;
    // Keep the ring visibly elliptical from the overview camera instead of
    // turning it completely edge-on.
    this.ringMesh.rotation.x = THREE.MathUtils.degToRad(68);
    this.visualGroup.add(this.ringMesh);

    if (typeof document === 'undefined') {
      return;
    }

    textureLoader.load(
      texturePath,
      (texture) => {
        if (this.isDisposed) {
          texture.dispose();
          return;
        }

        texture.colorSpace = THREE.SRGBColorSpace;
        material.map = texture;
        material.alphaMap = texture;
        material.color.set(0xffffff);
        material.opacity = 0.92;
        material.needsUpdate = true;
        this.loadedTextures.add(texture);
      },
      undefined,
      () => {
        console.warn(
          `Ring texture unavailable for ${this.id}; using the fallback ring.`,
        );
      },
    );
  }

  update(deltaTime) {
    if (!this.mesh) {
      return;
    }

    this.updateHoverFeedback(deltaTime);

    // Configured rotation speeds were authored per frame at roughly 60 FPS.
    const rotationScale = this.isSelected
      ? sceneConfig.explore.selectedRotationScale
      : 1;
    this.visualGroup.rotation.y +=
      this.data.scene.rotationSpeed * rotationScale * deltaTime * 60;

    if (this.cloudMesh) {
      this.cloudMesh.rotation.y +=
        this.data.scene.clouds.rotationSpeed * deltaTime * 60;
    }

    // A selected planet remains visually alive, but its orbital position is
    // locked while it is being inspected.
    if (this.isSelected) return;

    this.orbitAngle += this.data.scene.orbitSpeed * deltaTime;
    this.updateOrbitPosition();
  }

  updateHoverFeedback(deltaTime) {
    // Keep the same soft blue feedback visible while a planet is selected.
    const target = this.isHovered
      ? 1
      : this.isSelected
        ? this.selectedGlowFactor
        : 0;
    this.hoverProgress = THREE.MathUtils.damp(
      this.hoverProgress,
      target,
      9,
      deltaTime,
    );
    const hoverScale = THREE.MathUtils.lerp(
      1,
      sceneConfig.hoverScale,
      this.hoverProgress,
    );
    this.visualGroup.scale.setScalar(hoverScale);

    if (this.glowSprite) {
      const glowOpacity = this.isHovered ? 0.8 : 0.58;
      const glowDiameterScale = this.isHovered ? 3.1 : 2.8;
      this.glowSprite.material.opacity = this.hoverProgress * glowOpacity;
      const pulseScale = 1 + this.hoverProgress * 0.08;
      const diameter =
        this.data.scene.radius * glowDiameterScale * pulseScale;
      this.glowSprite.scale.set(diameter, diameter, 1);
    }
  }

  updateOrbitPosition() {
    const { orbitRadius } = this.data.scene;
    const x = Math.cos(this.orbitAngle) * orbitRadius;
    const y = Math.sin(this.orbitAngle) * orbitRadius * 0.46;
    const z = Math.sin(this.orbitAngle) * 0.7;

    this.group.position.set(x, y, z);
  }

  setHovered(value) {
    this.isHovered = value;
  }

  setSelected(value) {
    this.isSelected = value;
    if (value) this.selectedGlowFactor = 1;
  }

  setSelectedGlowFactor(value) {
    this.selectedGlowFactor = THREE.MathUtils.clamp(value, 0, 1);

    if (this.selectedGlowFactor === 0 && !this.isHovered && this.glowSprite) {
      this.hoverProgress = 0;
      this.glowSprite.material.opacity = 0;
    }
  }

  setScale(value) {
    this.currentScale = value;
    this.group.scale.setScalar(value);
  }

  setOpacity(factor) {
    this.visualGroup.traverse((object) => {
      if (!object.material || object === this.glowSprite) return;
      const materials = Array.isArray(object.material)
        ? object.material
        : [object.material];

      materials.forEach((material) => {
        if (!this.materialStates.has(material)) {
          this.materialStates.set(material, {
            opacity: material.opacity,
            transparent: material.transparent,
            depthWrite: material.depthWrite,
            color: material.color?.clone() ?? null,
          });
        }
        const initial = this.materialStates.get(material);
        material.opacity = initial.opacity * factor;
        material.transparent = initial.transparent || factor < 0.999;
        material.depthWrite = factor < 0.999 ? false : initial.depthWrite;
        material.needsUpdate = true;
      });
    });
  }

  setBrightness(factor) {
    this.visualGroup.traverse((object) => {
      if (!object.material || object === this.glowSprite) return;
      const materials = Array.isArray(object.material)
        ? object.material
        : [object.material];

      materials.forEach((material) => {
        if (!material.color) return;
        if (!this.materialStates.has(material)) {
          this.materialStates.set(material, {
            opacity: material.opacity,
            transparent: material.transparent,
            depthWrite: material.depthWrite,
            color: material.color.clone(),
          });
        }
        const initialColor = this.materialStates.get(material).color;
        if (!initialColor) return;
        material.color.copy(initialColor).multiplyScalar(factor);
      });
    });
  }

  rotate(deltaX, deltaY) {
    if (!this.mesh) {
      return;
    }

    this.visualGroup.rotation.x += deltaY;
    this.visualGroup.rotation.y += deltaX;
  }

  dispose() {
    this.isDisposed = true;
    this.loadedTextures.forEach((texture) => texture.dispose());
    this.loadedTextures.clear();
    this.materialStates.clear();
    this.group.traverse((object) => {
      object.geometry?.dispose();

      if (Array.isArray(object.material)) {
        object.material.forEach((material) => material.dispose());
      } else {
        object.material?.dispose();
      }
    });
    this.group.removeFromParent();
  }
}
