import { GameEngine } from './GameEngine.js';

export class GameRoom {
  constructor(id, io) {
    this.id = id;
    this.io = io;
    this.players = new Map();
    this.maxPlayers = 4;
    this.gameEngine = new GameEngine();
    this.gameState = 'waiting'; // waiting, playing, finished
    this.gameLoop = null;
  }

  addPlayer(player) {
    if (this.players.size >= this.maxPlayers) {
      return false;
    }

    this.players.set(player.id, {
      ...player,
      snake: null,
      score: 0,
      alive: true
    });

    return true;
  }

  removePlayer(playerId) {
    this.players.delete(playerId);
    
    if (this.gameState === 'playing') {
      this.gameEngine.removePlayer(playerId);
    }
  }

  getPlayers() {
    return Array.from(this.players.values());
  }

  getGameState() {
    return {
      state: this.gameState,
      players: this.getPlayers(),
      gameData: this.gameEngine.getGameData()
    };
  }

  isEmpty() {
    return this.players.size === 0;
  }

  startGame() {
    if (this.gameState !== 'waiting' || this.players.size < 1) {
      return;
    }

    this.gameState = 'playing';
    this.gameEngine.initializeGame(Array.from(this.players.keys()));
    
    // Start game loop
    this.gameLoop = setInterval(() => {
      this.updateGame();
    }, 1000 / 60); // 60 FPS

    this.io.to(this.id).emit('game-started', this.getGameState());
  }

  updateGame() {
    const gameData = this.gameEngine.update();
    
    // Update player scores
    for (const [playerId, playerData] of gameData.players) {
      const player = this.players.get(playerId);
      if (player) {
        player.score = playerData.score;
        player.alive = playerData.alive;
      }
    }

    // Broadcast game state
    this.io.to(this.id).emit('game-update', {
      gameData,
      players: this.getPlayers()
    });

    // Check for game end
    if (gameData.gameOver) {
      this.endGame();
    }
  }

  endGame() {
    if (this.gameLoop) {
      clearInterval(this.gameLoop);
      this.gameLoop = null;
    }

    this.gameState = 'finished';
    
    const finalScores = this.getPlayers()
      .sort((a, b) => b.score - a.score)
      .map((player, index) => ({
        ...player,
        rank: index + 1
      }));

    this.io.to(this.id).emit('game-ended', {
      finalScores,
      gameData: this.gameEngine.getGameData()
    });

    // Reset room after delay
    setTimeout(() => {
      this.resetRoom();
    }, 10000);
  }

  resetRoom() {
    this.gameState = 'waiting';
    this.gameEngine.reset();
    
    // Reset player states
    for (const player of this.players.values()) {
      player.score = 0;
      player.alive = true;
      player.snake = null;
    }

    this.io.to(this.id).emit('room-reset', this.getGameState());
  }

  handlePlayerInput(playerId, inputData) {
    if (this.gameState === 'playing') {
      this.gameEngine.handlePlayerInput(playerId, inputData);
    }
  }
}