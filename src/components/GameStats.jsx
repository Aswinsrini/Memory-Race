import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Timer, MousePointerClick, Trophy } from 'lucide-react'
import { useGame } from '../context/GameContext'

function formatTime(ms) {
  const totalSec = Math.floor(ms / 1000)
  const min = Math.floor(totalSec / 60)
  const sec = totalSec % 60
  return `${min}:${sec.toString().padStart(2, '0')}`
}

function StatBadge({ icon: Icon, label, value }) {
  return (
    <div
      className="glass"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.5rem 0.875rem',
        borderRadius: '12px',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      <Icon size={15} style={{ color: 'var(--accent)', flexShrink: 0 }} />
      <div>
        <p style={{
          fontSize: '0.6rem',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          fontWeight: 600,
          color: 'var(--text-muted)',
          lineHeight: 1,
          marginBottom: '2px',
        }}>{label}</p>
        <p style={{
          fontSize: '0.85rem',
          fontWeight: 700,
          color: 'var(--text-primary)',
          lineHeight: 1,
        }}>{value}</p>
      </div>
    </div>
  )
}

export default function GameStats() {
  const { moves, matchedPairs, totalPairs, gameStatus, startTime, elapsed, setElapsed } = useGame()
  const timerRef = useRef(null)

  useEffect(() => {
    if (gameStatus === 'playing' && startTime) {
      timerRef.current = setInterval(() => {
        setElapsed(Date.now() - startTime)
      }, 100)
    }
    return () => clearInterval(timerRef.current)
  }, [gameStatus, startTime, setElapsed])

  // Stop timer when player finishes (solo won or multiplayer completed)
  useEffect(() => {
    if (gameStatus === 'won' || gameStatus === 'completed') {
      clearInterval(timerRef.current)
    }
  }, [gameStatus])

  if (gameStatus === 'idle') return null

  const progress = totalPairs > 0 ? (matchedPairs / totalPairs) * 100 : 0

  return (
    <motion.div
      style={{ width: '100%', maxWidth: '480px', margin: '0 auto', padding: '0 0.5rem' }}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Stats Row */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
        marginBottom: '0.75rem',
        flexWrap: 'wrap',
      }}>
        <StatBadge icon={Timer} label="Time" value={formatTime(elapsed)} />
        <StatBadge icon={MousePointerClick} label="Moves" value={moves} />
        <StatBadge icon={Trophy} label="Pairs" value={`${matchedPairs}/${totalPairs}`} />
      </div>

      {/* Progress Bar */}
      <div style={{
        width: '100%',
        height: '6px',
        borderRadius: '100px',
        overflow: 'hidden',
        position: 'relative',
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border)',
      }}>
        <motion.div
          className="progress-shimmer"
          style={{
            height: '100%',
            borderRadius: '100px',
            position: 'relative',
            overflow: 'hidden',
            background: 'linear-gradient(90deg, var(--accent), var(--success))',
          }}
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>
    </motion.div>
  )
}
