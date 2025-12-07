import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import { auth } from '@/lib/auth';
import { storeRepository } from '@/repositories/store.repository';
import { buildAuthUrl } from '@/services/tiktok.service';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  let store = await storeRepository.findByUserId(session.user.id);
  if (!store) {
    store = await storeRepository.create({
      name: `Toko ${session.user.name || 'Saya'}`,
      userId: session.user.id,
    });
  }

  const state = `${store.id}:${crypto.randomUUID()}`;
  const cookieStore = await cookies();
  cookieStore.set('tiktok_oauth_state', state, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 10 * 60,
  });

  const url = buildAuthUrl(state);
  return NextResponse.redirect(url);
}
