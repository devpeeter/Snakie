import React, { useState, useEffect } from 'react';
import axios from 'axios';
import LoadingSpinner from '../components/LoadingSpinner';

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [gameMode, setGameMode] = useState('single');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchLeaderboard();
  }, [gameMode]);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await axios.get(`/api/leaderboard/${gameMode}`);
      setLeaderboard(response.data.leaderboard);
    } catch (error) {
      setError('Failed to load leaderboard');
      console.error('Leaderboard error:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return `#${rank}`;
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-game-primary mb-4">🏆 Leaderboard</h1>
        <p className="text-gray-300">See how you rank against other players</p>
      </div>

      <div className="flex justify-center mb-6">
        <div className="flex space-x-2 bg-gray-800 rounded-lg p-1">
          <button
            onClick={() => setGameMode('single')}
            className={`px-4 py-2 rounded-md transition-colors ${
              gameMode === 'single'
                ? 'bg-game-primary text-white'
                : 'text-gray-300 hover:text-white'
            }`}
          >
            Single Player
          </button>
          <button
            onClick={() => setGameMode('multiplayer')}
            className={`px-4 py-2 rounded-md transition-colors ${
              gameMode === 'multiplayer'
                ? 'bg-game-primary text-white'
                : 'text-gray-300 hover:text-white'
            }`}
          >
            Multiplayer
          </button>
        </div>
      </div>

      <div className="card">
        {loading ? (
          <div className="text-center py-8">
            <LoadingSpinner />
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-400 mb-4">{error}</p>
            <button onClick={fetchLeaderboard} className="btn-primary">
              Try Again
            </button>
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-400">No scores yet. Be the first to play!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-600">
                  <th className="text-left py-3 px-4">Rank</th>
                  <th className="text-left py-3 px-4">Player</th>
                  <th className="text-left py-3 px-4">Score</th>
                  <th className="text-left py-3 px-4">Date</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((entry) => (
                  <tr
                    key={`${entry.username}-${entry.score}-${entry.date}`}
                    className={`border-b border-gray-700 hover:bg-gray-700 transition-colors ${
                      entry.rank <= 3 ? 'bg-gray-750' : ''
                    }`}
                  >
                    <td className="py-3 px-4">
                      <span className="text-lg font-bold">
                        {getRankIcon(entry.rank)}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-medium">
                      {entry.username}
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-game-primary font-bold">
                        {entry.score.toLocaleString()}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-400">
                      {formatDate(entry.date)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="text-center mt-6">
        <button onClick={fetchLeaderboard} className="btn-secondary">
          Refresh
        </button>
      </div>
    </div>
  );
};

export default Leaderboard;