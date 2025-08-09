import { GameRoom } from './GameRoom.js';

export class GameManager {
  constructor(io) {
    this.io = io;
    this.rooms = new Map();
    this.players = new Map();
  }

  handleConnection(socket) {
    console.log(`Player ${socket.id} connected`);
    
    socket.on('join-room', (data) => this.handleJoinRoom(socket, data));
    socket.on('leave-room', () => this.handleLeaveRoom(socket));
    socket.on('game-input', (data) => this.handleGameInput(socket, data));
    socket.on('start-game', () => this.handleStartGame(socket));
  }

  handleDisconnection(socket) {
    const player = this.players.get(socket.id);
    if (player) {
      this.handleLeaveRoom(socket);
    }
  }

  handleJoinRoom(socket, { roomId, playerName }) {
    try {
      // Leave current room if in one
      this.handleLeaveRoom(socket);

      // Find or create room
      let room = this.rooms.get(roomId);
      if (!room) {
        room = new GameRoom(roomId, this.io);
        this.rooms.set(roomId, room);
      }

      // Add player to room
      const player = {
        id: socket.id,
        name: playerName,
        roomId: roomId
      };

      if (room.addPlayer(player)) {
        socket.join(roomId);
        this.players.set(socket.id, player);
        
        socket.emit('room-joined', {
          roomId,
          players: room.getPlayers(),
          gameState: room.getGameState()
        });

        socket.to(roomId).emit('player-joined', player);
      } else {
        socket.emit('room-full', { roomId });
      }
    } catch (error) {
      console.error('Join room error:', error);
      socket.emit('error', { message: 'Failed to join room' });
    }
  }

  handleLeaveRoom(socket) {
    const player = this.players.get(socket.id);
    if (!player) return;

    const room = this.rooms.get(player.roomId);
    if (room) {
      room.removePlayer(socket.id);
      socket.leave(player.roomId);
      socket.to(player.roomId).emit('player-left', { playerId: socket.id });

      // Remove empty rooms
      if (room.isEmpty()) {
        this.rooms.delete(player.roomId);
      }
    }

    this.players.delete(socket.id);
  }

  handleGameInput(socket, inputData) {
    const player = this.players.get(socket.id);
    if (!player) return;

    const room = this.rooms.get(player.roomId);
    if (room) {
      room.handlePlayerInput(socket.id, inputData);
    }
  }

  handleStartGame(socket) {
    const player = this.players.get(socket.id);
    if (!player) return;

    const room = this.rooms.get(player.roomId);
    if (room) {
      room.startGame();
    }
  }
}