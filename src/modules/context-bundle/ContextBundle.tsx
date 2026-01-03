import { useState, useMemo } from 'react'
import {
    Copy,
    Check,
    Download,
    FileText,
    GitBranch,
    PenTool,
    Package,
    AlertCircle,
    CheckCircle2
} from 'lucide-react'
import { useProjectStore } from '../../stores/projectStore'
import { usePRDStore } from '../../stores/prdStore'
import { useFlowchartStore } from '../../stores/flowchartStore'
import { useWireframeStore } from '../../stores/wireframeStore'
import { generateBundleMarkdown, generateQuickSummary } from '../../lib/bundleGenerator'

export function ContextBundle() {
    const currentProject = useProjectStore((state) => state.getCurrentProject())
    const getPRD = usePRDStore((state) => state.getPRD)
    const getFlowchart = useFlowchartStore((state) => state.getFlowchart)
    const getArtboards = useWireframeStore((state) => state.getArtboards)

    const [copied, setCopied] = useState(false)
    const [activeTab, setActiveTab] = useState<'preview' | 'status'>('status')

    const bundleData = useMemo(() => {
        if (!currentProject) return null
        return {
            projectName: currentProject.name,
            prd: getPRD(currentProject.id),
            flowchart: getFlowchart(currentProject.id),
            artboards: getArtboards(currentProject.id),
        }
    }, [currentProject, getPRD, getFlowchart, getArtboards])

    const summary = useMemo(() => {
        if (!bundleData) return null
        return generateQuickSummary(bundleData)
    }, [bundleData])

    const bundleMarkdown = useMemo(() => {
        if (!bundleData) return ''
        return generateBundleMarkdown(bundleData)
    }, [bundleData])

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(bundleMarkdown)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        } catch (err) {
            console.error('Failed to copy:', err)
        }
    }

    const handleDownload = () => {
        const blob = new Blob([bundleMarkdown], { type: 'text/markdown' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `context-bundle-${currentProject?.name.replace(/\s+/g, '-') || 'project'}.md`
        a.click()
        URL.revokeObjectURL(url)
    }

    if (!currentProject) {
        return (
            <div className="h-full flex items-center justify-center">
                <p className="text-[#a1a1aa]">Please select a project first</p>
            </div>
        )
    }

    const completionPercentage = summary
        ? Math.round(((summary.hasPRD ? 1 : 0) + (summary.hasFlowchart ? 1 : 0) + (summary.hasWireframes ? 1 : 0)) / 3 * 100)
        : 0

    return (
        <div className="h-full overflow-auto p-6">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-xl font-semibold flex items-center gap-2">
                            <Package size={24} className="text-[#6366f1]" />
                            Context Bundle
                        </h2>
                        <p className="text-sm text-[#a1a1aa] mt-1">
                            One-click export untuk AI coding assistant
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleDownload}
                            className="flex items-center gap-2 px-4 py-2 text-[#a1a1aa] hover:text-white hover:bg-[#252525] rounded-lg transition-colors"
                        >
                            <Download size={18} />
                            Download .md
                        </button>
                        <button
                            onClick={handleCopy}
                            className="flex items-center gap-2 bg-[#6366f1] hover:bg-[#4f46e5] text-white px-4 py-2 rounded-lg font-medium transition-colors"
                        >
                            {copied ? <Check size={18} /> : <Copy size={18} />}
                            {copied ? 'Copied!' : 'Copy to Clipboard'}
                        </button>
                    </div>
                </div>

                {/* Completion Bar */}
                <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-4 mb-6">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Bundle Completeness</span>
                        <span className="text-sm text-[#a1a1aa]">{completionPercentage}%</span>
                    </div>
                    <div className="w-full h-2 bg-[#252525] rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] transition-all duration-500"
                            style={{ width: `${completionPercentage}%` }}
                        />
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-1 mb-4 p-1 bg-[#1a1a1a] rounded-lg w-fit">
                    <button
                        onClick={() => setActiveTab('status')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'status'
                                ? 'bg-[#252525] text-white'
                                : 'text-[#a1a1aa] hover:text-white'
                            }`}
                    >
                        <CheckCircle2 size={16} />
                        Status
                    </button>
                    <button
                        onClick={() => setActiveTab('preview')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'preview'
                                ? 'bg-[#252525] text-white'
                                : 'text-[#a1a1aa] hover:text-white'
                            }`}
                    >
                        <FileText size={16} />
                        Preview
                    </button>
                </div>

                {/* Content */}
                {activeTab === 'status' ? (
                    <div className="space-y-4">
                        {/* PRD Status */}
                        <div className={`bg-[#1a1a1a] border rounded-lg p-5 ${summary?.hasPRD ? 'border-green-500/30' : 'border-[#2a2a2a]'
                            }`}>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${summary?.hasPRD ? 'bg-green-500/20' : 'bg-[#252525]'
                                        }`}>
                                        <FileText size={20} className={summary?.hasPRD ? 'text-green-400' : 'text-[#6a6a6a]'} />
                                    </div>
                                    <div>
                                        <h3 className="font-medium">PRD</h3>
                                        <p className="text-sm text-[#a1a1aa]">
                                            {summary?.hasPRD
                                                ? `${summary.featuresCount} core features defined`
                                                : 'Belum dibuat'
                                            }
                                        </p>
                                    </div>
                                </div>
                                {summary?.hasPRD ? (
                                    <CheckCircle2 size={24} className="text-green-400" />
                                ) : (
                                    <AlertCircle size={24} className="text-[#6a6a6a]" />
                                )}
                            </div>
                        </div>

                        {/* Flowchart Status */}
                        <div className={`bg-[#1a1a1a] border rounded-lg p-5 ${summary?.hasFlowchart ? 'border-green-500/30' : 'border-[#2a2a2a]'
                            }`}>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${summary?.hasFlowchart ? 'bg-green-500/20' : 'bg-[#252525]'
                                        }`}>
                                        <GitBranch size={20} className={summary?.hasFlowchart ? 'text-green-400' : 'text-[#6a6a6a]'} />
                                    </div>
                                    <div>
                                        <h3 className="font-medium">Flowchart</h3>
                                        <p className="text-sm text-[#a1a1aa]">
                                            {summary?.hasFlowchart
                                                ? `${summary.nodesCount} nodes in diagram`
                                                : 'Belum dibuat'
                                            }
                                        </p>
                                    </div>
                                </div>
                                {summary?.hasFlowchart ? (
                                    <CheckCircle2 size={24} className="text-green-400" />
                                ) : (
                                    <AlertCircle size={24} className="text-[#6a6a6a]" />
                                )}
                            </div>
                        </div>

                        {/* Wireframes Status */}
                        <div className={`bg-[#1a1a1a] border rounded-lg p-5 ${summary?.hasWireframes ? 'border-green-500/30' : 'border-[#2a2a2a]'
                            }`}>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${summary?.hasWireframes ? 'bg-green-500/20' : 'bg-[#252525]'
                                        }`}>
                                        <PenTool size={20} className={summary?.hasWireframes ? 'text-green-400' : 'text-[#6a6a6a]'} />
                                    </div>
                                    <div>
                                        <h3 className="font-medium">Wireframes</h3>
                                        <p className="text-sm text-[#a1a1aa]">
                                            {summary?.hasWireframes
                                                ? `${summary.artboardsCount} screens, ${summary.shapesCount} elements`
                                                : 'Belum dibuat'
                                            }
                                        </p>
                                    </div>
                                </div>
                                {summary?.hasWireframes ? (
                                    <CheckCircle2 size={24} className="text-green-400" />
                                ) : (
                                    <AlertCircle size={24} className="text-[#6a6a6a]" />
                                )}
                            </div>
                        </div>

                        {/* Tip */}
                        <div className="bg-[#6366f1]/10 border border-[#6366f1]/20 rounded-lg p-4">
                            <p className="text-sm text-[#a1a1aa]">
                                💡 <strong>Tip:</strong> Copy context bundle dan paste ke AI assistant (ChatGPT, Claude, Cursor)
                                untuk development yang konsisten dengan requirements yang sudah didefinisikan.
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-6 overflow-auto max-h-[60vh]">
                        <pre className="whitespace-pre-wrap text-sm font-mono text-[#e4e4e7]">
                            {bundleMarkdown}
                        </pre>
                    </div>
                )}
            </div>
        </div>
    )
}
