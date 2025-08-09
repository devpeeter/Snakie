export class GameEngine {
  constructor() {
    this.players = new Map();
    this.food = [];
    this.gameArea = { width: 800, height: 600 };
    this.gameOver = false;
    this.lastUpdate = Date.now();
  }

  initializeGame(playerIds) {
    this.players.clear();
    this.food = [];
    this.gameOver = false;
    this.lastUpdate = Date.now();

    // Initialize players with snakes
    playerIds.forEach((playerId, index) => {
      const startX = 100 + (index * 150);
      const startY = 300;
      
      this.players.set(playerId, {
        id: playerId,
        snake: {
          body: [{ x: startX, y: startY }],
          direction: { x: 1, y: 0 },
          nextDirection: { x: 1, y: 0 }
        },
        score: 0,
        alive: true
      });
    });

    // Generate initial food
    this.generateFood();
  }

  update() {
    const now = Date.now();
    const deltaTime = now - this.lastUpdate;
    this.lastUpdate = now;

    if (this.gameOver) {
      return this.getGameData();
    }

    // Update snakes
    for (const [playerId, player] of this.players) {
      if (player.alive) {
        this.updateSnake(player);
        this.checkCollisions(player);
      }
    }

    // Check for game over
    const alivePlayers = Array.from(this.players.values()).filter(p => p.alive);
    if (alivePlayers.length <= 1) {
      this.gameOver = true;
    }

    // Generate food if needed
    if (this.food.length < 3) {
      this.generateFood();
    }

    return this.getGameData();
  }

  updateSnake(player) {
    const snake = player.snake;
    
    // Update direction
    snake.direction = { ...snake.nextDirection };
    
    // Move snake head
    const head = { ...snake.body[0] };
    head.x += snake.direction.x * 20;
    head.y += snake.direction.y * 20;
    
    snake.body.unshift(head);
    
    // Check food collision
    let ateFood = false;
    this.food = this.food.filter(food => {
      const distance = Math.sqrt(
        Math.pow(head.x - food.x, 2) + Math.pow(head.y - food.y, 2)
      );
      
      if (distance < 15) {
        player.score += 10;
        ateFood = true;
        return false;
      }
      return true;
    });
    
    // Remove tail if no food eaten
    if (!ateFood) {
      snake.body.pop();
    }
  }

  checkCollisions(player) {
    const snake = player.snake;
    const head = snake.body[0];
    
    // Wall collision
    if (head.x < 0 || head.x >= this.gameArea.width || 
        head.y < 0 || head.y >= this.gameArea.height) {
      player.alive = false;
      return;
    }
    
    // Self collision
    for (let i = 1; i < snake.body.length; i++) {
      if (head.x === snake.body[i].x && head.y === snake.body[i].y) {
        player.alive = false;
        return;
      }
    }
    
    // Other snakes collision
    for (const [otherId, otherPlayer] of this.players) {
      if (otherId !== player.id && otherPlayer.alive) {
        for (const segment of otherPlayer.snake.body) {
          if (head.x === segment.x && head.y === segment.y) {
            player.alive = false;
            return;
          }
        }
      }
    }
  }

  generateFood() {
    const food = {
      x: Math.floor(Math.random() * (this.gameArea.width / 20)) * 20,
      y: Math.floor(Math.random() * (this.gameArea.height / 20)) * 20,
      type: Math.floor(Math.random() * 4) // 4 food types
    };
    
    this.food.push(food);
  }

  handlePlayerInput(playerId, inputData) {
    const player = this.players.get(playerId);
    if (!player || !player.alive) return;
    
    const { direction } = inputData;
    const snake = player.snake;
    
    // Prevent reverse direction
    if ((direction.x === -snake.direction.x && direction.y === snake.direction.y) ||
        (direction.y === -snake.direction.y && direction.x === snake.direction.x)) {
      return;
    }
    
    snake.nextDirection = direction;
  }

  removePlayer(playerId) {
    this.players.delete(playerId);
  }

  getGameData() {
    return {
      players: this.players,
      food: this.food,
      gameArea: this.gameArea,
      gameOver: this.gameOver
    };
  }

  reset() {
    this.players.clear();
    this.food = [];
    this.gameOver = false;
    this.lastUpdate = Date.now();
  }
}