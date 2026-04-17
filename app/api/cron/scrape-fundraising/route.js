import { NextResponse } from 'next/server';
import { spawn } from 'node:child_process';
import path from 'node:path';

/**
 * Vercel Cron endpoint that runs the fundraising scraper.
 *
 * Triggered by vercel.json → "crons": [{ "path": "/api/cron/scrape-fundraising",
 *                                        "schedule": "17 7 * * *" }]
 *
 * Vercel calls this daily at 07:17 UTC and authenticates the call by setting
 * the `authorization` header to `Bearer ${CRON_SECRET}`. Set CRON_SECRET in
 * Vercel's environment variables to a random string to prevent drive-by hits.
 *
 * Note: Vercel serverless functions have a 10-second timeout on the free tier
 * and 60s on Pro. The scraper currently takes ~20-60s depending on feeds, so
 * the Pro tier is required for this to complete reliably. Alternatively,
 * split this into a lightweight trigger that posts to a background worker
 * (e.g. Trigger.dev, Inngest) for execution.
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
    const scriptPath = path.join(process.cwd(), 'scripts', 'scrape-fundraising.mjs');
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
