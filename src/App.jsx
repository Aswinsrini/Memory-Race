import { AnimatePresence } from 'framer-motion'
import Header from './components/Header'
import StartScreen from './components/StartScreen'
import GameBoard from './components/GameBoard'
import GameStats from './components/GameStats'
import GameOverScreen from './components/GameOverScreen'
import { useGame } from './context/GameContext'

function App() {
  const { gameStatus } = useGame()

  return (
    <div className="app-shell">
      <Header />

      <main className="app-main">
        <AnimatePresence mode="wait">
          {gameStatus === 'idle' && <StartScreen key="start" />}
        </AnimatePresence>

        {gameStatus !== 'idle' && (
          <>
            <GameStats />
            <GameBoard />
          </>
        )}

        <AnimatePresence>
          {gameStatus === 'won' && <GameOverScreen key="gameover" />}
        </AnimatePresence>
      </main>
    </div>
  )
}

export default App
