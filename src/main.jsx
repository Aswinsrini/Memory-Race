import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ThemeProvider } from './context/ThemeContext'
import { GameProvider } from './context/GameContext'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <GameProvider>
        <App />
      </GameProvider>
    </ThemeProvider>
  </StrictMode>,
)
