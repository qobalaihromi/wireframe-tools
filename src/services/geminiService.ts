import { GoogleGenerativeAI } from '@google/generative-ai'
import { useVibeStore } from '../stores/vibeStore'
import { WIREFRAME_SYSTEM_PROMPT } from './wireframePrompt'

export const getGeminiModel = () => {
    const { apiKey, model } = useVibeStore.getState()
    if (!apiKey) {
        throw new Error('API Key not found. Please set your Gemini API Key in Settings.')
    }
    const genAI = new GoogleGenerativeAI(apiKey)
    return genAI.getGenerativeModel({
        model: model || 'gemini-1.5-flash',
        generationConfig: { responseMimeType: "application/json" }
    })
}

export const getChatModel = () => {
    const { apiKey, model } = useVibeStore.getState()
    if (!apiKey) {
        throw new Error('API Key not found.')
    }
    const genAI = new GoogleGenerativeAI(apiKey)
    return genAI.getGenerativeModel({ model: model || 'gemini-1.5-flash' })
}

export const generateWireframeFromPromt = async (userPrompt: string) => {
    try {
        const model = getGeminiModel() // Uses JSON mime type
        const result = await model.generateContent([
            WIREFRAME_SYSTEM_PROMPT,
            `USER REQUEST: ${userPrompt}`
        ])
        const response = await result.response
        return JSON.parse(response.text())
    } catch (error: any) {
        console.error('Wireframe Gen Error:', error)
        throw new Error('Failed to generate wireframe. ' + error.message)
    }
}

// Removed duplicate getGeminiModel

export const sendMessageToGemini = async (prompt: string, history: any[] = []) => {
    try {
        const model = getChatModel() // Use Chat Model (Text Mime Type)
        const chat = model.startChat({
            history: history.map(h => ({
                role: h.role === 'user' ? 'user' : 'model',
                parts: [{ text: h.content }],
            })),
        })

        const result = await chat.sendMessage(prompt)
        const response = await result.response
        return response.text()
    } catch (error: any) {
        console.error('Gemini API Error:', error)
        throw new Error(error.message || 'Failed to connect to Gemini')
    }
}
