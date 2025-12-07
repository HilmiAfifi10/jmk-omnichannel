import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import { auth } from '@/lib/auth';
import { storeRepository, tiktokRepository } from '@/repositories';
import { exchangeToken } from '@/services/tiktok.service';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');

  if (!code || !state) {
    return NextResponse.json({ message: 'Missing code/state' }, { status: 400 });
  }

  const cookieStore = await cookies();
  const savedState = cookieStore.get('tiktok_oauth_state')?.value;
  if (!savedState || savedState !== state) {
    return NextResponse.json({ message: 'Invalid state' }, { status: 400 });
  }

  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const [storeId] = state.split(':');
  const store = await storeRepository.findById(storeId);
  if (!store || store.userId !== session.user.id) {
    return NextResponse.json({ message: 'Store not found' }, { status: 404 });
  }

  try {
    const token = await exchangeToken(code);

    await tiktokRepository.upsertByStoreId(store.id, {
      shopId: token.shopId,
      accessToken: token.accessToken,
      refreshToken: token.refreshToken,
      accessTokenExpiry: token.accessTokenExpiry,
      scopes: token.scopes,
    });

    cookieStore.delete('tiktok_oauth_state');

    return NextResponse.redirect('/dashboard/settings?connected=tiktok');
  } catch (error) {
    console.error('TikTok callback error', error);
    return NextResponse.redirect('/dashboard/settings?connected=tiktok&error=1');
  }
}
