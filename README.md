# Penguin Office

**An isometric 3D desktop app where your AI coding agents come to life as penguins in a virtual office.**

Penguin Office is an agentic orchestration application that connects to your locally installed CLI AI tools -- Claude, Codex, Gemini, Droid, OpenCode, and Ollama -- and visualizes them as penguin characters working in a fully interactive office environment. Assign tasks through chat or a kanban board, and watch your penguins walk to their desks, type at computers, take breaks, exercise, and collaborate in real time.

Each penguin wears a unique outfit based on the AI it represents. Each one has a real CLI process running behind it. This is not a toy -- it is a working orchestration layer with a visual interface.

---

## What It Looks Like

- Isometric 3D office rendered with Three.js
- Penguin characters with waddle animations, typing, exercising, and idle behaviors
- Office furniture: desks with monitors, couches, ping pong table, treadmills, server racks, water cooler, plants
- Floating name labels and colored status dots (green = working, yellow = idle, red = error)
- Speech bubbles showing real-time agent output
- Dark UI panels overlaid on the scene

---

## Supported AI Agents

| Agent | CLI Command | Outfit | Color |
|-------|------------|--------|-------|
| Claude | `claude` | Business suit + tie | Orange |
| Codex | `codex` | Hoodie | Green |
| Gemini | `gemini` | Lab coat | Blue |
| Droid | `droid` | Utility vest | Purple |
| OpenCode | `opencode` | Casual t-shirt | Teal |
| Ollama | `ollama run <model>` | Beanie + scarf | Red |

The app auto-detects which CLIs you have installed. Only installed agents appear as penguins in the office. You can use any combination.

---

## Quick Start

### Prerequisites

- **Node.js** 18+
- **pnpm** (`npm install -g pnpm`)
- At least one AI CLI installed: `claude`, `codex`, `gemini`, `droid`, `opencode`, or `ollama`

### Install and Run

```bash
git clone https://github.com/penguagent/penguin-office.git
cd penguin-office
pnpm install
pnpm dev
```

This starts the Vite dev server and opens the Electron app. The office loads with one penguin per detected CLI agent.

### Build for Distribution

```bash
pnpm build
```

Produces a packaged Electron app in the `dist/` directory.

---

## How to Use

### Sending Tasks to Agents

Use the **Chat Panel** on the right side of the screen. Type a message to send it to the next available agent, or use `@mentions` to target a specific one:

```
@claude refactor the authentication module to use JWT tokens
@codex write unit tests for the payment service
@gemini analyze this codebase and suggest performance improvements
@ollama explain how the routing layer works
```

When a task is sent:
1. The penguin walks to its assigned desk
2. It sits down and starts typing (flippers animate)
3. A speech bubble shows progress from the agent's stdout
4. The status dot turns green (working)
5. When the task completes, the penguin stands up and walks to the break room
6. If an error occurs, the status dot turns red and the bubble shows the error

### Task Board

Click the **Tasks** button in the bottom-left corner to open the kanban board. Tasks flow through four columns:

- **Backlog** -- queued tasks waiting for assignment
- **In Progress** -- actively being worked on by an agent
- **Review** -- completed but awaiting your review
- **Done** -- finished tasks

Each card shows the assigned penguin's avatar, the task description, and token usage.

### Agent Bar

The top bar shows all detected agents with their current status. Click any agent to focus the camera on that penguin in the office.

### Logs

Click the **Logs** button to see raw agent output streaming in real time. Useful for debugging or monitoring what each agent is actually producing.

---

## Window Modes

### Normal Mode
Full desktop window with the office scene and all UI panels. Resizable, standard title bar.

### Widget Mode
A compact, always-on-top transparent overlay that sits on your desktop. Shows only the office scene without panels. Toggle between modes with:

- **Keyboard shortcut**: `Cmd+Shift+P` (Mac) / `Ctrl+Shift+P` (Windows/Linux)
- **System tray**: Right-click the tray icon and select "Toggle Widget Mode"

In widget mode, the penguins live on your desktop while you work.

---

## Architecture

```
penguin-office/
├── electron/              # Electron main process + IPC
│   ├── main.ts            # Window management, tray, widget mode
│   ├── preload.ts         # Context bridge for renderer
│   └── agent-ipc.ts       # Spawns CLI agents as child processes
├── src/
│   ├── renderer/          # Three.js scene
│   │   ├── scene/         # Office, camera, lighting
│   │   ├── characters/    # Penguin model, pathfinding
│   │   ├── furniture/     # Desks, chairs, computers, etc.
│   │   └── effects/       # Speech bubbles, status dots
│   ├── orchestrator/      # Agent management
│   │   ├── adapters/      # One adapter per CLI tool
│   │   ├── events/        # EventBus + Zod schemas
│   │   ├── AgentManager.ts
│   │   └── TaskQueue.ts
│   ├── ui/                # React overlay
│   │   ├── panels/        # Chat, TaskBoard, AgentBar, Logs
│   │   └── store/         # Zustand state
│   └── shared/            # Types, constants, config
├── assets/                # Voxel models, sounds (Phase 2+)
├── vite.config.ts
└── package.json
```

### Tech Stack

| Layer | Technology |
|-------|-----------|
| Desktop | Electron |
| 3D Rendering | Three.js (isometric OrthographicCamera) |
| UI | React 18 + Zustand |
| Bundler | Vite |
| Agent Orchestration | Node.js child_process |
| Event System | Custom EventBus + Zod validation |
| Language | TypeScript |

---

## How Agent Orchestration Works

Each CLI tool has an adapter that implements a common interface:

```typescript
interface AgentAdapter {
  name: string;
  detect(): Promise<boolean>;
  spawn(task: Task, workDir: string): AgentProcess;
  kill(): void;
}
```

When you send a task:
1. The **AgentManager** selects an available adapter
2. It spawns the CLI as a child process with the task as an argument
3. stdout/stderr are streamed through the **EventBus**
4. Events are consumed by the **SceneManager** to drive penguin animations
5. Events are also consumed by the **Zustand store** to update UI panels

The Electron main process handles actual process spawning via IPC. When running in browser dev mode (without Electron), a simulation mode generates fake agent output so you can see the office working.

---

## Controls

| Action | Input |
|--------|-------|
| Pan camera | Right-click + drag or middle-click + drag |
| Zoom | Scroll wheel |
| Focus on agent | Click agent in top bar |
| Toggle task board | Click "Tasks" button |
| Toggle logs | Click "Logs" button |
| Toggle widget mode | Cmd+Shift+P |

---

## Configuration

Environment variables (optional):

| Variable | Description |
|----------|-------------|
| `WORKSPACE` | Default working directory for agent tasks |

---

## License

MIT
