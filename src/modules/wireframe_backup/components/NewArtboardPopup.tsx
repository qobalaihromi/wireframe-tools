import { useState } from 'react'
import { Monitor, Smartphone, X } from 'lucide-react'

interface ArtboardPreset {
    name: string
    width: number
    height: number
    icon: 'mobile' | 'desktop'
}

const PRESETS: ArtboardPreset[] = [
    { name: 'iPhone 14 Pro', width: 393, height: 852, icon: 'mobile' },
    { name: 'iPhone SE', width: 375, height: 667, icon: 'mobile' },
    { name: 'Android Large', width: 412, height: 915, icon: 'mobile' },
    { name: 'Desktop 1440', width: 1440, height: 900, icon: 'desktop' },
    { name: 'Desktop 1920', width: 1920, height: 1080, icon: 'desktop' },
    { name: 'MacBook Pro 14"', width: 1512, height: 982, icon: 'desktop' },
]

interface NewArtboardPopupProps {
    isOpen: boolean
    onClose: () => void
    onSelect: (name: string, width: number, height: number) => void
    artboardCount: number
}

export function NewArtboardPopup({ isOpen, onClose, onSelect, artboardCount }: NewArtboardPopupProps) {
    const [customWidth, setCustomWidth] = useState(375)
    const [customHeight, setCustomHeight] = useState(667)

    if (!isOpen) return null

    const handlePresetClick = (preset: ArtboardPreset) => {
        onSelect(`Screen ${artboardCount + 1}`, preset.width, preset.height)
        onClose()
    }

    const handleCustomCreate = () => {
        onSelect(`Screen ${artboardCount + 1}`, customWidth, customHeight)
        onClose()
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
            <div
                className="bg-[#1a1a1a] rounded-xl p-6 min-w-[400px] shadow-2xl border border-[#333]"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-semibold text-white">New Artboard</h2>
                    <button onClick={onClose} className="text-[#666] hover:text-white">
                        <X size={20} />
                    </button>
                </div>

                {/* Preset Categories */}
                <div className="space-y-4">
                    {/* Mobile Presets */}
                    <div>
                        <div className="flex items-center gap-2 text-[#888] text-sm mb-2">
                            <Smartphone size={14} />
                            <span>Mobile</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                            {PRESETS.filter(p => p.icon === 'mobile').map(preset => (
                                <button
                                    key={preset.name}
                                    onClick={() => handlePresetClick(preset)}
                                    className="bg-[#252525] hover:bg-[#333] border border-[#333] hover:border-[#6366f1] rounded-lg p-3 text-left transition-colors"
                                >
                                    <div className="text-white text-sm font-medium truncate">{preset.name}</div>
                                    <div className="text-[#666] text-xs">{preset.width} × {preset.height}</div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Desktop Presets */}
                    <div>
                        <div className="flex items-center gap-2 text-[#888] text-sm mb-2">
                            <Monitor size={14} />
                            <span>Desktop</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                            {PRESETS.filter(p => p.icon === 'desktop').map(preset => (
                                <button
                                    key={preset.name}
                                    onClick={() => handlePresetClick(preset)}
                                    className="bg-[#252525] hover:bg-[#333] border border-[#333] hover:border-[#6366f1] rounded-lg p-3 text-left transition-colors"
                                >
                                    <div className="text-white text-sm font-medium truncate">{preset.name}</div>
                                    <div className="text-[#666] text-xs">{preset.width} × {preset.height}</div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Custom Size */}
                    <div className="pt-4 border-t border-[#333]">
                        <div className="text-[#888] text-sm mb-2">Custom Size</div>
                        <div className="flex gap-2 items-center">
                            <input
                                type="number"
                                value={customWidth}
                                onChange={(e) => setCustomWidth(Number(e.target.value))}
                                className="bg-[#252525] border border-[#333] rounded-lg px-3 py-2 w-24 text-white text-sm"
                                placeholder="Width"
                            />
                            <span className="text-[#666]">×</span>
                            <input
                                type="number"
                                value={customHeight}
                                onChange={(e) => setCustomHeight(Number(e.target.value))}
                                className="bg-[#252525] border border-[#333] rounded-lg px-3 py-2 w-24 text-white text-sm"
                                placeholder="Height"
                            />
                            <button
                                onClick={handleCustomCreate}
                                className="bg-[#6366f1] hover:bg-[#4f46e5] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                            >
                                Create
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
