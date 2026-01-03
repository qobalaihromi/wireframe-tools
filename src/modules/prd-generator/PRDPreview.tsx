import { useState } from 'react'
import {
    Copy,
    Check,
    Download,
    ArrowLeft,
    FileText,
    Target,
    Ban
} from 'lucide-react'
import type { PRDData } from '../../lib/prdTemplate'
import { generatePRDMarkdown } from '../../lib/prdTemplate'

interface PRDPreviewProps {
    data: PRDData
    onEdit: () => void
    onSave: () => void
}

export function PRDPreview({ data, onEdit, onSave }: PRDPreviewProps) {
    const [copied, setCopied] = useState(false)
    const [activeTab, setActiveTab] = useState<'preview' | 'scope'>('preview')

    const markdown = generatePRDMarkdown(data)

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(markdown)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        } catch (err) {
            console.error('Failed to copy:', err)
        }
    }

    const handleDownload = () => {
        const blob = new Blob([markdown], { type: 'text/markdown' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `PRD-${data.projectName.replace(/\s+/g, '-')}.md`
        a.click()
        URL.revokeObjectURL(url)
    }

    return (
        <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-xl font-semibold">{data.projectName}</h2>
                    <p className="text-sm text-[#a1a1aa]">PRD Generated</p>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={onEdit}
                        className="flex items-center gap-2 px-4 py-2 text-[#a1a1aa] hover:text-white hover:bg-[#252525] rounded-lg transition-colors"
                    >
                        <ArrowLeft size={18} />
                        Edit
                    </button>
                    <button
                        onClick={handleDownload}
                        className="flex items-center gap-2 px-4 py-2 text-[#a1a1aa] hover:text-white hover:bg-[#252525] rounded-lg transition-colors"
                    >
                        <Download size={18} />
                        Download
                    </button>
                    <button
                        onClick={handleCopy}
                        className="flex items-center gap-2 bg-[#6366f1] hover:bg-[#4f46e5] text-white px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                        {copied ? <Check size={18} /> : <Copy size={18} />}
                        {copied ? 'Copied!' : 'Copy'}
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 mb-4 p-1 bg-[#1a1a1a] rounded-lg w-fit">
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
                <button
                    onClick={() => setActiveTab('scope')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'scope'
                        ? 'bg-[#252525] text-white'
                        : 'text-[#a1a1aa] hover:text-white'
                        }`}
                >
                    <Target size={16} />
                    Scope Lock
                </button>
            </div>

            {/* Content */}
            {activeTab === 'preview' ? (
                <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-6 overflow-auto max-h-[60vh]">
                    <pre className="whitespace-pre-wrap text-sm font-mono text-[#e4e4e7]">
                        {markdown}
                    </pre>
                </div>
            ) : (
                <div className="space-y-4">
                    {/* In Scope */}
                    <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-5">
                        <div className="flex items-center gap-2 mb-4">
                            <Target size={18} className="text-green-400" />
                            <h3 className="font-medium">In Scope (MVP)</h3>
                        </div>
                        <div className="space-y-2">
                            {data.coreFeatures.filter(f => f.trim()).map((feature, index) => (
                                <div
                                    key={index}
                                    className="flex items-center gap-3 p-3 bg-green-500/10 border border-green-500/20 rounded-lg"
                                >
                                    <span className="w-6 h-6 flex items-center justify-center bg-green-500/20 rounded text-green-400 text-sm font-medium">
                                        {index + 1}
                                    </span>
                                    <span className="text-sm">{feature}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Out of Scope */}
                    <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-5">
                        <div className="flex items-center gap-2 mb-4">
                            <Ban size={18} className="text-red-400" />
                            <h3 className="font-medium">Out of Scope (Parking Lot)</h3>
                        </div>
                        {data.outOfScope.filter(f => f.trim()).length > 0 ? (
                            <div className="space-y-2">
                                {data.outOfScope.filter(f => f.trim()).map((item, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center gap-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg"
                                    >
                                        <span className="w-6 h-6 flex items-center justify-center bg-red-500/20 rounded text-red-400 text-sm">
                                            ✕
                                        </span>
                                        <span className="text-sm text-[#a1a1aa]">{item}</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-[#6a6a6a]">Tidak ada item out of scope</p>
                        )}
                        <p className="mt-4 text-xs text-[#6a6a6a]">
                            ⚠️ Jika ada request fitur baru, tanyakan apakah masuk MVP atau ditambahkan ke sini.
                        </p>
                    </div>
                </div>
            )}

            {/* Save indicator */}
            <p className="text-center text-xs text-[#6a6a6a] mt-4">
                ✓ Auto-saved ke browser storage
            </p>
        </div>
    )
}
