import { useState } from 'react'
import { X, Check, AlertCircle, Key, Loader2 } from 'lucide-react'
import { useVibeStore } from '../../stores/vibeStore'
import { sendMessageToGemini } from '../../services/geminiService'

export function VibeSettingsModal() {
    const { apiKey, setApiKey, isOpen, toggleVibe } = useVibeStore()
    const [inputKey, setInputKey] = useState(apiKey)
    const [status, setStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle')
    const [errorMessage, setErrorMessage] = useState('')
    const [availableModels, setAvailableModels] = useState<string[]>([])

    if (!isOpen) return null

    const handleSave = () => {
        setApiKey(inputKey)
        toggleVibe(false)
    }

    const handleTestConnection = async () => {
        setStatus('testing')
        setErrorMessage('')
        try {
            // Temporarily set key for testing if not saved yet
            useVibeStore.setState({ apiKey: inputKey })
            await sendMessageToGemini('Hello, just testing the connection. Reply with "OK".')
            setStatus('success')
        } catch (error: any) {
            console.error(error)
            setStatus('error')
            setErrorMessage(error.message || 'Connection failed')
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="w-[500px] bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl shadow-2xl p-6">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-2">
                        <span className="text-xl">✨</span>
                        <h2 className="text-lg font-semibold text-white">Vibe AI Settings</h2>
                    </div>
                    <button
                        onClick={() => toggleVibe(false)}
                        className="text-[#a1a1aa] hover:text-white transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-[#a1a1aa] mb-2">
                            Gemini API Key
                        </label>
                        <div className="relative">
                            <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a1a1aa]" size={16} />
                            <input
                                type="password"
                                value={inputKey}
                                onChange={(e) => setInputKey(e.target.value)}
                                placeholder="AIzaSy..."
                                className="w-full bg-[#252525] border border-[#333] rounded-lg py-2.5 pl-10 pr-4 text-white placeholder:text-[#555] focus:outline-none focus:border-[#6366f1] transition-colors"
                            />
                        </div>
                        <p className="mt-2 text-xs text-[#666]">
                            Your key is stored locally in your browser. We never see it.
                            <a
                                href="https://aistudio.google.com/app/apikey"
                                target="_blank"
                                rel="noreferrer"
                                className="ml-1 text-[#6366f1] hover:underline"
                            >
                                Get a key here
                            </a>
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-[#a1a1aa] mb-2">
                            Model Name
                        </label>
                        <input
                            type="text"
                            value={useVibeStore.getState().model}
                            onChange={(e) => useVibeStore.getState().setModel(e.target.value)}
                            placeholder="gemini-1.5-flash"
                            className="w-full bg-[#252525] border border-[#333] rounded-lg py-2.5 px-4 text-white placeholder:text-[#555] focus:outline-none focus:border-[#6366f1] transition-colors"
                        />
                        <p className="mt-2 text-xs text-[#666]">
                            Try: <code>gemini-1.5-flash</code>, <code>gemini-pro</code>, or <code>gemini-1.5-pro</code>
                        </p>
                        {availableModels.length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-2 max-h-[150px] overflow-y-auto pr-2 border border-[#333] p-2 rounded-lg">
                                {availableModels.map(model => (
                                    <button
                                        key={model}
                                        onClick={() => useVibeStore.getState().setModel(model)}
                                        className="text-xs px-2 py-1 bg-[#6366f1]/20 text-[#a5b4fc] rounded hover:bg-[#6366f1]/30 transition-colors"
                                    >
                                        {model}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {status === 'success' && (
                        <div className="flex items-center gap-2 text-green-400 text-sm bg-green-400/10 p-3 rounded-lg border border-green-400/20">
                            <Check size={16} />
                            <span>Connection successful! You are ready to vibe.</span>
                        </div>
                    )}

                    {status === 'error' && (
                        <div className="flex items-center gap-2 text-red-400 text-sm bg-red-400/10 p-3 rounded-lg border border-red-400/20">
                            <AlertCircle size={16} />
                            <span>{errorMessage}</span>
                        </div>
                    )}



                    <div className="flex justify-between gap-3 pt-2">
                        <button
                            onClick={async () => {
                                setErrorMessage('')
                                setStatus('testing')
                                try {
                                    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${inputKey}`)
                                    const data = await response.json()
                                    if (data.error) throw new Error(data.error.message)

                                    const modelNames = data.models?.map((m: any) => m.name.replace('models/', '')) || []
                                    setAvailableModels(modelNames)
                                    setStatus('idle')
                                } catch (e: any) {
                                    setErrorMessage(e.message)
                                    setStatus('error')
                                }
                            }}
                            className="px-4 py-2 text-sm font-medium text-[#6366f1] hover:bg-[#6366f1]/10 rounded-lg transition-colors border border-[#6366f1]/20"
                        >
                            Check Available Models
                        </button>
                        <div className="flex gap-3">
                            <button
                                onClick={handleTestConnection}
                                disabled={!inputKey || status === 'testing'}
                                className="px-4 py-2 text-sm font-medium text-[#a1a1aa] hover:text-white hover:bg-[#252525] rounded-lg transition-colors disabled:opacity-50"
                            >
                                {status === 'testing' ? (
                                    <div className="flex items-center gap-2">
                                        <Loader2 size={16} className="animate-spin" />
                                        Testing...
                                    </div>
                                ) : (
                                    'Test Connection'
                                )}
                            </button>
                            <button
                                onClick={handleSave}
                                className="px-4 py-2 text-sm font-medium bg-[#6366f1] text-white rounded-lg hover:bg-[#5558dd] transition-colors shadow-[0_0_15px_rgba(99,102,241,0.3)]"
                            >
                                Save Customization
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
