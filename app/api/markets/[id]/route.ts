import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const market = db.prepare('SELECT * FROM markets WHERE id = ?').get(id);
    
    if (!market) {
      return NextResponse.json({ error: 'Market not found' }, { status: 404 });
    }
    
    return NextResponse.json(market);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
