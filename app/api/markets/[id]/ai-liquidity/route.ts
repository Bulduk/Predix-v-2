import { NextResponse } from 'next/server';
import { LiquidityService } from '@/server/services/LiquidityService';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { amount } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    }

    LiquidityService.injectAILiquidity(id, amount);

    return NextResponse.json({ success: true, message: 'AI liquidity injected successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
