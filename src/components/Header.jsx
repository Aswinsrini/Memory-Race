import { Zap } from 'lucide-react'
import ThemeToggle from './ThemeToggle'

export default function Header() {
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
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
        <ThemeToggle />
      </div>
    </header>
  )
}
