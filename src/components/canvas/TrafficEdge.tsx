import React, { memo } from 'react'
import { EdgeProps, getBezierPath, EdgeLabelRenderer } from '@xyflow/react'

const PARTICLE_COLORS: Record<string, string> = {
  idle: '#2a2a2a',
  active: '#3b82f6',
  degraded: '#f59e0b',
  failed: '#ef4444',
}

const STROKE_COLORS: Record<string, string> = {
  idle: '#2a2a2a',
  active: '#3b82f6',
  degraded: '#f59e0b',
  failed: '#ef4444',
}

const PARTICLE_SPEEDS: Record<string, string> = {
  active: '1.2s',
  degraded: '2.5s',
  failed: '0s',
  idle: '0s',
}

// Use plain EdgeProps without generic type param
const TrafficEdge = memo(({
  id, sourceX, sourceY, targetX, targetY,
  sourcePosition, targetPosition, data, selected,
}: EdgeProps) => {
  const edgeState = (data as Record<string, unknown>)?.state as string ?? 'idle'
  const rps = (data as Record<string, unknown>)?.rps as number ?? 0

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX, sourceY, targetX, targetY,
    sourcePosition, targetPosition,
  })

  const strokeColor = selected ? '#a855f7' : (STROKE_COLORS[edgeState] ?? '#2a2a2a')
  const strokeWidth = edgeState === 'failed' ? 2 : edgeState === 'idle' ? 1 : 1.5
  const strokeDasharray = edgeState === 'failed' ? '5 5' : undefined
  const particleColor = PARTICLE_COLORS[edgeState] ?? '#2a2a2a'
  const speed = PARTICLE_SPEEDS[edgeState] ?? '0s'
  const showParticles = edgeState === 'active' || edgeState === 'degraded'
  const showLabel = (edgeState === 'active' || edgeState === 'degraded') && rps > 0

  const particles = showParticles ? [0, 0.33, 0.66] : []

  return (
    <>
      <path
        id={`edge-${id}`}
        d={edgePath}
        fill="none"
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        strokeDasharray={strokeDasharray}
        style={{ opacity: edgeState === 'idle' ? 0.4 : 1 }}
      />

      {particles.map((offset, i) => (
        <circle
          key={i}
          r={3}
          fill={particleColor}
          style={{ filter: `drop-shadow(0 0 3px ${particleColor})` }}
        >
          <animateMotion
            dur={speed}
            repeatCount="indefinite"
            begin={`${offset * parseFloat(speed)}s`}
          >
            <mpath href={`#edge-${id}`} />
          </animateMotion>
        </circle>
      ))}

      {edgeState === 'failed' && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: 'none',
              fontSize: 11,
              color: '#ef4444',
              fontWeight: 700,
            }}
            className="nodrag nopan"
          >
            ✕
          </div>
        </EdgeLabelRenderer>
      )}

      {showLabel && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: 'none',
              fontSize: 9,
              color: edgeState === 'degraded' ? '#f59e0b' : '#3b82f6',
              background: 'rgba(10,10,10,0.85)',
              padding: '1px 5px',
              borderRadius: 3,
              fontFamily: 'JetBrains Mono, monospace',
              fontVariantNumeric: 'tabular-nums',
              border: `1px solid ${edgeState === 'degraded' ? '#f59e0b33' : '#3b82f633'}`,
              whiteSpace: 'nowrap',
            }}
            className="nodrag nopan"
          >
            → {rps >= 1000 ? `${(rps / 1000).toFixed(1)}k` : rps} RPS
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  )
})

TrafficEdge.displayName = 'TrafficEdge'
export default TrafficEdge
