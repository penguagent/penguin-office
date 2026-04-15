import * as THREE from 'three';

export class ThoughtCloud {
  sprite: THREE.Sprite;
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private age = 0;

  constructor(text: string) {
    this.canvas = document.createElement('canvas');
    this.canvas.width = 256;
    this.canvas.height = 64;
    this.ctx = this.canvas.getContext('2d')!;

    this.draw(text);

    const texture = new THREE.CanvasTexture(this.canvas);
    const mat = new THREE.SpriteMaterial({ map: texture, transparent: true, opacity: 0.8 });
    this.sprite = new THREE.Sprite(mat);
    this.sprite.scale.set(1.8, 0.45, 1);
  }

  private draw(text: string) {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, 256, 64);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.beginPath();
    ctx.roundRect(4, 4, 248, 48, 24);
    ctx.fill();

    ctx.font = '16px -apple-system, sans-serif';
    ctx.fillStyle = '#333';
    ctx.textAlign = 'center';
    const truncated = text.length > 30 ? text.substring(0, 27) + '...' : text;
    ctx.fillText(truncated, 128, 36);
  }

  update(delta: number): boolean {
    this.age += delta;
    const bobAmount = Math.sin(this.age * 2) * 0.05;
    this.sprite.position.y += bobAmount * delta;
    return this.age < 10;
  }

  dispose() {
    this.sprite.material.map?.dispose();
    this.sprite.material.dispose();
  }
}
