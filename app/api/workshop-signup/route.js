import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * Workshop signup intake.
 *
 * POST /api/workshop-signup
 * Body: { workshopId, fullName, email, company, website, linkedin, description }
 *
 * Forwards the submission to a Google Apps Script web app, which appends a
 * row to the corresponding tab on the configured Sheet. The Apps Script URL
 * lives in WORKSHOP_SHEET_WEBHOOK_URL.
 *
 * Sheet target (Jesse_W1):
 *   https://docs.google.com/spreadsheets/d/1TQUDREhad2pgfdIGyUy438eqKdkjvEXzskVB7foyWhI/edit?gid=874511322
 *
 * See scripts/workshop-signup-apps-script.gs for the Apps Script source.
 */
export async function POST(request) {
  let body = {};
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
  }

  const fullName = (body.fullName || '').trim();
  const email = (body.email || '').trim();
  const company = (body.company || '').trim();
  const website = (body.website || '').trim();
  const linkedin = (body.linkedin || '').trim();
  const description = (body.description || '').trim();
  const workshopId = (body.workshopId || 'jesse-w1').trim();

  if (!fullName) return NextResponse.json({ error: 'Full name is required.' }, { status: 400 });
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'A valid email is required.' }, { status: 400 });
  }
  if (!company) return NextResponse.json({ error: 'Company or brand is required.' }, { status: 400 });
  if (!website) return NextResponse.json({ error: 'Website is required.' }, { status: 400 });
  if (!description) return NextResponse.json({ error: 'A short description is required.' }, { status: 400 });

  const webhookUrl = process.env.WORKSHOP_SHEET_WEBHOOK_URL;
  if (!webhookUrl) {
    console.error('Missing WORKSHOP_SHEET_WEBHOOK_URL env var');
    return NextResponse.json(
      { error: 'Signup not configured. Please email us instead.' },
      { status: 500 }
    );
  }

  // Tab name matches the workshop. The Apps Script reads `tab` and falls back
  // to a default if missing.
  const tab = workshopId === 'jesse-w1' ? 'Jesse_W1' : workshopId;

  const payload = {
    tab,
    workshopId,
    timestamp: new Date().toISOString(),
    fullName,
    email,
    company,
    website,
    linkedin,
    description,
  };

  try {
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      // Apps Script web apps redirect once on POST; let fetch follow it.
      redirect: 'follow',
    });

    const text = await res.text();
    if (!res.ok) {
      console.error('Workshop signup webhook error', res.status, text);
      return NextResponse.json(
        { error: 'Could not save your application. Try again in a moment.' },
        { status: 502 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('Workshop signup network error:', e);
    return NextResponse.json({ error: 'Signup service unavailable.' }, { status: 500 });
  }
}
