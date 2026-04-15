import * as THREE from 'three';
import { Office } from './scene/Office';
import { IsometricCamera } from './scene/IsometricCamera';
import { createLighting } from './scene/Lighting';
import { PenguinFactory } from './characters/PenguinFactory';
import { Penguin } from './characters/Penguin';
import { SpeechBubble } from './effects/SpeechBubble';
import { eventBus } from '../orchestrator/events/EventBus';
import type { AgentName, AgentConfig, AgentEvent } from '../shared/types';
import { DESK_POSITIONS, BREAK_POSITIONS, GYM_POSITIONS } from '../shared/constants';

export class SceneManager {
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private cameraController: IsometricCamera;
  private office: Office;
  private penguinFactory: PenguinFactory;
  private penguins: Map<AgentName, Penguin> = new Map();
  private speechBubbles: { bubble: SpeechBubble; parent: THREE.Object3D }[] = [];
  private clock = new THREE.Clock();
  private animationId: number | null = null;

  constructor(private container: HTMLElement) {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x1a1a2e);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(this.renderer.domElement);

    this.cameraController = new IsometricCamera(container);
    this.office = new Office();
    this.scene.add(this.office.group);

    createLighting(this.scene);

    this.penguinFactory = new PenguinFactory();

    this.setupEventListeners();

    window.addEventListener('resize', this.onResize);
  }

  initPenguins(agents: Map<AgentName, AgentConfig>) {
    this.penguins = this.penguinFactory.createFromAgents(agents);
    this.penguins.forEach((penguin) => {
      this.scene.add(penguin.group);
    });
  }

  private setupEventListeners() {
    eventBus.on('agent:spawned', (event: unknown) => {
      const e = event as AgentEvent;
      const penguin = this.penguins.get(e.agentName);
      if (!penguin) return;

      penguin.setStatus('working');
      const deskIndex = Array.from(this.penguins.keys()).indexOf(e.agentName);
      const desk = DESK_POSITIONS[deskIndex];
      if (desk) {
        penguin.moveTo(desk.gridX, desk.gridY + 0.8, this.office.getOccupancyGrid(), () => {
          penguin.setState('typing');
        });
      }
    });

    eventBus.on('agent:output', (event: unknown) => {
      const e = event as AgentEvent;
      const penguin = this.penguins.get(e.agentName);
      if (!penguin || !e.data) return;

      this.showSpeechBubble(penguin, e.data.substring(0, 60));
    });

    eventBus.on('agent:complete', (event: unknown) => {
      const e = event as AgentEvent;
      const penguin = this.penguins.get(e.agentName);
      if (!penguin) return;

      penguin.setStatus('idle');
      penguin.setState('idle');

      // Walk to break room
      const breakPos = BREAK_POSITIONS[Math.floor(Math.random() * BREAK_POSITIONS.length)]!;
      penguin.moveTo(breakPos.gridX, breakPos.gridY, this.office.getOccupancyGrid());
    });

    eventBus.on('agent:error', (event: unknown) => {
      const e = event as AgentEvent;
      const penguin = this.penguins.get(e.agentName);
      if (!penguin) return;

      penguin.setStatus('error');
      penguin.setState('idle');
      if (e.data) this.showSpeechBubble(penguin, `Error: ${e.data.substring(0, 40)}`);
    });
  }

  private showSpeechBubble(penguin: Penguin, text: string) {
    const bubble = new SpeechBubble(text, 4);
    bubble.sprite.position.set(0, 2.8, 0);
    penguin.group.add(bubble.sprite);
    this.speechBubbles.push({ bubble, parent: penguin.group });
  }

  focusOnAgent(name: AgentName) {
    const penguin = this.penguins.get(name);
    if (penguin) {
      this.cameraController.focusOn(penguin.group.position.x, penguin.group.position.z);
    }
  }

  triggerIdleBehaviors() {
    this.penguins.forEach((penguin) => {
      if (penguin.state !== 'idle') return;
      if (Math.random() > 0.3) return;

      const choice = Math.random();
      const grid = this.office.getOccupancyGrid();

      if (choice < 0.3) {
        // Wander to break room
        const pos = BREAK_POSITIONS[Math.floor(Math.random() * BREAK_POSITIONS.length)]!;
        penguin.moveTo(pos.gridX, pos.gridY, grid);
      } else if (choice < 0.5) {
        // Go exercise
        const pos = GYM_POSITIONS[Math.floor(Math.random() * GYM_POSITIONS.length)]!;
        penguin.moveTo(pos.gridX, pos.gridY, grid, () => {
          penguin.setState('exercising');
          setTimeout(() => penguin.setState('idle'), 5000 + Math.random() * 5000);
        });
      } else {
        // Walk to random spot
        const rx = 2 + Math.floor(Math.random() * 26);
        const rz = 2 + Math.floor(Math.random() * 20);
        if (!grid[rz]?.[rx]) {
          penguin.moveTo(rx, rz, grid);
        }
      }
    });
  }

  start() {
    this.clock.start();
    const animate = () => {
      this.animationId = requestAnimationFrame(animate);
      const delta = this.clock.getDelta();

      // Update penguins
      this.penguins.forEach((penguin) => penguin.update(delta));

      // Update speech bubbles
      this.speechBubbles = this.speechBubbles.filter(({ bubble, parent }) => {
        const alive = bubble.update(delta);
        if (!alive) {
          parent.remove(bubble.sprite);
          bubble.dispose();
        }
        return alive;
      });

      this.renderer.render(this.scene, this.cameraController.camera);
    };
    animate();

    // Idle behavior timer
    setInterval(() => this.triggerIdleBehaviors(), 8000);
  }

  stop() {
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
    }
  }

  private onResize = () => {
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.cameraController.resize();
  };

  dispose() {
    this.stop();
    window.removeEventListener('resize', this.onResize);
    this.renderer.dispose();
    this.container.removeChild(this.renderer.domElement);
  }
}
