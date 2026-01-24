import {
    FolderOpen,
    FileText,
    GitBranch,
    PenTool,
    Package,
    ChevronLeft,
    ChevronRight,
    Menu,
    X
} from 'lucide-react'
import { useAppStore } from '../../stores/appStore'
import { useProjectStore } from '../../stores/projectStore'
import { useVibeStore } from '../../stores/vibeStore'

const menuItems = [
    { id: 'project-hub' as const, label: 'Projects', icon: FolderOpen },
    { id: 'prd' as const, label: 'PRD', icon: FileText },
    { id: 'flowchart' as const, label: 'Flowchart', icon: GitBranch },
    { id: 'wireframe' as const, label: 'Design', icon: PenTool },
    { id: 'bundle' as const, label: 'Export', icon: Package },
]

export function Sidebar() {
    const { activeModule, setActiveModule, sidebarOpen, toggleSidebar } = useAppStore()
    const currentProject = useProjectStore((state) => state.getCurrentProject())

    return (
        <>
            {/* Mobile Menu Button - Only visible on small screens */}
            <button
                onClick={toggleSidebar}
                className="md:hidden fixed top-3 left-3 z-50 p-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg text-[#a1a1aa] hover:text-white"
                aria-label="Toggle menu"
            >
                {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            {/* Mobile Overlay */}
            {sidebarOpen && (
                <div
                    className="md:hidden fixed inset-0 bg-black/50 z-30"
                    onClick={toggleSidebar}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`
          h-screen bg-[#1a1a1a] border-r border-[#2a2a2a] 
          flex flex-col transition-all duration-300 z-40
          
          /* Mobile: Full overlay sidebar */
          fixed md:relative
          ${sidebarOpen ? 'left-0' : '-left-64 md:left-0'}
          
          /* Desktop: Collapsible width */
          ${sidebarOpen ? 'w-56' : 'md:w-16 w-56'}
          shrink-0
        `}
            >
                {/* Logo */}
                <div className="h-14 flex items-center px-4 border-b border-[#2a2a2a]">
                    {sidebarOpen ? (
                        <span className="font-semibold text-lg md:block">⚡ antifigma</span>
                    ) : (
                        <span className="text-xl hidden md:block">⚡</span>
                    )}
                </div>

                {/* Current Project */}
                {sidebarOpen && currentProject && (
                    <div className="px-4 py-3 border-b border-[#2a2a2a]">
                        <p className="text-xs text-[#a1a1aa] mb-1">Current Project</p>
                        <p className="text-sm font-medium truncate">{currentProject.name}</p>
                    </div>
                )}

                {/* Navigation */}
                <nav className="flex-1 py-4">
                    {menuItems.map((item) => {
                        const Icon = item.icon
                        const isActive = activeModule === item.id
                        const isDisabled = item.id !== 'project-hub' && !currentProject

                        return (
                            <button
                                key={item.id}
                                onClick={() => {
                                    if (!isDisabled) {
                                        setActiveModule(item.id)
                                        // Close sidebar on mobile after selection
                                        if (window.innerWidth < 768) {
                                            toggleSidebar()
                                        }
                                    }
                                }}
                                disabled={isDisabled}
                                className={`
                  w-full flex items-center gap-3 px-4 py-3 text-left
                  transition-colors duration-150
                  ${isActive
                                        ? 'bg-[#6366f1] text-white'
                                        : isDisabled
                                            ? 'text-[#4a4a4a] cursor-not-allowed'
                                            : 'text-[#a1a1aa] hover:bg-[#252525] hover:text-white'
                                    }
                `}
                            >
                                <Icon size={20} />
                                {(sidebarOpen || window.innerWidth < 768) && (
                                    <span className="text-sm">{item.label}</span>
                                )}
                            </button>
                        )
                    })}
                </nav>

                {/* Vibe Settings */}
                <div className="px-2 pb-2">
                    <button
                        onClick={() => useVibeStore.getState().toggleVibe(true)}
                        className={`
                            w-full flex items-center gap-3 px-4 py-3 text-left
                            text-[#a1a1aa] hover:bg-[#252525] hover:text-white
                            transition-colors duration-150 rounded-lg
                            bg-gradient-to-r from-transparent hover:from-[#6366f1]/10
                        `}
                    >
                        <span className="text-xl">✨</span>
                        {(sidebarOpen || window.innerWidth < 768) && (
                            <span className="text-sm font-medium bg-gradient-to-r from-[#a1a1aa] to-[#fff] bg-clip-text text-transparent group-hover:from-[#6366f1] group-hover:to-[#a5b4fc]">
                                Vibe Settings
                            </span>
                        )}
                    </button>
                </div>

                {/* Toggle Button - Hidden on mobile */}
                <button
                    onClick={toggleSidebar}
                    className="hidden md:flex h-12 items-center justify-center border-t border-[#2a2a2a] text-[#a1a1aa] hover:text-white hover:bg-[#252525] transition-colors"
                >
                    {sidebarOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
                </button>
            </aside>
        </>
    )
}
