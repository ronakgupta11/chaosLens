import dagre from '@dagrejs/dagre'
import { Node, Edge } from '@xyflow/react'
import { InfraNodeData } from '../store/useGameDayStore'

const NODE_WIDTH = 150
const NODE_HEIGHT = 80

export function applyDagreLayout(
  nodes: Node<InfraNodeData>[],
  edges: Edge[]
): Node<InfraNodeData>[] {
  const g = new dagre.graphlib.Graph()

  g.setGraph({
    rankdir: 'TB',
    ranksep: 80,
    nodesep: 50,
    marginx: 40,
    marginy: 40,
  })

  g.setDefaultEdgeLabel(() => ({}))

  for (const node of nodes) {
    g.setNode(node.id, { width: NODE_WIDTH, height: NODE_HEIGHT })
  }

  for (const edge of edges) {
    g.setEdge(edge.source, edge.target)
  }

  dagre.layout(g)

  return nodes.map(node => {
    const nodeWithPosition = g.node(node.id)
    if (!nodeWithPosition) return node
    return {
      ...node,
      position: {
        x: nodeWithPosition.x - NODE_WIDTH / 2,
        y: nodeWithPosition.y - NODE_HEIGHT / 2,
      },
    }
  })
}
