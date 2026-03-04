import { useState } from 'react'
import { motion } from 'framer-motion'
import { Play, Wifi, Zap } from 'lucide-react'
import { useGame } from '../context/GameContext'

const DIFFICULTIES = [
  { key: 'easy', label: 'Easy', desc: '12 cards', icon: '🌱' },
  { key: 'medium', label: 'Medium', desc: '16 cards', icon: '🔥' },
  { key: 'hard', label: 'Hard', desc: '24 cards', icon: '💀' },
]

export default function StartScreen() {
  const { startGame, gameStatus } = useGame()
  const [selectedDifficulty, setSelectedDifficulty] = useState('medium')

  if (gameStatus !== 'idle') return null

  return (
    <motion.div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '2rem',
        padding: '1rem',
        width: '100%',
        maxWidth: '380px',
        margin: '0 auto',
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Hero */}
      <motion.div
        style={{ textAlign: 'center' }}
        initial={{ y: -20 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 200 }}
      >
        <motion.div
          style={{
            width: '5rem',
            height: '5rem',
            borderRadius: '1.25rem',
            margin: '0 auto 1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            boxShadow: '0 0 25px var(--accent-glow)',
          }}
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Zap size={36} color="#fff" />
        </motion.div>

        <h2 style={{
          fontSize: 'clamp(1.8rem, 5vw, 2.5rem)',
          fontWeight: 800,
          letterSpacing: '-0.03em',
          color: 'var(--text-primary)',
          lineHeight: 1.1,
        }}>
          Memory<span style={{ color: 'var(--accent)' }}>Race</span>
        </h2>
        <p style={{
          marginTop: '0.5rem',
          fontSize: '0.9rem',
          color: 'var(--text-secondary)',
        }}>
          Test your memory. Race your friends.
        </p>
      </motion.div>

      {/* Difficulty */}
      <div style={{ width: '100%' }}>
        <p style={{
          fontSize: '0.65rem',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.12em',
          marginBottom: '0.75rem',
          textAlign: 'center',
          color: 'var(--text-muted)',
        }}>Difficulty</p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
          {DIFFICULTIES.map((d) => {
            const active = selectedDifficulty === d.key
            return (
              <motion.button
                key={d.key}
                onClick={() => setSelectedDifficulty(d.key)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.25rem',
                  padding: '0.75rem 0.5rem',
                  borderRadius: '14px',
                  background: active ? 'var(--accent)' : 'var(--bg-card)',
                  color: active ? '#ffffff' : 'var(--text-primary)',
                  border: `1.5px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
                  boxShadow: active ? 'var(--shadow-glow)' : 'var(--shadow-sm)',
                  cursor: 'pointer',
                  transition: 'background 0.2s, border-color 0.2s',
                }}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
              >
                <span style={{ fontSize: '1.25rem' }}>{d.icon}</span>
                <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>{d.label}</span>
                <span style={{ fontSize: '0.65rem', opacity: 0.7 }}>{d.desc}</span>
              </motion.button>
            )
          })}
        </div>
      </div>

      {/* Buttons */}
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <motion.button
          onClick={() => startGame(selectedDifficulty)}
          className="btn btn-primary"
          style={{ width: '100%', padding: '0.9rem 1.5rem', fontSize: '1rem' }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Play size={18} />
          Play Solo
        </motion.button>

        <button
          className="btn btn-secondary"
          style={{
            width: '100%',
            padding: '0.9rem 1.5rem',
            fontSize: '1rem',
            opacity: 0.5,
            cursor: 'not-allowed',
          }}
          disabled
          title="Coming in Phase 2"
        >
          <Wifi size={18} />
          Multiplayer
          <span style={{
            fontSize: '0.6rem',
            padding: '0.15rem 0.5rem',
            borderRadius: '100px',
            background: 'var(--accent)',
            color: '#fff',
            fontWeight: 700,
          }}>Soon</span>
        </button>
      </div>
    </motion.div>
  )
}
