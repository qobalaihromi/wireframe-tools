import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface PRDData {
    projectName: string
    problemStatement: string
    targetUser: string
    coreFeatures: string[]
    outOfScope: string[]
    techPreferences: string
    databaseSchema: string
    knownInfo?: string
}

interface PRDState {
    prdByProject: Record<string, PRDData>

    // Actions
    getPRD: (projectId: string) => PRDData | null
    savePRD: (projectId: string, data: PRDData) => void
    updatePRD: (projectId: string, updates: Partial<PRDData>) => void
    deletePRD: (projectId: string) => void
}

const emptyPRD: PRDData = {
    projectName: '',
    problemStatement: '',
    targetUser: '',
    coreFeatures: [],
    outOfScope: [],
    techPreferences: '',
    databaseSchema: '',
    knownInfo: '',
}

export const usePRDStore = create<PRDState>()(
    persist(
        (set, get) => ({
            prdByProject: {},

            getPRD: (projectId) => {
                return get().prdByProject[projectId] || null
            },

            savePRD: (projectId, data) => {
                set((state) => ({
                    prdByProject: {
                        ...state.prdByProject,
                        [projectId]: data,
                    },
                }))
            },

            updatePRD: (projectId, updates) => {
                set((state) => ({
                    prdByProject: {
                        ...state.prdByProject,
                        [projectId]: {
                            ...(state.prdByProject[projectId] || emptyPRD),
                            ...updates,
                        },
                    },
                }))
            },

            deletePRD: (projectId) => {
                set((state) => {
                    const { [projectId]: _, ...rest } = state.prdByProject
                    return { prdByProject: rest }
                })
            },
        }),
        {
            name: 'wireframe-tools-prd',
        }
    )
)
