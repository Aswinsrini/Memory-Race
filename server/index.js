import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import crypto from 'crypto'

const app = express()
const httpServer = createServer(app)

const io = new Server(httpServer, {
  cors: {
    origin: ['http://localhost:5173', 'http://localhost:4173', 'http://127.0.0.1:5173'],
    methods: ['GET', 'POST'],
  },
})

// ─── In-Memory State ───────────────────────────────────────────────
// rooms Map<roomCode, RoomState>
//
// RoomState = {
//   code:       string
//   players:    Map<socketId, PlayerState>
//   difficulty: string
//   status:     'waiting' | 'playing' | 'finished'
//   winnerId:   string | null
//   createdAt:  number
// }
//
// PlayerState = {
//   id:            string (socket.id)
//   username:      string
//   ready:         boolean
//   matchedPairs:  number
//   totalPairs:    number
//   moves:         number
//   finished:      boolean
// }

const rooms = new Map()

// ─── Helpers ───────────────────────────────────────────────────────

function generateRoomCode() {
  // 6 char alphanumeric, uppercase
  let code
  do {
    code = crypto.randomBytes(3).toString('hex').toUpperCase().slice(0, 6)
  } while (rooms.has(code))
  return code
}

function getPlayerList(room) {
  return Array.from(room.players.values()).map(p => ({
    id: p.id,
    username: p.username,
    ready: p.ready,
    matchedPairs: p.matchedPairs,
    totalPairs: p.totalPairs,
    moves: p.moves,
    finished: p.finished,
  }))
}

function findRoomBySocket(socketId) {
  for (const [code, room] of rooms) {
    if (room.players.has(socketId)) return room
  }
  return null
}

function cleanupEmptyRooms() {
  for (const [code, room] of rooms) {
    if (room.players.size === 0) {
      rooms.delete(code)
    }
  }
}

// ─── Socket.io Event Handling ──────────────────────────────────────

io.on('connection', (socket) => {
  console.log(`[connect] ${socket.id}`)

  // ── Create Room ──────────────────────────────────────────────────
  socket.on('create_room', ({ username, difficulty }, callback) => {
    const code = generateRoomCode()

    const player = {
      id: socket.id,
      username: username || 'Player 1',
      ready: false,
      matchedPairs: 0,
      totalPairs: 0,
      moves: 0,
      finished: false,
    }

    const room = {
      code,
      players: new Map([[socket.id, player]]),
      difficulty: difficulty || 'medium',
      status: 'waiting',
      winnerId: null,
      createdAt: Date.now(),
    }

    rooms.set(code, room)
    socket.join(code)

    console.log(`[create_room] ${username} created room ${code}`)

    callback({
      success: true,
      roomCode: code,
      players: getPlayerList(room),
      difficulty: room.difficulty,
    })
  })

  // ── Join Room ────────────────────────────────────────────────────
  socket.on('join_room', ({ roomCode, username }, callback) => {
    const code = roomCode.toUpperCase().trim()
    const room = rooms.get(code)

    if (!room) {
      return callback({ success: false, error: 'Room not found' })
    }

    if (room.status !== 'waiting') {
      return callback({ success: false, error: 'Game already in progress' })
    }

    if (room.players.size >= 6) {
      return callback({ success: false, error: 'Room is full (max 6 players)' })
    }

    const player = {
      id: socket.id,
      username: username || `Player ${room.players.size + 1}`,
      ready: false,
      matchedPairs: 0,
      totalPairs: 0,
      moves: 0,
      finished: false,
    }

    room.players.set(socket.id, player)
    socket.join(code)

    console.log(`[join_room] ${username} joined room ${code}`)

    // Tell the joiner
    callback({
      success: true,
      roomCode: code,
      players: getPlayerList(room),
      difficulty: room.difficulty,
    })

    // Tell everyone else
    socket.to(code).emit('player_joined', {
      players: getPlayerList(room),
      newPlayer: { id: player.id, username: player.username },
    })
  })

  // ── Ready Toggle ─────────────────────────────────────────────────
  socket.on('player_ready', (callback) => {
    const room = findRoomBySocket(socket.id)
    if (!room || room.status !== 'waiting') return

    const player = room.players.get(socket.id)
    if (!player) return

    player.ready = !player.ready

    io.to(room.code).emit('room_updated', {
      players: getPlayerList(room),
    })

    // Check if ALL players are ready (need at least 2)
    const allReady = room.players.size >= 2 &&
      Array.from(room.players.values()).every(p => p.ready)

    if (allReady) {
      room.status = 'playing'

      // Reset all player game state
      for (const p of room.players.values()) {
        p.matchedPairs = 0
        p.moves = 0
        p.finished = false
      }

      console.log(`[game_start] Room ${room.code} — ${room.players.size} players`)

      // Broadcast game start with a small countdown delay built in
      io.to(room.code).emit('game_start', {
        difficulty: room.difficulty,
        players: getPlayerList(room),
        startTimestamp: Date.now() + 3000, // 3-second countdown
      })
    }

    if (typeof callback === 'function') {
      callback({ ready: player.ready })
    }
  })

  // ── Progress Update (during gameplay) ────────────────────────────
  socket.on('progress_update', ({ matchedPairs, totalPairs, moves }) => {
    const room = findRoomBySocket(socket.id)
    if (!room || room.status !== 'playing') return

    const player = room.players.get(socket.id)
    if (!player || player.finished) return

    player.matchedPairs = matchedPairs
    player.totalPairs = totalPairs
    player.moves = moves

    // Broadcast to everyone in room (including sender for consistency)
    io.to(room.code).emit('opponents_progress', {
      players: getPlayerList(room),
    })
  })

  // ── Game Completed (a player finished all pairs) ─────────────────
  socket.on('game_completed', ({ moves, elapsed }) => {
    const room = findRoomBySocket(socket.id)
    if (!room || room.status !== 'playing') return

    // CRITICAL: If someone already won, ignore subsequent completions
    if (room.winnerId) {
      console.log(`[game_completed] Ignoring late finish from ${socket.id} — ${room.winnerId} already won`)
      return
    }

    const player = room.players.get(socket.id)
    if (!player) return

    // Lock: declare this player the winner
    room.winnerId = socket.id
    room.status = 'finished'
    player.finished = true

    console.log(`[game_over] ${player.username} won room ${room.code} in ${moves} moves`)

    // Broadcast to the entire room
    io.to(room.code).emit('game_over', {
      winnerId: socket.id,
      winnerName: player.username,
      winnerMoves: moves,
      winnerElapsed: elapsed,
      players: getPlayerList(room),
    })
  })

  // ── Play Again (host resets the room) ────────────────────────────
  socket.on('play_again', () => {
    const room = findRoomBySocket(socket.id)
    if (!room) return

    room.status = 'waiting'
    room.winnerId = null

    for (const p of room.players.values()) {
      p.ready = false
      p.matchedPairs = 0
      p.totalPairs = 0
      p.moves = 0
      p.finished = false
    }

    io.to(room.code).emit('room_reset', {
      players: getPlayerList(room),
    })
  })

  // ── Leave Room ───────────────────────────────────────────────────
  socket.on('leave_room', () => {
    handleDisconnectFromRoom(socket)
  })

  // ── Disconnect ───────────────────────────────────────────────────
  socket.on('disconnect', (reason) => {
    console.log(`[disconnect] ${socket.id} — ${reason}`)
    handleDisconnectFromRoom(socket)
  })
})

function handleDisconnectFromRoom(socket) {
  const room = findRoomBySocket(socket.id)
  if (!room) return

  const player = room.players.get(socket.id)
  const username = player?.username || 'Unknown'

  room.players.delete(socket.id)
  socket.leave(room.code)

  console.log(`[leave] ${username} left room ${room.code} (${room.players.size} remaining)`)

  if (room.players.size === 0) {
    rooms.delete(room.code)
    console.log(`[cleanup] Room ${room.code} deleted (empty)`)
    return
  }

  // Notify remaining players
  io.to(room.code).emit('player_left', {
    players: getPlayerList(room),
    leftPlayer: { id: socket.id, username },
  })

  // If the game was in progress and now only 1 player remains, they win by default
  if (room.status === 'playing' && room.players.size === 1 && !room.winnerId) {
    const lastPlayer = Array.from(room.players.values())[0]
    room.winnerId = lastPlayer.id
    room.status = 'finished'
    lastPlayer.finished = true

    io.to(room.code).emit('game_over', {
      winnerId: lastPlayer.id,
      winnerName: lastPlayer.username,
      winnerMoves: lastPlayer.moves,
      winnerElapsed: 0,
      players: getPlayerList(room),
      reason: 'opponent_left',
    })
  }
}

// ─── Health Check ──────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    rooms: rooms.size,
    connections: io.engine.clientsCount,
  })
})

// ─── Start ─────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3001

httpServer.listen(PORT, () => {
  console.log(`\n  ⚡ MemoryRace server running on http://localhost:${PORT}\n`)
})
