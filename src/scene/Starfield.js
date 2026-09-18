import * as THREE from 'three';

const starVertexShader = `
  attribute float starSize;
  attribute float phase;
  attribute float intensity;
  attribute vec3 starColor;
  uniform float time;
  uniform float brightness;
  varying float pointBrightness;
  varying vec3 pointColor;

  void main() {
    vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);
    float twinkle = 0.96 + 0.04 * sin(time * 0.2 + phase);
    pointBrightness = intensity * brightness * twinkle;
    pointColor = starColor;
    gl_PointSize = starSize * (190.0 / max(-viewPosition.z, 1.0));
    gl_Position = projectionMatrix * viewPosition;
  }
`;

const starFragmentShader = `
  varying float pointBrightness;
  varying vec3 pointColor;
  void main() {
    float radius = distance(gl_PointCoord, vec2(0.5));
    float disc = 1.0 - smoothstep(0.08, 0.5, radius);
    gl_FragColor = vec4(pointColor, disc * pointBrightness);
  }
`;

const dustVertexShader = `
  varying vec3 direction;
  void main() {
    direction = normalize(position);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const dustFragmentShader = `
  varying vec3 direction;
  uniform float time;
  uniform vec3 bandNormal;
  uniform float milkyWayOpacity;
  uniform float milkyWayWidth;
  uniform float dustBrightness;
  uniform float dustSaturation;
  uniform float dustContrast;
  uniform float darkLaneStrength;
  uniform float fineNoiseStrength;
  uniform float coreBrightness;

  float hash(vec3 p) {
    p = fract(p * 0.3183099 + 0.12);
    p *= 17.0;
    return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
  }

  float noise(vec3 p) {
    vec3 i = floor(p);
    vec3 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(mix(hash(i), hash(i + vec3(1,0,0)), f.x),
          mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),
      mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x),
          mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y),
      f.z
    );
  }

  float fbm(vec3 p) {
    float result = 0.0;
    float amplitude = 0.52;
    for (int octave = 0; octave < 6; octave++) {
      result += noise(p) * amplitude;
      p = p * 2.03 + vec3(2.7, 1.9, 3.4);
      amplitude *= 0.5;
    }
    return result;
  }

  void main() {
    vec3 p = normalize(direction);
    vec3 tangent = normalize(cross(bandNormal, vec3(0.0, 0.0, 1.0)));
    vec3 drift = vec3(time * 0.00032, -time * 0.00019, time * 0.00013);
    float broad = fbm(p * 2.5 + drift);
    float distortedDistance = abs(dot(p, bandNormal) + (broad - 0.5) * 0.17);
    float edge = milkyWayWidth * (0.72 + broad * 0.56);
    float band = 1.0 - smoothstep(edge * 0.25, edge, distortedDistance);
    float core = 1.0 - smoothstep(0.018, edge * 0.48, distortedDistance);

    float medium = fbm(p * 9.0 - drift * 0.6);
    float fine = fbm(p * 27.0 + drift * 0.32);
    float micro = fbm(p * 61.0 - drift * 0.18);
    float grain = mix(medium, fine * 0.68 + micro * 0.32, fineNoiseStrength);
    float mottledClouds = pow(smoothstep(0.39, 0.73, grain), dustContrast);

    float along = dot(p, tangent);
    float primaryCore = exp(-pow((along + 0.30) * 4.0, 2.0));
    float secondaryCore = exp(-pow((along - 0.46) * 8.0, 2.0)) * 0.34;
    float localCores = primaryCore + secondaryCore;

    float broadLane = core * smoothstep(0.43, 0.72, fbm(p * 12.0 + 4.7));
    float filamentNoise = abs(fbm(p * 35.0 - 6.2) - 0.52);
    float filaments = band * (1.0 - smoothstep(0.018, 0.095, filamentNoise));
    float brokenPatches = band * smoothstep(0.61, 0.80, fbm(p * 18.0 + 9.1));
    float darkLanes = clamp(
      broadLane * 0.72 + filaments * 0.9 + brokenPatches * 0.34,
      0.0,
      1.0
    );

    float luminous = band * mottledClouds * (0.38 + localCores * coreBrightness);
    luminous *= 1.0 - clamp(darkLanes * darkLaneStrength, 0.0, 0.96);

    vec3 coolGray = vec3(0.22, 0.24, 0.28);
    vec3 dustyWhite = vec3(0.48, 0.46, 0.42);
    vec3 beige = vec3(0.36, 0.28, 0.21);
    vec3 mauveGray = vec3(0.22, 0.18, 0.22);
    float warmField = smoothstep(0.48, 0.78, fbm(p * 4.2 + 7.0));
    float mauveField = smoothstep(0.56, 0.82, fbm(p * 5.7 - 3.0));
    vec3 neutralDust = mix(coolGray, dustyWhite, localCores * 0.48);
    vec3 coloredDust = mix(neutralDust, beige, warmField * 0.42);
    coloredDust = mix(coloredDust, mauveGray, mauveField * 0.20);
    vec3 grayDust = vec3(dot(coloredDust, vec3(0.333)));
    vec3 color = mix(grayDust, coloredDust, dustSaturation);

    float alpha = luminous * milkyWayOpacity;
    gl_FragColor = vec4(color * dustBrightness, alpha);
  }
`;

function createSeededRandom(seed) {
  let value = seed;
  return () => {
    value = (value * 1664525 + 1013904223) % 4294967296;
    return value / 4294967296;
  };
}

function getBandAxes(angleDegrees) {
  const angle = THREE.MathUtils.degToRad(angleDegrees);
  return {
    tangent: new THREE.Vector3(Math.cos(angle), Math.sin(angle), 0),
    normal: new THREE.Vector3(-Math.sin(angle), Math.cos(angle), 0),
    depthAxis: new THREE.Vector3(0, 0, 1),
  };
}

function createStarMaterial(brightness) {
  return new THREE.ShaderMaterial({
    uniforms: { time: { value: 0 }, brightness: { value: brightness } },
    vertexShader: starVertexShader,
    fragmentShader: starFragmentShader,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
}

function createStarGeometry({ count, random, minRadius, maxRadius, band }) {
  const positions = new Float32Array(count * 3);
  const sizes = new Float32Array(count);
  const phases = new Float32Array(count);
  const intensities = new Float32Array(count);
  const colors = new Float32Array(count * 3);
  const direction = new THREE.Vector3();
  const palette = [
    new THREE.Color(0xd9e7ff),
    new THREE.Color(0xf2f2ed),
    new THREE.Color(0xffedc8),
    new THREE.Color(0xb8c9e5),
  ];

  for (let index = 0; index < count; index += 1) {
    const radius = THREE.MathUtils.lerp(minRadius, maxRadius, random());
    if (band) {
      const angle = random() * Math.PI * 2;
      const spread = (random() + random() + random() - 1.5) * band.width;
      direction
        .copy(band.tangent)
        .multiplyScalar(Math.cos(angle))
        .addScaledVector(band.depthAxis, Math.sin(angle))
        .addScaledVector(band.normal, spread)
        .normalize();
    } else {
      const longitude = random() * Math.PI * 2;
      const latitude = Math.acos(2 * random() - 1);
      direction.set(
        Math.sin(latitude) * Math.cos(longitude),
        Math.cos(latitude),
        Math.sin(latitude) * Math.sin(longitude),
      );
    }

    const offset = index * 3;
    positions[offset] = direction.x * radius;
    positions[offset + 1] = direction.y * radius;
    positions[offset + 2] = direction.z * radius;
    const brightStar = random() > (band ? 0.997 : 0.994);
    sizes[index] = brightStar
      ? THREE.MathUtils.lerp(1.8, 3.0, random())
      : THREE.MathUtils.lerp(band ? 0.48 : 0.48, band ? 1.32 : 1.35, random());
    intensities[index] = brightStar
      ? THREE.MathUtils.lerp(0.72, 1.0, random())
      : THREE.MathUtils.lerp(band ? 0.30 : 0.28, band ? 0.70 : 0.68, random());
    phases[index] = random() * Math.PI * 2;
    const color = palette[Math.floor(random() * palette.length)];
    colors[offset] = color.r;
    colors[offset + 1] = color.g;
    colors[offset + 2] = color.b;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('starSize', new THREE.BufferAttribute(sizes, 1));
  geometry.setAttribute('phase', new THREE.BufferAttribute(phases, 1));
  geometry.setAttribute('intensity', new THREE.BufferAttribute(intensities, 1));
  geometry.setAttribute('starColor', new THREE.BufferAttribute(colors, 3));
  return geometry;
}

export class Starfield {
  constructor(config) {
    this.config = config;
    this.group = new THREE.Group();
    this.layers = [];
    this.dust = null;
    this.dustMaterial = null;
  }

  create() {
    const axes = getBandAxes(this.config.milkyWay.angle);
    const baseStars = new THREE.Points(
      createStarGeometry({
        count: this.config.count,
        random: createSeededRandom(528),
        minRadius: this.config.minRadius,
        maxRadius: this.config.maxRadius,
      }),
      createStarMaterial(this.config.starBrightness),
    );
    baseStars.name = 'base-starfield';

    const milkyWayCount = Math.round(9000 * this.config.milkyWay.starDensity);
    const milkyWayStars = new THREE.Points(
      createStarGeometry({
        count: milkyWayCount,
        random: createSeededRandom(1729),
        minRadius: this.config.minRadius + 2,
        maxRadius: this.config.maxRadius,
        band: { ...axes, width: this.config.milkyWay.width },
      }),
      createStarMaterial(this.config.starBrightness * 0.92),
    );
    milkyWayStars.name = 'milky-way-stars';

    this.dustMaterial = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        bandNormal: { value: axes.normal },
        milkyWayOpacity: { value: this.config.milkyWay.opacity },
        milkyWayWidth: { value: this.config.milkyWay.width },
        dustBrightness: { value: this.config.milkyWay.dustBrightness },
        dustSaturation: { value: this.config.milkyWay.dustSaturation },
        dustContrast: { value: this.config.milkyWay.dustContrast },
        darkLaneStrength: { value: this.config.milkyWay.darkLaneStrength },
        fineNoiseStrength: { value: this.config.milkyWay.fineNoiseStrength },
        coreBrightness: { value: this.config.milkyWay.coreBrightness },
      },
      vertexShader: dustVertexShader,
      fragmentShader: dustFragmentShader,
      side: THREE.BackSide,
      transparent: true,
      depthWrite: false,
      blending: THREE.NormalBlending,
    });
    this.dust = new THREE.Mesh(
      new THREE.SphereGeometry(this.config.maxRadius + 8, 56, 32),
      this.dustMaterial,
    );
    this.dust.name = 'milky-way-dust';
    this.dust.renderOrder = -2;
    baseStars.renderOrder = -1;
    milkyWayStars.renderOrder = 0;
    baseStars.frustumCulled = false;
    milkyWayStars.frustumCulled = false;

    this.layers = [baseStars, milkyWayStars];
    this.group.name = 'space-background';
    this.group.add(this.dust, baseStars, milkyWayStars);
    return this.group;
  }

  update(deltaTime) {
    const animatedDelta = deltaTime * this.config.milkyWay.animationSpeed;
    this.layers.forEach((layer) => {
      layer.material.uniforms.time.value += animatedDelta;
    });
    this.dustMaterial.uniforms.time.value += animatedDelta;
    this.group.rotation.y += this.config.driftSpeed * deltaTime;
  }

  dispose() {
    this.layers.forEach((layer) => {
      layer.geometry.dispose();
      layer.material.dispose();
    });
    this.dust?.geometry.dispose();
    this.dustMaterial?.dispose();
    this.group.removeFromParent();
  }
}
