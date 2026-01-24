import { Square, Circle, Type, MousePointer2, Minus, ArrowRight, Frame, Hand, Palette } from 'lucide-react'
import { useState } from 'react'
import type { ShapeType } from '../../../stores/wireframeStore'

interface ToolItem {
    type: ShapeType | 'select' | 'hand' | 'frame'
    label: string
    icon: typeof Square
    shortcut?: string
}

const toolItems: ToolItem[] = [
    { type: 'select', label: 'Select', icon: MousePointer2, shortcut: 'V' },
    { type: 'hand', label: 'Hand', icon: Hand, shortcut: 'H' },
    { type: 'frame', label: 'Frame', icon: Frame, shortcut: 'F' },
    { type: 'rect', label: 'Rectangle', icon: Square, shortcut: 'R' },
    { type: 'circle', label: 'Circle', icon: Circle, shortcut: 'O' },
    { type: 'text', label: 'Text', icon: Type, shortcut: 'T' },
    { type: 'line', label: 'Line', icon: Minus, shortcut: 'L' },
    { type: 'arrow', label: 'Arrow', icon: ArrowRight },
]

const componentItems: ToolItem[] = [
    { type: 'button', label: 'Button', icon: Square },
    { type: 'input', label: 'Input', icon: Square },
    { type: 'card', label: 'Card', icon: Square },
]

interface FloatingToolbarProps {
    selectedTool: ShapeType | 'select' | 'hand' | 'frame'
    onSelectTool: (tool: ShapeType | 'select' | 'hand' | 'frame') => void
    fillColor: string
    strokeColor: string
    onFillColorChange: (color: string) => void
    onStrokeColorChange: (color: string) => void
}

export function FloatingToolbar({
    selectedTool,
    onSelectTool,
    fillColor,
    strokeColor,
    onFillColorChange,
    onStrokeColorChange,
}: FloatingToolbarProps) {
    const [showComponents, setShowComponents] = useState(false)
    const [showColorPicker, setShowColorPicker] = useState(false)

    return (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20">
            <div className="flex items-center gap-1 bg-[#1a1a1a] border border-[#333] rounded-xl p-1.5 shadow-2xl">
                {/* Main Tools */}
                {toolItems.map((item) => {
                    const Icon = item.icon
                    const isActive = selectedTool === item.type
                    return (
                        <button
                            key={item.type}
                            onClick={() => onSelectTool(item.type)}
                            title={`${item.label}${item.shortcut ? ` (${item.shortcut})` : ''}`}
                            className={`
                                p-2.5 rounded-lg transition-all relative group
                                ${isActive
                                    ? 'bg-[#6366f1] text-white'
                                    : 'text-[#888] hover:bg-[#252525] hover:text-white'
                                }
                            `}
                        >
                            <Icon size={18} />
                            {/* Tooltip */}
                            <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[#333] text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                                {item.label}{item.shortcut && <span className="text-[#888] ml-1">{item.shortcut}</span>}
                            </span>
                        </button>
                    )
                })}

                {/* Divider */}
                <div className="w-px h-6 bg-[#333] mx-1" />

                {/* Components Dropdown */}
                <div className="relative">
                    <button
                        onClick={() => setShowComponents(!showComponents)}
                        title="Components"
                        className={`
                            p-2.5 rounded-lg transition-all
                            ${showComponents
                                ? 'bg-[#6366f1] text-white'
                                : 'text-[#888] hover:bg-[#252525] hover:text-white'
                            }
                        `}
                    >
                        <Square size={18} className="relative">
                            <span className="absolute -right-1 -bottom-1 text-[8px]">+</span>
                        </Square>
                    </button>

                    {/* Components Popup */}
                    {showComponents && (
                        <>
                            <div className="fixed inset-0 z-10" onClick={() => setShowComponents(false)} />
                            <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-[#1a1a1a] border border-[#333] rounded-lg p-2 shadow-xl z-20 min-w-[120px]">
                                {componentItems.map((item) => {
                                    const Icon = item.icon
                                    return (
                                        <button
                                            key={item.type}
                                            onClick={() => {
                                                onSelectTool(item.type)
                                                setShowComponents(false)
                                            }}
                                            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[#aaa] hover:bg-[#252525] hover:text-white transition-all"
                                        >
                                            <Icon size={14} />
                                            <span className="text-sm">{item.label}</span>
                                        </button>
                                    )
                                })}
                            </div>
                        </>
                    )}
                </div>

                {/* Divider */}
                <div className="w-px h-6 bg-[#333] mx-1" />

                {/* Color Picker */}
                <div className="relative">
                    <button
                        onClick={() => setShowColorPicker(!showColorPicker)}
                        title="Colors"
                        className={`
                            p-2.5 rounded-lg transition-all flex items-center gap-1
                            ${showColorPicker ? 'bg-[#252525]' : 'hover:bg-[#252525]'}
                        `}
                    >
                        <div
                            className="w-4 h-4 rounded border border-[#444]"
                            style={{ backgroundColor: fillColor }}
                        />
                        <Palette size={14} className="text-[#888]" />
                    </button>

                    {/* Color Picker Popup */}
                    {showColorPicker && (
                        <>
                            <div className="fixed inset-0 z-10" onClick={() => setShowColorPicker(false)} />
                            <div className="absolute bottom-full mb-2 right-0 bg-[#1a1a1a] border border-[#333] rounded-lg p-3 shadow-xl z-20 min-w-[160px]">
                                <div className="space-y-3">
                                    <div>
                                        <label className="text-xs text-[#888] mb-1 block">Fill</label>
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="color"
                                                value={fillColor}
                                                onChange={(e) => onFillColorChange(e.target.value)}
                                                className="w-8 h-8 rounded cursor-pointer bg-transparent border border-[#333]"
                                            />
                                            <input
                                                type="text"
                                                value={fillColor}
                                                onChange={(e) => onFillColorChange(e.target.value)}
                                                className="flex-1 bg-[#252525] border border-[#333] rounded px-2 py-1 text-xs text-white w-20"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-xs text-[#888] mb-1 block">Stroke</label>
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="color"
                                                value={strokeColor}
                                                onChange={(e) => onStrokeColorChange(e.target.value)}
                                                className="w-8 h-8 rounded cursor-pointer bg-transparent border border-[#333]"
                                            />
                                            <input
                                                type="text"
                                                value={strokeColor}
                                                onChange={(e) => onStrokeColorChange(e.target.value)}
                                                className="flex-1 bg-[#252525] border border-[#333] rounded px-2 py-1 text-xs text-white w-20"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}
