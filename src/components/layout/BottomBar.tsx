import React from 'react'
import { motion } from 'framer-motion'
import { useGameDayStore } from '../../store/useGameDayStore'

export default function BottomBar() {
  const { simulationRunning, nodes, edges, zoomLevel } = useGameDayStore()

  return (
    <footer className="h-8 flex items-center justify-between px-4 bg-[#111111] border-t border-[#1f1f1f] shrink-0 text-[11px]">

      {/* Live / Idle indicator */}
      <div className="flex items-center gap-1.5">
        {simulationRunning ? (
          <>
            <motion.div
              className="w-2 h-2 rounded-full bg-[#22c55e]"
              animate={{ opacity: [1, 0.3, 1], scale: [1, 0.8, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            <span className="text-[#22c55e] font-medium">Live</span>
          </>
        ) : (
          <>
            <div className="w-2 h-2 rounded-full border border-[#444]" />
            <span className="text-[#555]">Idle</span>
          </>
        )}
      </div>

      {/* Breadcrumb */}
      <div className="flex items-center gap-1 text-[#555]">
        <span>prod-us-east-1</span>
        <span className="text-[#333]">›</span>
        <span>us-east-1</span>
        <span className="text-[#333]">›</span>
        <span>vpc-0a1b2c3d</span>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-3 text-[#555]">
        <span>
          <span className="text-[#888]">{nodes.length}</span> nodes
          {' · '}
          <span className="text-[#888]">{edges.length}</span> edges
        </span>
        <span className="text-[#333]">|</span>
        <span className="font-tabular">
          {Math.round(zoomLevel * 100)}%
        </span>
      </div>
    </footer>
  )
}
