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
    shapes: Shape[]
}

interface WireframeState {
    artboardsByProject: Record<string, Artboard[]>

    // Actions
    getArtboards: (projectId: string) => Artboard[]
    addArtboard: (projectId: string, name: string) => string
    deleteArtboard: (projectId: string, artboardId: string) => void
    updateArtboard: (projectId: string, artboardId: string, updates: Partial<Artboard>) => void

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

            addArtboard: (projectId, name) => {
                const id = `artboard_${Date.now()}`
                const newArtboard: Artboard = {
                    id,
                    name,
                    width: 375,
                    height: 667,
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
