import { useCallback, useState } from 'react'
import type { Artboard } from '../stores/wireframeStore'

interface HistoryState {
    artboards: Artboard[]
}

interface UseWireframeHistoryProps {
    maxHistory?: number
    artboards: Artboard[]
    setArtboards: (artboards: Artboard[]) => void
}

/**
 * Undo/Redo hook for wireframe artboards state
 * Usage:
 *  1. Call takeSnapshot() BEFORE making any change you want to be undoable
 *  2. Call undo() to revert to previous state
 *  3. Call redo() to restore undone state
 */
export function useWireframeHistory({
    maxHistory = 50,
    artboards,
    setArtboards,
}: UseWireframeHistoryProps) {
    const [past, setPast] = useState<HistoryState[]>([])
    const [future, setFuture] = useState<HistoryState[]>([])

    // Deep clone artboards to avoid mutation issues
    const cloneArtboards = useCallback((artboards: Artboard[]): Artboard[] => {
        return JSON.parse(JSON.stringify(artboards))
    }, [])

    // Capture current state to history (call BEFORE making a change)
    const takeSnapshot = useCallback(() => {
        setPast((prev) => {
            const newPast = [...prev, { artboards: cloneArtboards(artboards) }]
            if (newPast.length > maxHistory) {
                newPast.shift()
            }
            return newPast
        })
        // Clear future when new action is taken
        setFuture([])
    }, [artboards, maxHistory, cloneArtboards])

    // Undo: revert to previous state
    const undo = useCallback(() => {
        if (past.length === 0) return

        const previous = past[past.length - 1]
        const newPast = past.slice(0, past.length - 1)

        // Save current state to future for redo
        setPast(newPast)
        setFuture((prev) => [{ artboards: cloneArtboards(artboards) }, ...prev])

        // Restore previous state
        setArtboards(previous.artboards)
    }, [past, artboards, setArtboards, cloneArtboards])

    // Redo: restore undone state
    const redo = useCallback(() => {
        if (future.length === 0) return

        const next = future[0]
        const newFuture = future.slice(1)

        // Save current state to past
        setPast((prev) => [...prev, { artboards: cloneArtboards(artboards) }])
        setFuture(newFuture)

        // Restore next state
        setArtboards(next.artboards)
    }, [future, artboards, setArtboards, cloneArtboards])

    const canUndo = past.length > 0
    const canRedo = future.length > 0

    // Clear history (useful when switching projects)
    const clearHistory = useCallback(() => {
        setPast([])
        setFuture([])
    }, [])

    return {
        takeSnapshot,
        undo,
        redo,
        canUndo,
        canRedo,
        clearHistory,
        historyLength: past.length,
        futureLength: future.length,
    }
}
