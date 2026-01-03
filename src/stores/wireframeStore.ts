import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type ShapeType = 'rect' | 'circle' | 'text' | 'button' | 'input' | 'card' | 'line' | 'arrow'

export interface Shape {
    id: string
    type: ShapeType
    x: number
    y: number
    width: number
    height: number
    fill: string
    stroke: string
    strokeWidth: number
    opacity: number
    rotation: number
    borderRadius?: number
    text?: string
    fontSize?: number
    // For line/arrow
    points?: number[]
}

export interface Artboard {
    id: string
    name: string
    width: number
    height: number
    x: number
    y: number
    shapes: Shape[]
}

interface WireframeState {
    artboardsByProject: Record<string, Artboard[]>

    // Actions
    getArtboards: (projectId: string) => Artboard[]
    addArtboard: (projectId: string, name: string, x?: number, y?: number, width?: number, height?: number) => string
    deleteArtboard: (projectId: string, artboardId: string) => void
    updateArtboard: (projectId: string, artboardId: string, updates: Partial<Artboard>) => void
    updateArtboardPosition: (projectId: string, artboardId: string, x: number, y: number) => void

    addShape: (projectId: string, artboardId: string, shape: Shape) => void
    updateShape: (projectId: string, artboardId: string, shapeId: string, updates: Partial<Shape>) => void
    deleteShape: (projectId: string, artboardId: string, shapeId: string) => void
}

export const useWireframeStore = create<WireframeState>()(
    persist(
        (set, get) => ({
            artboardsByProject: {},

            getArtboards: (projectId) => {
                return get().artboardsByProject[projectId] || []
            },

            addArtboard: (projectId, name, x, y, width, height) => {
                const id = `artboard_${Date.now()}`
                const existingArtboards = get().artboardsByProject[projectId] || []

                // Default position logic: place next to the last one with 100px gap
                const lastArtboard = existingArtboards[existingArtboards.length - 1]
                const defaultX = lastArtboard ? lastArtboard.x + lastArtboard.width + 100 : 0
                const defaultY = 0

                const newArtboard: Artboard = {
                    id,
                    name,
                    width: width ?? 375,
                    height: height ?? 667,
                    x: x ?? defaultX,
                    y: y ?? defaultY,
                    shapes: [],
                }
                set((state) => ({
                    artboardsByProject: {
                        ...state.artboardsByProject,
                        [projectId]: [...(state.artboardsByProject[projectId] || []), newArtboard],
                    },
                }))
                return id
            },

            deleteArtboard: (projectId, artboardId) => {
                set((state) => ({
                    artboardsByProject: {
                        ...state.artboardsByProject,
                        [projectId]: (state.artboardsByProject[projectId] || []).filter(
                            (a) => a.id !== artboardId
                        ),
                    },
                }))
            },

            updateArtboard: (projectId, artboardId, updates) => {
                set((state) => ({
                    artboardsByProject: {
                        ...state.artboardsByProject,
                        [projectId]: (state.artboardsByProject[projectId] || []).map((a) =>
                            a.id === artboardId ? { ...a, ...updates } : a
                        ),
                    },
                }))
            },

            updateArtboardPosition: (projectId, artboardId, x, y) => {
                set((state) => ({
                    artboardsByProject: {
                        ...state.artboardsByProject,
                        [projectId]: (state.artboardsByProject[projectId] || []).map((a) =>
                            a.id === artboardId ? { ...a, x, y } : a
                        ),
                    },
                }))
            },

            addShape: (projectId, artboardId, shape) => {
                set((state) => ({
                    artboardsByProject: {
                        ...state.artboardsByProject,
                        [projectId]: (state.artboardsByProject[projectId] || []).map((a) =>
                            a.id === artboardId ? { ...a, shapes: [...a.shapes, shape] } : a
                        ),
                    },
                }))
            },

            updateShape: (projectId, artboardId, shapeId, updates) => {
                set((state) => ({
                    artboardsByProject: {
                        ...state.artboardsByProject,
                        [projectId]: (state.artboardsByProject[projectId] || []).map((a) =>
                            a.id === artboardId
                                ? {
                                    ...a,
                                    shapes: a.shapes.map((s) =>
                                        s.id === shapeId ? { ...s, ...updates } : s
                                    ),
                                }
                                : a
                        ),
                    },
                }))
            },

            deleteShape: (projectId, artboardId, shapeId) => {
                set((state) => ({
                    artboardsByProject: {
                        ...state.artboardsByProject,
                        [projectId]: (state.artboardsByProject[projectId] || []).map((a) =>
                            a.id === artboardId
                                ? { ...a, shapes: a.shapes.filter((s) => s.id !== shapeId) }
                                : a
                        ),
                    },
                }))
            },
        }),
        {
            name: 'wireframe-tools-wireframe',
        }
    )
)
