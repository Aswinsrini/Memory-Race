import { useState } from 'react'
import { motion } from 'framer-motion'
import { UserPlus, ArrowLeft, Mail, Lock, User } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function SignUp({ onBack, onSwitchToSignIn }) {
  const { signUp } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await signUp(email, password, username)
      setSuccess(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <motion.div
        style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          gap: '1rem', padding: '2rem', maxWidth: '380px', margin: '0 auto', textAlign: 'center',
        }}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      >
        <div style={{
          width: '4rem', height: '4rem', borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--success), #059669)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <UserPlus size={28} color="#fff" />
        </div>
        <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-primary)' }}>
          Account Created!
        </h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          Check your email to confirm your account, then sign in.
        </p>
        <motion.button
          onClick={onSwitchToSignIn}
          className="btn btn-primary"
          style={{ padding: '0.75rem 2rem', fontSize: '0.9rem' }}
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
        >
          Go to Sign In
        </motion.button>
      </motion.div>
    )
  }

  return (
    <motion.div
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        gap: '1.5rem', padding: '1rem', width: '100%', maxWidth: '380px', margin: '0 auto',
      }}
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
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
          Create Account
        </h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
          Join the race!
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{
        width: '100%', display: 'flex', flexDirection: 'column', gap: '0.75rem',
      }}>
        <div style={{ position: 'relative' }}>
          <User size={16} style={{
            position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)',
            color: 'var(--text-muted)',
          }} />
          <input
            type="text" value={username} onChange={e => setUsername(e.target.value)}
            placeholder="Username" required minLength={3} maxLength={20}
            style={{
              width: '100%', padding: '0.75rem 0.75rem 0.75rem 2.5rem',
              borderRadius: '12px', border: '1.5px solid var(--border)',
              background: 'var(--bg-card)', color: 'var(--text-primary)',
              fontSize: '0.9rem', fontFamily: 'inherit', outline: 'none',
            }}
          />
        </div>

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
            placeholder="Password (min 6 chars)" required minLength={6}
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
          <UserPlus size={18} />
          {loading ? 'Creating...' : 'Sign Up'}
        </motion.button>
      </form>

      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
        Already have an account?{' '}
        <button
          onClick={onSwitchToSignIn}
          style={{ color: 'var(--accent)', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' }}
        >
          Sign In
        </button>
      </p>
    </motion.div>
  )
}
