import { NextResponse } from 'next/server';
import { placeTrade } from '@/lib/services';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, marketId, position, amount } = body;

    if (!userId || !marketId || !position || !amount) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const result = placeTrade(userId, marketId, position, amount);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
