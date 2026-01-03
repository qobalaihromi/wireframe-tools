import { useCallback, useEffect, useRef, useState } from 'react'
import {
    ReactFlow,
    Controls,
    Background,
    MiniMap,
    Panel,
    useNodesState,
    useEdgesState,
    addEdge,
    BackgroundVariant,
    type Connection,
    type Node,
    type Edge,
    MarkerType,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'

import { useProjectStore } from '../../stores/projectStore'
import { useFlowchartStore } from '../../stores/flowchartStore'
import { nodeTypes, type NodeType } from './CustomNodes'
import { NodePalette } from './NodePalette'
import { FlowchartToolbar } from './FlowchartToolbar'
import { ZoomIn, ZoomOut, Maximize2 } from 'lucide-react'
import { useUndoRedo } from '../../hooks/useUndoRedo'

let nodeId = 0
const getNodeId = () => `node_${nodeId++}`

export function FlowchartEditor() {
    const currentProject = useProjectStore((state) => state.getCurrentProject())
    const { getFlowchart, saveFlowchart } = useFlowchartStore()
    const reactFlowWrapper = useRef<HTMLDivElement>(null)
    const reactFlowInstance = useRef<any>(null)

    const [nodes, setNodes, onNodesChange] = useNodesState<Node>([])
    const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([])
    const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
    const [editingNodeId, setEditingNodeId] = useState<string | null>(null)
    const [editLabel, setEditLabel] = useState('')
    const [activeTool, setActiveTool] = useState<'select' | 'hand'>('select')

    const { takeSnapshot, undo, redo, canUndo, canRedo } = useUndoRedo({
        nodes,
        edges,
        setNodes,
        setEdges,
    })

    // Load saved flowchart
    useEffect(() => {
        if (currentProject) {
            const saved = getFlowchart(currentProject.id)
            if (saved) {
                setNodes(saved.nodes as Node[])
                setEdges(saved.edges as Edge[])
                const maxId = Math.max(
                    ...saved.nodes.map((n: Node) => parseInt(n.id.replace('node_', '')) || 0),
                    0
                )
                nodeId = maxId + 1
            }
        }
    }, [currentProject?.id, getFlowchart, setNodes, setEdges])

    // Auto-save on changes
    useEffect(() => {
        if (currentProject && (nodes.length > 0 || edges.length > 0)) {
            const timeout = setTimeout(() => {
                saveFlowchart(currentProject.id, nodes, edges)
            }, 500)
            return () => clearTimeout(timeout)
        }
    }, [nodes, edges, currentProject?.id, saveFlowchart, currentProject])

    const onConnect = useCallback(
        (params: Connection) => {
            takeSnapshot()
            setEdges((eds) => addEdge({
                ...params,
                type: 'smoothstep',
                animated: true,
                style: { stroke: '#6366f1', strokeWidth: 2 },
            }, eds))
        },
        [setEdges, takeSnapshot]
    )

    const addNode = useCallback((type: NodeType, label: string) => {
        takeSnapshot()
        const newNode: Node = {
            id: getNodeId(),
            type,
            position: {
                x: Math.random() * 300 + 100,
                y: Math.random() * 200 + 100
            },
            data: { label },
        }
        setNodes((nds) => [...nds, newNode])
    },
        [setNodes, takeSnapshot]
    )

    const onDrop = useCallback(
        (event: React.DragEvent) => {
            event.preventDefault()

            const data = event.dataTransfer.getData('application/reactflow')
            if (!data || !reactFlowWrapper.current) return

            const { type, label } = JSON.parse(data)
            const bounds = reactFlowWrapper.current.getBoundingClientRect()

            const newNode: Node = {
                id: getNodeId(),
                type,
                position: {
                    x: event.clientX - bounds.left - 70,
                    y: event.clientY - bounds.top - 25,
                },
                data: { label },
            }

            takeSnapshot()
            setNodes((nds) => [...nds, newNode])
        },
        [setNodes, takeSnapshot]
    )

    const onDragOver = useCallback((event: React.DragEvent) => {
        event.preventDefault()
        event.dataTransfer.dropEffect = 'move'
    }, [])

    const clearCanvas = useCallback(() => {
        setNodes([])
        setEdges([])
    }, [setNodes, setEdges])

    // Handle node selection
    const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
        setSelectedNodeId(node.id)
    }, [])

    // Handle double click for inline editing
    const onNodeDoubleClick = useCallback((_: React.MouseEvent, node: Node) => {
        setEditingNodeId(node.id)
        setEditLabel((node.data as { label?: string })?.label || '')
    }, [])

    // Update node label
    const handleLabelSave = useCallback(() => {
        if (editingNodeId && editLabel.trim()) {
            takeSnapshot()
            setNodes((nds) =>
                nds.map((n) =>
                    n.id === editingNodeId
                        ? { ...n, data: { ...n.data, label: editLabel.trim() } }
                        : n
                )
            )
        }
        setEditingNodeId(null)
        setEditLabel('')
    }, [editingNodeId, editLabel, setNodes, takeSnapshot])

    // Auto-layout function
    const autoLayout = useCallback(() => {
        takeSnapshot()
        const layoutedNodes = nodes.map((node, index) => ({
            ...node,
            position: {
                x: 100 + (index % 3) * 200,
                y: 100 + Math.floor(index / 3) * 150,
            },
        }))
        setNodes(layoutedNodes)
        setTimeout(() => {
            reactFlowInstance.current?.fitView({ padding: 0.2 })
        }, 100)
    }, [nodes, setNodes, takeSnapshot])

    // Zoom controls
    const zoomIn = useCallback(() => {
        reactFlowInstance.current?.zoomIn()
    }, [])

    const zoomOut = useCallback(() => {
        reactFlowInstance.current?.zoomOut()
    }, [])

    const fitView = useCallback(() => {
        reactFlowInstance.current?.fitView({ padding: 0.2 })
    }, [])

    // Select all nodes
    const selectAll = useCallback(() => {
        setNodes((nds) => nds.map((n) => ({ ...n, selected: true })))
        setEdges((eds) => eds.map((e) => ({ ...e, selected: true })))
    }, [setNodes, setEdges])

    // Delete selected nodes and edges
    const deleteSelected = useCallback(() => {
        const hasSelection = nodes.some(n => n.selected) || edges.some(e => e.selected)
        if (!hasSelection) return

        takeSnapshot()
        setNodes((nds) => nds.filter((n) => !n.selected))
        setEdges((eds) => eds.filter((e) => !e.selected))
    }, [setNodes, setEdges, nodes, edges, takeSnapshot])

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Don't handle if typing in input
            if (document.activeElement?.tagName === 'INPUT') return

            // Ctrl+A = Select All
            if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
                e.preventDefault()
                selectAll()
            }

            // Tool Shortcuts
            if (e.key === 'v') setActiveTool('select')
            if (e.key === 'h') setActiveTool('hand')

            // Undo/Redo Shortcuts
            if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
                e.preventDefault()
                if (e.shiftKey) {
                    redo()
                } else {
                    undo()
                }
            }
            if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
                e.preventDefault()
                redo()
            }

            // Delete/Backspace = Delete selected
            if (e.key === 'Delete' || e.key === 'Backspace') {
                deleteSelected()
            }

            // Escape = Deselect all
            if (e.key === 'Escape') {
                setNodes((nds) => nds.map((n) => ({ ...n, selected: false })))
                setEdges((eds) => eds.map((e) => ({ ...e, selected: false })))
                setEditingNodeId(null)
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [selectAll, deleteSelected, setNodes, setEdges, undo, redo])

    const handleEdgeStyleChange = useCallback((style: 'solid' | 'dashed', hasArrow: boolean) => {
        takeSnapshot()

        const strokeDasharray = style === 'dashed' ? '5 5' : undefined
        const markerEnd = hasArrow ? { type: MarkerType.ArrowClosed } : undefined

        setEdges((eds) =>
            eds.map((e) => {
                if (e.selected) {
                    return {
                        ...e,
                        animated: false, // Disable default animation to allow style changes
                        style: {
                            ...e.style,
                            strokeDasharray,
                        },
                        markerEnd,
                    }
                }
                return e
            })
        )
    }, [setEdges, takeSnapshot])

    if (!currentProject) {
        return (
            <div className="h-full flex items-center justify-center">
                <p className="text-[#a1a1aa]">Please select a project first</p>
            </div>
        )
    }

    return (
        <div className="h-full flex">
            <NodePalette onAddNode={addNode} />

            <div className="flex-1 flex flex-col">
                <FlowchartToolbar
                    nodes={nodes}
                    edges={edges}
                    onClear={clearCanvas}
                    onAutoLayout={autoLayout}
                    onSelectAll={selectAll}
                    activeTool={activeTool}
                    onToolChange={setActiveTool}
                    onUndo={undo}
                    onRedo={redo}
                    canUndo={canUndo}
                    canRedo={canRedo}
                    onEdgeStyleChange={handleEdgeStyleChange}
                />

                <div ref={reactFlowWrapper} className="flex-1">
                    <ReactFlow
                        nodes={nodes}
                        edges={edges}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        onConnect={onConnect}
                        onDrop={onDrop}
                        onDragOver={onDragOver}
                        onNodeClick={onNodeClick}
                        onNodeDoubleClick={onNodeDoubleClick}
                        onInit={(instance) => { reactFlowInstance.current = instance }}
                        nodeTypes={nodeTypes}
                        fitView
                        className="bg-[#0f0f0f]"
                        minZoom={0.1}
                        maxZoom={4}
                        selectionOnDrag={activeTool === 'select'}
                        panOnDrag={activeTool === 'hand' || [1, 2]}
                        selectionMode={1 as any}
                        panActivationKeyCode="Space"
                        style={{ cursor: activeTool === 'hand' ? 'grab' : 'default' }}
                        defaultEdgeOptions={{
                            type: 'smoothstep',
                            style: { stroke: '#6366f1', strokeWidth: 2 },
                            animated: true,
                            interactionWidth: 20, // Easier to click
                        }}
                    >
                        <Controls
                            showZoom={false}
                            showFitView={false}
                            showInteractive={false}
                            className="!bg-[#1a1a1a] !border-[#2a2a2a] !rounded-lg"
                        />

                        {/* Custom zoom controls */}
                        <Panel position="bottom-left" className="flex gap-1 bg-[#1a1a1a] p-1 rounded-lg border border-[#2a2a2a]">
                            <button
                                onClick={zoomIn}
                                className="p-2 hover:bg-[#252525] rounded text-white transition-colors"
                                title="Zoom In"
                            >
                                <ZoomIn size={16} />
                            </button>
                            <button
                                onClick={zoomOut}
                                className="p-2 hover:bg-[#252525] rounded text-white transition-colors"
                                title="Zoom Out"
                            >
                                <ZoomOut size={16} />
                            </button>
                            <button
                                onClick={fitView}
                                className="p-2 hover:bg-[#252525] rounded text-white transition-colors"
                                title="Fit View"
                            >
                                <Maximize2 size={16} />
                            </button>
                        </Panel>

                        {/* MiniMap */}
                        <MiniMap
                            nodeColor={(node) => {
                                switch (node.type) {
                                    case 'terminator': return '#22c55e'
                                    case 'process': return '#3b82f6'
                                    case 'decision': return '#f59e0b'
                                    case 'data': return '#8b5cf6'
                                    case 'document': return '#ec4899'
                                    case 'predefined': return '#06b6d4'
                                    case 'connector': return '#64748b'
                                    case 'database': return '#10b981'
                                    case 'api': return '#f97316'
                                    default: return '#6366f1'
                                }
                            }}
                            maskColor="rgba(0, 0, 0, 0.8)"
                            className="!bg-[#1a1a1a] !border-[#2a2a2a] !rounded-lg"
                            style={{ width: 150, height: 100 }}
                        />

                        <Background
                            variant={BackgroundVariant.Dots}
                            gap={20}
                            size={1}
                            color="#2a2a2a"
                        />

                        {/* Inline edit panel */}
                        {editingNodeId && (
                            <Panel position="top-center" className="bg-[#1a1a1a] p-3 rounded-lg border border-[#2a2a2a] shadow-xl">
                                <div className="flex items-center gap-2">
                                    <input
                                        type="text"
                                        value={editLabel}
                                        onChange={(e) => setEditLabel(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') handleLabelSave()
                                            if (e.key === 'Escape') setEditingNodeId(null)
                                        }}
                                        autoFocus
                                        className="bg-[#252525] border border-[#3a3a3a] rounded px-3 py-1.5 text-white text-sm w-48 focus:border-[#6366f1] focus:outline-none"
                                        placeholder="Node label"
                                    />
                                    <button
                                        onClick={handleLabelSave}
                                        className="bg-[#6366f1] hover:bg-[#4f46e5] text-white px-3 py-1.5 rounded text-sm font-medium transition-colors"
                                    >
                                        Save
                                    </button>
                                    <button
                                        onClick={() => setEditingNodeId(null)}
                                        className="text-[#a1a1aa] hover:text-white px-2 py-1.5 text-sm transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </Panel>
                        )}
                    </ReactFlow>
                </div>
            </div>
        </div>
    )
}
