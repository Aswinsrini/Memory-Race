import { createContext, useContext, useReducer, useCallback } from 'react'
import { shuffleCards, CARD_EMOJIS } from '../utils/cards'

const GameContext = createContext()

const DIFFICULTY = {
  easy: 6,
  medium: 8,
  hard: 12,
}

const initialState = {
  cards: [],
  flipped: [],
  matched: new Set(),
  moves: 0,
  difficulty: 'medium',
  gameStatus: 'idle', // idle | playing | completed | won | lost | results
  startTime: null,
  elapsed: 0,
  totalPairs: 0,
  matchedPairs: 0,
  isMultiplayer: false,
}

function gameReducer(state, action) {
  switch (action.type) {
    case 'START_GAME': {
      const diff = action.difficulty || state.difficulty
      const pairs = DIFFICULTY[diff]
      const cards = shuffleCards(CARD_EMOJIS.slice(0, pairs))
      return {
        ...initialState,
        cards,
        difficulty: diff,
        gameStatus: 'playing',
        startTime: action.startTime || Date.now(),
        totalPairs: pairs,
        isMultiplayer: action.isMultiplayer || false,
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
      return { ...state, flipped: [...state.flipped, index] }
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

      const allDone = matchedPairs === state.totalPairs
      let newStatus = 'playing'
      if (allDone) {
        newStatus = state.isMultiplayer ? 'completed' : 'won'
      }

      return {
        ...state,
        flipped: [],
        matched: newMatched,
        matchedPairs,
        moves: state.moves + 1,
        gameStatus: newStatus,
      }
    }

    case 'SET_ELAPSED':
      return { ...state, elapsed: action.elapsed }

    case 'SHOW_RESULTS':
      return { ...state, gameStatus: 'results' }

    case 'FORCE_LOST':
      return { ...state, gameStatus: 'lost' }

    case 'RESET':
      return { ...initialState }

    default:
      return state
  }
}

export function GameProvider({ children }) {
  const [state, dispatch] = useReducer(gameReducer, initialState)

  const startGame = useCallback((difficulty, opts = {}) => {
    dispatch({
      type: 'START_GAME',
      difficulty,
      isMultiplayer: opts.isMultiplayer || false,
      startTime: opts.startTime || undefined,
    })
  }, [])

  const flipCard = useCallback((index) => dispatch({ type: 'FLIP_CARD', index }), [])
  const checkMatch = useCallback(() => dispatch({ type: 'CHECK_MATCH' }), [])
  const setElapsed = useCallback((elapsed) => dispatch({ type: 'SET_ELAPSED', elapsed }), [])
  const resetGame = useCallback(() => dispatch({ type: 'RESET' }), [])
  const forceLost = useCallback(() => dispatch({ type: 'FORCE_LOST' }), [])
  const showResults = useCallback(() => dispatch({ type: 'SHOW_RESULTS' }), [])

  return (
    <GameContext.Provider value={{
      ...state, startGame, flipCard, checkMatch, setElapsed, resetGame, forceLost, showResults,
    }}>
      {children}
    </GameContext.Provider>
  )
}

export const useGame = () => useContext(GameContext)
