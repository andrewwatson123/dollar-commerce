import { NextResponse } from 'next/server';
import { sanityWriteClient } from '@/sanity/lib/client';

// POST /api/like  { slug: 'article-slug' }
// Increments likeCount by 1.
export async function POST(req) {
  try {
    const { slug } = await req.json();
    if (!slug) return NextResponse.json({ ok: false }, { status: 400 });
    const client = sanityWriteClient();
    const doc = await client.fetch(
      `*[_type=="article" && slug.current==$slug][0]{_id, likeCount}`,
      { slug }
    );
    if (!doc?._id) return NextResponse.json({ ok: false }, { status: 404 });
    await client.patch(doc._id).setIfMissing({ likeCount: 0 }).inc({ likeCount: 1 }).commit();
    return NextResponse.json({ ok: true, likeCount: (doc.likeCount || 0) + 1 });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
