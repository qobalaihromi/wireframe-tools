import { Line } from 'react-konva'

interface GridOverlayProps {
    visible: boolean
    cellSize: number
    width: number
    height: number
    offsetX: number
    offsetY: number
}

export function GridOverlay({ visible, cellSize, width, height, offsetX, offsetY }: GridOverlayProps) {
    if (!visible) return null

    const lines = []

    // Calculate grid lines that are visible in the viewport
    // We need to account for the canvas offset (pan position)
    const startX = Math.floor(-offsetX / cellSize) * cellSize
    const endX = startX + width + cellSize * 2
    const startY = Math.floor(-offsetY / cellSize) * cellSize
    const endY = startY + height + cellSize * 2

    // Vertical lines
    for (let x = startX; x <= endX; x += cellSize) {
        lines.push(
            <Line
                key={`v-${x}`}
                points={[x, startY, x, endY]}
                stroke="#333"
                strokeWidth={1}
                opacity={0.3}
                listening={false}
            />
        )
    }

    // Horizontal lines
    for (let y = startY; y <= endY; y += cellSize) {
        lines.push(
            <Line
                key={`h-${y}`}
                points={[startX, y, endX, y]}
                stroke="#333"
                strokeWidth={1}
                opacity={0.3}
                listening={false}
            />
        )
    }

    return <>{lines}</>
}

// Utility function for snapping
export function snapToGrid(value: number, cellSize: number): number {
    return Math.round(value / cellSize) * cellSize
}
