import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Node, Edge } from '@xyflow/react'

interface FlowchartState {
    flowchartByProject: Record<string, { nodes: Node[]; edges: Edge[] }>

    // Actions
    getFlowchart: (projectId: string) => { nodes: Node[]; edges: Edge[] } | null
    saveFlowchart: (projectId: string, nodes: Node[], edges: Edge[]) => void
    deleteFlowchart: (projectId: string) => void
}

export const useFlowchartStore = create<FlowchartState>()(
    persist(
        (set, get) => ({
            flowchartByProject: {},

            getFlowchart: (projectId) => {
                return get().flowchartByProject[projectId] || null
            },

            saveFlowchart: (projectId, nodes, edges) => {
                set((state) => ({
                    flowchartByProject: {
                        ...state.flowchartByProject,
                        [projectId]: { nodes, edges },
                    },
                }))
            },

            deleteFlowchart: (projectId) => {
                set((state) => {
                    const { [projectId]: _, ...rest } = state.flowchartByProject
                    return { flowchartByProject: rest }
                })
            },
        }),
        {
            name: 'wireframe-tools-flowchart',
        }
    )
)
