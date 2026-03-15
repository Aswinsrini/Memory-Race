import { motion } from 'framer-motion'
import { Trophy, Medal, Award, RotateCcw, Home, Timer, MousePointerClick } from 'lucide-react'
import { useMP } from '../context/MultiplayerContext'
import { useGame } from '../context/GameContext'
import { useAuth } from '../context/AuthContext'

function formatTime(ms) {
  if (!ms) return '--'
  const s = Math.floor(ms / 1000)
  return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`
}

const RANK_CONFIG = [
  { bg: 'linear-gradient(135deg, #f59e0b, #eab308)', shadow: 'rgba(245,158,11,0.4)', icon: Trophy, label: '1st Place' },
  { bg: 'linear-gradient(135deg, #94a3b8, #cbd5e1)', shadow: 'rgba(148,163,184,0.3)', icon: Medal, label: '2nd Place' },
  { bg: 'linear-gradient(135deg, #d97706, #b45309)', shadow: 'rgba(217,119,6,0.3)', icon: Award, label: '3rd Place' },
]

export default function GameResultsDashboard() {
  const { rankings, playAgain, leaveRoom, multiplayerPhase } = useMP()
  const { resetGame } = useGame()
  const { user } = useAuth()

  if (multiplayerPhase !== 'results' || rankings.length === 0) return null

  const handleMenu = () => {
    leaveRoom(user?.id)
    resetGame()
  }

  const handlePlayAgain = () => {
    resetGame()
    playAgain()
  }

  return (
    <div className="overlay-backdrop">
      <motion.div
        className="glass"
        style={{
          position: 'relative', zIndex: 10, borderRadius: '1.5rem',
          padding: '1.75rem 1.5rem', maxWidth: '420px', width: '100%',
          textAlign: 'center', boxShadow: 'var(--shadow-lg)',
          maxHeight: '90vh', overflowY: 'auto',
        }}
        initial={{ scale: 0.5, y: 40, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
      >
        <h2 style={{
          fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)',
          marginBottom: '0.25rem',
        }}>
          Race Results
        </h2>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
          All players have finished!
        </p>

        {/* Rankings */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.25rem' }}>
          {rankings.map((player, idx) => {
            const config = RANK_CONFIG[idx]
            const RankIcon = config?.icon
            const isMe = player.userId === user?.id

            return (
              <motion.div
                key={player.userId}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.6rem',
                  padding: '0.7rem 0.85rem', borderRadius: '14px',
                  background: isMe ? 'rgba(99,102,241,0.1)' : 'var(--bg-secondary)',
                  border: isMe ? '1.5px solid var(--accent)' : '1px solid var(--border)',
                }}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                {/* Rank badge */}
                <div style={{
                  width: '2.25rem', height: '2.25rem', borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: config?.bg || 'var(--bg-card)',
                  boxShadow: config ? `0 0 12px ${config.shadow}` : undefined,
                  flexShrink: 0,
                }}>
                  {RankIcon ? (
                    <RankIcon size={16} color="#fff" />
                  ) : (
                    <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-muted)' }}>
                      {player.rank}
                    </span>
                  )}
                </div>

                {/* Player info */}
                <div style={{ flex: 1, textAlign: 'left', minWidth: 0 }}>
                  <p style={{
                    fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {player.username}
                    {isMe && <span style={{ fontSize: '0.65rem', color: 'var(--accent)', marginLeft: '0.3rem' }}>(you)</span>}
                  </p>
                </div>

                {/* Stats */}
                <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', flexShrink: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                    <Timer size={12} style={{ color: 'var(--text-muted)' }} />
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                      {formatTime(player.elapsedMs)}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                    <MousePointerClick size={12} style={{ color: 'var(--text-muted)' }} />
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                      {player.moves}
                    </span>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Winner callout */}
        {rankings[0] && (
          <motion.div
            style={{
              padding: '0.75rem', borderRadius: '12px', marginBottom: '1rem',
              background: 'linear-gradient(135deg, rgba(245,158,11,0.15), rgba(234,179,8,0.1))',
              border: '1px solid rgba(245,158,11,0.3)',
            }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
          >
            <p style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {rankings[0].userId === user?.id ? 'You won the race!' : `${rankings[0].username} wins!`}
            </p>
          </motion.div>
        )}

        {/* Buttons */}
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <motion.button
            onClick={handlePlayAgain} className="btn btn-primary" style={{ flex: 1 }}
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
          >
            <RotateCcw size={16} /> Play Again
          </motion.button>
          <motion.button
            onClick={handleMenu} className="btn btn-secondary"
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
          >
            <Home size={16} /> Menu
          </motion.button>
        </div>
      </motion.div>
    </div>
  )
}
