import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Plus, Users, RefreshCw, LogIn, Zap } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { useMP } from '../context/MultiplayerContext'

const DIFF_ICONS = { easy: '🌱', medium: '🔥', hard: '💀' }

export default function PublicGames({ onBack, onJoinRoom, onCreateRoom }) {
  const { user, profile } = useAuth()
  const mp = useMP()
  const [rooms, setRooms] = useState([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [difficulty, setDifficulty] = useState('medium')
  const [joinCode, setJoinCode] = useState('')
  const [error, setError] = useState(null)

  const fetchRooms = useCallback(async () => {
    setLoading(true)
    const { data, error: err } = await supabase
      .from('rooms')
      .select(`
        *,
        room_players(count),
        creator:profiles!rooms_created_by_fkey(display_name, username)
      `)
      .eq('status', 'waiting')
      .order('created_at', { ascending: false })
      .limit(20)

    if (!err && data) {
      setRooms(data.map(r => ({
        ...r,
        playerCount: r.room_players?.[0]?.count || 0,
        creatorName: r.creator?.display_name || r.creator?.username || 'Unknown',
      })))
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchRooms()
  }, [fetchRooms])

  const handleCreate = async () => {
    if (!user) return
    setCreating(true)
    setError(null)
    try {
      const username = profile?.display_name || profile?.username || 'Player'
      const room = await mp.createRoom(user.id, difficulty, username)
      if (room) {
        onCreateRoom(room)
      } else if (mp.error) {
        setError(mp.error)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setCreating(false)
    }
  }

  const handleJoinByCode = async () => {
    if (!joinCode.trim() || !user) return
    setError(null)
    const code = joinCode.trim().toUpperCase()
    const { data: room, error: err } = await supabase
      .from('rooms')
      .select('*')
      .eq('code', code)
      .eq('status', 'waiting')
      .single()

    if (err || !room) {
      setError('Room not found or game already started')
      return
    }
    onJoinRoom(room)
  }

  const handleJoinPublic = (room) => {
    onJoinRoom(room)
  }

  return (
    <motion.div
      style={{
        display: 'flex', flexDirection: 'column', gap: '1.25rem',
        padding: '1rem', width: '100%', maxWidth: '480px', margin: '0 auto',
      }}
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
    >
      <motion.button
        onClick={onBack}
        style={{
          display: 'flex', alignItems: 'center', gap: '0.35rem',
          fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)',
          cursor: 'pointer', alignSelf: 'flex-start',
        }}
        whileHover={{ x: -3 }}
      >
        <ArrowLeft size={16} /> Back
      </motion.button>

      {/* Create Room Section */}
      <div className="glass" style={{ padding: '1rem', borderRadius: '16px' }}>
        <p style={{
          fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase',
          letterSpacing: '0.12em', color: 'var(--text-muted)', marginBottom: '0.6rem',
        }}>Create a New Room</p>

        <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.75rem' }}>
          {['easy', 'medium', 'hard'].map(d => (
            <button key={d} onClick={() => setDifficulty(d)} style={{
              flex: 1, padding: '0.5rem', borderRadius: '10px', cursor: 'pointer',
              fontSize: '0.8rem', fontWeight: 700,
              background: difficulty === d ? 'var(--accent)' : 'var(--bg-secondary)',
              color: difficulty === d ? '#fff' : 'var(--text-primary)',
              border: `1px solid ${difficulty === d ? 'var(--accent)' : 'var(--border)'}`,
              transition: 'all 0.2s',
            }}>
              {DIFF_ICONS[d]} {d}
            </button>
          ))}
        </div>

        <motion.button
          onClick={handleCreate} className="btn btn-primary"
          style={{ width: '100%', padding: '0.75rem', opacity: creating ? 0.6 : 1 }}
          disabled={creating}
          whileHover={!creating ? { scale: 1.02 } : {}} whileTap={!creating ? { scale: 0.98 } : {}}
        >
          <Plus size={16} /> {creating ? 'Creating...' : 'Create Room'}
        </motion.button>
      </div>

      {/* Join by Code */}
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <input
          type="text" value={joinCode} onChange={e => setJoinCode(e.target.value.toUpperCase())}
          placeholder="Enter room code" maxLength={6}
          style={{
            flex: 1, padding: '0.65rem 0.85rem', borderRadius: '12px',
            border: '1.5px solid var(--border)', background: 'var(--bg-card)',
            color: 'var(--text-primary)', fontSize: '0.9rem', fontFamily: 'monospace',
            fontWeight: 700, letterSpacing: '0.15em', textAlign: 'center', outline: 'none',
          }}
        />
        <motion.button
          onClick={handleJoinByCode} className="btn btn-secondary"
          style={{ padding: '0.65rem 1rem' }}
          whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
        >
          <LogIn size={16} /> Join
        </motion.button>
      </div>

      {error && (
        <p style={{
          fontSize: '0.8rem', color: '#ef4444', textAlign: 'center',
          padding: '0.5rem', borderRadius: '8px', background: 'rgba(239,68,68,0.1)',
        }}>{error}</p>
      )}

      {/* Public Rooms List */}
      <div>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          marginBottom: '0.5rem',
        }}>
          <p style={{
            fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase',
            letterSpacing: '0.12em', color: 'var(--text-muted)',
          }}>Public Games</p>
          <motion.button
            onClick={fetchRooms}
            style={{ color: 'var(--text-muted)', cursor: 'pointer' }}
            whileHover={{ rotate: 180 }} transition={{ duration: 0.3 }}
          >
            <RefreshCw size={14} />
          </motion.button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
            <RefreshCw size={20} style={{ animation: 'spin 1s linear infinite', margin: '0 auto' }} />
          </div>
        ) : rooms.length === 0 ? (
          <div className="glass" style={{
            textAlign: 'center', padding: '2rem', borderRadius: '14px',
          }}>
            <Zap size={24} style={{ color: 'var(--text-muted)', margin: '0 auto 0.5rem' }} />
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              No open rooms yet
            </p>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              Create one and invite friends!
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {rooms.map((room, idx) => (
              <motion.div
                key={room.id} className="glass"
                style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '0.65rem 0.85rem', borderRadius: '12px', cursor: 'pointer',
                }}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                whileHover={{ scale: 1.01 }}
                onClick={() => handleJoinPublic(room)}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.85rem', color: 'var(--accent)' }}>
                      {room.code}
                    </span>
                    <span style={{ fontSize: '0.75rem' }}>{DIFF_ICONS[room.difficulty]}</span>
                  </div>
                  <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    by {room.creatorName}
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Users size={13} style={{ color: 'var(--text-muted)' }} />
                  <span style={{
                    fontSize: '0.8rem', fontWeight: 700,
                    color: room.playerCount >= 10 ? '#ef4444' : 'var(--text-primary)',
                  }}>
                    {room.playerCount}/10
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  )
}
