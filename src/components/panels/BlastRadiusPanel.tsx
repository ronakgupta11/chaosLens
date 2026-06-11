import React from 'react'
import { motion } from 'framer-motion'
import { BlastRadiusResult } from '../../lib/blastRadius'

interface Props {
  result: BlastRadiusResult
  totalNodes: number
}

export default function BlastRadiusPanel({ result, totalNodes }: Props) {
  const { affectedNodeIds, criticalPathsBroken, impactScore, redundancyFound } = result
  const impactFraction = impactScore / 100

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-3 bg-[#1a0a2e] border border-[#a855f730] rounded-lg"
    >
      <p className="text-[11px] font-semibold text-[#a855f7] mb-3 flex items-center gap-1.5 uppercase tracking-wider">
        <span className="w-1.5 h-1.5 rounded-full bg-[#a855f7] inline-block" />
        Blast Radius
      </p>

      <div className="space-y-2 text-[11px]">
        <div className="flex justify-between">
          <span className="text-[#555]">Affected nodes</span>
          <span className="text-[#ef4444] font-semibold font-tabular">
            {affectedNodeIds.length} / {totalNodes}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-[#555]">Critical paths</span>
          <span className={criticalPathsBroken > 0 ? 'text-[#ef4444]' : 'text-[#22c55e]'}>
            {criticalPathsBroken > 0 ? `${criticalPathsBroken} broken` : 'Intact'}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-[#555]">Redundancy</span>
          <span className={redundancyFound ? 'text-[#22c55e]' : 'text-[#f59e0b]'}>
            {redundancyFound ? 'Found' : 'None found'}
          </span>
        </div>

        {/* Impact score bar */}
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-[#555]">Impact score</span>
            <span className="text-[#a855f7] font-semibold font-tabular">{impactScore}%</span>
          </div>
          <div className="h-2 bg-[#1f1f1f] rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${impactScore}%` }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="h-full rounded-full"
              style={{
                background: impactScore > 70
                  ? 'linear-gradient(90deg, #a855f7, #ef4444)'
                  : impactScore > 40
                  ? 'linear-gradient(90deg, #a855f7, #f59e0b)'
                  : '#a855f7',
              }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  )
}
