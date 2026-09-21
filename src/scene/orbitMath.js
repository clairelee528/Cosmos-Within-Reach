import * as THREE from 'three';

/** Returns a point on the shared circular orbit plane, viewed at an angle. */
export function getOrbitPosition(
  orbitAngle,
  orbitRadius,
  inclinationDegrees,
  target = new THREE.Vector3(),
) {
  const inclination = THREE.MathUtils.degToRad(inclinationDegrees);
  const sinAngle = Math.sin(orbitAngle);

  return target.set(
    Math.cos(orbitAngle) * orbitRadius,
    sinAngle * orbitRadius * Math.cos(inclination),
    -sinAngle * orbitRadius * Math.sin(inclination),
  );
}
