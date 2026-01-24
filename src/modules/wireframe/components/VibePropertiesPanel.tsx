import React from 'react'
import {
    AlignLeft, AlignCenter, AlignRight,
    ArrowUpToLine, ArrowDownToLine, Minus, // Safe fallbacks for vertical alignment
    Layout, Type, Droplet, Move, Square, Box, Grid,
    ArrowDown, ArrowRight // Used in component body
} from 'lucide-react'
import type { WireframeNode, LayoutConfig } from '../../../stores/wireframeStore'

interface VibePropertiesPanelProps {
    selectedNode: WireframeNode | null
    selectedArtboard: any | null // Type properly if possible
    fillColor: string
    onFillColorChange: (color: string) => void
    strokeColor: string
    onStrokeColorChange: (color: string) => void
    strokeWidth: number
    onStrokeWidthChange: (width: number) => void
    opacity: number
    onOpacityChange: (opacity: number) => void
    borderRadius: number
    onBorderRadiusChange: (radius: number) => void
    fontSize: number
    onFontSizeChange: (size: number) => void

    // Layout
    layout?: LayoutConfig
    onUpdateLayout: (layout: LayoutConfig) => void

    // Alignment Actions
    onAlign: (type: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') => void
    onDistribute: (type: 'horizontal' | 'vertical') => void
}

export const VibePropertiesPanel: React.FC<VibePropertiesPanelProps> = ({
    selectedNode,
    selectedArtboard,
    fillColor,
    onFillColorChange,
    strokeColor,
    onStrokeColorChange,
    strokeWidth,
    onStrokeWidthChange,
    opacity,
    onOpacityChange,
    borderRadius,
    onBorderRadiusChange,
    fontSize,
    onFontSizeChange,
    layout,
    onUpdateLayout,
    onAlign,
    onDistribute
}) => {

    // Helper to render section dividers
    const Divider = () => <div className="h-px bg-[#333] my-4" />

    // Helper for input rows
    const PropertyRow = ({ label, children }: { label: string, children: React.ReactNode }) => (
        <div className="flex items-center justify-between mb-2">
            <label className="text-xs text-[#888]">{label}</label>
            <div className="w-24 text-right">
                {children}
            </div>
        </div>
    )

    if (!selectedNode && !selectedArtboard) {
        return (
            <div className="p-4 text-center text-[#555] text-xs">
                Select an element to edit properties.
            </div>
        )
    }

    const isText = selectedNode?.type === 'text' || selectedNode?.type === 'button'
    const isGroup = selectedNode?.type === 'group' || selectedNode?.type === 'frame' || (!selectedNode && selectedArtboard)

    return (
        <div className="flex flex-col h-full bg-[#1a1a1a] text-white overflow-y-auto">
            {/* Alignment Section (Top) */}
            <div className="p-4 pb-2">
                <div className="grid grid-cols-6 gap-1 mb-2">
                    <button onClick={() => onAlign('left')} className="p-1 hover:bg-[#333] rounded" title="Align Left"><AlignLeft size={16} /></button>
                    <button onClick={() => onAlign('center')} className="p-1 hover:bg-[#333] rounded" title="Align Horizontal Centers"><AlignCenter size={16} /></button>
                    <button onClick={() => onAlign('right')} className="p-1 hover:bg-[#333] rounded" title="Align Right"><AlignRight size={16} /></button>
                    <button onClick={() => onAlign('top')} className="p-1 hover:bg-[#333] rounded" title="Align Top"><ArrowUpToLine size={16} /></button>
                    <button onClick={() => onAlign('middle')} className="p-1 hover:bg-[#333] rounded" title="Align Vertical Centers"><Minus size={16} className="rotate-90" /></button>
                    <button onClick={() => onAlign('bottom')} className="p-1 hover:bg-[#333] rounded" title="Align Bottom"><ArrowDownToLine size={16} /></button>
                </div>
            </div>

            <Divider />

            {/* Layout Section (Flexbox) - Only for Groups/Artboards */}
            {isGroup && (
                <div className="px-4">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold flex items-center gap-2"><Layout size={12} /> Auto Layout</span>
                        <div className="flex bg-[#252525] rounded p-0.5">
                            <button
                                onClick={() => onUpdateLayout({ ...layout!, type: 'vertical', gap: 10, padding: 10, align: 'start' } as any)}
                                className={`text-[10px] px-2 py-0.5 rounded ${layout?.type === 'vertical' ? 'bg-[#333] text-white' : 'text-[#666]'}`}
                            >
                                ↓
                            </button>
                            <button
                                onClick={() => onUpdateLayout({ ...layout!, type: 'horizontal', gap: 10, padding: 10, align: 'start' } as any)}
                                className={`text-[10px] px-2 py-0.5 rounded ${layout?.type === 'horizontal' ? 'bg-[#333] text-white' : 'text-[#666]'}`}
                            >
                                →
                            </button>
                        </div>
                    </div>

                    {layout?.type !== 'none' && (
                        <div className="grid grid-cols-2 gap-2 mt-2">
                            <div className="bg-[#252525] rounded p-1 pl-2 flex items-center justify-between border border-[#333]">
                                <span className="text-[10px] text-[#666]">Gap</span>
                                <input
                                    type="number"
                                    value={layout?.gap ?? 0}
                                    onChange={(e) => onUpdateLayout({ ...layout!, gap: parseInt(e.target.value) } as any)}
                                    className="w-8 bg-transparent text-xs text-right outline-none"
                                />
                            </div>
                            <div className="bg-[#252525] rounded p-1 pl-2 flex items-center justify-between border border-[#333]">
                                <span className="text-[10px] text-[#666]">Pad</span>
                                <input
                                    type="number"
                                    value={layout?.padding ?? 0}
                                    onChange={(e) => onUpdateLayout({ ...layout!, padding: parseInt(e.target.value) } as any)}
                                    className="w-8 bg-transparent text-xs text-right outline-none"
                                />
                            </div>
                        </div>
                    )}
                    <Divider />
                </div>
            )}

            {/* Transform Section */}
            {!selectedArtboard && selectedNode && (
                <div className="px-4">
                    <span className="text-xs font-bold mb-2 block">Transform</span>
                    <div className="grid grid-cols-2 gap-2 mb-2">
                        <PropertyRow label="X">
                            <span className="text-xs text-[#ccc]">{Math.round(selectedNode.x)}</span>
                        </PropertyRow>
                        <PropertyRow label="Y">
                            <span className="text-xs text-[#ccc]">{Math.round(selectedNode.y)}</span>
                        </PropertyRow>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mb-2">
                        <PropertyRow label="W">
                            <span className="text-xs text-[#ccc]">{Math.round(selectedNode.width)}</span>
                        </PropertyRow>
                        <PropertyRow label="H">
                            <span className="text-xs text-[#ccc]">{Math.round(selectedNode.height)}</span>
                        </PropertyRow>
                    </div>
                    <PropertyRow label="Rotation">
                        <span className="text-xs text-[#ccc]">{selectedNode.rotation}°</span>
                    </PropertyRow>
                    <PropertyRow label="Radius">
                        <input
                            type="number"
                            value={selectedNode.borderRadius || borderRadius}
                            onChange={(e) => onBorderRadiusChange(parseInt(e.target.value))}
                            className="bg-[#252525] border border-[#333] rounded w-full py-1 px-2 text-xs outline-none"
                        />
                    </PropertyRow>
                    <Divider />
                </div>
            )}

            {/* Appearance Section */}
            <div className="px-4">
                <span className="text-xs font-bold mb-3 block">Appearance</span>

                {/* Fill */}
                <div className="mb-3">
                    <div className="flex items-center justify-between mb-1">
                        <label className="text-xs text-[#888]">Fill</label>
                        <div className="flex items-center gap-2">
                            <input
                                type="color"
                                value={selectedNode?.fill || fillColor}
                                onChange={(e) => onFillColorChange(e.target.value)}
                                className="w-4 h-4 rounded cursor-pointer border-none bg-transparent p-0"
                            />
                            <span className="text-xs text-[#ccc] uppercase">{selectedNode?.fill || fillColor}</span>
                        </div>
                    </div>
                </div>

                {/* Stroke */}
                <div className="mb-3">
                    <div className="flex items-center justify-between mb-1">
                        <label className="text-xs text-[#888]">Stroke</label>
                        <div className="flex items-center gap-2">
                            <input
                                type="color"
                                value={selectedNode?.stroke || strokeColor}
                                onChange={(e) => onStrokeColorChange(e.target.value)}
                                className="w-4 h-4 rounded cursor-pointer border-none bg-transparent p-0"
                            />
                            <span className="text-xs text-[#ccc] uppercase">{selectedNode?.stroke || strokeColor}</span>
                        </div>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                        <label className="text-xs text-[#888] pl-2">Width</label>
                        <input
                            type="number"
                            value={selectedNode?.strokeWidth || strokeWidth}
                            onChange={(e) => onStrokeWidthChange(parseInt(e.target.value))}
                            className="bg-[#252525] border border-[#333] rounded w-16 py-1 px-2 text-xs outline-none text-right"
                        />
                    </div>
                </div>

                {/* Opacity */}
                <div className="mb-2">
                    <div className="flex items-center justify-between">
                        <label className="text-xs text-[#888]">Opacity</label>
                        <div className="flex items-center gap-2">
                            <input
                                type="range"
                                min="0" max="1" step="0.1"
                                value={selectedNode?.opacity ?? opacity}
                                onChange={(e) => onOpacityChange(parseFloat(e.target.value))}
                                className="w-16 h-1 bg-[#333] rounded-lg appearance-none cursor-pointer"
                            />
                            <span className="text-xs text-[#ccc] w-8 text-right">{Math.round((selectedNode?.opacity ?? opacity) * 100)}%</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Typography Section (Text Only) */}
            {isText && (
                <>
                    <Divider />
                    <div className="px-4">
                        <span className="text-xs font-bold mb-3 block flex items-center gap-2"><Type size={12} /> Typography</span>
                        <PropertyRow label="Size">
                            <input
                                type="number"
                                value={selectedNode?.fontSize || fontSize}
                                onChange={(e) => onFontSizeChange(parseInt(e.target.value))}
                                className="bg-[#252525] border border-[#333] rounded w-full py-1 px-2 text-xs outline-none"
                            />
                        </PropertyRow>
                        <PropertyRow label="Content">
                            <input
                                type="text"
                                value={selectedNode?.text || ''}
                                // This would require an onTextChange prop, omitting for now to keep props simple or we can use generic update
                                readOnly
                                className="bg-[#252525] border border-[#333] rounded w-full py-1 px-2 text-xs outline-none opacity-50 cursor-not-allowed"
                            />
                        </PropertyRow>
                    </div>
                </>
            )}

        </div>
    )
}
