import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Project {
    id: string
    name: string
    description: string
    createdAt: string
    updatedAt: string
}

interface ProjectState {
    projects: Project[]
    currentProjectId: string | null

    // Actions
    createProject: (name: string, description: string) => string
    deleteProject: (id: string) => void
    setCurrentProject: (id: string | null) => void
    getCurrentProject: () => Project | null
    updateProject: (id: string, updates: Partial<Project>) => void
}

export const useProjectStore = create<ProjectState>()(
    persist(
        (set, get) => ({
            projects: [],
            currentProjectId: null,

            createProject: (name, description) => {
                const id = `project-${Date.now()}`
                const newProject: Project = {
                    id,
                    name,
                    description,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                }
                set((state) => ({
                    projects: [...state.projects, newProject],
                    currentProjectId: id,
                }))
                return id
            },

            deleteProject: (id) => {
                set((state) => ({
                    projects: state.projects.filter((p) => p.id !== id),
                    currentProjectId: state.currentProjectId === id ? null : state.currentProjectId,
                }))
            },

            setCurrentProject: (id) => {
                set({ currentProjectId: id })
            },

            getCurrentProject: () => {
                const { projects, currentProjectId } = get()
                return projects.find((p) => p.id === currentProjectId) || null
            },

            updateProject: (id, updates) => {
                set((state) => ({
                    projects: state.projects.map((p) =>
                        p.id === id
                            ? { ...p, ...updates, updatedAt: new Date().toISOString() }
                            : p
                    ),
                }))
            },
        }),
        {
            name: 'wireframe-tools-projects',
        }
    )
)
