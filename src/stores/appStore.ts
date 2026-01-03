import { create } from 'zustand'

type Module = 'project-hub' | 'prd' | 'flowchart' | 'wireframe' | 'bundle'

interface AppState {
    activeModule: Module
    sidebarOpen: boolean

    // Actions
    setActiveModule: (module: Module) => void
    toggleSidebar: () => void
}

export const useAppStore = create<AppState>((set) => ({
    activeModule: 'project-hub',
    sidebarOpen: typeof window !== 'undefined' ? window.innerWidth >= 768 : true,


    setActiveModule: (module) => set({ activeModule: module }),
    toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
}))
