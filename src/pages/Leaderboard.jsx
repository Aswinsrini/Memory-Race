import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Trophy, Medal, Award } from 'lucide-react'
import { supabase } from '../lib/supabase'

const RANK_STYLES = {
  0: { bg: 'linear-gradient(135deg, #f59e0b, #eab308)', icon: Trophy },
  1: { bg: 'linear-gradient(135deg, #94a3b8, #cbd5e1)', icon: Medal },
  2: { bg: 'linear-gradient(135deg, #d97706, #b45309)', icon: Award },
}

export default function Leaderboard({ onBack }) {
  const [leaders, setLeaders] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('wins') // 'wins' | 'winrate'

  useEffect(() => {
    fetchLeaderboard()
  }, [])

  const fetchLeaderboard = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('profiles')
      .select('id, username, display_name, games_played, games_won')
      .gt('games_played', 0)
      .order('games_won', { ascending: false })
      .limit(50)

    if (data) {
      setLeaders(data.map(p => ({
        ...p,
        winRate: p.games_played > 0 ? Math.round((p.games_won / p.games_played) * 100) : 0,
      })))
    }
    setLoading(false)
  }

  const sorted = tab === 'wins'
    ? [...leaders].sort((a, b) => b.games_won - a.games_won)
    : [...leaders].sort((a, b) => b.winRate - a.winRate)

  return (
    <motion.div
      style={{
        display: 'flex', flexDirection: 'column', gap: '1.25rem',
        padding: '1rem', width: '100%', maxWidth: '420px', margin: '0 auto',
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

      <div style={{ textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)' }}>
          Leaderboard
        </h2>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        {[
          { key: 'wins', label: 'Most Wins' },
          { key: 'winrate', label: 'Win Rate' },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{
            flex: 1, padding: '0.5rem', borderRadius: '10px', cursor: 'pointer',
            fontSize: '0.8rem', fontWeight: 700,
            background: tab === t.key ? 'var(--accent)' : 'var(--bg-card)',
            color: tab === t.key ? '#fff' : 'var(--text-primary)',
            border: `1px solid ${tab === t.key ? 'var(--accent)' : 'var(--border)'}`,
            transition: 'all 0.2s',
          }}>
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
          Loading...
        </div>
      ) : sorted.length === 0 ? (
        <div className="glass" style={{ textAlign: 'center', padding: '2rem', borderRadius: '14px' }}>
          <p style={{ color: 'var(--text-secondary)' }}>No games played yet</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          {sorted.map((player, idx) => {
            const rankStyle = RANK_STYLES[idx]
            const RankIcon = rankStyle?.icon

            return (
              <motion.div
                key={player.id} className="glass"
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.65rem',
                  padding: '0.65rem 0.85rem', borderRadius: '12px',
                  border: idx < 3 ? '1.5px solid var(--accent)' : undefined,
                }}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.03 }}
              >
                {/* Rank */}
                <div style={{
                  width: '2rem', height: '2rem', borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: rankStyle?.bg || 'var(--bg-secondary)',
                  flexShrink: 0,
                }}>
                  {RankIcon ? (
                    <RankIcon size={14} color="#fff" />
                  ) : (
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)' }}>
                      {idx + 1}
                    </span>
                  )}
                </div>

                {/* Name */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{
                    fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {player.display_name || player.username}
                  </p>
                  <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                    {player.games_played} games
                  </p>
                </div>

                {/* Stat */}
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--accent)' }}>
                    {tab === 'wins' ? player.games_won : `${player.winRate}%`}
                  </p>
                  <p style={{ fontSize: '0.55rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600 }}>
                    {tab === 'wins' ? 'wins' : 'rate'}
                  </p>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
    </motion.div>
  )
}
