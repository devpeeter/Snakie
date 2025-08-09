import { query } from '../config/database.js';

export class GameSession {
  static async create({ userId, gameMode, score, duration, gameData }) {
    const result = await query(
      `INSERT INTO game_sessions (user_id, game_mode, score, duration_seconds, game_data)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [userId, gameMode, score, duration, JSON.stringify(gameData)]
    );
    
    return result.rows[0];
  }

  static async getLeaderboard(gameMode = 'single', limit = 10) {
    const result = await query(
      `SELECT gs.score, gs.created_at, u.username
       FROM game_sessions gs
       JOIN users u ON gs.user_id = u.id
       WHERE gs.game_mode = $1
       ORDER BY gs.score DESC
       LIMIT $2`,
      [gameMode, limit]
    );
    
    return result.rows;
  }

  static async getUserStats(userId) {
    const result = await query(
      `SELECT 
         COUNT(*) as total_games,
         MAX(score) as best_score,
         AVG(score) as average_score,
         SUM(duration_seconds) as total_play_time
       FROM game_sessions
       WHERE user_id = $1`,
      [userId]
    );
    
    return result.rows[0];
  }

  static async getRecentGames(userId, limit = 5) {
    const result = await query(
      `SELECT score, game_mode, duration_seconds, created_at
       FROM game_sessions
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT $2`,
      [userId, limit]
    );
    
    return result.rows;
  }
}