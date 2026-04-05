import db from '../db';
import { User } from '../types';

export class TrustService {
  /**
   * Calculates the required creator stake based on their trust score.
   * IF trust_score < 30 → stake = $20–$50 (We'll use $50 for safety)
   * IF trust_score 30–70 → stake = $50–$200 (We'll use $100)
   * IF trust_score > 70 → stake = flexible / lower % (We'll use $20)
   */
  static calculateRequiredStake(trustScore: number): number {
    if (trustScore < 30) return 50;
    if (trustScore <= 70) return 100;
    return 20;
  }

  /**
   * Updates a user's trust score after a market resolves.
   * trust_score = + success_rate + volume_score + user_feedback - penalty_score
   */
  static updateTrustScore(
    userId: string, 
    success: boolean, 
    volumeScore: number = 0, 
    penaltyScore: number = 0
  ): void {
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId) as User;
    if (!user) throw new Error('User not found');

    let change = 0;
    let reason = '';

    if (success) {
      change = 5 + volumeScore; // Base success reward + volume bonus
      reason = 'Market resolved successfully';
      db.prepare('UPDATE users SET successful_markets = successful_markets + 1 WHERE id = ?').run(userId);
    } else {
      change = -penaltyScore;
      reason = 'Market failed or was slashed';
      db.prepare('UPDATE users SET failed_markets = failed_markets + 1 WHERE id = ?').run(userId);
    }

    let newScore = user.trust_score + change;
    
    // Clamp between 0-100
    if (newScore > 100) newScore = 100;
    if (newScore < 0) newScore = 0;

    const actualChange = newScore - user.trust_score;

    // Update user
    db.prepare('UPDATE users SET trust_score = ? WHERE id = ?').run(newScore, userId);

    // Log reputation change
    db.prepare(`
      INSERT INTO reputation_logs (id, user_id, change, reason)
      VALUES (?, ?, ?, ?)
    `).run(crypto.randomUUID(), userId, actualChange, reason);
  }
}
