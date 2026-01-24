import { useState } from 'react'
import { Beaker, Check, X } from 'lucide-react'
import { runAutomationTests, type TestResult } from '../tests/automation'

export const DebugPanel = () => {
    const [isOpen, setIsOpen] = useState(false)
    const [results, setResults] = useState<TestResult[]>([])

    const runTests = () => {
        const res = runAutomationTests()
        setResults(res)
    }

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-4 left-4 bg-gray-800 p-2 rounded-full text-white hover:bg-gray-700 shadow-lg z-50 transform transition-transform hover:scale-110"
                title="Open Debug Panel"
            >
                <Beaker size={20} />
            </button>
        )
    }

    return (
        <div className="fixed bottom-4 left-4 bg-[#1a1a1a] border border-[#333] rounded-lg shadow-xl p-4 w-80 text-white z-50">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold flex items-center gap-2">
                    <Beaker size={16} className="text-purple-400" />
                    Diagnostics
                </h3>
                <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white">
                    <X size={16} />
                </button>
            </div>

            <button
                onClick={runTests}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded text-sm font-medium mb-4 transition-colors"
            >
                Run Automation Tests
            </button>

            <div className="space-y-2 max-h-60 overflow-y-auto">
                {results.length === 0 && <p className="text-gray-500 text-xs text-center">No tests run yet.</p>}
                {results.map((res, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs bg-[#252525] p-2 rounded">
                        {res.passed ? (
                            <Check size={14} className="text-green-500 mt-0.5 shrink-0" />
                        ) : (
                            <X size={14} className="text-red-500 mt-0.5 shrink-0" />
                        )}
                        <div>
                            <span className={res.passed ? 'text-gray-200' : 'text-red-300'}>{res.name}</span>
                            {!res.passed && <p className="text-gray-500 mt-1">{res.message}</p>}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
