import { NextResponse } from 'next/server';
import { execSync } from 'child_process';

/**
 * Vercel Cron endpoint — runs the newsletter scraper daily at 8am UTC.
 * Triggered by vercel.json cron config.
 */
export async function GET(request) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const output = execSync('node scripts/scrape-newsletters.mjs', {
      timeout: 55000,
      env: process.env,
      cwd: process.cwd(),
    }).toString();

    return NextResponse.json({
      ok: true,
      output: output.slice(-4000),
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    return NextResponse.json({
      ok: false,
      error: err.message,
      stdout: err.stdout?.toString().slice(-2000),
      stderr: err.stderr?.toString().slice(-1000),
    }, { status: 500 });
  }
}
