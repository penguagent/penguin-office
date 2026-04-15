import * as THREE from 'three';

export class SpeechBubble {
  sprite: THREE.Sprite;
  private lifespan: number;
  private age = 0;
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  constructor(text: string, lifespan = 5) {
    this.lifespan = lifespan;
    this.canvas = document.createElement('canvas');
    this.canvas.width = 512;
    this.canvas.height = 128;
    this.ctx = this.canvas.getContext('2d')!;

    this.drawBubble(text);

    const texture = new THREE.CanvasTexture(this.canvas);
    const material = new THREE.SpriteMaterial({ map: texture, transparent: true });
    this.sprite = new THREE.Sprite(material);
    this.sprite.scale.set(2.5, 0.65, 1);
  }

  private drawBubble(text: string) {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, 512, 128);

    // Bubble background
    ctx.fillStyle = 'rgba(30, 30, 50, 0.85)';
    ctx.beginPath();
    ctx.roundRect(8, 8, 496, 96, 12);
    ctx.fill();

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(8, 8, 496, 96, 12);
    ctx.stroke();

    // Tail
    ctx.fillStyle = 'rgba(30, 30, 50, 0.85)';
    ctx.beginPath();
    ctx.moveTo(240, 104);
    ctx.lineTo(256, 124);
    ctx.lineTo(272, 104);
    ctx.fill();

    // Text
    ctx.font = '22px -apple-system, sans-serif';
    ctx.fillStyle = '#e0e0e0';
    ctx.textAlign = 'center';

    const maxWidth = 470;
    const truncated = text.length > 60 ? text.substring(0, 57) + '...' : text;
    ctx.fillText(truncated, 256, 64);
  }

  update(delta: number): boolean {
    this.age += delta;
    if (this.age > this.lifespan - 1) {
      const fade = 1 - (this.age - (this.lifespan - 1));
      this.sprite.material.opacity = Math.max(0, fade);
    }
    return this.age < this.lifespan;
  }

  dispose() {
    this.sprite.material.map?.dispose();
    this.sprite.material.dispose();
  }
}
