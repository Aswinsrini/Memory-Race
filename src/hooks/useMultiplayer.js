import { useEffect, useRef, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'

/**
 * useMultiplayer — Supabase Realtime multiplayer hook.
 *
 * Uses Supabase Realtime Broadcast for in-game communication
 * and the database for room/player persistence.
 */
export default function useMultiplayer() {
  const channelRef = useRef(null)
  const userIdRef = useRef(null)    // stored on create/join
  const usernameRef = useRef(null)  // stored on create/join
  const finishSentRef = useRef(false) // dedup guard for sendPlayerFinished

  // Room state
  const [roomData, setRoomData] = useState(null)    // DB room object
  const [roomCode, setRoomCode] = useState(null)
  const [players, setPlayers] = useState([])        // room_players joined with profiles
  const [difficulty, setDifficulty] = useState('medium')
  const [isHost, setIsHost] = useState(false)

  // Game phase
  const [multiplayerPhase, setMultiplayerPhase] = useState('idle')
  // 'idle' | 'lobby' | 'countdown' | 'playing' | 'completed' | 'results'

  const [countdown, setCountdown] = useState(0)
  const [rankings, setRankings] = useState([])       // sorted finish order
  const [error, setError] = useState(null)

  // Opponent live progress (from broadcast)
  const [opponentProgress, setOpponentProgress] = useState({})
  // { [userId]: { matchedPairs, totalPairs, moves, finished } }

  // ─── Fetch Players ─────────────────────────────────────────────

  const fetchPlayers = useCallback(async (roomId, createdBy) => {
    const { data } = await supabase
      .from('room_players')
      .select('*, profile:profiles(*)')
      .eq('room_id', roomId)
      .order('joined_at', { ascending: true })

    if (data) {
      const mapped = data.map(rp => ({
        id: rp.user_id,
        user_id: rp.user_id,
        dbId: rp.id,
        username: rp.profile?.display_name || rp.profile?.username || 'Player',
        is_host: createdBy ? rp.user_id === createdBy : false,
        status: rp.status,
        matchedPairs: rp.matched_pairs,
        totalPairs: rp.total_pairs,
        moves: rp.moves,
        elapsedMs: rp.elapsed_ms,
        finishRank: rp.finish_rank,
        finishedAt: rp.finished_at,
      }))
      setPlayers(mapped)
      return mapped
    }
    return []
  }, [])

  // ─── Join Channel ──────────────────────────────────────────────

  const joinChannel = useCallback((code, userId) => {
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current)
    }

    const channel = supabase.channel(`room:${code}`, {
      config: { broadcast: { self: true } },
    })

    // Listen for game_start
    channel.on('broadcast', { event: 'game_start' }, ({ payload }) => {
      setMultiplayerPhase('countdown')
      setDifficulty(payload.difficulty)

      let remaining = 3
      setCountdown(remaining)
      const iv = setInterval(() => {
        remaining -= 1
        setCountdown(remaining)
        if (remaining <= 0) {
          clearInterval(iv)
          setMultiplayerPhase('playing')
        }
      }, 1000)
    })

    // Listen for progress
    channel.on('broadcast', { event: 'progress' }, ({ payload }) => {
      if (payload.userId !== userId) {
        setOpponentProgress(prev => ({
          ...prev,
          [payload.userId]: {
            matchedPairs: payload.matchedPairs,
            totalPairs: payload.totalPairs,
            moves: payload.moves,
            finished: payload.finished || false,
            username: payload.username,
          },
        }))
      }
    })

    // Listen for player_finished
    channel.on('broadcast', { event: 'player_finished' }, ({ payload }) => {
      setOpponentProgress(prev => ({
        ...prev,
        [payload.userId]: {
          ...prev[payload.userId],
          finished: true,
          matchedPairs: payload.matchedPairs,
          totalPairs: payload.totalPairs,
          moves: payload.moves,
          elapsedMs: payload.elapsedMs,
          finishRank: payload.rank,
          username: payload.username,
        },
      }))
    })

    // Listen for all_finished
    channel.on('broadcast', { event: 'all_finished' }, ({ payload }) => {
      setRankings(payload.rankings)
      setMultiplayerPhase('results')
    })

    // Listen for room_reset
    channel.on('broadcast', { event: 'room_reset' }, () => {
      setMultiplayerPhase('lobby')
      setOpponentProgress({})
      setRankings([])
    })

    // Listen for player_joined / player_left
    channel.on('broadcast', { event: 'players_updated' }, ({ payload }) => {
      if (payload.roomId && payload.createdBy) {
        fetchPlayers(payload.roomId, payload.createdBy)
      }
    })

    channel.subscribe()
    channelRef.current = channel
  }, [fetchPlayers])

  // ─── Create Room ───────────────────────────────────────────────

  const createRoom = useCallback(async (userId, diff, username) => {
    setError(null)
    userIdRef.current = userId
    usernameRef.current = username || 'Player'
    try {
      const code = Array.from({ length: 6 }, () =>
        'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[Math.floor(Math.random() * 31)]
      ).join('')

      const { data: room, error: err } = await supabase
        .from('rooms')
        .insert({ code, difficulty: diff, created_by: userId, max_players: 10 })
        .select()
        .single()

      if (err) throw err

      await supabase.from('room_players').insert({
        room_id: room.id,
        user_id: userId,
        status: 'waiting',
      })

      setRoomData(room)
      setRoomCode(room.code)
      setDifficulty(room.difficulty)
      setIsHost(true)
      setMultiplayerPhase('lobby')
      await fetchPlayers(room.id, room.created_by)
      joinChannel(room.code, userId)

      return room
    } catch (err) {
      setError(err.message)
      return null
    }
  }, [fetchPlayers, joinChannel])

  // ─── Join Room ─────────────────────────────────────────────────

  const joinRoom = useCallback(async (room, userId, username) => {
    setError(null)
    userIdRef.current = userId
    usernameRef.current = username || 'Player'
    try {
      // Check player count
      const { count } = await supabase
        .from('room_players')
        .select('*', { count: 'exact', head: true })
        .eq('room_id', room.id)

      if (count >= 10) {
        setError('Room is full (max 10 players)')
        return false
      }

      // Check if already in room
      const { data: existing } = await supabase
        .from('room_players')
        .select('id')
        .eq('room_id', room.id)
        .eq('user_id', userId)
        .maybeSingle()

      if (!existing) {
        const { error: err } = await supabase
          .from('room_players')
          .insert({ room_id: room.id, user_id: userId, status: 'waiting' })

        if (err) throw err
      }

      setRoomData(room)
      setRoomCode(room.code)
      setDifficulty(room.difficulty)
      setIsHost(room.created_by === userId)
      setMultiplayerPhase('lobby')
      await fetchPlayers(room.id, room.created_by)
      joinChannel(room.code, userId)

      // Notify others
      setTimeout(() => {
        channelRef.current?.send({
          type: 'broadcast', event: 'players_updated',
          payload: { roomId: room.id, createdBy: room.created_by },
        })
      }, 500)

      return true
    } catch (err) {
      setError(err.message)
      return false
    }
  }, [fetchPlayers, joinChannel])

  // ─── Start Game (host only) ────────────────────────────────────

  const startGame = useCallback(async () => {
    if (!roomData || !isHost) return
    if (players.length < 2) {
      setError('Need at least 2 players')
      return
    }

    // Update room status
    await supabase
      .from('rooms')
      .update({ status: 'playing', started_at: new Date().toISOString() })
      .eq('id', roomData.id)

    // Update all players to 'playing'
    await supabase
      .from('room_players')
      .update({ status: 'playing', matched_pairs: 0, moves: 0, elapsed_ms: 0, finish_rank: null, finished_at: null })
      .eq('room_id', roomData.id)

    // Reset dedup flag for new game
    finishSentRef.current = false

    // Broadcast game start
    channelRef.current?.send({
      type: 'broadcast', event: 'game_start',
      payload: { difficulty: roomData.difficulty },
    })
  }, [roomData, isHost, players])

  // ─── Send Progress (called from GameBoard) ─────────────────────

  const sendProgress = useCallback(({ matchedPairs, totalPairs, moves }) => {
    const userId = userIdRef.current
    const username = usernameRef.current
    if (!userId || !channelRef.current) return

    channelRef.current.send({
      type: 'broadcast', event: 'progress',
      payload: { userId, username, matchedPairs, totalPairs, moves, finished: false },
    })
  }, [])

  // ─── Player Finished (called from GameBoard) ──────────────────

  const sendPlayerFinished = useCallback(async ({ moves, elapsed, matchedPairs, totalPairs }) => {
    const userId = userIdRef.current
    const username = usernameRef.current
    if (!userId || !roomData) return

    // Dedup guard — only send once per game
    if (finishSentRef.current) return
    finishSentRef.current = true

    // Count how many have finished before us
    const { count } = await supabase
      .from('room_players')
      .select('*', { count: 'exact', head: true })
      .eq('room_id', roomData.id)
      .eq('status', 'finished')

    const rank = (count || 0) + 1

    // Update this player's record
    await supabase
      .from('room_players')
      .update({
        status: 'finished',
        matched_pairs: matchedPairs,
        total_pairs: totalPairs,
        moves,
        elapsed_ms: elapsed,
        finish_rank: rank,
        finished_at: new Date().toISOString(),
      })
      .eq('room_id', roomData.id)
      .eq('user_id', userId)

    // Broadcast
    channelRef.current?.send({
      type: 'broadcast', event: 'player_finished',
      payload: { userId, username, moves, elapsedMs: elapsed, matchedPairs, totalPairs, rank },
    })

    // Check if all players finished
    const { count: totalPlayers } = await supabase
      .from('room_players')
      .select('*', { count: 'exact', head: true })
      .eq('room_id', roomData.id)

    const { count: finishedCount } = await supabase
      .from('room_players')
      .select('*', { count: 'exact', head: true })
      .eq('room_id', roomData.id)
      .eq('status', 'finished')

    if (finishedCount >= totalPlayers) {
      // All done — fetch final rankings and broadcast
      await finalizeGame(roomData.id)
    }
  }, [roomData])

  const finalizeGame = useCallback(async (roomId) => {
    // Idempotency check — only finalize if room is still 'playing'
    const { data: roomCheck } = await supabase
      .from('rooms')
      .select('status')
      .eq('id', roomId)
      .single()
    if (roomCheck?.status === 'finished') return // Already finalized

    // Update room status
    await supabase
      .from('rooms')
      .update({ status: 'finished', finished_at: new Date().toISOString() })
      .eq('id', roomId)

    // Fetch final rankings
    const { data: finalPlayers } = await supabase
      .from('room_players')
      .select('*, profile:profiles(*)')
      .eq('room_id', roomId)
      .order('finish_rank', { ascending: true })

    if (finalPlayers) {
      const rankList = finalPlayers.map(rp => ({
        userId: rp.user_id,
        username: rp.profile?.display_name || rp.profile?.username || 'Player',
        rank: rp.finish_rank,
        moves: rp.moves,
        elapsedMs: rp.elapsed_ms,
        matchedPairs: rp.matched_pairs,
        totalPairs: rp.total_pairs,
        isWinner: rp.finish_rank === 1,
      }))

      // Save game results
      const { data: room } = await supabase
        .from('rooms')
        .select('code, difficulty')
        .eq('id', roomId)
        .single()

      for (const r of rankList) {
        await supabase.from('game_results').insert({
          room_id: roomId,
          room_code: room?.code || '',
          user_id: r.userId,
          username: r.username,
          difficulty: room?.difficulty || 'medium',
          finish_rank: r.rank,
          total_players: rankList.length,
          matched_pairs: r.matchedPairs,
          total_pairs: r.totalPairs,
          moves: r.moves,
          elapsed_ms: r.elapsedMs,
          is_winner: r.isWinner,
        })

        // Update profile stats
        const { data: profile } = await supabase
          .from('profiles')
          .select('games_played, games_won, best_time_ms')
          .eq('id', r.userId)
          .single()

        if (profile) {
          const updates = {
            games_played: (profile.games_played || 0) + 1,
            games_won: (profile.games_won || 0) + (r.isWinner ? 1 : 0),
          }
          if (r.elapsedMs && (!profile.best_time_ms || r.elapsedMs < profile.best_time_ms)) {
            updates.best_time_ms = r.elapsedMs
          }
          await supabase.from('profiles').update(updates).eq('id', r.userId)
        }
      }

      setRankings(rankList)

      // Broadcast all_finished
      channelRef.current?.send({
        type: 'broadcast', event: 'all_finished',
        payload: { rankings: rankList },
      })
    }
  }, [])

  // ─── Play Again ────────────────────────────────────────────────

  const playAgain = useCallback(async () => {
    if (!roomData) return

    await supabase
      .from('rooms')
      .update({ status: 'waiting', started_at: null, finished_at: null })
      .eq('id', roomData.id)

    await supabase
      .from('room_players')
      .update({ status: 'waiting', matched_pairs: 0, moves: 0, elapsed_ms: 0, finish_rank: null, finished_at: null })
      .eq('room_id', roomData.id)

    finishSentRef.current = false
    setMultiplayerPhase('lobby')
    setRankings([])
    setOpponentProgress({})
    await fetchPlayers(roomData.id, roomData.created_by)

    channelRef.current?.send({
      type: 'broadcast', event: 'room_reset', payload: {},
    })
  }, [roomData, fetchPlayers])

  // ─── Leave Room ────────────────────────────────────────────────

  const leaveRoom = useCallback(async () => {
    const userId = userIdRef.current
    if (roomData && userId) {
      await supabase
        .from('room_players')
        .delete()
        .eq('room_id', roomData.id)
        .eq('user_id', userId)

      channelRef.current?.send({
        type: 'broadcast', event: 'players_updated',
        payload: { roomId: roomData.id, createdBy: roomData.created_by },
      })
    }

    if (channelRef.current) {
      supabase.removeChannel(channelRef.current)
      channelRef.current = null
    }

    finishSentRef.current = false
    setRoomData(null)
    setRoomCode(null)
    setPlayers([])
    setMultiplayerPhase('idle')
    setRankings([])
    setOpponentProgress({})
    setError(null)
    userIdRef.current = null
    usernameRef.current = null
  }, [roomData])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
      }
    }
  }, [])

  return {
    // State
    roomData,
    roomCode,
    players,
    difficulty,
    isHost,
    multiplayerPhase,
    countdown,
    rankings,
    error,
    opponentProgress,

    // Actions
    createRoom,
    joinRoom,
    startGame,
    sendProgress,
    sendPlayerFinished,
    playAgain,
    leaveRoom,
    fetchPlayers,
    setMultiplayerPhase,
    setError,
  }
}
