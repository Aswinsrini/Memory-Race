import { useState } from 'react'
import { motion } from 'framer-motion'
import { LogIn, ArrowLeft, Mail, Lock } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function SignIn({ onBack, onSwitchToSignUp }) {
  const { signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await signIn(email, password)
      onBack()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
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
        maxWidth: '380px',
        margin: '0 auto',
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
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
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>
          Welcome Back
        </h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
          Sign in to play multiplayer
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{
        width: '100%', display: 'flex', flexDirection: 'column', gap: '0.75rem',
      }}>
        <div style={{ position: 'relative' }}>
          <Mail size={16} style={{
            position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)',
            color: 'var(--text-muted)',
          }} />
          <input
            type="email" value={email} onChange={e => setEmail(e.target.value)}
            placeholder="Email address" required
            style={{
              width: '100%', padding: '0.75rem 0.75rem 0.75rem 2.5rem',
              borderRadius: '12px', border: '1.5px solid var(--border)',
              background: 'var(--bg-card)', color: 'var(--text-primary)',
              fontSize: '0.9rem', fontFamily: 'inherit', outline: 'none',
            }}
          />
        </div>

        <div style={{ position: 'relative' }}>
          <Lock size={16} style={{
            position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)',
            color: 'var(--text-muted)',
          }} />
          <input
            type="password" value={password} onChange={e => setPassword(e.target.value)}
            placeholder="Password" required minLength={6}
            style={{
              width: '100%', padding: '0.75rem 0.75rem 0.75rem 2.5rem',
              borderRadius: '12px', border: '1.5px solid var(--border)',
              background: 'var(--bg-card)', color: 'var(--text-primary)',
              fontSize: '0.9rem', fontFamily: 'inherit', outline: 'none',
            }}
          />
        </div>

        {error && (
          <p style={{
            fontSize: '0.8rem', color: '#ef4444', textAlign: 'center',
            padding: '0.5rem', borderRadius: '8px', background: 'rgba(239,68,68,0.1)',
          }}>{error}</p>
        )}

        <motion.button
          type="submit" className="btn btn-primary"
          style={{ width: '100%', padding: '0.85rem', fontSize: '0.95rem', opacity: loading ? 0.6 : 1 }}
          disabled={loading}
          whileHover={!loading ? { scale: 1.02 } : {}}
          whileTap={!loading ? { scale: 0.98 } : {}}
        >
          <LogIn size={18} />
          {loading ? 'Signing in...' : 'Sign In'}
        </motion.button>
      </form>

      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
        Don't have an account?{' '}
        <button
          onClick={onSwitchToSignUp}
          style={{ color: 'var(--accent)', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' }}
        >
          Sign Up
        </button>
      </p>
    </motion.div>
  )
}
