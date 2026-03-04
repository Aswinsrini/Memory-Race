import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, Wifi, Zap, ArrowLeft, Plus, LogIn } from 'lucide-react'
import { useGame } from '../context/GameContext'
import { useMP } from '../context/MultiplayerContext'

const DIFFICULTIES = [
  { key: 'easy', label: 'Easy', desc: '12 cards', icon: '🌱' },
  { key: 'medium', label: 'Medium', desc: '16 cards', icon: '🔥' },
  { key: 'hard', label: 'Hard', desc: '24 cards', icon: '💀' },
]

export default function StartScreen() {
  const { startGame, gameStatus } = useGame()
  const mp = useMP()

  const [selectedDifficulty, setSelectedDifficulty] = useState('medium')
  const [view, setView] = useState('main') // 'main' | 'multiplayer'
  const [username, setUsername] = useState('')
  const [joinCode, setJoinCode] = useState('')

  if (gameStatus !== 'idle') return null
  if (mp.multiplayerPhase !== 'idle') return null // lobby/countdown handled elsewhere

  const handleCreateRoom = () => {
    if (!username.trim()) return
    mp.connect()
    // Wait for connection, then create
    setTimeout(() => {
      mp.createRoom(username.trim(), selectedDifficulty)
    }, 500)
  }

  const handleJoinRoom = () => {
    if (!username.trim() || !joinCode.trim()) return
    mp.connect()
    setTimeout(() => {
      mp.joinRoom(joinCode.trim(), username.trim())
    }, 500)
  }

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
        <p style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          Test your memory. Race your friends.
        </p>
      </motion.div>

      <AnimatePresence mode="wait">
        {view === 'main' ? (
          <motion.div
            key="main"
            style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
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

              <motion.button
                onClick={() => setView('multiplayer')}
                className="btn btn-secondary"
                style={{ width: '100%', padding: '0.9rem 1.5rem', fontSize: '1rem' }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Wifi size={18} />
                Multiplayer
              </motion.button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="multiplayer"
            style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
          >
            {/* Back button */}
            <motion.button
              onClick={() => { setView('main'); mp.disconnect() }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                fontSize: '0.8rem',
                fontWeight: 600,
                color: 'var(--text-muted)',
                cursor: 'pointer',
                alignSelf: 'flex-start',
              }}
              whileHover={{ x: -3 }}
            >
              <ArrowLeft size={16} />
              Back
            </motion.button>

            {/* Username */}
            <div>
              <label style={{
                fontSize: '0.7rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                color: 'var(--text-muted)',
                display: 'block',
                marginBottom: '0.4rem',
              }}>Your Name</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your name..."
                maxLength={20}
                style={{
                  width: '100%',
                  padding: '0.7rem 1rem',
                  borderRadius: '12px',
                  border: '1.5px solid var(--border)',
                  background: 'var(--bg-card)',
                  color: 'var(--text-primary)',
                  fontSize: '0.9rem',
                  fontFamily: 'inherit',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                }}
                onFocus={(e) => e.target.style.borderColor = 'var(--accent)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
              />
            </div>

            {/* Error */}
            {mp.error && (
              <p style={{
                fontSize: '0.8rem',
                color: '#ef4444',
                textAlign: 'center',
                padding: '0.5rem',
                borderRadius: '8px',
                background: 'rgba(239, 68, 68, 0.1)',
              }}>
                {mp.error}
              </p>
            )}

            {/* Create Room */}
            <motion.button
              onClick={handleCreateRoom}
              className="btn btn-primary"
              style={{
                width: '100%',
                padding: '0.85rem 1.5rem',
                fontSize: '0.95rem',
                opacity: username.trim() ? 1 : 0.5,
              }}
              disabled={!username.trim()}
              whileHover={username.trim() ? { scale: 1.02 } : {}}
              whileTap={username.trim() ? { scale: 0.98 } : {}}
            >
              <Plus size={18} />
              Create Room
            </motion.button>

            {/* Divider */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
            }}>
              <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>OR</span>
              <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
            </div>

            {/* Join Room */}
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                placeholder="Room code"
                maxLength={6}
                style={{
                  flex: 1,
                  padding: '0.7rem 1rem',
                  borderRadius: '12px',
                  border: '1.5px solid var(--border)',
                  background: 'var(--bg-card)',
                  color: 'var(--text-primary)',
                  fontSize: '0.95rem',
                  fontFamily: 'monospace',
                  fontWeight: 700,
                  letterSpacing: '0.15em',
                  textAlign: 'center',
                  outline: 'none',
                  textTransform: 'uppercase',
                  transition: 'border-color 0.2s',
                }}
                onFocus={(e) => e.target.style.borderColor = 'var(--accent)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
              />
              <motion.button
                onClick={handleJoinRoom}
                className="btn btn-secondary"
                style={{
                  padding: '0.7rem 1.25rem',
                  opacity: (username.trim() && joinCode.trim()) ? 1 : 0.5,
                }}
                disabled={!username.trim() || !joinCode.trim()}
                whileHover={(username.trim() && joinCode.trim()) ? { scale: 1.03 } : {}}
                whileTap={(username.trim() && joinCode.trim()) ? { scale: 0.97 } : {}}
              >
                <LogIn size={18} />
                Join
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
