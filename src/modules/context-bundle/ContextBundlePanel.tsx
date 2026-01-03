import { useState, useEffect } from 'react'
import { X, Copy, Check } from 'lucide-react'
import { generateContextBundle } from './ContextBundleGenerator'

interface ContextBundlePanelProps {
    projectId: string
    projectName: string
    isOpen: boolean
    onClose: () => void
}

export function ContextBundlePanel({ projectId, projectName, isOpen, onClose }: ContextBundlePanelProps) {
    const [bundleContent, setBundleContent] = useState<string>('')
    const [isCopied, setIsCopied] = useState(false)

    useEffect(() => {
        if (isOpen) {
            generateContextBundle(projectId, projectName).then(setBundleContent)
        }
    }, [isOpen, projectId, projectName])

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(bundleContent)
            setIsCopied(true)
            setTimeout(() => setIsCopied(false), 2000)
        } catch (err) {
            console.error('Failed to copy', err)
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-[#1e1e1e] w-full max-w-3xl h-[80vh] rounded-xl flex flex-col shadow-2xl border border-[#333]">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-[#333]">
                    <div className="flex items-center gap-2">
                        <span className="text-xl">📦</span>
                        <h2 className="text-lg font-semibold text-white">Context Bundle</h2>
                    </div>
                    <button onClick={onClose} className="text-[#a1a1aa] hover:text-white">
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-auto p-4 bg-[#111]">
                    <pre className="text-sm text-[#a1a1aa] font-mono whitespace-pre-wrap">
                        {bundleContent || 'Generating bundle...'}
                    </pre>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between p-4 border-t border-[#333] bg-[#1e1e1e]">
                    <p className="text-xs text-[#666]">
                        Paste this into ChatGPT/Claude to give full context.
                    </p>
                    <div className="flex gap-2">
                        <button
                            onClick={handleCopy}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${isCopied
                                ? 'bg-green-500/20 text-green-400'
                                : 'bg-[#6366f1] hover:bg-[#4f46e5] text-white'
                                }`}
                        >
                            {isCopied ? <Check size={16} /> : <Copy size={16} />}
                            {isCopied ? 'Copied!' : 'Copy to Clipboard'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
