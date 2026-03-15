import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Edit3, Save, X, Trophy, Gamepad2, Target, Clock } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'

export default function Profile({ onBack }) {
  const { profile, updateProfile, user } = useAuth()
  const [editing, setEditing] = useState(false)
  const [displayName, setDisplayName] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState(null)
  const [recentGames, setRecentGames] = useState([])
  const [stats, setStats] = useState({ played: 0, won: 0, winRate: 0, bestTime: null })

  // Sync displayName with profile whenever profile changes
  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || profile.username || '')
    }
  }, [profile])

  useEffect(() => {
    if (!user) return
    // Fetch stats
    supabase.from('game_results').select('*').eq('user_id', user.id)
      .order('created_at', { ascending: false }).limit(10)
      .then(({ data }) => {
        if (data) {
          setRecentGames(data)
          const won = data.filter(g => g.is_winner).length
          const times = data.map(g => g.elapsed_ms).filter(Boolean)
          setStats({
            played: profile?.games_played || data.length,
            won: profile?.games_won || won,
            winRate: data.length > 0 ? Math.round((won / data.length) * 100) : 0,
            bestTime: times.length > 0 ? Math.min(...times) : null,
          })
        }
      })
  }, [user, profile])

  const handleSave = async () => {
    if (!displayName.trim()) return
    setSaving(true)
    setSaveError(null)
    try {
      await updateProfile({ display_name: displayName.trim() })
      setEditing(false)
    } catch (err) {
      console.error('Profile update error:', err)
      setSaveError(err.message || 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setDisplayName(profile?.display_name || profile?.username || '')
    setEditing(false)
    setSaveError(null)
  }

  const formatTime = (ms) => {
    if (!ms) return '--'
    const s = Math.floor(ms / 1000)
    return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`
  }

  const currentName = profile?.display_name || profile?.username || 'Player'

  return (
    <motion.div
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        gap: '1.5rem', padding: '1rem', width: '100%', maxWidth: '420px', margin: '0 auto',
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

      {/* Avatar & Name */}
      <div style={{ textAlign: 'center' }}>
        <div style={{
          width: '5rem', height: '5rem', borderRadius: '50%', margin: '0 auto 0.75rem',
          background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '2rem', color: '#fff', fontWeight: 800,
          boxShadow: '0 0 20px var(--accent-glow)',
        }}>
          {currentName[0].toUpperCase()}
        </div>

        {editing ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <input
                value={displayName} onChange={e => setDisplayName(e.target.value)}
                maxLength={20}
                style={{
                  padding: '0.5rem 0.75rem', borderRadius: '10px',
                  border: '1.5px solid var(--accent)', background: 'var(--bg-card)',
                  color: 'var(--text-primary)', fontSize: '0.9rem', fontFamily: 'inherit',
                  outline: 'none', textAlign: 'center', width: '160px',
                }}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSave()
                  if (e.key === 'Escape') handleCancel()
                }}
              />
              <motion.button
                onClick={handleSave}
                className="btn btn-primary"
                style={{ padding: '0.5rem 0.75rem' }}
                disabled={saving || !displayName.trim()}
                whileTap={{ scale: 0.95 }}
              >
                <Save size={14} />
              </motion.button>
              <motion.button
                onClick={handleCancel}
                style={{ padding: '0.5rem', color: 'var(--text-muted)', cursor: 'pointer' }}
                whileTap={{ scale: 0.95 }}
              >
                <X size={14} />
              </motion.button>
            </div>
            {saveError && (
              <p style={{ fontSize: '0.75rem', color: '#ef4444' }}>{saveError}</p>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              {currentName}
            </h2>
            <motion.button
              onClick={() => { setDisplayName(currentName); setEditing(true) }}
              style={{ color: 'var(--text-muted)', cursor: 'pointer' }}
              whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
            >
              <Edit3 size={14} />
            </motion.button>
          </div>
        )}
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
          {profile?.username ? `@${profile.username}` : user?.email}
        </p>
      </div>

      {/* Stats Grid */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem', width: '100%',
      }}>
        {[
          { icon: Gamepad2, label: 'Games Played', value: stats.played },
          { icon: Trophy, label: 'Games Won', value: stats.won },
          { icon: Target, label: 'Win Rate', value: `${stats.winRate}%` },
          { icon: Clock, label: 'Best Time', value: formatTime(stats.bestTime) },
        ].map(({ icon: Icon, label, value }, idx) => (
          <div key={idx} className="glass" style={{
            padding: '0.75rem', borderRadius: '14px', textAlign: 'center',
          }}>
            <Icon size={18} style={{ color: 'var(--accent)', margin: '0 auto 0.35rem' }} />
            <p style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)' }}>{value}</p>
            <p style={{ fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600, color: 'var(--text-muted)' }}>{label}</p>
          </div>
        ))}
      </div>

      {/* Recent Games */}
      {recentGames.length > 0 && (
        <div style={{ width: '100%' }}>
          <p style={{
            fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase',
            letterSpacing: '0.12em', color: 'var(--text-muted)', marginBottom: '0.5rem',
          }}>Recent Games</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {recentGames.slice(0, 5).map((game, idx) => (
              <div key={idx} className="glass" style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '0.6rem 0.85rem', borderRadius: '10px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{
                    fontSize: '0.7rem', fontWeight: 700, padding: '0.15rem 0.5rem',
                    borderRadius: '100px',
                    background: game.is_winner ? 'var(--success)' : 'var(--bg-secondary)',
                    color: game.is_winner ? '#fff' : 'var(--text-muted)',
                  }}>
                    #{game.finish_rank}
                  </span>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {game.difficulty}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    {game.moves} moves
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    {formatTime(game.elapsed_ms)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  )
}
