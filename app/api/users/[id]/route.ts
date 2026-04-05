import { NextResponse } from 'next/server';
import db from '@/server/db';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const wallet = db.prepare('SELECT * FROM wallets WHERE user_id = ?').get(id);
    const reputationLogs = db.prepare('SELECT * FROM reputation_logs WHERE user_id = ? ORDER BY created_at DESC').all(id);

    return NextResponse.json({ success: true, user, wallet, reputationLogs });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
