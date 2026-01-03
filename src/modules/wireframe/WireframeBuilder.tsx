import { useState, useEffect, useCallback } from 'react'
import { useProjectStore } from '../../stores/projectStore'
import { useWireframeStore, type ShapeType, type Shape } from '../../stores/wireframeStore'
import { ShapePalette } from './ShapePalette'
import { WireframeCanvas } from './WireframeCanvas'
import { WireframeToolbar } from './WireframeToolbar'

export function WireframeBuilder() {
    const currentProject = useProjectStore((state) => state.getCurrentProject())
    const { getArtboards, addArtboard, deleteArtboard, addShape, updateShape, deleteShape } = useWireframeStore()

    const [currentArtboardId, setCurrentArtboardId] = useState<string | null>(null)
    const [selectedTool, setSelectedTool] = useState<ShapeType | 'select'>('select')
    const [selectedShapeId, setSelectedShapeId] = useState<string | null>(null)
    const [fillColor, setFillColor] = useState('#6366f1')
    const [strokeColor, setStrokeColor] = useState('#4f46e5')
    const [strokeWidth, setStrokeWidth] = useState(2)
    const [opacity, setOpacity] = useState(1)

    const artboards = currentProject ? getArtboards(currentProject.id) : []
    const currentArtboard = artboards.find(a => a.id === currentArtboardId)

    // Initialize first artboard
    useEffect(() => {
        if (currentProject && artboards.length === 0) {
            const id = addArtboard(currentProject.id, 'Screen 1')
            setCurrentArtboardId(id)
        } else if (artboards.length > 0 && !currentArtboardId) {
            setCurrentArtboardId(artboards[0].id)
        }
    }, [currentProject?.id, artboards.length])

    const handleAddArtboard = useCallback(() => {
        if (!currentProject) return
        const id = addArtboard(currentProject.id, `Screen ${artboards.length + 1}`)
        setCurrentArtboardId(id)
    }, [currentProject, artboards.length, addArtboard])

    const handleDeleteArtboard = useCallback((artboardId: string) => {
        if (!currentProject) return
        deleteArtboard(currentProject.id, artboardId)

        // Select another artboard
        const remaining = artboards.filter(a => a.id !== artboardId)
        if (remaining.length > 0) {
            setCurrentArtboardId(remaining[0].id)
        } else {
            setCurrentArtboardId(null)
        }
    }, [currentProject, artboards, deleteArtboard])

    const handleAddShape = useCallback((shape: Shape) => {
        if (!currentProject || !currentArtboardId) return
        addShape(currentProject.id, currentArtboardId, shape)
        setSelectedShapeId(shape.id)
        setSelectedTool('select')
    }, [currentProject, currentArtboardId, addShape])

    const handleUpdateShape = useCallback((shapeId: string, updates: Partial<Shape>) => {
        if (!currentProject || !currentArtboardId) return
        updateShape(currentProject.id, currentArtboardId, shapeId, updates)
    }, [currentProject, currentArtboardId, updateShape])

    const handleDeleteShape = useCallback((shapeId: string) => {
        if (!currentProject || !currentArtboardId) return
        deleteShape(currentProject.id, currentArtboardId, shapeId)
        setSelectedShapeId(null)
    }, [currentProject, currentArtboardId, deleteShape])

    const handleExportPNG = useCallback(async () => {
        const stage = document.querySelector('.konvajs-content canvas') as HTMLCanvasElement
        if (!stage) return

        const dataUrl = stage.toDataURL()
        const a = document.createElement('a')
        a.href = dataUrl
        a.download = `${currentArtboard?.name || 'wireframe'}.png`
        a.click()
    }, [currentArtboard])

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Delete' || e.key === 'Backspace') {
                if (selectedShapeId && document.activeElement?.tagName !== 'INPUT') {
                    handleDeleteShape(selectedShapeId)
                }
            }
            if (e.key === 'Escape') {
                setSelectedShapeId(null)
                setSelectedTool('select')
            }
            // Tool shortcuts
            if (document.activeElement?.tagName !== 'INPUT') {
                if (e.key === 'v' || e.key === 'V') setSelectedTool('select')
                if (e.key === 'r' || e.key === 'R') setSelectedTool('rect')
                if (e.key === 'o' || e.key === 'O') setSelectedTool('circle')
                if (e.key === 't' || e.key === 'T') setSelectedTool('text')
                if (e.key === 'l' || e.key === 'L') setSelectedTool('line')
                if (e.key === 'a' || e.key === 'A') setSelectedTool('arrow')
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [selectedShapeId, handleDeleteShape])

    if (!currentProject) {
        return (
            <div className="h-full flex items-center justify-center">
                <p className="text-[#a1a1aa]">Please select a project first</p>
            </div>
        )
    }

    return (
        <div className="h-full flex">
            <ShapePalette
                selectedTool={selectedTool}
                onSelectTool={setSelectedTool}
                fillColor={fillColor}
                strokeColor={strokeColor}
                strokeWidth={strokeWidth}
                opacity={opacity}
                onFillColorChange={setFillColor}
                onStrokeColorChange={setStrokeColor}
                onStrokeWidthChange={setStrokeWidth}
                onOpacityChange={setOpacity}
            />

            <div className="flex-1 flex flex-col">
                <WireframeToolbar
                    artboards={artboards}
                    currentArtboardId={currentArtboardId}
                    onSelectArtboard={setCurrentArtboardId}
                    onAddArtboard={handleAddArtboard}
                    onDeleteArtboard={handleDeleteArtboard}
                    onExportPNG={handleExportPNG}
                />

                {currentArtboard ? (
                    <WireframeCanvas
                        artboard={currentArtboard}
                        selectedShapeId={selectedShapeId}
                        selectedTool={selectedTool}
                        fillColor={fillColor}
                        strokeColor={strokeColor}
                        strokeWidth={strokeWidth}
                        opacity={opacity}
                        onShapeSelect={setSelectedShapeId}
                        onAddShape={handleAddShape}
                        onUpdateShape={handleUpdateShape}
                        onDeleteShape={handleDeleteShape}
                    />
                ) : (
                    <div className="flex-1 flex items-center justify-center">
                        <button
                            onClick={handleAddArtboard}
                            className="flex items-center gap-2 bg-[#6366f1] hover:bg-[#4f46e5] text-white px-6 py-3 rounded-lg font-medium transition-colors"
                        >
                            Create First Artboard
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}
