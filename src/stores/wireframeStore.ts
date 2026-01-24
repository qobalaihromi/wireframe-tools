import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type ShapeType = 'rect' | 'circle' | 'text' | 'button' | 'input' | 'card' | 'line' | 'arrow' | 'group' | 'frame' | 'path'

export interface LayoutConfig {
    type: 'none' | 'vertical' | 'horizontal'
    gap: number
    padding: number
    align: 'start' | 'center' | 'end' | 'space-between'
}

export interface WireframeNode {
    id: string
    type: ShapeType
    name: string
    x: number
    y: number
    width: number
    height: number
    rotation: number
    opacity: number
    visible: boolean
    locked: boolean

    // Style Props
    fill?: string
    stroke?: string
    strokeWidth?: number
    borderRadius?: number

    // Text Props
    text?: string
    fontSize?: number
    fontFamily?: string
    textAlign?: 'left' | 'center' | 'right'

    // Line/Arrow/Path Props
    points?: number[]
    closed?: boolean // For closed paths

    // Group/Frame Props
    children?: WireframeNode[]
    collapsed?: boolean
    layout?: LayoutConfig
}

export interface Artboard {
    id: string
    name: string
    width: number
    height: number
    x: number
    y: number
    fill: string
    layout?: LayoutConfig
    children: WireframeNode[] // Root level nodes
}

interface WireframeState {
    artboardsByProject: Record<string, Artboard[]>

    // Actions
    getArtboards: (projectId: string) => Artboard[]
    setArtboards: (projectId: string, artboards: Artboard[]) => void  // For undo/redo
    addArtboard: (projectId: string, name: string, x?: number, y?: number, width?: number, height?: number) => string
    deleteArtboard: (projectId: string, artboardId: string) => void
    updateArtboard: (projectId: string, artboardId: string, updates: Partial<Artboard>) => void
    updateArtboardPosition: (projectId: string, artboardId: string, x: number, y: number) => void

    // Node Actions (Recursive)
    addNode: (projectId: string, artboardId: string, node: WireframeNode, parentId?: string) => void
    updateNode: (projectId: string, artboardId: string, nodeId: string, updates: Partial<WireframeNode>) => void
    deleteNode: (projectId: string, artboardId: string, nodeId: string) => void
    groupNodes: (projectId: string, artboardId: string, nodeIds: string[]) => void
    ungroupNodes: (projectId: string, artboardId: string, groupId: string) => void
    moveNode: (projectId: string, artboardId: string, nodeId: string, targetParentId: string | null, targetIndex: number, updates?: Partial<WireframeNode>) => void
    alignNodes: (projectId: string, artboardId: string, nodeIds: string[], type: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') => void
    distributeNodes: (projectId: string, artboardId: string, nodeIds: string[], type: 'horizontal' | 'vertical') => void
    updateLayout: (projectId: string, artboardId: string, nodeId: string | null, layout: LayoutConfig) => void
    addGeneratedArtboard: (projectId: string, artboardData: any) => void
}

// Layout Engine Helper
const enforceLayout = (children: WireframeNode[], layout: LayoutConfig, parentWidth: number, parentHeight: number): WireframeNode[] => {
    if (layout.type === 'none') {
        return children
    }

    const sorted = [...children].sort((a, b) => {
        if (layout.type === 'horizontal') return a.x - b.x
        return a.y - b.y
    })

    let currentPos = layout.padding

    return sorted.map(child => {
        const updates: Partial<WireframeNode> = {}

        if (layout.type === 'vertical') {
            updates.y = currentPos
            currentPos += child.height + layout.gap

            // Horizontal Alignment for Vertical Layout
            if (layout.align === 'center') {
                updates.x = (parentWidth - child.width) / 2
            } else if (layout.align === 'end') {
                updates.x = parentWidth - child.width - layout.padding
            } else {
                updates.x = layout.padding
            }
        } else {
            // Horizontal
            updates.x = currentPos
            currentPos += child.width + layout.gap

            // Vertical Alignment for Horizontal Layout
            if (layout.align === 'center') {
                updates.y = (parentHeight - child.height) / 2
            } else if (layout.align === 'end') {
                updates.y = parentHeight - child.height - layout.padding
            } else {
                updates.y = layout.padding
            }
        }

        return { ...child, ...updates }
    })
}

// Helper to recursively find and update a node
const recursiveUpdate = (nodes: WireframeNode[], nodeId: string, updates: Partial<WireframeNode>): WireframeNode[] => {
    return nodes.map(node => {
        if (node.id === nodeId) {
            return { ...node, ...updates }
        }
        if (node.children) {
            return { ...node, children: recursiveUpdate(node.children, nodeId, updates) }
        }
        return node
    })
}

// Helper to recursively find and delete a node
const recursiveDelete = (nodes: WireframeNode[], nodeId: string): WireframeNode[] => {
    return nodes.filter(node => node.id !== nodeId).map(node => {
        if (node.children) {
            return { ...node, children: recursiveDelete(node.children, nodeId) }
        }
        return node
    })
}

// Helper to recursively find parent and add node
const recursiveAdd = (nodes: WireframeNode[], parentId: string, newNode: WireframeNode): WireframeNode[] => {
    return nodes.map(node => {
        if (node.id === parentId) {
            return { ...node, children: [...(node.children || []), newNode] }
        }
        if (node.children) {
            return { ...node, children: recursiveAdd(node.children, parentId, newNode) }
        }
        return node
    })
}

// Helper to find a node by ID
const findNode = (nodes: WireframeNode[], nodeId: string): WireframeNode | null => {
    for (const node of nodes) {
        if (node.id === nodeId) return node
        if (node.children) {
            const found = findNode(node.children, nodeId)
            if (found) return found
        }
    }
    return null
}

// Helper to flatten tree and find specific nodes
const findNodes = (nodes: WireframeNode[], nodeIds: string[]): WireframeNode[] => {
    let found: WireframeNode[] = []
    nodes.forEach(node => {
        if (nodeIds.includes(node.id)) {
            found.push(node)
        }
        if (node.children) {
            found = found.concat(findNodes(node.children, nodeIds))
        }
    })
    return found
}

// Helper to remove multiple nodes
const recursiveDeleteMultiple = (nodes: WireframeNode[], nodeIds: string[]): WireframeNode[] => {
    return nodes.filter(node => !nodeIds.includes(node.id)).map(node => {
        if (node.children) {
            return { ...node, children: recursiveDeleteMultiple(node.children, nodeIds) }
        }
        return node
    })
}

// Helper to insert node at specific index in parent
const recursiveInsert = (nodes: WireframeNode[], parentId: string, newNode: WireframeNode, index: number): WireframeNode[] => {
    return nodes.map(node => {
        if (node.id === parentId) {
            const newChildren = [...(node.children || [])]
            const insertIndex = index < 0 ? newChildren.length : Math.min(index, newChildren.length)
            newChildren.splice(insertIndex, 0, newNode)
            return { ...node, children: newChildren }
        }
        if (node.children) {
            return { ...node, children: recursiveInsert(node.children, parentId, newNode, index) }
        }
        return node
    })
}

export const useWireframeStore = create<WireframeState>()(
    persist(
        (set, get) => ({
            artboardsByProject: {},

            getArtboards: (projectId) => {
                return get().artboardsByProject[projectId] || []
            },

            // Set artboards directly (for undo/redo)
            setArtboards: (projectId, artboards) => {
                set((state) => ({
                    artboardsByProject: {
                        ...state.artboardsByProject,
                        [projectId]: artboards,
                    },
                }))
            },

            addArtboard: (projectId, name, x, y, width, height) => {
                const id = `artboard_${Date.now()}`
                const existingArtboards = get().artboardsByProject[projectId] || []

                const lastArtboard = existingArtboards[existingArtboards.length - 1]
                const defaultX = lastArtboard ? lastArtboard.x + lastArtboard.width + 100 : 0
                const defaultY = 0

                const newArtboard: Artboard = {
                    id,
                    name,
                    width: width ?? 375,
                    height: height ?? 667,
                    x: x ?? defaultX,
                    y: y ?? defaultY,
                    fill: '#ffffff',
                    children: [],
                }
                set((state) => ({
                    artboardsByProject: {
                        ...state.artboardsByProject,
                        [projectId]: [...(state.artboardsByProject[projectId] || []), newArtboard],
                    },
                }))
                return id
            },

            deleteArtboard: (projectId, artboardId) => {
                set((state) => ({
                    artboardsByProject: {
                        ...state.artboardsByProject,
                        [projectId]: (state.artboardsByProject[projectId] || []).filter(
                            (a) => a.id !== artboardId
                        ),
                    },
                }))
            },

            updateArtboard: (projectId, artboardId, updates) => {
                set((state) => ({
                    artboardsByProject: {
                        ...state.artboardsByProject,
                        [projectId]: (state.artboardsByProject[projectId] || []).map((a) =>
                            a.id === artboardId ? { ...a, ...updates } : a
                        ),
                    },
                }))
            },

            updateArtboardPosition: (projectId, artboardId, x, y) => {
                set((state) => ({
                    artboardsByProject: {
                        ...state.artboardsByProject,
                        [projectId]: (state.artboardsByProject[projectId] || []).map((a) =>
                            a.id === artboardId ? { ...a, x, y } : a
                        ),
                    },
                }))
            },

            addNode: (projectId, artboardId, node, parentId) => {
                set((state) => {
                    const projectArtboards = state.artboardsByProject[projectId] || []
                    return {
                        artboardsByProject: {
                            ...state.artboardsByProject,
                            [projectId]: projectArtboards.map((artboard) => {
                                if (artboard.id !== artboardId) return artboard

                                // If no parentId, add to root children
                                if (!parentId) {
                                    return {
                                        ...artboard,
                                        children: [...artboard.children, node],
                                    }
                                }

                                // Otherwise recursive add
                                const recursiveAddWithLayout = (nodes: WireframeNode[], targetId: string, newNode: WireframeNode): WireframeNode[] => {
                                    return nodes.map(n => {
                                        if (n.id === targetId) {
                                            const updatedChildren = [...(n.children || []), newNode]
                                            // Trigger Auto Layout if enabled
                                            if (n.layout && n.layout.type !== 'none') {
                                                return {
                                                    ...n,
                                                    children: enforceLayout(updatedChildren, n.layout, n.width, n.height)
                                                }
                                            }
                                            return { ...n, children: updatedChildren }
                                        }
                                        if (n.children) {
                                            return { ...n, children: recursiveAddWithLayout(n.children, targetId, newNode) }
                                        }
                                        return n
                                    })
                                }

                                return {
                                    ...artboard,
                                    children: recursiveAddWithLayout(artboard.children, parentId, node),
                                }
                            }),
                        },
                    }
                })
            },

            updateNode: (projectId, artboardId, nodeId, updates) => {
                set((state) => {
                    const projectArtboards = state.artboardsByProject[projectId] || []
                    return {
                        artboardsByProject: {
                            ...state.artboardsByProject,
                            [projectId]: projectArtboards.map((artboard) => {
                                if (artboard.id !== artboardId) return artboard
                                return {
                                    ...artboard,
                                    children: recursiveUpdate(artboard.children, nodeId, updates),
                                }
                            }),
                        },
                    }
                })
            },

            deleteNode: (projectId, artboardId, nodeId) => {
                set((state) => {
                    const projectArtboards = state.artboardsByProject[projectId] || []
                    return {
                        artboardsByProject: {
                            ...state.artboardsByProject,
                            [projectId]: projectArtboards.map((artboard) => {
                                if (artboard.id !== artboardId) return artboard

                                const recursiveDeleteWithLayout = (nodes: WireframeNode[]): WireframeNode[] => {
                                    // Check valid children first
                                    const filtered = nodes.filter(n => n.id !== nodeId)

                                    // If we filtered something out (meaning this list was the parent's children list and contained the target)
                                    // But wait, we act on the parent.
                                    // This structure is: map((node) => ... return new node)
                                    // So we need to check if ANY child was removed from THIS node's children.

                                    return filtered.map(node => {
                                        if (node.children) {
                                            const oldChildCount = node.children.length
                                            const newChildren = recursiveDeleteWithLayout(node.children)

                                            // If child count changed, it means we deleted something from this group
                                            if (newChildren.length !== oldChildCount && node.layout && node.layout.type !== 'none') {
                                                return {
                                                    ...node,
                                                    children: enforceLayout(newChildren, node.layout, node.width, node.height)
                                                }
                                            }
                                            return { ...node, children: newChildren }
                                        }
                                        return node
                                    })
                                }

                                // Process root children (if artboard has layout)
                                const newChildren = recursiveDeleteWithLayout(artboard.children)
                                // If deleted from root
                                if (artboard.children.length !== newChildren.length && artboard.layout && artboard.layout.type !== 'none') {
                                    return {
                                        ...artboard,
                                        children: enforceLayout(newChildren, artboard.layout, artboard.width, artboard.height)
                                    }
                                }

                                return {
                                    ...artboard,
                                    children: newChildren,
                                }
                            }),
                        },
                    }
                })
            },

            groupNodes: (projectId, artboardId, nodeIds) => {
                if (nodeIds.length < 1) return

                set((state) => {
                    const projectArtboards = state.artboardsByProject[projectId] || []
                    return {
                        artboardsByProject: {
                            ...state.artboardsByProject,
                            [projectId]: projectArtboards.map((artboard) => {
                                if (artboard.id !== artboardId) return artboard

                                const nodesToGroup = findNodes(artboard.children, nodeIds)
                                if (nodesToGroup.length === 0) return artboard

                                const minX = Math.min(...nodesToGroup.map(n => n.x))
                                const minY = Math.min(...nodesToGroup.map(n => n.y))
                                const maxX = Math.max(...nodesToGroup.map(n => n.x + n.width))
                                const maxY = Math.max(...nodesToGroup.map(n => n.y + n.height))

                                const groupX = minX
                                const groupY = minY
                                const groupWidth = maxX - minX
                                const groupHeight = maxY - minY

                                const groupId = `group_${Date.now()}`
                                const groupNode: WireframeNode = {
                                    id: groupId,
                                    type: 'group',
                                    name: 'Group',
                                    x: groupX,
                                    y: groupY,
                                    width: groupWidth,
                                    height: groupHeight,
                                    rotation: 0,
                                    opacity: 1,
                                    visible: true,
                                    locked: false,
                                    children: nodesToGroup.map(node => ({
                                        ...node,
                                        x: node.x - groupX,
                                        y: node.y - groupY
                                    }))
                                }

                                const cleanedChildren = recursiveDeleteMultiple(artboard.children, nodeIds)

                                return {
                                    ...artboard,
                                    children: [...cleanedChildren, groupNode]
                                }
                            }),
                        }
                    }
                })
            },

            ungroupNodes: (projectId, artboardId, groupId) => {
                set((state) => {
                    const projectArtboards = state.artboardsByProject[projectId] || []
                    return {
                        artboardsByProject: {
                            ...state.artboardsByProject,
                            [projectId]: projectArtboards.map((artboard) => {
                                if (artboard.id !== artboardId) return artboard

                                const recursiveUngroupHelper = (nodes: WireframeNode[], targetGroupId: string): WireframeNode[] => {
                                    return nodes.flatMap(node => {
                                        if (node.id === targetGroupId && node.children) {
                                            return node.children.map(child => ({
                                                ...child,
                                                x: child.x + node.x,
                                                y: child.y + node.y
                                            }))
                                        }
                                        if (node.children) {
                                            return [{ ...node, children: recursiveUngroupHelper(node.children, targetGroupId) }]
                                        }
                                        return [node]
                                    })
                                }

                                return {
                                    ...artboard,
                                    children: recursiveUngroupHelper(artboard.children, groupId)
                                }
                            }),
                        }
                    }
                })
            },

            moveNode: (projectId, artboardId, nodeId, targetParentId, targetIndex, updates) => {
                set((state) => {
                    const projectArtboards = state.artboardsByProject[projectId] || []
                    return {
                        artboardsByProject: {
                            ...state.artboardsByProject,
                            [projectId]: projectArtboards.map((artboard) => {
                                if (artboard.id !== artboardId) return artboard

                                // 1. Find the node (deep clone needed to safely remove and reinsert)
                                const nodeToMove = findNode(artboard.children, nodeId)
                                if (!nodeToMove) return artboard

                                // 2. Remove from old location
                                const childrenWithoutNode = recursiveDelete(artboard.children, nodeId)

                                // 3. Prepare node with updates
                                const updatedNode = updates ? { ...nodeToMove, ...updates } : nodeToMove

                                // 4. Insert into new location
                                let newChildren = childrenWithoutNode



                                // Helper to insert and re-layout
                                const recursiveInsertWithLayout = (nodes: WireframeNode[], targetId: string, newNode: WireframeNode, idx: number): WireframeNode[] => {
                                    return nodes.map(n => {
                                        if (n.id === targetId) {
                                            const nextChildren = [...(n.children || [])]
                                            const insertIndex = idx < 0 ? nextChildren.length : Math.min(idx, nextChildren.length)
                                            nextChildren.splice(insertIndex, 0, newNode)

                                            // Apply Auto Layout
                                            if (n.layout && n.layout.type !== 'none') {
                                                return {
                                                    ...n,
                                                    children: enforceLayout(nextChildren, n.layout, n.width, n.height)
                                                }
                                            }
                                            return { ...n, children: nextChildren }
                                        }
                                        if (n.children) {
                                            return { ...n, children: recursiveInsertWithLayout(n.children, targetId, newNode, idx) }
                                        }
                                        return n
                                    })
                                }

                                // Since recursiveDelete returns a new tree, we use THAT tree to insert
                                // However, if inserting into Root:
                                if (!targetParentId) {
                                    const insertIndex = targetIndex < 0 ? newChildren.length : Math.min(targetIndex, newChildren.length)
                                    newChildren.splice(insertIndex, 0, updatedNode)
                                    // Root Artboard Auto Layout? Artboard interface has 'layout' too.
                                    if (artboard.layout && artboard.layout.type !== 'none') {
                                        newChildren = enforceLayout(newChildren, artboard.layout, artboard.width, artboard.height)
                                    }
                                } else {
                                    // Insert into target parent
                                    newChildren = recursiveInsertWithLayout(childrenWithoutNode, targetParentId, updatedNode, targetIndex)
                                }

                                return {
                                    ...artboard,
                                    children: newChildren
                                }
                            }),
                        }
                    }
                })
            },

            alignNodes: (projectId, artboardId, nodeIds, type) =>
                set((state) => {
                    const artboards = state.artboardsByProject[projectId]
                    if (!artboards) return state

                    const newArtboards = artboards.map(artboard => {
                        if (artboard.id !== artboardId) return artboard

                        // Find nodes that need alignment
                        // Simplification: We only support alignment for top-level nodes for now
                        const nodesToAlign = artboard.children.filter(n => nodeIds.includes(n.id))
                        if (nodesToAlign.length < 1) return artboard

                        // Calculate Selection Bounding Box
                        let minX = Infinity, minY = Infinity
                        let maxX = -Infinity, maxY = -Infinity

                        nodesToAlign.forEach(node => {
                            minX = Math.min(minX, node.x)
                            minY = Math.min(minY, node.y)
                            maxX = Math.max(maxX, node.x + node.width)
                            maxY = Math.max(maxY, node.y + node.height)
                        })

                        // Midpoints of selection
                        const midX = minX + (maxX - minX) / 2
                        const midY = minY + (maxY - minY) / 2

                        // Map updates
                        const alignedChildren = artboard.children.map(node => {
                            if (!nodeIds.includes(node.id)) return node

                            const updates: Partial<WireframeNode> = {}

                            switch (type) {
                                case 'left': updates.x = minX; break
                                case 'center': updates.x = midX - (node.width / 2); break
                                case 'right': updates.x = maxX - node.width; break
                                case 'top': updates.y = minY; break
                                case 'middle': updates.y = midY - (node.height / 2); break
                                case 'bottom': updates.y = maxY - node.height; break
                            }

                            return { ...node, ...updates }
                        })

                        return { ...artboard, children: alignedChildren }
                    })

                    return { ...state, artboardsByProject: { ...state.artboardsByProject, [projectId]: newArtboards } }
                }),

            distributeNodes: (projectId, artboardId, nodeIds, type) =>
                set((state) => {
                    const artboards = state.artboardsByProject[projectId]
                    if (!artboards) return state

                    const newArtboards = artboards.map(artboard => {
                        if (artboard.id !== artboardId) return artboard

                        // Only top-level supported
                        const nodesToDistribute = artboard.children.filter(n => nodeIds.includes(n.id))
                        if (nodesToDistribute.length < 3) return artboard // Need at least 3 to distribute evenly between outer bounds

                        // Sort nodes
                        const sortedNodes = [...nodesToDistribute].sort((a, b) =>
                            type === 'horizontal' ? a.x - b.x : a.y - b.y
                        )

                        // Calculate bounds
                        const first = sortedNodes[0]
                        const last = sortedNodes[sortedNodes.length - 1]

                        if (type === 'horizontal') {
                            const minX = first.x
                            const maxRight = last.x + last.width
                            const totalWidthOfNodes = sortedNodes.reduce((sum, n) => sum + n.width, 0)
                            const totalGapSpace = (maxRight - minX) - totalWidthOfNodes
                            const gap = totalGapSpace / (sortedNodes.length - 1)

                            let currentX = minX
                            const newPositions: Record<string, number> = {}
                            sortedNodes.forEach((node, i) => {
                                if (i === 0) {
                                    newPositions[node.id] = node.x
                                    currentX += node.width + gap
                                } else {
                                    newPositions[node.id] = currentX
                                    currentX += node.width + gap
                                }
                            })

                            return {
                                ...artboard,
                                children: artboard.children.map(node =>
                                    newPositions[node.id] !== undefined
                                        ? { ...node, x: newPositions[node.id] }
                                        : node
                                )
                            }
                        } else {
                            // Vertical
                            const minY = first.y
                            const maxBottom = last.y + last.height
                            const totalHeightOfNodes = sortedNodes.reduce((sum, n) => sum + n.height, 0)
                            const totalGapSpace = (maxBottom - minY) - totalHeightOfNodes
                            const gap = totalGapSpace / (sortedNodes.length - 1)

                            let currentY = minY
                            const newPositions: Record<string, number> = {}

                            sortedNodes.forEach((node, i) => {
                                if (i === 0) {
                                    newPositions[node.id] = node.y
                                    currentY += node.height + gap
                                } else {
                                    newPositions[node.id] = currentY
                                    currentY += node.height + gap
                                }
                            })

                            return {
                                ...artboard,
                                children: artboard.children.map(node =>
                                    newPositions[node.id] !== undefined
                                        ? { ...node, y: newPositions[node.id] }
                                        : node
                                )
                            }
                        }
                    })

                    return { ...state, artboardsByProject: { ...state.artboardsByProject, [projectId]: newArtboards } }
                }),

            updateLayout: (projectId, artboardId, nodeId, layout) => {
                set((state) => {
                    const artboards = state.artboardsByProject[projectId] || []
                    return {
                        artboardsByProject: {
                            ...state.artboardsByProject,
                            [projectId]: artboards.map(artboard => {
                                if (artboard.id !== artboardId) return artboard

                                // Case 1: Updating Artboard Layout
                                if (!nodeId) {
                                    const newChildren = enforceLayout(artboard.children, layout, artboard.width, artboard.height)
                                    return {
                                        ...artboard,
                                        layout,
                                        children: newChildren
                                    }
                                }

                                // Case 2: Updating Group Layout (Recursive helper needed)
                                const recursiveUpdateLayout = (nodes: WireframeNode[]): WireframeNode[] => {
                                    return nodes.map(node => {
                                        if (node.id === nodeId) {
                                            // Found the group
                                            if (!node.children) return { ...node, layout }
                                            const newChildren = enforceLayout(node.children, layout, node.width, node.height)
                                            return { ...node, layout, children: newChildren }
                                        }
                                        if (node.children) {
                                            return { ...node, children: recursiveUpdateLayout(node.children) }
                                        }
                                        return node
                                    })
                                }

                                return {
                                    ...artboard,
                                    children: recursiveUpdateLayout(artboard.children)
                                }
                            })
                        }
                    }
                })
            },

            addGeneratedArtboard: (projectId, artboardData) => {
                const id = `artboard_${Date.now()}`
                const existingArtboards = get().artboardsByProject[projectId] || []
                const lastArtboard = existingArtboards[existingArtboards.length - 1]
                const defaultX = lastArtboard ? lastArtboard.x + lastArtboard.width + 100 : 0

                // Recursive helper to parse AI nodes
                const parseNodes = (nodes: any[], parentId: string | null = null): WireframeNode[] => {
                    return nodes.map((shape, index) => {
                        const nodeId = `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

                        let children: WireframeNode[] = []
                        if (shape.children && shape.children.length > 0) {
                            children = parseNodes(shape.children, nodeId)
                        }

                        // Parse Layout Config if present
                        let layout: LayoutConfig | undefined = undefined
                        if (shape.layout) {
                            layout = {
                                type: shape.layout.type || 'none',
                                gap: shape.layout.gap || 0,
                                padding: shape.layout.padding || 0,
                                align: shape.layout.align || 'start'
                            }
                        }

                        const node: WireframeNode = {
                            id: nodeId,
                            type: shape.type,
                            name: shape.name || shape.text || shape.type,
                            x: shape.x || 0,
                            y: shape.y || 0,
                            width: shape.width || 100,
                            height: shape.height || 100,
                            rotation: 0,
                            opacity: 1,
                            visible: true,
                            locked: false,
                            fill: shape.fill || '#e5e7eb',
                            text: shape.text,
                            fontSize: shape.fontSize || 16,
                            textAlign: 'center',
                            children: children,
                            layout: layout
                        }

                        // Pre-calculate layout for children if this node has a layout
                        // This assumes AI gives us width/height but not X/Y for children in flex
                        if (layout && layout.type !== 'none' && children.length > 0) {
                            const laidOutChildren = enforceLayout(children, layout, node.width, node.height)
                            node.children = laidOutChildren
                        }

                        return node
                    })
                }

                // Parse root children
                const children = parseNodes(artboardData.shapes || [])

                const newArtboard: Artboard = {
                    id,
                    name: artboardData.artboardName || 'AI Design',
                    width: artboardData.width || 375,
                    height: artboardData.height || 812,
                    x: defaultX,
                    y: 0,
                    fill: '#ffffff',
                    children
                }

                set((state) => ({
                    artboardsByProject: {
                        ...state.artboardsByProject,
                        [projectId]: [...(state.artboardsByProject[projectId] || []), newArtboard],
                    },
                }))
            }


        }),
        {
            name: 'wireframe-tools-wireframe-v2',
        }
    )
)
