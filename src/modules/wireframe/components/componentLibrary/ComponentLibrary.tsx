import { useState } from 'react'
import {
    ChevronDown, ChevronRight, Search,
    Smartphone, Monitor, Layers,
    // Mobile icons
    Signal, Menu, LayoutGrid, TextCursor, Square, CheckSquare, ToggleRight, List, CreditCard, AlertCircle, PanelBottomOpen,
    // Desktop icons  
    PanelLeft, ChevronRight as ChevronRightIcon, ShoppingBag, TrendingUp, User, Table, Rows3, ArrowLeftRight,
    // Common icons
    Image, Smile, Minus, AlignLeft, Heading, Keyboard, Calculator, Calendar, PlusCircle, BarChart3, PieChart, Video, Sliders, ToggleLeft, MoreHorizontal, MousePointerClick, ListTree
} from 'lucide-react'
import {
    mobileComponents,
    desktopComponents,
    commonComponents,
    getSubcategories,
    type ComponentTemplate
} from './templates'
import type { WireframeNode } from '../../../../stores/wireframeStore'

// Icon mapping for component templates
const iconMap: Record<string, React.ComponentType<{ size?: number, className?: string }>> = {
    Signal, Menu, LayoutGrid, TextCursor, Square, CheckSquare, ToggleRight, List, CreditCard, AlertCircle, PanelBottomOpen,
    PanelLeft, ChevronRight: ChevronRightIcon, ShoppingBag, TrendingUp, User, Table, Rows3, ArrowLeftRight,
    Image, Smile, Minus, AlignLeft, Heading,
    Keyboard, Calculator, Calendar, PlusCircle, BarChart3, PieChart, Video, Sliders, ToggleLeft, MoreHorizontal, MousePointerClick, ListTree,
}

interface ComponentLibraryProps {
    onDragStart?: (template: ComponentTemplate) => void
    onAddComponent?: (nodes: WireframeNode[]) => void
}

export function ComponentLibrary({ onDragStart, onAddComponent }: ComponentLibraryProps) {
    const [activeTab, setActiveTab] = useState<'mobile' | 'desktop' | 'common'>('mobile')
    const [searchQuery, setSearchQuery] = useState('')
    const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['Navigation', 'Forms']))

    // Get components based on active tab
    const components = activeTab === 'mobile'
        ? mobileComponents
        : activeTab === 'desktop'
            ? desktopComponents
            : commonComponents

    // Filter by search
    const filteredComponents = searchQuery
        ? components.filter(c =>
            c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.description.toLowerCase().includes(searchQuery.toLowerCase())
        )
        : components

    // Group by subcategory
    const subcategories = getSubcategories(activeTab)
    const componentsBySubcategory = subcategories.reduce((acc, sub) => {
        acc[sub] = filteredComponents.filter(c => c.subcategory === sub)
        return acc
    }, {} as Record<string, ComponentTemplate[]>)

    const toggleCategory = (category: string) => {
        const newExpanded = new Set(expandedCategories)
        if (newExpanded.has(category)) {
            newExpanded.delete(category)
        } else {
            newExpanded.add(category)
        }
        setExpandedCategories(newExpanded)
    }

    // Generate unique IDs for nodes
    const generateNodesWithIds = (template: ComponentTemplate): WireframeNode[] => {
        const timestamp = Date.now()
        return template.nodes.map((node, index) => ({
            ...node,
            id: `${template.id}_${timestamp}_${index}`,
        })) as WireframeNode[]
    }

    const handleDragStart = (e: React.DragEvent, template: ComponentTemplate) => {
        // Store template data for drop handling
        e.dataTransfer.setData('application/json', JSON.stringify(template))
        e.dataTransfer.effectAllowed = 'copy'
        onDragStart?.(template)
    }

    const handleClick = (template: ComponentTemplate) => {
        const nodes = generateNodesWithIds(template)
        onAddComponent?.(nodes)
    }

    const renderIcon = (iconName: string) => {
        const IconComponent = iconMap[iconName]
        if (IconComponent) {
            return <IconComponent size={14} className="text-[#888]" />
        }
        return <Square size={14} className="text-[#888]" />
    }

    return (
        <div className="w-[260px] h-full bg-[#1a1a1a] border-r border-[#333] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="p-3 border-b border-[#333]">
                <h2 className="text-sm font-semibold text-white mb-2">Components</h2>

                {/* Search */}
                <div className="relative">
                    <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#666]" />
                    <input
                        type="text"
                        placeholder="Search components..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg pl-8 pr-3 py-2 text-sm text-white placeholder-[#666] focus:outline-none focus:border-[#6366f1]"
                    />
                </div>
            </div>

            {/* Tab Switcher */}
            <div className="flex border-b border-[#333]">
                <button
                    onClick={() => setActiveTab('mobile')}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition-all ${activeTab === 'mobile'
                        ? 'text-[#6366f1] border-b-2 border-[#6366f1] bg-[#6366f1]/10'
                        : 'text-[#888] hover:text-white'
                        }`}
                >
                    <Smartphone size={14} />
                    Mobile
                </button>
                <button
                    onClick={() => setActiveTab('desktop')}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition-all ${activeTab === 'desktop'
                        ? 'text-[#6366f1] border-b-2 border-[#6366f1] bg-[#6366f1]/10'
                        : 'text-[#888] hover:text-white'
                        }`}
                >
                    <Monitor size={14} />
                    Desktop
                </button>
                <button
                    onClick={() => setActiveTab('common')}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition-all ${activeTab === 'common'
                        ? 'text-[#6366f1] border-b-2 border-[#6366f1] bg-[#6366f1]/10'
                        : 'text-[#888] hover:text-white'
                        }`}
                >
                    <Layers size={14} />
                    Common
                </button>
            </div>

            {/* Component List */}
            <div className="flex-1 overflow-y-auto mb-20">
                {searchQuery && filteredComponents.length === 0 ? (
                    <div className="p-4 text-center text-[#666] text-sm">
                        No components found
                    </div>
                ) : (
                    subcategories.map(subcategory => {
                        const items = componentsBySubcategory[subcategory]
                        if (items.length === 0) return null

                        const isExpanded = expandedCategories.has(subcategory)

                        return (
                            <div key={subcategory} className="border-b border-[#333] last:border-b-0">
                                {/* Category Header */}
                                <button
                                    onClick={() => toggleCategory(subcategory)}
                                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-[#888] hover:text-white hover:bg-[#252525] transition-all"
                                >
                                    {isExpanded ? (
                                        <ChevronDown size={12} />
                                    ) : (
                                        <ChevronRight size={12} />
                                    )}
                                    {subcategory}
                                    <span className="text-[#555] ml-auto">{items.length}</span>
                                </button>

                                {/* Component Items */}
                                {isExpanded && (
                                    <div className="pb-2">
                                        {items.map(component => (
                                            <div
                                                key={component.id}
                                                draggable
                                                onDragStart={(e) => handleDragStart(e, component)}
                                                onClick={() => handleClick(component)}
                                                className="mx-2 mb-1 p-2 bg-[#252525] hover:bg-[#333] rounded-lg cursor-grab active:cursor-grabbing transition-all group border border-transparent hover:border-[#444]"
                                                title={component.description}
                                            >
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 bg-[#1a1a1a] rounded flex items-center justify-center">
                                                        {renderIcon(component.icon)}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="text-xs text-white truncate">
                                                            {component.name}
                                                        </div>
                                                        <div className="text-[10px] text-[#666] truncate">
                                                            {component.defaultWidth} × {component.defaultHeight}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )
                    })
                )}
            </div>

            {/* Footer Hint */}
            <div className="p-2 border-t border-[#333] bg-[#0a0a0a]">
                <p className="text-[10px] text-[#555] text-center">
                    Drag & drop to canvas, or click to add
                </p>
            </div>
        </div>
    )
}
