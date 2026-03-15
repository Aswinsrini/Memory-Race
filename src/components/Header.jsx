import { Zap, Trophy, User, LogIn, LogOut } from 'lucide-react'
import ThemeToggle from './ThemeToggle'
import { useAuth } from '../context/AuthContext'

export default function Header({ page, onNavigate }) {
  const { isAuthenticated, profile, signOut } = useAuth()

  const handleSignOut = async () => {
    await signOut()
    onNavigate('home')
  }

  return (
    <header
      className="glass"
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        padding: '0.75rem 1.25rem',
        borderBottom: '1px solid var(--glass-border)',
      }}
    >
      <div style={{
        maxWidth: '56rem',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        {/* Logo */}
        <div
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}
          onClick={() => onNavigate('home')}
        >
          <div style={{
            width: '2rem',
            height: '2rem',
            borderRadius: '0.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
          }}>
            <Zap size={16} color="#fff" />
          </div>
          <span style={{
            fontSize: '1.15rem',
            fontWeight: 800,
            letterSpacing: '-0.02em',
            color: 'var(--text-primary)',
          }}>
            Memory<span style={{ color: 'var(--accent)' }}>Race</span>
          </span>
        </div>

        {/* Right side actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {/* Leaderboard */}
          <button
            onClick={() => onNavigate('leaderboard')}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.3rem',
              padding: '0.35rem 0.6rem', borderRadius: '8px',
              fontSize: '0.75rem', fontWeight: 600,
              color: page === 'leaderboard' ? 'var(--accent)' : 'var(--text-muted)',
              background: page === 'leaderboard' ? 'var(--bg-secondary)' : 'transparent',
            }}
          >
            <Trophy size={14} />
          </button>

          {isAuthenticated ? (
            <>
              {/* Profile */}
              <button
                onClick={() => onNavigate('profile')}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.3rem',
                  padding: '0.35rem 0.6rem', borderRadius: '8px',
                  fontSize: '0.75rem', fontWeight: 600,
                  color: page === 'profile' ? 'var(--accent)' : 'var(--text-muted)',
                  background: page === 'profile' ? 'var(--bg-secondary)' : 'transparent',
                }}
              >
                <User size={14} />
                <span style={{ maxWidth: '80px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {profile?.username || 'Profile'}
                </span>
              </button>

              {/* Sign Out */}
              <button
                onClick={handleSignOut}
                style={{
                  display: 'flex', alignItems: 'center',
                  padding: '0.35rem 0.5rem', borderRadius: '8px',
                  color: 'var(--text-muted)',
                }}
              >
                <LogOut size={14} />
              </button>
            </>
          ) : (
            <button
              onClick={() => onNavigate('signin')}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.3rem',
                padding: '0.35rem 0.6rem', borderRadius: '8px',
                fontSize: '0.75rem', fontWeight: 600,
                color: 'var(--text-muted)',
              }}
            >
              <LogIn size={14} />
              <span>Sign In</span>
            </button>
          )}

          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
