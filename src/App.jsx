import { useState } from 'react'
import Nav from './components/Nav'
import Inicio from './components/Inicio'
import Organigrama from './components/Organigrama'
import GestionTecnologia from './components/GestionTecnologia'
import CienciaTecnologia from './components/CienciaTecnologia'
import MisionVision from './components/MisionVision'
import DescripcionPuestos from './components/DescripcionPuestos'
import MBTI from './components/MBTI'
import Scrum from './components/Scrum'
import Bpmn from './components/Bpmn'
import Idef0 from './components/Idef0'
import Dashboard from './components/Dashboard'
import Monitoreo from './components/Monitoreo'
import SoporteExterno from './components/SoporteExterno'
import './App.css'

const TABS = [
  { id: 'inicio', label: 'Inicio', Component: Inicio },
  { id: 'gestion', label: 'Gestión de Tecnología', Component: GestionTecnologia },
  { id: 'ciencia', label: 'Ciencia, Tecnología e Innovación', Component: CienciaTecnologia },
  { id: 'mision-vision', label: 'Misión y Visión', Component: MisionVision },
  { id: 'organizacion', label: 'Organización', Component: Organigrama },
  { id: 'descripcion-puestos', label: 'Descripción de Posiciones', Component: DescripcionPuestos },
  { id: 'mbti', label: 'MBTI', Component: MBTI },
  { id: 'scrum', label: 'Scrum', Component: Scrum },
  { id: 'bpmn', label: 'BPMN', Component: Bpmn },
  { id: 'idef0', label: 'IDEF0', Component: Idef0 },
  { id: 'dashboard', label: 'Dashboard', Component: Dashboard },
  { id: 'monitoreo', label: 'Monitoreo', Component: Monitoreo },
  { id: 'soporte-externo', label: 'Soporte Externo', Component: SoporteExterno },
]

export default function App() {
  const [activeTab, setActiveTab] = useState('inicio')
  const [scrollTarget, setScrollTarget] = useState(null)
  const Active = TABS.find((t) => t.id === activeTab).Component

  function handleTabChange(id) {
    window.scrollTo(0, 0)
    setActiveTab(id)
    setScrollTarget(null)
  }

  function goToPosition(positionId) {
    window.scrollTo(0, 0)
    setActiveTab('descripcion-puestos')
    setScrollTarget(positionId)
  }

  return (
    <div className="app">
      <Nav tabs={TABS} activeTab={activeTab} onChange={handleTabChange} />
      <main key={activeTab} className="page">
        <Active onNavigate={goToPosition} scrollTarget={scrollTarget} />
      </main>
      <footer className="footer">
        <p>Área de Software Silk Road &middot; Proyecto académico de Gerencia de las TIC</p>
      </footer>
    </div>
  )
}
