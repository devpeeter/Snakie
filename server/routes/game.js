import express from 'express';
import { body, validationResult } from 'express-validator';
import { GameSession } from '../models/GameSession.js';
import { User } from '../models/User.js';

const router = express.Router();

// Save game session
router.post('/session', [
  body('score').isInt({ min: 0 }),
  body('gameMode').isIn(['single', 'multiplayer']),
  body('duration').isInt({ min: 0 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { score, gameMode, duration, gameData } = req.body;
    const userId = req.user.userId;

    // Save game session
    const session = await GameSession.create({
      userId,
      gameMode,
      score,
      duration,
      gameData
    });

    // Update user stats
    await User.updateStats(userId, score);

    res.json({
      message: 'Game session saved',
      session: {
        id: session.id,
        score: session.score,
        gameMode: session.game_mode,
        createdAt: session.created_at
      }
    });
  } catch (error) {
    console.error('Save game session error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user stats
router.get('/stats', async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const stats = await GameSession.getUserStats(userId);
    const recentGames = await GameSession.getRecentGames(userId);

    res.json({
      stats: {
        totalGames: parseInt(stats.total_games) || 0,
        bestScore: parseInt(stats.best_score) || 0,
        averageScore: parseFloat(stats.average_score) || 0,
        totalPlayTime: parseInt(stats.total_play_time) || 0
      },
      recentGames
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;