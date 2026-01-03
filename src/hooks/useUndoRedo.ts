import { useCallback, useState } from 'react'
import type { Node, Edge } from '@xyflow/react'

interface HistoryState {
    nodes: Node[]
    edges: Edge[]
}

interface UseUndoRedoProps {
    maxHistory?: number
    nodes: Node[]
    edges: Edge[]
    setNodes: (nodes: Node[]) => void
    setEdges: (edges: Edge[]) => void
}

export function useUndoRedo({
    maxHistory = 50,
    nodes,
    edges,
    setNodes,
    setEdges,
}: UseUndoRedoProps) {
    const [past, setPast] = useState<HistoryState[]>([])
    const [future, setFuture] = useState<HistoryState[]>([])

    // Capture current state to history
    // Should be called BEFORE making a change that you want to be undoable
    const takeSnapshot = useCallback(() => {
        setPast((prev) => {
            const newPast = [...prev, { nodes, edges }]
            if (newPast.length > maxHistory) {
                newPast.shift()
            }
            return newPast
        })
        setFuture([])
    }, [nodes, edges, maxHistory])

    const undo = useCallback(() => {
        if (past.length === 0) return

        const previous = past[past.length - 1]
        const newPast = past.slice(0, past.length - 1)

        setPast(newPast)
        setFuture((prev) => [{ nodes, edges }, ...prev])

        setNodes(previous.nodes)
        setEdges(previous.edges)
    }, [past, nodes, edges, setNodes, setEdges])

    const redo = useCallback(() => {
        if (future.length === 0) return

        const next = future[0]
        const newFuture = future.slice(1)

        setPast((prev) => [...prev, { nodes, edges }])
        setFuture(newFuture)

        setNodes(next.nodes)
        setEdges(next.edges)
    }, [future, nodes, edges, setNodes, setEdges])

    const canUndo = past.length > 0
    const canRedo = future.length > 0

    return {
        takeSnapshot,
        undo,
        redo,
        canUndo,
        canRedo,
    }
}
