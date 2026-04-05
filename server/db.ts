import Database from 'better-sqlite3';
import path from 'path';

// Use an in-memory database for this demonstration, or a file-based one
const db = new Database(':memory:'); // In production, use a file path like path.join(process.cwd(), 'data.db')

db.pragma('journal_mode = WAL');

// Initialize Schema
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT NOT NULL,
    trust_score REAL DEFAULT 50,
    total_markets_created INTEGER DEFAULT 0,
    successful_markets INTEGER DEFAULT 0,
    failed_markets INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS wallets (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    balance REAL DEFAULT 0,
    locked_balance REAL DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS markets (
    id TEXT PRIMARY KEY,
    creator_id TEXT NOT NULL,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    end_time DATETIME NOT NULL,
    status TEXT DEFAULT 'open', -- open, closed, resolved
    creator_stake REAL NOT NULL,
    system_liquidity REAL NOT NULL,
    ai_liquidity REAL DEFAULT 0,
    user_liquidity REAL DEFAULT 0,
    total_liquidity REAL NOT NULL,
    outcome TEXT, -- YES, NO, null
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (creator_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS market_pools (
    id TEXT PRIMARY KEY,
    market_id TEXT NOT NULL UNIQUE,
    yes_pool REAL NOT NULL,
    no_pool REAL NOT NULL,
    fee_pool REAL DEFAULT 0,
    FOREIGN KEY (market_id) REFERENCES markets(id)
  );

  CREATE TABLE IF NOT EXISTS liquidity_providers (
    id TEXT PRIMARY KEY,
    market_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    shares REAL NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (market_id) REFERENCES markets(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS trades (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    market_id TEXT NOT NULL,
    position TEXT NOT NULL, -- YES, NO
    amount REAL NOT NULL,
    fee REAL NOT NULL,
    price REAL NOT NULL,
    slippage REAL NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (market_id) REFERENCES markets(id)
  );

  CREATE TABLE IF NOT EXISTS creator_stakes (
    id TEXT PRIMARY KEY,
    market_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    amount REAL NOT NULL,
    locked_until DATETIME,
    status TEXT DEFAULT 'locked', -- locked, released, slashed
    FOREIGN KEY (market_id) REFERENCES markets(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS reputation_logs (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    change REAL NOT NULL,
    reason TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );
`);

// Seed some initial data for testing
const insertUser = db.prepare('INSERT OR IGNORE INTO users (id, username, trust_score) VALUES (?, ?, ?)');
const insertWallet = db.prepare('INSERT OR IGNORE INTO wallets (id, user_id, balance) VALUES (?, ?, ?)');

insertUser.run('user_1', 'alice_creator', 45);
insertWallet.run('wallet_1', 'user_1', 1000);

insertUser.run('user_2', 'bob_trader', 80);
insertWallet.run('wallet_2', 'user_2', 5000);

export default db;
