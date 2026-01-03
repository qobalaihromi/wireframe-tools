import { useAppStore } from '../../stores/appStore'
import { useProjectStore } from '../../stores/projectStore'

const moduleTitles = {
    'project-hub': 'Project Hub',
    'prd': 'PRD Generator',
    'flowchart': 'Flowchart Editor',
    'wireframe': 'Wireframe Builder',
    'bundle': 'Context Bundle',
}

export function Header() {
    const activeModule = useAppStore((state) => state.activeModule)
    const currentProject = useProjectStore((state) => state.getCurrentProject())

    return (
        <header className="h-14 w-full bg-[#1a1a1a] border-b border-[#2a2a2a] flex items-center justify-between px-6">
            <div className="flex items-center gap-4">
                {/* Spacer for mobile hamburger menu */}
                <div className="w-8 md:hidden" />
                <h1 className="text-lg font-semibold">{moduleTitles[activeModule]}</h1>
                {currentProject && activeModule !== 'project-hub' && (
                    <span className="text-sm text-[#a1a1aa]">
                        — {currentProject.name}
                    </span>
                )}
            </div>

            <div className="flex items-center gap-2">
                {/* Future: Add quick actions here */}
            </div>
        </header>
    )
}
