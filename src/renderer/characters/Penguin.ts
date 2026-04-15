import * as THREE from 'three';
import type { AgentName, PenguinState, AgentStatus } from '../../shared/types';
import { AGENT_CONFIGS } from '../../shared/constants';
import { findPath } from './Pathfinding';

export class Penguin {
  group: THREE.Group;
  name: AgentName;
  state: PenguinState = 'idle';
  status: AgentStatus = 'idle';
  gridX: number;
  gridZ: number;

  private path: { x: number; y: number }[] = [];
  private pathIndex = 0;
  private walkSpeed = 0.04;
  private animTime = 0;
  private body: THREE.Group;
  private nameSprite: THREE.Sprite;
  private statusDot: THREE.Mesh;
  private accentColor: string;
  private onArrival?: () => void;

  constructor(agentName: AgentName, startX: number, startZ: number) {
    this.name = agentName;
    this.gridX = startX;
    this.gridZ = startZ;
    this.group = new THREE.Group();
    this.accentColor = AGENT_CONFIGS[agentName].colorAccent;

    this.body = this.buildPenguinBody();
    this.group.add(this.body);

    this.nameSprite = this.createNameLabel(AGENT_CONFIGS[agentName].displayName);
    this.nameSprite.position.set(0, 2.2, 0);
    this.group.add(this.nameSprite);

    this.statusDot = new THREE.Mesh(
      new THREE.SphereGeometry(0.08, 8, 8),
      new THREE.MeshBasicMaterial({ color: 0xf1c40f }),
    );
    this.statusDot.position.set(0.6, 2.2, 0);
    this.group.add(this.statusDot);

    this.group.position.set(startX, 0, startZ);
  }

  private buildPenguinBody(): THREE.Group {
    const body = new THREE.Group();
    const accent = new THREE.Color(this.accentColor);

    // Torso (black)
    const torso = new THREE.Mesh(
      new THREE.BoxGeometry(0.5, 0.7, 0.4),
      new THREE.MeshStandardMaterial({ color: 0x1a1a1a }),
    );
    torso.position.y = 0.7;
    torso.castShadow = true;
    body.add(torso);

    // White belly
    const belly = new THREE.Mesh(
      new THREE.BoxGeometry(0.35, 0.55, 0.05),
      new THREE.MeshStandardMaterial({ color: 0xf5f5f5 }),
    );
    belly.position.set(0, 0.7, 0.21);
    body.add(belly);

    // Head
    const head = new THREE.Mesh(
      new THREE.BoxGeometry(0.45, 0.4, 0.4),
      new THREE.MeshStandardMaterial({ color: 0x1a1a1a }),
    );
    head.position.y = 1.3;
    head.castShadow = true;
    body.add(head);

    // White face
    const face = new THREE.Mesh(
      new THREE.BoxGeometry(0.32, 0.28, 0.05),
      new THREE.MeshStandardMaterial({ color: 0xf5f5f5 }),
    );
    face.position.set(0, 1.3, 0.21);
    body.add(face);

    // Eyes
    const eyeGeo = new THREE.BoxGeometry(0.06, 0.06, 0.06);
    const eyeMat = new THREE.MeshStandardMaterial({ color: 0x000000 });
    const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
    leftEye.position.set(-0.1, 1.35, 0.24);
    body.add(leftEye);

    const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
    rightEye.position.set(0.1, 1.35, 0.24);
    body.add(rightEye);

    // Beak (orange)
    const beak = new THREE.Mesh(
      new THREE.BoxGeometry(0.12, 0.06, 0.15),
      new THREE.MeshStandardMaterial({ color: 0xff8c00 }),
    );
    beak.position.set(0, 1.25, 0.28);
    body.add(beak);

    // Flippers (arms)
    const flipperMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a });
    const leftFlipper = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.5, 0.2), flipperMat);
    leftFlipper.position.set(-0.35, 0.7, 0);
    leftFlipper.name = 'leftFlipper';
    body.add(leftFlipper);

    const rightFlipper = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.5, 0.2), flipperMat);
    rightFlipper.position.set(0.35, 0.7, 0);
    rightFlipper.name = 'rightFlipper';
    body.add(rightFlipper);

    // Feet (orange)
    const footMat = new THREE.MeshStandardMaterial({ color: 0xff8c00 });
    const leftFoot = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.06, 0.25), footMat);
    leftFoot.position.set(-0.12, 0.03, 0.05);
    leftFoot.name = 'leftFoot';
    body.add(leftFoot);

    const rightFoot = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.06, 0.25), footMat);
    rightFoot.position.set(0.12, 0.03, 0.05);
    rightFoot.name = 'rightFoot';
    body.add(rightFoot);

    // Outfit accent piece (colored band around torso)
    const outfitBand = new THREE.Mesh(
      new THREE.BoxGeometry(0.52, 0.1, 0.42),
      new THREE.MeshStandardMaterial({ color: accent }),
    );
    outfitBand.position.y = 0.95;
    body.add(outfitBand);

    // Hat / accessory
    const hat = new THREE.Mesh(
      new THREE.BoxGeometry(0.48, 0.12, 0.42),
      new THREE.MeshStandardMaterial({ color: accent }),
    );
    hat.position.y = 1.56;
    body.add(hat);

    return body;
  }

  private createNameLabel(text: string): THREE.Sprite {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 64;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.roundRect(4, 4, 248, 56, 8);
    ctx.fill();

    ctx.font = 'bold 28px -apple-system, sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.fillText(text, 128, 42);

    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.SpriteMaterial({ map: texture, transparent: true });
    const sprite = new THREE.Sprite(material);
    sprite.scale.set(1.5, 0.4, 1);
    return sprite;
  }

  setStatus(status: AgentStatus) {
    this.status = status;
    const colors: Record<AgentStatus, number> = {
      idle: 0xf1c40f,
      working: 0x2ecc71,
      error: 0xe74c3c,
      offline: 0x95a5a6,
    };
    (this.statusDot.material as THREE.MeshBasicMaterial).color.setHex(colors[status]);
  }

  moveTo(targetX: number, targetZ: number, grid: boolean[][], onArrive?: () => void) {
    const path = findPath(grid, Math.round(this.gridX), Math.round(this.gridZ), Math.round(targetX), Math.round(targetZ));
    if (path.length > 1) {
      this.path = path;
      this.pathIndex = 1;
      this.state = 'walking';
      this.onArrival = onArrive;
    } else {
      onArrive?.();
    }
  }

  setState(state: PenguinState) {
    this.state = state;
  }

  update(delta: number) {
    this.animTime += delta;

    if (this.state === 'walking' && this.path.length > 0 && this.pathIndex < this.path.length) {
      const target = this.path[this.pathIndex]!;
      const dx = target.x - this.group.position.x;
      const dz = target.y - this.group.position.z;
      const dist = Math.sqrt(dx * dx + dz * dz);

      if (dist < 0.1) {
        this.gridX = target.x;
        this.gridZ = target.y;
        this.pathIndex++;
        if (this.pathIndex >= this.path.length) {
          this.path = [];
          this.state = 'idle';
          this.onArrival?.();
          this.onArrival = undefined;
        }
      } else {
        const speed = this.walkSpeed;
        this.group.position.x += (dx / dist) * speed;
        this.group.position.z += (dz / dist) * speed;

        // Face movement direction
        const angle = Math.atan2(dx, dz);
        this.body.rotation.y = angle;
      }

      // Waddle animation
      this.body.rotation.z = Math.sin(this.animTime * 8) * 0.1;
      const lFoot = this.body.getObjectByName('leftFoot');
      const rFoot = this.body.getObjectByName('rightFoot');
      if (lFoot) lFoot.position.z = 0.05 + Math.sin(this.animTime * 8) * 0.08;
      if (rFoot) rFoot.position.z = 0.05 - Math.sin(this.animTime * 8) * 0.08;
    } else if (this.state === 'typing') {
      // Typing animation - flippers move
      const lFlip = this.body.getObjectByName('leftFlipper');
      const rFlip = this.body.getObjectByName('rightFlipper');
      if (lFlip) lFlip.rotation.x = Math.sin(this.animTime * 6) * 0.3;
      if (rFlip) rFlip.rotation.x = -Math.sin(this.animTime * 6 + 1) * 0.3;
    } else if (this.state === 'exercising') {
      // Bounce up and down
      this.body.position.y = Math.abs(Math.sin(this.animTime * 4)) * 0.2;
    } else if (this.state === 'idle') {
      // Gentle sway
      this.body.rotation.z = Math.sin(this.animTime * 1.5) * 0.02;
      // Reset waddle
      const lFoot = this.body.getObjectByName('leftFoot');
      const rFoot = this.body.getObjectByName('rightFoot');
      if (lFoot) lFoot.position.z = 0.05;
      if (rFoot) rFoot.position.z = 0.05;
    }
  }
}
