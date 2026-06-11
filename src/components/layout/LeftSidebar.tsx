import React, { useState } from 'react'
import { Search, ChevronDown, ChevronRight, Play } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { componentGroups, NODE_COLORS } from '../../data/componentPalette'
import NodeIcon from '../canvas/NodeIcon'
import { useGameDayStore } from '../../store/useGameDayStore'
import {
  mockNodes, mockEdges,
  microservicesNodes, microservicesEdges,
  eventDrivenNodes, eventDrivenEdges,
  multiRegionNodes, multiRegionEdges,
} from '../../data/mockInfrastructure'

const SCENARIOS = [
  { id: '3tier', label: '3-tier web app', nodes: mockNodes, edges: mockEdges, count: 13 },
  { id: 'microservices', label: 'Microservices mesh', nodes: microservicesNodes, edges: microservicesEdges, count: 10 },
  { id: 'event-driven', label: 'Event-driven pipeline', nodes: eventDrivenNodes, edges: eventDrivenEdges, count: 8 },
  { id: 'multi-region', label: 'Multi-region active-active', nodes: multiRegionNodes, edges: multiRegionEdges, count: 9 },
]

export default function LeftSidebar() {
  const [search, setSearch] = useState('')
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({})
  const { loadScenario } = useGameDayStore()

  const toggle = (id: string) => setCollapsed(s => ({ ...s, [id]: !s[id] }))

  const filtered = search
    ? componentGroups.map(g => ({
        ...g,
        items: g.items.filter(i => i.name.toLowerCase().includes(search.toLowerCase())),
      })).filter(g => g.items.length > 0)
    : componentGroups

  const handleDragStart = (e: React.DragEvent, item: typeof componentGroups[0]['items'][0]) => {
    e.dataTransfer.setData('application/reactflow-node', JSON.stringify(item))
    e.dataTransfer.effectAllowed = 'copy'
  }

  return (
    <aside className="w-[260px] shrink-0 bg-[#111111] border-r border-[#1f1f1f] flex flex-col h-full overflow-hidden">

      {/* Header */}
      <div className="px-3 pt-3 pb-2 shrink-0">
        <p className="label-uppercase mb-2">Components</p>
        <div className="relative">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#555]" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search..."
            className="w-full h-8 bg-[#1a1a1a] border border-[#2a2a2a] rounded text-[12px] text-[#d0d0d0] placeholder-[#555] pl-7 pr-2 outline-none focus:border-[#3a3a3a] transition-colors"
          />
        </div>
      </div>

      {/* Component groups */}
      <div className="flex-1 overflow-y-auto scrollbar-dark px-2 space-y-1">
        {filtered.map(group => (
          <div key={group.id}>
            <button
              onClick={() => toggle(group.id)}
              className="flex items-center gap-1.5 w-full px-1 py-1.5 text-[10px] tracking-widest font-medium text-[#555] hover:text-[#888] transition-colors uppercase"
            >
              {collapsed[group.id]
                ? <ChevronRight size={11} />
                : <ChevronDown size={11} />
              }
              {group.label}
            </button>

            <AnimatePresence initial={false}>
              {!collapsed[group.id] && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="grid grid-cols-2 gap-1.5 pb-2">
                    {group.items.map(item => {
                      const colors = NODE_COLORS[item.type] ?? NODE_COLORS.DEFAULT
                      return (
                        <div
                          key={item.id}
                          draggable
                          onDragStart={e => handleDragStart(e, item)}
                          className="flex flex-col items-center justify-center gap-1.5 h-[50px] bg-[#1a1a1a] border border-[#2a2a2a] rounded-md cursor-grab select-none hover:bg-[#222] hover:border-[#3a3a3a] transition-all duration-150 active:cursor-grabbing active:scale-95"
                        >
                          <NodeIcon type={item.type} color={colors.text} size={16} />
                          <span className="text-[10px] text-[#888]">{item.name}</span>
                        </div>
                      )
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}

        {/* ── Scenarios ─────────────────────────────────────── */}
        <div className="border-t border-[#1f1f1f] pt-3 mt-2">
          <p className="label-uppercase px-1 mb-2">Scenarios</p>
          <div className="space-y-1">
            {SCENARIOS.map(s => (
              <button
                key={s.id}
                onClick={() => loadScenario(s.nodes as never, s.edges)}
                className="w-full flex items-center gap-2 px-2 py-2 rounded text-left hover:bg-[#1a1a1a] transition-colors group"
              >
                <Play size={11} className="text-[#3b82f6] shrink-0 group-hover:text-[#60a5fa]" />
                <span className="text-[11px] text-[#aaa] flex-1 truncate group-hover:text-[#d0d0d0]">
                  {s.label}
                </span>
                <span className="text-[9px] text-[#444] bg-[#1a1a1a] px-1.5 py-0.5 rounded border border-[#2a2a2a] shrink-0">
                  {s.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="h-4" />
      </div>
    </aside>
  )
}
