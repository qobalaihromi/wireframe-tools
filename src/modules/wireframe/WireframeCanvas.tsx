import { useRef, useCallback, useEffect, useState, forwardRef, useImperativeHandle } from 'react'
import { ContextMenu, ContextMenuAction } from './components/ContextMenu'
import { Stage, Layer, Transformer, Rect, Line, Circle } from 'react-konva'
import type { KonvaEventObject } from 'konva/lib/Node'
import type Konva from 'konva'
import type { WireframeNode, ShapeType, Artboard } from '../../stores/wireframeStore'
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
    borderRadius: number
    fontSize: number

    onShapeSelect: (shapeId: string | null) => void
    onArtboardSelect: (artboardId: string | null) => void
    onMultiSelect?: (shapeIds: string[], artboardIds: string[]) => void
    onAddNode: (artboardId: string, node: WireframeNode) => void
    onUpdateNode: (artboardId: string, nodeId: string, updates: Partial<WireframeNode>) => void
    onAddArtboard: (x: number, y: number, width: number, height: number) => void
    onRenameArtboard?: (artboardId: string, newName: string) => void
    onMoveArtboard?: (artboardId: string, x: number, y: number) => void
    onMoveNode?: (artboardId: string, nodeId: string, targetParentId: string | null, index: number, updates?: Partial<WireframeNode>) => void
    onResizeArtboard?: (artboardId: string, width: number, height: number, newX?: number, newY?: number) => void
    onContextMenuArtboard?: (artboardId: string, artboardName: string, x: number, y: number) => void
    onDropComponent?: (template: any, artboardId: string | null, x: number, y: number) => void
    onGroup?: (artboardId: string, nodeIds: string[]) => void
    onUngroup?: (artboardId: string, groupId: string) => void
}

// Expose stage ref for parent component (for export)
export interface WireframeCanvasRef {
    getStage: () => Konva.Stage | null
}

export const WireframeCanvas = forwardRef<WireframeCanvasRef, WireframeCanvasProps>(({
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
    borderRadius,
    fontSize,
    onShapeSelect,
    onArtboardSelect,
    onMultiSelect,
    onAddNode,
    onUpdateNode,
    onAddArtboard,
    onRenameArtboard,
    onMoveArtboard,
    onMoveNode,
    onResizeArtboard,
    onContextMenuArtboard,
    onDropComponent,
    onGroup,
    onUngroup,
}, ref) => {

    // Context Menu State
    const [contextMenu, setContextMenu] = useState<{ visible: boolean, x: number, y: number, actions: ContextMenuAction[] }>({
        visible: false,
        x: 0,
        y: 0,
        actions: []
    })

    const handleContextMenu = (e: KonvaEventObject<PointerEvent>) => {
        e.evt.preventDefault()

        const stage = stageRef.current
        if (!stage) return

        const textMenuX = e.evt.clientX
        const textMenuY = e.evt.clientY

        const clickTarget = e.target

        const actions: ContextMenuAction[] = []

        let targetNodeId = clickTarget.id()
        let targetArtboardId = clickTarget.findAncestor('.artboard')?.id()

        if (clickTarget === stage) {
            actions.push(
                { label: 'Paste', action: 'paste', disabled: true },
                { label: 'Add Artboard', action: 'add_artboard' }
            )
        } else if (targetNodeId && targetArtboardId) {
            const isSelected = selectedShapeId === targetNodeId
            if (!isSelected) {
                onShapeSelect(targetNodeId)
            }

            const artboard = artboards.find(a => a.id === targetArtboardId)

            const findDeep = (nodes: WireframeNode[]): WireframeNode | null => {
                for (let n of nodes) {
                    if (n.id === targetNodeId) return n
                    if (n.children) {
                        const found = findDeep(n.children)
                        if (found) return found
                    }
                }
                return null
            }
            const clickedNode = artboard ? findDeep(artboard.children) : null

            if (clickedNode) {
                if (clickedNode.type === 'group' || clickedNode.type === 'frame') {
                    actions.push({ label: 'Ungroup', action: 'ungroup', shortcut: 'Cmd+Shift+G' })

                    if (clickedNode.type === 'frame') {
                        const hasLayout = clickedNode.layout && clickedNode.layout.type !== 'none'
                        if (hasLayout) {
                            actions.push({ label: 'Remove Auto Layout', action: 'remove_layout' })
                        } else {
                            actions.push({ label: 'Add Auto Layout', action: 'add_layout', shortcut: 'Shift+A' })
                        }
                    }
                } else {
                    actions.push({ label: 'Frame Selection', action: 'frame_selection', shortcut: 'Cmd+Opt+G' })
                    actions.push({ label: 'Group Selection', action: 'group_selection', shortcut: 'Cmd+G' })
                }

                actions.push({ label: 'Delete', action: 'delete', danger: true, shortcut: 'Del' })
            }
        }

        if (actions.length > 0) {
            setContextMenu({
                visible: true,
                x: textMenuX,
                y: textMenuY,
                actions
            })
        }
    }

    const handleContextMenuAction = (action: string) => {
        if (!selectedShapeId && action !== 'add_artboard') return

        let currentArtboardId: string | null = null
        for (const a of artboards) {
            const findDeep = (nodes: WireframeNode[]): boolean => {
                for (let n of nodes) {
                    if (n.id === selectedShapeId) return true
                    if (n.children && findDeep(n.children)) return true
                }
                return false
            }
            if (findDeep(a.children)) {
                currentArtboardId = a.id
                break
            }
        }

        if (action === 'ungroup' && currentArtboardId && selectedShapeId) {
            onUngroup?.(currentArtboardId, selectedShapeId)
        }
        else if (action === 'group_selection' && currentArtboardId && selectedShapeId) {
            onGroup?.(currentArtboardId, [selectedShapeId])
        }
        else if (action === 'frame_selection' && currentArtboardId && selectedShapeId) {
            onGroup?.(currentArtboardId, [selectedShapeId])
        }
        else if (action === 'add_layout' && currentArtboardId && selectedShapeId) {
            onUpdateNode(currentArtboardId, selectedShapeId, {
                layout: { type: 'vertical', gap: 10, padding: 10, align: 'start' }
            })
        }
        else if (action === 'remove_layout' && currentArtboardId && selectedShapeId) {
            onUpdateNode(currentArtboardId, selectedShapeId, {
                layout: { type: 'none', gap: 0, padding: 0, align: 'start' }
            })
        }
    }

    const stageRef = useRef<Konva.Stage>(null)
    const containerRef = useRef<HTMLDivElement>(null)
    const transformerRef = useRef<Konva.Transformer>(null)
    const shapeRefs = useRef<Map<string, Konva.Node>>(new Map())

    // Expose stage ref to parent via forwardRef
    useImperativeHandle(ref, () => ({
        getStage: () => stageRef.current
    }))

    // Container dimensions for Stage
    const [stageSize, setStageSize] = useState({ width: 800, height: 600 })

    // Frame drawing state
    const [isDrawingFrame, setIsDrawingFrame] = useState(false)
    const [frameStart, setFrameStart] = useState<{ x: number, y: number } | null>(null)

    // Marquee selection state
    const [isMarqueeSelecting, setIsMarqueeSelecting] = useState(false)
    const [marqueeStart, setMarqueeStart] = useState<{ x: number, y: number } | null>(null)
    const [marqueeRect, setMarqueeRect] = useState<{ x: number, y: number, width: number, height: number } | null>(null)
    const [framePreview, setFramePreview] = useState<{ x: number, y: number, width: number, height: number } | null>(null)

    // Pen tool drawing state
    const [isDrawingPath, setIsDrawingPath] = useState(false)
    const [pathPoints, setPathPoints] = useState<{ x: number, y: number }[]>([])
    const [pathArtboardId, setPathArtboardId] = useState<string | null>(null)
    const [cursorPos, setCursorPos] = useState<{ x: number, y: number } | null>(null)

    // Smart Guides State
    const [snapLines, setSnapLines] = useState<{ vertical: boolean, x?: number, y?: number, start: number, end: number }[]>([])

    const handleNodeDragEnd = useCallback((e: KonvaEventObject<DragEvent>) => {
        setSnapLines([])

        // Drag to Parent (Reparenting) Logic
        const node = e.target
        const stage = stageRef.current
        if (!stage || !onMoveNode) return

        // 1. Identify which Artboard we are in (or over)
        // We can find the artboard group using node.findAncestor
        const artboardGroup = node.findAncestor('.artboard') as Konva.Group
        if (!artboardGroup) return // Should not happen if dragged item is inside artboard

        const artboardId = artboardGroup.getAttr('id') // We store artboard ID in group attrs? Need to check ArtboardFrame.
        // Actually ArtboardFrame likely doesn't set ID as attr by default, let's assume we can get it from react props or store
        // But wait, here we only have Konva node.
        // Let's rely on looking up artboards by position first?
        // Or better: Assume the `handleNodeDragMove` logic which knows the artboardId passed to it.
        // But `handleNodeDragEnd` is attached to Node items.

        // Let's use the absolute position center to find the target container
        const absPos = node.getAbsolutePosition()
        const center = {
            x: absPos.x + (node.width() * node.scaleX()) / 2,
            y: absPos.y + (node.height() * node.scaleY()) / 2
        }

        // Find intersecting Artboard
        const targetArtboard = artboards.find(a =>
            center.x >= a.x && center.x <= a.x + a.width &&
            center.y >= a.y && center.y <= a.y + a.height
        )

        if (!targetArtboard) return

        // Recursive Hit Test for Frames/Groups within Artboard
        const hitTestRecursive = (nodes: WireframeNode[], parentAbsX: number, parentAbsY: number): WireframeNode | null => {
            // Iterate in reverse (top-most elements first)
            for (let i = nodes.length - 1; i >= 0; i--) {
                const child = nodes[i]
                if (child.id === node.id()) continue // Skip self

                if (child.type === 'frame' || child.type === 'group') {
                    const childAbsX = parentAbsX + child.x
                    const childAbsY = parentAbsY + child.y

                    if (center.x >= childAbsX && center.x <= childAbsX + child.width &&
                        center.y >= childAbsY && center.y <= childAbsY + child.height) {

                        // Check if we hit a deeper child
                        if (child.children) {
                            const deepHit = hitTestRecursive(child.children, childAbsX, childAbsY)
                            if (deepHit) return deepHit
                        }
                        return child
                    }
                }
            }
            return null
        }

        const newParent = hitTestRecursive(targetArtboard.children, targetArtboard.x, targetArtboard.y)

        // Calculate new relative position
        let newRelativeX = 0
        let newRelativeY = 0
        let targetParentId = null

        if (newParent) {
            targetParentId = newParent.id
            // Need absolute pos of new parent.
            // We can re-calculate or just use Konva's getAbsolutePosition of that node if we can find it in refs
            const parentNode = shapeRefs.current.get(newParent.id)
            if (parentNode) {
                const parentAbs = parentNode.getAbsolutePosition()
                newRelativeX = absPos.x - parentAbs.x
                newRelativeY = absPos.y - parentAbs.y
            } else {
                // Fallback (shouldn't happen if rendered)
                // Re-calculate manual absolute
                // This is tricky if we don't have the full path.
                // Let's stick to using the Konva node if possible.
                // Worst case: Don't reparent if ref missing.
                return
            }
        } else {
            // Root
            targetParentId = null
            newRelativeX = absPos.x - targetArtboard.x
            newRelativeY = absPos.y - targetArtboard.y
        }

        // Call Reparent
        // We pass -1 to append to end
        onMoveNode(targetArtboard.id, node.id(), targetParentId, -1, { x: newRelativeX, y: newRelativeY })

        // Also update the Konva node immediately to prevent flicker? 
        // Store update will trigger re-render anyway.

    }, [artboards, onMoveNode])

    const handleNodeDragMove = useCallback((artboardId: string, e: KonvaEventObject<DragEvent>) => {
        const node = e.target
        // Skip snapping if Shift is pressed (optional, standard behavior)
        if (e.evt.shiftKey) {
            setSnapLines([])
            return
        }

        const artboard = artboards.find(a => a.id === artboardId)
        if (!artboard) return

        // 1. Get other nodes in the same artboard
        // We exclude the current node from the list of snap targets
        // Note: node.id() might be diff from store ID if we use prefixes, but usually it matches
        // In NodeRenderer we set id={node.id}
        const draggedId = node.id()
        const otherNodes = artboard.children.filter(n => n.id !== draggedId)

        // 2. Current Node Box (relative to Artboard)
        const x = node.x()
        const y = node.y()
        // Use getClientRect to account for rotation? simpler to use bbox for now
        // But for snapping we usually use unrotated bbox or center
        const scaleX = node.scaleX()
        const scaleY = node.scaleY()
        const w = node.width() * scaleX
        const h = node.height() * scaleY



        const SNAP_THRESHOLD = 5
        const newSnapLines: { vertical: boolean, x?: number, y?: number, start: number, end: number }[] = []

        let newX = x
        let newY = y
        let snappedX = false
        let snappedY = false

        // Helper to check snap
        // We only allow one snap per axis to avoid conflict/jitters

        // Add Artboard Edges as targets
        const targetsV = [0, artboard.width / 2, artboard.width]
        const targetsH = [0, artboard.height / 2, artboard.height]

        otherNodes.forEach(other => {
            const ow = other.width
            const oh = other.height
            // If other is rotated, this calculation is naive (axis-aligned). 
            // For MVP we assume unrotated bounding boxes for snapping targets.
            targetsV.push(other.x, other.x + ow / 2, other.x + ow)
            targetsH.push(other.y, other.y + oh / 2, other.y + oh)
        })

        // Check Vertical (adjust X)
        for (const targetX of targetsV) {
            // Check against Left, Center, Right of dragged node
            // Calculate delta to move 'current' to 'target'
            // Left to Target
            if (Math.abs(x - targetX) < SNAP_THRESHOLD) {
                newX = targetX
                snappedX = true
            }
            // Center to Target
            else if (Math.abs((x + w / 2) - targetX) < SNAP_THRESHOLD) {
                newX = targetX - w / 2
                snappedX = true
            }
            // Right to Target
            else if (Math.abs((x + w) - targetX) < SNAP_THRESHOLD) {
                newX = targetX - w
                snappedX = true
            }

            if (snappedX) {
                newSnapLines.push({
                    vertical: true,
                    x: targetX + artboard.x, // Global coord
                    start: Math.min(y, 0) + artboard.y - 20, // Simple length
                    end: Math.max(y + h, artboard.height) + artboard.y + 20
                })
                break
            }
        }

        // Check Horizontal (adjust Y)
        for (const targetY of targetsH) {
            if (Math.abs(y - targetY) < SNAP_THRESHOLD) {
                newY = targetY
                snappedY = true
            }
            else if (Math.abs((y + h / 2) - targetY) < SNAP_THRESHOLD) {
                newY = targetY - h / 2
                snappedY = true
            }
            else if (Math.abs((y + h) - targetY) < SNAP_THRESHOLD) {
                newY = targetY - h
                snappedY = true
            }

            if (snappedY) {
                newSnapLines.push({
                    vertical: false,
                    y: targetY + artboard.y, // Global coord
                    start: Math.min(x, 0) + artboard.x - 20,
                    end: Math.max(x + w, artboard.width) + artboard.x + 20
                })
                break
            }
        }

        // Apply Snap to Node (Direct Manipulation)
        node.x(newX)
        node.y(newY)

        setSnapLines(newSnapLines)
    }, [artboards])

    // Track container size using ResizeObserver for proper updates when sidebar collapses
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

        // Use ResizeObserver to detect container size changes (when sidebar collapses/expands)
        const resizeObserver = new ResizeObserver(() => {
            updateSize()
        })

        if (containerRef.current) {
            resizeObserver.observe(containerRef.current)
        }

        window.addEventListener('resize', updateSize)
        return () => {
            window.removeEventListener('resize', updateSize)
            resizeObserver.disconnect()
        }
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
        const isPinchZoom = e.evt.ctrlKey || e.evt.metaKey

        if (isPinchZoom) {
            const oldScale = stage.scaleX()
            const pointer = stage.getPointerPosition()
            if (!pointer) return

            const mousePointTo = {
                x: (pointer.x - stage.x()) / oldScale,
                y: (pointer.y - stage.y()) / oldScale,
            }

            const zoomIntensity = 0.015
            const delta = -e.evt.deltaY
            const zoomFactor = 1 + delta * zoomIntensity
            let newScale = oldScale * zoomFactor
            newScale = Math.max(0.1, Math.min(5, newScale))

            if (newScale === oldScale) return

            const newPos = {
                x: pointer.x - mousePointTo.x * newScale,
                y: pointer.y - mousePointTo.y * newScale,
            }

            onStageChange(newScale, newPos)
        } else {
            const panSpeed = 1.2
            const newPos = {
                x: stagePosition.x - e.evt.deltaX * panSpeed,
                y: stagePosition.y - e.evt.deltaY * panSpeed,
            }
            onStageChange(stageScale, newPos)
        }
    }

    const handleDragEnd = (e: KonvaEventObject<DragEvent>) => {
        if (e.target === e.target.getStage()) {
            onStageChange(stageScale, {
                x: e.target.x(),
                y: e.target.y(),
            })
        }
    }

    const handleStageClick = (e: KonvaEventObject<MouseEvent>) => {
        const clickedOnEmpty = e.target === e.target.getStage()

        // Pen tool: add point on click
        if (selectedTool === 'path') {
            const stage = stageRef.current
            if (!stage) return
            const pos = stage.getPointerPosition()
            if (!pos) return
            const x = (pos.x - stagePosition.x) / stageScale
            const y = (pos.y - stagePosition.y) / stageScale

            // Find which artboard was clicked on
            let clickedArtboardId: string | null = null
            for (const artboard of artboards) {
                if (x >= artboard.x && x <= artboard.x + artboard.width &&
                    y >= artboard.y && y <= artboard.y + artboard.height) {
                    clickedArtboardId = artboard.id
                    break
                }
            }

            if (clickedArtboardId) {
                if (!isDrawingPath) {
                    // Start new path
                    setIsDrawingPath(true)
                    setPathArtboardId(clickedArtboardId)
                    setPathPoints([{ x, y }])
                } else if (pathArtboardId === clickedArtboardId) {
                    // Add point to existing path
                    setPathPoints(prev => [...prev, { x, y }])
                }
            }
            return
        }

        if (clickedOnEmpty && selectedTool === 'select') {
            onShapeSelect(null)
        }
    }

    // Finish path helper
    const finishPath = (closed: boolean = false) => {
        if (!isDrawingPath || pathPoints.length < 2 || !pathArtboardId) {
            // Cancel if not enough points
            setIsDrawingPath(false)
            setPathPoints([])
            setPathArtboardId(null)
            return
        }

        // Find the artboard to calculate relative coords
        const artboard = artboards.find(a => a.id === pathArtboardId)
        if (!artboard) return

        // Calculate bounding box
        const xs = pathPoints.map(p => p.x)
        const ys = pathPoints.map(p => p.y)
        const minX = Math.min(...xs)
        const minY = Math.min(...ys)
        const maxX = Math.max(...xs)
        const maxY = Math.max(...ys)

        // Convert points to relative coords (relative to node position)
        const relativePoints: number[] = []
        pathPoints.forEach(p => {
            relativePoints.push(p.x - minX, p.y - minY)
        })

        const newNode: WireframeNode = {
            id: `path_${Date.now()}`,
            name: 'Path',
            type: 'path',
            x: minX - artboard.x,
            y: minY - artboard.y,
            width: maxX - minX || 10,
            height: maxY - minY || 10,
            rotation: 0,
            opacity: opacity,
            visible: true,
            locked: false,
            fill: closed ? fillColor : 'transparent',
            stroke: strokeColor,
            strokeWidth: strokeWidth,
            points: relativePoints,
            closed: closed,
            children: []
        }

        onAddNode(pathArtboardId, newNode)
        onShapeSelect(newNode.id)

        // Reset state
        setIsDrawingPath(false)
        setPathPoints([])
        setPathArtboardId(null)
    }

    // Keyboard handler for pen tool
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isDrawingPath) return

            if (e.key === 'Escape') {
                // Cancel path
                setIsDrawingPath(false)
                setPathPoints([])
                setPathArtboardId(null)
            } else if (e.key === 'Enter') {
                // Close path
                finishPath(true)
            }
        }

        const handleDblClick = () => {
            if (isDrawingPath) {
                finishPath(false)
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        window.addEventListener('dblclick', handleDblClick)
        return () => {
            window.removeEventListener('keydown', handleKeyDown)
            window.removeEventListener('dblclick', handleDblClick)
        }
    }, [isDrawingPath, pathPoints, pathArtboardId])

    // Pass this to ArtboardFrame to handle adding shapes
    const handleArtboardClick = (artboardId: string, relativePointerPos: { x: number, y: number }) => {
        if (selectedTool === 'select' || selectedTool === 'hand' || selectedTool === 'frame') return

        const shapeType = selectedTool as ShapeType
        const newNode: WireframeNode = {
            id: `shape_${Date.now()}`,
            name: shapeType, // Defaults to type as name
            type: shapeType,
            x: relativePointerPos.x - 50,
            y: relativePointerPos.y - 25,
            width: selectedTool === 'circle' ? 80 : selectedTool === 'card' ? 200 : selectedTool === 'line' || selectedTool === 'arrow' ? 100 : 100,
            height: selectedTool === 'circle' ? 80 : selectedTool === 'card' ? 120 : 50,
            rotation: 0,
            opacity: opacity,
            visible: true,
            locked: false,
            fill: fillColor,
            stroke: strokeColor,
            strokeWidth: strokeWidth,
            borderRadius: (shapeType === 'rect' || shapeType === 'button' || shapeType === 'input' || shapeType === 'card') ? borderRadius : undefined,
            text: selectedTool === 'text' ? 'Text' : selectedTool === 'button' ? 'Button' : undefined,
            fontSize: fontSize,
            points: selectedTool === 'line' || selectedTool === 'arrow' ? [0, 0, 100, 0] : undefined,
            children: [] // Init children array
        }

        onAddNode(artboardId, newNode)
    }

    // Helper: Check if two rectangles intersect
    const rectsIntersect = (
        r1: { x: number, y: number, width: number, height: number },
        r2: { x: number, y: number, width: number, height: number }
    ) => {
        return !(
            r1.x + r1.width < r2.x ||
            r2.x + r2.width < r1.x ||
            r1.y + r1.height < r2.y ||
            r2.y + r2.height < r1.y
        )
    }

    // Helper: Find all shapes intersecting with marquee
    const findIntersectingElements = (marquee: { x: number, y: number, width: number, height: number }) => {
        const selectedShapeIds: string[] = []
        const selectedArtboardIds: string[] = []

        artboards.forEach(artboard => {
            // Check if artboard intersects
            const artboardRect = { x: artboard.x, y: artboard.y, width: artboard.width, height: artboard.height }
            if (rectsIntersect(marquee, artboardRect)) {
                selectedArtboardIds.push(artboard.id)
            }

            // Check children (shapes) within artboard
            const checkNode = (node: WireframeNode, parentX: number, parentY: number) => {
                const nodeRect = {
                    x: parentX + node.x,
                    y: parentY + node.y,
                    width: node.width,
                    height: node.height
                }
                if (rectsIntersect(marquee, nodeRect)) {
                    selectedShapeIds.push(node.id)
                }
                // Recursively check children
                if (node.children) {
                    node.children.forEach(child => checkNode(child, nodeRect.x, nodeRect.y))
                }
            }

            artboard.children.forEach(child => checkNode(child, artboard.x, artboard.y))
        })

        return { selectedShapeIds, selectedArtboardIds }
    }

    const handleMouseDown = (e: KonvaEventObject<MouseEvent>) => {
        const stage = stageRef.current
        if (!stage) return
        const pos = stage.getPointerPosition()
        if (!pos) return
        const x = (pos.x - stagePosition.x) / stageScale
        const y = (pos.y - stagePosition.y) / stageScale

        // Frame drawing mode
        if (selectedTool === 'frame') {
            setIsDrawingFrame(true)
            setFrameStart({ x, y })
            setFramePreview({ x, y, width: 0, height: 0 })
            return
        }

        // Marquee selection: Only start if clicking on empty stage area
        if (selectedTool === 'select') {
            const clickedOnEmpty = e.target === e.target.getStage()
            if (clickedOnEmpty) {
                setIsMarqueeSelecting(true)
                setMarqueeStart({ x, y })
                setMarqueeRect({ x, y, width: 0, height: 0 })
            }
        }
    }

    const handleMouseMove = () => {
        const stage = stageRef.current
        if (!stage) return
        const pos = stage.getPointerPosition()
        if (!pos) return
        const x = (pos.x - stagePosition.x) / stageScale
        const y = (pos.y - stagePosition.y) / stageScale

        // Frame drawing
        if (isDrawingFrame && frameStart) {
            setFramePreview({
                x: Math.min(frameStart.x, x),
                y: Math.min(frameStart.y, y),
                width: Math.abs(x - frameStart.x),
                height: Math.abs(y - frameStart.y),
            })
            return
        }

        // Marquee selection
        if (isMarqueeSelecting && marqueeStart) {
            setMarqueeRect({
                x: Math.min(marqueeStart.x, x),
                y: Math.min(marqueeStart.y, y),
                width: Math.abs(x - marqueeStart.x),
                height: Math.abs(y - marqueeStart.y),
            })
        }

        // Track cursor for pen tool preview
        if (isDrawingPath) {
            setCursorPos({ x, y })
        }
    }

    const handleMouseUp = () => {
        // Frame drawing
        if (isDrawingFrame && framePreview) {
            if (framePreview.width > 50 && framePreview.height > 50) {
                onAddArtboard(framePreview.x, framePreview.y, framePreview.width, framePreview.height)
            }
            setIsDrawingFrame(false)
            setFrameStart(null)
            setFramePreview(null)
            return
        }

        // Marquee selection
        if (isMarqueeSelecting && marqueeRect) {
            // Only process if marquee has some size
            if (marqueeRect.width > 5 && marqueeRect.height > 5) {
                const { selectedShapeIds, selectedArtboardIds } = findIntersectingElements(marqueeRect)

                // For now, select the first shape found (or first artboard if no shapes)
                if (selectedShapeIds.length > 0) {
                    onShapeSelect(selectedShapeIds[0])
                    // If multi-select callback is available, use it
                    onMultiSelect?.(selectedShapeIds, selectedArtboardIds)
                } else if (selectedArtboardIds.length > 0) {
                    onArtboardSelect(selectedArtboardIds[0])
                    onMultiSelect?.([], selectedArtboardIds)
                }
            }
            setIsMarqueeSelecting(false)
            setMarqueeStart(null)
            setMarqueeRect(null)
        }
    }



    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        const templateJson = e.dataTransfer.getData('application/json')
        if (!templateJson) return

        let template: any
        try {
            template = JSON.parse(templateJson)
        } catch { return }

        const stage = stageRef.current
        if (!stage) return

        // Get stage container position for accurate offset
        const stageBox = containerRef.current?.getBoundingClientRect()
        if (!stageBox) return

        // Calculate drop position in stage coords
        const dropX = (e.clientX - stageBox.left - stagePosition.x) / stageScale
        const dropY = (e.clientY - stageBox.top - stagePosition.y) / stageScale

        // Find target artboard
        const artboard = artboards.find(a =>
            dropX >= a.x && dropX <= a.x + a.width &&
            dropY >= a.y && dropY <= a.y + a.height
        )

        let targetX = dropX
        let targetY = dropY
        let targetArtboardId: string | null = null

        if (artboard) {
            targetArtboardId = artboard.id

            // Default: Free Drop (Relative Calculate)
            targetX = dropX - artboard.x
            targetY = dropY - artboard.y

            // Auto Layout (Stacking) Logic Check
            const layout = artboard.layout
            if (layout && layout.type !== 'none') {
                // Place below the bottom-most child
                const children = artboard.children || []
                let maxY = 0
                if (children.length > 0) {
                    maxY = Math.max(...children.map(c => c.y + c.height))
                }

                // Stacking with defined gap or 20px
                const gap = layout.gap ?? 20
                const padding = layout.padding ?? 20

                if (layout.type === 'vertical') {
                    targetY = maxY > 0 ? maxY + gap : padding
                    targetX = padding // Align start
                    // Center alignment would need width calculation, simpler to start.
                    if (layout.align === 'center') {
                        targetX = (artboard.width - (template.defaultWidth || 100)) / 2
                    }
                } else {
                    // Horizontal
                    // Need max X
                    let maxX = 0
                    if (children.length > 0) {
                        maxX = Math.max(...children.map(c => c.x + c.width))
                    }
                    targetX = maxX > 0 ? maxX + gap : padding
                    targetY = padding
                }
            }
        }

        onDropComponent?.(template, targetArtboardId, targetX, targetY)
    }

    return (
        <div
            ref={containerRef}
            className="flex-1 overflow-hidden bg-[#0a0a0a] relative"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
        >
            <Stage
                ref={stageRef}
                width={stageSize.width}
                height={stageSize.height}
                onWheel={handleWheel}
                draggable={selectedTool === 'hand' || false} // TODO: Add space check
                onDragEnd={handleDragEnd}
                onClick={handleStageClick}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onContextMenu={handleContextMenu}
                scale={{ x: stageScale, y: stageScale }}
                x={stagePosition.x}
                y={stagePosition.y}
                style={{ cursor: selectedTool === 'frame' ? 'crosshair' : selectedTool === 'hand' ? 'grab' : selectedTool !== 'select' ? 'crosshair' : 'default' }}
            >
                <Layer>
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
                            onShapeUpdate={(nodeId, updates) => onUpdateNode(artboard.id, nodeId, updates)}
                            bindShapeRef={bindShapeRef}
                            onClick={(pos) => handleArtboardClick(artboard.id, pos)}
                            onRename={onRenameArtboard}
                            onSelect={onArtboardSelect}
                            onContextMenu={(x: number, y: number) => onContextMenuArtboard?.(artboard.id, artboard.name, x, y)}
                            onMove={(id, x, y) => onMoveArtboard?.(id, x, y)}
                            onResize={(id, w, h, x, y) => onResizeArtboard?.(id, w, h, x, y)}
                            onNodeDragMove={handleNodeDragMove}
                            onNodeDragEnd={handleNodeDragEnd}
                        />
                    ))}

                    {/* Frame Preview */}
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

                    {/* Marquee Selection Rectangle */}
                    {marqueeRect && (
                        <Rect
                            x={marqueeRect.x}
                            y={marqueeRect.y}
                            width={marqueeRect.width}
                            height={marqueeRect.height}
                            fill="rgba(99, 102, 241, 0.15)"
                            stroke="#6366f1"
                            strokeWidth={1}
                            dash={[5, 3]}
                        />
                    )}

                    {/* Pen Tool Path Preview */}
                    {isDrawingPath && pathPoints.length > 0 && (
                        <>
                            {/* Lines connecting points */}
                            <Line
                                points={pathPoints.flatMap(p => [p.x, p.y])}
                                stroke="#6366f1"
                                strokeWidth={2}
                                lineCap="round"
                                lineJoin="round"
                            />
                            {/* Preview line to cursor */}
                            {cursorPos && pathPoints.length > 0 && (
                                <Line
                                    points={[
                                        pathPoints[pathPoints.length - 1].x,
                                        pathPoints[pathPoints.length - 1].y,
                                        cursorPos.x,
                                        cursorPos.y
                                    ]}
                                    stroke="#6366f1"
                                    strokeWidth={2}
                                    dash={[5, 5]}
                                    opacity={0.5}
                                />
                            )}
                            {/* Point markers */}
                            {pathPoints.map((point, idx) => (
                                <Circle
                                    key={idx}
                                    x={point.x}
                                    y={point.y}
                                    radius={4}
                                    fill={idx === 0 ? '#10b981' : '#6366f1'}
                                    stroke="#fff"
                                    strokeWidth={1}
                                />
                            ))}
                        </>
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

                    {/* Snap Lines Overlay */}
                    {snapLines.map((line, i) => (
                        <Line
                            key={i}
                            points={line.vertical
                                ? [line.x!, line.start, line.x!, line.end]
                                : [line.start, line.y!, line.end, line.y!]
                            }
                            stroke="#ef4444"
                            strokeWidth={1}
                            dash={[4, 4]}
                            listening={false}
                        />
                    ))}
                </Layer>
            </Stage>

            {artboards.length === 0 && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[#52525b] text-center pointer-events-none select-none">
                    <p className="mb-2">Infinite Canvas Ready</p>
                    <p className="text-sm">Press 'F' to draw a frame</p>
                </div>
            )}

            {contextMenu.visible && (
                <ContextMenu
                    x={contextMenu.x}
                    y={contextMenu.y}
                    actions={contextMenu.actions}
                    onAction={handleContextMenuAction}
                    onClose={() => setContextMenu(prev => ({ ...prev, visible: false }))}
                />
            )}
        </div>
    )
})
    ```
