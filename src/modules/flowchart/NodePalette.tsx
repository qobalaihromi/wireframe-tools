import { Circle, Square, Diamond, FileText, Database, Cloud, GitBranch, ArrowRightLeft } from 'lucide-react'
import type { NodeType } from './CustomNodes'

interface NodePaletteItem {
    type: NodeType
    label: string
    icon: typeof Square
    color: string
    description: string
}

const standardNodes: NodePaletteItem[] = [
    { type: 'terminator', label: 'Start/End', icon: Circle, color: '#22c55e', description: 'Oval - Begin/End flow' },
    { type: 'process', label: 'Process', icon: Square, color: '#3b82f6', description: 'Rectangle - Action step' },
    { type: 'decision', label: 'Decision', icon: Diamond, color: '#f59e0b', description: 'Diamond - Yes/No branch' },
    { type: 'data', label: 'Data I/O', icon: ArrowRightLeft, color: '#8b5cf6', description: 'Parallelogram - Input/Output' },
    { type: 'document', label: 'Document', icon: FileText, color: '#ec4899', description: 'Wavy - Document output' },
    { type: 'predefined', label: 'Subprocess', icon: GitBranch, color: '#06b6d4', description: 'Double-line - Call subprocess' },
    { type: 'connector', label: 'Connector', icon: Circle, color: '#64748b', description: 'Circle - Flow connector' },
]

const softwareNodes: NodePaletteItem[] = [
    { type: 'database', label: 'Database', icon: Database, color: '#10b981', description: 'Cylinder - Data storage' },
    { type: 'api', label: 'API/Service', icon: Cloud, color: '#f97316', description: 'Cloud - External service' },
]

interface NodePaletteProps {
    onAddNode: (type: NodeType, label: string) => void
}

export function NodePalette({ onAddNode }: NodePaletteProps) {
    const handleDragStart = (event: React.DragEvent, type: NodeType, label: string) => {
        event.dataTransfer.setData('application/reactflow', JSON.stringify({ type, label }))
        event.dataTransfer.effectAllowed = 'move'
    }

    const renderNodeButton = (item: NodePaletteItem) => {
        const Icon = item.icon
        return (
            <button
                key={item.type}
                onClick={() => onAddNode(item.type, item.label)}
                draggable
                onDragStart={(e) => handleDragStart(e, item.type, item.label)}
                className="flex items-center gap-3 w-full p-2.5 rounded-lg bg-[#252525] border border-[#2a2a2a] hover:border-[#3a3a3a] hover:bg-[#2a2a2a] transition-all cursor-grab active:cursor-grabbing group"
                title={item.description}
            >
                <div
                    className="w-8 h-8 rounded flex items-center justify-center"
                    style={{ backgroundColor: `${item.color}20` }}
                >
                    <Icon size={16} style={{ color: item.color }} />
                </div>
                <div className="flex-1 text-left">
                    <div className="text-sm font-medium text-white">{item.label}</div>
                    <div className="text-[10px] text-[#6a6a6a] group-hover:text-[#a1a1aa] transition-colors">
                        {item.description}
                    </div>
                </div>
            </button>
        )
    }

    return (
        <div className="w-56 bg-[#1a1a1a] border-r border-[#2a2a2a] p-4 flex flex-col gap-4 overflow-y-auto">
            {/* Standard Flowchart Nodes */}
            <div>
                <h3 className="text-xs font-medium text-[#a1a1aa] uppercase tracking-wider mb-2">
                    Standard Flowchart
                </h3>
                <div className="space-y-1.5">
                    {standardNodes.map(renderNodeButton)}
                </div>
            </div>

            {/* Software-specific Nodes */}
            <div>
                <h3 className="text-xs font-medium text-[#a1a1aa] uppercase tracking-wider mb-2">
                    Software
                </h3>
                <div className="space-y-1.5">
                    {softwareNodes.map(renderNodeButton)}
                </div>
            </div>

            {/* Tips */}
            <div className="mt-auto pt-4 border-t border-[#2a2a2a]">
                <p className="text-xs text-[#6a6a6a]">
                    💡 Click to add • Drag into canvas • Double-click node to edit
                </p>
            </div>
        </div>
    )
}
