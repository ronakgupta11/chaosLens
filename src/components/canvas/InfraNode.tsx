import React, { memo } from 'react'
import { Handle, Position, NodeProps } from '@xyflow/react'
import { motion } from 'framer-motion'
import { NodeState } from '../../store/useGameDayStore'
import { NODE_COLORS } from '../../data/componentPalette'
import NodeIcon from './NodeIcon'

// We work with plain Record<string, unknown> data since React Flow requires that
interface NodeData extends Record<string, unknown> {
  label: string
  type: string
  region?: string
  state?: NodeState
  metrics?: { rps: number; p99: number; errorRate: number }
  impactScore?: number
  tags?: string[]
}

const STATE_RING: Record<string, string> = {
  idle: '#2a2a2a',
  healthy: '#22c55e',
  degraded: '#f59e0b',
  failed: '#ef4444',
  'blast-radius': '#a855f7',
}

const DOT_COLOR: Record<string, string> = {
  idle: '#555555',
  healthy: '#22c55e',
  degraded: '#f59e0b',
  failed: '#ef4444',
  'blast-radius': '#a855f7',
}

function formatMetric(val: number, type: 'rps' | 'p99' | 'err'): string {
  if (type === 'rps') return val >= 1000 ? `${(val / 1000).toFixed(1)}k` : String(Math.round(val))
  if (type === 'p99') return `${Math.round(val)}ms`
  return `${val.toFixed(1)}%`
}

function metricColor(val: number, type: 'rps' | 'p99' | 'err'): string {
  if (type === 'err') {
    if (val > 5) return '#ef4444'
    if (val > 1) return '#f59e0b'
    return '#22c55e'
  }
  if (type === 'p99') {
    if (val > 300) return '#ef4444'
    if (val > 100) return '#f59e0b'
    return '#22c55e'
  }
  return '#888888'
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const InfraNode = memo(({ data: rawData, selected }: NodeProps) => {
  const data = rawData as NodeData
  const colors = NODE_COLORS[data.type as string] ?? NODE_COLORS.DEFAULT
  const state = (data.state as string) ?? 'idle'
  const hasMetrics = !!data.metrics && state !== 'idle'

  const getBorderColor = () => {
    if (selected) return '#3b82f6'
    return STATE_RING[state] ?? '#2a2a2a'
  }

  const getBoxShadow = () => {
    if (selected) return '0 0 0 1px #3b82f6, 0 0 16px rgba(59,130,246,0.25)'
    if (state === 'failed') return undefined
    if (state === 'degraded') return undefined
    if (state === 'blast-radius') return undefined
    return undefined
  }

  const getAnimClass = () => {
    if (state === 'failed') return 'node-failed'
    if (state === 'degraded') return 'node-degraded'
    if (state === 'blast-radius') return 'node-blast-radius'
    return ''
  }

  const getBodyBg = () => {
    if (state === 'failed') return '#1a0808'
    return colors.fill
  }

  const getBorderStyle = () => {
    if (state === 'blast-radius') return 'dashed'
    return 'solid'
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
      className={`relative rounded-lg overflow-hidden select-none border-2 ${getAnimClass()}`}
      style={{
        width: 150,
        background: getBodyBg(),
        borderColor: getBorderColor(),
        borderStyle: getBorderStyle(),
        boxShadow: getBoxShadow(),
        minHeight: hasMetrics ? 76 : 60,
      }}
    >
      {/* Handles */}
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />

      {/* Impact score badge */}
      {state === 'blast-radius' && data.impactScore != null && (
        <div className="absolute -top-2 -right-2 z-10 bg-purple-900 border border-purple-500 text-purple-300 text-[9px] font-bold px-1.5 py-0.5 rounded-full leading-none">
          {data.impactScore as number}%
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-1.5 px-2 pt-2 pb-1">
        <div className="flex-shrink-0">
          <NodeIcon type={data.type as string} color={colors.text} size={14} />
        </div>
        <span
          className="flex-1 text-[11px] font-semibold leading-tight truncate"
          style={{ color: colors.text }}
        >
          {data.type as string}
        </span>

        {/* Status dot */}
        {state === 'failed' ? (
          <span className="text-[#ef4444] text-[11px] font-bold leading-none">✕</span>
        ) : (
          <motion.div
            className="w-2 h-2 rounded-full flex-shrink-0"
            style={{ background: DOT_COLOR[state] ?? '#555' }}
            animate={state === 'healthy' ? { scale: [1, 1.3, 1], opacity: [1, 0.7, 1] } : {}}
            transition={{ duration: 2, repeat: Infinity }}
          />
        )}
      </div>

      {/* Resource name */}
      <div className="px-2 pb-1">
        <span className="text-[10px] text-[#888] leading-tight block truncate">{data.label as string}</span>
      </div>

      {/* Metrics strip */}
      {hasMetrics && data.metrics && (
        <div
          className="flex items-center justify-between px-2 py-1 border-t font-tabular"
          style={{ borderColor: '#1f1f1f' }}
        >
          <span className="text-[9px]">
            <span style={{ color: '#aaa' }}>{formatMetric((data.metrics as { rps: number; p99: number; errorRate: number }).rps, 'rps')}</span>
            <span className="text-[8px] block" style={{ color: '#555' }}>RPS</span>
          </span>
          <span className="text-[9px]">
            <span style={{ color: metricColor((data.metrics as { rps: number; p99: number; errorRate: number }).p99, 'p99') }}>{formatMetric((data.metrics as { rps: number; p99: number; errorRate: number }).p99, 'p99')}</span>
            <span className="text-[8px] block" style={{ color: '#555' }}>P99</span>
          </span>
          <span className="text-[9px]">
            <span style={{ color: metricColor((data.metrics as { rps: number; p99: number; errorRate: number }).errorRate, 'err') }}>{formatMetric((data.metrics as { rps: number; p99: number; errorRate: number }).errorRate, 'err')}</span>
            <span className="text-[8px] block" style={{ color: '#555' }}>ERR%</span>
          </span>
        </div>
      )}
    </motion.div>
  )
})

InfraNode.displayName = 'InfraNode'
export default InfraNode
