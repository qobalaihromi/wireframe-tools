import { useState, useRef, useEffect } from 'react'
import { Send, X, Bot, User, Sparkles } from 'lucide-react'
import { useVibeStore } from '../../stores/vibeStore'
import { useProjectStore } from '../../stores/projectStore'
import { useWireframeStore } from '../../stores/wireframeStore'
import { sendMessageToGemini } from '../../services/geminiService'

export function VibeAssistant() {
    const { isChatOpen, toggleChat, apiKey } = useVibeStore()
    const currentProject = useProjectStore((state) => state.getCurrentProject())
    const [messages, setMessages] = useState<{ role: 'user' | 'model'; content: string }[]>([
        { role: 'model', content: 'Hi! I am Vibe AI. I can help you design and build your app. What are we making today?' }
    ])
    const [input, setInput] = useState('')
    const [loading, setLoading] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    if (!isChatOpen) return null

    const handleSend = async () => {
        if (!input.trim() || loading) return

        if (!apiKey) {
            setMessages(prev => [...prev, { role: 'model', content: 'Please set your Gemini API Key in Settings (✨) first.' }])
            return
        }

        const userMessage = input
        setInput('')
        setMessages(prev => [...prev, { role: 'user', content: userMessage }])
        setLoading(true)

        try {
            // Simple intent detection for MVP
            const lowerMsg = userMessage.toLowerCase()
            const isGenerationRequest = lowerMsg.includes('screen') || lowerMsg.includes('page') || lowerMsg.includes('wireframe') || lowerMsg.includes('halaman') || lowerMsg.includes('design') || lowerMsg.includes('buatkan')

            if (isGenerationRequest) {
                setMessages(prev => [...prev, { role: 'model', content: 'Sure! Designing that for you... 🎨' }])

                // Dynamic Import
                const { generateWireframeFromPromt } = await import('../../services/geminiService')
                const wireframeData = await generateWireframeFromPromt(userMessage)

                console.log('GEN RESULT:', wireframeData)

                if (currentProject) {
                    useWireframeStore.getState().addGeneratedArtboard(currentProject.id, wireframeData)
                    setMessages(prev => [...prev, {
                        role: 'model',
                        content: `✅ Done! I created a wireframe for "**${wireframeData.artboardName}**". Check your canvas!`
                    }])
                } else {
                    setMessages(prev => [...prev, { role: 'model', content: 'Please create or select a project first.' }])
                }

            } else {
                // Normal Chat
                const response = await sendMessageToGemini(userMessage, messages)
                setMessages(prev => [...prev, { role: 'model', content: response }])
            }

        } catch (error: any) {
            setMessages(prev => [...prev, { role: 'model', content: `Sorry, I encountered an error: ${error.message}` }])
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed top-14 right-0 bottom-0 w-[400px] bg-[#1a1a1a] border-l border-[#2a2a2a] flex flex-col shadow-xl z-30 animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="h-12 border-b border-[#2a2a2a] flex items-center justify-between px-4 bg-[#202020]">
                <div className="flex items-center gap-2 text-[#a1a1aa]">
                    <Sparkles size={16} className="text-[#6366f1]" />
                    <span className="font-medium text-white">Vibe Assistant</span>
                </div>
                <button
                    onClick={() => toggleChat(false)}
                    className="text-[#a1a1aa] hover:text-white"
                >
                    <X size={18} />
                </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg, idx) => (
                    <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                        <div className={`
              w-8 h-8 rounded-full flex items-center justify-center shrink-0
              ${msg.role === 'user' ? 'bg-[#333]' : 'bg-[#6366f1]/20 text-[#6366f1]'}
            `}>
                            {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                        </div>
                        <div className={`
              max-w-[80%] rounded-lg p-3 text-sm leading-relaxed
              ${msg.role === 'user'
                                ? 'bg-[#252525] text-white border border-[#333]'
                                : 'bg-transparent text-[#d4d4d8]'}
            `}>
                            {msg.content}
                        </div>
                    </div>
                ))}
                {loading && (
                    <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#6366f1]/20 flex items-center justify-center shrink-0">
                            <Bot size={16} className="text-[#6366f1]" />
                        </div>
                        <div className="flex items-center gap-1 h-8">
                            <div className="w-2 h-2 bg-[#6366f1] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                            <div className="w-2 h-2 bg-[#6366f1] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                            <div className="w-2 h-2 bg-[#6366f1] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-[#2a2a2a] bg-[#202020]">
                <div className="relative">
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault()
                                handleSend()
                            }
                        }}
                        placeholder="Ask Vibe to generate screens..."
                        className="w-full bg-[#151515] border border-[#333] rounded-lg py-3 pl-4 pr-12 text-white placeholder:text-[#555] focus:outline-none focus:border-[#6366f1] resize-none h-[50px] max-h-[120px]"
                    />
                    <button
                        onClick={handleSend}
                        disabled={!input.trim() || loading}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-[#6366f1] hover:bg-[#6366f1]/10 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Send size={18} />
                    </button>
                </div>
            </div>
        </div>
    )
}
