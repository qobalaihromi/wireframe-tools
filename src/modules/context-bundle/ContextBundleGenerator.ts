import { usePRDStore } from '../../stores/prdStore'
import { useFlowchartStore } from '../../stores/flowchartStore'
import { useWireframeStore } from '../../stores/wireframeStore'
import { generatePRDMarkdown } from '../../lib/prdTemplate'
import { generateWireframeDescription } from '../wireframe/utils/describeWireframe'

export async function generateContextBundle(projectId: string, projectName: string): Promise<string> {
    const prdData = usePRDStore.getState().getPRD(projectId)
    const flowchartData = useFlowchartStore.getState().getFlowchart(projectId)
    const artboards = useWireframeStore.getState().getArtboards(projectId)

    // 1. PROJECT HEADER
    let bundle = `# 📦 VIBE CONTEXT BUNDLE: ${projectName}\n`
    bundle += `> Date: ${new Date().toLocaleDateString('id-ID', { dateStyle: 'full' })}\n`
    bundle += `\n---\n\n`

    // 2. PRD SECTION
    if (prdData) {
        bundle += generatePRDMarkdown(prdData)
        bundle += `\n\n---\n\n`
    } else {
        bundle += `## 1. PRD\n\n(No PRD data found)\n\n---\n\n`
    }

    // 3. FLOWCHART SECTION
    bundle += `## 2. FLOWCHART\n\n`
    if (flowchartData && flowchartData.nodes.length > 0) {
        bundle += `### Nodes (${flowchartData.nodes.length})\n`
        flowchartData.nodes.forEach(node => {
            bundle += `- [${node.type || 'node'}] "${node.data.label || 'Node'}" (id: ${node.id})\n`
        })

        bundle += `\n### Connections (${flowchartData.edges.length})\n`
        flowchartData.edges.forEach(edge => {
            bundle += `- ${edge.source} -> ${edge.target} ${edge.label ? `[${edge.label}]` : ''}\n`
        })
    } else {
        bundle += `(No Flowchart data found)\n`
    }
    bundle += `\n---\n\n`

    // 4. WIREFRAME SECTION
    bundle += `## 3. WIREFRAMES\n\n`
    if (artboards.length > 0) {
        artboards.forEach(artboard => {
            bundle += generateWireframeDescription(artboard.name, artboard.shapes)
            bundle += `\n\n`
        })
    } else {
        bundle += `(No Wireframes found)\n`
    }

    bundle += `\n---\n`
    bundle += `> End of Bundle. Paste this into your AI assistant to give full context.\n`

    return bundle
}
