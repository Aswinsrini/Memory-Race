import { useEffect, useRef, useState, useCallback } from 'react'
import { io } from 'socket.io-client'

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001'

/**
 * useMultiplayer — manages the entire Socket.io lifecycle for multiplayer mode.
 *
 * Returns everything the UI needs: connection state, room info, player list,
 * opponent progress, and action dispatchers (create, join, ready, progress, etc.)
 */
export default function useMultiplayer() {
  const socketRef = useRef(null)

  // Connection
  const [connected, setConnected] = useState(false)

  // Room state
  const [roomCode, setRoomCode] = useState(null)
  const [players, setPlayers] = useState([])
  const [myId, setMyId] = useState(null)
  const [difficulty, setDifficulty] = useState('medium')

  // Game events
  const [multiplayerPhase, setMultiplayerPhase] = useState('idle')
  // 'idle' | 'lobby' | 'countdown' | 'playing' | 'finished'

  const [countdown, setCountdown] = useState(0)
  const [gameResult, setGameResult] = useState(null)
  // { winnerId, winnerName, winnerMoves, winnerElapsed, reason? }

  const [error, setError] = useState(null)

  // ─── Connect / Disconnect ──────────────────────────────────────

  const connect = useCallback(() => {
    if (socketRef.current?.connected) return

    const socket = io(SERVER_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    })

    socket.on('connect', () => {
      setConnected(true)
      setMyId(socket.id)
      setError(null)
    })

    socket.on('disconnect', () => {
      setConnected(false)
    })

    socket.on('connect_error', (err) => {
      setError('Could not connect to server')
      setConnected(false)
    })

    // ─── Room Events ─────────────────────────────────────────────

    socket.on('player_joined', ({ players: updatedPlayers }) => {
      setPlayers(updatedPlayers)
    })

    socket.on('player_left', ({ players: updatedPlayers, leftPlayer }) => {
      setPlayers(updatedPlayers)
    })

    socket.on('room_updated', ({ players: updatedPlayers }) => {
      setPlayers(updatedPlayers)
    })

    // ─── Game Start (after all players ready) ────────────────────

    socket.on('game_start', ({ difficulty: diff, players: updatedPlayers, startTimestamp }) => {
      setDifficulty(diff)
      setPlayers(updatedPlayers)
      setMultiplayerPhase('countdown')
      setGameResult(null)

      // Countdown timer until startTimestamp
      const now = Date.now()
      const delay = Math.max(0, startTimestamp - now)
      const seconds = Math.ceil(delay / 1000)
      setCountdown(seconds)

      let remaining = seconds
      const interval = setInterval(() => {
        remaining -= 1
        setCountdown(remaining)
        if (remaining <= 0) {
          clearInterval(interval)
          setMultiplayerPhase('playing')
        }
      }, 1000)
    })

    // ─── Live Progress ───────────────────────────────────────────

    socket.on('opponents_progress', ({ players: updatedPlayers }) => {
      setPlayers(updatedPlayers)
    })

    // ─── Game Over ───────────────────────────────────────────────

    socket.on('game_over', (result) => {
      setGameResult(result)
      setPlayers(result.players)
      setMultiplayerPhase('finished')
    })

    // ─── Room Reset (play again) ─────────────────────────────────

    socket.on('room_reset', ({ players: updatedPlayers }) => {
      setPlayers(updatedPlayers)
      setMultiplayerPhase('lobby')
      setGameResult(null)
      setCountdown(0)
    })

    socketRef.current = socket
  }, [])

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.emit('leave_room')
      socketRef.current.disconnect()
      socketRef.current = null
    }
    setConnected(false)
    setRoomCode(null)
    setPlayers([])
    setMyId(null)
    setMultiplayerPhase('idle')
    setGameResult(null)
    setError(null)
  }, [])

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect()
      }
    }
  }, [])

  // ─── Actions ───────────────────────────────────────────────────

  const createRoom = useCallback((username, diff) => {
    const socket = socketRef.current
    if (!socket?.connected) return

    socket.emit('create_room', { username, difficulty: diff }, (response) => {
      if (response.success) {
        setRoomCode(response.roomCode)
        setPlayers(response.players)
        setDifficulty(response.difficulty)
        setMultiplayerPhase('lobby')
        setError(null)
      } else {
        setError(response.error)
      }
    })
  }, [])

  const joinRoom = useCallback((code, username) => {
    const socket = socketRef.current
    if (!socket?.connected) return

    socket.emit('join_room', { roomCode: code, username }, (response) => {
      if (response.success) {
        setRoomCode(response.roomCode)
        setPlayers(response.players)
        setDifficulty(response.difficulty)
        setMultiplayerPhase('lobby')
        setError(null)
      } else {
        setError(response.error)
      }
    })
  }, [])

  const toggleReady = useCallback(() => {
    const socket = socketRef.current
    if (!socket?.connected) return

    socket.emit('player_ready', (response) => {
      // Updated via room_updated event
    })
  }, [])

  const sendProgress = useCallback((matchedPairs, totalPairs, moves) => {
    const socket = socketRef.current
    if (!socket?.connected) return

    socket.emit('progress_update', { matchedPairs, totalPairs, moves })
  }, [])

  const sendGameCompleted = useCallback((moves, elapsed) => {
    const socket = socketRef.current
    if (!socket?.connected) return

    socket.emit('game_completed', { moves, elapsed })
  }, [])

  const playAgain = useCallback(() => {
    const socket = socketRef.current
    if (!socket?.connected) return

    socket.emit('play_again')
  }, [])

  const leaveRoom = useCallback(() => {
    const socket = socketRef.current
    if (socket?.connected) {
      socket.emit('leave_room')
    }
    setRoomCode(null)
    setPlayers([])
    setMultiplayerPhase('idle')
    setGameResult(null)
  }, [])

  return {
    // State
    connected,
    roomCode,
    players,
    myId,
    difficulty,
    multiplayerPhase,
    countdown,
    gameResult,
    error,

    // Actions
    connect,
    disconnect,
    createRoom,
    joinRoom,
    toggleReady,
    sendProgress,
    sendGameCompleted,
    playAgain,
    leaveRoom,
  }
}
