import { NextResponse } from 'next/server';
import { createSystemWallet, addExternalWallet } from '@/lib/services';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, type, address } = body;

    if (!userId || !type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    let result;
    if (type === 'system') {
      result = createSystemWallet(userId);
    } else if (type === 'external') {
      if (!address) return NextResponse.json({ error: 'Missing address for external wallet' }, { status: 400 });
      result = addExternalWallet(userId, address);
    } else {
      return NextResponse.json({ error: 'Invalid wallet type' }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
