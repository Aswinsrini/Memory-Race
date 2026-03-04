import { createContext, useContext, useReducer, useCallback } from 'react'
import { shuffleCards, CARD_EMOJIS } from '../utils/cards'

const GameContext = createContext()

const DIFFICULTY = {
  easy: 6,    // 6 pairs = 12 cards
  medium: 8,  // 8 pairs = 16 cards
  hard: 12,   // 12 pairs = 24 cards
}

const initialState = {
  cards: [],
  flipped: [],        // indices of currently flipped (max 2)
  matched: new Set(),  // indices of matched cards
  moves: 0,
  difficulty: 'medium',
  gameStatus: 'idle',  // idle | playing | won
  startTime: null,
  elapsed: 0,
  totalPairs: 0,
  matchedPairs: 0,
}

function gameReducer(state, action) {
  switch (action.type) {
    case 'START_GAME': {
      const pairs = DIFFICULTY[action.difficulty || state.difficulty]
      const cards = shuffleCards(CARD_EMOJIS.slice(0, pairs))
      return {
        ...initialState,
        cards,
        difficulty: action.difficulty || state.difficulty,
        gameStatus: 'playing',
        startTime: Date.now(),
        totalPairs: pairs,
      }
    }

    case 'FLIP_CARD': {
      const { index } = action
      if (
        state.flipped.length >= 2 ||
        state.flipped.includes(index) ||
        state.matched.has(index) ||
        state.gameStatus !== 'playing'
      ) return state

      const newFlipped = [...state.flipped, index]
      return { ...state, flipped: newFlipped }
    }

    case 'CHECK_MATCH': {
      const [i, j] = state.flipped
      if (i === undefined || j === undefined) return state

      const isMatch = state.cards[i].emoji === state.cards[j].emoji
      const newMatched = new Set(state.matched)
      let matchedPairs = state.matchedPairs

      if (isMatch) {
        newMatched.add(i)
        newMatched.add(j)
        matchedPairs += 1
      }

      const won = matchedPairs === state.totalPairs

      return {
        ...state,
        flipped: [],
        matched: newMatched,
        matchedPairs,
        moves: state.moves + 1,
        gameStatus: won ? 'won' : 'playing',
      }
    }

    case 'SET_ELAPSED':
      return { ...state, elapsed: action.elapsed }

    case 'SET_DIFFICULTY':
      return { ...state, difficulty: action.difficulty }

    case 'RESET':
      return { ...initialState }

    default:
      return state
  }
}

export function GameProvider({ children }) {
  const [state, dispatch] = useReducer(gameReducer, initialState)

  const startGame = useCallback((difficulty) => {
    dispatch({ type: 'START_GAME', difficulty })
  }, [])

  const flipCard = useCallback((index) => {
    dispatch({ type: 'FLIP_CARD', index })
  }, [])

  const checkMatch = useCallback(() => {
    dispatch({ type: 'CHECK_MATCH' })
  }, [])

  const setElapsed = useCallback((elapsed) => {
    dispatch({ type: 'SET_ELAPSED', elapsed })
  }, [])

  const resetGame = useCallback(() => {
    dispatch({ type: 'RESET' })
  }, [])

  return (
    <GameContext.Provider value={{
      ...state,
      startGame,
      flipCard,
      checkMatch,
      setElapsed,
      resetGame,
    }}>
      {children}
    </GameContext.Provider>
  )
}

export const useGame = () => useContext(GameContext)
