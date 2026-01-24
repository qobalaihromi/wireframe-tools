import { Square, Circle, Type, MousePointer2, Minus, ArrowRight } from 'lucide-react'
import type { ShapeType } from '../../stores/wireframeStore'

interface ShapePaletteItem {
    type: ShapeType | 'select'
    label: string
    icon: typeof Square
}

const paletteItems: ShapePaletteItem[] = [
    { type: 'select', label: 'Select', icon: MousePointer2 },
    { type: 'rect', label: 'Rectangle', icon: Square },
    { type: 'circle', label: 'Circle', icon: Circle },
    { type: 'text', label: 'Text', icon: Type },
    { type: 'line', label: 'Line', icon: Minus },
    { type: 'arrow', label: 'Arrow', icon: ArrowRight },
    { type: 'button', label: 'Button', icon: Square },
    { type: 'input', label: 'Input', icon: Square },
    { type: 'card', label: 'Card', icon: Square },
]

interface ShapePaletteProps {
    selectedTool: ShapeType | 'select'
    onSelectTool: (tool: ShapeType | 'select') => void
    fillColor: string
    strokeColor: string
    strokeWidth: number
    opacity: number
    onFillColorChange: (color: string) => void
    onStrokeColorChange: (color: string) => void
    onStrokeWidthChange: (width: number) => void
    onOpacityChange: (opacity: number) => void
}

export function ShapePalette({
    selectedTool,
    onSelectTool,
    fillColor,
    strokeColor,
    strokeWidth,
    opacity,
    onFillColorChange,
    onStrokeColorChange,
    onStrokeWidthChange,
    onOpacityChange,
}: ShapePaletteProps) {
    return (
        <div className="w-52 bg-[#1a1a1a] border-r border-[#2a2a2a] p-4 flex flex-col gap-4 overflow-y-auto">
            {/* Tools */}
            <div>
                <h3 className="text-xs font-medium text-[#a1a1aa] uppercase tracking-wider mb-2">
                    Tools
                </h3>
                <div className="grid grid-cols-3 gap-1.5">
                    {paletteItems.map((item) => {
                        const Icon = item.icon
                        const isActive = selectedTool === item.type
                        return (
                            <button
                                key={item.type}
                                onClick={() => onSelectTool(item.type)}
                                title={item.label}
                                className={`
                  flex flex-col items-center gap-0.5 p-2 rounded-lg border transition-all
                  ${isActive
                                        ? 'bg-[#6366f1] border-[#6366f1] text-white'
                                        : 'bg-[#252525] border-[#2a2a2a] text-[#a1a1aa] hover:border-[#3a3a3a] hover:text-white'
                                    }
                `}
                            >
                                <Icon size={16} />
                                <span className="text-[9px] truncate w-full text-center">{item.label}</span>
                            </button>
                        )
                    })}
                </div>
            </div>

            {/* Colors */}
            <div>
                <h3 className="text-xs font-medium text-[#a1a1aa] uppercase tracking-wider mb-2">
                    Colors
                </h3>
                <div className="space-y-3">
                    <div>
                        <label className="text-xs text-[#6a6a6a] mb-1 block">Fill</label>
                        <div className="flex items-center gap-2">
                            <input
                                type="color"
                                value={fillColor}
                                onChange={(e) => onFillColorChange(e.target.value)}
                                className="w-8 h-8 rounded cursor-pointer bg-transparent border border-[#2a2a2a]"
                            />
                            <input
                                type="text"
                                value={fillColor}
                                onChange={(e) => onFillColorChange(e.target.value)}
                                className="flex-1 bg-[#252525] border border-[#2a2a2a] rounded px-2 py-1 text-xs text-white"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-xs text-[#6a6a6a] mb-1 block">Stroke</label>
                        <div className="flex items-center gap-2">
                            <input
                                type="color"
                                value={strokeColor}
                                onChange={(e) => onStrokeColorChange(e.target.value)}
                                className="w-8 h-8 rounded cursor-pointer bg-transparent border border-[#2a2a2a]"
                            />
                            <input
                                type="text"
                                value={strokeColor}
                                onChange={(e) => onStrokeColorChange(e.target.value)}
                                className="flex-1 bg-[#252525] border border-[#2a2a2a] rounded px-2 py-1 text-xs text-white"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Stroke Width */}
            <div>
                <h3 className="text-xs font-medium text-[#a1a1aa] uppercase tracking-wider mb-2">
                    Stroke Width
                </h3>
                <div className="flex items-center gap-2">
                    <input
                        type="range"
                        min="1"
                        max="10"
                        value={strokeWidth}
                        onChange={(e) => onStrokeWidthChange(Number(e.target.value))}
                        className="flex-1 h-1 bg-[#252525] rounded-lg appearance-none cursor-pointer accent-[#6366f1]"
                    />
                    <span className="text-xs text-[#a1a1aa] w-6 text-right">{strokeWidth}px</span>
                </div>
            </div>

            {/* Opacity */}
            <div>
                <h3 className="text-xs font-medium text-[#a1a1aa] uppercase tracking-wider mb-2">
                    Opacity
                </h3>
                <div className="flex items-center gap-2">
                    <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={opacity}
                        onChange={(e) => onOpacityChange(Number(e.target.value))}
                        className="flex-1 h-1 bg-[#252525] rounded-lg appearance-none cursor-pointer accent-[#6366f1]"
                    />
                    <span className="text-xs text-[#a1a1aa] w-8 text-right">{Math.round(opacity * 100)}%</span>
                </div>
            </div>

            {/* Tips */}
            <div className="mt-auto pt-4 border-t border-[#2a2a2a]">
                <p className="text-xs text-[#6a6a6a]">
                    💡 Click canvas to add • Drag corners to resize • Del to delete
                </p>
            </div>
        </div>
    )
}
