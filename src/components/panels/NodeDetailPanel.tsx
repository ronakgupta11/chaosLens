import React, { useState } from 'react'
import { Copy, Check, Zap, TrendingUp, ChevronDown } from 'lucide-react'
import { motion } from 'framer-motion'
import { useGameDayStore } from '../../store/useGameDayStore'
import { NODE_COLORS } from '../../data/componentPalette'
import NodeIcon from '../canvas/NodeIcon'
import BlastRadiusPanel from './BlastRadiusPanel'

const FAILURE_TYPES = [
  'Instance crash',
  'CPU saturation',
  'Network partition',
  'Latency injection',
  'Disk full',
]

const STATE_BADGE: Record<string, { label: string; color: string; bg: string }> = {
  idle: { label: 'IDLE', color: '#555', bg: 'rgba(85,85,85,0.1)' },
  healthy: { label: 'HEALTHY', color: '#22c55e', bg: 'rgba(34,197,94,0.1)' },
  degraded: { label: 'DEGRADED', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
  failed: { label: 'FAILED', color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
  'blast-radius': { label: 'IMPACTED', color: '#a855f7', bg: 'rgba(168,85,247,0.1)' },
}

export default function NodeDetailPanel() {
  const { selectedNodeId, nodes, edges, injectFailure, injectTrafficSpike, blastRadiusResult, simulationRunning } = useGameDayStore()
  const [copied, setCopied] = useState(false)
  const [failureType, setFailureType] = useState('Instance crash')
  const [duration, setDuration] = useState(60)

  const node = nodes.find(n => n.id === selectedNodeId)

  if (!node) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 p-6">
        <div className="w-12 h-12 rounded-full bg-[#1a1a1a] flex items-center justify-center">
          <Zap size={20} className="text-[#333]" />
        </div>
        <p className="text-[13px] text-[#555] text-center">Select a node to view its details and simulation controls</p>
      </div>
    )
  }

  const colors = NODE_COLORS[node.data.type] ?? NODE_COLORS.DEFAULT
  const badgeInfo = STATE_BADGE[node.data.state] ?? STATE_BADGE.idle

  // Edges for this node
  const upstreamEdges = edges.filter(e => e.target === node.id)
  const downstreamEdges = edges.filter(e => e.source === node.id)

  const copyArn = () => {
    navigator.clipboard.writeText(node.data.arn ?? '')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleInjectFailure = () => {
    injectFailure(node.id, failureType)
  }

  return (
    <div className="p-3 space-y-4 animate-fade-in">

      {/* Resource header */}
      <div className="flex items-start gap-3 p-3 bg-[#161616] rounded-lg border border-[#1f1f1f]">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: colors.fill, border: `1px solid ${colors.border}` }}
        >
          <NodeIcon type={node.data.type} color={colors.text} size={20} />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-[14px] font-semibold text-[#f0f0f0] truncate">{node.data.label}</h2>
          <p className="text-[11px] text-[#666] mt-0.5">{node.data.type}{node.data.instanceType ? ` • ${node.data.instanceType}` : ''}{node.data.engine ? ` • ${node.data.engine}` : ''}</p>
          <div className="mt-1.5">
            <span
              className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded"
              style={{ color: badgeInfo.color, background: badgeInfo.bg }}
            >
              {badgeInfo.label}
            </span>
          </div>
        </div>
      </div>

      {/* Properties */}
      <div>
        <p className="label-uppercase mb-2">Properties</p>
        <div className="space-y-1">
          {[
            ['Region', node.data.region ?? 'us-east-1'],
            ['AZ', node.data.az ?? 'us-east-1a'],
            ...(node.data.vpcId ? [['VPC', node.data.vpcId]] : []),
            ...(node.data.instanceType ? [['Instance', node.data.instanceType]] : []),
            ...(node.data.engine ? [['Engine', node.data.engine]] : []),
          ].map(([key, val]) => (
            <div key={key} className="flex items-center justify-between py-1 border-b border-[#1a1a1a]">
              <span className="text-[11px] text-[#555]">{key}</span>
              <span className="text-[11px] text-[#aaa]">{val}</span>
            </div>
          ))}
          {/* ARN */}
          <div className="flex items-center justify-between py-1 border-b border-[#1a1a1a]">
            <span className="text-[11px] text-[#555]">ARN</span>
            <div className="flex items-center gap-1 max-w-[170px]">
              <span className="text-[10px] text-[#666] truncate font-mono">{node.data.arn?.split(':').slice(-1)[0] ?? '—'}</span>
              <button onClick={copyArn} className="text-[#444] hover:text-[#888] transition-colors shrink-0">
                {copied ? <Check size={11} className="text-[#22c55e]" /> : <Copy size={11} />}
              </button>
            </div>
          </div>
          {/* Tags */}
          {node.data.tags && node.data.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 pt-1">
              {node.data.tags.map(tag => (
                <span key={tag} className="text-[9px] text-[#888] bg-[#1a1a1a] border border-[#2a2a2a] px-1.5 py-0.5 rounded">{tag}</span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Dependencies */}
      <div>
        <p className="label-uppercase mb-2">Dependencies</p>
        <div className="space-y-2">
          <div>
            <p className="text-[11px] text-[#555] mb-1">Upstream ({upstreamEdges.length})</p>
            {upstreamEdges.length === 0
              ? <p className="text-[11px] text-[#333]">None</p>
              : upstreamEdges.map(e => {
                const src = nodes.find(n => n.id === e.source)
                if (!src) return null
                const c = NODE_COLORS[src.data.type] ?? NODE_COLORS.DEFAULT
                return (
                  <div key={e.id} className="flex items-center gap-2 py-1">
                    <NodeIcon type={src.data.type} color={c.text} size={12} />
                    <span className="text-[11px] text-[#aaa]">{src.data.label}</span>
                  </div>
                )
              })
            }
          </div>
          <div>
            <p className="text-[11px] text-[#555] mb-1">Downstream ({downstreamEdges.length})</p>
            {downstreamEdges.length === 0
              ? <p className="text-[11px] text-[#333]">None</p>
              : downstreamEdges.map(e => {
                const tgt = nodes.find(n => n.id === e.target)
                if (!tgt) return null
                const c = NODE_COLORS[tgt.data.type] ?? NODE_COLORS.DEFAULT
                return (
                  <div key={e.id} className="flex items-center gap-2 py-1">
                    <NodeIcon type={tgt.data.type} color={c.text} size={12} />
                    <span className="text-[11px] text-[#aaa]">{tgt.data.label}</span>
                  </div>
                )
              })
            }
          </div>
        </div>
      </div>

      {/* Simulation controls */}
      <div>
        <p className="label-uppercase mb-2">Inject Chaos</p>
        <div className="space-y-2">
          {/* Failure type */}
          <div className="relative">
            <select
              value={failureType}
              onChange={e => setFailureType(e.target.value)}
              className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded px-2 py-1.5 text-[11px] text-[#d0d0d0] appearance-none outline-none focus:border-[#3a3a3a] cursor-pointer"
            >
              {FAILURE_TYPES.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
            <ChevronDown size={11} className="absolute right-2 top-1/2 -translate-y-1/2 text-[#555] pointer-events-none" />
          </div>

          {/* Duration slider */}
          <div className="flex items-center gap-2">
            <span className="label-uppercase shrink-0">Duration</span>
            <input
              type="range" min={30} max={300} step={30}
              value={duration}
              onChange={e => setDuration(Number(e.target.value))}
              className="flex-1"
            />
            <span className="text-[11px] text-[#888] font-tabular w-8 text-right shrink-0">
              {duration >= 60 ? `${Math.round(duration / 60)}m` : `${duration}s`}
            </span>
          </div>

          <div className="flex gap-2">
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={handleInjectFailure}
              className="flex-1 py-2 text-[12px] font-medium text-[#ef4444] border border-[#ef444430] rounded hover:bg-[#ef444415] transition-colors"
            >
              Simulate Failure
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={() => injectTrafficSpike(node.id)}
              disabled={!simulationRunning}
              className="flex-1 py-2 text-[12px] font-medium text-[#f59e0b] border border-[#f59e0b30] rounded hover:bg-[#f59e0b15] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Traffic Spike
            </motion.button>
          </div>
        </div>
      </div>

      {/* Blast radius */}
      {blastRadiusResult && <BlastRadiusPanel result={blastRadiusResult} totalNodes={nodes.length} />}
    </div>
  )
}
