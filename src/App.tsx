import { Sidebar } from './components/layout/Sidebar'
import { Header } from './components/layout/Header'
import { ProjectHub } from './modules/project-hub/ProjectHub'
import { PRDGenerator } from './modules/prd-generator/PRDGenerator'
import { FlowchartEditor } from './modules/flowchart/FlowchartEditor'
import { WireframeBuilder } from './modules/wireframe/WireframeBuilder'
import { ContextBundle } from './modules/context-bundle/ContextBundle'
import { useAppStore } from './stores/appStore'

function App() {
  const activeModule = useAppStore((state) => state.activeModule)

  const renderModule = () => {
    switch (activeModule) {
      case 'project-hub':
        return <ProjectHub />
      case 'prd':
        return <PRDGenerator />
      case 'flowchart':
        return <FlowchartEditor />
      case 'wireframe':
        return <WireframeBuilder />
      case 'bundle':
        return <ContextBundle />
      default:
        return <ProjectHub />
    }
  }

  return (
    <div className="flex w-full min-h-screen bg-[#0f0f0f]">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 overflow-auto">
          {renderModule()}
        </main>
      </div>
    </div>
  )
}

export default App
