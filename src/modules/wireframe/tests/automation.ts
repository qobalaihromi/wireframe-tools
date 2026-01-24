import { useWireframeStore } from '../../../stores/wireframeStore'

export interface TestResult {
    name: string
    passed: boolean
    message?: string
}

export const runAutomationTests = (): TestResult[] => {
    const results: TestResult[] = []
    const store = useWireframeStore.getState()
    const projectId = "test_auto_" + Date.now()

    try {
        // Test 1: Create Artboard
        const abId = store.addArtboard(projectId, "Test Board", 100, 100, 375, 812)
        const artboards = store.getArtboards(projectId)
        const ab = artboards.find(a => a.id === abId)

        if (ab) {
            results.push({ name: 'Create Artboard', passed: true })
        } else {
            throw new Error('Artboard not created')
        }

        const node1 = { id: 'n1', type: 'rect' as const, x: 0, y: 0, width: 100, height: 50, visible: true, opacity: 1, locked: false, name: 'Box 1', rotation: 0 }
        const node2 = { id: 'n2', type: 'rect' as const, x: 0, y: 0, width: 100, height: 50, visible: true, opacity: 1, locked: false, name: 'Box 2', rotation: 0 }

        store.addNode(projectId, abId, node1)
        store.addNode(projectId, abId, node2)

        const abWithNodes = store.getArtboards(projectId).find(a => a.id === abId)!
        if (abWithNodes.children.length === 2) {
            results.push({ name: 'Add Nodes', passed: true })
        } else {
            results.push({ name: 'Add Nodes', passed: false, message: `Expected 2 nodes, found ${abWithNodes.children.length}` })
        }

        // Test 3: Auto Layout Vertical
        // Apply Grid: Vertical, Gap 10, Padding 20
        store.updateLayout(projectId, abId, null, { type: 'vertical', gap: 10, padding: 20, align: 'start' })

        const abLayout = store.getArtboards(projectId).find(a => a.id === abId)!
        const c1 = abLayout.children.find(c => c.id === 'n1')!
        const c2 = abLayout.children.find(c => c.id === 'n2')!

        // Expected: c1 at y=20, c2 at y=20+50+10 = 80
        if (c1.y === 20 && c2.y === 80) {
            results.push({ name: 'Auto Layout (Vertical)', passed: true })
        } else {
            results.push({ name: 'Auto Layout (Vertical)', passed: false, message: `Positions incorrect: c1.y=${c1.y}, c2.y=${c2.y}` })
        }

        // Test 4: Update Layout to Horizontal
        store.updateLayout(projectId, abId, null, { type: 'horizontal', gap: 5, padding: 15, align: 'start' })
        const abHorizontal = store.getArtboards(projectId).find(a => a.id === abId)!
        const ch1 = abHorizontal.children.find(c => c.id === 'n1')!
        const ch2 = abHorizontal.children.find(c => c.id === 'n2')!

        // Expected: c1 at x=15, c2 at x=15+100+5 = 120
        if (ch1.x === 15 && ch2.x === 120) {
            results.push({ name: 'Auto Layout (Horizontal)', passed: true })
        } else {
            results.push({ name: 'Auto Layout (Horizontal)', passed: false, message: `Positions incorrect: c1.x=${ch1.x}, c2.x=${ch2.x}` })
        }

        // Cleanup
        store.deleteArtboard(projectId, abId)

    } catch (e: any) {
        results.push({ name: 'Exception Occurred', passed: false, message: e.message })
    }

    return results
}
