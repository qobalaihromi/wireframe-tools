import { useState } from 'react'
import { ChevronDown, ChevronRight, Frame, Square, Circle, Type, Minus, ArrowRight, MoreHorizontal } from 'lucide-react'
import type { Artboard, Shape } from '../../../stores/wireframeStore'

interface LayersPanelProps {
    artboards: Artboard[]
    selectedArtboardId: string | null
    selectedShapeId: string | null
    onSelectArtboard: (artboardId: string | null) => void
    onSelectShape: (artboardId: string, shapeId: string | null) => void
    onRenameArtboard: (artboardId: string, newName: string) => void
    onDuplicateArtboard: (artboardId: string) => void
    onDeleteArtboard: (artboardId: string) => void
}

export function LayersPanel({
    artboards,
    selectedArtboardId,
    selectedShapeId,
    onSelectArtboard,
    onSelectShape,
    onRenameArtboard,
    onDuplicateArtboard,
    onDeleteArtboard,
}: LayersPanelProps) {
    const [expandedArtboards, setExpandedArtboards] = useState<Set<string>>(new Set(artboards.map(a => a.id)))
    const [contextMenu, setContextMenu] = useState<{ x: number, y: number, artboardId: string } | null>(null)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [editValue, setEditValue] = useState('')

    const toggleExpanded = (artboardId: string) => {
        const newSet = new Set(expandedArtboards)
        if (newSet.has(artboardId)) {
            newSet.delete(artboardId)
        } else {
            newSet.add(artboardId)
        }
        setExpandedArtboards(newSet)
    }

    const getShapeIcon = (type: Shape['type']) => {
        switch (type) {
            case 'rect': return <Square size={14} />
            case 'circle': return <Circle size={14} />
            case 'text': return <Type size={14} />
            case 'line': return <Minus size={14} />
            case 'arrow': return <ArrowRight size={14} />
            case 'button': return <Square size={14} className="text-blue-400" />
            case 'input': return <Square size={14} className="text-green-400" />
            case 'card': return <Square size={14} className="text-purple-400" />
            default: return <Square size={14} />
        }
    }

    const handleContextMenu = (e: React.MouseEvent, artboardId: string) => {
        e.preventDefault()
        const menuWidth = 140
        const menuHeight = 100
        // Calculate position - shift left if would overflow right edge
        let x = e.clientX
        let y = e.clientY
        if (x + menuWidth > window.innerWidth) {
            x = x - menuWidth
        }
        if (y + menuHeight > window.innerHeight) {
            y = y - menuHeight
        }
        setContextMenu({ x, y, artboardId })
    }

    const handleStartRename = (artboardId: string, currentName: string) => {
        setEditingId(artboardId)
        setEditValue(currentName)
        setContextMenu(null)
    }

    const handleFinishRename = () => {
        if (editingId && editValue.trim()) {
            onRenameArtboard(editingId, editValue.trim())
        }
        setEditingId(null)
        setEditValue('')
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleFinishRename()
        } else if (e.key === 'Escape') {
            setEditingId(null)
            setEditValue('')
        }
    }

    return (
        <div className="w-56 bg-[#1a1a1a] border-r border-[#333] flex flex-col h-full">
            {/* Header */}
            <div className="px-3 py-2 border-b border-[#333] flex items-center justify-between">
                <span className="text-sm font-medium text-white">Layers</span>
                <span className="text-xs text-[#666]">{artboards.length}</span>
            </div>

            {/* Artboard List */}
            <div className="flex-1 overflow-y-auto py-1">
                {artboards.length === 0 ? (
                    <div className="px-3 py-4 text-center text-[#666] text-sm">
                        No artboards yet
                    </div>
                ) : (
                    artboards.map(artboard => (
                        <div key={artboard.id}>
                            {/* Artboard Item */}
                            <div
                                className={`flex items-center px-2 py-1.5 cursor-pointer group
                                    ${selectedArtboardId === artboard.id ? 'bg-[#333]' : 'hover:bg-[#252525]'}`}
                                onClick={() => onSelectArtboard(artboard.id)}
                                onContextMenu={(e) => handleContextMenu(e, artboard.id)}
                                onDoubleClick={() => handleStartRename(artboard.id, artboard.name)}
                            >
                                {/* Expand/Collapse */}
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        toggleExpanded(artboard.id)
                                    }}
                                    className="p-0.5 hover:bg-[#444] rounded mr-1"
                                >
                                    {expandedArtboards.has(artboard.id)
                                        ? <ChevronDown size={14} className="text-[#888]" />
                                        : <ChevronRight size={14} className="text-[#888]" />
                                    }
                                </button>

                                {/* Icon */}
                                <Frame size={14} className="text-[#888] mr-2" />

                                {/* Name (editable) */}
                                {editingId === artboard.id ? (
                                    <input
                                        type="text"
                                        value={editValue}
                                        onChange={(e) => setEditValue(e.target.value)}
                                        onBlur={handleFinishRename}
                                        onKeyDown={handleKeyDown}
                                        autoFocus
                                        className="flex-1 bg-[#333] text-white text-sm px-1 py-0.5 rounded outline-none border border-[#6366f1]"
                                    />
                                ) : (
                                    <span className="flex-1 text-sm text-white truncate">
                                        {artboard.name}
                                    </span>
                                )}

                                {/* Size Badge */}
                                <span className="text-[10px] text-[#666] ml-2">
                                    {artboard.width}×{artboard.height}
                                </span>

                                {/* More Button */}
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        handleContextMenu(e, artboard.id)
                                    }}
                                    className="p-1 opacity-0 group-hover:opacity-100 hover:bg-[#444] rounded ml-1"
                                >
                                    <MoreHorizontal size={14} className="text-[#888]" />
                                </button>
                            </div>

                            {/* Shapes List */}
                            {expandedArtboards.has(artboard.id) && artboard.shapes.length > 0 && (
                                <div className="ml-6">
                                    {artboard.shapes.map(shape => (
                                        <div
                                            key={shape.id}
                                            className={`flex items-center px-2 py-1 cursor-pointer
                                                ${selectedShapeId === shape.id ? 'bg-[#333]' : 'hover:bg-[#252525]'}`}
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                onSelectShape(artboard.id, shape.id)
                                            }}
                                        >
                                            <span className="text-[#888] mr-2">{getShapeIcon(shape.type)}</span>
                                            <span className="text-sm text-[#aaa] capitalize">{shape.type}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>

            {/* Context Menu */}
            {contextMenu && (
                <>
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setContextMenu(null)}
                    />
                    <div
                        className="fixed z-50 bg-[#1a1a1a] border border-[#333] rounded-lg shadow-xl py-1 min-w-[140px]"
                        style={{ left: contextMenu.x, top: contextMenu.y }}
                    >
                        <button
                            onClick={() => {
                                const artboard = artboards.find(a => a.id === contextMenu.artboardId)
                                if (artboard) handleStartRename(artboard.id, artboard.name)
                            }}
                            className="w-full px-3 py-1.5 text-left text-sm text-white hover:bg-[#333]"
                        >
                            Rename
                        </button>
                        <button
                            onClick={() => {
                                onDuplicateArtboard(contextMenu.artboardId)
                                setContextMenu(null)
                            }}
                            className="w-full px-3 py-1.5 text-left text-sm text-white hover:bg-[#333]"
                        >
                            Duplicate
                        </button>
                        <button
                            onClick={() => {
                                if (confirm('Delete this artboard?')) {
                                    onDeleteArtboard(contextMenu.artboardId)
                                }
                                setContextMenu(null)
                            }}
                            className="w-full px-3 py-1.5 text-left text-sm text-red-400 hover:bg-[#333]"
                        >
                            Delete
                        </button>
                    </div>
                </>
            )}
        </div>
    )
}
