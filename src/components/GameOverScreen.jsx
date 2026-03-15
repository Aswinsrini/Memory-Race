import { useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Trophy, RotateCcw, Home, Timer, MousePointerClick } from 'lucide-react'
import { useGame } from '../context/GameContext'

function formatTime(ms) {
  const totalSec = Math.floor(ms / 1000)
  const min = Math.floor(totalSec / 60)
  const sec = totalSec % 60
  return `${min}:${sec.toString().padStart(2, '0')}`
}

export default function GameOverScreen() {
  const { gameStatus, moves, elapsed, totalPairs, resetGame, startGame, difficulty } = useGame()

  const isWon = gameStatus === 'won'

  const handleMenu = useCallback(() => {
    resetGame()
  }, [resetGame])

  const handlePlayAgain = useCallback(() => {
    startGame(difficulty)
  }, [startGame, difficulty])

  // Escape key
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') handleMenu()
  }, [handleMenu])

  useEffect(() => {
    if (isWon) {
      window.addEventListener('keydown', handleKeyDown)
      return () => window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isWon, handleKeyDown])

  // Only show for solo wins — multiplayer uses WaitingForPlayers + GameResultsDashboard
  if (!isWon) return null

  // Star rating
  const efficiency = moves / totalPairs
  const stars = efficiency <= 1.2 ? 3 : efficiency <= 1.8 ? 2 : 1

  return (
    <div className="overlay-backdrop">
      <motion.div
        className="glass"
        style={{
          position: 'relative',
          zIndex: 10,
          borderRadius: '1.5rem',
          padding: '2rem 1.75rem',
          maxWidth: '360px',
          width: '100%',
          textAlign: 'center',
          boxShadow: 'var(--shadow-lg)',
        }}
        initial={{ scale: 0.5, y: 40, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.1 }}
      >
        {/* Trophy */}
        <motion.div
          style={{
            width: '4.5rem',
            height: '4.5rem',
            borderRadius: '50%',
            margin: '0 auto 1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #f59e0b, #eab308)',
            boxShadow: '0 0 30px rgba(245, 158, 11, 0.4)',
          }}
          animate={{ rotate: [0, 8, -8, 0], scale: [1, 1.08, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Trophy size={32} color="#fff" />
        </motion.div>

        <h2 style={{
          fontSize: '1.5rem',
          fontWeight: 800,
          color: 'var(--text-primary)',
          marginBottom: '0.25rem',
        }}>
          You Won!
        </h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
          Outstanding memory
        </p>

        {/* Stars */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '0.25rem',
          marginBottom: '1.25rem',
        }}>
          {[1, 2, 3].map(i => (
            <motion.span
              key={i}
              style={{ fontSize: '2rem', lineHeight: 1 }}
              initial={{ opacity: 0, y: 15, rotate: -20 }}
              animate={{ opacity: 1, y: 0, rotate: 0 }}
              transition={{ delay: 0.3 + i * 0.12, type: 'spring', stiffness: 300 }}
            >
              {i <= stars ? '⭐' : '☆'}
            </motion.span>
          ))}
        </div>

        {/* Stats */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '1.5rem',
          marginBottom: '1.5rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Timer size={15} style={{ color: 'var(--accent)' }} />
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {formatTime(elapsed)}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <MousePointerClick size={15} style={{ color: 'var(--accent)' }} />
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {moves} moves
            </span>
          </div>
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <motion.button
            onClick={handlePlayAgain}
            className="btn btn-primary"
            style={{ flex: 1 }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <RotateCcw size={16} />
            Play Again
          </motion.button>
          <motion.button
            onClick={handleMenu}
            className="btn btn-secondary"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <Home size={16} />
            Menu
          </motion.button>
        </div>

        <p style={{
          marginTop: '1rem',
          fontSize: '0.65rem',
          color: 'var(--text-muted)',
          letterSpacing: '0.05em',
        }}>
          Press <kbd style={{
            padding: '0.1rem 0.35rem',
            borderRadius: '4px',
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border)',
            fontFamily: 'inherit',
            fontWeight: 600,
          }}>Esc</kbd> to return to menu
        </p>
      </motion.div>
    </div>
  )
}
