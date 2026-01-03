import { useState, useEffect } from 'react'
import { useProjectStore } from '../../stores/projectStore'
import { usePRDStore } from '../../stores/prdStore'
import type { PRDData } from '../../lib/prdTemplate'
import { BrainDumpForm } from './BrainDumpForm'
import { PRDPreview } from './PRDPreview'

type View = 'form' | 'preview'

export function PRDGenerator() {
    const currentProject = useProjectStore((state) => state.getCurrentProject())
    const { getPRD, savePRD } = usePRDStore()

    const [view, setView] = useState<View>('form')
    const [prdData, setPrdData] = useState<PRDData | null>(null)

    // Load existing PRD when project changes
    useEffect(() => {
        if (currentProject) {
            const existingPRD = getPRD(currentProject.id)
            if (existingPRD) {
                setPrdData(existingPRD)
                setView('preview')
            } else {
                setPrdData(null)
                setView('form')
            }
        }
    }, [currentProject?.id])

    if (!currentProject) {
        return (
            <div className="h-full flex items-center justify-center">
                <p className="text-[#a1a1aa]">Please select a project first</p>
            </div>
        )
    }

    const handleFormComplete = (data: PRDData) => {
        // Save to store
        savePRD(currentProject.id, data)
        setPrdData(data)
        setView('preview')
    }

    const handleEdit = () => {
        setView('form')
    }

    const handleSave = () => {
        if (prdData) {
            savePRD(currentProject.id, prdData)
        }
    }

    return (
        <div className="h-full overflow-auto p-6">
            {view === 'form' ? (
                <BrainDumpForm onComplete={handleFormComplete} />
            ) : prdData ? (
                <PRDPreview
                    data={prdData}
                    onEdit={handleEdit}
                    onSave={handleSave}
                />
            ) : null}
        </div>
    )
}
