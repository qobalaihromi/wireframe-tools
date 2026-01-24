import {
    Square, Circle, Type, MousePointer2, Minus, ArrowRight, Frame, Hand, PenTool, Hash
} from 'lucide-react'
import { useState } from 'react'
import type { ShapeType } from '../../../stores/wireframeStore'

interface ToolItem {
    type: ShapeType | 'select' | 'hand' | 'frame'
    label: string
    icon: any
    shortcut?: string
}

const toolItems: ToolItem[] = [
    { type: 'select', label: 'Move', icon: MousePointer2, shortcut: 'V' },
    { type: 'frame', label: 'Frame', icon: Hash, shortcut: 'F' }, // Using Hash for Frame symbol like Figma
    { type: 'rect', label: 'Rectangle', icon: Square, shortcut: 'R' },
    { type: 'circle', label: 'Circle', icon: Circle, shortcut: 'O' },
    { type: 'path', label: 'Pen', icon: PenTool, shortcut: 'P' },
    { type: 'text', label: 'Text', icon: Type, shortcut: 'T' },
    { type: 'hand', label: 'Hand', icon: Hand, shortcut: 'H' },
]

interface FloatingToolbarProps {
    selectedTool: ShapeType | 'select' | 'hand' | 'frame'
    onSelectTool: (tool: ShapeType | 'select' | 'hand' | 'frame') => void
}

export function FloatingToolbar({
    selectedTool,
    onSelectTool,
}: FloatingToolbarProps) {
    return (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-50">
            <div className="flex items-center gap-1 bg-[#2c2c2c] border border-[#444] rounded-full px-4 py-2 shadow-2xl backdrop-blur-md bg-opacity-90">
                {toolItems.map((item) => {
                    const Icon = item.icon
                    const isActive = selectedTool === item.type

                    return (
                        <button
                            key={item.type}
                            onClick={() => onSelectTool(item.type)}
                            title={`${item.label}${item.shortcut ? ` (${item.shortcut})` : ''}`}
                            className={`
                                p-2 rounded-lg transition-all relative group flex items-center justify-center
                                ${isActive
                                    ? 'bg-[#0d99ff] text-white' // Figma blue
                                    : 'text-white hover:bg-[#444]'
                                }
                            `}
                        >
                            <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />

                            {/* Tooltip */}
                            <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none delay-500">
                                {item.label} {item.shortcut && <span className="text-[#888] ml-1">{item.shortcut}</span>}
                            </span>
                        </button>
                    )
                })}
            </div>
        </div>
    )
}

