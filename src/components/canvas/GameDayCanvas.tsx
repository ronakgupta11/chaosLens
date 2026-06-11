import React, { useCallback, useRef, useState } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  NodeTypes,
  EdgeTypes,
  useReactFlow,
  ReactFlowProvider,
  Node,
  OnConnect,
  addEdge,
  Panel,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'

import { useGameDayStore, InfraNodeData } from '../../store/useGameDayStore'
import { NODE_COLORS } from '../../data/componentPalette'
import { applyDagreLayout } from '../../lib/dagreLayout'
import InfraNode from './InfraNode'
import TrafficEdge from './TrafficEdge'
import CanvasContextMenu from './CanvasContextMenu'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const nodeTypes: NodeTypes = { infraNode: InfraNode as any }
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const edgeTypes: EdgeTypes = { trafficEdge: TrafficEdge as any }

interface ContextMenuState {
  nodeId: string
  x: number
  y: number
}

function GameDayCanvasInner() {
  const {
    nodes, edges,
    onNodesChange, onEdgesChange,
    setSelectedNode, selectedNodeId,
    addNode, setZoomLevel,
  } = useGameDayStore()

  const { screenToFlowPosition, fitView } = useReactFlow()
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null)
  const reactFlowWrapper = useRef<HTMLDivElement>(null)

  const onConnect: OnConnect = useCallback(
    (params) => {
      useGameDayStore.setState(s => ({
        edges: addEdge({ ...params, type: 'trafficEdge', data: { state: 'idle', rps: 0 } }, s.edges),
      }))
    },
    []
  )

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNode(node.id)
    useGameDayStore.setState({ rightPanelTab: 'details' })
  }, [setSelectedNode])

  const onPaneClick = useCallback(() => {
    setSelectedNode(null)
    setContextMenu(null)
  }, [setSelectedNode])

  const onNodeContextMenu = useCallback((e: React.MouseEvent, node: Node) => {
    e.preventDefault()
    setContextMenu({ nodeId: node.id, x: e.clientX, y: e.clientY })
  }, [])

  // Drag-drop from palette
  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'copy'
  }, [])

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    const typeData = e.dataTransfer.getData('application/reactflow-node')
    if (!typeData) return

    const parsed = JSON.parse(typeData)
    const position = screenToFlowPosition({ x: e.clientX, y: e.clientY })
    const colors = NODE_COLORS[parsed.type] ?? NODE_COLORS.DEFAULT
    const newNode: Node<InfraNodeData> = {
      id: `${parsed.type.toLowerCase()}-${Date.now()}`,
      type: 'infraNode',
      position,
      data: {
        label: `${parsed.name.toLowerCase()}-${Math.floor(Math.random() * 100)}`,
        type: parsed.type,
        state: 'idle',
        tags: ['env:staging'],
      },
    }
    addNode(newNode)
  }, [screenToFlowPosition, addNode])

  const onMoveEnd = useCallback((_: unknown, viewport: { zoom: number }) => {
    setZoomLevel(viewport.zoom)
  }, [setZoomLevel])

  const handleAutoLayout = useCallback(() => {
    const laid = applyDagreLayout(
      useGameDayStore.getState().nodes as Node<InfraNodeData>[],
      useGameDayStore.getState().edges
    )
    useGameDayStore.setState({ nodes: laid })
    setTimeout(() => fitView({ padding: 0.1, duration: 600 }), 50)
  }, [fitView])

  // Expose auto layout via store
  React.useEffect(() => {
    (window as unknown as Record<string, unknown>).__gameDayAutoLayout = handleAutoLayout
  }, [handleAutoLayout])

  return (
    <div ref={reactFlowWrapper} className="w-full h-full relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        onNodeContextMenu={onNodeContextMenu}
        onDragOver={onDragOver}
        onDrop={onDrop}
        onMoveEnd={onMoveEnd}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        defaultEdgeOptions={{ type: 'trafficEdge', data: { state: 'idle', rps: 0 } }}
        fitView
        fitViewOptions={{ padding: 0.1 }}
        minZoom={0.15}
        maxZoom={2.5}
        deleteKeyCode="Delete"
        proOptions={{ hideAttribution: true }}
        className="canvas-dot-grid"
      >
        <Background color="#1f1f1f" gap={24} size={1} style={{ background: '#0a0a0a' }} />

        <Controls
          position="bottom-left"
          showInteractive={false}
          style={{ marginBottom: 8, marginLeft: 8 }}
        />

        <MiniMap
          position="bottom-right"
          style={{
            background: '#111111',
            border: '1px solid #2a2a2a',
            borderRadius: 6,
            marginBottom: 8,
            marginRight: 8,
            width: 140,
            height: 90,
          }}
          nodeColor={(n) => {
            const d = n.data as InfraNodeData
            return (NODE_COLORS[d.type] ?? NODE_COLORS.DEFAULT).border
          }}
          maskColor="rgba(0,0,0,0.4)"
        />
      </ReactFlow>

      {/* Context menu */}
      {contextMenu && (
        <CanvasContextMenu
          nodeId={contextMenu.nodeId}
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={() => setContextMenu(null)}
        />
      )}
    </div>
  )
}

export default function GameDayCanvas() {
  return (
    <ReactFlowProvider>
      <GameDayCanvasInner />
    </ReactFlowProvider>
  )
}
