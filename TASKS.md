# Penguin Office -- Upgrade Roadmap

Three-phase plan to transform Penguin Office from a visual orchestration prototype into a fully interactive, AI-driven development environment where every penguin action maps to a real stage of building software.

---

## Phase 1: Real AI Integration and Office Zones as Dev Stages

**Goal**: Every area of the office represents a stage in the software development lifecycle. Penguins go to specific zones to do specific work. Each CLI agent receives a crafted system prompt so it knows its role, the project context, and what to produce.

### 1.1 System Prompt Engine

Build a prompt construction system that prepares each AI agent before it starts working. When a task is assigned, the agent receives a structured system prompt via stdin or CLI flags:

```
You are {agent_name}, a senior software engineer working in Penguin Office.
You are currently assigned to: {task_title}
Project: {project_name}
Working directory: {work_dir}

Your role in this task: {role_description}

Context from previous agents:
{context_from_team}

Instructions:
{task_description}

Output your work directly. No pleasantries. Code only unless asked to explain.
```

Each adapter must support sending system prompts:
- **Claude**: `claude --system-prompt "..." --print "{task}"`
- **Codex**: pipe system prompt via stdin or `--instructions`
- **Gemini**: `gemini -p "{system_prompt}\n\n{task}"`
- **Droid**: `droid "{system_prompt + task}"`
- **OpenCode**: pipe via stdin
- **Ollama**: `ollama run {model} "{system_prompt + task}"` or use the API at `localhost:11434`

Tasks:
- [ ] Create `SystemPromptBuilder` class that assembles prompts from templates
- [ ] Add project context awareness (reads package.json, directory structure, recent git log)
- [ ] Store prompt templates per role (planner, developer, reviewer, tester, documenter)
- [ ] Update all 6 adapters to inject system prompts
- [ ] Add a `~/.penguin-office/prompts/` directory for user-customizable prompt templates
- [ ] Add memory: save agent outputs per task so subsequent agents can reference them

### 1.2 Office Zones Mapped to Dev Stages

Each zone in the office corresponds to a phase of building an app. When an agent is assigned a task, it physically walks to the correct zone:

| Office Zone | Dev Stage | What Happens There |
|-------------|-----------|-------------------|
| **Meeting Room** | Planning | Team Leader breaks down requirements into subtasks. Agents gather around the table, speech bubbles show the plan being formed. |
| **Whiteboard Area** (new) | Architecture / Design | Agent sketches out file structure, component hierarchy, API design. A whiteboard object displays a simplified diagram. |
| **Desk Area** | Implementation | Agent sits at its assigned desk, types code. The monitor shows a miniature code view (scrolling green text or actual output). |
| **Testing Lab** (new) | Testing | Agent runs tests. A wall display shows pass/fail counts. Red/green lights on the wall react to results. |
| **Review Corner** (new) | Code Review | Reviewer penguin sits with another penguin, speech bubbles show review comments. Approval = thumbs up animation. |
| **Server Room** | Deployment / Build | Agent triggers builds. Server rack LEDs blink faster. A progress bar appears above the racks. |
| **Break Room** | Idle / Waiting | Agents not currently assigned hang out here. Random idle behaviors. |
| **Gym** | Processing / Heavy Compute | Agents doing intensive work (large model inference, big refactors) go to the gym. Exercise animation = compute. |

Tasks:
- [ ] Add new zones: Whiteboard Area, Testing Lab, Review Corner
- [ ] Create `TaskRouter` that maps task type to office zone
- [ ] Build zone-specific arrival behaviors (sit at desk vs stand at whiteboard vs gather in meeting room)
- [ ] Add zone transition animations (penguin picks up laptop, walks between zones)
- [ ] Create `TaskType` enum: `plan`, `design`, `implement`, `test`, `review`, `deploy`, `idle`
- [ ] Route agents to correct zones based on task type

### 1.3 Live Monitor View (Zoom Into Agent's Screen)

When you click on a penguin that is working at a desk, the camera zooms into its monitor to show what the AI is actually outputting in real time.

Tasks:
- [ ] Add click handler on penguin mesh (raycasting)
- [ ] Animate camera from isometric overview into a close-up on the desk monitor
- [ ] Render a virtual terminal on the monitor's Three.js plane using a canvas texture
- [ ] Stream the agent's stdout into the virtual terminal in real time
- [ ] Add a "Back to Office" button to zoom back out
- [ ] Support syntax highlighting in the terminal view (basic: keywords in color)
- [ ] Show a minimap of the office in the corner while zoomed in

### 1.4 Real Task Pipeline

Instead of one-shot tasks, implement multi-stage pipelines where agents hand off work:

```
User: "Build a todo app with React"
  → Team Leader (Meeting Room): breaks into subtasks
  → Designer (Whiteboard): plans component structure
  → Developer 1 (Desk): implements components
  → Developer 2 (Desk): implements API/backend
  → Tester (Testing Lab): runs test suite
  → Reviewer (Review Corner): reviews code
  → Deployer (Server Room): builds and packages
```

Tasks:
- [ ] Create `Pipeline` class that chains subtasks with dependencies
- [ ] Team Leader agent generates subtask breakdown using its own AI call
- [ ] Each subtask completion triggers the next stage
- [ ] Pass output context between stages (previous agent's output becomes next agent's input)
- [ ] Show pipeline progress in the Task Board with connected arrows between cards
- [ ] Allow user to intervene at any stage (approve, reject, modify)

---

## Phase 2: Rich Interactions, More Objects, Mini-Games

**Goal**: Make the office feel alive and interactive. Add furniture, decorations, interactive objects, mini-games, and emergent penguin behaviors.

### 2.1 New Furniture and Objects

- [ ] **Whiteboard**: 3D plane that renders diagrams/text from the design phase
- [ ] **Coffee Machine**: Penguins visit it between tasks, short "brewing" animation, coffee cup appears in flipper
- [ ] **Bookshelf**: Decorative, but clicking it shows project documentation
- [ ] **Printer**: Prints task summaries, paper comes out animation
- [ ] **Clock**: Real-time clock on the wall
- [ ] **Motivational Posters**: Framed posters with programming jokes, randomly selected
- [ ] **Fish Tank**: Ambient decoration with simple fish swimming (shader or sprite)
- [ ] **Snack Machine**: Penguins use it during idle, random snack appears
- [ ] **Trash Can**: Penguins throw away failed tasks (crumpled paper animation)
- [ ] **Elevator**: Entrance/exit point, penguins ride it when spawning or leaving
- [ ] **Desk Accessories**: Per-penguin items (Claude has a coffee mug, Codex has energy drinks, Gemini has a microscope, Droid has wrenches, Ollama has a server model)
- [ ] **Standing Desks**: Some desks can toggle between sitting and standing

### 2.2 MagicaVoxel Model Upgrade

Replace all procedural geometry with proper voxel models:

- [ ] Design 8 penguin models in MagicaVoxel (6 agents + leader + reviewer), each with distinct outfit
- [ ] Design penguin poses: standing, sitting, typing, walking frames (4 frame walk cycle), exercising, talking
- [ ] Design all furniture as .vox files
- [ ] Build a VoxelLoader that parses .vox format into Three.js meshes
- [ ] Support animation by swapping between pose models per frame
- [ ] Add penguin customization: users can change outfit colors in settings

### 2.3 Mini-Games and Social Interactions

Idle penguins should do things together:

- [ ] **Ping Pong**: Two idle penguins walk to the ping pong table, ball bounces back and forth (simple physics), score displayed
- [ ] **Water Cooler Chat**: Two penguins stand at the water cooler, speech bubbles show random programming jokes or project gossip
- [ ] **Arm Wrestling** (new desk object): Two penguins sit opposite, brief animation, random winner
- [ ] **Dance Party**: If all agents complete a major task, penguins briefly dance (wiggle animation + confetti particles)
- [ ] **Nap on Couch**: Idle penguin lies down, Z's float above
- [ ] **Whiteboard Doodle**: Idle penguin draws random shapes on the whiteboard
- [ ] **Stretching**: Penguin does a stretch animation at their desk periodically

### 2.4 Sound Design

- [ ] Ambient office background (subtle keyboard typing, murmur)
- [ ] Penguin waddle footstep sounds
- [ ] Keyboard typing sounds when penguin is coding
- [ ] Task complete chime
- [ ] Error buzzer
- [ ] Ping pong ball bounce
- [ ] Coffee machine brewing
- [ ] UI click sounds
- [ ] Volume control in settings
- [ ] Mute toggle

### 2.5 Day/Night Cycle

- [ ] Time-based lighting changes (warm morning light -> bright noon -> warm afternoon -> dim evening)
- [ ] After hours: office lights dim, desk lamps turn on, monitor glows are more prominent
- [ ] Optional: tie to real system clock
- [ ] Night owl mode: some penguins work late, wear tiny headlamps

---

## Phase 3: Full Orchestration, Multi-Project, and Distribution

**Goal**: Make Penguin Office a serious development tool that manages real multi-project workflows, with persistent memory, cost tracking, and a polished distributable app.

### 3.1 Multi-Project Workspace

- [ ] Project selector dropdown in the UI
- [ ] Each project has its own working directory, task history, and agent memory
- [ ] Project-specific system prompts (reads the project's README, tech stack, conventions)
- [ ] Switch projects without restarting -- penguins "clock out" (walk to elevator) and "clock in" to new project
- [ ] Project templates: "React App", "API Server", "CLI Tool", etc. with pre-built task pipelines

### 3.2 Agent Memory and Learning

- [ ] Save every task result, rating, and review to `~/.penguin-office/memory/`
- [ ] Per-agent memory: each agent builds a profile of what it's good at and what it struggles with
- [ ] Task rating system: after completion, user rates 1-5 on quality, speed, correctness
- [ ] Ratings feed back into system prompts: "In previous tasks, the user rated your code style 3/5. Focus on cleaner variable names."
- [ ] Agent skill matrix: auto-assign agents to task types they perform best at
- [ ] Review history: reviewer agent references previous review comments to avoid repeating feedback

### 3.3 Token Cost Tracking and Budgets

- [ ] Parse token usage from agent output where possible (Claude reports tokens)
- [ ] Estimate tokens for agents that don't report (count output characters / 4)
- [ ] Running cost display per agent and per project
- [ ] Budget limits: set a max token budget per task or per session
- [ ] Auto-pause agents approaching budget limits
- [ ] Cost comparison view: see which agent is most cost-effective for which task types
- [ ] Export cost reports as CSV

### 3.4 Advanced Monitor View

Expand the "zoom into screen" feature:

- [ ] Full terminal emulator rendered on the monitor (xterm.js on a Three.js texture)
- [ ] See the agent's complete output with scroll-back
- [ ] Inline diff view: when agent modifies files, show before/after highlighted diff
- [ ] File tree sidebar in monitor view showing which files the agent touched
- [ ] "Take over" mode: type into the agent's terminal to give it additional instructions mid-task
- [ ] Split screen: view two agents' monitors side by side

### 3.5 Team Coordination

- [ ] **Standup Meeting**: Configurable daily standup where all penguins gather in the meeting room and the Team Leader summarizes progress
- [ ] **Pair Programming**: Two penguins sit at the same desk, one drives (types) while the other reviews in real time
- [ ] **Conflict Resolution**: When two agents produce conflicting changes, they meet at the whiteboard and the user picks the winner
- [ ] **Sprint Planning**: User defines a sprint of tasks, Team Leader auto-assigns based on agent strengths
- [ ] **Retrospective**: End-of-sprint review where agents self-evaluate via AI

### 3.6 Desktop Widget Polish

- [ ] Transparent overlay with proper click-through (only penguin area is interactive)
- [ ] Mini notification bubbles when agents complete tasks (even in widget mode)
- [ ] Customizable widget position and size
- [ ] Widget shows condensed agent status (just dots and names)
- [ ] Double-click widget to expand to full mode

### 3.7 Distribution and Packaging

- [ ] Electron auto-updater integration
- [ ] macOS DMG with proper code signing
- [ ] Windows installer (NSIS)
- [ ] Linux AppImage
- [ ] Homebrew formula: `brew install penguin-office`
- [ ] npx launcher: `npx penguin-office`
- [ ] First-run onboarding: detect installed agents, configure workspace, explain the UI
- [ ] Settings panel: configure agent paths, API keys, workspace directory, prompt templates, theme

### 3.8 Office Customization

- [ ] Multiple office themes: Modern Tech Office, Cozy Startup, Cyberpunk Lab, Space Station
- [ ] Drag and drop furniture placement (edit mode)
- [ ] Custom penguin names (rename agents)
- [ ] Office size: small (4 agents), medium (8 agents), large (12+ agents)
- [ ] User avatar penguin that walks around and inspects work
- [ ] Visitor penguins (connect with friends, they see your office)

---

## Priority Order

If working through these linearly:

1. **Phase 1.1** (System Prompt Engine) -- this is the single most important upgrade, it makes the AI agents actually useful
2. **Phase 1.2** (Zone Mapping) -- ties the visual to real dev workflow
3. **Phase 1.3** (Monitor Zoom) -- the killer feature, seeing what each agent is doing
4. **Phase 1.4** (Task Pipeline) -- multi-agent collaboration on real projects
5. **Phase 2.2** (Voxel Models) -- visual quality leap
6. **Phase 2.3** (Mini-Games) -- makes idle time entertaining
7. **Phase 3.1** (Multi-Project) -- real-world usability
8. **Phase 3.2** (Memory) -- agents get better over time
9. Everything else

---

## Contributing

Pick any unchecked task, open a PR. The codebase is TypeScript throughout. Run `pnpm dev` to start developing.
