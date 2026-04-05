import { NextResponse } from 'next/server';
import { MarketService } from '@/server/services/MarketService';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { outcome, isBadMarket } = body;

    if (!outcome || (outcome !== 'YES' && outcome !== 'NO')) {
      return NextResponse.json({ error: 'Invalid or missing outcome' }, { status: 400 });
    }

    MarketService.resolveMarket(id, outcome, !!isBadMarket);

    return NextResponse.json({ success: true, message: 'Market resolved successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
