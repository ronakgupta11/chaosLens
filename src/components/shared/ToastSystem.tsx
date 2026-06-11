import React, { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, AlertTriangle, Info, CheckCircle, AlertCircle } from 'lucide-react'
import { useGameDayStore, Toast } from '../../store/useGameDayStore'

const TOAST_CONFIG: Record<Toast['type'], { icon: React.ReactNode; borderColor: string; iconColor: string }> = {
  info:     { icon: <Info size={14} />,          borderColor: '#3b82f6', iconColor: '#3b82f6' },
  warning:  { icon: <AlertTriangle size={14} />, borderColor: '#f59e0b', iconColor: '#f59e0b' },
  critical: { icon: <AlertCircle size={14} />,   borderColor: '#ef4444', iconColor: '#ef4444' },
  success:  { icon: <CheckCircle size={14} />,   borderColor: '#22c55e', iconColor: '#22c55e' },
}

function ToastItem({ toast }: { toast: Toast }) {
  const { removeToast } = useGameDayStore()
  const config = TOAST_CONFIG[toast.type]

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 60, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 60, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 350, damping: 28 }}
      className="relative bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg shadow-xl overflow-hidden max-w-[340px]"
      style={{ borderLeft: `3px solid ${config.borderColor}` }}
    >
      <div className="flex items-start gap-2.5 p-3 pr-8">
        <span style={{ color: config.iconColor }} className="shrink-0 mt-0.5">
          {config.icon}
        </span>
        <div className="flex-1 min-w-0">
          {toast.nodeName && (
            <p className="text-[11px] font-semibold text-[#f0f0f0] mb-0.5">{toast.nodeName}</p>
          )}
          <p className="text-[11px] text-[#888] leading-snug">{toast.message}</p>
        </div>
        <button
          onClick={() => removeToast(toast.id)}
          className="absolute top-2 right-2 text-[#444] hover:text-[#888] transition-colors"
        >
          <X size={12} />
        </button>
      </div>

      {/* Auto-dismiss progress bar */}
      <div className="h-0.5 bg-[#1f1f1f]">
        <div
          className="h-full toast-progress"
          style={{ background: config.borderColor }}
        />
      </div>
    </motion.div>
  )
}

export default function ToastSystem() {
  const { toasts } = useGameDayStore()

  return (
    <div className="fixed bottom-10 right-4 z-[99999] flex flex-col gap-2 items-end pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.map(toast => (
          <div key={toast.id} className="pointer-events-auto">
            <ToastItem toast={toast} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  )
}
