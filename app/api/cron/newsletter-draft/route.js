import { NextResponse } from 'next/server';
import { execSync } from 'child_process';

/**
 * Vercel Cron — emails a newsletter draft at 6am daily.
 */
export async function GET(request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const output = execSync('node scripts/generate-newsletter.mjs', {
      timeout: 55000,
      env: process.env,
      cwd: process.cwd(),
    }).toString();

    return NextResponse.json({ ok: true, output: output.slice(-4000) });
  } catch (err) {
    return NextResponse.json({
      ok: false, error: err.message,
      stdout: err.stdout?.toString().slice(-2000),
    }, { status: 500 });
  }
}
