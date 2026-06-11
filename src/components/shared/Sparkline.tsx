import React, { useEffect, useRef, useState } from 'react'

interface Props {
  rps: number
  errorRate: number
  running: boolean
}

const MAX_POINTS = 30

export default function Sparkline({ rps, errorRate, running }: Props) {
  const [rpsHistory, setRpsHistory] = useState<number[]>([])
  const [errHistory, setErrHistory] = useState<number[]>([])

  useEffect(() => {
    if (!running) return
    setRpsHistory(h => [...h.slice(-MAX_POINTS + 1), rps])
    setErrHistory(h => [...h.slice(-MAX_POINTS + 1), errorRate * 100]) // scale for vis
  }, [rps, errorRate, running])

  useEffect(() => {
    if (!running) {
      setRpsHistory([])
      setErrHistory([])
    }
  }, [running])

  const width = 280
  const height = 60

  const toPath = (data: number[], maxVal: number) => {
    if (data.length < 2) return ''
    const step = width / (MAX_POINTS - 1)
    const norm = (v: number) => height - (v / Math.max(maxVal, 1)) * height
    return data.map((v, i) => {
      const x = (MAX_POINTS - data.length + i) * step
      const y = norm(v)
      return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`
    }).join(' ')
  }

  const maxRps = Math.max(...rpsHistory, 1)

  return (
    <div className="bg-[#161616] border border-[#1f1f1f] rounded-lg p-2 overflow-hidden">
      <svg width="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" style={{ height: 60 }}>
        {/* RPS line (blue) */}
        {rpsHistory.length >= 2 && (
          <path
            d={toPath(rpsHistory, maxRps)}
            fill="none"
            stroke="#3b82f6"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}
        {/* Error rate line (red) - scaled independently */}
        {errHistory.length >= 2 && (
          <path
            d={toPath(errHistory, 100)}
            fill="none"
            stroke="#ef4444"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="3 3"
          />
        )}
      </svg>
      <div className="flex items-center gap-4 mt-1">
        <div className="flex items-center gap-1">
          <div className="w-2 h-0.5 bg-[#3b82f6] rounded" />
          <span className="text-[9px] text-[#555]">RPS</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-0.5 bg-[#ef4444] rounded" style={{ borderTop: '2px dashed #ef4444', height: 0 }} />
          <span className="text-[9px] text-[#555]">Error %</span>
        </div>
        {!running && <span className="text-[9px] text-[#333] ml-auto">Start simulation to view</span>}
      </div>
    </div>
  )
}
