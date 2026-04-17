import { NextResponse } from 'next/server';

export const revalidate = 3600; // Cache 1 hour — IPO calendar doesn't change minute-by-minute

export async function GET() {
  const token = process.env.FINNHUB_API_KEY;
  if (!token) {
    return NextResponse.json({ error: 'FINNHUB_API_KEY not set' }, { status: 500 });
  }

  // Look 30 days back and 30 days forward to capture recent + upcoming
  const now = new Date();
  const from = new Date(now.getTime() - 30 * 86400000).toISOString().slice(0, 10);
  const to = new Date(now.getTime() + 30 * 86400000).toISOString().slice(0, 10);

  const res = await fetch(
    `https://finnhub.io/api/v1/calendar/ipo?from=${from}&to=${to}&token=${token}`,
    { next: { revalidate: 3600 } }
  );
  if (!res.ok) {
    return NextResponse.json({ error: 'Finnhub error' }, { status: 502 });
  }
  const data = await res.json();
  const ipos = (data.ipoCalendar || []).map((ipo) => ({
    date: ipo.date,
    name: ipo.name,
    symbol: ipo.symbol,
    exchange: ipo.exchange,
    price: ipo.price,
    status: ipo.status,
    shares: ipo.numberOfShares,
    valuationEst: ipo.totalSharesValue,
  }));

  // Split into upcoming (today or later) and recent (before today)
  const today = now.toISOString().slice(0, 10);
  const upcoming = ipos.filter((i) => i.date >= today).sort((a, b) => a.date.localeCompare(b.date));
  const recent = ipos.filter((i) => i.date < today).sort((a, b) => b.date.localeCompare(a.date));

  return NextResponse.json({
    fetchedAt: new Date().toISOString(),
    upcomingCount: upcoming.length,
    recentCount: recent.length,
    upcoming: upcoming.slice(0, 20),
    recent: recent.slice(0, 20),
  });
}
