import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { applyTheme, projectName } from '../design/adapters/web/studio-theme'
import './index.css'
import App from './App.tsx'

// Colours, fonts and corners come from design/tokens.json (Universal App Studio writes it).
applyTheme()
document.title = projectName

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
