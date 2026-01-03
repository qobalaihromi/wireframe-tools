import type { Shape } from '../../../stores/wireframeStore'

export function generateWireframeDescription(artboardName: string, shapes: Shape[]): string {
    if (shapes.length === 0) {
        return `## Wireframe: ${artboardName}\n(Empty Artboard)`
    }

    const shapeDescriptions = shapes.map(shape => {
        const position = `(x: ${Math.round(shape.x)}, y: ${Math.round(shape.y)})`
        let details = ''

        switch (shape.type) {
            case 'text':
                details = `"${shape.text || ''}" (FontSize: ${shape.fontSize})`
                break
            case 'button':
                details = `Label: "${shape.text || 'Button'}"`
                break
            case 'input':
                details = `Placeholder: "${shape.text || 'Input'}"`
                break
            case 'rect':
                details = `Size: ${Math.round(shape.width)}x${Math.round(shape.height)} - Fill: ${shape.fill}`
                break
            case 'circle':
                details = `Size: ${Math.round(shape.width)}x${Math.round(shape.height)} - Fill: ${shape.fill}`
                break
            case 'line':
            case 'arrow':
                details = `Stroke: ${shape.stroke}, Width: ${shape.strokeWidth}`
                break
            default:
                details = `Type: ${shape.type}`
        }

        return `- [${shape.type.toUpperCase()}] ${details} ${position}`
    })

    return `## Wireframe: ${artboardName}\n${shapeDescriptions.join('\n')}`
}
