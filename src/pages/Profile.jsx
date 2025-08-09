import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

const Profile = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentGames, setRecentGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUserStats();
  }, []);

  const fetchUserStats = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await axios.get('/api/game/stats');
      setStats(response.data.stats);
      setRecentGames(response.data.recentGames);
    } catch (error) {
      setError('Failed to load profile data');
      console.error('Profile error:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center">
        <p className="text-red-400 mb-4">{error}</p>
        <button onClick={fetchUserStats} className="btn-primary">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-game-primary mb-2">
          👤 {user?.username}
        </h1>
        <p className="text-gray-300">Player Profile</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="card text-center">
          <div className="text-3xl font-bold text-game-primary mb-2">
            {stats?.totalGames || 0}
          </div>
          <div className="text-gray-300">Total Games</div>
        </div>

        <div className="card text-center">
          <div className="text-3xl font-bold text-game-primary mb-2">
            {stats?.bestScore || 0}
          </div>
          <div className="text-gray-300">Best Score</div>
        </div>

        <div className="card text-center">
          <div className="text-3xl font-bold text-game-primary mb-2">
            {Math.round(stats?.averageScore || 0)}
          </div>
          <div className="text-gray-300">Average Score</div>
        </div>

        <div className="card text-center">
          <div className="text-3xl font-bold text-game-primary mb-2">
            {formatDuration(stats?.totalPlayTime || 0)}
          </div>
          <div className="text-gray-300">Play Time</div>
        </div>
      </div>

      <div className="card">
        <h2 className="text-2xl font-bold mb-4">Recent Games</h2>
        
        {recentGames.length === 0 ? (
          <p className="text-gray-400 text-center py-8">
            No games played yet. Start playing to see your history!
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-600">
                  <th className="text-left py-3 px-4">Mode</th>
                  <th className="text-left py-3 px-4">Score</th>
                  <th className="text-left py-3 px-4">Duration</th>
                  <th className="text-left py-3 px-4">Date</th>
                </tr>
              </thead>
              <tbody>
                {recentGames.map((game, index) => (
                  <tr key={index} className="border-b border-gray-700 hover:bg-gray-700 transition-colors">
                    <td className="py-3 px-4 capitalize">
                      {game.game_mode}
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-game-primary font-bold">
                        {game.score}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {formatDuration(game.duration_seconds)}
                    </td>
                    <td className="py-3 px-4 text-gray-400">
                      {formatDate(game.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="text-center mt-6">
        <button onClick={fetchUserStats} className="btn-secondary">
          Refresh Stats
        </button>
      </div>
    </div>
  );
};

export default Profile;