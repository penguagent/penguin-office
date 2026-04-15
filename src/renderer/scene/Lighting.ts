import * as THREE from 'three';

export function createLighting(scene: THREE.Scene) {
  const ambient = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambient);

  const directional = new THREE.DirectionalLight(0xfff5e6, 0.8);
  directional.position.set(15, 25, 15);
  directional.castShadow = true;
  directional.shadow.mapSize.width = 2048;
  directional.shadow.mapSize.height = 2048;
  directional.shadow.camera.near = 0.5;
  directional.shadow.camera.far = 100;
  directional.shadow.camera.left = -25;
  directional.shadow.camera.right = 25;
  directional.shadow.camera.top = 25;
  directional.shadow.camera.bottom = -25;
  scene.add(directional);

  const fill = new THREE.DirectionalLight(0xb0c4de, 0.3);
  fill.position.set(-10, 15, -10);
  scene.add(fill);
}
