import { Node, Edge } from '@xyflow/react'
import { InfraNodeData } from '../store/useGameDayStore'

export interface BlastRadiusResult {
  affectedNodeIds: string[]
  criticalPathsBroken: number
  impactScore: number
  redundancyFound: boolean
}

/**
 * BFS downstream from a failed node to find all affected downstream nodes.
 */
export function calculateBlastRadius(
  failedNodeId: string,
  nodes: Node<InfraNodeData>[],
  edges: Edge[]
): BlastRadiusResult {
  const nodeMap = new Map(nodes.map(n => [n.id, n]))
  const adjacency = new Map<string, string[]>()

  // Build adjacency list (directed: source → target)
  for (const edge of edges) {
    if (!adjacency.has(edge.source)) adjacency.set(edge.source, [])
    adjacency.get(edge.source)!.push(edge.target)
  }

  // BFS downstream
  const visited = new Set<string>()
  const queue = [failedNodeId]

  while (queue.length > 0) {
    const current = queue.shift()!
    if (visited.has(current)) continue
    visited.add(current)

    const neighbors = adjacency.get(current) ?? []
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) queue.push(neighbor)
    }
  }

  visited.delete(failedNodeId) // Don't count the failed node itself

  const affectedNodeIds = Array.from(visited)
  const totalNodes = nodes.length

  // Count critical paths (edges that are cut)
  const criticalPaths = edges.filter(
    e => e.source === failedNodeId || affectedNodeIds.includes(e.source)
  )

  // Check if any redundant paths exist (upstream nodes with multiple edges to same target)
  const upstreamEdges = edges.filter(e => e.target === failedNodeId)
  const redundancyFound = upstreamEdges.length > 1

  // Impact score: percentage of total nodes affected + critical path penalty
  const nodeImpact = (affectedNodeIds.length / Math.max(totalNodes - 1, 1)) * 100
  const pathPenalty = Math.min(criticalPaths.length * 5, 30)
  const impactScore = Math.min(Math.round(nodeImpact + pathPenalty), 100)

  return {
    affectedNodeIds,
    criticalPathsBroken: criticalPaths.length,
    impactScore,
    redundancyFound,
  }
}
