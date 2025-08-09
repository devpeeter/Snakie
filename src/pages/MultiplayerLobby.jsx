import React, { useState } from 'react';
import { useGame } from '../contexts/GameContext';
import MultiplayerGame from '../components/MultiplayerGame';

const MultiplayerLobby = () => {
  const { gameState, joinRoom, leaveRoom, startGame } = useGame();
  const [roomId, setRoomId] = useState('');

  const handleJoinRoom = (e) => {
    e.preventDefault();
    if (roomId.trim()) {
      joinRoom(roomId.trim());
    }
  };

  const handleQuickJoin = () => {
    const quickRoomId = `room_${Math.random().toString(36).substr(2, 6)}`;
    joinRoom(quickRoomId);
  };

  if (gameState.state === 'playing') {
    return <MultiplayerGame />;
  }

  if (gameState.state === 'lobby') {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="card">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-game-primary mb-2">
              Game Lobby
            </h2>
            <p className="text-gray-300">Room: {gameState.room}</p>
          </div>

          <div className="mb-6">
            <h3 className="text-xl font-bold mb-4">Players ({gameState.players.length}/4)</h3>
            <div className="space-y-2">
              {gameState.players.map((player, index) => (
                <div
                  key={player.id}
                  className="flex items-center justify-between bg-gray-700 rounded p-3"
                >
                  <span className="font-medium">{player.name}</span>
                  <span className="text-sm text-gray-400">
                    {index === 0 ? 'Host' : 'Player'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-center space-x-4">
            <button
              onClick={startGame}
              disabled={gameState.players.length < 2}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Start Game
            </button>
            <button onClick={leaveRoom} className="btn-secondary">
              Leave Room
            </button>
          </div>

          {gameState.players.length < 2 && (
            <p className="text-center text-gray-400 mt-4">
              Waiting for more players to join...
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-game-primary mb-4">
          🎮 Multiplayer
        </h1>
        <p className="text-gray-300">Join or create a room to play with friends</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-2xl font-bold mb-4">Join Room</h3>
          <form onSubmit={handleJoinRoom} className="space-y-4">
            <div>
              <label htmlFor="roomId" className="block text-sm font-medium mb-2">
                Room Code
              </label>
              <input
                type="text"
                id="roomId"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                className="input-field w-full"
                placeholder="Enter room code"
                required
              />
            </div>
            <button type="submit" className="btn-primary w-full">
              Join Room
            </button>
          </form>
        </div>

        <div className="card">
          <h3 className="text-2xl font-bold mb-4">Quick Play</h3>
          <p className="text-gray-300 mb-4">
            Create a new room and start playing immediately
          </p>
          <button onClick={handleQuickJoin} className="btn-primary w-full">
            Create Room
          </button>
        </div>
      </div>

      <div className="card mt-6">
        <h3 className="text-xl font-bold mb-4">How to Play Multiplayer</h3>
        <ul className="space-y-2 text-gray-300">
          <li>• Up to 4 players can join a room</li>
          <li>• Use arrow keys to control your snake</li>
          <li>• Avoid other players and walls</li>
          <li>• Collect food to grow and increase your score</li>
          <li>• Last snake standing wins!</li>
        </ul>
      </div>
    </div>
  );
};

export default MultiplayerLobby;