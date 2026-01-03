import { Download, Trash2, Plus, Image } from 'lucide-react'
import type { Artboard } from '../../stores/wireframeStore'

interface WireframeToolbarProps {
    artboards: Artboard[]
    currentArtboardId: string | null
    onSelectArtboard: (id: string) => void
    onAddArtboard: () => void
    onDeleteArtboard: (id: string) => void
    onExportPNG: () => void
}

export function WireframeToolbar({
    artboards,
    currentArtboardId,
    onSelectArtboard,
    onAddArtboard,
    onDeleteArtboard,
    onExportPNG,
}: WireframeToolbarProps) {
    const currentArtboard = artboards.find(a => a.id === currentArtboardId)

    return (
        <div className="h-12 bg-[#1a1a1a] border-b border-[#2a2a2a] flex items-center justify-between px-4">
            <div className="flex items-center gap-2">
                {/* Artboard tabs */}
                <div className="flex items-center gap-1">
                    {artboards.map((artboard) => (
                        <button
                            key={artboard.id}
                            onClick={() => onSelectArtboard(artboard.id)}
                            className={`
                px-3 py-1.5 rounded-lg text-sm font-medium transition-colors
                ${artboard.id === currentArtboardId
                                    ? 'bg-[#6366f1] text-white'
                                    : 'bg-[#252525] text-[#a1a1aa] hover:text-white hover:bg-[#2a2a2a]'
                                }
              `}
                        >
                            {artboard.name}
                        </button>
                    ))}
                </div>

                <button
                    onClick={onAddArtboard}
                    className="p-1.5 rounded-lg text-[#a1a1aa] hover:text-white hover:bg-[#252525] transition-colors"
                    title="Add artboard"
                >
                    <Plus size={18} />
                </button>
            </div>

            <div className="flex items-center gap-2">
                {currentArtboard && (
                    <span className="text-sm text-[#6a6a6a]">
                        {currentArtboard.shapes.length} shapes
                    </span>
                )}

                <button
                    onClick={onExportPNG}
                    disabled={!currentArtboard}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm text-[#a1a1aa] hover:text-white hover:bg-[#252525] disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
                    title="Export as PNG"
                >
                    <Image size={16} />
                    PNG
                </button>

                {currentArtboard && (
                    <button
                        onClick={() => onDeleteArtboard(currentArtboard.id)}
                        className="flex items-center gap-2 px-3 py-1.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                        title="Delete artboard"
                    >
                        <Trash2 size={16} />
                    </button>
                )}
            </div>
        </div>
    )
}
