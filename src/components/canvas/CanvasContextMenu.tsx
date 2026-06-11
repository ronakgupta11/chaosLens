import React, { useEffect, useRef } from 'react'
import { Zap, TrendingUp, BarChart2, Share2, Edit3, Trash2 } from 'lucide-react'
import { useGameDayStore } from '../../store/useGameDayStore'

interface ContextMenuProps {
  nodeId: string
  x: number
  y: number
  onClose: () => void
}

export default function CanvasContextMenu({ nodeId, x, y, onClose }: ContextMenuProps) {
  const ref = useRef<HTMLDivElement>(null)
  const { injectFailure, injectTrafficSpike, simulationRunning, nodes } = useGameDayStore()
  const node = nodes.find(n => n.id === nodeId)

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('mousedown', handleClick)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('keydown', handleKey)
    }
  }, [onClose])

  const handleSimulateFailure = () => {
    injectFailure(nodeId, 'Instance crash')
    onClose()
  }

  const handleTrafficSpike = () => {
    injectTrafficSpike(nodeId)
    onClose()
  }

  return (
    <div
      ref={ref}
      className="fixed z-[9999] bg-[#111111] border border-[#2a2a2a] rounded-lg shadow-2xl py-1 min-w-[190px] animate-fade-in"
      style={{ left: x, top: y, boxShadow: '0 16px 48px rgba(0,0,0,0.6), 0 0 0 1px #2a2a2a' }}
    >
      {/* Node name header */}
      {node && (
        <div className="px-3 py-2 border-b border-[#1f1f1f]">
          <p className="text-[11px] font-semibold text-[#f0f0f0] truncate">{node.data.label}</p>
          <p className="text-[10px] text-[#555]">{node.data.type}</p>
        </div>
      )}

      <div className="py-1">
        <button
          className="context-menu-item w-full text-left"
          onClick={handleSimulateFailure}
        >
          <Zap size={13} className="text-[#ef4444]" />
          <span>Simulate Failure</span>
        </button>

        <button
          className="context-menu-item w-full text-left"
          onClick={handleTrafficSpike}
          disabled={!simulationRunning}
          style={{ opacity: simulationRunning ? 1 : 0.4 }}
        >
          <TrendingUp size={13} className="text-[#f59e0b]" />
          <span>Inject Traffic Spike</span>
        </button>

        <button className="context-menu-item w-full text-left" onClick={onClose}>
          <BarChart2 size={13} className="text-[#3b82f6]" />
          <span>View Metrics</span>
        </button>

        <button className="context-menu-item w-full text-left" onClick={onClose}>
          <Share2 size={13} className="text-[#888]" />
          <span>Show Dependencies</span>
        </button>

        <div className="my-1 border-t border-[#1f1f1f]" />

        <button className="context-menu-item w-full text-left" onClick={onClose}>
          <Edit3 size={13} className="text-[#888]" />
          <span>Edit Properties</span>
        </button>

        <button className="context-menu-item danger w-full text-left" onClick={onClose}>
          <Trash2 size={13} />
          <span>Delete Node</span>
        </button>
      </div>
    </div>
  )
}
