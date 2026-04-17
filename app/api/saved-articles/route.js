import { auth } from '@/lib/auth';
import { sanityClient } from '@/sanity/lib/client';
import { sanityWriteClient } from '@/sanity/lib/client';
import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const user = await sanityClient.fetch(
    `*[_type=="user" && _id==$userId][0]{
      "savedArticles": savedArticles[]->{
        _id, title, "slug": slug.current, publishedAt,
        "category": category->title,
        "author": author->name
      }
    }`,
    { userId: session.user.id }
  );

  return NextResponse.json({ savedArticles: user?.savedArticles || [] });
}

export async function POST(request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { articleId } = await request.json();
  if (!articleId) return NextResponse.json({ error: 'articleId required' }, { status: 400 });

  const client = sanityWriteClient();
  await client
    .patch(session.user.id)
    .setIfMissing({ savedArticles: [] })
    .append('savedArticles', [{ _type: 'reference', _ref: articleId, _key: crypto.randomUUID().slice(0, 12) }])
    .commit();

  return NextResponse.json({ ok: true });
}

export async function DELETE(request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { articleId } = await request.json();
  if (!articleId) return NextResponse.json({ error: 'articleId required' }, { status: 400 });

  const client = sanityWriteClient();
  await client
    .patch(session.user.id)
    .unset([`savedArticles[_ref=="${articleId}"]`])
    .commit();

  return NextResponse.json({ ok: true });
}
