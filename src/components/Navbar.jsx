import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-gray-800 shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <Link to="/" className="text-2xl font-bold text-game-primary">
            🐍 Snake Attack
          </Link>
          
          <div className="flex items-center space-x-6">
            <Link to="/" className="hover:text-game-primary transition-colors">
              Home
            </Link>
            <Link to="/leaderboard" className="hover:text-game-primary transition-colors">
              Leaderboard
            </Link>
            
            {user ? (
              <>
                <Link to="/game" className="hover:text-game-primary transition-colors">
                  Single Player
                </Link>
                <Link to="/multiplayer" className="hover:text-game-primary transition-colors">
                  Multiplayer
                </Link>
                <Link to="/profile" className="hover:text-game-primary transition-colors">
                  Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="btn-secondary"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn-secondary">
                  Login
                </Link>
                <Link to="/register" className="btn-primary">
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;