# Penguin Office -- Droid Handoff Document

You are continuing development on **Penguin Office**, an Electron desktop app that visualizes AI coding agents as penguins in an isometric 3D office. The app is functional but needs the upgrades described below.

---

## Project Location

```
/Users/megabrain2/Desktop/RAY200M/penguin-office/
```

## Repo

```
https://github.com/lalomorales22/penguin-office
```

## Commands

```bash
pnpm install          # install deps
pnpm dev              # start dev server + electron
pnpm build            # production build
npx tsc --noEmit      # typecheck
```

## Tech Stack

- **Electron** (main process: `electron/main.ts`, preload: `electron/preload.ts`, agent IPC: `electron/agent-ipc.ts`)
- **Three.js** with isometric OrthographicCamera
- **React 18** + **Zustand** for UI overlay
- **Vite** + `vite-plugin-electron` for bundling
- **TypeScript** throughout
- **Zod** for event schema validation
- **pnpm** as package manager (requires `.npmrc` with electron hoisting -- already configured)

---

## Codebase Map

### Electron Main Process
- `electron/main.ts` -- window creation, tray, widget mode toggle (Cmd+Shift+P), IPC handlers
- `electron/preload.ts` -- context bridge exposing `window.electronAPI`
- `electron/agent-ipc.ts` -- spawns CLI agents as child processes, streams stdout/stderr back to renderer via IPC. Contains `CLI_COMMANDS` mapping for all 6 agents.

### Shared Types and Config
- `src/shared/types.ts` -- all TypeScript types: `AgentName`, `AgentRole`, `AgentStatus`, `PenguinState`, `Task`, `AgentEvent`, `ChatMessage`, `ElectronAPI`
- `src/shared/constants.ts` -- `AGENT_CONFIGS` (name/color/outfit per agent), `OFFICE_ZONES`, `DESK_POSITIONS`, `BREAK_POSITIONS`, `GYM_POSITIONS`, grid dimensions
- `src/shared/config.ts` -- app config (speeds, timeouts, zoom)

### Orchestrator (Agent Management)
- `src/orchestrator/AgentManager.ts` -- detects installed CLIs, spawns/kills agents, emits events. Singleton: `agentManager`
- `src/orchestrator/TaskQueue.ts` -- creates tasks, tracks status (backlog/in-progress/review/done), appends output. Singleton: `taskQueue`
- `src/orchestrator/adapters/BaseAdapter.ts` -- abstract base class with `detect()`, `spawn()`, `kill()` interface
- `src/orchestrator/adapters/ClaudeAdapter.ts` -- spawns `claude --print {task}`
- `src/orchestrator/adapters/CodexAdapter.ts` -- spawns `codex {task}`
- `src/orchestrator/adapters/GeminiAdapter.ts` -- spawns `gemini -p {task}`
- `src/orchestrator/adapters/DroidAdapter.ts` -- spawns `droid {task}`
- `src/orchestrator/adapters/OpenCodeAdapter.ts` -- spawns `opencode {task}`
- `src/orchestrator/adapters/OllamaAdapter.ts` -- spawns `ollama run codellama {task}`
- `src/orchestrator/events/EventBus.ts` -- pub/sub event system. Singleton: `eventBus`. Events: `agent:spawned`, `agent:output`, `agent:complete`, `agent:error`, `agent:killed`, `task:created`, `task:updated`, `task:assigned`
- `src/orchestrator/events/schemas.ts` -- Zod schemas for all events

### Three.js Renderer
- `src/renderer/SceneManager.ts` -- **the main orchestration file**. Creates the Three.js scene, initializes penguins from detected agents, listens to EventBus events and drives penguin animations (spawned → walk to desk → type, complete → walk to break room, error → red status). Also triggers idle behaviors on a timer. This is where you connect new behaviors.
- `src/renderer/scene/Office.ts` -- builds the floor, walls, and all furniture. Maintains an `occupancyGrid` (boolean[][]) for pathfinding. **Add new zones and furniture here.**
- `src/renderer/scene/IsometricCamera.ts` -- OrthographicCamera with pan (right-click drag) and zoom (scroll). Has `focusOn(x, z)` method. **Extend this for the monitor zoom feature.**
- `src/renderer/scene/Lighting.ts` -- ambient + directional + fill lights with shadows
- `src/renderer/characters/Penguin.ts` -- the penguin model. Built with procedural BoxGeometry (body, head, belly, eyes, beak, flippers, feet, outfit band, hat). Has animation states: idle (gentle sway), walking (waddle + foot movement), typing (flipper movement), exercising (bounce). Has `moveTo()` which uses A* pathfinding and calls `onArrival` callback. **This is where you add new animation states and upgrade to voxel models.**
- `src/renderer/characters/PenguinFactory.ts` -- creates one Penguin per installed agent, assigns desk positions
- `src/renderer/characters/Pathfinding.ts` -- A* algorithm on the occupancy grid, supports 8-directional movement with diagonal obstacle avoidance
- `src/renderer/furniture/index.ts` -- procedural furniture factories: `createDesk`, `createChair`, `createComputer`, `createCouch`, `createPingPongTable`, `createTreadmill`, `createWaterCooler`, `createPlant`, `createServerRack`. **Add new furniture here.**
- `src/renderer/effects/SpeechBubble.ts` -- canvas-textured sprite that appears above penguins, auto-fades after lifespan
- `src/renderer/effects/StatusIndicator.ts` -- pulsing colored sphere for agent status
- `src/renderer/effects/ThoughtCloud.ts` -- smaller floating thought bubble

### React UI
- `src/ui/App.tsx` -- **main React component**. Mounts the SceneManager into a div ref, detects agents (real via Electron IPC or simulated for browser dev), wires EventBus to Zustand store, handles chat message sending with @mention parsing. Contains `simulateAgentWork()` for demo mode.
- `src/ui/panels/AgentBar.tsx` -- top bar with agent avatars and status dots, click to focus camera
- `src/ui/panels/ChatPanel.tsx` -- right panel with message list and input. Supports `@agent` syntax.
- `src/ui/panels/TaskBoard.tsx` -- kanban board with 4 columns (Backlog, In Progress, Review, Done)
- `src/ui/panels/LogPanel.tsx` -- bottom panel showing raw agent output, accessed via `window.__addLog()`
- `src/ui/store/useStore.ts` -- Zustand store: agents, agentStatuses, tasks, messages, selectedAgent, appMode, showTaskBoard, showLogs

### Entry Points
- `index.html` -- HTML shell, loads `src/main.tsx`
- `src/main.tsx` -- React root mount
- `vite.config.ts` -- Vite config with electron plugin and `@/` path alias

---

## Current State

Phase 1 MVP is complete:
- Electron shell works with normal + widget mode
- Three.js renders an isometric office with desks, chairs, computers, couch, ping pong, treadmills, server racks, plants
- Procedural penguin characters with waddle/typing/exercise/idle animations
- A* pathfinding on grid
- All 6 CLI adapters (Claude, Codex, Gemini, Droid, OpenCode, Ollama) with auto-detection
- Chat panel with @mentions, task board, agent bar, log panel
- EventBus connects agent output to penguin scene animations
- Demo simulation mode works in browser without Electron
- TypeScript compiles clean, Vite builds successfully

What is NOT done yet:
- Agents just get raw task text -- no system prompts, no project context
- Penguins have procedural geometry -- no voxel models
- All tasks go to desk area only -- no zone-based routing
- No camera zoom into monitor
- No task pipelines (multi-agent handoff)
- No mini-games, sounds, or day/night cycle
- No agent memory or cost tracking

---

## What to Build Next

Read `TASKS.md` in the project root for the full 3-phase plan. Here is the priority order and where to make changes:

### Priority 1: System Prompt Engine (TASKS.md Phase 1.1)

Create `src/orchestrator/SystemPromptBuilder.ts`. This class assembles a system prompt for each agent before spawning. It should:
1. Read `package.json` and top-level file listing from the working directory for project context
2. Include the agent's role and name
3. Include any output from previous agents in the pipeline (stored in `TaskQueue`)
4. Use templates from `src/orchestrator/prompts/` (create this directory)

Then update every adapter in `src/orchestrator/adapters/` to prepend the system prompt. The key change is in the `spawn()` method of each adapter -- modify the CLI arguments or pipe to stdin.

Also update `electron/agent-ipc.ts` -- the `CLI_COMMANDS` object needs to accept the assembled prompt and pass it correctly per CLI tool.

### Priority 2: Office Zones as Dev Stages (TASKS.md Phase 1.2)

Modify `src/shared/constants.ts` to add new zones (Whiteboard Area, Testing Lab, Review Corner). Add new furniture in `src/renderer/furniture/index.ts` and place them in `src/renderer/scene/Office.ts`.

Create `src/orchestrator/TaskRouter.ts` that maps `TaskType` (plan/design/implement/test/review/deploy) to an office zone. The `SceneManager.ts` event handlers for `agent:spawned` currently always send penguins to desks -- change this to use TaskRouter to pick the correct zone.

Add the `TaskType` field to the `Task` type in `src/shared/types.ts`.

### Priority 3: Monitor Zoom (TASKS.md Phase 1.3)

Extend `src/renderer/scene/IsometricCamera.ts` with a `zoomToMonitor(position, lookAt)` method that animates the camera from isometric to a close-up. Add a raycaster click handler in `SceneManager.ts` to detect clicks on penguin meshes. When clicked, animate camera to that penguin's desk monitor.

Render agent stdout onto the monitor's plane using a `CanvasTexture` that updates as output streams in. The computer monitor is created in `src/renderer/furniture/index.ts` `createComputer()` -- the `screenGlow` mesh is the surface to render onto.

### Priority 4: Task Pipeline (TASKS.md Phase 1.4)

Create `src/orchestrator/Pipeline.ts`. A pipeline is a sequence of tasks with dependencies. The Team Leader agent (assign one agent the `leader` role in constants) receives the user's request and uses its own AI call to break it into subtasks. Each subtask has a `TaskType` and gets routed to the appropriate agent and zone.

Wire this into `src/ui/App.tsx` `handleSendMessage()` -- instead of directly spawning one agent, create a Pipeline that the Team Leader plans first.

---

## Key Patterns to Follow

1. **All agent communication goes through EventBus** -- never directly update UI from agent processes. Emit events, let SceneManager and Zustand store consume them.
2. **Penguin behavior is driven by state** -- set `penguin.setState('typing')` and the `update(delta)` loop handles animation. Add new states in the `PenguinState` type and add animation logic in `Penguin.ts` `update()`.
3. **Furniture goes in `furniture/index.ts`**, placement goes in `Office.ts`, don't forget to call `markOccupied()` so pathfinding avoids it.
4. **Adapters are intentionally simple** -- they just wrap `child_process.spawn()`. Keep them thin. Business logic goes in `AgentManager` or `TaskRouter`.
5. **The simulation mode in `App.tsx` `simulateAgentWork()`** should be updated whenever you add new event types so browser dev mode still works.

---

## Files You Will Definitely Edit

| File | Why |
|------|-----|
| `src/orchestrator/adapters/*.ts` | Add system prompt injection to all 6 adapters |
| `electron/agent-ipc.ts` | Update CLI_COMMANDS to accept system prompts |
| `src/shared/types.ts` | Add TaskType, Pipeline types, new PenguinStates |
| `src/shared/constants.ts` | Add new zones, update zone positions |
| `src/renderer/scene/Office.ts` | Add new zones, new furniture placement |
| `src/renderer/furniture/index.ts` | Add whiteboard, coffee machine, bookshelf, etc. |
| `src/renderer/characters/Penguin.ts` | Add new animation states |
| `src/renderer/SceneManager.ts` | Add zone routing, monitor zoom, click handling |
| `src/renderer/scene/IsometricCamera.ts` | Add zoom-to-monitor animation |
| `src/ui/App.tsx` | Wire pipeline system, update simulateAgentWork |
| `src/ui/store/useStore.ts` | Add pipeline state, task types |

## Files You Will Create

| File | Purpose |
|------|---------|
| `src/orchestrator/SystemPromptBuilder.ts` | Assembles context-aware system prompts |
| `src/orchestrator/prompts/*.ts` | Prompt templates per role |
| `src/orchestrator/TaskRouter.ts` | Maps task types to office zones |
| `src/orchestrator/Pipeline.ts` | Multi-stage task pipeline with dependencies |
| `src/renderer/furniture/Whiteboard.ts` | Interactive whiteboard that renders text/diagrams |
| `src/renderer/furniture/CoffeeMachine.ts` | Animated coffee machine |
| `src/renderer/effects/ConfettiEffect.ts` | Celebration particles |
| `src/renderer/scene/MonitorView.ts` | Virtual terminal rendered on monitor texture |
| `assets/voxels/penguins/*.vox` | MagicaVoxel penguin models (Phase 2) |
| `assets/voxels/furniture/*.vox` | MagicaVoxel furniture models (Phase 2) |
