import { NextResponse } from 'next/server';
import { closeMarket } from '@/lib/services';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { marketId, winningOutcome } = body;

    if (!marketId || !winningOutcome) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const result = closeMarket(marketId, winningOutcome);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
