import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { useProjectStore } from '../../stores/projectStore'
import { useWireframeStore, type ShapeType, type WireframeNode, type LayoutConfig } from '../../stores/wireframeStore'
import { VibePropertiesPanel } from './components/VibePropertiesPanel'
import { FloatingToolbar } from './components/FloatingToolbar'
import { WireframeCanvas, type WireframeCanvasRef } from './WireframeCanvas'
import { NewArtboardPopup } from './components/NewArtboardPopup'
import { DebugPanel } from './components/DebugPanel'
import { ArtboardContextMenu } from './components/ArtboardContextMenu'
import { LayersPanel } from './components/LayersPanel'
import { TopBar } from './components/TopBar'
import { PanelRightOpen, PanelRightClose, PanelLeftOpen, PanelLeftClose } from 'lucide-react'
import { exportArtboardToPNG, exportAllArtboardsToPNG } from './utils/exportUtils'
import { useWireframeHistory } from '../../hooks/useWireframeHistory'

export function WireframeBuilder() {
    const currentProject = useProjectStore((state) => state.getCurrentProject())
    const { getArtboards, setArtboards, addArtboard, updateArtboard, deleteArtboard, addNode, updateNode, deleteNode, moveNode, alignNodes, distributeNodes, updateLayout, groupNodes, ungroupNodes } = useWireframeStore()

    const artboards = currentProject ? getArtboards(currentProject.id) : []

    // Ref for canvas to access stage for export
    const canvasRef = useRef<WireframeCanvasRef>(null)

    // Undo/Redo history
    const { takeSnapshot, undo, redo, canUndo, canRedo } = useWireframeHistory({
        artboards,
        setArtboards: (newArtboards) => {
            if (currentProject) {
                setArtboards(currentProject.id, newArtboards)
            }
        },
    })

    // Global Canvas State
    const [stageScale, setStageScale] = useState(1)
    const [stagePosition, setStagePosition] = useState({ x: 0, y: 0 })
    const [spacePressed, setSpacePressed] = useState(false)
    const [showNewArtboardPopup, setShowNewArtboardPopup] = useState(false)
    const [selectedArtboardId, setSelectedArtboardId] = useState<string | null>(null)

    const [selectedTool, setSelectedTool] = useState<ShapeType | 'select' | 'hand' | 'frame'>('select')
    const [selectedArtboardIds, setSelectedArtboardIds] = useState<string[]>([])
    const [selectedShapeId, setSelectedShapeId] = useState<string | null>(null)
    const [selectedShapeIds, setSelectedShapeIds] = useState<string[]>([])
    const [fillColor, setFillColor] = useState('#6366f1')
    const [strokeColor, setStrokeColor] = useState('#4f46e5')
    const [strokeWidth, _setStrokeWidth] = useState(2)
    const [opacity, _setOpacity] = useState(1)
    const [showGrid, setShowGrid] = useState(false)
    const [gridSize] = useState(20) // 20px grid
    const [contextMenu, setContextMenu] = useState<{ x: number, y: number, artboardId: string, artboardName: string } | null>(null)

    // Left Panel State (Layers)
    const [leftPanelOpen, setLeftPanelOpen] = useState(true)

    // Right Panel State (Properties)
    const [rightPanelOpen, setRightPanelOpen] = useState(true)

    // Property State for new shapes and editing
    const [borderRadius, setBorderRadius] = useState(0)
    const [fontSize, setFontSize] = useState(16)


    const handleDropComponent = useCallback((template: any, artboardId: string | null, x: number, y: number) => {
        if (!currentProject || !artboardId) return

        const nodes = generateNodesFromTemplate(template)
        takeSnapshot()

        nodes.forEach(node => {
            addNode(currentProject.id, artboardId, {
                ...node,
                x: x + node.x,
                y: y + node.y
            })
        })
    }, [currentProject, addNode, takeSnapshot])

    // Helper: Find selected node across all artboards (recursive)
    const selectedNode = useMemo(() => {
        if (!selectedShapeId || !selectedArtboardId) return null
        const artboard = artboards.find(a => a.id === selectedArtboardId)
        if (!artboard) return null

        const findNodeRecursive = (nodes: typeof artboard.children): typeof artboard.children[0] | null => {
            for (const node of nodes) {
                if (node.id === selectedShapeId) return node
                if (node.children) {
                    const found = findNodeRecursive(node.children)
                    if (found) return found
                }
            }
            return null
        }
        return findNodeRecursive(artboard.children)
    }, [selectedShapeId, selectedArtboardId, artboards])

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

        // Create new artboard
        addArtboard(currentProject.id, newName, newX, artboardToDuplicate.y, artboardToDuplicate.width, artboardToDuplicate.height)

        // TODO: Ideally we should duplicate children too. 
        // For Phase 1, we just duplicate the frame.
    }, [currentProject, artboards, addArtboard])

    const handleAddNode = useCallback((artboardId: string, node: WireframeNode) => {
        if (!currentProject) return
        takeSnapshot() // Snapshot before adding
        addNode(currentProject.id, artboardId, node)
        setSelectedShapeId(node.id)
        setSelectedShapeIds([node.id])
        setSelectedArtboardId(artboardId)
        setSelectedTool('select')
    }, [currentProject, addNode, takeSnapshot])

    // Update single-selection-based helper
    const handleShapeSelect = useCallback((id: string | null) => {
        setSelectedShapeId(id)
        setSelectedShapeIds(id ? [id] : [])
    }, [])

    const handleUpdateNode = useCallback((artboardId: string, nodeId: string, updates: Partial<WireframeNode>) => {
        if (!currentProject) return
        updateNode(currentProject.id, artboardId, nodeId, updates)
    }, [currentProject, updateNode])

    const handleDeleteNode = useCallback((artboardId: string, nodeId: string) => {
        if (!currentProject) return
        takeSnapshot() // Snapshot before deleting
        // If deleting the single selected node
        if (selectedShapeId === nodeId) {
            setSelectedShapeId(null)
            setSelectedShapeIds([])
        }
        deleteNode(currentProject.id, artboardId, nodeId)
    }, [currentProject, deleteNode, takeSnapshot, selectedShapeId])

    const handleMultiSelect = useCallback((nodeIds: string[], artboardIds: string[]) => {
        setSelectedShapeIds(nodeIds)
        // Update primary selection to the first one or null
        setSelectedShapeId(nodeIds.length > 0 ? nodeIds[0] : null)

        setSelectedArtboardIds(artboardIds)
        if (artboardIds.length > 0) {
            setSelectedArtboardId(artboardIds[0])
        }
    }, [])

    const handleAlign = useCallback((type: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') => {
        if (!currentProject || !selectedArtboardId || selectedShapeIds.length < 1) return
        takeSnapshot()
        alignNodes(currentProject.id, selectedArtboardId, selectedShapeIds, type)
    }, [currentProject, selectedArtboardId, selectedShapeIds, alignNodes, takeSnapshot])

    const handleDistribute = useCallback((type: 'horizontal' | 'vertical') => {
        if (!currentProject || !selectedArtboardId || selectedShapeIds.length < 3) return
        takeSnapshot()
        distributeNodes(currentProject.id, selectedArtboardId, selectedShapeIds, type)
    }, [currentProject, selectedArtboardId, selectedShapeIds, distributeNodes, takeSnapshot])

    const selectedLayout = useMemo(() => {
        if (selectedShapeId && selectedNode) {
            return (selectedNode.type === 'group' || selectedNode.type === 'frame') ? selectedNode.layout : undefined
        } else if (selectedArtboardId) {
            const artboard = artboards.find(a => a.id === selectedArtboardId)
            return artboard?.layout
        }
        return undefined
    }, [selectedNode, selectedShapeId, selectedArtboardId, artboards])

    const handleUpdateLayout = useCallback((layout: LayoutConfig) => {
        if (!currentProject) return
        takeSnapshot()
        if (selectedShapeId && selectedArtboardId) {
            updateLayout(currentProject.id, selectedArtboardId, selectedShapeId, layout)
        } else if (selectedArtboardId && !selectedShapeId) {
            updateLayout(currentProject.id, selectedArtboardId, null, layout)
        }
    }, [currentProject, selectedShapeId, selectedArtboardId, updateLayout, takeSnapshot])

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return

            // Delete shape or artboard
            // Delete shape or artboard
            if (e.key === 'Delete' || e.key === 'Backspace') {
                if (selectedShapeIds.length > 0) {
                    // Delete all selected shapes
                    takeSnapshot()
                    selectedShapeIds.forEach(id => {
                        // Find owner artboard
                        const owner = artboards.find(a => a.children.some(c => c.id === id))
                        if (owner) handleDeleteNode(owner.id, id)
                    })
                    setSelectedShapeIds([])
                    setSelectedShapeId(null)
                } else if (selectedArtboardIds.length > 0 && currentProject) {
                    // Delete selected artboards
                    takeSnapshot()
                    selectedArtboardIds.forEach(id => {
                        deleteArtboard(currentProject.id, id)
                    })
                    setSelectedArtboardId(null)
                    setSelectedArtboardIds([])
                } else if (selectedArtboardId && currentProject) {
                    // Backup for single selection if somehow ids array is empty
                    takeSnapshot()
                    deleteArtboard(currentProject.id, selectedArtboardId)
                    setSelectedArtboardId(null)
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
                    takeSnapshot()
                    handleDuplicateArtboard(selectedArtboardId)
                }
            }

            // Cmd+Z / Ctrl+Z for Undo
            if ((e.metaKey || e.ctrlKey) && e.key === 'z' && !e.shiftKey) {
                e.preventDefault()
                undo()
            }

            // Cmd+Shift+Z / Ctrl+Shift+Z for Redo
            if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'z') {
                e.preventDefault()
                redo()
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
    }, [selectedShapeId, selectedArtboardId, handleDeleteNode, handleDuplicateArtboard, artboards, spacePressed])

    if (!currentProject) {
        return (
            <div className="h-full flex items-center justify-center">
                <p className="text-[#a1a1aa]">Please select a project first</p>
            </div>
        )
    }

    return (
        <div className="h-full flex overflow-hidden">
            {/* Left Sidebar - Layers */}
            <div className={`bg-[#1a1a1a] border-r border-[#333] flex flex-col transition-all duration-200 flex-shrink-0 z-10 ${leftPanelOpen ? 'w-[240px]' : 'w-10'}`}>
                {leftPanelOpen ? (
                    <div className="flex flex-col h-full">
                        <div className="flex items-center justify-between px-3 py-2 border-b border-[#333]">
                            <span className="text-xs font-semibold text-[#888]">Layers</span>
                            <button onClick={() => setLeftPanelOpen(false)} className="text-[#666] hover:text-white">
                                <PanelLeftClose size={14} />
                            </button>
                        </div>
                        <div className="flex-1 overflow-auto p-2">
                            <LayersPanel
                                artboards={artboards}
                                selectedArtboardId={selectedArtboardId}
                                selectedShapeId={selectedShapeId}
                                onSelectArtboard={setSelectedArtboardId}
                                onSelectShape={(artboardId, nodeId) => {
                                    setSelectedArtboardId(artboardId)
                                    setSelectedShapeId(nodeId)
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
                                onMoveNode={(artboardId, nodeId, targetParentId, index) => {
                                    if (!currentProject) return
                                    moveNode(currentProject.id, artboardId, nodeId, targetParentId, index)
                                }}
                            />
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center py-4">
                        <button onClick={() => setLeftPanelOpen(true)} className="text-[#666] hover:text-white">
                            <PanelLeftOpen size={16} />
                        </button>
                    </div>
                )}
            </div>

            <div className="flex-1 min-w-0 flex flex-col relative">
                {/* Top Bar with Mode Toggle */}
                <TopBar
                    showGrid={showGrid}
                    onToggleGrid={() => setShowGrid(!showGrid)}
                    zoom={stageScale}
                    onZoomIn={() => setStageScale(Math.min(5, stageScale * 1.2))}
                    onZoomOut={() => setStageScale(Math.max(0.1, stageScale / 1.2))}
                    artboardName={selectedArtboardId ? artboards.find(a => a.id === selectedArtboardId)?.name : undefined}
                    canExport={artboards.length > 0}
                    onExportArtboard={() => {
                        const stage = canvasRef.current?.getStage()
                        if (!stage) return
                        const artboard = selectedArtboardId
                            ? artboards.find(a => a.id === selectedArtboardId)
                            : artboards[0]
                        if (artboard) {
                            exportArtboardToPNG(stage, artboard)
                        }
                    }}
                    onExportAllArtboards={() => {
                        const stage = canvasRef.current?.getStage()
                        if (!stage) return
                        exportAllArtboardsToPNG(stage, artboards)
                    }}
                    canUndo={canUndo}
                    canRedo={canRedo}
                    onUndo={undo}
                    onRedo={redo}
                />

                {/* Floating Buttons */}
                <div className="absolute top-16 left-4 z-10 flex gap-2">
                    {/* New Artboard Button */}
                    <button
                        onClick={() => setShowNewArtboardPopup(true)}
                        className="bg-[#252525] hover:bg-[#333] text-white px-3 py-2 rounded-lg text-sm shadow-xl border border-[#333]"
                    >
                        + New Artboard
                    </button>
                </div>

                <WireframeCanvas
                    ref={canvasRef}
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

                    onShapeSelect={handleShapeSelect}
                    onArtboardSelect={setSelectedArtboardId}
                    onMultiSelect={handleMultiSelect}
                    onAddNode={handleAddNode}
                    onUpdateNode={handleUpdateNode}
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
                    onMoveNode={(artboardId, nodeId, targetParentId, index, updates) => {
                        if (!currentProject) return
                        moveNode(currentProject.id, artboardId, nodeId, targetParentId, index, updates)
                    }}
                    onResizeArtboard={(artboardId: string, width: number, height: number, newX?: number, newY?: number) => {
                        if (!currentProject) return
                        const updates: { width: number, height: number, x?: number, y?: number } = { width, height }
                        if (newX !== undefined) updates.x = newX
                        if (newY !== undefined) updates.y = newY
                        updateArtboard(currentProject.id, artboardId, updates)
                    }}
                    onDropComponent={handleDropComponent}
                    onGroup={(artboardId, nodeIds) => {
                        if (!currentProject) return
                        takeSnapshot()
                        groupNodes(currentProject.id, artboardId, nodeIds)
                    }}
                    onUngroup={(artboardId, groupId) => {
                        if (!currentProject) return
                        takeSnapshot()
                        ungroupNodes(currentProject.id, artboardId, groupId)
                    }}
                    showGrid={showGrid}
                    gridSize={gridSize}
                    borderRadius={borderRadius}
                    fontSize={fontSize}
                />

                {/* Floating Toolbar at Bottom */}
                <FloatingToolbar
                    selectedTool={spacePressed ? 'hand' : selectedTool}
                    onSelectTool={(t) => setSelectedTool(t)}
                />
            </div>

            {/* Right Sidebar - Design (Properties) */}
            <div className={`bg-[#1a1a1a] border-l border-[#333] flex flex-col transition-all duration-200 flex-shrink-0 z-10 ${rightPanelOpen ? 'w-[280px]' : 'w-10'}`}>
                {rightPanelOpen ? (
                    <div className="flex flex-col h-full">
                        <div className="flex items-center justify-between px-3 py-2 border-b border-[#333]">
                            <span className="text-xs font-semibold text-[#888]">Design</span>
                            <button
                                onClick={() => setRightPanelOpen(false)}
                                className="text-[#666] hover:text-white"
                            >
                                <PanelRightClose size={14} />
                            </button>
                        </div>
                        <div className="flex-1 overflow-auto">
                            <VibePropertiesPanel
                                selectedNode={selectedNode}
                                selectedArtboard={selectedArtboardId ? artboards.find(a => a.id === selectedArtboardId) : null}
                                fillColor={fillColor}
                                onFillColorChange={(c) => {
                                    setFillColor(c)
                                    if (selectedShapeId && selectedArtboardId) handleUpdateNode(selectedArtboardId, selectedShapeId, { fill: c })
                                }}
                                strokeColor={strokeColor}
                                onStrokeColorChange={(c) => {
                                    setStrokeColor(c)
                                    if (selectedShapeId && selectedArtboardId) handleUpdateNode(selectedArtboardId, selectedShapeId, { stroke: c })
                                }}
                                strokeWidth={strokeWidth}
                                onStrokeWidthChange={(w) => {
                                    _setStrokeWidth(w)
                                    if (selectedShapeId && selectedArtboardId) handleUpdateNode(selectedArtboardId, selectedShapeId, { strokeWidth: w })
                                }}
                                opacity={opacity}
                                onOpacityChange={(o) => {
                                    _setOpacity(o)
                                    if (selectedShapeId && selectedArtboardId) handleUpdateNode(selectedArtboardId, selectedShapeId, { opacity: o })
                                }}
                                borderRadius={borderRadius}
                                onBorderRadiusChange={(r) => {
                                    setBorderRadius(r)
                                    if (selectedShapeId && selectedArtboardId) handleUpdateNode(selectedArtboardId, selectedShapeId, { borderRadius: r })
                                }}
                                fontSize={fontSize}
                                onFontSizeChange={(s) => {
                                    setFontSize(s)
                                    if (selectedShapeId && selectedArtboardId) handleUpdateNode(selectedArtboardId, selectedShapeId, { fontSize: s })
                                }}
                                layout={selectedLayout}
                                onUpdateLayout={handleUpdateLayout}
                                onAlign={handleAlign}
                                onDistribute={handleDistribute}
                            />
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center py-4">
                        <button onClick={() => setRightPanelOpen(true)} className="text-[#666] hover:text-white"><PanelRightOpen size={16} /></button>
                    </div>
                )}
            </div>

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

            {/* Automation & Diagnostics */}
            <DebugPanel />
        </div>
    )
}
