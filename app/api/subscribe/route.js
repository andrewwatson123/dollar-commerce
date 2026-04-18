import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * Subscribe a user to the Beehiiv newsletter.
 * POST /api/subscribe  { email: "..." }
 *
 * Docs: https://developers.beehiiv.com/api-reference/subscriptions/create
 * Uses BEEHIIV_API_KEY + BEEHIIV_PUBLICATION_ID env vars.
 */
export async function POST(request) {
  let body = {};
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
  }

  const email = (body.email || '').trim().toLowerCase();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
  }

  const apiKey = process.env.BEEHIIV_API_KEY;
  const pubId  = process.env.BEEHIIV_PUBLICATION_ID;

  if (!apiKey || !pubId) {
    console.error('Missing BEEHIIV_API_KEY or BEEHIIV_PUBLICATION_ID');
    return NextResponse.json({ error: 'Newsletter not configured.' }, { status: 500 });
  }

  try {
    const res = await fetch(
      `https://api.beehiiv.com/v2/publications/${pubId}/subscriptions`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          email,
          reactivate_existing: true,
          send_welcome_email: true,
          utm_source: 'dollarcommerce.co',
          utm_medium: 'homepage_subscribe',
        }),
      }
    );

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const msg = data?.errors?.[0]?.message || data?.message || 'Could not subscribe. Try again later.';
      return NextResponse.json({ error: msg }, { status: res.status });
    }

    return NextResponse.json({ ok: true, status: data?.data?.status || 'subscribed' });
  } catch (e) {
    console.error('Beehiiv subscribe error:', e);
    return NextResponse.json({ error: 'Subscription service unavailable.' }, { status: 500 });
  }
}
