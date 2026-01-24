import { useState } from 'react'
import { LayoutGrid, Paintbrush, Grid3X3, ZoomIn, ZoomOut, Download, ChevronDown, Undo2, Redo2 } from 'lucide-react'

// Editor Mode removed, defaulted to Design

interface TopBarProps {
    showGrid: boolean
    onToggleGrid: () => void
    zoom: number
    onZoomIn: () => void
    onZoomOut: () => void
    artboardName?: string
    // Export props
    onExportArtboard?: () => void
    onExportAllArtboards?: () => void
    canExport?: boolean
    // Undo/Redo props
    onUndo?: () => void
    onRedo?: () => void
    canUndo?: boolean
    canRedo?: boolean
}

export function TopBar({
    showGrid,
    onToggleGrid,
    zoom,
    onZoomIn,
    onZoomOut,
    artboardName,
    onExportArtboard,
    onExportAllArtboards,
    canExport = false,
    onUndo,
    onRedo,
    canUndo = false,
    canRedo = false,
}: TopBarProps) {
    const [showExportMenu, setShowExportMenu] = useState(false)

    return (
        <div className="h-12 bg-[#1a1a1a] border-b border-[#333] flex items-center justify-between px-4">
            {/* Left: Undo/Redo Buttons */}
            <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 bg-[#0a0a0a] rounded-lg border border-[#333] px-1">
                    <button
                        onClick={onUndo}
                        disabled={!canUndo}
                        title="Undo (Cmd+Z)"
                        className={`
                            p-1.5 transition-all rounded
                            ${canUndo
                                ? 'text-[#888] hover:text-white hover:bg-[#333]'
                                : 'text-[#444] cursor-not-allowed'
                            }
                        `}
                    >
                        <Undo2 size={14} />
                    </button>
                    <button
                        onClick={onRedo}
                        disabled={!canRedo}
                        title="Redo (Cmd+Shift+Z)"
                        className={`
                            p-1.5 transition-all rounded
                            ${canRedo
                                ? 'text-[#888] hover:text-white hover:bg-[#333]'
                                : 'text-[#444] cursor-not-allowed'
                            }
                        `}
                    >
                        <Redo2 size={14} />
                    </button>
                </div>
            </div>

            {/* Center: Artboard Name (optional) */}
            <div className="absolute left-1/2 -translate-x-1/2">
                {artboardName && (
                    <span className="text-sm text-[#888]">{artboardName}</span>
                )}
            </div>

            {/* Right: View Options */}
            <div className="flex items-center gap-2">
                {/* Export Button */}
                <div className="relative">
                    <button
                        onClick={() => setShowExportMenu(!showExportMenu)}
                        disabled={!canExport}
                        title="Export"
                        className={`
                            flex items-center gap-1 px-3 py-1.5 rounded-lg transition-all text-sm
                            ${canExport
                                ? 'bg-[#10b981] hover:bg-[#059669] text-white'
                                : 'bg-[#252525] text-[#555] cursor-not-allowed'
                            }
                        `}
                    >
                        <Download size={14} />
                        <span>Export</span>
                        <ChevronDown size={12} />
                    </button>

                    {/* Export Dropdown */}
                    {showExportMenu && canExport && (
                        <>
                            <div className="fixed inset-0 z-10" onClick={() => setShowExportMenu(false)} />
                            <div className="absolute right-0 top-full mt-1 bg-[#1a1a1a] border border-[#333] rounded-lg shadow-xl z-20 min-w-[180px] py-1">
                                <button
                                    onClick={() => {
                                        onExportArtboard?.()
                                        setShowExportMenu(false)
                                    }}
                                    className="w-full text-left px-4 py-2 text-sm text-[#ddd] hover:bg-[#252525] flex items-center gap-2"
                                >
                                    <Download size={14} />
                                    Export Selected
                                </button>
                                <button
                                    onClick={() => {
                                        onExportAllArtboards?.()
                                        setShowExportMenu(false)
                                    }}
                                    className="w-full text-left px-4 py-2 text-sm text-[#ddd] hover:bg-[#252525] flex items-center gap-2"
                                >
                                    <Download size={14} />
                                    Export All Artboards
                                </button>
                            </div>
                        </>
                    )}
                </div>

                {/* Grid Toggle */}
                <button
                    onClick={onToggleGrid}
                    title="Toggle Grid"
                    className={`
                        p-2 rounded-lg transition-all
                        ${showGrid
                            ? 'bg-[#6366f1] text-white'
                            : 'text-[#888] hover:bg-[#252525] hover:text-white'
                        }
                    `}
                >
                    <Grid3X3 size={16} />
                </button>

                {/* Zoom Controls */}
                <div className="flex items-center gap-1 bg-[#0a0a0a] rounded-lg border border-[#333] px-1">
                    <button
                        onClick={onZoomOut}
                        title="Zoom Out"
                        className="p-1.5 text-[#888] hover:text-white transition-all"
                    >
                        <ZoomOut size={14} />
                    </button>
                    <span className="text-xs text-[#888] w-12 text-center">
                        {Math.round(zoom * 100)}%
                    </span>
                    <button
                        onClick={onZoomIn}
                        title="Zoom In"
                        className="p-1.5 text-[#888] hover:text-white transition-all"
                    >
                        <ZoomIn size={14} />
                    </button>
                </div>
            </div>
        </div>
    )
}
