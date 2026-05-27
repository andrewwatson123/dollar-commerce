import { NextResponse } from 'next/server';
import { spawn } from 'node:child_process';
import path from 'node:path';

/**
 * Vercel Cron endpoint that runs the platform news scraper.
 *
 * Triggered by vercel.json → "crons": [{ "path": "/api/cron/scrape-platform-news",
 *                                        "schedule": "30 7 * * *" }]
 *
 * Replaces the previous local launchd job (com.dollarcommerce.newsletter.plist)
 * which was disabled 2026-05-11 to stop duplicate DC Daily emails. The
 * platform scraper had been piggy-backing on that job, so when it was
 * disabled the tracker stopped updating.
 *
 * Authenticates via `Bearer ${CRON_SECRET}` header (set in Vercel env vars).
 */
export const maxDuration = 60;

export async function GET(req) {
  const auth = req.headers.get('authorization');
  if (
    process.env.CRON_SECRET &&
    auth !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  return new Promise((resolve) => {
    const scriptPath = path.join(process.cwd(), 'scripts', 'scrape-platform-news.mjs');
    const child = spawn('node', ['--env-file=.env.local', scriptPath], {
      cwd: process.cwd(),
      env: process.env,
    });

    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (d) => { stdout += d.toString(); });
    child.stderr.on('data', (d) => { stderr += d.toString(); });
    child.on('close', (code) => {
      resolve(
        NextResponse.json({
          ok: code === 0,
          exitCode: code,
          stdout: stdout.slice(-4000),
          stderr: stderr.slice(-1000),
          timestamp: new Date().toISOString(),
        })
      );
    });
  });
}
