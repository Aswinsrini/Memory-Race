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
  const finishedSentRef = useRef(false)

  // Keep mp functions in refs so useEffects don't re-fire when context changes
  const sendProgressRef = useRef(mp.sendProgress)
  const sendPlayerFinishedRef = useRef(mp.sendPlayerFinished)
  useEffect(() => {
    sendProgressRef.current = mp.sendProgress
    sendPlayerFinishedRef.current = mp.sendPlayerFinished
  })

  // Reset the finishedSent flag when a new game starts
  useEffect(() => {
    if (gameStatus === 'playing') {
      finishedSentRef.current = false
      prevMatchedPairs.current = 0
    }
  }, [gameStatus])

  // When 2 cards are flipped, check for match after a delay
  useEffect(() => {
    if (flipped.length === 2) {
      checkTimeout.current = setTimeout(() => {
        checkMatch()
      }, 600)
    }
    return () => clearTimeout(checkTimeout.current)
  }, [flipped, checkMatch])

  // Emit progress via Supabase Realtime whenever matchedPairs changes (multiplayer only)
  useEffect(() => {
    if (isMultiplayer && gameStatus === 'playing' && matchedPairs !== prevMatchedPairs.current) {
      prevMatchedPairs.current = matchedPairs
      sendProgressRef.current({ matchedPairs, totalPairs, moves })
    }
  }, [matchedPairs, moves, isMultiplayer, gameStatus, totalPairs])

  // When player completes all pairs in multiplayer, notify others — ONCE only
  useEffect(() => {
    if (isMultiplayer && gameStatus === 'completed' && !finishedSentRef.current) {
      finishedSentRef.current = true
      sendPlayerFinishedRef.current({ moves, elapsed, matchedPairs, totalPairs })
    }
  }, [gameStatus, isMultiplayer, moves, elapsed, matchedPairs, totalPairs])

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
