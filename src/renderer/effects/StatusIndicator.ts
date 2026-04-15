import * as THREE from 'three';
import type { AgentStatus } from '../../shared/types';

const STATUS_COLORS: Record<AgentStatus, number> = {
  idle: 0xf1c40f,
  working: 0x2ecc71,
  error: 0xe74c3c,
  offline: 0x95a5a6,
};

export class StatusIndicator {
  mesh: THREE.Mesh;
  private currentStatus: AgentStatus = 'idle';
  private pulseTime = 0;

  constructor() {
    this.mesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.08, 8, 8),
      new THREE.MeshBasicMaterial({ color: STATUS_COLORS.idle }),
    );
  }

  setStatus(status: AgentStatus) {
    this.currentStatus = status;
    (this.mesh.material as THREE.MeshBasicMaterial).color.setHex(STATUS_COLORS[status]);
  }

  update(delta: number) {
    this.pulseTime += delta;
    if (this.currentStatus === 'working') {
      const scale = 1 + Math.sin(this.pulseTime * 4) * 0.2;
      this.mesh.scale.setScalar(scale);
    } else {
      this.mesh.scale.setScalar(1);
    }
  }
}
