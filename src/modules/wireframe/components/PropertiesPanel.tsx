import React from 'react'
import { ArrowDown, ArrowRight, Layout, X } from 'lucide-react'
import type { LayoutConfig } from '../../../stores/wireframeStore'

interface PropertiesPanelProps {
    layout?: LayoutConfig
    onUpdateLayout: (layout: LayoutConfig) => void
    title?: string
}

export const PropertiesPanel: React.FC<PropertiesPanelProps> = ({
    layout,
    onUpdateLayout,
    title = 'Auto Layout'
}) => {
    // Default values if layout is undefined but we want to enable it
    const defaultLayout: LayoutConfig = {
        type: 'vertical',
        gap: 10,
        padding: 10,
        align: 'start'
    }

    const currentLayout = layout || { type: 'none', gap: 0, padding: 0, align: 'start' }
    const isEnabled = currentLayout.type !== 'none'

    const handleEnable = () => {
        onUpdateLayout(defaultLayout)
    }

    const handleDisable = () => {
        onUpdateLayout({ ...currentLayout, type: 'none' } as LayoutConfig)
    }

    const updateField = (field: keyof LayoutConfig, value: any) => {
        onUpdateLayout({
            ...currentLayout,
            type: currentLayout.type === 'none' ? 'vertical' : currentLayout.type, // Ensure type is set if enabling implicitly
            [field]: value
        } as LayoutConfig)
    }

    return (
        <div className="p-4 border-b border-[#333] bg-[#1a1a1a] text-white">
            <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                    <Layout size={14} />
                    {title}
                </h3>
                {isEnabled ? (
                    <button onClick={handleDisable} className="text-[#666] hover:text-white" title="Remove Auto Layout">
                        <X size={14} />
                    </button>
                ) : (
                    <button onClick={handleEnable} className="text-[#6366f1] hover:text-[#818cf8] text-xs">
                        + Add
                    </button>
                )}
            </div>

            {isEnabled && (
                <div className="space-y-3">
                    {/* Direction */}
                    <div className="flex bg-[#252525] rounded p-1">
                        <button
                            className={`flex-1 flex items-center justify-center py-1 rounded ${currentLayout.type === 'vertical' ? 'bg-[#333] text-white shadow' : 'text-[#888] hover:text-white'}`}
                            onClick={() => updateField('type', 'vertical')}
                            title="Vertical Direction"
                        >
                            <ArrowDown size={14} />
                        </button>
                        <button
                            className={`flex-1 flex items-center justify-center py-1 rounded ${currentLayout.type === 'horizontal' ? 'bg-[#333] text-white shadow' : 'text-[#888] hover:text-white'}`}
                            onClick={() => updateField('type', 'horizontal')}
                            title="Horizontal Direction"
                        >
                            <ArrowRight size={14} />
                        </button>
                    </div>

                    {/* Gap & Padding */}
                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <label className="text-[10px] text-[#888] block mb-1">Gap</label>
                            <div className="flex items-center bg-[#252525] rounded border border-[#333] px-2 py-1">
                                <input
                                    type="number"
                                    value={currentLayout.gap}
                                    onChange={(e) => updateField('gap', parseInt(e.target.value) || 0)}
                                    className="bg-transparent text-xs w-full outline-none text-white appearance-none"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="text-[10px] text-[#888] block mb-1">Padding</label>
                            <div className="flex items-center bg-[#252525] rounded border border-[#333] px-2 py-1">
                                <input
                                    type="number"
                                    value={currentLayout.padding}
                                    onChange={(e) => updateField('padding', parseInt(e.target.value) || 0)}
                                    className="bg-transparent text-xs w-full outline-none text-white appearance-none"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Alignment */}
                    <div>
                        <label className="text-[10px] text-[#888] block mb-1">Align</label>
                        <div className="grid grid-cols-3 bg-[#252525] rounded p-1 gap-1">
                            {['start', 'center', 'end'].map((align) => (
                                <button
                                    key={align}
                                    className={`flex items-center justify-center py-1 rounded text-[10px] ${currentLayout.align === align ? 'bg-[#333] text-white shadow' : 'text-[#888] hover:text-white'}`}
                                    onClick={() => updateField('align', align)}
                                >
                                    {align}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
