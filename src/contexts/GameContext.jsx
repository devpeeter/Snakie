import React, { createContext, useContext, useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const GameContext = createContext();

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};

export const GameProvider = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [gameState, setGameState] = useState({
    state: 'menu', // menu, lobby, playing, finished
    room: null,
    players: [],
    gameData: null
  });

  useEffect(() => {
    if (user) {
      const newSocket = io('/', {
        auth: {
          userId: user.id,
          username: user.username
        }
      });

      newSocket.on('connect', () => {
        console.log('Connected to game server');
      });

      newSocket.on('room-joined', (data) => {
        setGameState(prev => ({
          ...prev,
          state: 'lobby',
          room: data.roomId,
          players: data.players,
          gameData: data.gameState
        }));
      });

      newSocket.on('player-joined', (player) => {
        setGameState(prev => ({
          ...prev,
          players: [...prev.players, player]
        }));
      });

      newSocket.on('player-left', ({ playerId }) => {
        setGameState(prev => ({
          ...prev,
          players: prev.players.filter(p => p.id !== playerId)
        }));
      });

      newSocket.on('game-started', (data) => {
        setGameState(prev => ({
          ...prev,
          state: 'playing',
          gameData: data.gameData
        }));
      });

      newSocket.on('game-update', (data) => {
        setGameState(prev => ({
          ...prev,
          gameData: data.gameData,
          players: data.players
        }));
      });

      newSocket.on('game-ended', (data) => {
        setGameState(prev => ({
          ...prev,
          state: 'finished',
          gameData: data
        }));
      });

      newSocket.on('room-reset', (data) => {
        setGameState(prev => ({
          ...prev,
          state: 'lobby',
          gameData: data.gameData
        }));
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
      };
    }
  }, [user]);

  const joinRoom = (roomId) => {
    if (socket && user) {
      socket.emit('join-room', {
        roomId,
        playerName: user.username
      });
    }
  };

  const leaveRoom = () => {
    if (socket) {
      socket.emit('leave-room');
      setGameState(prev => ({
        ...prev,
        state: 'menu',
        room: null,
        players: [],
        gameData: null
      }));
    }
  };

  const startGame = () => {
    if (socket) {
      socket.emit('start-game');
    }
  };

  const sendGameInput = (inputData) => {
    if (socket) {
      socket.emit('game-input', inputData);
    }
  };

  const value = {
    socket,
    gameState,
    joinRoom,
    leaveRoom,
    startGame,
    sendGameInput
  };

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
};