import { useState } from 'react'
import { Plus, Trash2, ChevronRight, Package } from 'lucide-react'
import { useProjectStore } from '../../stores/projectStore'
import { useAppStore } from '../../stores/appStore'
import { ContextBundlePanel } from '../context-bundle/ContextBundlePanel'

export function ProjectHub() {
    const { projects, createProject, deleteProject, setCurrentProject } = useProjectStore()
    const setActiveModule = useAppStore((state) => state.setActiveModule)

    const [showNewProjectForm, setShowNewProjectForm] = useState(false)
    const [newProjectName, setNewProjectName] = useState('')
    const [newProjectDescription, setNewProjectDescription] = useState('')

    const [contextBundleProjectId, setContextBundleProjectId] = useState<string | null>(null)
    const [contextBundleProjectName, setContextBundleProjectName] = useState<string>('')

    const handleCreateProject = () => {
        if (newProjectName.trim()) {
            createProject(newProjectName.trim(), newProjectDescription.trim())
            setNewProjectName('')
            setNewProjectDescription('')
            setShowNewProjectForm(false)
        }
    }

    const handleOpenProject = (projectId: string) => {
        setCurrentProject(projectId)
        setActiveModule('prd')
    }

    return (
        <div className="h-full flex items-center justify-center p-6">
            <div className="w-full max-w-4xl">
                {/* Empty State or Project List */}
                {projects.length === 0 && !showNewProjectForm ? (
                    <div className="text-center py-10">
                        <div className="text-6xl mb-4">🚀</div>
                        <h2 className="text-2xl font-semibold mb-2">Welcome to Wireframe Tools</h2>
                        <p className="text-[#a1a1aa] mb-6 max-w-md mx-auto">
                            Create structured context for your AI coding sessions.
                            Start with a PRD, add flowcharts, wireframes, and export everything as a bundle.
                        </p>
                        <button
                            onClick={() => setShowNewProjectForm(true)}
                            className="inline-flex items-center gap-2 bg-[#6366f1] hover:bg-[#4f46e5] text-white px-6 py-3 rounded-lg font-medium transition-colors"
                        >
                            <Plus size={20} />
                            Create First Project
                        </button>
                    </div>
                ) : (
                    <>
                        {/* Header */}
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-semibold">Your Projects</h2>
                            <button
                                onClick={() => setShowNewProjectForm(true)}
                                className="inline-flex items-center gap-2 bg-[#6366f1] hover:bg-[#4f46e5] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                            >
                                <Plus size={18} />
                                New Project
                            </button>
                        </div>

                        {/* New Project Form */}
                        {showNewProjectForm && (
                            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-4 mb-6">
                                <h3 className="font-medium mb-4">New Project</h3>
                                <input
                                    type="text"
                                    placeholder="Project name"
                                    value={newProjectName}
                                    onChange={(e) => setNewProjectName(e.target.value)}
                                    className="w-full bg-[#252525] border border-[#2a2a2a] rounded-lg px-4 py-2 mb-3 text-white placeholder-[#6a6a6a] focus:border-[#6366f1] focus:outline-none"
                                    autoFocus
                                />
                                <textarea
                                    placeholder="Brief description (optional)"
                                    value={newProjectDescription}
                                    onChange={(e) => setNewProjectDescription(e.target.value)}
                                    className="w-full bg-[#252525] border border-[#2a2a2a] rounded-lg px-4 py-2 mb-4 text-white placeholder-[#6a6a6a] focus:border-[#6366f1] focus:outline-none resize-none"
                                    rows={2}
                                />
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleCreateProject}
                                        disabled={!newProjectName.trim()}
                                        className="bg-[#6366f1] hover:bg-[#4f46e5] disabled:bg-[#4a4a4a] disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                                    >
                                        Create Project
                                    </button>
                                    <button
                                        onClick={() => {
                                            setShowNewProjectForm(false)
                                            setNewProjectName('')
                                            setNewProjectDescription('')
                                        }}
                                        className="bg-[#252525] hover:bg-[#2a2a2a] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Project List */}
                        <div className="space-y-3">
                            {projects.map((project) => (
                                <div
                                    key={project.id}
                                    className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-4 flex items-center justify-between group hover:border-[#3a3a3a] transition-colors"
                                >
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-medium truncate">{project.name}</h3>
                                        {project.description && (
                                            <p className="text-sm text-[#a1a1aa] truncate">{project.description}</p>
                                        )}
                                        <p className="text-xs text-[#6a6a6a] mt-1">
                                            Created {new Date(project.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-2 ml-4">
                                        <button
                                            onClick={() => {
                                                setContextBundleProjectId(project.id)
                                                setContextBundleProjectName(project.name)
                                            }}
                                            className="p-2 text-[#a1a1aa] hover:text-[#6366f1] hover:bg-[#252525] rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                                            title="Export Context Bundle"
                                        >
                                            <Package size={18} />
                                        </button>
                                        <button
                                            onClick={() => deleteProject(project.id)}
                                            className="p-2 text-[#a1a1aa] hover:text-red-400 hover:bg-[#252525] rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                                            title="Delete project"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleOpenProject(project.id)}
                                            className="flex items-center gap-1 bg-[#252525] hover:bg-[#6366f1] text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                                        >
                                            Open
                                            <ChevronRight size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}

                <ContextBundlePanel
                    projectId={contextBundleProjectId || ''}
                    projectName={contextBundleProjectName}
                    isOpen={!!contextBundleProjectId}
                    onClose={() => setContextBundleProjectId(null)}
                />
            </div>
        </div>
    )
}
