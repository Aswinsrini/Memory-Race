import { motion } from 'framer-motion'
import { useMP } from '../context/MultiplayerContext'

export default function OpponentProgress() {
  const { players, myId, multiplayerPhase } = useMP()

  if (multiplayerPhase !== 'playing' || players.length < 2) return null

  const opponents = players.filter(p => p.id !== myId)

  return (
    <motion.div
      style={{
        width: '100%',
        maxWidth: '480px',
        margin: '0 auto',
        padding: '0 0.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
      }}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <p style={{
        fontSize: '0.6rem',
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '0.1em',
        color: 'var(--text-muted)',
        textAlign: 'center',
      }}>Opponents</p>

      {opponents.map(opp => {
        const progress = opp.totalPairs > 0
          ? (opp.matchedPairs / opp.totalPairs) * 100
          : 0

        return (
          <div
            key={opp.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
            }}
          >
            <span style={{
              fontSize: '0.75rem',
              fontWeight: 600,
              color: 'var(--text-secondary)',
              minWidth: '70px',
              textAlign: 'right',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}>
              {opp.username}
            </span>

            {/* Progress bar */}
            <div style={{
              flex: 1,
              height: '8px',
              borderRadius: '100px',
              overflow: 'hidden',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border)',
              position: 'relative',
            }}>
              <motion.div
                style={{
                  height: '100%',
                  borderRadius: '100px',
                  background: 'linear-gradient(90deg, #f59e0b, #ef4444)',
                }}
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
              />
            </div>

            <span style={{
              fontSize: '0.7rem',
              fontWeight: 700,
              color: 'var(--text-muted)',
              minWidth: '36px',
            }}>
              {opp.matchedPairs}/{opp.totalPairs}
            </span>
          </div>
        )
      })}
    </motion.div>
  )
}
