import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import Card from './Card'
import { useGame } from '../context/GameContext'
import { useMP } from '../context/MultiplayerContext'

const GRID_CONFIG = {
  easy:   { cols: 4, maxWidth: '420px' },
  medium: { cols: 4, maxWidth: '480px' },
  hard:   { cols: 6, maxWidth: '600px' },
}

export default function GameBoard() {
  const {
    cards, flipped, matched, gameStatus, difficulty,
    matchedPairs, totalPairs, moves, elapsed, isMultiplayer,
    flipCard, checkMatch,
  } = useGame()

  const mp = useMP()
  const checkTimeout = useRef(null)
  const prevMatchedPairs = useRef(0)

  // When 2 cards are flipped, check for match after a delay
  useEffect(() => {
    if (flipped.length === 2) {
      checkTimeout.current = setTimeout(() => {
        checkMatch()
      }, 600)
    }
    return () => clearTimeout(checkTimeout.current)
  }, [flipped, checkMatch])

  // Emit progress to server whenever matchedPairs changes (multiplayer only)
  useEffect(() => {
    if (isMultiplayer && gameStatus === 'playing' && matchedPairs !== prevMatchedPairs.current) {
      prevMatchedPairs.current = matchedPairs
      mp.sendProgress(matchedPairs, totalPairs, moves)
    }
  }, [matchedPairs, moves, isMultiplayer, gameStatus, totalPairs, mp])

  // Emit game_completed when won in multiplayer
  useEffect(() => {
    if (isMultiplayer && gameStatus === 'won') {
      mp.sendGameCompleted(moves, elapsed)
    }
  }, [gameStatus, isMultiplayer, moves, elapsed, mp])

  if (gameStatus === 'idle' || gameStatus === 'lost') return null

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
