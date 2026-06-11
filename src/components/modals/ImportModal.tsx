import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, CloudUpload, Database, ChevronRight } from 'lucide-react'
import { useGameDayStore } from '../../store/useGameDayStore'
import { mockNodes, mockEdges } from '../../data/mockInfrastructure'

type Step = 'connect' | 'discovery' | 'preview'
type Source = 'aws' | 'tfe'

const DISCOVERY_LINES = [
  { text: '> Initializing connection...', delay: 0, type: 'log' },
  { text: '> Scanning us-east-1 region...', delay: 600, type: 'log' },
  { text: '✓ Found 4 EC2 instances', delay: 1200, type: 'success' },
  { text: '✓ Found 2 RDS clusters', delay: 1600, type: 'success' },
  { text: '✓ Found 1 Application Load Balancer', delay: 2000, type: 'success' },
  { text: '✓ Found 3 Lambda functions', delay: 2400, type: 'success' },
  { text: '✓ Found 2 SQS queues', delay: 2800, type: 'success' },
  { text: '✓ Found 1 ElastiCache cluster', delay: 3200, type: 'success' },
  { text: '✓ Found 1 CloudFront distribution', delay: 3600, type: 'success' },
  { text: '> Building dependency graph...', delay: 4200, type: 'log' },
  { text: '✓ Inferred 13 connections', delay: 5000, type: 'success' },
  { text: '✓ Graph ready — 13 nodes, 13 edges', delay: 5400, type: 'success' },
]

export default function ImportModal() {
  const { importModalOpen, setImportModalOpen, loadScenario } = useGameDayStore()
  const [step, setStep] = useState<Step>('connect')
  const [source, setSource] = useState<Source>('aws')
  const [accountId, setAccountId] = useState('')
  const [visibleLines, setVisibleLines] = useState<number>(0)
  const terminalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!importModalOpen) {
      setStep('connect')
      setVisibleLines(0)
      setAccountId('')
    }
  }, [importModalOpen])

  useEffect(() => {
    if (step !== 'discovery') return
    setVisibleLines(0)

    const timers = DISCOVERY_LINES.map((line, i) =>
      setTimeout(() => {
        setVisibleLines(i + 1)
        terminalRef.current?.scrollTo({ top: 9999, behavior: 'smooth' })
      }, line.delay)
    )

    const complete = setTimeout(() => setStep('preview'), 6200)
    return () => { timers.forEach(clearTimeout); clearTimeout(complete) }
  }, [step])

  const handleDiscover = () => {
    if (!accountId.trim()) return
    setStep('discovery')
  }

  const handleLoad = () => {
    loadScenario(mockNodes as never, mockEdges)
    setImportModalOpen(false)
  }

  return (
    <AnimatePresence>
      {importModalOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setImportModalOpen(false)}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ type: 'spring', stiffness: 350, damping: 28 }}
            className="relative bg-[#111111] border border-[#2a2a2a] rounded-xl shadow-2xl w-[520px] max-h-[80vh] flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#1f1f1f]">
              <div>
                <h2 className="text-[15px] font-semibold text-[#f0f0f0]">Import Infrastructure</h2>
                <p className="text-[11px] text-[#555] mt-0.5">
                  {step === 'connect' ? 'Connect to your AWS account or Terraform Enterprise workspace'
                   : step === 'discovery' ? 'Scanning your infrastructure...'
                   : 'Review your infrastructure graph'}
                </p>
              </div>
              <button
                onClick={() => setImportModalOpen(false)}
                className="p-1.5 rounded text-[#555] hover:text-[#f0f0f0] hover:bg-[#1a1a1a] transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Step indicators */}
            <div className="flex items-center gap-0 px-5 py-2 border-b border-[#1a1a1a]">
              {(['connect', 'discovery', 'preview'] as Step[]).map((s, i) => (
                <React.Fragment key={s}>
                  <div className={`flex items-center gap-1.5 text-[10px] font-medium ${step === s ? 'text-[#3b82f6]' : i < ['connect','discovery','preview'].indexOf(step) ? 'text-[#22c55e]' : 'text-[#333]'}`}>
                    <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] ${step === s ? 'bg-[#3b82f6] text-white' : i < ['connect','discovery','preview'].indexOf(step) ? 'bg-[#22c55e] text-black' : 'bg-[#1f1f1f] text-[#333]'}`}>{i + 1}</span>
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </div>
                  {i < 2 && <ChevronRight size={12} className="text-[#333] mx-2" />}
                </React.Fragment>
              ))}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-5">

              {/* Step 1: Connect */}
              {step === 'connect' && (
                <div className="space-y-4 animate-fade-in">
                  {/* Source toggle */}
                  <div>
                    <p className="label-uppercase mb-2">Source</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setSource('aws')}
                        className={`flex-1 flex items-center gap-2 px-3 py-2.5 rounded-lg border text-[12px] font-medium transition-all ${
                          source === 'aws'
                            ? 'border-[#3b82f6] bg-[#3b82f610] text-[#3b82f6]'
                            : 'border-[#2a2a2a] text-[#888] hover:border-[#3a3a3a]'
                        }`}
                      >
                        <CloudUpload size={15} />
                        AWS Account
                      </button>
                      <button
                        onClick={() => setSource('tfe')}
                        className={`flex-1 flex items-center gap-2 px-3 py-2.5 rounded-lg border text-[12px] font-medium transition-all ${
                          source === 'tfe'
                            ? 'border-[#3b82f6] bg-[#3b82f610] text-[#3b82f6]'
                            : 'border-[#2a2a2a] text-[#888] hover:border-[#3a3a3a]'
                        }`}
                      >
                        <Database size={15} />
                        TFE Workspace
                      </button>
                    </div>
                  </div>

                  {/* Account ID input */}
                  <div>
                    <label className="label-uppercase block mb-2">
                      {source === 'aws' ? 'AWS Account ID' : 'TFE Workspace ID'}
                    </label>
                    <input
                      value={accountId}
                      onChange={e => setAccountId(e.target.value)}
                      placeholder={source === 'aws' ? '123456789012' : 'my-workspace-name'}
                      className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-2.5 text-[13px] text-[#f0f0f0] placeholder-[#444] outline-none focus:border-[#3b82f6] transition-colors"
                      onKeyDown={e => { if (e.key === 'Enter') handleDiscover() }}
                    />
                    {source === 'aws' && (
                      <p className="text-[10px] text-[#444] mt-1.5">
                        Ensure your IAM role has ReadOnlyAccess. No resources will be modified.
                      </p>
                    )}
                  </div>

                  {/* Info box */}
                  <div className="flex gap-2.5 p-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#3b82f6] mt-1 shrink-0" />
                    <div>
                      <p className="text-[11px] font-medium text-[#d0d0d0] mb-0.5">Mock Discovery Mode</p>
                      <p className="text-[10px] text-[#555]">This demo will simulate infrastructure discovery with realistic mock data.</p>
                    </div>
                  </div>

                  <button
                    onClick={handleDiscover}
                    disabled={!accountId.trim()}
                    className="w-full py-2.5 bg-[#3b82f6] hover:bg-[#2563eb] disabled:opacity-40 disabled:cursor-not-allowed text-white text-[13px] font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    Discover Infrastructure
                    <ChevronRight size={16} />
                  </button>
                </div>
              )}

              {/* Step 2: Discovery */}
              {step === 'discovery' && (
                <div className="animate-fade-in">
                  <div
                    ref={terminalRef}
                    className="bg-[#080808] border border-[#1f1f1f] rounded-lg p-4 h-64 overflow-y-auto scrollbar-dark font-mono"
                  >
                    {DISCOVERY_LINES.slice(0, visibleLines).map((line, i) => (
                      <div
                        key={i}
                        className="terminal-line"
                        style={{
                          color: line.type === 'success' ? '#22c55e' : '#4ade80',
                          opacity: 0.9,
                        }}
                      >
                        {line.text}
                      </div>
                    ))}
                    {visibleLines < DISCOVERY_LINES.length && (
                      <span className="text-[#22c55e] animate-pulse">█</span>
                    )}
                  </div>
                </div>
              )}

              {/* Step 3: Preview */}
              {step === 'preview' && (
                <div className="space-y-4 animate-fade-in">
                  {/* Graph stats */}
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { label: 'Nodes', value: '13', color: '#3b82f6' },
                      { label: 'Edges', value: '13', color: '#22c55e' },
                      { label: 'Services', value: '7', color: '#a855f7' },
                    ].map(s => (
                      <div key={s.label} className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-3 text-center">
                        <p className="text-[22px] font-semibold font-tabular" style={{ color: s.color }}>{s.value}</p>
                        <p className="label-uppercase mt-1">{s.label}</p>
                      </div>
                    ))}
                  </div>

                  {/* Node type breakdown */}
                  <div>
                    <p className="label-uppercase mb-2">Discovered Resources</p>
                    <div className="space-y-1">
                      {[
                        { type: 'EC2', count: 3, color: '#60a5fa' },
                        { type: 'RDS', count: 2, color: '#a78bfa' },
                        { type: 'ALB', count: 1, color: '#22d3ee' },
                        { type: 'Lambda', count: 1, color: '#fbbf24' },
                        { type: 'ElastiCache', count: 1, color: '#2dd4bf' },
                        { type: 'SQS', count: 1, color: '#f472b6' },
                        { type: 'S3', count: 1, color: '#4ade80' },
                        { type: 'CloudFront', count: 1, color: '#c084fc' },
                        { type: 'CloudWatch', count: 1, color: '#fb923c' },
                        { type: 'APIGateway', count: 1, color: '#38bdf8' },
                      ].map(r => (
                        <div key={r.type} className="flex items-center gap-2 py-0.5">
                          <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: r.color }} />
                          <span className="text-[11px] text-[#888] flex-1">{r.type}</span>
                          <span className="text-[11px] text-[#555] font-tabular">{r.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={handleLoad}
                    className="w-full py-2.5 bg-[#22c55e] hover:bg-[#16a34a] text-black text-[13px] font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    Load into Canvas
                    <ChevronRight size={16} />
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
