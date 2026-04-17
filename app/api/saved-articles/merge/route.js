import { auth } from '@/lib/auth';
import { sanityClient } from '@/sanity/lib/client';
import { sanityWriteClient } from '@/sanity/lib/client';
import { NextResponse } from 'next/server';
import crypto from 'crypto';

/**
 * POST /api/saved-articles/merge
 * Bulk-merges localStorage bookmarks into the user's Sanity savedArticles.
 * Body: { slugs: ['article-slug-1', 'article-slug-2', ...] }
 */
export async function POST(request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { slugs } = await request.json();
  if (!slugs?.length) return NextResponse.json({ merged: 0 });

  // Look up article _ids by slugs
  const articles = await sanityClient.fetch(
    `*[_type=="article" && slug.current in $slugs]{ _id, "slug": slug.current }`,
    { slugs }
  );

  if (!articles.length) return NextResponse.json({ merged: 0 });

  // Get current saved article refs to avoid duplicates
  const user = await sanityClient.fetch(
    `*[_type=="user" && _id==$userId][0]{ "savedRefs": savedArticles[]._ref }`,
    { userId: session.user.id }
  );
  const existingRefs = new Set(user?.savedRefs || []);

  const newRefs = articles
    .filter((a) => !existingRefs.has(a._id))
    .map((a) => ({ _type: 'reference', _ref: a._id, _key: crypto.randomUUID().slice(0, 12) }));

  if (newRefs.length === 0) return NextResponse.json({ merged: 0 });

  const client = sanityWriteClient();
  await client
    .patch(session.user.id)
    .setIfMissing({ savedArticles: [] })
    .append('savedArticles', newRefs)
    .commit();

  return NextResponse.json({ merged: newRefs.length });
}
