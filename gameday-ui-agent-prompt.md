# IDE Agent Prompt — Game Day Platform UI (paperdraw.dev-inspired)

## Project overview

Build the complete frontend UI for a **Game Day / Resilience Testing Platform** for AWS infrastructure. The visual design and interaction model is inspired by paperdraw.dev — a dark-themed, canvas-first system design simulator. The UI must feel like a professional engineering tool: dense with information, zero wasted space, every pixel earning its place.

This is a **UI-only build**. Wire up realistic mock data and stub functions everywhere the real simulation engine will later plug in. No backend needed. All state is in-memory React state.

---

## Tech stack (strict)

- **React 18 + TypeScript**
- **Vite** (not Next.js — this is a pure SPA)
- **React Flow (`@xyflow/react`)** — for the canvas, nodes, edges
- **Tailwind CSS v3** — utility-first styling
- **Zustand** — global state (canvas nodes, simulation state, selected node, panel state)
- **Framer Motion** — traffic particle animations, panel transitions, node state transitions
- **Lucide React** — icons throughout
- **dagre (`@dagrejs/dagre`)** — auto-layout algorithm for imported graphs
- **shadcn/ui** — for dropdowns, tooltips, sliders, badges (install: `npx shadcn@latest init`)

---

## Visual design system

### Color palette (dark theme only — no light mode)
```
Background canvas:    #0a0a0a  (near-black)
Surface primary:      #111111  (panels, sidebars)
Surface elevated:     #1a1a1a  (cards, node bodies)
Surface hover:        #222222
Border default:       #2a2a2a
Border subtle:        #1f1f1f
Border accent:        #3a3a3a

Text primary:         #f0f0f0
Text secondary:       #888888
Text muted:           #555555

Accent blue:          #3b82f6  (healthy nodes, active edges, primary actions)
Accent green:         #22c55e  (healthy status, success states)
Accent amber:         #f59e0b  (degraded/warning states, traffic spike)
Accent red:           #ef4444  (failed nodes, chaos events, critical alerts)
Accent purple:        #a855f7  (blast radius highlight, impact scoring)

Node types:
  EC2 / Compute:      #1d4ed8 border, #1e3a5f fill
  RDS / Database:     #7c3aed border, #3b1f6e fill
  ALB / Load Bal:     #0891b2 border, #0c2f3d fill
  Lambda / Function:  #d97706 border, #3d2006 fill
  S3 / Storage:       #16a34a border, #0f3320 fill
  SQS / Queue:        #db2777 border, #3d0f25 fill
  ElastiCache:        #0d9488 border, #0a2e2b fill
  CloudFront / CDN:   #7c3aed border, #2e1661 fill
  API Gateway:        #0369a1 border, #0a2540 fill
  ECS / Container:    #1d4ed8 border, #0d2040 fill

Node states (overlay ring):
  healthy:   2px solid #22c55e
  degraded:  2px solid #f59e0b  + amber glow
  failed:    2px solid #ef4444  + red glow + shake animation
  simulated: 2px dashed #a855f7

Edge states:
  idle:      #2a2a2a, 1px
  active:    #3b82f6, 1.5px + animated particles
  degraded:  #f59e0b, 1.5px + slower particles
  failed:    #ef4444, 2px dashed
```

### Typography
- Font: `Inter` (import from Google Fonts)
- Canvas node labels: 11px/500
- Panel labels: 12px/400
- Panel headings: 13px/600
- Metric values: 18–24px/600 (tabular numerals: `font-variant-numeric: tabular-nums`)
- All uppercase labels: `text-[10px] tracking-widest font-medium text-[#555]`

### Spacing
- Panel widths: left sidebar 260px, right panel 320px
- Top toolbar height: 48px
- Bottom status bar height: 32px
- Node size: ~140px × 72px (standard), ~100px × 60px (compact)
- Border radius: nodes 8px, panels 0px (full-bleed), cards 6px, badges 4px

---

## Layout — 5-zone shell

```
┌─────────────────────────────────────────────────────┐
│                   TOP TOOLBAR (48px)                 │
├──────────┬──────────────────────────────┬────────────┤
│          │                              │            │
│  LEFT    │      CANVAS (React Flow)     │   RIGHT    │
│ SIDEBAR  │                              │   PANEL    │
│ (260px)  │      fills remaining space   │  (320px)   │
│          │                              │            │
│          │                              │            │
├──────────┴──────────────────────────────┴────────────┤
│                BOTTOM STATUS BAR (32px)              │
└─────────────────────────────────────────────────────┘
```

The canvas fills 100% of remaining height/width. Left and right panels are fixed, not overlay. On narrow screens (<1200px), right panel collapses to an icon strip.

---

## Zone 1 — Top toolbar

A single 48px bar spanning full width. Background `#111111`, bottom border `1px solid #1f1f1f`.

**Left section (logo + project):**
- Small logo mark: a hexagon SVG icon in `#3b82f6`
- App name: `"GameDay"` in white 14px/600
- `/` separator in `#333`
- Project name dropdown (default: `"prod-us-east-1"`) — clicking opens a popover with a text input to enter AWS Account ID or TFE Workspace ID, plus a list of recent projects

**Center section (simulation controls):**
This is the most prominent area. Centered in the toolbar.

- **[▶ Run Simulation]** button — primary blue, 36px tall, rounded-md, shows play icon + text. When simulation is running, transforms into **[⏹ Stop]** in red.
- Traffic intensity slider — horizontal, 120px wide, labeled `"Traffic"` above with current value `"1x"` to `"10x"`. Only active when simulation is running (grayed out otherwise).
- Chaos mode toggle — a pill toggle labeled `"Chaos"` with a lightning bolt icon. When enabled, glows amber.
- Simulation clock — when running, shows elapsed time `"00:02:14"` in monospace font, green dot pulsing.

**Right section (actions):**
- `[Import AWS]` button — outline style, cloud-upload icon — opens the AWS ingestion modal
- `[Import TFE]` button — outline style, database icon
- `[Auto Layout]` icon button — dagre layout trigger
- `[Zoom fit]` icon button
- User avatar placeholder (circle, 28px)

---

## Zone 2 — Left sidebar (Component Palette)

Background `#111111`, right border `1px solid #1f1f1f`. Fixed, not scrollable header.

**Header:**
- Title `"COMPONENTS"` in 10px tracking-widest uppercase muted
- Search input — full width, 30px tall, dark background `#1a1a1a`, placeholder `"Search..."`

**Component groups (collapsible):**

Each group has a chevron toggle and a category label. Components are displayed in a 2-column grid of draggable cards.

```
▼ COMPUTE
  [EC2]        [Lambda]
  [ECS]        [EKS]
  [Fargate]    [Batch]

▼ NETWORKING
  [ALB]        [NLB]
  [API GW]     [CloudFront]
  [Route 53]   [VPC]

▼ DATA
  [RDS]        [Aurora]
  [DynamoDB]   [ElastiCache]
  [S3]         [Redshift]

▼ MESSAGING
  [SQS]        [SNS]
  [EventBridge][Kinesis]

▼ OBSERVABILITY
  [CloudWatch] [X-Ray]
```

Each component card:
- 110px × 50px
- `#1a1a1a` background, `1px solid #2a2a2a` border, `border-radius: 6px`
- Icon (Lucide or simple SVG) centered, 20px, in the node's accent color
- Label below, 11px, text-secondary
- `cursor: grab`, hover lifts with `#222222` bg + `#3a3a3a` border
- Draggable onto canvas (React Flow `onDrop` / `onDragOver`)

**Below the palette — "SCENARIOS" section:**
A list of preset infrastructure scenarios that load a complete mock graph:
- `▷ 3-tier web app`
- `▷ Microservices mesh`
- `▷ Event-driven pipeline`
- `▷ Multi-region active-active`

Each row: small icon, name, subtle badge showing node count. Clicking loads that scenario into the canvas with a smooth animated layout.

---

## Zone 3 — Canvas (React Flow)

Background: `#0a0a0a` with a dot grid pattern:
```css
background-image: radial-gradient(circle, #1f1f1f 1px, transparent 1px);
background-size: 24px 24px;
```

### Canvas controls (floating, bottom-left of canvas)
Zoom in / Zoom out / Fit view — three icon buttons, `#1a1a1a` background, stacked vertically, slight border.

### Mini-map (bottom-right of canvas)
React Flow MiniMap, `#111111` background, node colors match their type color. 140px × 90px.

### Custom node component — `<InfraNode />`

Each node renders as a card with this structure:

```
┌──────────────────────────────┐  ← border in type color
│ [icon] EC2 Instance     [●]  │  ← status dot (green/amber/red)
│ api-server-prod-1            │  ← resource name, 11px
├──────────────────────────────┤
│ 142 RPS    23ms    0.1% err  │  ← live metrics row (when simulating)
└──────────────────────────────┘
```

Node states trigger visual changes:
- **healthy**: normal rendering, green status dot
- **degraded**: amber border glow (`box-shadow: 0 0 12px #f59e0b40`), amber dot, metrics in amber
- **failed**: red border glow (`box-shadow: 0 0 16px #ef444460`), red X icon replacing status dot, node body darkens to `#1a0808`, CSS shake keyframe plays once on transition
- **blast-radius**: purple dashed border, purple glow, percentage badge showing impact score in top-right corner

**Selected state**: `2px solid #3b82f6` border, blue glow, triggers right panel to open.

**Metrics overlay** (only when simulation running):
- Three small values in the bottom strip: `RPS`, `P99`, `ERR%`
- Values animate with `Framer Motion` number counter
- Color shifts green → amber → red as values degrade

### Custom edge component — `<TrafficEdge />`

- Bezier curved edges
- Label showing `"→ 142 RPS"` at midpoint, 10px, visible when simulating
- **Traffic particles**: small animated circles (4px, `#3b82f6`) flowing along the edge path using `stroke-dashoffset` animation. Speed proportional to RPS. Color shifts amber/red when degraded.
- Failed edges render as dashed red with no particles and an `✕` at midpoint

### Canvas context menu (right-click on node)
A dark popover at cursor position:
```
⚡ Simulate Failure
🔥 Inject Traffic Spike  
📊 View Metrics
🔗 Show Dependencies
━━━━━━━━━━━━━━━
✏️  Edit Properties
🗑️  Delete Node
```

---

## Zone 4 — Right panel (Detail + Simulation)

Background `#111111`, left border `1px solid #1f1f1f`. Opens when a node is selected OR when simulation is running. Has two modes, switched by tabs at the top.

### Tab A — "Node Details" (shows when node selected)

**Resource header:**
- Large type icon (32px) in accent color
- Resource name in 16px/600 white
- Resource type badge (`"EC2 • t3.medium"`) in muted
- Status badge (HEALTHY / DEGRADED / FAILED) with color

**Properties section:**
Key-value grid, 12px. Shows:
- Region, AZ, Instance type, VPC ID
- Tags as small pills (`env:prod`, `team:platform`)
- ARN (truncated with copy button)

**Dependencies section:**
- "Upstream (2)" — list of connected nodes with small icons
- "Downstream (4)" — list with small icons and edge type labels

**Simulation controls for this node:**
- `[Simulate Failure]` — red outline button, triggers failure on this node
- `[Inject Traffic Spike]` — amber outline button
- Failure type dropdown: `Instance crash | CPU saturation | Network partition | Latency injection | Disk full`
- Duration slider: `30s → 5min`

**Blast radius preview (shows after failure injected):**
A compact summary:
```
BLAST RADIUS
━━━━━━━━━━━━━━━━━━━
Affected nodes    7 / 23
Critical paths    2 broken
Redundancy        None found
Impact score      ████░░░░  47%
```

### Tab B — "Simulation" (shows when simulation running)

**Global metrics dashboard — 4 stat cards in 2×2 grid:**
```
┌──────────────┬──────────────┐
│  Total RPS   │  Avg Latency │
│    4,823     │    142ms     │
├──────────────┼──────────────┤
│  Error Rate  │  Throughput  │
│    0.3%      │  98.7% SLA   │
└──────────────┴──────────────┘
```
Each card: `#1a1a1a` bg, value in 24px/600 with color coding, label in muted 11px.

**Active chaos events list:**
- Each event as a row: icon + event name + target + elapsed time + `[Stop]` button
- Example: `🔥 Traffic Spike → api-gateway • 00:45` `[Stop]`
- Empty state: `"No active chaos events"` in muted text

**Timeline (last 60 seconds):**
A simple sparkline chart (build with SVG or a small recharts LineChart) showing RPS and error rate over time. Two lines: blue (RPS) and red (errors). X-axis: last 60s. Auto-scrolling.

**Team readiness timer:**
```
GAME DAY CLOCK
  ██████████████████  00:12:34
  [⏸ Pause]  [✓ Resolve Incident]
```
A progress bar + elapsed time + two action buttons. "Resolve Incident" stops the clock and shows a summary modal.

---

## Zone 5 — Bottom status bar

32px, `#111111` background, top border `1px solid #1f1f1f`.

Left: `● Live` green pulsing dot when simulation running, `○ Idle` gray dot when not
Center: breadcrumb showing `prod-us-east-1 > us-east-1 > vpc-0a1b2c3d`
Right: node count `23 nodes · 31 edges` and zoom level `87%`

---

## Modal — AWS / TFE Import

Triggered by toolbar buttons. Dark modal overlay (`rgba(0,0,0,0.8)` backdrop), centered card `520px` wide.

**Step 1 — Connect:**
```
┌──────────────────────────────────────────┐
│  Import Infrastructure                   │
│  ─────────────────────────────────────── │
│  ○ AWS Account    ● TFE Workspace        │ ← radio toggle
│                                          │
│  Account ID / Workspace ID               │
│  [________________________________]      │
│                                          │
│  [Discover Infrastructure →]             │
└──────────────────────────────────────────┘
```

**Step 2 — Discovery progress (mock animated):**
A terminal-style log view with green text on black:
```
> Connecting to AWS account 123456789012...
> Scanning us-east-1...
✓ Found 4 EC2 instances
✓ Found 2 RDS clusters  
✓ Found 1 Application Load Balancer
✓ Found 3 Lambda functions
✓ Found 2 SQS queues
> Building dependency graph...
✓ Inferred 18 connections
✓ Graph ready — 14 nodes, 18 edges
[View Infrastructure Map →]
```
Each line appears with a 200ms stagger using `setTimeout`. Typewriter effect.

**Step 3 — Preview + confirm:**
Shows a tiny thumbnail of the auto-generated graph. Button `[Load into Canvas]` triggers dagre layout and loads the mock data.

---

## Mock data — pre-loaded scenario

When the app first loads, render this mock infrastructure graph on the canvas (auto-laid out with dagre):

```javascript
// Nodes
const mockNodes = [
  { id: 'cf-1',   type: 'CloudFront',   label: 'cdn-prod',          region: 'global' },
  { id: 'alb-1',  type: 'ALB',          label: 'alb-prod-us-east',  region: 'us-east-1' },
  { id: 'apigw-1',type: 'APIGateway',   label: 'api-gw-prod',       region: 'us-east-1' },
  { id: 'ec2-1',  type: 'EC2',          label: 'api-server-1',      instanceType: 't3.medium' },
  { id: 'ec2-2',  type: 'EC2',          label: 'api-server-2',      instanceType: 't3.medium' },
  { id: 'ec2-3',  type: 'EC2',          label: 'worker-1',          instanceType: 't3.large' },
  { id: 'cache-1',type: 'ElastiCache',  label: 'redis-prod',        engine: 'Redis 7' },
  { id: 'rds-1',  type: 'RDS',          label: 'postgres-primary',  engine: 'PostgreSQL 15' },
  { id: 'rds-2',  type: 'RDS',          label: 'postgres-replica',  engine: 'PostgreSQL 15' },
  { id: 'sqs-1',  type: 'SQS',          label: 'job-queue-prod' },
  { id: 's3-1',   type: 'S3',           label: 'assets-prod-bucket' },
  { id: 'lambda-1',type:'Lambda',       label: 'image-processor' },
  { id: 'cw-1',   type: 'CloudWatch',   label: 'monitoring-prod' },
]

// Edges (dependency direction)
const mockEdges = [
  { source: 'cf-1',    target: 'alb-1' },
  { source: 'alb-1',   target: 'apigw-1' },
  { source: 'apigw-1', target: 'ec2-1' },
  { source: 'apigw-1', target: 'ec2-2' },
  { source: 'ec2-1',   target: 'cache-1' },
  { source: 'ec2-2',   target: 'cache-1' },
  { source: 'ec2-1',   target: 'rds-1' },
  { source: 'ec2-2',   target: 'rds-1' },
  { source: 'rds-1',   target: 'rds-2' },
  { source: 'ec2-3',   target: 'sqs-1' },
  { source: 'sqs-1',   target: 'lambda-1' },
  { source: 'lambda-1',target: 's3-1' },
  { source: 'ec2-1',   target: 'sqs-1' },
]
```

---

## Simulation behavior (mock)

When **[▶ Run Simulation]** is pressed:

1. All nodes transition to `healthy` state with green dots
2. Traffic particles begin flowing on all edges
3. Metrics on each node start animating (random values in healthy ranges)
4. Global metrics in right panel begin counting up

When **chaos mode is on** and simulation is running, every 8–15 seconds randomly:
- Pick a non-critical node
- Transition it to `degraded` → after 3s → `failed`
- Downstream nodes transition to `degraded`
- Right panel shows the blast radius calculation
- A toast notification appears bottom-right: `"⚠ redis-prod degraded — 3 upstream services affected"`

**Blast radius calculation (mock BFS):**
```typescript
function calculateBlastRadius(failedNodeId: string, nodes: Node[], edges: Edge[]) {
  // BFS downstream from failedNodeId
  // Return: { affectedNodeIds: string[], criticalPathsBroken: number, impactScore: number }
}
```
Wire this to update node visual states and the right panel score.

When **[⏹ Stop]** is pressed:
- All nodes return to idle state
- Particles fade out
- Metrics freeze then fade
- "Session summary" appears in right panel showing: duration, events triggered, max blast radius reached, nodes that failed

---

## Toast notification system

Bottom-right corner, stacked. Each toast:
- `#1a1a1a` background, left border in event color
- Icon + message + node name
- Auto-dismiss after 5s with progress bar
- Types: `info (blue)`, `warning (amber)`, `critical (red)`, `success (green)`

---

## File structure to generate

```
src/
├── App.tsx                          # Root layout shell
├── main.tsx
├── store/
│   └── useGameDayStore.ts           # Zustand store
├── components/
│   ├── layout/
│   │   ├── TopToolbar.tsx
│   │   ├── LeftSidebar.tsx
│   │   ├── RightPanel.tsx
│   │   └── BottomBar.tsx
│   ├── canvas/
│   │   ├── GameDayCanvas.tsx        # React Flow wrapper
│   │   ├── InfraNode.tsx            # Custom node
│   │   ├── TrafficEdge.tsx          # Custom edge with particles
│   │   ├── CanvasContextMenu.tsx
│   │   └── MiniMapCustom.tsx
│   ├── panels/
│   │   ├── NodeDetailPanel.tsx
│   │   ├── SimulationPanel.tsx
│   │   └── BlastRadiusPanel.tsx
│   ├── modals/
│   │   └── ImportModal.tsx
│   └── shared/
│       ├── MetricCard.tsx
│       ├── StatusBadge.tsx
│       └── ToastSystem.tsx
├── data/
│   ├── mockInfrastructure.ts        # Pre-loaded graph
│   └── componentPalette.ts          # Left sidebar items
├── lib/
│   ├── blastRadius.ts               # BFS calculation
│   ├── dagreLayout.ts               # Auto-layout helper
│   └── simulationEngine.ts          # Mock tick loop
└── styles/
    └── globals.css                  # Tailwind + custom keyframes
```

---

## Animations & interactions — specifics

**Node failure sequence (CSS keyframes):**
```css
@keyframes nodeShake {
  0%, 100% { transform: translateX(0); }
  20% { transform: translateX(-4px); }
  40% { transform: translateX(4px); }
  60% { transform: translateX(-3px); }
  80% { transform: translateX(3px); }
}

@keyframes pulseGlow-red {
  0%, 100% { box-shadow: 0 0 8px #ef444440; }
  50% { box-shadow: 0 0 20px #ef444480; }
}

@keyframes pulseGlow-amber {
  0%, 100% { box-shadow: 0 0 6px #f59e0b30; }
  50% { box-shadow: 0 0 14px #f59e0b60; }
}
```

**Traffic particle animation:**
Use SVG `animateMotion` on each edge's path, or CSS `stroke-dashoffset` animation on the edge SVG. Particles should be 4px circles. Multiple particles per edge (3–5), staggered `animationDelay`. Speed: healthy=`1.2s`, degraded=`2.5s`, spike=`0.4s`.

**Panel slide-in:**
Right panel uses `Framer Motion` `animate={{ x: 0 }}` from `x: 320` with `spring` easing.

**Metric number transitions:**
Use Framer Motion `useMotionValue` + `useTransform` or a simple JS interval counter for the live metric numbers.

**Import modal terminal:**
Log lines appear one by one with 200ms intervals. Each line fades in from opacity 0. Use a `useEffect` with `setTimeout` chain or a queue.

---

## Interaction requirements checklist

- [ ] Drag component from left palette → drops onto canvas as new node
- [ ] Click node → selects it, highlights it blue, opens right panel
- [ ] Right-click node → context menu
- [ ] Click canvas background → deselects node, closes detail panel (but not simulation panel if running)
- [ ] Connect two nodes: hover source node → connection handle appears → drag to target
- [ ] Double-click node → inline label edit
- [ ] Cmd/Ctrl+Z → undo last action (React Flow built-in history)
- [ ] Delete key on selected node → removes it
- [ ] Mouse wheel → zoom
- [ ] Click + drag canvas background → pan
- [ ] Click scenario in left sidebar → loads graph with animated dagre layout
- [ ] Press Play → starts simulation, all controls activate
- [ ] Press Stop → ends simulation, shows session summary
- [ ] Drag node while simulation running → node keeps its state, particles re-route
- [ ] Hover edge → highlights it, shows full RPS label

---

## Quality bar

- The canvas background dot grid must be visible at all zoom levels
- All metric values must use `font-variant-numeric: tabular-nums` so they don't jitter when updating
- Nodes must never overlap after auto-layout (dagre settings: `rankdir: 'TB'`, `ranksep: 80`, `nodesep: 50`)
- The entire app must have **zero** horizontal scrollbars at 1440px+ viewport
- Minimum usable at 1280px width (left sidebar collapses to icon-only below 1280px)
- All interactive elements must have visible hover states
- Simulation tick loop must use `requestAnimationFrame` or `setInterval` — never block the main thread
- Particle animations must use CSS/SVG animations, not JS position recalculation per frame

---

## Do not build

- Authentication / login screens
- Backend API calls (all data is mock)
- Real AWS SDK calls
- Billing / subscription UI
- Settings pages
- Mobile layout

---

## Acceptance criteria for "done"

1. App loads with the pre-built mock infrastructure graph visible on canvas
2. Left sidebar palette items are draggable onto canvas
3. Clicking a node opens the right detail panel with mock data
4. Pressing "Run Simulation" starts particle animations and live metric counters
5. Right-clicking a node and choosing "Simulate Failure" transitions that node to failed state with red glow + shake
6. Blast radius panel shows affected node count and impact score
7. Chaos mode auto-triggers random failures every ~10 seconds
8. Import modal opens, shows animated terminal discovery sequence, and loads a new mock graph
9. All four preset scenarios load correctly
10. The UI looks like a professional dark-theme engineering tool at 1440px — not a demo or prototype

