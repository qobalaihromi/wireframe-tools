import type Konva from 'konva'
import type { Artboard } from '../../../stores/wireframeStore'

/**
 * Export a single artboard to PNG
 */
export async function exportArtboardToPNG(
    stage: Konva.Stage,
    artboard: Artboard,
    scale: number = 2 // 2x for retina/hi-res
): Promise<void> {
    // Get stage scale and position
    const stageScale = stage.scaleX()
    const stagePos = { x: stage.x(), y: stage.y() }

    // Calculate artboard bounds in stage coordinates
    const artboardX = artboard.x * stageScale + stagePos.x
    const artboardY = artboard.y * stageScale + stagePos.y
    const artboardWidth = artboard.width * stageScale
    const artboardHeight = artboard.height * stageScale

    // Clone the stage for export (to avoid affecting the visible stage)
    const dataURL = stage.toDataURL({
        x: artboardX,
        y: artboardY,
        width: artboardWidth,
        height: artboardHeight,
        pixelRatio: scale,
        mimeType: 'image/png',
    })

    // Trigger download
    downloadDataURL(dataURL, `${sanitizeFilename(artboard.name)}.png`)
}

/**
 * Export all artboards as separate PNG files
 */
export async function exportAllArtboardsToPNG(
    stage: Konva.Stage,
    artboards: Artboard[],
    scale: number = 2
): Promise<void> {
    for (const artboard of artboards) {
        await exportArtboardToPNG(stage, artboard, scale)
        // Small delay between downloads to prevent browser blocking
        await new Promise(resolve => setTimeout(resolve, 300))
    }
}

/**
 * Download a data URL as a file
 */
function downloadDataURL(dataURL: string, filename: string): void {
    const link = document.createElement('a')
    link.download = filename
    link.href = dataURL
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
}

/**
 * Sanitize filename for safe download
 */
function sanitizeFilename(name: string): string {
    return name
        .replace(/[^a-z0-9\s\-_]/gi, '') // Remove special characters
        .replace(/\s+/g, '_') // Replace spaces with underscores
        .toLowerCase()
        .substring(0, 50) // Limit length
        || 'artboard' // Fallback if empty
}

/**
 * Export artboard to clipboard (for pasting into other apps)
 */
export async function copyArtboardToClipboard(
    stage: Konva.Stage,
    artboard: Artboard,
    scale: number = 2
): Promise<boolean> {
    try {
        const stageScale = stage.scaleX()
        const stagePos = { x: stage.x(), y: stage.y() }

        const artboardX = artboard.x * stageScale + stagePos.x
        const artboardY = artboard.y * stageScale + stagePos.y
        const artboardWidth = artboard.width * stageScale
        const artboardHeight = artboard.height * stageScale

        const dataURL = stage.toDataURL({
            x: artboardX,
            y: artboardY,
            width: artboardWidth,
            height: artboardHeight,
            pixelRatio: scale,
            mimeType: 'image/png',
        })

        // Convert data URL to blob
        const response = await fetch(dataURL)
        const blob = await response.blob()

        // Copy to clipboard
        await navigator.clipboard.write([
            new ClipboardItem({
                'image/png': blob
            })
        ])

        return true
    } catch {
        console.error('Failed to copy to clipboard')
        return false
    }
}
