import { useState, useEffect } from 'react'
import { AnimatePresence } from 'framer-motion'
import Header from './components/Header'
import StartScreen from './components/StartScreen'
import MultiplayerLobby from './components/MultiplayerLobby'
import GameBoard from './components/GameBoard'
import GameStats from './components/GameStats'
import GameOverScreen from './components/GameOverScreen'
import OpponentProgress from './components/OpponentProgress'
import GameResultsDashboard from './components/GameResultsDashboard'
import WaitingForPlayers from './components/WaitingForPlayers'
import FooterAction from './components/FooterAction'
import SignIn from './pages/SignIn'
import SignUp from './pages/SignUp'
import Profile from './pages/Profile'
import PublicGames from './pages/PublicGames'
import Leaderboard from './pages/Leaderboard'
import { useGame } from './context/GameContext'
import { useMP } from './context/MultiplayerContext'
import { useAuth } from './context/AuthContext'

function App() {
  const { gameStatus, startGame, resetGame } = useGame()
  const mp = useMP()
  const { user, profile, loading: authLoading } = useAuth()

  // Navigation state: 'home' | 'signin' | 'signup' | 'profile' | 'games' | 'leaderboard'
  const [page, setPage] = useState('home')

  // When multiplayer countdown finishes → start the local game
  useEffect(() => {
    if (mp.multiplayerPhase === 'playing' && gameStatus === 'idle') {
      startGame(mp.difficulty, { isMultiplayer: true })
    }
  }, [mp.multiplayerPhase, mp.difficulty, gameStatus, startGame])

  // Handle joining a room from PublicGames (by clicking a listed room or join-by-code)
  const handleJoinRoom = async (room) => {
    if (!user) return
    const username = profile?.display_name || profile?.username || 'Player'
    const success = await mp.joinRoom(room, user.id, username)
    if (success) setPage('home')
  }

  // Handle creating a room from PublicGames (already set up via mp.createRoom inside PublicGames)
  const handleCreateRoom = () => {
    // The multiplayer context is already set up by PublicGames calling mp.createRoom
    // Just navigate home to show the lobby
    setPage('home')
  }

  const showLobby = mp.multiplayerPhase === 'lobby' || mp.multiplayerPhase === 'countdown'
  const showGame = gameStatus === 'playing' || gameStatus === 'completed' || gameStatus === 'won' || gameStatus === 'lost'

  if (authLoading) {
    return (
      <div className="app-shell">
        <div className="app-main">
          <p style={{ color: 'var(--text-muted)' }}>Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="app-shell">
      <Header
        page={page}
        onNavigate={setPage}
      />

      <main className="app-main">
        {/* Auth pages */}
        <AnimatePresence mode="wait">
          {page === 'signin' && (
            <SignIn
              key="signin"
              onBack={() => setPage('home')}
              onSwitchToSignUp={() => setPage('signup')}
            />
          )}
          {page === 'signup' && (
            <SignUp
              key="signup"
              onBack={() => setPage('home')}
              onSwitchToSignIn={() => setPage('signin')}
            />
          )}
          {page === 'profile' && (
            <Profile key="profile" onBack={() => setPage('home')} />
          )}
          {page === 'games' && (
            <PublicGames
              key="games"
              onBack={() => setPage('home')}
              onJoinRoom={handleJoinRoom}
              onCreateRoom={handleCreateRoom}
            />
          )}
          {page === 'leaderboard' && (
            <Leaderboard key="leaderboard" onBack={() => setPage('home')} />
          )}
        </AnimatePresence>

        {/* Home: Start screen or game */}
        {page === 'home' && (
          <>
            <AnimatePresence mode="wait">
              {gameStatus === 'idle' && mp.multiplayerPhase === 'idle' && (
                <StartScreen key="start" onNavigate={setPage} />
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
                <FooterAction />
              </>
            )}

            {/* Solo win screen */}
            <AnimatePresence>
              {gameStatus === 'won' && !mp.isMultiplayer && (
                <GameOverScreen key="gameover" />
              )}
            </AnimatePresence>

            {/* Multiplayer: waiting for other players */}
            <AnimatePresence>
              {gameStatus === 'completed' && (
                <WaitingForPlayers key="waiting" />
              )}
            </AnimatePresence>

            {/* Multiplayer: all finished, show results dashboard */}
            <AnimatePresence>
              {mp.multiplayerPhase === 'results' && (
                <GameResultsDashboard key="results" />
              )}
            </AnimatePresence>
          </>
        )}
      </main>
    </div>
  )
}

export default App
