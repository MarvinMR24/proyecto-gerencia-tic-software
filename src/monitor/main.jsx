import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import Monitor from './Monitor.jsx'
import './monitor.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Monitor />
  </StrictMode>,
)
