import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ThemeProvider } from './context/ThemeContext'
import { GameProvider } from './context/GameContext'
import { MultiplayerProvider } from './context/MultiplayerContext'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <GameProvider>
        <MultiplayerProvider>
          <App />
        </MultiplayerProvider>
      </GameProvider>
    </ThemeProvider>
  </StrictMode>,
)
