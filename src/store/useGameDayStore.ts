import { create } from 'zustand'
import { Node, Edge, applyNodeChanges, applyEdgeChanges, NodeChange, EdgeChange } from '@xyflow/react'
import { mockNodes, mockEdges } from '../data/mockInfrastructure'
import { calculateBlastRadius } from '../lib/blastRadius'
import { applyDagreLayout } from '../lib/dagreLayout'

export type NodeState = 'idle' | 'healthy' | 'degraded' | 'failed' | 'blast-radius'

export interface NodeMetrics {
  rps: number
  p99: number
  errorRate: number
}

export interface InfraNodeData {
  label: string
  type: string
  region?: string
  az?: string
  instanceType?: string
  engine?: string
  state: NodeState
  metrics?: NodeMetrics
  tags?: string[]
  arn?: string
  vpcId?: string
  impactScore?: number
  [key: string]: unknown
}

export interface ActiveChaosEvent {
  id: string
  type: 'failure' | 'traffic-spike' | 'latency' | 'cpu' | 'network'
  nodeId: string
  nodeLabel: string
  startedAt: number
  elapsed: string
}

export interface Toast {
  id: string
  type: 'info' | 'warning' | 'critical' | 'success'
  message: string
  nodeName?: string
}

export interface BlastRadiusResult {
  affectedNodeIds: string[]
  criticalPathsBroken: number
  impactScore: number
  redundancyFound: boolean
}

export interface SessionSummary {
  duration: number
  eventsTriggered: number
  maxBlastRadius: number
  failedNodes: string[]
}

interface GameDayState {
  // Flow state
  nodes: Node<InfraNodeData>[]
  edges: Edge[]
  onNodesChange: (changes: NodeChange[]) => void
  onEdgesChange: (changes: EdgeChange[]) => void

  // Selection
  selectedNodeId: string | null
  setSelectedNode: (id: string | null) => void

  // Right panel
  rightPanelTab: 'details' | 'simulation'
  setRightPanelTab: (tab: 'details' | 'simulation') => void

  // Simulation
  simulationRunning: boolean
  chaosMode: boolean
  trafficIntensity: number
  simulationClock: number
  simulationPaused: boolean
  startSimulation: () => void
  stopSimulation: () => void
  pauseSimulation: () => void
  resolveIncident: () => void
  setChaosMode: (on: boolean) => void
  setTrafficIntensity: (val: number) => void
  tickSimulation: () => void

  // Chaos events
  activeEvents: ActiveChaosEvent[]
  stopChaosEvent: (id: string) => void

  // Toasts
  toasts: Toast[]
  addToast: (toast: Omit<Toast, 'id'>) => void
  removeToast: (id: string) => void

  // Blast radius
  blastRadiusResult: BlastRadiusResult | null
  setBlastRadius: (result: BlastRadiusResult | null) => void

  // Session summary
  sessionSummary: SessionSummary | null

  // Modals
  importModalOpen: boolean
  setImportModalOpen: (open: boolean) => void

  // Canvas actions
  injectFailure: (nodeId: string, failureType: string) => void
  injectTrafficSpike: (nodeId: string) => void
  loadScenario: (nodes: Node<InfraNodeData>[], edges: Edge[]) => void
  updateNodeState: (nodeId: string, state: NodeState, metrics?: NodeMetrics) => void
  updateNodeMetrics: (nodeId: string, metrics: NodeMetrics) => void
  addNode: (node: Node<InfraNodeData>) => void

  // Zoom
  zoomLevel: number
  setZoomLevel: (level: number) => void
}

const generateHealthyMetrics = (intensity = 1): NodeMetrics => ({
  rps: Math.round((100 + Math.random() * 400) * intensity),
  p99: Math.round(10 + Math.random() * 60),
  errorRate: parseFloat((Math.random() * 0.3).toFixed(2)),
})

const generateDegradedMetrics = (): NodeMetrics => ({
  rps: Math.round(50 + Math.random() * 150),
  p99: Math.round(200 + Math.random() * 500),
  errorRate: parseFloat((2 + Math.random() * 8).toFixed(2)),
})

let chaosTimer: ReturnType<typeof setTimeout> | null = null
let clockInterval: ReturnType<typeof setInterval> | null = null
let metricsInterval: ReturnType<typeof setInterval> | null = null

export const useGameDayStore = create<GameDayState>((set, get) => ({
  // ─── Flow state ────────────────────────────────────────────────
  nodes: (() => {
    const laid = applyDagreLayout(
      mockNodes.map(n => ({ ...n, data: { ...n.data, state: 'idle' as NodeState } })),
      mockEdges
    ) as Node<InfraNodeData>[]
    return laid
  })(),
  edges: mockEdges.map(e => ({ ...e, data: {} })),

  onNodesChange: (changes) =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    set(s => ({ nodes: applyNodeChanges(changes, s.nodes) as any })),
  onEdgesChange: (changes) =>
    set(s => ({ edges: applyEdgeChanges(changes, s.edges) })),

  // ─── Selection ─────────────────────────────────────────────────
  selectedNodeId: null,
  setSelectedNode: (id) => set({ selectedNodeId: id }),

  // ─── Right panel ───────────────────────────────────────────────
  rightPanelTab: 'details',
  setRightPanelTab: (tab) => set({ rightPanelTab: tab }),

  // ─── Simulation ────────────────────────────────────────────────
  simulationRunning: false,
  chaosMode: false,
  trafficIntensity: 1,
  simulationClock: 0,
  simulationPaused: false,
  sessionSummary: null,

  startSimulation: () => {
    const intensity = get().trafficIntensity

    set(s => ({
      simulationRunning: true,
      simulationClock: 0,
      simulationPaused: false,
      sessionSummary: null,
      rightPanelTab: 'simulation',
      blastRadiusResult: null,
      activeEvents: [],
      nodes: s.nodes.map(n => ({
        ...n,
        data: {
          ...n.data,
          state: 'healthy',
          metrics: generateHealthyMetrics(intensity),
        },
      })),
      edges: s.edges.map(e => ({ ...e, data: { ...((e.data as Record<string, unknown>) ?? {}), state: 'active', rps: Math.round(50 + Math.random() * 300) } })),
    }))

    // Clock ticker
    clockInterval = setInterval(() => {
      if (!get().simulationPaused) {
        set(s => ({ simulationClock: s.simulationClock + 1 }))
      }
    }, 1000)

    // Metrics ticker
    metricsInterval = setInterval(() => {
      if (get().simulationPaused) return
      get().tickSimulation()
    }, 2000)

    // Chaos engine
    const scheduleChaos = () => {
      const delay = 8000 + Math.random() * 7000
      chaosTimer = setTimeout(() => {
        const { simulationRunning, chaosMode, nodes } = get()
        if (!simulationRunning || !chaosMode) return

        const candidates = nodes.filter(n => n.data.state === 'healthy')
        if (candidates.length === 0) return scheduleChaos()

        const target = candidates[Math.floor(Math.random() * candidates.length)]
        get().injectFailure(target.id, 'Instance crash')
        scheduleChaos()
      }, delay)
    }

    if (get().chaosMode) scheduleChaos()
  },

  stopSimulation: () => {
    if (clockInterval) clearInterval(clockInterval)
    if (metricsInterval) clearInterval(metricsInterval)
    if (chaosTimer) clearTimeout(chaosTimer)
    clockInterval = null; metricsInterval = null; chaosTimer = null

    const { simulationClock, activeEvents, nodes } = get()
    const failedNodes = nodes.filter(n => n.data.state === 'failed').map(n => n.data.label)

    set(s => ({
      simulationRunning: false,
      simulationPaused: false,
      activeEvents: [],
      blastRadiusResult: null,
      sessionSummary: {
        duration: simulationClock,
        eventsTriggered: activeEvents.length,
        maxBlastRadius: s.blastRadiusResult?.impactScore ?? 0,
        failedNodes,
      },
      nodes: s.nodes.map(n => ({
        ...n,
        data: { ...n.data, state: 'idle', metrics: undefined },
      })),
      edges: s.edges.map(e => ({ ...e, data: { ...((e.data as Record<string, unknown>) ?? {}), state: 'idle', rps: 0 } })),
    }))
  },

  pauseSimulation: () => set(s => ({ simulationPaused: !s.simulationPaused })),
  resolveIncident: () => get().stopSimulation(),

  setChaosMode: (on) => {
    set({ chaosMode: on })
    if (on && get().simulationRunning) {
      const scheduleChaos = () => {
        const delay = 8000 + Math.random() * 7000
        chaosTimer = setTimeout(() => {
          const { simulationRunning, chaosMode, nodes } = get()
          if (!simulationRunning || !chaosMode) return
          const candidates = nodes.filter(n => n.data.state === 'healthy')
          if (candidates.length === 0) return scheduleChaos()
          const target = candidates[Math.floor(Math.random() * candidates.length)]
          get().injectFailure(target.id, 'Chaos event')
          scheduleChaos()
        }, delay)
      }
      scheduleChaos()
    } else if (!on && chaosTimer) {
      clearTimeout(chaosTimer)
      chaosTimer = null
    }
  },

  setTrafficIntensity: (val) => set({ trafficIntensity: val }),

  tickSimulation: () => {
    const { nodes, trafficIntensity } = get()
    set({
      nodes: nodes.map(n => {
        if (n.data.state === 'healthy') {
          return { ...n, data: { ...n.data, metrics: generateHealthyMetrics(trafficIntensity) } }
        } else if (n.data.state === 'degraded') {
          return { ...n, data: { ...n.data, metrics: generateDegradedMetrics() } }
        }
        return n
      }),
      edges: get().edges.map(e => ({
        ...e,
        data: {
          ...((e.data as Record<string, unknown>) ?? {}),
          rps: Math.round((30 + Math.random() * 400) * trafficIntensity),
        },
      })),
    })
  },

  // ─── Chaos events ─────────────────────────────────────────────
  activeEvents: [],

  stopChaosEvent: (id) => {
    const { activeEvents, nodes } = get()
    const event = activeEvents.find(e => e.id === id)
    if (event) {
      set({
        activeEvents: activeEvents.filter(e => e.id !== id),
        nodes: nodes.map(n =>
          n.id === event.nodeId ? { ...n, data: { ...n.data, state: 'healthy', metrics: generateHealthyMetrics() } } : n
        ),
      })
    }
  },

  // ─── Toasts ────────────────────────────────────────────────────
  toasts: [],
  addToast: (toast) => {
    const id = crypto.randomUUID()
    set(s => ({ toasts: [...s.toasts.slice(-4), { ...toast, id }] }))
    setTimeout(() => get().removeToast(id), 5500)
  },
  removeToast: (id) => set(s => ({ toasts: s.toasts.filter(t => t.id !== id) })),

  // ─── Blast radius ─────────────────────────────────────────────
  blastRadiusResult: null,
  setBlastRadius: (result) => set({ blastRadiusResult: result }),

  // ─── Modals ────────────────────────────────────────────────────
  importModalOpen: false,
  setImportModalOpen: (open) => set({ importModalOpen: open }),

  // ─── Canvas actions ───────────────────────────────────────────
  injectFailure: (nodeId, failureType) => {
    const { nodes, edges, addToast, setBlastRadius } = get()
    const node = nodes.find(n => n.id === nodeId)
    if (!node) return

    // Transition: degraded → failed
    set(s => ({
      nodes: s.nodes.map(n =>
        n.id === nodeId ? { ...n, data: { ...n.data, state: 'degraded', metrics: generateDegradedMetrics() } } : n
      ),
    }))

    setTimeout(() => {
      set(s => ({
        nodes: s.nodes.map(n =>
          n.id === nodeId ? { ...n, data: { ...n.data, state: 'failed', metrics: { rps: 0, p99: 999, errorRate: 100 } } } : n
        ),
        edges: s.edges.map(e =>
          e.source === nodeId || e.target === nodeId
            ? { ...e, data: { ...((e.data as Record<string, unknown>) ?? {}), state: 'failed' } }
            : e
        ),
      }))

      // Blast radius
      const result = calculateBlastRadius(nodeId, get().nodes as Node<InfraNodeData>[], edges)
      setBlastRadius(result)

      // Affect downstream
      set(s => ({
        nodes: s.nodes.map(n =>
          result.affectedNodeIds.includes(n.id) && n.id !== nodeId
            ? { ...n, data: { ...n.data, state: 'blast-radius', impactScore: result.impactScore } }
            : n
        ),
      }))

      const eventId = crypto.randomUUID()
      set(s => ({
        activeEvents: [
          ...s.activeEvents,
          {
            id: eventId,
            type: 'failure',
            nodeId,
            nodeLabel: node.data.label,
            startedAt: Date.now(),
            elapsed: '00:00',
          },
        ],
        rightPanelTab: 'simulation',
      }))

      addToast({
        type: 'critical',
        message: `${node.data.label} failed — ${result.affectedNodeIds.length} upstream services affected`,
        nodeName: node.data.label,
      })

      // Elapsed time ticker for event
      const ticker = setInterval(() => {
        const events = get().activeEvents
        const ev = events.find(e => e.id === eventId)
        if (!ev) { clearInterval(ticker); return }
        const elapsed = Math.floor((Date.now() - ev.startedAt) / 1000)
        const mm = String(Math.floor(elapsed / 60)).padStart(2, '0')
        const ss = String(elapsed % 60).padStart(2, '0')
        set(s => ({
          activeEvents: s.activeEvents.map(e =>
            e.id === eventId ? { ...e, elapsed: `${mm}:${ss}` } : e
          ),
        }))
      }, 1000)
    }, 3000)

    addToast({
      type: 'warning',
      message: `${node.data.label} degrading — ${failureType}`,
      nodeName: node.data.label,
    })
  },

  injectTrafficSpike: (nodeId) => {
    const { nodes, addToast } = get()
    const node = nodes.find(n => n.id === nodeId)
    if (!node) return

    const eventId = crypto.randomUUID()
    set(s => ({
      nodes: s.nodes.map(n =>
        n.id === nodeId
          ? { ...n, data: { ...n.data, metrics: { rps: 2000 + Math.random() * 3000, p99: 150 + Math.random() * 300, errorRate: 1 + Math.random() * 5 } } }
          : n
      ),
      activeEvents: [...s.activeEvents, {
        id: eventId, type: 'traffic-spike', nodeId,
        nodeLabel: node.data.label, startedAt: Date.now(), elapsed: '00:00',
      }],
    }))

    addToast({ type: 'warning', message: `Traffic spike injected on ${node.data.label}`, nodeName: node.data.label })

    setTimeout(() => {
      set(s => ({
        activeEvents: s.activeEvents.filter(e => e.id !== eventId),
        nodes: s.nodes.map(n =>
          n.id === nodeId ? { ...n, data: { ...n.data, metrics: generateHealthyMetrics(get().trafficIntensity) } } : n
        ),
      }))
    }, 30000)
  },

  loadScenario: (newNodes, newEdges) => {
    const laid = applyDagreLayout(newNodes, newEdges) as Node<InfraNodeData>[]
    set({
      nodes: laid,
      edges: newEdges,
      selectedNodeId: null,
      blastRadiusResult: null,
      activeEvents: [],
      sessionSummary: null,
    })
  },

  updateNodeState: (nodeId, state, metrics) =>
    set(s => ({
      nodes: s.nodes.map(n =>
        n.id === nodeId ? { ...n, data: { ...n.data, state, metrics: metrics ?? n.data.metrics } } : n
      ),
    })),

  updateNodeMetrics: (nodeId, metrics) =>
    set(s => ({
      nodes: s.nodes.map(n => n.id === nodeId ? { ...n, data: { ...n.data, metrics } } : n),
    })),

  addNode: (node) => set(s => ({ nodes: [...s.nodes, node] })),

  // ─── Zoom ─────────────────────────────────────────────────────
  zoomLevel: 1,
  setZoomLevel: (level) => set({ zoomLevel: level }),
}))
