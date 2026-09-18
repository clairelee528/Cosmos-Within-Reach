import * as THREE from 'three';

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
    this.orbitAngle = data.scene.initialAngle;
    this.isHovered = false;
    this.isSelected = false;
    this.defaultScale = 1;
    this.currentScale = 1;
    this.loadedTextures = new Set();
    this.isDisposed = false;
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
    if (!this.mesh || this.isSelected) {
      return;
    }

    // Configured rotation speeds were authored per frame at roughly 60 FPS.
    this.visualGroup.rotation.y +=
      this.data.scene.rotationSpeed * deltaTime * 60;

    if (this.cloudMesh) {
      this.cloudMesh.rotation.y +=
        this.data.scene.clouds.rotationSpeed * deltaTime * 60;
    }

    this.orbitAngle += this.data.scene.orbitSpeed * deltaTime;
    this.updateOrbitPosition();
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
  }

  setScale(value) {
    this.currentScale = value;
    this.group.scale.setScalar(value);
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
