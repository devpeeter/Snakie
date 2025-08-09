import React, { useEffect, useRef } from 'react';
import { useGame } from '../contexts/GameContext';

const MultiplayerGame = () => {
  const canvasRef = useRef(null);
  const { gameState, sendGameInput, leaveRoom } = useGame();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = 800;
    canvas.height = 600;

    const handleKeyPress = (e) => {
      let direction = null;

      switch (e.key) {
        case 'ArrowUp':
          direction = { x: 0, y: -1 };
          break;
        case 'ArrowDown':
          direction = { x: 0, y: 1 };
          break;
        case 'ArrowLeft':
          direction = { x: -1, y: 0 };
          break;
        case 'ArrowRight':
          direction = { x: 1, y: 0 };
          break;
      }

      if (direction) {
        sendGameInput({ direction });
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [sendGameInput]);

  useEffect(() => {
    draw();
  }, [gameState.gameData]);

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas || !gameState.gameData) return;

    const ctx = canvas.getContext('2d');
    
    // Clear canvas
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw players' snakes
    const colors = ['#ff6c00', '#00ff00', '#0000ff', '#ffff00'];
    let colorIndex = 0;

    for (const [playerId, playerData] of gameState.gameData.players) {
      if (playerData.alive && playerData.snake) {
        ctx.fillStyle = colors[colorIndex % colors.length];
        
        playerData.snake.body.forEach((segment, index) => {
          if (index === 0) {
            // Snake head - brighter color
            ctx.fillStyle = colors[colorIndex % colors.length];
          } else {
            // Snake body - slightly darker
            const color = colors[colorIndex % colors.length];
            ctx.fillStyle = color + '80'; // Add transparency
          }
          ctx.fillRect(segment.x, segment.y, 18, 18);
        });
        
        colorIndex++;
      }
    }

    // Draw food
    if (gameState.gameData.food) {
      gameState.gameData.food.forEach(food => {
        const foodColors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00'];
        ctx.fillStyle = foodColors[food.type % foodColors.length];
        ctx.beginPath();
        ctx.arc(food.x + 10, food.y + 10, 8, 0, 2 * Math.PI);
        ctx.fill();
      });
    }

    // Draw game over screen
    if (gameState.gameData.gameOver) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.fillStyle = '#fff';
      ctx.font = '48px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Game Over', canvas.width / 2, canvas.height / 2);
    }
  };

  const getPlayerScore = (playerId) => {
    if (!gameState.gameData?.players) return 0;
    const player = gameState.gameData.players.get(playerId);
    return player?.score || 0;
  };

  if (gameState.state === 'finished') {
    return (
      <div className="game-container">
        <div className="card max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-game-primary mb-6">Game Over!</h2>
          
          <div className="mb-6">
            <h3 className="text-xl font-bold mb-4">Final Scores</h3>
            <div className="space-y-2">
              {gameState.gameData.finalScores?.map((player) => (
                <div
                  key={player.id}
                  className={`flex justify-between items-center p-3 rounded ${
                    player.rank === 1 ? 'bg-yellow-600' : 'bg-gray-700'
                  }`}
                >
                  <span className="font-medium">
                    {player.rank === 1 ? '🥇' : player.rank === 2 ? '🥈' : player.rank === 3 ? '🥉' : `#${player.rank}`}
                    {' '}{player.name}
                  </span>
                  <span className="text-game-primary font-bold">
                    {player.score}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <button onClick={leaveRoom} className="btn-primary">
            Back to Lobby
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="game-container">
      <div className="text-center mb-4">
        <h1 className="text-3xl font-bold text-game-primary mb-2">Multiplayer Snake</h1>
        <div className="flex justify-center space-x-6 text-lg">
          {gameState.players.map((player, index) => (
            <span key={player.id} className={player.alive ? '' : 'line-through text-gray-500'}>
              {player.name}: {player.score}
            </span>
          ))}
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
        <button onClick={leaveRoom} className="btn-secondary">
          Leave Game
        </button>
        
        <div className="text-sm text-gray-400">
          <p>Use arrow keys to move your snake</p>
        </div>
      </div>
    </div>
  );
};

export default MultiplayerGame;