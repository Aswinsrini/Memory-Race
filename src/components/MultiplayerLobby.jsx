import { motion } from 'framer-motion'
import { Copy, Check, Users, Crown, LogOut, Loader2, Play } from 'lucide-react'
import { useState } from 'react'
import { useMP } from '../context/MultiplayerContext'
import { useAuth } from '../context/AuthContext'

export default function MultiplayerLobby() {
  const { roomCode, players, isHost, leaveRoom, startGame, countdown, multiplayerPhase, difficulty } = useMP()
  const { user } = useAuth()
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(roomCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback
    }
  }

  // Countdown overlay
  if (multiplayerPhase === 'countdown') {
    return (
      <motion.div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1rem',
          padding: '2rem',
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <motion.div
          key={countdown}
          style={{
            fontSize: '5rem',
            fontWeight: 800,
            color: 'var(--accent)',
            lineHeight: 1,
          }}
          initial={{ scale: 2, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
          {countdown > 0 ? countdown : 'GO!'}
        </motion.div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Get ready...</p>
      </motion.div>
    )
  }

  return (
    <motion.div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1.5rem',
        padding: '1rem',
        width: '100%',
        maxWidth: '400px',
        margin: '0 auto',
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Room Code */}
      <div style={{ textAlign: 'center' }}>
        <p style={{
          fontSize: '0.65rem',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.12em',
          color: 'var(--text-muted)',
          marginBottom: '0.5rem',
        }}>Room Code</p>

        <motion.button
          onClick={handleCopy}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.75rem 1.25rem',
            borderRadius: '14px',
            background: 'var(--bg-card)',
            border: '2px dashed var(--accent)',
            cursor: 'pointer',
            margin: '0 auto',
          }}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          <span style={{
            fontSize: '1.75rem',
            fontWeight: 800,
            letterSpacing: '0.2em',
            color: 'var(--accent)',
            fontFamily: 'monospace',
          }}>
            {roomCode}
          </span>
          {copied ? (
            <Check size={18} style={{ color: 'var(--success)' }} />
          ) : (
            <Copy size={18} style={{ color: 'var(--text-muted)' }} />
          )}
        </motion.button>
        <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
          {copied ? 'Copied!' : 'Click to copy — share with friends'}
        </p>
      </div>

      {/* Difficulty badge */}
      <div style={{
        fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase',
        letterSpacing: '0.1em', color: 'var(--accent)',
        padding: '0.3rem 0.8rem', borderRadius: '100px',
        background: 'var(--bg-secondary)', border: '1px solid var(--border)',
      }}>
        {difficulty} mode
      </div>

      {/* Player List */}
      <div style={{ width: '100%' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
          marginBottom: '0.75rem',
          justifyContent: 'center',
        }}>
          <Users size={14} style={{ color: 'var(--text-muted)' }} />
          <p style={{
            fontSize: '0.65rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
            color: 'var(--text-muted)',
          }}>Players ({players.length}/10)</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {players.map((player, idx) => (
            <motion.div
              key={player.id || player.user_id}
              className="glass"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.65rem 1rem',
                borderRadius: '12px',
                border: (player.id || player.user_id) === user?.id ? '1.5px solid var(--accent)' : undefined,
              }}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.08 }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {player.is_host && <Crown size={14} style={{ color: '#f59e0b' }} />}
                <span style={{
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                }}>
                  {player.username}
                  {(player.id || player.user_id) === user?.id && (
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginLeft: '0.35rem' }}>(you)</span>
                  )}
                </span>
              </div>
              <span style={{
                fontSize: '0.7rem',
                fontWeight: 700,
                padding: '0.2rem 0.6rem',
                borderRadius: '100px',
                background: 'var(--success)',
                color: '#fff',
              }}>
                Joined
              </span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Waiting hint */}
      {players.length < 2 && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          color: 'var(--text-muted)',
          fontSize: '0.8rem',
        }}>
          <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
          Waiting for more players to join...
        </div>
      )}

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: '0.75rem', width: '100%' }}>
        {isHost ? (
          <motion.button
            onClick={startGame}
            className="btn btn-primary"
            style={{ flex: 1, opacity: players.length < 2 ? 0.5 : 1 }}
            disabled={players.length < 2}
            whileHover={players.length >= 2 ? { scale: 1.03 } : {}}
            whileTap={players.length >= 2 ? { scale: 0.97 } : {}}
          >
            <Play size={16} />
            Start Game
          </motion.button>
        ) : (
          <div style={{
            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600,
          }}>
            Waiting for host to start...
          </div>
        )}
        <motion.button
          onClick={leaveRoom}
          className="btn btn-secondary"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          <LogOut size={16} />
        </motion.button>
      </div>
    </motion.div>
  )
}
