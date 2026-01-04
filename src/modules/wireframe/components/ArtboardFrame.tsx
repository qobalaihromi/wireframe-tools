import React, { useState } from 'react'
import { Rect, Text, Group, Line, Arrow, Circle } from 'react-konva'
import type { KonvaEventObject } from 'konva/lib/Node'
import type { Artboard, Shape } from '../../../stores/wireframeStore'

interface ArtboardFrameProps {
    artboard: Artboard
    isSelected?: boolean
    selectedShapeId: string | null
    onShapeSelect: (shapeId: string | null) => void
    onShapeUpdate: (shapeId: string, updates: Partial<Shape>) => void
    bindShapeRef: (id: string, node: any) => void
    onClick: (pos: { x: number, y: number }) => void
    onRename?: (artboardId: string, newName: string) => void
    onSelect?: (artboardId: string) => void
    onContextMenu?: (x: number, y: number) => void
    onMove?: (artboardId: string, x: number, y: number) => void
    onResize?: (artboardId: string, width: number, height: number, newX?: number, newY?: number) => void
}

export const ArtboardFrame = React.memo(({
    artboard,
    isSelected,
    selectedShapeId,
    onShapeSelect,
    onShapeUpdate,
    bindShapeRef,
    onClick,
    onRename,
    onSelect,
    onContextMenu,
    onMove,
    onResize,
}: ArtboardFrameProps) => {

    // Resize state - store initial values when drag starts
    const [resizing, setResizing] = useState<{
        corner: string,
        startX: number,
        startY: number,
        startW: number,
        startH: number,
        startArtboardX: number,
        startArtboardY: number,
    } | null>(null)

    const handleResizeStart = (corner: string, e: KonvaEventObject<MouseEvent>) => {
        e.cancelBubble = true
        const stage = e.target.getStage()
        const pointer = stage?.getPointerPosition()
        if (pointer) {
            setResizing({
                corner,
                startX: pointer.x,
                startY: pointer.y,
                startW: artboard.width,
                startH: artboard.height,
                startArtboardX: artboard.x,
                startArtboardY: artboard.y,
            })
        }
    }

    // Real-time resize during drag
    const handleResizeMove = (e: KonvaEventObject<DragEvent>) => {
        e.cancelBubble = true
        const node = e.target
        const stage = node.getStage()
        const pointer = stage?.getPointerPosition()
        const corner = resizing?.corner
        if (!corner || !resizing || !pointer) return

        // Calculate delta from mouse movement, accounting for stage scale
        const scale = stage?.scaleX() || 1
        const dx = (pointer.x - resizing.startX) / scale
        const dy = (pointer.y - resizing.startY) / scale

        let newWidth = resizing.startW
        let newHeight = resizing.startH
        let newX = resizing.startArtboardX
        let newY = resizing.startArtboardY

        // Calculate new dimensions AND position based on which corner/edge was dragged
        // For east (right) edge: expand width to the right, position stays same
        if (corner.includes('e')) {
            newWidth = Math.max(100, resizing.startW + dx)
        }
        // For west (left) edge: expand width to the left, move artboard left
        if (corner.includes('w')) {
            const proposedWidth = resizing.startW - dx
            if (proposedWidth >= 100) {
                newWidth = proposedWidth
                newX = resizing.startArtboardX + dx  // Move left as we extend left
            } else {
                newWidth = 100
                newX = resizing.startArtboardX + (resizing.startW - 100)
            }
        }
        // For south (bottom) edge: expand height downward, position stays same
        if (corner.includes('s')) {
            newHeight = Math.max(100, resizing.startH + dy)
        }
        // For north (top) edge: expand height upward, move artboard up
        if (corner.includes('n')) {
            const proposedHeight = resizing.startH - dy
            if (proposedHeight >= 100) {
                newHeight = proposedHeight
                newY = resizing.startArtboardY + dy  // Move up as we extend up
            } else {
                newHeight = 100
                newY = resizing.startArtboardY + (resizing.startH - 100)
            }
        }

        // Reset handle position to stay at edge (prevents handle from moving away)
        node.position({ x: 0, y: 0 })

        // Update artboard dimensions AND position in real-time
        onResize?.(artboard.id, Math.round(newWidth), Math.round(newHeight), Math.round(newX), Math.round(newY))
    }

    const handleResizeEnd = (e: KonvaEventObject<DragEvent>) => {
        e.cancelBubble = true
        const node = e.target
        // Reset handle position
        node.position({ x: 0, y: 0 })
        setResizing(null)
    }

    const handleShapeClick = (e: KonvaEventObject<MouseEvent>, shapeId: string) => {
        e.cancelBubble = true
        onShapeSelect(shapeId)
    }

    const handleDragEnd = (shapeId: string, e: KonvaEventObject<DragEvent>) => {
        onShapeUpdate(shapeId, {
            x: e.target.x(),
            y: e.target.y(),
        })
    }

    const handleTransformEnd = (shapeId: string, e: KonvaEventObject<Event>) => {
        const node = e.target
        const scaleX = node.scaleX()
        const scaleY = node.scaleY()

        // Reset scale and apply to width/height
        node.scaleX(1)
        node.scaleY(1)

        onShapeUpdate(shapeId, {
            x: node.x(),
            y: node.y(),
            width: Math.max(20, node.width() * scaleX),
            height: Math.max(20, node.height() * scaleY),
            rotation: node.rotation(),
        })
    }

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
                        ref={(node) => bindShapeRef(shape.id, node)}
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
                        ref={(node) => bindShapeRef(shape.id, node)}
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
                        ref={(node) => bindShapeRef(shape.id, node)}
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
                        ref={(node) => bindShapeRef(shape.id, node)}
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
                        ref={(node) => bindShapeRef(shape.id, node)}
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
                        ref={(node) => bindShapeRef(shape.id, node)}
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
                        ref={(node) => bindShapeRef(shape.id, node)}
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
                        ref={(node) => bindShapeRef(shape.id, node)}
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
        <Group
            x={artboard.x}
            y={artboard.y}
            draggable
            onDragEnd={(e) => {
                onMove?.(artboard.id, e.target.x(), e.target.y())
            }}
        >
            {/* Artboard Label - Double-click to rename */}
            <Text
                text={artboard.name}
                y={-30}
                fontSize={14}
                fill="#666"
                fontStyle="bold"
                onDblClick={() => {
                    if (onRename) {
                        const newName = prompt('Rename Artboard:', artboard.name)
                        if (newName && newName.trim()) {
                            onRename(artboard.id, newName.trim())
                        }
                    }
                }}
                onClick={() => {
                    onSelect?.(artboard.id)
                }}
            />

            {/* Artboard Background */}
            <Rect
                width={artboard.width}
                height={artboard.height}
                fill="#ffffff"
                stroke={isSelected ? '#6366f1' : 'transparent'}
                strokeWidth={2}
                shadowColor="black"
                shadowBlur={20}
                shadowOpacity={0.3}
                cornerRadius={2}
                onClick={(e) => {
                    onSelect?.(artboard.id)
                    const node = e.target
                    const transform = node.getAbsoluteTransform().copy().invert()
                    const stage = node.getStage()
                    const pointerPos = stage?.getPointerPosition()

                    if (pointerPos) {
                        const relativePos = transform.point(pointerPos)
                        onClick(relativePos)
                    }
                }}
                onContextMenu={(e) => {
                    e.evt.preventDefault()
                    onContextMenu?.(e.evt.clientX, e.evt.clientY)
                }}
            />

            {/* Render Shapes */}
            {artboard.shapes.map(renderShape)}

            {/* Resize Handles - only show when selected */}
            {isSelected && (
                <>
                    {/* Corner handles */}
                    {[
                        { corner: 'nw', x: -4, y: -4 },
                        { corner: 'ne', x: artboard.width - 4, y: -4 },
                        { corner: 'sw', x: -4, y: artboard.height - 4 },
                        { corner: 'se', x: artboard.width - 4, y: artboard.height - 4 },
                    ].map(({ corner, x, y }) => (
                        <Rect
                            key={corner}
                            x={x}
                            y={y}
                            width={8}
                            height={8}
                            fill="#ffffff"
                            stroke="#6366f1"
                            strokeWidth={1}
                            draggable
                            onMouseDown={(e) => handleResizeStart(corner, e)}
                            onDragMove={handleResizeMove}
                            onDragEnd={handleResizeEnd}
                            onMouseEnter={(e) => {
                                const cursor = corner === 'nw' || corner === 'se' ? 'nwse-resize' : 'nesw-resize'
                                e.target.getStage()!.container().style.cursor = cursor
                            }}
                            onMouseLeave={(e) => {
                                e.target.getStage()!.container().style.cursor = 'default'
                            }}
                        />
                    ))}

                    {/* Edge handles */}
                    {[
                        { corner: 'n', x: artboard.width / 2 - 12, y: -4, w: 24, h: 8 },
                        { corner: 's', x: artboard.width / 2 - 12, y: artboard.height - 4, w: 24, h: 8 },
                        { corner: 'e', x: artboard.width - 4, y: artboard.height / 2 - 12, w: 8, h: 24 },
                        { corner: 'w', x: -4, y: artboard.height / 2 - 12, w: 8, h: 24 },
                    ].map(({ corner, x, y, w, h }) => (
                        <Rect
                            key={corner}
                            x={x}
                            y={y}
                            width={w}
                            height={h}
                            fill="#ffffff"
                            stroke="#6366f1"
                            strokeWidth={1}
                            draggable
                            onMouseDown={(e) => handleResizeStart(corner, e)}
                            onDragMove={handleResizeMove}
                            onDragEnd={handleResizeEnd}
                            onMouseEnter={(e) => {
                                const cursor = corner === 'n' || corner === 's' ? 'ns-resize' : 'ew-resize'
                                e.target.getStage()!.container().style.cursor = cursor
                            }}
                            onMouseLeave={(e) => {
                                e.target.getStage()!.container().style.cursor = 'default'
                            }}
                        />
                    ))}
                </>
            )}
        </Group>
    )
})
