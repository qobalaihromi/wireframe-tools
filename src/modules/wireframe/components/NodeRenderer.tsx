import React, { useCallback } from 'react'
import { Rect, Circle, Text, Line, Arrow, Group } from 'react-konva'
import type { KonvaEventObject } from 'konva/lib/Node'
import type { WireframeNode } from '../../../stores/wireframeStore'

interface NodeRendererProps {
    node: WireframeNode
    selectedShapeId: string | null
    onSelect: (id: string, opts: { isMulti: boolean, isDeep: boolean }) => void
    onChange: (id: string, attrs: Partial<WireframeNode>) => void
    bindShapeRef: (id: string, node: any) => void
    onDragMove?: (e: KonvaEventObject<DragEvent>) => void
    onDragEnd?: (e: KonvaEventObject<DragEvent>) => void
}

export const NodeRenderer = React.memo(({
    node,
    selectedShapeId,
    onSelect,
    onChange,
    bindShapeRef,
    onDragMove,
    onDragEnd,
}: NodeRendererProps) => {

    const isSelected = selectedShapeId === node.id

    const handleClick = useCallback((e: KonvaEventObject<MouseEvent>) => {
        // Stop propagation so we don't select the artboard/parent
        e.cancelBubble = true

        const isMulti = e.evt.shiftKey
        // Cmd/Ctrl/Meta for Deep Select
        const isDeep = e.evt.metaKey || e.evt.ctrlKey

        onSelect(node.id, { isMulti, isDeep })
    }, [node.id, onSelect])

    const handleChildSelect = useCallback((childId: string, opts: { isMulti: boolean, isDeep: boolean }) => {
        // If Deep Select is active, pass the child ID up
        if (opts.isDeep) {
            onSelect(childId, opts)
            return
        }
        // Otherwise, intercept and select THIS group (the parent)
        // Pass isMulti (Shift) along, but force ID to be this group
        onSelect(node.id, opts)
    }, [node.id, onSelect])

    const handleDragEnd = useCallback((e: KonvaEventObject<DragEvent>) => {
        onChange(node.id, {
            x: e.target.x(),
            y: e.target.y(),
        })
        onDragEnd?.(e)
    }, [node.id, onChange, onDragEnd])

    const handleTransformEnd = useCallback((e: KonvaEventObject<Event>) => {
        const target = e.target
        const scaleX = target.scaleX()
        const scaleY = target.scaleY()

        // Reset scale and apply to width/height
        target.scaleX(1)
        target.scaleY(1)

        onChange(node.id, {
            x: target.x(),
            y: target.y(),
            width: Math.max(5, target.width() * scaleX),
            height: Math.max(5, target.height() * scaleY),
            rotation: target.rotation(),
        })
    }, [node.id, onChange])

    const commonProps = {
        id: node.id,
        x: node.x,
        y: node.y,
        rotation: node.rotation || 0,
        opacity: node.opacity ?? 1,
        draggable: true, // TODO: Handle locking
        onClick: handleClick,
        onDragMove: onDragMove,
        onDragEnd: handleDragEnd,
        onTransformEnd: handleTransformEnd,
    }

    // Render Children (for Groups/Frames)
    const renderChildren = () => {
        if (!node.children || node.children.length === 0) return null
        return node.children.map(child => (
            <NodeRenderer
                key={child.id}
                node={child}
                selectedShapeId={selectedShapeId}
                onSelect={handleChildSelect}
                onChange={onChange}
                bindShapeRef={bindShapeRef}
                onDragMove={onDragMove}
                onDragEnd={onDragEnd}
            />
        ))
    }

    switch (node.type) {
        case 'rect':
            return (
                <Rect
                    ref={nodeHandle => bindShapeRef(node.id, nodeHandle)}
                    {...commonProps}
                    width={node.width}
                    height={node.height}
                    fill={node.fill}
                    stroke={isSelected ? '#6366f1' : node.stroke}
                    strokeWidth={isSelected ? 2 : node.strokeWidth}
                    cornerRadius={node.borderRadius || 0}
                />
            )

        case 'circle':
            return (
                <Circle
                    ref={nodeHandle => bindShapeRef(node.id, nodeHandle)}
                    {...commonProps}
                    radius={node.width / 2}
                    fill={node.fill}
                    stroke={isSelected ? '#6366f1' : node.stroke}
                    strokeWidth={isSelected ? 2 : node.strokeWidth}
                />
            )

        case 'text':
            return (
                <Text
                    ref={nodeHandle => bindShapeRef(node.id, nodeHandle)}
                    {...commonProps}
                    text={node.text || 'Text'}
                    fontSize={node.fontSize || 16}
                    fontFamily={node.fontFamily}
                    fill={node.fill}
                    width={node.width}
                    align={node.textAlign}
                />
            )

        case 'line':
            return (
                <Line
                    ref={nodeHandle => bindShapeRef(node.id, nodeHandle)}
                    {...commonProps}
                    points={node.points || [0, 0, 100, 0]}
                    stroke={isSelected ? '#6366f1' : node.stroke}
                    strokeWidth={isSelected ? 2 : node.strokeWidth}
                    lineCap="round"
                    lineJoin="round"
                />
            )

        case 'arrow':
            return (
                <Arrow
                    ref={nodeHandle => bindShapeRef(node.id, nodeHandle)}
                    {...commonProps}
                    points={node.points || [0, 0, 100, 0]}
                    stroke={isSelected ? '#6366f1' : node.stroke}
                    strokeWidth={isSelected ? 2 : node.strokeWidth}
                    fill={node.stroke}
                    pointerLength={10}
                    pointerWidth={10}
                />
            )

        case 'group':
        case 'frame':
            return (
                <Group
                    ref={nodeHandle => bindShapeRef(node.id, nodeHandle)}
                    {...commonProps}
                    clipFunc={node.type === 'frame' ? (ctx) => {
                        ctx.rect(0, 0, node.width, node.height)
                    } : undefined}
                >
                    {/* Render Group Background? For Frame maybe. For Group no. */}
                    {node.type === 'frame' && (
                        <Rect
                            width={node.width}
                            height={node.height}
                            fill={node.fill || 'transparent'}
                            stroke={isSelected ? '#6366f1' : node.stroke}
                            strokeWidth={node.strokeWidth}
                        />
                    )}
                    {renderChildren()}
                </Group>
            )

        case 'path':
            return (
                <Line
                    ref={nodeHandle => bindShapeRef(node.id, nodeHandle)}
                    {...commonProps}
                    points={node.points || []}
                    stroke={isSelected ? '#6366f1' : node.stroke}
                    strokeWidth={isSelected ? 2 : node.strokeWidth}
                    fill={node.closed ? node.fill : undefined}
                    closed={node.closed || false}
                    lineCap="round"
                    lineJoin="round"
                />
            )

        default:
            return null
    }
})
