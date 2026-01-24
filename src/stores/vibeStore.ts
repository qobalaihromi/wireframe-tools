import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface VibeState {
    apiKey: string
    model: string
    isOpen: boolean
    isChatOpen: boolean
    setApiKey: (key: string) => void
    setModel: (model: string) => void
    toggleVibe: (isOpen?: boolean) => void
    toggleChat: (isOpen?: boolean) => void
}

export const useVibeStore = create<VibeState>()(
    persist(
        (set) => ({
            apiKey: '',
            model: 'gemini-pro',
            isOpen: false,
            isChatOpen: false,
            setApiKey: (apiKey) => set({ apiKey }),
            setModel: (model) => set({ model }),
            toggleVibe: (isOpen) => set((state) => ({ isOpen: isOpen ?? !state.isOpen })),
            toggleChat: (isOpen) => set((state) => ({ isChatOpen: isOpen ?? !state.isChatOpen })),
        }),
        {
            name: 'vibe-storage',
        }
    )
)
