import { ChevronRight, ChevronDown, Layout, Type, Box, Circle, Minus, MousePointer2 } from 'lucide-react'
import { useState } from 'react'
import type { Artboard, WireframeNode, ShapeType } from '../../../stores/wireframeStore'
import { DndContext, DragOverlay, useSensor, useSensors, PointerSensor, closestCenter } from '@dnd-kit/core'
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

interface LayersPanelProps {
    artboards: Artboard[]
    selectedArtboardId: string | null
    selectedShapeId: string | null
    onSelectArtboard: (id: string) => void
    onSelectShape: (artboardId: string, shapeId: string) => void
    onRenameArtboard: (id: string, newName: string) => void
    onDuplicateArtboard: (id: string) => void
    onDeleteArtboard: (id: string) => void
    onMoveNode: (artboardId: string, nodeId: string, targetParentId: string | null, index: number) => void
}

const getNodeIcon = (type: ShapeType) => {
    switch (type) {
        case 'rect': return <Box className="w-3 h-3" />
        case 'circle': return <Circle className="w-3 h-3" />
        case 'text': return <Type className="w-3 h-3" />
        case 'button': return <MousePointer2 className="w-3 h-3" />
        case 'line':
        case 'arrow': return <Minus className="w-3 h-3" />
        case 'group': return <Layout className="w-3 h-3" />
        case 'frame': return <Layout className="w-3 h-3" />
        default: return <Box className="w-3 h-3" />
    }
}

// Recursive component for Tree item
const SortableLayerItem = ({
    node,
    depth = 0,
    selectedShapeId,
    onSelect,
    artboardId,
    onMoveNode,
}: {
    node: WireframeNode
    depth?: number
    selectedShapeId: string | null
    onSelect: (id: string) => void
    artboardId: string
    onMoveNode: (artboardId: string, nodeId: string, targetParentId: string | null, index: number) => void
}) => {
    const isSelected = selectedShapeId === node.id
    const [isExpanded, setIsExpanded] = useState(true)
    const hasChildren = node.children && node.children.length > 0

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: node.id, data: { node, depth, parentId: null } }) // parentId null here is tricky, we ideally need it

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        paddingLeft: `${depth * 12 + 8}px`
    }

    return (
        <div>
            <div
                ref={setNodeRef}
                style={style}
                {...attributes}
                {...listeners}
                className={`flex items-center gap-2 px-2 py-1 text-xs cursor-pointer select-none ${isSelected ? 'bg-[#3b82f6] text-white' : 'hover:bg-[#252525] text-[#a1a1aa]'}`}
                onClick={(e) => {
                    e.stopPropagation()
                    onSelect(node.id)
                }}
            >
                <span
                    className="p-0.5 hover:bg-white/10 rounded cursor-pointer"
                    onPointerDown={(e) => e.stopPropagation()} // Prevent drag start on expander
                    onClick={(e) => {
                        e.stopPropagation()
                        if (hasChildren) setIsExpanded(!isExpanded)
                    }}
                >
                    {hasChildren ? (
                        isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />
                    ) : (
                        <span className="w-3 h-3 inline-block" />
                    )}
                </span>

                {getNodeIcon(node.type)}
                <span className="truncate">{node.name || node.text || node.type}</span>
            </div>

            {hasChildren && isExpanded && (
                <div className="flex flex-col">
                    <SortableContext
                        items={node.children!.map(c => c.id)}
                        strategy={verticalListSortingStrategy}
                        id={node.id} // Context ID matches group ID
                    >
                        {node.children!.slice().reverse().map(child => (
                            <SortableLayerItem
                                key={child.id}
                                node={child}
                                depth={depth + 1}
                                selectedShapeId={selectedShapeId}
                                onSelect={onSelect}
                                artboardId={artboardId}
                                onMoveNode={onMoveNode}
                            />
                        ))}
                    </SortableContext>
                </div>
            )}
        </div>
    )
}

export function LayersPanel({
    artboards,
    selectedArtboardId,
    selectedShapeId,
    onSelectArtboard,
    onSelectShape,
    onMoveNode,
}: LayersPanelProps) {
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5,
            },
        })
    )

    const [activeId, setActiveId] = useState<string | null>(null)

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as string)
    }

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event
        setActiveId(null)

        if (!over || active.id === over.id) return

        // This is a simplified flat-list logic. Real logic needs tree awareness.
        // For MVP, if we move within the same context, we just reorder.
        // dnd-kit "over" will be the item we dropped ON.

        // We need to find the parent of the active item and the parent of the over item.
        // Since we didn't pass full parent info map, we might need store help or traversal.
        // But SortableContext gives us some info.

        // A tricky part: We rendered children in REVERSE order (`slice().reverse()`).
        // So index 0 in UI is index Length-1 in data.
        // If sorting logic uses index, we must account for this or use non-reversed order in data.

        // Simpler: Just get the IDs and let the store handle "move activeId to be before/after overId".
        // But `moveNode` signature is `(targetParent, targetIndex)`.

        // We really need to know the target structure.
        // Since this is complex to do blindly, let's assume specific "SortableContext" container logic.
        // If `over` is in container X, we move `active` to container X.

        // Let's implement a simplified "Move to Root" or "Reorder via raw index" later.
        // For this step, I'll log the move request to verify the UI interaction first.

        console.log('Drag End:', active.id, 'over', over.id)
        // TODO: Calculate new parent and index based on `over`.
    }

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <div className="flex flex-col gap-1">
                {artboards.map(artboard => {
                    const isSelected = selectedArtboardId === artboard.id
                    const isExpanded = isSelected

                    return (
                        <div key={artboard.id} className="flex flex-col">
                            {/* Artboard Header */}
                            <div
                                className={`flex items-center gap-2 px-2 py-1.5 text-xs font-medium cursor-pointer ${isSelected ? 'bg-[#252525] text-white' : 'text-[#a1a1aa] hover:text-white'}`}
                                onClick={() => onSelectArtboard(artboard.id)}
                            >
                                {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                                <Layout className="w-3 h-3" />
                                <span className="truncate">{artboard.name}</span>
                            </div>

                            {/* Children */}
                            {isExpanded && (
                                <div className="flex flex-col">
                                    <SortableContext
                                        items={artboard.children.map(c => c.id)}
                                        strategy={verticalListSortingStrategy}
                                        id={artboard.id} // Context ID = Artboard ID
                                    >
                                        {artboard.children.slice().reverse().map(node => (
                                            <SortableLayerItem
                                                key={node.id}
                                                node={node}
                                                selectedShapeId={selectedShapeId}
                                                onSelect={(nodeId) => onSelectShape(artboard.id, nodeId)}
                                                artboardId={artboard.id}
                                                onMoveNode={onMoveNode}
                                            />
                                        ))}
                                    </SortableContext>
                                    {artboard.children.length === 0 && (
                                        <div className="px-8 py-2 text-[10px] text-[#52525b] italic">
                                            No layers
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>

            <DragOverlay>
                {activeId ? (
                    <div className="bg-[#3b82f6] text-white px-2 py-1 text-xs rounded shadow opacity-80">
                        Moving Layer...
                    </div>
                ) : null}
            </DragOverlay>
        </DndContext>
    )
}
