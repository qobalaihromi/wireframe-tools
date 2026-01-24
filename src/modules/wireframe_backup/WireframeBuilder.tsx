import { useState, useEffect, useCallback } from 'react'
import { useProjectStore } from '../../stores/projectStore'
import { useWireframeStore, type ShapeType, type Shape } from '../../stores/wireframeStore'
import { FloatingToolbar } from './components/FloatingToolbar'
import { WireframeCanvas } from './WireframeCanvas'
import { NewArtboardPopup } from './components/NewArtboardPopup'
import { ArtboardContextMenu } from './components/ArtboardContextMenu'
import { LayersPanel } from './components/LayersPanel'

export function WireframeBuilder() {
    const currentProject = useProjectStore((state) => state.getCurrentProject())
    const { getArtboards, addArtboard, updateArtboard, deleteArtboard, addShape, updateShape, deleteShape } = useWireframeStore()

    const artboards = currentProject ? getArtboards(currentProject.id) : []

    // Global Canvas State
    const [stageScale, setStageScale] = useState(1)
    const [stagePosition, setStagePosition] = useState({ x: 0, y: 0 })
    const [spacePressed, setSpacePressed] = useState(false)
    const [showNewArtboardPopup, setShowNewArtboardPopup] = useState(false)
    const [selectedArtboardId, setSelectedArtboardId] = useState<string | null>(null)

    const [selectedTool, setSelectedTool] = useState<ShapeType | 'select' | 'hand' | 'frame'>('select')
    const [selectedShapeId, setSelectedShapeId] = useState<string | null>(null)
    const [fillColor, setFillColor] = useState('#6366f1')
    const [strokeColor, setStrokeColor] = useState('#4f46e5')
    const [strokeWidth, _setStrokeWidth] = useState(2)
    const [opacity, _setOpacity] = useState(1)
    const [showGrid, setShowGrid] = useState(false)
    const [gridSize] = useState(20) // 20px grid
    const [contextMenu, setContextMenu] = useState<{ x: number, y: number, artboardId: string, artboardName: string } | null>(null)

    // Ensure at least one artboard exists
    useEffect(() => {
        if (currentProject && artboards.length === 0) {
            // Show popup for first artboard
            setShowNewArtboardPopup(true)
        }
    }, [currentProject?.id, artboards.length])

    const handleAddArtboardWithSize = useCallback((name: string, width: number, height: number) => {
        if (!currentProject) return

        // Calculate position for new artboard
        const lastArtboard = artboards[artboards.length - 1]
        const x = lastArtboard ? lastArtboard.x + lastArtboard.width + 100 : 100
        const y = lastArtboard ? lastArtboard.y : 100

        addArtboard(currentProject.id, name, x, y, width, height)
    }, [currentProject, artboards, addArtboard])

    const handleDuplicateArtboard = useCallback((artboardId: string) => {
        if (!currentProject) return

        const artboardToDuplicate = artboards.find(a => a.id === artboardId)
        if (!artboardToDuplicate) return

        // Position the duplicate to the right
        const newX = artboardToDuplicate.x + artboardToDuplicate.width + 100
        const newName = `${artboardToDuplicate.name} Copy`

        // Create new artboard with same dimensions
        addArtboard(currentProject.id, newName, newX, artboardToDuplicate.y, artboardToDuplicate.width, artboardToDuplicate.height)

        // Copy shapes to new artboard (would need to find the new artboard ID)
        // For now, just duplicate the frame - shapes duplication can be added later
    }, [currentProject, artboards, addArtboard])

    const handleAddShape = useCallback((artboardId: string, shape: Shape) => {
        if (!currentProject) return
        addShape(currentProject.id, artboardId, shape)
        setSelectedShapeId(shape.id)
        setSelectedArtboardId(artboardId)
        setSelectedTool('select')
    }, [currentProject, addShape])

    const handleUpdateShape = useCallback((artboardId: string, shapeId: string, updates: Partial<Shape>) => {
        if (!currentProject) return
        updateShape(currentProject.id, artboardId, shapeId, updates)
    }, [currentProject, updateShape])

    const handleDeleteShape = useCallback((artboardId: string, shapeId: string) => {
        if (!currentProject) return
        deleteShape(currentProject.id, artboardId, shapeId)
        setSelectedShapeId(null)
    }, [currentProject, deleteShape])

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return

            // Delete shape or artboard
            if (e.key === 'Delete' || e.key === 'Backspace') {
                if (selectedShapeId) {
                    // Delete selected shape
                    const ownerArtboard = artboards.find(a => a.shapes.some(s => s.id === selectedShapeId))
                    if (ownerArtboard) {
                        handleDeleteShape(ownerArtboard.id, selectedShapeId)
                    }
                } else if (selectedArtboardId && currentProject) {
                    // Delete selected artboard (if no shape is selected)
                    if (confirm('Delete this artboard?')) {
                        deleteArtboard(currentProject.id, selectedArtboardId)
                        setSelectedArtboardId(null)
                    }
                }
            }

            // Escape
            if (e.key === 'Escape') {
                setSelectedShapeId(null)
                setSelectedArtboardId(null)
                setSelectedTool('select')
                setShowNewArtboardPopup(false)
            }

            // Space for pan
            if (e.code === 'Space') {
                setSpacePressed(true)
            }

            // Cmd+D / Ctrl+D for duplicate
            if ((e.metaKey || e.ctrlKey) && e.key === 'd') {
                e.preventDefault()
                if (selectedArtboardId) {
                    handleDuplicateArtboard(selectedArtboardId)
                }
            }

            // Tool shortcuts
            if (!spacePressed && !e.metaKey && !e.ctrlKey) {
                if (e.key === 'v' || e.key === 'V') setSelectedTool('select')
                if (e.key === 'h' || e.key === 'H') setSelectedTool('hand')
                if (e.key === 'f' || e.key === 'F') setSelectedTool('frame')
                if (e.key === 'r' || e.key === 'R') setSelectedTool('rect')
                if (e.key === 'o' || e.key === 'O') setSelectedTool('circle')
                if (e.key === 't' || e.key === 'T') setSelectedTool('text')
                if (e.key === 'l' || e.key === 'L') setSelectedTool('line')
                if (e.key === 'a' || e.key === 'A') setSelectedTool('arrow')
                if (e.key === 'g' || e.key === 'G') setShowGrid(prev => !prev)
            }
        }

        const handleKeyUp = (e: KeyboardEvent) => {
            if (e.code === 'Space') {
                setSpacePressed(false)
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        window.addEventListener('keyup', handleKeyUp)
        return () => {
            window.removeEventListener('keydown', handleKeyDown)
            window.removeEventListener('keyup', handleKeyUp)
        }
    }, [selectedShapeId, selectedArtboardId, handleDeleteShape, handleDuplicateArtboard, artboards, spacePressed])

    if (!currentProject) {
        return (
            <div className="h-full flex items-center justify-center">
                <p className="text-[#a1a1aa]">Please select a project first</p>
            </div>
        )
    }

    return (
        <div className="h-full flex overflow-hidden">
            <div className="flex-1 min-w-0 flex flex-col relative">
                {/* Floating Toolbar for Infinite Canvas */}
                <div className="absolute top-4 left-4 z-10 flex gap-2">
                    <button
                        onClick={() => setShowNewArtboardPopup(true)}
                        className="bg-[#252525] hover:bg-[#333] text-white px-3 py-2 rounded-lg text-sm shadow-xl border border-[#333]"
                    >
                        + New Artboard
                    </button>
                    <div className="bg-[#252525] text-[#a1a1aa] px-3 py-2 rounded-lg text-sm shadow-xl border border-[#333] flex items-center gap-2">
                        <span>Zoom: {Math.round(stageScale * 100)}%</span>
                        <button onClick={() => { setStageScale(1); setStagePosition({ x: 0, y: 0 }) }} className="hover:text-white ml-2">Reset</button>
                    </div>
                    {selectedArtboardId && (
                        <button
                            onClick={() => handleDuplicateArtboard(selectedArtboardId)}
                            className="bg-[#252525] hover:bg-[#333] text-white px-3 py-2 rounded-lg text-sm shadow-xl border border-[#333]"
                            title="Duplicate Artboard (Cmd+D)"
                        >
                            Duplicate
                        </button>
                    )}
                </div>

                <WireframeCanvas
                    artboards={artboards}
                    stageScale={stageScale}
                    stagePosition={stagePosition}
                    onStageChange={(scale, pos) => {
                        setStageScale(scale)
                        setStagePosition(pos)
                    }}
                    selectedShapeId={selectedShapeId}
                    selectedArtboardId={selectedArtboardId}
                    selectedTool={spacePressed ? 'hand' : selectedTool}
                    fillColor={fillColor}
                    strokeColor={strokeColor}
                    strokeWidth={strokeWidth}
                    opacity={opacity}
                    onShapeSelect={setSelectedShapeId}
                    onArtboardSelect={setSelectedArtboardId}
                    onAddShape={handleAddShape}
                    onUpdateShape={handleUpdateShape}
                    onAddArtboard={(x: number, y: number, width: number, height: number) => {
                        if (!currentProject) return
                        addArtboard(currentProject.id, `Screen ${artboards.length + 1}`, x, y, width, height)
                        setSelectedTool('select')
                    }}
                    onRenameArtboard={(artboardId: string, newName: string) => {
                        if (!currentProject) return
                        updateArtboard(currentProject.id, artboardId, { name: newName })
                    }}
                    onContextMenuArtboard={(artboardId: string, artboardName: string, x: number, y: number) => {
                        setContextMenu({ x, y, artboardId, artboardName })
                    }}
                    onMoveArtboard={(artboardId: string, x: number, y: number) => {
                        if (!currentProject) return
                        updateArtboard(currentProject.id, artboardId, { x, y })
                    }}
                    onResizeArtboard={(artboardId: string, width: number, height: number, newX?: number, newY?: number) => {
                        if (!currentProject) return
                        const updates: { width: number, height: number, x?: number, y?: number } = { width, height }
                        if (newX !== undefined) updates.x = newX
                        if (newY !== undefined) updates.y = newY
                        updateArtboard(currentProject.id, artboardId, updates)
                    }}
                    showGrid={showGrid}
                    gridSize={gridSize}
                />

                {/* Floating Toolbar at Bottom */}
                <FloatingToolbar
                    selectedTool={spacePressed ? 'hand' : selectedTool}
                    onSelectTool={(t) => setSelectedTool(t)}
                    fillColor={fillColor}
                    strokeColor={strokeColor}
                    onFillColorChange={setFillColor}
                    onStrokeColorChange={setStrokeColor}
                />
            </div>

            {/* Layers Panel - Right Sidebar */}
            <LayersPanel
                artboards={artboards}
                selectedArtboardId={selectedArtboardId}
                selectedShapeId={selectedShapeId}
                onSelectArtboard={setSelectedArtboardId}
                onSelectShape={(artboardId, shapeId) => {
                    setSelectedArtboardId(artboardId)
                    setSelectedShapeId(shapeId)
                }}
                onRenameArtboard={(artboardId, newName) => {
                    if (!currentProject) return
                    updateArtboard(currentProject.id, artboardId, { name: newName })
                }}
                onDuplicateArtboard={handleDuplicateArtboard}
                onDeleteArtboard={(artboardId) => {
                    if (!currentProject) return
                    deleteArtboard(currentProject.id, artboardId)
                }}
            />

            {/* New Artboard Popup */}
            <NewArtboardPopup
                isOpen={showNewArtboardPopup}
                onClose={() => setShowNewArtboardPopup(false)}
                onSelect={handleAddArtboardWithSize}
                artboardCount={artboards.length}
            />

            {/* Artboard Context Menu */}
            {contextMenu && (
                <ArtboardContextMenu
                    x={contextMenu.x}
                    y={contextMenu.y}
                    artboardId={contextMenu.artboardId}
                    artboardName={contextMenu.artboardName}
                    onClose={() => setContextMenu(null)}
                    onRename={(artboardId, newName) => {
                        if (!currentProject) return
                        updateArtboard(currentProject.id, artboardId, { name: newName })
                    }}
                    onDuplicate={handleDuplicateArtboard}
                    onDelete={(artboardId) => {
                        if (!currentProject) return
                        deleteArtboard(currentProject.id, artboardId)
                    }}
                />
            )}
        </div>
    )
}
