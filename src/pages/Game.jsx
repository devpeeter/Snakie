import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';

const Game = () => {
  const canvasRef = useRef(null);
  const gameLoopRef = useRef(null);
  const [gameState, setGameState] = useState({
    snake: [{ x: 400, y: 300 }],
    direction: { x: 20, y: 0 },
    food: { x: 200, y: 200, type: 0 },
    score: 0,
    gameOver: false,
    paused: false
  });
  const [gameStartTime, setGameStartTime] = useState(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Set canvas size
    canvas.width = 800;
    canvas.height = 600;

    // Initialize game
    startGame();

    // Keyboard controls
    const handleKeyPress = (e) => {
      if (gameState.gameOver || gameState.paused) return;

      switch (e.key) {
        case 'ArrowUp':
          if (gameState.direction.y === 0) {
            setGameState(prev => ({ ...prev, direction: { x: 0, y: -20 } }));
          }
          break;
        case 'ArrowDown':
          if (gameState.direction.y === 0) {
            setGameState(prev => ({ ...prev, direction: { x: 0, y: 20 } }));
          }
          break;
        case 'ArrowLeft':
          if (gameState.direction.x === 0) {
            setGameState(prev => ({ ...prev, direction: { x: -20, y: 0 } }));
          }
          break;
        case 'ArrowRight':
          if (gameState.direction.x === 0) {
            setGameState(prev => ({ ...prev, direction: { x: 20, y: 0 } }));
          }
          break;
        case ' ':
          togglePause();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!gameState.paused && !gameState.gameOver) {
      gameLoopRef.current = setInterval(updateGame, 150);
    } else {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
    }

    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
    };
  }, [gameState.paused, gameState.gameOver]);

  useEffect(() => {
    draw();
  }, [gameState]);

  const startGame = () => {
    setGameState({
      snake: [{ x: 400, y: 300 }],
      direction: { x: 20, y: 0 },
      food: generateFood(),
      score: 0,
      gameOver: false,
      paused: false
    });
    setGameStartTime(Date.now());
  };

  const generateFood = () => {
    return {
      x: Math.floor(Math.random() * 40) * 20,
      y: Math.floor(Math.random() * 30) * 20,
      type: Math.floor(Math.random() * 4)
    };
  };

  const updateGame = () => {
    setGameState(prevState => {
      if (prevState.gameOver || prevState.paused) return prevState;

      const newSnake = [...prevState.snake];
      const head = { ...newSnake[0] };
      
      head.x += prevState.direction.x;
      head.y += prevState.direction.y;

      // Check wall collision
      if (head.x < 0 || head.x >= 800 || head.y < 0 || head.y >= 600) {
        endGame(prevState.score);
        return { ...prevState, gameOver: true };
      }

      // Check self collision
      for (let segment of newSnake) {
        if (head.x === segment.x && head.y === segment.y) {
          endGame(prevState.score);
          return { ...prevState, gameOver: true };
        }
      }

      newSnake.unshift(head);

      // Check food collision
      let newFood = prevState.food;
      let newScore = prevState.score;
      
      if (head.x === prevState.food.x && head.y === prevState.food.y) {
        newScore += 10;
        newFood = generateFood();
      } else {
        newSnake.pop();
      }

      return {
        ...prevState,
        snake: newSnake,
        food: newFood,
        score: newScore
      };
    });
  };

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // Clear canvas
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw snake
    ctx.fillStyle = '#ff6c00';
    gameState.snake.forEach((segment, index) => {
      if (index === 0) {
        // Snake head
        ctx.fillStyle = '#ffff00';
      } else {
        ctx.fillStyle = '#ff6c00';
      }
      ctx.fillRect(segment.x, segment.y, 18, 18);
    });

    // Draw food
    const foodColors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00'];
    ctx.fillStyle = foodColors[gameState.food.type];
    ctx.beginPath();
    ctx.arc(gameState.food.x + 10, gameState.food.y + 10, 8, 0, 2 * Math.PI);
    ctx.fill();

    // Draw game over or paused text
    if (gameState.gameOver) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.fillStyle = '#fff';
      ctx.font = '48px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Game Over', canvas.width / 2, canvas.height / 2);
      
      ctx.font = '24px Arial';
      ctx.fillText(`Score: ${gameState.score}`, canvas.width / 2, canvas.height / 2 + 50);
      ctx.fillText('Press R to restart', canvas.width / 2, canvas.height / 2 + 80);
    } else if (gameState.paused) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.fillStyle = '#fff';
      ctx.font = '48px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Paused', canvas.width / 2, canvas.height / 2);
      
      ctx.font = '24px Arial';
      ctx.fillText('Press Space to continue', canvas.width / 2, canvas.height / 2 + 50);
    }
  };

  const togglePause = () => {
    setGameState(prev => ({ ...prev, paused: !prev.paused }));
  };

  const endGame = async (finalScore) => {
    if (gameStartTime) {
      const duration = Math.floor((Date.now() - gameStartTime) / 1000);
      
      try {
        await axios.post('/api/game/session', {
          score: finalScore,
          gameMode: 'single',
          duration,
          gameData: {
            snakeLength: gameState.snake.length,
            foodEaten: Math.floor(finalScore / 10)
          }
        });
      } catch (error) {
        console.error('Failed to save game session:', error);
      }
    }
  };

  const handleRestart = () => {
    if (gameState.gameOver) {
      startGame();
    }
  };

  // Handle restart key
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key.toLowerCase() === 'r' && gameState.gameOver) {
        handleRestart();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameState.gameOver]);

  return (
    <div className="game-container">
      <div className="text-center mb-4">
        <h1 className="text-3xl font-bold text-game-primary mb-2">Single Player Snake</h1>
        <div className="flex justify-center space-x-8 text-lg">
          <span>Score: {gameState.score}</span>
          <span>Length: {gameState.snake.length}</span>
        </div>
      </div>

      <div className="relative">
        <canvas
          ref={canvasRef}
          className="game-canvas mx-auto"
          tabIndex={0}
        />
      </div>

      <div className="text-center mt-4 space-y-2">
        <div className="flex justify-center space-x-4">
          <button
            onClick={togglePause}
            disabled={gameState.gameOver}
            className="btn-secondary"
          >
            {gameState.paused ? 'Resume' : 'Pause'}
          </button>
          <button
            onClick={handleRestart}
            className="btn-primary"
          >
            Restart
          </button>
        </div>
        
        <div className="text-sm text-gray-400">
          <p>Use arrow keys to move • Space to pause • R to restart</p>
        </div>
      </div>
    </div>
  );
};

export default Game;