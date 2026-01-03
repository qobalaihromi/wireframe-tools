import { Download, Trash2, Image, LayoutGrid, MousePointer2, Hand, Undo2, Redo2, MoveRight, Minus } from 'lucide-react'
import type { Node, Edge } from '@xyflow/react'

interface FlowchartToolbarProps {
    nodes: Node[]
    edges: Edge[]
    onClear: () => void
    onAutoLayout?: () => void
    onSelectAll?: () => void
    activeTool?: 'select' | 'hand'
    onToolChange?: (tool: 'select' | 'hand') => void
    onUndo?: () => void
    onRedo?: () => void
    canUndo?: boolean
    canRedo?: boolean
    onEdgeStyleChange?: (style: 'solid' | 'dashed', hasArrow: boolean) => void
}

export function FlowchartToolbar({
    nodes,
    edges,
    onClear,
    onAutoLayout,
    onSelectAll,
    activeTool = 'select',
    onToolChange,
    onUndo,
    onRedo,
    canUndo,
    canRedo,
    onEdgeStyleChange
}: FlowchartToolbarProps) {
    const handleExportJSON = () => {
        const data = JSON.stringify({ nodes, edges }, null, 2)
        const blob = new Blob([data], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'flowchart.json'
        a.click()
        URL.revokeObjectURL(url)
    }

    const handleExportPNG = async () => {
        const viewport = document.querySelector('.react-flow__viewport') as HTMLElement
        if (!viewport) return

        try {
            const { toPng } = await import('html-to-image')
            const dataUrl = await toPng(viewport, {
                backgroundColor: '#0f0f0f',
                quality: 1,
            })

            const a = document.createElement('a')
            a.href = dataUrl
            a.download = 'flowchart.png'
            a.click()
        } catch (err) {
            console.error('Failed to export PNG:', err)
            alert('PNG export failed')
        }
    }

    return (
        <div className="h-12 bg-[#1a1a1a] border-b border-[#2a2a2a] flex items-center justify-between px-4">
            <div className="flex items-center gap-2">
                {onToolChange && (
                    <div className="flex bg-[#252525] p-0.5 rounded-lg border border-[#2a2a2a] mr-4">
                        <button
                            onClick={() => onToolChange('select')}
                            className={`p-1.5 rounded ${activeTool === 'select' ? 'bg-[#3b82f6] text-white' : 'text-[#a1a1aa] hover:text-white'}`}
                            title="Select Tool (V)"
                        >
                            <MousePointer2 size={16} />
                        </button>
                        <button
                            onClick={() => onToolChange('hand')}
                            className={`p-1.5 rounded ${activeTool === 'hand' ? 'bg-[#3b82f6] text-white' : 'text-[#a1a1aa] hover:text-white'}`}
                            title="Hand Tool (H)"
                        >
                            <Hand size={16} />
                        </button>
                    </div>
                )}

                <div className="flex items-center gap-2 text-sm text-[#a1a1aa]">
                    <span>{nodes.length} nodes</span>
                    <span className="text-[#3a3a3a]">|</span>
                    <span>{edges.length} connections</span>
                </div>
            </div>

            <div className="flex items-center gap-2">
                {(onUndo || onRedo) && (
                    <div className="flex bg-[#252525] p-0.5 rounded-lg border border-[#2a2a2a] mr-2">
                        <button
                            onClick={onUndo}
                            disabled={!canUndo}
                            className="p-1.5 rounded text-[#a1a1aa] hover:text-white disabled:opacity-30 disabled:hover:text-[#a1a1aa]"
                            title="Undo (Ctrl+Z)"
                        >
                            <Undo2 size={16} />
                        </button>
                        <button
                            onClick={onRedo}
                            disabled={!canRedo}
                            className="p-1.5 rounded text-[#a1a1aa] hover:text-white disabled:opacity-30 disabled:hover:text-[#a1a1aa]"
                            title="Redo (Ctrl+Y)"
                        >
                            <Redo2 size={16} />
                        </button>
                    </div>
                )}

                {onEdgeStyleChange && (
                    <div className="flex bg-[#252525] p-0.5 rounded-lg border border-[#2a2a2a] mr-4">
                        <button
                            onClick={() => onEdgeStyleChange('solid', false)}
                            className="p-1.5 rounded text-[#a1a1aa] hover:text-white hover:bg-[#333]"
                            title="Solid Line"
                        >
                            <Minus size={16} />
                        </button>
                        <button
                            onClick={() => onEdgeStyleChange('dashed', false)}
                            className="p-1.5 rounded text-[#a1a1aa] hover:text-white hover:bg-[#333]"
                            title="Dashed Line"
                        >
                            <span className="font-bold text-xs tracking-widest">- -</span>
                        </button>
                        <div className="w-px bg-[#333] mx-1 my-1"></div>
                        <button
                            onClick={() => onEdgeStyleChange('solid', true)}
                            className="p-1.5 rounded text-[#a1a1aa] hover:text-white hover:bg-[#333]"
                            title="Arrow End"
                        >
                            <MoveRight size={16} />
                        </button>
                    </div>
                )}

                {onSelectAll && (
                    <button
                        onClick={onSelectAll}
                        disabled={nodes.length === 0}
                        className="flex items-center gap-2 px-3 py-1.5 text-sm text-[#a1a1aa] hover:text-white hover:bg-[#252525] disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
                        title="Select All (Ctrl+A)"
                    >
                        <span className="text-xs border border-[#4a4a4a] rounded px-1">Al</span>
                        Select All
                    </button>
                )}
                {onAutoLayout && (
                    <button
                        onClick={onAutoLayout}
                        disabled={nodes.length < 2}
                        className="flex items-center gap-2 px-3 py-1.5 text-sm text-[#a1a1aa] hover:text-white hover:bg-[#252525] disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
                        title="Auto-layout nodes"
                    >
                        <LayoutGrid size={16} />
                        Layout
                    </button>
                )}
                <button
                    onClick={handleExportPNG}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm text-[#a1a1aa] hover:text-white hover:bg-[#252525] rounded-lg transition-colors"
                    title="Export as PNG"
                >
                    <Image size={16} />
                    PNG
                </button>
                <button
                    onClick={handleExportJSON}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm text-[#a1a1aa] hover:text-white hover:bg-[#252525] rounded-lg transition-colors"
                    title="Export as JSON"
                >
                    <Download size={16} />
                    JSON
                </button>
                <button
                    onClick={onClear}
                    disabled={nodes.length === 0}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
                    title="Clear canvas"
                >
                    <Trash2 size={16} />
                    Clear
                </button>
            </div>
        </div>
    )
}
