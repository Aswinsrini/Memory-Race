import { useEffect } from 'react'
import { AnimatePresence } from 'framer-motion'
import Header from './components/Header'
import StartScreen from './components/StartScreen'
import MultiplayerLobby from './components/MultiplayerLobby'
import GameBoard from './components/GameBoard'
import GameStats from './components/GameStats'
import GameOverScreen from './components/GameOverScreen'
import OpponentProgress from './components/OpponentProgress'
import { useGame } from './context/GameContext'
import { useMP } from './context/MultiplayerContext'

function App() {
  const { gameStatus, startGame, forceLost } = useGame()
  const mp = useMP()

  // When multiplayer countdown finishes → start the local game
  useEffect(() => {
    if (mp.multiplayerPhase === 'playing' && gameStatus === 'idle') {
      startGame(mp.difficulty, { isMultiplayer: true })
    }
  }, [mp.multiplayerPhase, mp.difficulty, gameStatus, startGame])

  // When multiplayer game_over fires and we didn't win → force lost
  useEffect(() => {
    if (mp.multiplayerPhase === 'finished' && mp.gameResult) {
      if (mp.gameResult.winnerId !== mp.myId && gameStatus === 'playing') {
        forceLost()
      }
    }
  }, [mp.multiplayerPhase, mp.gameResult, mp.myId, gameStatus, forceLost])

  const showLobby = mp.multiplayerPhase === 'lobby' || mp.multiplayerPhase === 'countdown'
  const showGame = gameStatus === 'playing' || gameStatus === 'won' || gameStatus === 'lost'

  return (
    <div className="app-shell">
      <Header />

      <main className="app-main">
        <AnimatePresence mode="wait">
          {gameStatus === 'idle' && mp.multiplayerPhase === 'idle' && (
            <StartScreen key="start" />
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {showLobby && gameStatus === 'idle' && (
            <MultiplayerLobby key="lobby" />
          )}
        </AnimatePresence>

        {showGame && (
          <>
            <GameStats />
            <OpponentProgress />
            <GameBoard />
          </>
        )}

        <AnimatePresence>
          {(gameStatus === 'won' || gameStatus === 'lost') && (
            <GameOverScreen key="gameover" />
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}

export default App
