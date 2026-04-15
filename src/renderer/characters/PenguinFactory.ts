import { Penguin } from './Penguin';
import type { AgentName, AgentConfig } from '../../shared/types';
import { DESK_POSITIONS } from '../../shared/constants';

export class PenguinFactory {
  private penguins: Map<AgentName, Penguin> = new Map();

  createFromAgents(agents: Map<AgentName, AgentConfig>): Map<AgentName, Penguin> {
    this.penguins.clear();
    let deskIndex = 0;

    agents.forEach((config, name) => {
      if (!config.installed) return;

      const pos = DESK_POSITIONS[deskIndex] ?? { gridX: 14 + deskIndex * 2, gridY: 10 };
      const penguin = new Penguin(name, pos.gridX, pos.gridY + 1.5);
      this.penguins.set(name, penguin);
      deskIndex++;
    });

    return this.penguins;
  }

  getPenguin(name: AgentName): Penguin | undefined {
    return this.penguins.get(name);
  }

  getAllPenguins(): Penguin[] {
    return Array.from(this.penguins.values());
  }
}
