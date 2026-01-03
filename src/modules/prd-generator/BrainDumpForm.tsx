import { useState } from 'react'
import {
    Lightbulb,
    Users,
    Target,
    Ban,
    Wrench,
    Database,
    ChevronRight,
    ChevronLeft,
    Sparkles
} from 'lucide-react'
import { useProjectStore } from '../../stores/projectStore'
import { usePRDStore } from '../../stores/prdStore'
import type { PRDData } from '../../lib/prdTemplate'

const steps = [
    { id: 'problem', label: 'Problem', icon: Lightbulb },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'features', label: 'Features', icon: Target },
    { id: 'outOfScope', label: 'Out of Scope', icon: Ban },
    { id: 'tech', label: 'Tech Stack', icon: Wrench },
    { id: 'database', label: 'Database', icon: Database },
]

interface BrainDumpFormProps {
    onComplete: (data: PRDData) => void
}

export function BrainDumpForm({ onComplete }: BrainDumpFormProps) {
    const currentProject = useProjectStore((state) => state.getCurrentProject())
    const existingPRD = usePRDStore((state) =>
        currentProject ? state.getPRD(currentProject.id) : null
    )

    const [currentStep, setCurrentStep] = useState(0)
    const [formData, setFormData] = useState<PRDData>({
        projectName: existingPRD?.projectName || currentProject?.name || '',
        problemStatement: existingPRD?.problemStatement || '',
        targetUser: existingPRD?.targetUser || '',
        coreFeatures: existingPRD?.coreFeatures || ['', '', '', '', ''],
        outOfScope: existingPRD?.outOfScope || ['', '', ''],
        techPreferences: existingPRD?.techPreferences || '',
        databaseSchema: existingPRD?.databaseSchema || '',
    })

    const updateField = (field: keyof PRDData, value: string | string[]) => {
        setFormData(prev => ({ ...prev, [field]: value }))
    }

    const updateArrayField = (field: 'coreFeatures' | 'outOfScope', index: number, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: prev[field].map((item: string, i: number) => i === index ? value : item)
        }))
    }

    const addArrayItem = (field: 'coreFeatures' | 'outOfScope') => {
        setFormData(prev => ({
            ...prev,
            [field]: [...prev[field], '']
        }))
    }

    const removeArrayItem = (field: 'coreFeatures' | 'outOfScope', index: number) => {
        setFormData(prev => ({
            ...prev,
            [field]: prev[field].filter((_: string, i: number) => i !== index)
        }))
    }

    const canProceed = () => {
        switch (steps[currentStep].id) {
            case 'problem':
                return formData.problemStatement.trim().length > 0
            case 'users':
                return formData.targetUser.trim().length > 0
            case 'features':
                return formData.coreFeatures.filter((f: string) => f.trim()).length > 0
            default:
                return true
        }
    }

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(prev => prev + 1)
        } else {
            const cleanedData = {
                ...formData,
                coreFeatures: formData.coreFeatures.filter((f: string) => f.trim()),
                outOfScope: formData.outOfScope.filter((f: string) => f.trim()),
            }
            onComplete(cleanedData)
        }
    }

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(prev => prev - 1)
        }
    }

    const renderStepContent = () => {
        switch (steps[currentStep].id) {
            case 'problem':
                return (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Masalah apa yang ingin diselesaikan?
                            </label>
                            <textarea
                                value={formData.problemStatement}
                                onChange={(e) => updateField('problemStatement', e.target.value)}
                                placeholder="Contoh: Designer kesulitan membuat dokumentasi terstruktur untuk AI coding..."
                                className="w-full h-32 bg-[#252525] border border-[#2a2a2a] rounded-lg px-4 py-3 text-white placeholder-[#6a6a6a] focus:border-[#6366f1] focus:outline-none resize-none"
                                autoFocus
                            />
                        </div>
                        <p className="text-sm text-[#6a6a6a]">
                            Tip: Jelaskan masalah dari sudut pandang user
                        </p>
                    </div>
                )

            case 'users':
                return (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Siapa target user-nya?
                            </label>
                            <textarea
                                value={formData.targetUser}
                                onChange={(e) => updateField('targetUser', e.target.value)}
                                placeholder="Contoh: UI/UX Designer yang melakukan vibe coding dengan AI..."
                                className="w-full h-32 bg-[#252525] border border-[#2a2a2a] rounded-lg px-4 py-3 text-white placeholder-[#6a6a6a] focus:border-[#6366f1] focus:outline-none resize-none"
                                autoFocus
                            />
                        </div>
                        <p className="text-sm text-[#6a6a6a]">
                            Tip: Semakin spesifik, semakin bagus
                        </p>
                    </div>
                )

            case 'features':
                return (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Fitur utama apa saja? (Max 5 untuk MVP)
                            </label>
                            <div className="space-y-2">
                                {formData.coreFeatures.map((feature: string, index: number) => (
                                    <div key={index} className="flex gap-2">
                                        <span className="w-6 h-10 flex items-center justify-center text-[#6a6a6a] text-sm">
                                            {index + 1}.
                                        </span>
                                        <input
                                            type="text"
                                            value={feature}
                                            onChange={(e) => updateArrayField('coreFeatures', index, e.target.value)}
                                            placeholder={`Fitur ${index + 1}`}
                                            className="flex-1 bg-[#252525] border border-[#2a2a2a] rounded-lg px-4 py-2 text-white placeholder-[#6a6a6a] focus:border-[#6366f1] focus:outline-none"
                                        />
                                        {formData.coreFeatures.length > 1 && (
                                            <button
                                                onClick={() => removeArrayItem('coreFeatures', index)}
                                                className="px-3 text-[#6a6a6a] hover:text-red-400 transition-colors"
                                            >
                                                x
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                            {formData.coreFeatures.length < 7 && (
                                <button
                                    onClick={() => addArrayItem('coreFeatures')}
                                    className="mt-2 text-sm text-[#6366f1] hover:text-[#818cf8] transition-colors"
                                >
                                    + Tambah fitur
                                </button>
                            )}
                        </div>
                    </div>
                )

            case 'outOfScope':
                return (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Apa yang TIDAK akan dibuat? (Parking Lot)
                            </label>
                            <div className="space-y-2">
                                {formData.outOfScope.map((item: string, index: number) => (
                                    <div key={index} className="flex gap-2">
                                        <span className="w-6 h-10 flex items-center justify-center text-red-400 text-sm">
                                            x
                                        </span>
                                        <input
                                            type="text"
                                            value={item}
                                            onChange={(e) => updateArrayField('outOfScope', index, e.target.value)}
                                            placeholder={`Out of scope ${index + 1}`}
                                            className="flex-1 bg-[#252525] border border-[#2a2a2a] rounded-lg px-4 py-2 text-white placeholder-[#6a6a6a] focus:border-[#6366f1] focus:outline-none"
                                        />
                                        {formData.outOfScope.length > 1 && (
                                            <button
                                                onClick={() => removeArrayItem('outOfScope', index)}
                                                className="px-3 text-[#6a6a6a] hover:text-red-400 transition-colors"
                                            >
                                                x
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                            <button
                                onClick={() => addArrayItem('outOfScope')}
                                className="mt-2 text-sm text-[#6366f1] hover:text-[#818cf8] transition-colors"
                            >
                                + Tambah item
                            </button>
                        </div>
                    </div>
                )

            case 'tech':
                return (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Tech stack preference? (Optional)
                            </label>
                            <textarea
                                value={formData.techPreferences}
                                onChange={(e) => updateField('techPreferences', e.target.value)}
                                placeholder="Contoh: React + TypeScript, Supabase, Tailwind CSS, Vercel..."
                                className="w-full h-24 bg-[#252525] border border-[#2a2a2a] rounded-lg px-4 py-3 text-white placeholder-[#6a6a6a] focus:border-[#6366f1] focus:outline-none resize-none"
                            />
                        </div>
                    </div>
                )

            case 'database':
                return (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Database schema outline? (Optional)
                            </label>
                            <textarea
                                value={formData.databaseSchema}
                                onChange={(e) => updateField('databaseSchema', e.target.value)}
                                placeholder="users: id, email, name&#10;projects: id, user_id, title&#10;wireframes: id, project_id, data"
                                className="w-full h-32 bg-[#252525] border border-[#2a2a2a] rounded-lg px-4 py-3 text-white placeholder-[#6a6a6a] focus:border-[#6366f1] focus:outline-none resize-none font-mono text-sm"
                            />
                        </div>
                    </div>
                )

            default:
                return null
        }
    }

    return (
        <div className="max-w-2xl mx-auto">
            {/* Progress Steps */}
            <div className="flex items-center justify-between mb-8">
                {steps.map((step, index) => {
                    const Icon = step.icon
                    const isActive = index === currentStep
                    const isCompleted = index < currentStep

                    return (
                        <div key={step.id} className="flex flex-col items-center">
                            <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-colors ${isActive
                                        ? 'bg-[#6366f1] text-white'
                                        : isCompleted
                                            ? 'bg-green-500/20 text-green-400'
                                            : 'bg-[#252525] text-[#6a6a6a]'
                                    }`}
                            >
                                <Icon size={18} />
                            </div>
                            <span className={`text-xs ${isActive ? 'text-white' : 'text-[#6a6a6a]'}`}>
                                {step.label}
                            </span>
                        </div>
                    )
                })}
            </div>

            {/* Step Content */}
            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-6 mb-6">
                <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                    {(() => {
                        const Icon = steps[currentStep].icon
                        return <Icon size={20} className="text-[#6366f1]" />
                    })()}
                    {steps[currentStep].label}
                </h3>
                {renderStepContent()}
            </div>

            {/* Navigation */}
            <div className="flex justify-between">
                <button
                    onClick={handleBack}
                    disabled={currentStep === 0}
                    className="flex items-center gap-2 px-4 py-2 text-[#a1a1aa] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    <ChevronLeft size={18} />
                    Back
                </button>

                <button
                    onClick={handleNext}
                    disabled={!canProceed()}
                    className="flex items-center gap-2 bg-[#6366f1] hover:bg-[#4f46e5] disabled:bg-[#4a4a4a] disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg font-medium transition-colors"
                >
                    {currentStep === steps.length - 1 ? (
                        <>
                            <Sparkles size={18} />
                            Generate PRD
                        </>
                    ) : (
                        <>
                            Next
                            <ChevronRight size={18} />
                        </>
                    )}
                </button>
            </div>
        </div>
    )
}
