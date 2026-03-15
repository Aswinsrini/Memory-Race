import { motion } from 'framer-motion'
import { Clock, Check } from 'lucide-react'
import { useMP } from '../context/MultiplayerContext'
import { useAuth } from '../context/AuthContext'

export default function WaitingForPlayers() {
  const { opponentProgress, players } = useMP()
  const { user } = useAuth()

  // Build status of all players
  const allPlayers = players.map(p => {
    const progress = opponentProgress[p.id]
    return {
      ...p,
      finished: p.id === user?.id ? true : (progress?.finished || false),
      matchedPairs: p.id === user?.id ? '✓' : (progress?.matchedPairs || 0),
      totalPairs: progress?.totalPairs || 0,
    }
  })

  const finishedCount = allPlayers.filter(p => p.finished).length
  const totalCount = allPlayers.length

  return (
    <div className="overlay-backdrop">
      <motion.div
        className="glass"
        style={{
          position: 'relative', zIndex: 10, borderRadius: '1.5rem',
          padding: '2rem 1.5rem', maxWidth: '380px', width: '100%',
          textAlign: 'center', boxShadow: 'var(--shadow-lg)',
        }}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
      >
        {/* Animated clock */}
        <motion.div
          style={{
            width: '4rem', height: '4rem', borderRadius: '50%', margin: '0 auto 1rem',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'linear-gradient(135deg, var(--accent), #8b5cf6)',
            boxShadow: '0 0 20px var(--accent-glow)',
          }}
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
        >
          <Clock size={28} color="#fff" />
        </motion.div>

        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
          You Finished!
        </h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
          Waiting for other players... ({finishedCount}/{totalCount})
        </p>

        {/* Player statuses */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '1rem' }}>
          {allPlayers.map((p, idx) => (
            <motion.div
              key={p.id}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '0.5rem 0.75rem', borderRadius: '10px',
                background: 'var(--bg-secondary)', border: '1px solid var(--border)',
              }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <span style={{
                fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {p.username}
                {p.id === user?.id && (
                  <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', marginLeft: '0.3rem' }}>(you)</span>
                )}
              </span>
              {p.finished ? (
                <span style={{
                  display: 'flex', alignItems: 'center', gap: '0.2rem',
                  fontSize: '0.7rem', fontWeight: 700, color: 'var(--success)',
                }}>
                  <Check size={12} /> Done
                </span>
              ) : (
                <span style={{
                  fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)',
                }}>
                  Playing...
                </span>
              )}
            </motion.div>
          ))}
        </div>

        {/* Progress bar */}
        <div style={{
          width: '100%', height: '6px', borderRadius: '100px',
          background: 'var(--bg-secondary)', border: '1px solid var(--border)',
          overflow: 'hidden',
        }}>
          <motion.div
            style={{
              height: '100%', borderRadius: '100px',
              background: 'linear-gradient(90deg, var(--accent), var(--success))',
            }}
            animate={{ width: `${(finishedCount / totalCount) * 100}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>
      </motion.div>
    </div>
  )
}
