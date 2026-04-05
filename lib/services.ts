import db from './db';
import crypto from 'crypto';

// --- WALLET SYSTEM ---

export function createSystemWallet(userId: string) {
  const walletId = crypto.randomUUID();
  const address = `sys_${crypto.randomBytes(16).toString('hex')}`;
  
  const stmt = db.prepare(`
    INSERT INTO wallets (id, user_id, type, address, balance, is_active)
    VALUES (?, ?, 'system', ?, 1000, 1) -- Give 1000 initial balance for testing
  `);
  stmt.run(walletId, userId, address);
  return { id: walletId, address, balance: 1000 };
}

export function addExternalWallet(userId: string, address: string) {
  const walletId = crypto.randomUUID();
  const stmt = db.prepare(`
    INSERT INTO wallets (id, user_id, type, address, balance, is_active)
    VALUES (?, ?, 'external', ?, 0, 0)
  `);
  stmt.run(walletId, userId, address);
  return { id: walletId, address };
}

export function switchActiveWallet(userId: string, walletId: string) {
  const transaction = db.transaction(() => {
    db.prepare('UPDATE wallets SET is_active = 0 WHERE user_id = ?').run(userId);
    const result = db.prepare('UPDATE wallets SET is_active = 1 WHERE id = ? AND user_id = ?').run(walletId, userId);
    if (result.changes === 0) throw new Error('Wallet not found');
  });
  transaction();
}

export function getActiveWallet(userId: string) {
  return db.prepare('SELECT * FROM wallets WHERE user_id = ? AND is_active = 1').get(userId) as any;
}

// --- PREDICTION MARKET SYSTEM ---

export function placeTrade(userId: string, marketId: string, position: 'YES' | 'NO', amount: number) {
  const transaction = db.transaction(() => {
    // 1. Validate market
    const market = db.prepare('SELECT * FROM markets WHERE id = ? AND status = "open"').get(marketId) as any;
    if (!market) throw new Error('Market not found or closed');

    // 2. Validate balance
    const wallet = getActiveWallet(userId);
    if (!wallet) throw new Error('No active wallet found');
    if (wallet.balance < amount) throw new Error('Insufficient balance');

    // 3. Deduct amount
    db.prepare('UPDATE wallets SET balance = balance - ? WHERE id = ?').run(amount, wallet.id);

    // 4. Create trade
    const tradeId = crypto.randomUUID();
    db.prepare(`
      INSERT INTO trades (id, user_id, market_id, position, amount)
      VALUES (?, ?, ?, ?, ?)
    `).run(tradeId, userId, marketId, position, amount);

    // 5. Create or update position
    const existingPosition = db.prepare(`
      SELECT * FROM positions WHERE user_id = ? AND market_id = ? AND position = ? AND status = 'open'
    `).get(userId, marketId, position) as any;

    if (existingPosition) {
      db.prepare('UPDATE positions SET amount = amount + ? WHERE id = ?').run(amount, existingPosition.id);
    } else {
      const positionId = crypto.randomUUID();
      db.prepare(`
        INSERT INTO positions (id, user_id, market_id, position, amount, status)
        VALUES (?, ?, ?, ?, ?, 'open')
      `).run(positionId, userId, marketId, position, amount);
    }
  });
  
  transaction();
  return { success: true };
}

export function closeMarket(marketId: string, winningOutcome: 'YES' | 'NO') {
  const transaction = db.transaction(() => {
    // 1. Update market status
    const result = db.prepare('UPDATE markets SET status = "closed", outcome = ? WHERE id = ? AND status = "open"').run(winningOutcome, marketId);
    if (result.changes === 0) throw new Error('Market not found or already closed');

    // 2. Evaluate positions and update PnL
    const positions = db.prepare('SELECT * FROM positions WHERE market_id = ? AND status = "open"').all(marketId) as any[];
    
    for (const pos of positions) {
      // Simple PnL calculation: If win, get 2x amount (100% profit). If lose, lose amount (-100% profit).
      const isWin = pos.position === winningOutcome;
      const pnl = isWin ? pos.amount : -pos.amount;
      
      // Update position
      db.prepare('UPDATE positions SET pnl = ?, status = "closed" WHERE id = ?').run(pnl, pos.id);

      // Update user balance if they won (return original amount + profit)
      if (isWin) {
        const payout = pos.amount * 2;
        db.prepare(`
          UPDATE wallets SET balance = balance + ? 
          WHERE user_id = ? AND is_active = 1
        `).run(payout, pos.user_id);
      }
      
      // Update trust score for the user
      updateTrustScore(pos.user_id);
    }
  });

  transaction();
  return { success: true };
}

// --- AI TRUST SCORING ---

export function updateTrustScore(userId: string) {
  // Calculate metrics
  const positions = db.prepare('SELECT * FROM positions WHERE user_id = ? AND status = "closed"').all(userId) as any[];
  
  if (positions.length === 0) return;

  const wins = positions.filter(p => p.pnl > 0).length;
  const winrate = wins / positions.length; // 0 to 1
  
  const totalInvested = positions.reduce((sum, p) => sum + p.amount, 0);
  const totalPnl = positions.reduce((sum, p) => sum + p.pnl, 0);
  const roi = totalInvested > 0 ? (totalPnl / totalInvested) : 0; // e.g., 0.5 for 50%
  
  // Follower count
  const followersCount = (db.prepare('SELECT COUNT(*) as count FROM followers WHERE user_id = ?').get(userId) as any).count;
  const normalizedFollowers = Math.min(followersCount / 1000, 1); // Normalize to max 1

  // AI Scores
  let aiScore = db.prepare('SELECT * FROM ai_scores WHERE user_id = ?').get(userId) as any;
  if (!aiScore) {
    const id = crypto.randomUUID();
    db.prepare('INSERT INTO ai_scores (id, user_id) VALUES (?, ?)').run(id, userId);
    aiScore = { prediction_accuracy: 0.5, risk_score: 0.5, consistency_score: 0.5 };
  }

  // Calculate Trust Score
  // trust_score = 0.3 * winrate + 0.25 * ROI + 0.15 * consistency + 0.1 * risk + 0.1 * followers + 0.1 * AI accuracy
  // Normalize ROI to 0-1 for scoring (assuming max expected ROI is 2.0)
  const normalizedRoi = Math.max(0, Math.min((roi + 1) / 3, 1)); 

  const trustScore = 
    (0.3 * winrate) + 
    (0.25 * normalizedRoi) + 
    (0.15 * aiScore.consistency_score) + 
    (0.1 * (1 - aiScore.risk_score)) + // lower risk is better
    (0.1 * normalizedFollowers) + 
    (0.1 * aiScore.prediction_accuracy);

  // Scale to 0-100
  const finalScore = Math.round(trustScore * 100);

  db.prepare('UPDATE users SET trust_score = ? WHERE id = ?').run(finalScore, userId);
}

// --- PORTFOLIO TRACKING ---

export function getPortfolio(userId: string) {
  const wallet = getActiveWallet(userId);
  const balance = wallet ? wallet.balance : 0;

  const activePositions = db.prepare('SELECT * FROM positions WHERE user_id = ? AND status = "open"').all(userId) as any[];
  const closedPositions = db.prepare('SELECT * FROM positions WHERE user_id = ? AND status = "closed"').all(userId) as any[];

  const totalInvested = closedPositions.reduce((sum, p) => sum + p.amount, 0);
  const totalPnl = closedPositions.reduce((sum, p) => sum + p.pnl, 0);
  const totalROI = totalInvested > 0 ? (totalPnl / totalInvested) * 100 : 0;

  const history = db.prepare(`
    SELECT t.*, m.title as market_title 
    FROM trades t 
    JOIN markets m ON t.market_id = m.id 
    WHERE t.user_id = ? 
    ORDER BY t.created_at DESC LIMIT 50
  `).all(userId);

  return {
    totalBalance: balance,
    activePositions,
    totalROI,
    history
  };
}

// --- AI SYSTEM ---

export function generateAIProfile(userId: string) {
  const positions = db.prepare('SELECT * FROM positions WHERE user_id = ? AND status = "closed"').all(userId) as any[];
  
  if (positions.length < 3) {
    return {
      confidenceScore: 50,
      traderProfile: { riskLevel: 'Unknown', style: 'New Trader' }
    };
  }

  const wins = positions.filter(p => p.pnl > 0).length;
  const winrate = wins / positions.length;

  const avgBetSize = positions.reduce((sum, p) => sum + p.amount, 0) / positions.length;
  const wallet = getActiveWallet(userId);
  const riskRatio = wallet && wallet.balance > 0 ? avgBetSize / (wallet.balance + avgBetSize) : 0;

  let riskLevel = 'Medium';
  if (riskRatio > 0.2) riskLevel = 'High';
  if (riskRatio < 0.05) riskLevel = 'Low';

  let style = 'Balanced';
  if (winrate > 0.6 && riskLevel === 'High') style = 'Aggressive Alpha';
  if (winrate > 0.6 && riskLevel === 'Low') style = 'Sniper';
  if (winrate < 0.4) style = 'Learning';

  const confidenceScore = Math.round(winrate * 100);

  // Update AI Scores in DB
  db.prepare(`
    UPDATE ai_scores 
    SET prediction_accuracy = ?, risk_score = ? 
    WHERE user_id = ?
  `).run(winrate, riskRatio, userId);

  return {
    confidenceScore,
    traderProfile: { riskLevel, style }
  };
}
