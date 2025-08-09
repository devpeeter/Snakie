import { query } from '../config/database.js';
import dotenv from 'dotenv';

dotenv.config();

const migrations = [
  `
  CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    total_games INTEGER DEFAULT 0,
    best_score INTEGER DEFAULT 0,
    games_won INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
  `,
  `
  CREATE TABLE IF NOT EXISTS game_sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    game_mode VARCHAR(20) NOT NULL DEFAULT 'single',
    score INTEGER NOT NULL DEFAULT 0,
    duration_seconds INTEGER NOT NULL DEFAULT 0,
    game_data JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
  `,
  `
  CREATE INDEX IF NOT EXISTS idx_game_sessions_user_id ON game_sessions(user_id);
  CREATE INDEX IF NOT EXISTS idx_game_sessions_score ON game_sessions(score DESC);
  CREATE INDEX IF NOT EXISTS idx_game_sessions_created_at ON game_sessions(created_at DESC);
  `,
  `
  CREATE TABLE IF NOT EXISTS multiplayer_rooms (
    id SERIAL PRIMARY KEY,
    room_code VARCHAR(10) UNIQUE NOT NULL,
    host_user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    max_players INTEGER DEFAULT 4,
    current_players INTEGER DEFAULT 0,
    game_state VARCHAR(20) DEFAULT 'waiting',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
  `
];

async function runMigrations() {
  try {
    console.log('Running database migrations...');
    
    for (let i = 0; i < migrations.length; i++) {
      console.log(`Running migration ${i + 1}/${migrations.length}`);
      await query(migrations[i]);
    }
    
    console.log('All migrations completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

runMigrations();