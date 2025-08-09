import express from 'express';
import { GameSession } from '../models/GameSession.js';

const router = express.Router();

// Get leaderboard
router.get('/:gameMode?', async (req, res) => {
  try {
    const gameMode = req.params.gameMode || 'single';
    const limit = parseInt(req.query.limit) || 10;

    const leaderboard = await GameSession.getLeaderboard(gameMode, limit);

    res.json({
      gameMode,
      leaderboard: leaderboard.map((entry, index) => ({
        rank: index + 1,
        username: entry.username,
        score: entry.score,
        date: entry.created_at
      }))
    });
  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;