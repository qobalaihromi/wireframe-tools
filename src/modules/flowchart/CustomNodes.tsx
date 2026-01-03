import { Handle, Position, type NodeProps } from '@xyflow/react'

// Standard Flowchart + Software hybrid node types
export type NodeType =
    | 'terminator'    // Oval - Start/End
    | 'process'       // Rectangle - Action/Step
    | 'decision'      // Diamond - Yes/No branching
    | 'data'          // Parallelogram - Input/Output
    | 'document'      // Wavy bottom - Document
    | 'predefined'    // Double-lined - Subprocess
    | 'connector'     // Circle - Flow connector
    | 'database'      // Cylinder - Database (software)
    | 'api'           // Cloud - API/Service (software)

interface CustomNodeData extends Record<string, unknown> {
    label?: string
}

const nodeBaseStyle = "relative flex items-center justify-center text-center text-sm font-medium"

// Terminator (Oval) - Start/End
function TerminatorNode({ data }: NodeProps) {
    return (
        <div className={nodeBaseStyle}>
            <svg width="120" height="50" viewBox="0 0 120 50">
                <ellipse
                    cx="60" cy="25" rx="58" ry="23"
                    fill="#22c55e"
                    stroke="#16a34a"
                    strokeWidth="2"
                />
                <text x="60" y="30" textAnchor="middle" fill="white" fontSize="13" fontWeight="500">
                    {(data as CustomNodeData).label || 'Start/End'}
                </text>
            </svg>
            <Handle type="target" position={Position.Top} className="!bg-[#22c55e] !w-3 !h-3 !border-2 !border-white" />
            <Handle type="source" position={Position.Bottom} className="!bg-[#22c55e] !w-3 !h-3 !border-2 !border-white" />
        </div>
    )
}

// Process (Rectangle) - Action/Step
function ProcessNode({ data }: NodeProps) {
    return (
        <div className={nodeBaseStyle}>
            <svg width="140" height="60" viewBox="0 0 140 60">
                <rect
                    x="2" y="2" width="136" height="56" rx="4"
                    fill="#3b82f6"
                    stroke="#2563eb"
                    strokeWidth="2"
                />
                <text x="70" y="35" textAnchor="middle" fill="white" fontSize="13" fontWeight="500">
                    {(data as CustomNodeData).label || 'Process'}
                </text>
            </svg>
            <Handle type="target" position={Position.Top} className="!bg-[#3b82f6] !w-3 !h-3 !border-2 !border-white" />
            <Handle type="source" position={Position.Bottom} className="!bg-[#3b82f6] !w-3 !h-3 !border-2 !border-white" />
        </div>
    )
}

// Decision (Diamond) - Yes/No branching
function DecisionNode({ data }: NodeProps) {
    return (
        <div className={nodeBaseStyle}>
            <svg width="100" height="100" viewBox="0 0 100 100">
                <polygon
                    points="50,5 95,50 50,95 5,50"
                    fill="#f59e0b"
                    stroke="#d97706"
                    strokeWidth="2"
                />
                <text x="50" y="55" textAnchor="middle" fill="white" fontSize="12" fontWeight="500">
                    {(data as CustomNodeData).label || 'Decision?'}
                </text>
            </svg>
            <Handle type="target" position={Position.Top} className="!bg-[#f59e0b] !w-3 !h-3 !border-2 !border-white" />
            <Handle type="source" position={Position.Bottom} id="yes" className="!bg-[#22c55e] !w-3 !h-3 !border-2 !border-white" />
            <Handle type="source" position={Position.Right} id="no" className="!bg-[#ef4444] !w-3 !h-3 !border-2 !border-white" />
        </div>
    )
}

// Data (Parallelogram) - Input/Output
function DataNode({ data }: NodeProps) {
    return (
        <div className={nodeBaseStyle}>
            <svg width="140" height="60" viewBox="0 0 140 60">
                <polygon
                    points="20,2 138,2 120,58 2,58"
                    fill="#8b5cf6"
                    stroke="#7c3aed"
                    strokeWidth="2"
                />
                <text x="70" y="35" textAnchor="middle" fill="white" fontSize="13" fontWeight="500">
                    {(data as CustomNodeData).label || 'Data I/O'}
                </text>
            </svg>
            <Handle type="target" position={Position.Top} className="!bg-[#8b5cf6] !w-3 !h-3 !border-2 !border-white" />
            <Handle type="source" position={Position.Bottom} className="!bg-[#8b5cf6] !w-3 !h-3 !border-2 !border-white" />
        </div>
    )
}

// Document (Wavy bottom)
function DocumentNode({ data }: NodeProps) {
    return (
        <div className={nodeBaseStyle}>
            <svg width="120" height="70" viewBox="0 0 120 70">
                <path
                    d="M2,2 L118,2 L118,55 Q90,65 60,55 Q30,45 2,55 Z"
                    fill="#ec4899"
                    stroke="#db2777"
                    strokeWidth="2"
                />
                <text x="60" y="32" textAnchor="middle" fill="white" fontSize="12" fontWeight="500">
                    {(data as CustomNodeData).label || 'Document'}
                </text>
            </svg>
            <Handle type="target" position={Position.Top} className="!bg-[#ec4899] !w-3 !h-3 !border-2 !border-white" />
            <Handle type="source" position={Position.Bottom} className="!bg-[#ec4899] !w-3 !h-3 !border-2 !border-white" />
        </div>
    )
}

// Predefined Process (Double-lined rectangle) - Subprocess
function PredefinedNode({ data }: NodeProps) {
    return (
        <div className={nodeBaseStyle}>
            <svg width="140" height="60" viewBox="0 0 140 60">
                <rect
                    x="2" y="2" width="136" height="56" rx="4"
                    fill="#06b6d4"
                    stroke="#0891b2"
                    strokeWidth="2"
                />
                <line x1="12" y1="2" x2="12" y2="58" stroke="#0891b2" strokeWidth="2" />
                <line x1="128" y1="2" x2="128" y2="58" stroke="#0891b2" strokeWidth="2" />
                <text x="70" y="35" textAnchor="middle" fill="white" fontSize="12" fontWeight="500">
                    {(data as CustomNodeData).label || 'Subprocess'}
                </text>
            </svg>
            <Handle type="target" position={Position.Top} className="!bg-[#06b6d4] !w-3 !h-3 !border-2 !border-white" />
            <Handle type="source" position={Position.Bottom} className="!bg-[#06b6d4] !w-3 !h-3 !border-2 !border-white" />
        </div>
    )
}

// Connector (Circle) - Flow connector
function ConnectorNode({ data }: NodeProps) {
    return (
        <div className={nodeBaseStyle}>
            <svg width="50" height="50" viewBox="0 0 50 50">
                <circle
                    cx="25" cy="25" r="22"
                    fill="#64748b"
                    stroke="#475569"
                    strokeWidth="2"
                />
                <text x="25" y="30" textAnchor="middle" fill="white" fontSize="14" fontWeight="600">
                    {(data as CustomNodeData).label || 'A'}
                </text>
            </svg>
            <Handle type="target" position={Position.Top} className="!bg-[#64748b] !w-3 !h-3 !border-2 !border-white" />
            <Handle type="source" position={Position.Bottom} className="!bg-[#64748b] !w-3 !h-3 !border-2 !border-white" />
        </div>
    )
}

// Database (Cylinder) - Software specific
function DatabaseNode({ data }: NodeProps) {
    return (
        <div className={nodeBaseStyle}>
            <svg width="100" height="80" viewBox="0 0 100 80">
                <ellipse cx="50" cy="15" rx="45" ry="12" fill="#10b981" stroke="#059669" strokeWidth="2" />
                <path d="M5,15 L5,65 Q50,80 95,65 L95,15" fill="#10b981" stroke="#059669" strokeWidth="2" />
                <ellipse cx="50" cy="15" rx="45" ry="12" fill="#10b981" stroke="#059669" strokeWidth="2" />
                <text x="50" y="48" textAnchor="middle" fill="white" fontSize="12" fontWeight="500">
                    {(data as CustomNodeData).label || 'Database'}
                </text>
            </svg>
            <Handle type="target" position={Position.Top} className="!bg-[#10b981] !w-3 !h-3 !border-2 !border-white" />
            <Handle type="source" position={Position.Bottom} className="!bg-[#10b981] !w-3 !h-3 !border-2 !border-white" />
        </div>
    )
}

// API/Service (Cloud shape) - Software specific
function ApiNode({ data }: NodeProps) {
    return (
        <div className={nodeBaseStyle}>
            <svg width="130" height="70" viewBox="0 0 130 70">
                <path
                    d="M25,55 Q5,55 5,40 Q5,25 20,25 Q20,10 40,10 Q55,5 70,10 Q85,5 100,10 Q115,10 120,25 Q125,25 125,40 Q125,55 105,55 Z"
                    fill="#f97316"
                    stroke="#ea580c"
                    strokeWidth="2"
                />
                <text x="65" y="40" textAnchor="middle" fill="white" fontSize="12" fontWeight="500">
                    {(data as CustomNodeData).label || 'API'}
                </text>
            </svg>
            <Handle type="target" position={Position.Top} className="!bg-[#f97316] !w-3 !h-3 !border-2 !border-white" />
            <Handle type="source" position={Position.Bottom} className="!bg-[#f97316] !w-3 !h-3 !border-2 !border-white" />
        </div>
    )
}

export const nodeTypes = {
    terminator: TerminatorNode,
    process: ProcessNode,
    decision: DecisionNode,
    data: DataNode,
    document: DocumentNode,
    predefined: PredefinedNode,
    connector: ConnectorNode,
    database: DatabaseNode,
    api: ApiNode,
}
