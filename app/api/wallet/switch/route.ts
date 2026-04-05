import { NextResponse } from 'next/server';
import { switchActiveWallet } from '@/lib/services';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, walletId } = body;

    if (!userId || !walletId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    switchActiveWallet(userId, walletId);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
