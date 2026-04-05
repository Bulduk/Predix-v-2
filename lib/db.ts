import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'database.sqlite');
const db = new Database(dbPath);

// Initialize Database Schema
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT NOT NULL,
    trust_score REAL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS wallets (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    type TEXT NOT NULL CHECK(type IN ('system', 'external')),
    address TEXT,
    balance REAL DEFAULT 0,
    is_active BOOLEAN DEFAULT 0,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS markets (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    end_time DATETIME NOT NULL,
    status TEXT NOT NULL CHECK(status IN ('open', 'closed')),
    outcome TEXT CHECK(outcome IN ('YES', 'NO', NULL))
  );

  CREATE TABLE IF NOT EXISTS trades (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    market_id TEXT NOT NULL,
    position TEXT NOT NULL CHECK(position IN ('YES', 'NO')),
    amount REAL NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id),
    FOREIGN KEY(market_id) REFERENCES markets(id)
  );

  CREATE TABLE IF NOT EXISTS positions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    market_id TEXT NOT NULL,
    position TEXT NOT NULL CHECK(position IN ('YES', 'NO')),
    amount REAL NOT NULL DEFAULT 0,
    pnl REAL DEFAULT 0,
    status TEXT NOT NULL CHECK(status IN ('open', 'closed')),
    FOREIGN KEY(user_id) REFERENCES users(id),
    FOREIGN KEY(market_id) REFERENCES markets(id)
  );

  CREATE TABLE IF NOT EXISTS followers (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    follower_id TEXT NOT NULL,
    FOREIGN KEY(user_id) REFERENCES users(id),
    FOREIGN KEY(follower_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS ai_scores (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    prediction_accuracy REAL DEFAULT 0,
    risk_score REAL DEFAULT 0,
    consistency_score REAL DEFAULT 0,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  INSERT OR IGNORE INTO users (id, username) VALUES ('user1', 'TestUser');
  INSERT OR IGNORE INTO wallets (id, user_id, type, address, balance, is_active) VALUES ('wallet1', 'user1', 'system', 'sys_test', 10000, 1);
  INSERT OR IGNORE INTO markets (id, title, category, end_time, status) VALUES ('1', 'Bitcoin will break $100k before EOY', 'Crypto', '2026-12-31 23:59:59', 'open');
  INSERT OR IGNORE INTO markets (id, title, category, end_time, status) VALUES ('2', 'SpaceX Starship reaches orbit today?', 'Tech', '2026-12-31 23:59:59', 'open');
  INSERT OR IGNORE INTO markets (id, title, category, end_time, status) VALUES ('3', 'Fed cuts rates by 50bps in next meeting', 'Macro', '2026-12-31 23:59:59', 'open');
  INSERT OR IGNORE INTO markets (id, title, category, end_time, status) VALUES ('4', 'Lakers to win the NBA Championship 2026?', 'Sports', '2026-12-31 23:59:59', 'open');
  INSERT OR IGNORE INTO markets (id, title, category, end_time, status) VALUES ('5', 'Taylor Swift announces new album this year?', 'Music', '2026-12-31 23:59:59', 'open');
`);

export default db;
