import React, { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Square, CheckCircle, Pause, Flame, TrendingUp } from 'lucide-react'
import { useGameDayStore } from '../../store/useGameDayStore'
import MetricCard from '../shared/MetricCard'
import Sparkline from '../shared/Sparkline'

function formatClock(seconds: number) {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  return [h > 0 ? String(h).padStart(2, '0') : null, String(m).padStart(2, '0'), String(s).padStart(2, '0')]
    .filter(Boolean).join(':')
}

const EVENT_ICONS: Record<string, React.ReactNode> = {
  failure: <Flame size={12} className="text-[#ef4444]" />,
  'traffic-spike': <TrendingUp size={12} className="text-[#f59e0b]" />,
  latency: <TrendingUp size={12} className="text-[#a855f7]" />,
  cpu: <Flame size={12} className="text-[#f59e0b]" />,
  network: <Flame size={12} className="text-[#3b82f6]" />,
}

export default function SimulationPanel() {
  const {
    simulationRunning, simulationClock, simulationPaused,
    nodes, activeEvents, stopChaosEvent,
    pauseSimulation, stopSimulation, sessionSummary,
  } = useGameDayStore()

  // Aggregate metrics
  const totalRps = useMemo(() =>
    nodes.reduce((sum, n) => sum + (n.data.metrics?.rps ?? 0), 0), [nodes])
  const avgLatency = useMemo(() => {
    const active = nodes.filter(n => n.data.metrics?.p99)
    return active.length ? Math.round(active.reduce((s, n) => s + (n.data.metrics?.p99 ?? 0), 0) / active.length) : 0
  }, [nodes])
  const avgErrorRate = useMemo(() => {
    const active = nodes.filter(n => n.data.metrics?.errorRate != null)
    return active.length ? parseFloat((active.reduce((s, n) => s + (n.data.metrics?.errorRate ?? 0), 0) / active.length).toFixed(2)) : 0
  }, [nodes])
  const sla = useMemo(() => parseFloat(Math.max(0, 100 - avgErrorRate * 2).toFixed(1)), [avgErrorRate])

  const progressPct = Math.min((simulationClock / 1800) * 100, 100)

  // Session summary
  if (!simulationRunning && sessionSummary) {
    return (
      <div className="p-3 space-y-4 animate-fade-in">
        <div className="p-3 bg-[#0f2010] border border-[#22c55e30] rounded-lg">
          <p className="text-[#22c55e] text-[12px] font-semibold mb-2 flex items-center gap-1.5">
            <CheckCircle size={14} /> Session Complete
          </p>
          <div className="space-y-1.5 text-[11px]">
            <div className="flex justify-between"><span className="text-[#555]">Duration</span><span className="text-[#aaa] font-tabular">{formatClock(sessionSummary.duration)}</span></div>
            <div className="flex justify-between"><span className="text-[#555]">Events triggered</span><span className="text-[#aaa]">{sessionSummary.eventsTriggered}</span></div>
            <div className="flex justify-between"><span className="text-[#555]">Max blast radius</span><span className="text-[#ef4444]">{sessionSummary.maxBlastRadius}%</span></div>
            {sessionSummary.failedNodes.length > 0 && (
              <div>
                <span className="text-[#555]">Failed nodes:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {sessionSummary.failedNodes.map(n => (
                    <span key={n} className="text-[9px] text-[#ef4444] bg-[#1a0808] border border-[#ef444430] px-1.5 py-0.5 rounded">{n}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-3 space-y-4">

      {/* Global metrics 2×2 */}
      <div className="grid grid-cols-2 gap-2">
        <MetricCard
          label="Total RPS"
          value={totalRps >= 1000 ? `${(totalRps / 1000).toFixed(1)}k` : String(totalRps)}
          color="#3b82f6"
          isLive={simulationRunning}
        />
        <MetricCard
          label="Avg Latency"
          value={`${avgLatency}ms`}
          color={avgLatency > 300 ? '#ef4444' : avgLatency > 100 ? '#f59e0b' : '#22c55e'}
          isLive={simulationRunning}
        />
        <MetricCard
          label="Error Rate"
          value={`${avgErrorRate}%`}
          color={avgErrorRate > 5 ? '#ef4444' : avgErrorRate > 1 ? '#f59e0b' : '#22c55e'}
          isLive={simulationRunning}
        />
        <MetricCard
          label="Throughput"
          value={`${sla}% SLA`}
          color={sla < 95 ? '#ef4444' : sla < 99 ? '#f59e0b' : '#22c55e'}
          isLive={simulationRunning}
        />
      </div>

      {/* Sparkline */}
      <div>
        <p className="label-uppercase mb-2">Last 60 Seconds</p>
        <Sparkline rps={totalRps} errorRate={avgErrorRate} running={simulationRunning} />
      </div>

      {/* Active chaos events */}
      <div>
        <p className="label-uppercase mb-2">Active Chaos Events</p>
        {activeEvents.length === 0 ? (
          <p className="text-[11px] text-[#333] py-2">No active chaos events</p>
        ) : (
          <div className="space-y-1.5">
            {activeEvents.map(ev => (
              <motion.div
                key={ev.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded px-2 py-1.5"
              >
                {EVENT_ICONS[ev.type] ?? <Flame size={12} />}
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] text-[#d0d0d0] truncate">{ev.nodeLabel}</p>
                  <p className="text-[9px] text-[#555] font-tabular">{ev.elapsed}</p>
                </div>
                <button
                  onClick={() => stopChaosEvent(ev.id)}
                  className="text-[9px] text-[#555] hover:text-[#ef4444] border border-[#2a2a2a] hover:border-[#ef444430] px-1.5 py-0.5 rounded transition-colors"
                >
                  Stop
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Game Day Clock */}
      <div>
        <p className="label-uppercase mb-2">Game Day Clock</p>
        <div className="p-3 bg-[#161616] rounded-lg border border-[#1f1f1f]">
          {/* Progress bar */}
          <div className="h-1.5 bg-[#1f1f1f] rounded-full overflow-hidden mb-2">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-[#3b82f6] to-[#22c55e]"
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>

          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] text-[#555]">Elapsed</p>
            <p className="text-[20px] font-semibold text-[#f0f0f0] font-mono font-tabular">
              {formatClock(simulationClock)}
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={pauseSimulation}
              className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-[11px] text-[#888] border border-[#2a2a2a] rounded hover:bg-[#1a1a1a] hover:text-[#d0d0d0] transition-colors"
            >
              <Pause size={11} />
              {simulationPaused ? 'Resume' : 'Pause'}
            </button>
            <button
              onClick={stopSimulation}
              className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-[11px] text-[#22c55e] border border-[#22c55e30] rounded hover:bg-[#22c55e10] transition-colors"
            >
              <CheckCircle size={11} />
              Resolve Incident
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
