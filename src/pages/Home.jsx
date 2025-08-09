import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Home = () => {
  const { user } = useAuth();

  return (
    <div className="text-center">
      <div className="mb-12">
        <h1 className="text-6xl font-bold text-game-primary mb-4">
          🐍 Snake Attack
        </h1>
        <p className="text-xl text-gray-300 mb-8">
          The ultimate multiplayer snake game experience
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-12">
        <div className="card">
          <h3 className="text-2xl font-bold mb-4">Single Player</h3>
          <p className="text-gray-300 mb-6">
            Practice your skills in classic snake gameplay with modern graphics and smooth controls.
          </p>
          {user ? (
            <Link to="/game" className="btn-primary">
              Play Now
            </Link>
          ) : (
            <Link to="/login" className="btn-primary">
              Login to Play
            </Link>
          )}
        </div>

        <div className="card">
          <h3 className="text-2xl font-bold mb-4">Multiplayer</h3>
          <p className="text-gray-300 mb-6">
            Compete against other players in real-time multiplayer battles. Up to 4 players per room!
          </p>
          {user ? (
            <Link to="/multiplayer" className="btn-primary">
              Join Battle
            </Link>
          ) : (
            <Link to="/login" className="btn-primary">
              Login to Play
            </Link>
          )}
        </div>
      </div>

      <div className="mb-12">
        <h2 className="text-3xl font-bold mb-6">Features</h2>
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <div className="card">
            <div className="text-4xl mb-4">🎮</div>
            <h4 className="text-xl font-bold mb-2">Modern Controls</h4>
            <p className="text-gray-300">
              Smooth, responsive controls optimized for both desktop and mobile
            </p>
          </div>
          
          <div className="card">
            <div className="text-4xl mb-4">🏆</div>
            <h4 className="text-xl font-bold mb-2">Leaderboards</h4>
            <p className="text-gray-300">
              Compete for the top spot and track your progress over time
            </p>
          </div>
          
          <div className="card">
            <div className="text-4xl mb-4">👥</div>
            <h4 className="text-xl font-bold mb-2">Real-time Multiplayer</h4>
            <p className="text-gray-300">
              Battle friends and players worldwide in real-time matches
            </p>
          </div>
        </div>
      </div>

      <div className="text-center">
        <Link to="/leaderboard" className="btn-secondary mr-4">
          View Leaderboard
        </Link>
        {!user && (
          <Link to="/register" className="btn-primary">
            Get Started
          </Link>
        )}
      </div>
    </div>
  );
};

export default Home;