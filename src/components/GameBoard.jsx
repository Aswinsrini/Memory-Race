import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import Card from './Card'
import { useGame } from '../context/GameContext'

const GRID_CONFIG = {
  easy:   { cols: 4, maxWidth: '420px' },
  medium: { cols: 4, maxWidth: '480px' },
  hard:   { cols: 6, maxWidth: '600px' },
}

export default function GameBoard() {
  const {
    cards, flipped, matched, gameStatus, difficulty,
    flipCard, checkMatch,
  } = useGame()

  const checkTimeout = useRef(null)

  useEffect(() => {
    if (flipped.length === 2) {
      checkTimeout.current = setTimeout(() => {
        checkMatch()
      }, 600)
    }
    return () => clearTimeout(checkTimeout.current)
  }, [flipped, checkMatch])

  if (gameStatus === 'idle') return null

  const { cols, maxWidth } = GRID_CONFIG[difficulty]

  return (
    <motion.div
      style={{ width: '100%', maxWidth, margin: '0 auto', padding: '0 0.5rem' }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
    >
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        gap: 'clamp(0.4rem, 1.5vw, 0.75rem)',
      }}>
        {cards.map((card, index) => (
          <Card
            key={card.id}
            card={card}
            index={index}
            isFlipped={flipped.includes(index)}
            isMatched={matched.has(index)}
            onClick={flipCard}
            disabled={flipped.length >= 2 || gameStatus !== 'playing'}
          />
        ))}
      </div>
    </motion.div>
  )
}
