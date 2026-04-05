import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
  try {
    const users = db.prepare('SELECT id, username, trust_score, created_at FROM users').all();
    return NextResponse.json(users);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id, username } = body;
    
    if (!id || !username) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    db.prepare(`
      INSERT INTO users (id, username)
      VALUES (?, ?)
    `).run(id, username);

    return NextResponse.json({ success: true, id });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
