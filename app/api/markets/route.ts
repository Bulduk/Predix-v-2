import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
  try {
    const markets = db.prepare('SELECT * FROM markets').all();
    return NextResponse.json(markets);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id, title, category, end_time, status } = body;
    
    if (!id || !title || !category || !end_time || !status) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    db.prepare(`
      INSERT INTO markets (id, title, category, end_time, status)
      VALUES (?, ?, ?, ?, ?)
    `).run(id, title, category, end_time, status);

    return NextResponse.json({ success: true, id });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
