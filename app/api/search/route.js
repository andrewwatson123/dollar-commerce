import { NextResponse } from 'next/server';
import { sanityClient } from '@/sanity/lib/client';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get('q') || '').trim();
  if (!q || q.length < 2) {
    return NextResponse.json({ articles: [], fundraising: [], platformUpdates: [] });
  }

  const escaped = q.replace(/"/g, '\\"');
  const matcher = `"*${escaped}*"`;

  // Also build a loose word list for multi-word queries. Split on whitespace.
  const words = escaped.split(/\s+/).filter((w) => w.length >= 2);
  const wordMatchers = words.map((w) => `"*${w}*"`);

  try {
    const [articles, fundraising, platformUpdates] = await Promise.all([
      sanityClient.fetch(
        `*[_type=="article" && (
            title match ${matcher}
            || subtitle match ${matcher}
            || excerpt match ${matcher}
            || pt::text(body) match ${matcher}
            || author->name match ${matcher}
            || category->title match ${matcher}
            || count(tags[]->title[@ match ${matcher}]) > 0
            ${words.length > 1 ? `|| (${wordMatchers.map((m) => `title match ${m}`).join(' && ')})` : ''}
          )]
          | order(
              select(title match ${matcher} => 0, 1),
              publishedAt desc
            )[0...10]{
            _id, title, "slug": slug.current, publishedAt,
            "category": category->title,
            "author": author->name,
            excerpt
          }`
      ),
      sanityClient.fetch(
        `*[_type=="fundraisingEvent" && (company match ${matcher} || sector match ${matcher} || description match ${matcher})]
          | order(announcedAt desc)[0...6]{
            _id, company, amountText, amountUsd, round, sector, sourceUrl, announcedAt
          }`
      ),
      sanityClient.fetch(
        `*[_type=="platformUpdate" && (title match ${matcher} || summary match ${matcher} || platform match ${matcher})]
          | order(reportedAt desc)[0...6]{
            _id, title, platform, category, sourceUrl, reportedAt
          }`
      ),
    ]);

    return NextResponse.json({ articles, fundraising, platformUpdates });
  } catch (e) {
    return NextResponse.json({ error: 'search failed', articles: [], fundraising: [], platformUpdates: [] }, { status: 500 });
  }
}
