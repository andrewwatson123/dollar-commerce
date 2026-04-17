import { auth } from '@/lib/auth';
import { sanityWriteClient } from '@/sanity/lib/client';
import { NextResponse } from 'next/server';

export async function PUT(request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { notificationPrefs } = await request.json();
  if (!notificationPrefs) return NextResponse.json({ error: 'notificationPrefs required' }, { status: 400 });

  const client = sanityWriteClient();
  await client
    .patch(session.user.id)
    .set({ notificationPrefs })
    .commit();

  return NextResponse.json({ ok: true });
}
