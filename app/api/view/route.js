import { NextResponse } from 'next/server';
import { sanityWriteClient } from '@/sanity/lib/client';

// POST /api/view  { slug: 'article-slug' }
// Increments viewCount by 1. Fire-and-forget from the article page.
export async function POST(req) {
  try {
    const { slug } = await req.json();
    if (!slug) return NextResponse.json({ ok: false, error: 'missing slug' }, { status: 400 });
    const client = sanityWriteClient();
    const doc = await client.fetch(
      `*[_type=="article" && slug.current==$slug][0]{_id}`,
      { slug }
    );
    if (!doc?._id) return NextResponse.json({ ok: false }, { status: 404 });
    await client.patch(doc._id).setIfMissing({ viewCount: 0 }).inc({ viewCount: 1 }).commit();
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
