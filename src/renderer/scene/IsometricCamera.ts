import * as THREE from 'three';

export class IsometricCamera {
  camera: THREE.OrthographicCamera;
  private panOffset = new THREE.Vector3(0, 0, 0);
  private zoom = 10;
  private isDragging = false;
  private lastMouse = { x: 0, y: 0 };

  constructor(private container: HTMLElement) {
    const aspect = container.clientWidth / container.clientHeight;
    this.camera = new THREE.OrthographicCamera(
      -this.zoom * aspect,
      this.zoom * aspect,
      this.zoom,
      -this.zoom,
      0.1,
      1000,
    );

    this.camera.position.set(20, 20, 20);
    this.camera.lookAt(0, 0, 0);
    this.camera.updateProjectionMatrix();

    this.setupControls();
  }

  private setupControls() {
    this.container.addEventListener('wheel', (e) => {
      e.preventDefault();
      this.zoom = Math.max(5, Math.min(30, this.zoom + e.deltaY * 0.01));
      this.updateProjection();
    });

    this.container.addEventListener('mousedown', (e) => {
      if (e.button === 1 || e.button === 2) {
        this.isDragging = true;
        this.lastMouse = { x: e.clientX, y: e.clientY };
      }
    });

    this.container.addEventListener('mousemove', (e) => {
      if (!this.isDragging) return;
      const dx = (e.clientX - this.lastMouse.x) * 0.05;
      const dy = (e.clientY - this.lastMouse.y) * 0.05;
      this.panOffset.x -= dx;
      this.panOffset.z -= dy;
      this.lastMouse = { x: e.clientX, y: e.clientY };
      this.updatePosition();
    });

    this.container.addEventListener('mouseup', () => {
      this.isDragging = false;
    });

    this.container.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  private updateProjection() {
    const aspect = this.container.clientWidth / this.container.clientHeight;
    this.camera.left = -this.zoom * aspect;
    this.camera.right = this.zoom * aspect;
    this.camera.top = this.zoom;
    this.camera.bottom = -this.zoom;
    this.camera.updateProjectionMatrix();
  }

  private updatePosition() {
    this.camera.position.set(
      20 + this.panOffset.x,
      20,
      20 + this.panOffset.z,
    );
    this.camera.lookAt(
      this.panOffset.x,
      0,
      this.panOffset.z,
    );
  }

  resize() {
    this.updateProjection();
  }

  focusOn(x: number, z: number) {
    this.panOffset.set(x, 0, z);
    this.updatePosition();
  }
}
