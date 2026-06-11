import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameDayStore } from '../../store/useGameDayStore'
import NodeDetailPanel from '../panels/NodeDetailPanel'
import SimulationPanel from '../panels/SimulationPanel'

export default function RightPanel() {
  const {
    selectedNodeId, simulationRunning, rightPanelTab, setRightPanelTab, sessionSummary,
  } = useGameDayStore()

  const isVisible = !!selectedNodeId || simulationRunning || !!sessionSummary

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.aside
          initial={{ x: 320, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 320, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="w-[320px] shrink-0 bg-[#111111] border-l border-[#1f1f1f] flex flex-col h-full overflow-hidden"
        >
          {/* Tab bar */}
          <div className="flex border-b border-[#1f1f1f] shrink-0">
            <button
              onClick={() => setRightPanelTab('details')}
              className={`flex-1 py-2.5 text-[12px] font-medium transition-colors ${rightPanelTab === 'details'
                  ? 'text-[#f0f0f0] border-b-2 border-[#3b82f6]'
                  : 'text-[#555] hover:text-[#888]'
                }`}
            >
              Node Details
            </button>
            <button
              onClick={() => setRightPanelTab('simulation')}
              className={`flex-1 py-2.5 text-[12px] font-medium transition-colors relative ${rightPanelTab === 'simulation'
                  ? 'text-[#f0f0f0] border-b-2 border-[#3b82f6]'
                  : 'text-[#555] hover:text-[#888]'
                }`}
            >
              Simulation
              {simulationRunning && (
                <span className="ml-1.5 inline-block w-1.5 h-1.5 rounded-full bg-[#22c55e] animate-pulse" />
              )}
            </button>
          </div>

          {/* Panel content */}
          <div className="flex-1 overflow-y-auto scrollbar-dark">
            {rightPanelTab === 'details' ? <NodeDetailPanel /> : <SimulationPanel />}
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  )
}
