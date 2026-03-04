import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

const PARTICLE_COLORS = ['#6366f1', '#8b5cf6', '#10b981', '#f59e0b', '#ec4899', '#06b6d4']

function Particles({ show }) {
  if (!show) return null

  const particles = Array.from({ length: 10 }, (_, i) => {
    const angle = (i / 10) * Math.PI * 2
    const distance = 40 + Math.random() * 30
    return {
      id: i,
      tx: `${Math.cos(angle) * distance}px`,
      ty: `${Math.sin(angle) * distance}px`,
      color: PARTICLE_COLORS[i % PARTICLE_COLORS.length],
      delay: Math.random() * 0.15,
    }
  })

  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      pointerEvents: 'none',
      zIndex: 20,
    }}>
      {particles.map(p => (
        <div
          key={p.id}
          className="particle"
          style={{
            '--tx': p.tx,
            '--ty': p.ty,
            backgroundColor: p.color,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
    </div>
  )
}

export default function Card({ card, index, isFlipped, isMatched, onClick, disabled }) {
  const [showParticles, setShowParticles] = useState(false)
  const [justMatched, setJustMatched] = useState(false)

  useEffect(() => {
    if (isMatched && !justMatched) {
      setJustMatched(true)
      setShowParticles(true)
      const timer = setTimeout(() => setShowParticles(false), 700)
      return () => clearTimeout(timer)
    }
  }, [isMatched])

  const handleClick = () => {
    if (!disabled && !isFlipped && !isMatched) {
      onClick(index)
    }
  }

  return (
    <motion.div
      className="card-perspective"
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        delay: index * 0.03,
        type: 'spring',
        stiffness: 260,
        damping: 20,
      }}
    >
      {/* Aspect ratio container */}
      <div
        className="card-container"
        onClick={handleClick}
        style={{ cursor: disabled || isFlipped || isMatched ? 'default' : 'pointer' }}
      >
        {/* Particles */}
        <Particles show={showParticles} />

        {/* 3D flip inner */}
        <motion.div
          className="card-inner"
          animate={{ rotateY: isFlipped || isMatched ? 180 : 0 }}
          transition={{ duration: 0.5, type: 'spring', stiffness: 260, damping: 25 }}
        >
          {/* Front face (hidden / question mark) */}
          <div
            className="card-face"
            style={{
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              boxShadow: 'var(--shadow-md)',
            }}
          >
            <span style={{
              fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
              fontWeight: 800,
              color: 'rgba(255,255,255,0.85)',
              userSelect: 'none',
            }}>?</span>
          </div>

          {/* Back face (emoji reveal) */}
          <div
            className={`card-face card-back-face ${isMatched ? 'matched-glow' : ''}`}
            style={{
              background: 'var(--bg-card)',
              boxShadow: isMatched ? undefined : 'var(--shadow-md)',
              border: isMatched ? '2px solid var(--success)' : '1px solid var(--border)',
            }}
          >
            <motion.span
              style={{
                fontSize: 'clamp(1.5rem, 5vw, 3rem)',
                userSelect: 'none',
              }}
              initial={false}
              animate={isMatched ? {
                scale: [1, 1.3, 1],
                rotate: [0, 10, -10, 0],
              } : {}}
              transition={{ duration: 0.5 }}
            >
              {card.emoji}
            </motion.span>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}
