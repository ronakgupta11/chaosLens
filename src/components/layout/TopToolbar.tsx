import React, { useState } from 'react'
import {
  Play, Square, Zap, CloudUpload, Database,
  LayoutGrid, Maximize2, ChevronDown, Clock
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameDayStore } from '../../store/useGameDayStore'

function formatClock(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (h > 0) return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export default function TopToolbar() {
  const {
    simulationRunning, chaosMode, trafficIntensity, simulationClock,
    startSimulation, stopSimulation, setChaosMode, setTrafficIntensity,
    setImportModalOpen,
  } = useGameDayStore()

  const [showProjectMenu, setShowProjectMenu] = useState(false)

  const handleAutoLayout = () => {
    const fn = (window as unknown as Record<string, unknown>).__gameDayAutoLayout as (() => void) | undefined
    fn?.()
  }

  return (
    <header className="flex items-center h-12 px-3 bg-[#111111] border-b border-[#1f1f1f] shrink-0 z-50 relative gap-4">

      {/* ── LEFT: Logo + Project ─────────────────────────────── */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Hex logo */}
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
          <path
            d="M11 2L19.66 7V17L11 22L2.34 17V7L11 2Z"
            fill="#1d3a6e"
            stroke="#3b82f6"
            strokeWidth="1.5"
          />
          <path d="M7 11.5L10 14L15 9" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span className="text-[14px] font-semibold text-white tracking-tight">GameDay</span>
        <span className="text-[#333] text-sm">/</span>

        {/* Project dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowProjectMenu(v => !v)}
            className="flex items-center gap-1.5 px-2 py-1 rounded text-[12px] text-[#d0d0d0] hover:bg-[#1a1a1a] hover:text-white transition-colors"
          >
            prod-us-east-1
            <ChevronDown size={11} className="text-[#555]" />
          </button>

          <AnimatePresence>
            {showProjectMenu && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.15 }}
                className="absolute left-0 top-full mt-1 w-64 bg-[#161616] border border-[#2a2a2a] rounded-lg shadow-2xl z-50 p-2"
              >
                <p className="label-uppercase px-2 mb-2">Recent Projects</p>
                {['prod-us-east-1', 'staging-us-east-1', 'prod-eu-west-1'].map(p => (
                  <button
                    key={p}
                    onClick={() => setShowProjectMenu(false)}
                    className="w-full text-left px-2 py-1.5 rounded text-[12px] text-[#d0d0d0] hover:bg-[#222] hover:text-white transition-colors"
                  >
                    {p}
                  </button>
                ))}
                <div className="border-t border-[#1f1f1f] mt-2 pt-2">
                  <input
                    className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded px-2 py-1.5 text-[11px] text-[#f0f0f0] placeholder-[#555] outline-none focus:border-[#3b82f6]"
                    placeholder="AWS Account ID or TFE Workspace ID"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* ── CENTER: Simulation Controls ──────────────────────── */}
      <div className="flex items-center gap-3 shrink-0">

        {/* Run / Stop button */}
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={simulationRunning ? stopSimulation : startSimulation}
          className={`flex items-center gap-1.5 px-4 h-9 rounded-md text-[13px] font-semibold transition-all duration-200 ${
            simulationRunning
              ? 'bg-[#ef4444] hover:bg-[#dc2626] text-white'
              : 'bg-[#3b82f6] hover:bg-[#2563eb] text-white'
          }`}
          style={{ boxShadow: simulationRunning ? '0 0 12px rgba(239,68,68,0.35)' : '0 0 12px rgba(59,130,246,0.35)' }}
        >
          {simulationRunning ? <Square size={14} /> : <Play size={14} />}
          {simulationRunning ? 'Stop' : 'Run Simulation'}
        </motion.button>

        {/* Traffic slider */}
        <div className="flex flex-col items-center gap-0.5">
          <div className="flex items-center justify-between w-full">
            <span className="label-uppercase">Traffic</span>
            <span className="text-[10px] font-semibold text-[#3b82f6] font-tabular">{trafficIntensity}x</span>
          </div>
          <input
            type="range"
            min={1}
            max={10}
            step={1}
            value={trafficIntensity}
            disabled={!simulationRunning}
            onChange={e => setTrafficIntensity(Number(e.target.value))}
            className="w-28"
          />
        </div>

        {/* Chaos toggle */}
        <button
          onClick={() => setChaosMode(!chaosMode)}
          className={`pill-toggle ${chaosMode ? 'active' : ''}`}
        >
          <Zap size={12} />
          Chaos
        </button>

        {/* Simulation clock */}
        <AnimatePresence>
          {simulationRunning && (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              className="flex items-center gap-1.5 px-2 py-1 rounded bg-[#1a1a1a] border border-[#2a2a2a]"
            >
              <motion.div
                className="w-1.5 h-1.5 rounded-full bg-[#22c55e]"
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              <span className="font-mono text-[12px] text-[#22c55e] font-tabular">
                {formatClock(simulationClock)}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* ── RIGHT: Actions ───────────────────────────────────── */}
      <div className="flex items-center gap-1.5 shrink-0">
        <button
          onClick={() => setImportModalOpen(true)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded text-[11px] text-[#aaa] border border-[#2a2a2a] hover:bg-[#1a1a1a] hover:text-white hover:border-[#3a3a3a] transition-all"
        >
          <CloudUpload size={13} />
          Import AWS
        </button>

        <button
          onClick={() => setImportModalOpen(true)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded text-[11px] text-[#aaa] border border-[#2a2a2a] hover:bg-[#1a1a1a] hover:text-white hover:border-[#3a3a3a] transition-all"
        >
          <Database size={13} />
          Import TFE
        </button>

        <button
          onClick={handleAutoLayout}
          className="p-1.5 rounded text-[#888] hover:bg-[#1a1a1a] hover:text-white transition-colors"
          title="Auto Layout (Dagre)"
        >
          <LayoutGrid size={16} />
        </button>

        <button
          className="p-1.5 rounded text-[#888] hover:bg-[#1a1a1a] hover:text-white transition-colors"
          title="Fit View"
          onClick={() => {
            const fn = (window as unknown as Record<string, unknown>).__gameDayAutoLayout as (() => void) | undefined
            fn?.()
          }}
        >
          <Maximize2 size={16} />
        </button>

        {/* Avatar */}
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#3b82f6] to-[#7c3aed] flex items-center justify-center text-white text-[10px] font-bold ml-1">
          RG
        </div>
      </div>
    </header>
  )
}
