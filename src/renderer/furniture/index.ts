import * as THREE from 'three';

const WOOD_COLOR = 0x8B6914;
const DARK_WOOD = 0x5C4033;
const METAL_COLOR = 0x708090;
const SCREEN_COLOR = 0x1a1a2e;
const SCREEN_GLOW = 0x00ff88;
const CUSHION_COLOR = 0x2c3e50;
const GREEN_FELT = 0x228B22;

function createBox(w: number, h: number, d: number, color: number): THREE.Mesh {
  const geo = new THREE.BoxGeometry(w, h, d);
  const mat = new THREE.MeshStandardMaterial({ color });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

export function createDesk(x: number, z: number): THREE.Group {
  const group = new THREE.Group();
  const top = createBox(1.8, 0.08, 1, WOOD_COLOR);
  top.position.set(0, 0.72, 0);
  group.add(top);

  const legPositions = [[-0.8, 0, -0.4], [0.8, 0, -0.4], [-0.8, 0, 0.4], [0.8, 0, 0.4]];
  legPositions.forEach(([lx, , lz]) => {
    const leg = createBox(0.06, 0.72, 0.06, METAL_COLOR);
    leg.position.set(lx!, 0.36, lz!);
    group.add(leg);
  });

  group.position.set(x, 0, z);
  return group;
}

export function createChair(x: number, z: number): THREE.Group {
  const group = new THREE.Group();
  const seat = createBox(0.5, 0.06, 0.5, CUSHION_COLOR);
  seat.position.set(0, 0.45, 0);
  group.add(seat);

  const back = createBox(0.5, 0.5, 0.06, CUSHION_COLOR);
  back.position.set(0, 0.72, -0.25);
  group.add(back);

  const base = createBox(0.06, 0.45, 0.06, METAL_COLOR);
  base.position.set(0, 0.225, 0);
  group.add(base);

  group.position.set(x, 0, z);
  return group;
}

export function createComputer(x: number, y: number, z: number): THREE.Group {
  const group = new THREE.Group();

  const screen = createBox(0.6, 0.45, 0.03, SCREEN_COLOR);
  screen.position.set(0, 0.3, 0);
  group.add(screen);

  const screenGlow = createBox(0.54, 0.39, 0.01, SCREEN_GLOW);
  screenGlow.position.set(0, 0.3, 0.02);
  group.add(screenGlow);

  const stand = createBox(0.06, 0.15, 0.06, METAL_COLOR);
  stand.position.set(0, 0.05, 0);
  group.add(stand);

  const base = createBox(0.3, 0.02, 0.2, METAL_COLOR);
  base.position.set(0, -0.02, 0.05);
  group.add(base);

  group.position.set(x, y, z);
  return group;
}

export function createCouch(x: number, z: number): THREE.Group {
  const group = new THREE.Group();
  const seat = createBox(2, 0.3, 0.8, CUSHION_COLOR);
  seat.position.set(0, 0.3, 0);
  group.add(seat);

  const back = createBox(2, 0.5, 0.15, CUSHION_COLOR);
  back.position.set(0, 0.55, -0.35);
  group.add(back);

  const armL = createBox(0.15, 0.4, 0.8, CUSHION_COLOR);
  armL.position.set(-1, 0.4, 0);
  group.add(armL);

  const armR = createBox(0.15, 0.4, 0.8, CUSHION_COLOR);
  armR.position.set(1, 0.4, 0);
  group.add(armR);

  group.position.set(x, 0, z);
  return group;
}

export function createPingPongTable(x: number, z: number): THREE.Group {
  const group = new THREE.Group();
  const top = createBox(2.5, 0.06, 1.4, GREEN_FELT);
  top.position.set(0, 0.76, 0);
  group.add(top);

  const net = createBox(0.02, 0.15, 1.4, 0xffffff);
  net.position.set(0, 0.86, 0);
  group.add(net);

  const legPositions = [[-1.1, 0, -0.6], [1.1, 0, -0.6], [-1.1, 0, 0.6], [1.1, 0, 0.6]];
  legPositions.forEach(([lx, , lz]) => {
    const leg = createBox(0.06, 0.76, 0.06, DARK_WOOD);
    leg.position.set(lx!, 0.38, lz!);
    group.add(leg);
  });

  group.position.set(x, 0, z);
  return group;
}

export function createTreadmill(x: number, z: number): THREE.Group {
  const group = new THREE.Group();
  const belt = createBox(0.6, 0.06, 1.6, 0x333333);
  belt.position.set(0, 0.15, 0);
  group.add(belt);

  const frame = createBox(0.06, 1.2, 0.06, METAL_COLOR);
  frame.position.set(-0.25, 0.6, -0.8);
  group.add(frame);

  const frame2 = createBox(0.06, 1.2, 0.06, METAL_COLOR);
  frame2.position.set(0.25, 0.6, -0.8);
  group.add(frame2);

  const handlebar = createBox(0.56, 0.04, 0.04, METAL_COLOR);
  handlebar.position.set(0, 1.2, -0.8);
  group.add(handlebar);

  const console = createBox(0.3, 0.2, 0.04, SCREEN_COLOR);
  console.position.set(0, 1.1, -0.82);
  group.add(console);

  group.position.set(x, 0, z);
  return group;
}

export function createWaterCooler(x: number, z: number): THREE.Group {
  const group = new THREE.Group();
  const body = createBox(0.35, 0.8, 0.35, 0xecf0f1);
  body.position.set(0, 0.4, 0);
  group.add(body);

  const bottle = new THREE.Mesh(
    new THREE.CylinderGeometry(0.12, 0.12, 0.4, 8),
    new THREE.MeshStandardMaterial({ color: 0x3498db, transparent: true, opacity: 0.6 }),
  );
  bottle.position.set(0, 1, 0);
  bottle.castShadow = true;
  group.add(bottle);

  group.position.set(x, 0, z);
  return group;
}

export function createPlant(x: number, z: number): THREE.Group {
  const group = new THREE.Group();
  const pot = createBox(0.3, 0.35, 0.3, 0xc0392b);
  pot.position.set(0, 0.175, 0);
  group.add(pot);

  const leaves = new THREE.Mesh(
    new THREE.ConeGeometry(0.25, 0.6, 6),
    new THREE.MeshStandardMaterial({ color: 0x27ae60 }),
  );
  leaves.position.set(0, 0.65, 0);
  leaves.castShadow = true;
  group.add(leaves);

  group.position.set(x, 0, z);
  return group;
}

export function createServerRack(x: number, z: number): THREE.Group {
  const group = new THREE.Group();
  const body = createBox(0.6, 1.8, 0.5, 0x2c3e50);
  body.position.set(0, 0.9, 0);
  group.add(body);

  for (let i = 0; i < 6; i++) {
    const led = createBox(0.04, 0.04, 0.01, i % 2 === 0 ? 0x00ff00 : 0xff6600);
    led.position.set(-0.2 + i * 0.05, 0.4 + i * 0.22, 0.26);
    group.add(led);
  }

  group.position.set(x, 0, z);
  return group;
}
