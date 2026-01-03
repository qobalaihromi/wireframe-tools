import { useRef, useCallback, useEffect } from 'react'
import { Stage, Layer, Rect, Circle, Text, Group, Line, Arrow, Transformer } from 'react-konva'
import type { KonvaEventObject } from 'konva/lib/Node'
import type Konva from 'konva'
import type { Shape, ShapeType, Artboard } from '../../stores/wireframeStore'

interface WireframeCanvasProps {
    artboard: Artboard
    selectedShapeId: string | null
    selectedTool: ShapeType | 'select'
    fillColor: string
    strokeColor: string
    strokeWidth: number
    opacity: number
    onShapeSelect: (shapeId: string | null) => void
    onAddShape: (shape: Shape) => void
    onUpdateShape: (shapeId: string, updates: Partial<Shape>) => void
    onDeleteShape: (shapeId: string) => void
}

export function WireframeCanvas({
    artboard,
    selectedShapeId,
    selectedTool,
    fillColor,
    strokeColor,
    strokeWidth,
    opacity,
    onShapeSelect,
    onAddShape,
    onUpdateShape,
}: WireframeCanvasProps) {
    const stageRef = useRef<Konva.Stage>(null)
    const transformerRef = useRef<Konva.Transformer>(null)
    const shapeRefs = useRef<Map<string, Konva.Node>>(new Map())

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

    const setShapeRef = useCallback((id: string, node: Konva.Node | null) => {
        if (node) {
            shapeRefs.current.set(id, node)
        } else {
            shapeRefs.current.delete(id)
        }
    }, [])

    const handleStageClick = useCallback((e: KonvaEventObject<MouseEvent>) => {
        const clickedOnEmpty = e.target === e.target.getStage() || e.target.name() === 'background'

        if (clickedOnEmpty) {
            if (selectedTool === 'select') {
                onShapeSelect(null)
            } else {
                const stage = stageRef.current
                if (!stage) return

                const pos = stage.getPointerPosition()
                if (!pos) return

                const newShape: Shape = {
                    id: `shape_${Date.now()}`,
                    type: selectedTool,
                    x: pos.x - 50,
                    y: pos.y - 25,
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
                onAddShape(newShape)
            }
        }
    }, [selectedTool, fillColor, strokeColor, strokeWidth, opacity, onShapeSelect, onAddShape])

    const handleShapeClick = useCallback((e: KonvaEventObject<MouseEvent>, shapeId: string) => {
        e.cancelBubble = true
        onShapeSelect(shapeId)
    }, [onShapeSelect])

    const handleDragEnd = useCallback((shapeId: string, e: KonvaEventObject<DragEvent>) => {
        onUpdateShape(shapeId, {
            x: e.target.x(),
            y: e.target.y(),
        })
    }, [onUpdateShape])

    const handleTransformEnd = useCallback((shapeId: string, e: KonvaEventObject<Event>) => {
        const node = e.target
        const scaleX = node.scaleX()
        const scaleY = node.scaleY()

        // Reset scale and apply to width/height
        node.scaleX(1)
        node.scaleY(1)

        onUpdateShape(shapeId, {
            x: node.x(),
            y: node.y(),
            width: Math.max(20, node.width() * scaleX),
            height: Math.max(20, node.height() * scaleY),
            rotation: node.rotation(),
        })
    }, [onUpdateShape])

    const renderShape = (shape: Shape) => {
        const isSelected = selectedShapeId === shape.id
        const commonProps = {
            x: shape.x,
            y: shape.y,
            rotation: shape.rotation || 0,
            opacity: shape.opacity ?? 1,
            draggable: true,
            onClick: (e: KonvaEventObject<MouseEvent>) => handleShapeClick(e, shape.id),
            onDragEnd: (e: KonvaEventObject<DragEvent>) => handleDragEnd(shape.id, e),
            onTransformEnd: (e: KonvaEventObject<Event>) => handleTransformEnd(shape.id, e),
        }

        switch (shape.type) {
            case 'rect':
                return (
                    <Rect
                        key={shape.id}
                        ref={(node) => setShapeRef(shape.id, node)}
                        {...commonProps}
                        width={shape.width}
                        height={shape.height}
                        fill={shape.fill}
                        stroke={isSelected ? '#6366f1' : shape.stroke}
                        strokeWidth={isSelected ? 3 : shape.strokeWidth}
                        cornerRadius={shape.borderRadius || 4}
                    />
                )

            case 'circle':
                return (
                    <Circle
                        key={shape.id}
                        ref={(node) => setShapeRef(shape.id, node)}
                        {...commonProps}
                        radius={shape.width / 2}
                        fill={shape.fill}
                        stroke={isSelected ? '#6366f1' : shape.stroke}
                        strokeWidth={isSelected ? 3 : shape.strokeWidth}
                    />
                )

            case 'text':
                return (
                    <Text
                        key={shape.id}
                        ref={(node) => setShapeRef(shape.id, node)}
                        {...commonProps}
                        text={shape.text || 'Text'}
                        fontSize={shape.fontSize || 16}
                        fill={shape.fill}
                        width={shape.width}
                    />
                )

            case 'line':
                return (
                    <Line
                        key={shape.id}
                        ref={(node) => setShapeRef(shape.id, node)}
                        {...commonProps}
                        points={shape.points || [0, 0, 100, 0]}
                        stroke={isSelected ? '#6366f1' : shape.stroke}
                        strokeWidth={isSelected ? 3 : shape.strokeWidth}
                        lineCap="round"
                        lineJoin="round"
                    />
                )

            case 'arrow':
                return (
                    <Arrow
                        key={shape.id}
                        ref={(node) => setShapeRef(shape.id, node)}
                        {...commonProps}
                        points={shape.points || [0, 0, 100, 0]}
                        stroke={isSelected ? '#6366f1' : shape.stroke}
                        strokeWidth={isSelected ? 3 : shape.strokeWidth}
                        fill={shape.stroke}
                        pointerLength={10}
                        pointerWidth={10}
                    />
                )

            case 'button':
                return (
                    <Group
                        key={shape.id}
                        ref={(node) => setShapeRef(shape.id, node)}
                        {...commonProps}
                    >
                        <Rect
                            width={shape.width}
                            height={shape.height}
                            fill={shape.fill}
                            stroke={isSelected ? '#6366f1' : shape.stroke}
                            strokeWidth={isSelected ? 3 : shape.strokeWidth}
                            cornerRadius={6}
                        />
                        <Text
                            text={shape.text || 'Button'}
                            width={shape.width}
                            height={shape.height}
                            align="center"
                            verticalAlign="middle"
                            fontSize={14}
                            fill="#ffffff"
                        />
                    </Group>
                )

            case 'input':
                return (
                    <Group
                        key={shape.id}
                        ref={(node) => setShapeRef(shape.id, node)}
                        {...commonProps}
                    >
                        <Rect
                            width={shape.width}
                            height={shape.height}
                            fill="#252525"
                            stroke={isSelected ? '#6366f1' : '#3a3a3a'}
                            strokeWidth={isSelected ? 3 : 1}
                            cornerRadius={4}
                        />
                        <Text
                            text="Input field..."
                            x={10}
                            y={(shape.height - 14) / 2}
                            fontSize={14}
                            fill="#6a6a6a"
                        />
                    </Group>
                )

            case 'card':
                return (
                    <Group
                        key={shape.id}
                        ref={(node) => setShapeRef(shape.id, node)}
                        {...commonProps}
                    >
                        <Rect
                            width={shape.width}
                            height={shape.height}
                            fill="#1a1a1a"
                            stroke={isSelected ? '#6366f1' : '#2a2a2a'}
                            strokeWidth={isSelected ? 3 : 1}
                            cornerRadius={8}
                        />
                        <Rect
                            x={10}
                            y={10}
                            width={shape.width - 20}
                            height={40}
                            fill="#252525"
                            cornerRadius={4}
                        />
                        <Text
                            text="Card Title"
                            x={10}
                            y={60}
                            fontSize={14}
                            fontStyle="bold"
                            fill="#ffffff"
                        />
                        <Text
                            text="Card content..."
                            x={10}
                            y={80}
                            fontSize={12}
                            fill="#a1a1aa"
                        />
                    </Group>
                )

            default:
                return null
        }
    }

    return (
        <div className="flex-1 overflow-auto bg-[#0a0a0a] flex items-center justify-center p-8">
            <div
                className="bg-[#1a1a1a] rounded-lg shadow-2xl"
                style={{ width: artboard.width, height: artboard.height }}
            >
                <Stage
                    ref={stageRef}
                    width={artboard.width}
                    height={artboard.height}
                    onClick={handleStageClick}
                    style={{ borderRadius: '8px', cursor: selectedTool !== 'select' ? 'crosshair' : 'default' }}
                >
                    <Layer>
                        {/* Background */}
                        <Rect
                            name="background"
                            width={artboard.width}
                            height={artboard.height}
                            fill="#1a1a1a"
                            cornerRadius={8}
                        />

                        {/* Shapes */}
                        {artboard.shapes.map(renderShape)}

                        {/* Transformer for resize */}
                        <Transformer
                            ref={transformerRef}
                            boundBoxFunc={(oldBox, newBox) => {
                                // Limit minimum size
                                if (newBox.width < 20 || newBox.height < 20) {
                                    return oldBox
                                }
                                return newBox
                            }}
                            anchorFill="#6366f1"
                            anchorStroke="#4f46e5"
                            anchorSize={8}
                            borderStroke="#6366f1"
                            borderStrokeWidth={2}
                            rotateEnabled={true}
                            enabledAnchors={['top-left', 'top-right', 'bottom-left', 'bottom-right', 'middle-left', 'middle-right', 'top-center', 'bottom-center']}
                        />
                    </Layer>
                </Stage>
            </div>
        </div>
    )
}
