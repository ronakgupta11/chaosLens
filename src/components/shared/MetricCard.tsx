import React, { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface Props {
  label: string
  value: string
  color: string
  isLive?: boolean
}

export default function MetricCard({ label, value, color, isLive }: Props) {
  return (
    <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-2.5">
      <p className="label-uppercase mb-1">{label}</p>
      <AnimatePresence mode="wait">
        <motion.p
          key={value}
          initial={{ opacity: 0.5, y: 2 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-[22px] font-semibold font-tabular leading-none"
          style={{ color }}
        >
          {value}
        </motion.p>
      </AnimatePresence>
      {isLive && (
        <div className="flex items-center gap-1 mt-1">
          <motion.div
            className="w-1 h-1 rounded-full"
            style={{ background: color }}
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
          <span className="text-[9px]" style={{ color: '#555' }}>live</span>
        </div>
      )}
    </div>
  )
}
