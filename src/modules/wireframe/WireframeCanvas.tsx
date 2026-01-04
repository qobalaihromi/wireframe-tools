import { useRef, useCallback, useEffect, useState } from 'react'
import { Stage, Layer, Transformer, Rect } from 'react-konva'
import type { KonvaEventObject } from 'konva/lib/Node'
import type Konva from 'konva'
import type { Shape, ShapeType, Artboard } from '../../stores/wireframeStore'
import { ArtboardFrame } from './components/ArtboardFrame'
import { GridOverlay } from './components/GridOverlay'

interface WireframeCanvasProps {
    artboards: Artboard[]
    stageScale: number
    stagePosition: { x: number, y: number }
    onStageChange: (scale: number, pos: { x: number, y: number }) => void

    selectedShapeId: string | null
    selectedArtboardId: string | null
    selectedTool: ShapeType | 'select' | 'hand' | 'frame'
    fillColor: string
    strokeColor: string
    strokeWidth: number
    opacity: number
    showGrid: boolean
    gridSize: number

    onShapeSelect: (shapeId: string | null) => void
    onArtboardSelect: (artboardId: string | null) => void
    onAddShape: (artboardId: string, shape: Shape) => void
    onUpdateShape: (artboardId: string, shapeId: string, updates: Partial<Shape>) => void
    onAddArtboard: (x: number, y: number, width: number, height: number) => void
    onRenameArtboard?: (artboardId: string, newName: string) => void
    onMoveArtboard?: (artboardId: string, x: number, y: number) => void
    onResizeArtboard?: (artboardId: string, width: number, height: number, newX?: number, newY?: number) => void
    onContextMenuArtboard?: (artboardId: string, artboardName: string, x: number, y: number) => void
}

export function WireframeCanvas({
    artboards,
    stageScale,
    stagePosition,
    onStageChange,
    selectedShapeId,
    selectedArtboardId,
    selectedTool,
    fillColor,
    strokeColor,
    strokeWidth,
    opacity,
    showGrid,
    gridSize,
    onShapeSelect,
    onArtboardSelect,
    onAddShape,
    onUpdateShape,
    onAddArtboard,
    onRenameArtboard,
    onMoveArtboard,
    onResizeArtboard,
    onContextMenuArtboard,
}: WireframeCanvasProps) {
    const stageRef = useRef<Konva.Stage>(null)
    const containerRef = useRef<HTMLDivElement>(null)
    const transformerRef = useRef<Konva.Transformer>(null)
    const shapeRefs = useRef<Map<string, Konva.Node>>(new Map())

    // Container dimensions for Stage
    const [stageSize, setStageSize] = useState({ width: 800, height: 600 })

    // Frame drawing state
    const [isDrawingFrame, setIsDrawingFrame] = useState(false)
    const [frameStart, setFrameStart] = useState<{ x: number, y: number } | null>(null)
    const [framePreview, setFramePreview] = useState<{ x: number, y: number, width: number, height: number } | null>(null)

    // Track container size
    useEffect(() => {
        const updateSize = () => {
            if (containerRef.current) {
                setStageSize({
                    width: containerRef.current.offsetWidth,
                    height: containerRef.current.offsetHeight,
                })
            }
        }
        updateSize()
        window.addEventListener('resize', updateSize)
        return () => window.removeEventListener('resize', updateSize)
    }, [])

    // Update transformer when selection changes
    useEffect(() => {
        if (!transformerRef.current) return

        if (selectedShapeId) {
            const selectedNode = shapeRefs.current.get(selectedShapeId)
            if (selectedNode) {
                transformerRef.current.nodes([selectedNode])
                transformerRef.current.getLayer()?.batchDraw()
            }
        } else {
            transformerRef.current.nodes([])
            transformerRef.current.getLayer()?.batchDraw()
        }
    }, [selectedShapeId])

    const bindShapeRef = useCallback((id: string, node: Konva.Node | null) => {
        if (node) {
            shapeRefs.current.set(id, node)
        } else {
            shapeRefs.current.delete(id)
        }
    }, [])

    const handleWheel = (e: KonvaEventObject<WheelEvent>) => {
        e.evt.preventDefault()

        const stage = stageRef.current
        if (!stage) return

        // Pinch zoom on trackpad triggers ctrlKey, also handle metaKey for Mac
        const isPinchZoom = e.evt.ctrlKey || e.evt.metaKey

        if (isPinchZoom) {
            // ZOOM - pinch zoom or Ctrl+scroll (Figma-style)
            const oldScale = stage.scaleX()
            const pointer = stage.getPointerPosition()
            if (!pointer) return

            const mousePointTo = {
                x: (pointer.x - stage.x()) / oldScale,
                y: (pointer.y - stage.y()) / oldScale,
            }

            // Use deltaY magnitude for proportional zoom (like Figma)
            // Smaller delta = smaller zoom step, larger delta = larger zoom step
            const zoomIntensity = 0.015 // Base zoom intensity (higher = faster)
            const delta = -e.evt.deltaY
            const zoomFactor = 1 + delta * zoomIntensity

            // Calculate new scale with smooth factor
            let newScale = oldScale * zoomFactor

            // Clamp zoom limits (10% to 500%)
            newScale = Math.max(0.1, Math.min(5, newScale))

            // Skip if scale didn't change
            if (newScale === oldScale) return

            const newPos = {
                x: pointer.x - mousePointTo.x * newScale,
                y: pointer.y - mousePointTo.y * newScale,
            }

            onStageChange(newScale, newPos)
        } else {
            // PAN - regular scroll/swipe (faster panning)
            const panSpeed = 1.2 // Slightly faster panning
            const newPos = {
                x: stagePosition.x - e.evt.deltaX * panSpeed,
                y: stagePosition.y - e.evt.deltaY * panSpeed,
            }
            onStageChange(stageScale, newPos)
        }
    }

    const handleDragEnd = (e: KonvaEventObject<DragEvent>) => {
        // Only update if it's the stage dragging (not shapes)
        if (e.target === e.target.getStage()) {
            onStageChange(stageScale, {
                x: e.target.x(),
                y: e.target.y(),
            })
        }
    }

    const handleStageClick = (e: KonvaEventObject<MouseEvent>) => {
        const clickedOnEmpty = e.target === e.target.getStage()
        if (clickedOnEmpty && selectedTool === 'select') {
            onShapeSelect(null)
        }
    }

    // Pass this to ArtboardFrame to handle adding shapes
    const handleArtboardClick = (artboardId: string, relativePointerPos: { x: number, y: number }) => {
        if (selectedTool === 'select' || selectedTool === 'hand' || selectedTool === 'frame') return

        const shapeType = selectedTool as ShapeType
        const newShape: Shape = {
            id: `shape_${Date.now()}`,
            type: shapeType,
            x: relativePointerPos.x - 50, // Center on click
            y: relativePointerPos.y - 25,
            width: selectedTool === 'circle' ? 80 : selectedTool === 'card' ? 200 : selectedTool === 'line' || selectedTool === 'arrow' ? 100 : 100,
            height: selectedTool === 'circle' ? 80 : selectedTool === 'card' ? 120 : 50,
            fill: fillColor,
            stroke: strokeColor,
            strokeWidth: strokeWidth,
            opacity: opacity,
            rotation: 0,
            text: selectedTool === 'text' ? 'Text' : selectedTool === 'button' ? 'Button' : undefined,
            fontSize: 16,
            points: selectedTool === 'line' || selectedTool === 'arrow' ? [0, 0, 100, 0] : undefined,
        }

        onAddShape(artboardId, newShape)
    }

    // Frame drawing handlers
    const handleMouseDown = () => {
        if (selectedTool !== 'frame') return

        const stage = stageRef.current
        if (!stage) return

        const pos = stage.getPointerPosition()
        if (!pos) return

        // Convert to canvas coordinates (accounting for scale and position)
        const x = (pos.x - stagePosition.x) / stageScale
        const y = (pos.y - stagePosition.y) / stageScale

        setIsDrawingFrame(true)
        setFrameStart({ x, y })
        setFramePreview({ x, y, width: 0, height: 0 })
    }

    const handleMouseMove = () => {
        if (!isDrawingFrame || !frameStart) return

        const stage = stageRef.current
        if (!stage) return

        const pos = stage.getPointerPosition()
        if (!pos) return

        const x = (pos.x - stagePosition.x) / stageScale
        const y = (pos.y - stagePosition.y) / stageScale

        setFramePreview({
            x: Math.min(frameStart.x, x),
            y: Math.min(frameStart.y, y),
            width: Math.abs(x - frameStart.x),
            height: Math.abs(y - frameStart.y),
        })
    }

    const handleMouseUp = () => {
        if (!isDrawingFrame || !framePreview) return

        // Only create if size is reasonable (> 50px)
        if (framePreview.width > 50 && framePreview.height > 50) {
            onAddArtboard(framePreview.x, framePreview.y, framePreview.width, framePreview.height)
        }

        setIsDrawingFrame(false)
        setFrameStart(null)
        setFramePreview(null)
    }

    return (
        <div ref={containerRef} className="flex-1 overflow-hidden bg-[#0a0a0a] relative">
            <Stage
                ref={stageRef}
                width={stageSize.width}
                height={stageSize.height}
                onWheel={handleWheel}
                draggable={selectedTool === 'hand' || isSpacePressed()}
                onDragEnd={handleDragEnd}
                onClick={handleStageClick}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                scale={{ x: stageScale, y: stageScale }}
                x={stagePosition.x}
                y={stagePosition.y}
                style={{ cursor: selectedTool === 'frame' ? 'crosshair' : selectedTool === 'hand' ? 'grab' : selectedTool !== 'select' ? 'crosshair' : 'default' }}
            >
                <Layer>
                    {/* Grid Overlay */}
                    <GridOverlay
                        visible={showGrid}
                        cellSize={gridSize}
                        width={stageSize.width / stageScale}
                        height={stageSize.height / stageScale}
                        offsetX={stagePosition.x / stageScale}
                        offsetY={stagePosition.y / stageScale}
                    />

                    {artboards.map(artboard => (
                        <ArtboardFrame
                            key={artboard.id}
                            artboard={artboard}
                            isSelected={selectedArtboardId === artboard.id}
                            selectedShapeId={selectedShapeId}
                            onShapeSelect={onShapeSelect}
                            onShapeUpdate={(shapeId, updates) => onUpdateShape(artboard.id, shapeId, updates)}
                            bindShapeRef={bindShapeRef}
                            onClick={(pos) => handleArtboardClick(artboard.id, pos)}
                            onRename={onRenameArtboard}
                            onSelect={onArtboardSelect}
                            onContextMenu={(x: number, y: number) => onContextMenuArtboard?.(artboard.id, artboard.name, x, y)}
                            onMove={(id, x, y) => onMoveArtboard?.(id, x, y)}
                            onResize={(id, w, h, x, y) => onResizeArtboard?.(id, w, h, x, y)}
                        />
                    ))}

                    {/* Frame Preview while drawing */}
                    {framePreview && (
                        <Rect
                            x={framePreview.x}
                            y={framePreview.y}
                            width={framePreview.width}
                            height={framePreview.height}
                            fill="rgba(99, 102, 241, 0.1)"
                            stroke="#6366f1"
                            strokeWidth={2}
                            dash={[10, 5]}
                        />
                    )}

                    <Transformer
                        ref={transformerRef}
                        boundBoxFunc={(oldBox, newBox) => {
                            if (newBox.width < 5 || newBox.height < 5) return oldBox
                            return newBox
                        }}
                        anchorFill="#6366f1"
                        anchorStroke="#4f46e5"
                        anchorSize={8}
                        borderStroke="#6366f1"
                        rotateEnabled={true}
                    />
                </Layer>
            </Stage>

            {/* Quick Helper for "Empty Project" */}
            {artboards.length === 0 && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[#52525b] text-center pointer-events-none select-none">
                    <p className="mb-2">Infinite Canvas Ready</p>
                    <p className="text-sm">Press 'F' to draw a frame</p>
                </div>
            )}
        </div>
    )
}

function isSpacePressed() {
    // Basic check - in real app, might want to pass this as prop or use hook
    return false
}
