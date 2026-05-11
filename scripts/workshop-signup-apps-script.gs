/**
 * Workshop signup → Google Sheet + Calendar invite bridge.
 *
 * On form submit this script will:
 *   1. Append a row to the workshop tab on the configured Sheet.
 *   2. Silently add the applicant as an attendee on the Calendar event
 *      (no notifications fired to existing attendees).
 *   3. Send the applicant a personalised confirmation email with the
 *      Google Meet link.
 *
 * ────────────────────────────────────────────────────────────────────
 * ONE-TIME SETUP
 * ────────────────────────────────────────────────────────────────────
 *
 *  1. Create the Calendar event
 *     - Open Google Calendar with the same account that owns this script.
 *     - Create the event: "Workshop with Jesse Horwitz · DTC Founders",
 *       Mon May 18, 12:00 PM ET, 1h.
 *     - Click "Add Google Meet video conferencing" → save.
 *     - Invite Jesse, Alex, Ben so they're already on it.
 *
 *  2. Enable the Advanced Calendar Service inside Apps Script
 *     - In the Apps Script editor → left sidebar → "Services" → "+".
 *     - Find "Google Calendar API", click Add. Identifier stays `Calendar`.
 *
 *  3. Find the event ID
 *     - In this script, run the function `logEventIdsForWorkshopDate`
 *       (top toolbar → select function → Run; authorise when prompted).
 *     - Open View → Logs. You'll see something like:
 *         May 18 12:00 — Workshop with Jesse Horwitz  →  abc123def456@google.com
 *     - Copy that ID and paste it as CALENDAR_EVENT_ID below.
 *
 *  4. Deploy → Manage deployments → pencil → New version → Deploy.
 *     (The Vercel env var WORKSHOP_SHEET_WEBHOOK_URL stays the same;
 *      Apps Script keeps the URL stable across new versions of the
 *      same deployment.)
 */

const SHEET_ID = '1TQUDREhad2pgfdIGyUy438eqKdkjvEXzskVB7foyWhI';
const DEFAULT_TAB = 'Jesse_W1';

// PASTE THE EVENT ID FROM STEP 3 OF SETUP HERE.
// Leave as '' to skip calendar invites (only writes to the sheet).
const CALENDAR_EVENT_ID = '';

// The calendar that owns the event. 'primary' is the script-owner's
// personal calendar. Change to a calendar ID (looks like an email) if
// the event lives on a shared calendar.
const CALENDAR_ID = 'primary';

// Sender display name on the confirmation email.
const FROM_NAME = 'Igloo Media × Dollar Commerce';

const HEADERS = [
  'Timestamp',
  'Workshop',
  'Full name',
  'Email',
  'Company',
  'Website',
  'LinkedIn',
  'Description',
  'Calendar status',
];

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents || '{}');
    const tabName = body.tab || DEFAULT_TAB;

    // 1. Write to the sheet.
    const sheet = getOrCreateSheet(tabName);
    const calendarStatus = addToCalendarEvent(body.email, body.fullName);
    sheet.appendRow([
      body.timestamp || new Date().toISOString(),
      body.workshopId || '',
      body.fullName || '',
      body.email || '',
      body.company || '',
      body.website || '',
      body.linkedin || '',
      body.description || '',
      calendarStatus,
    ]);

    // 2. Send confirmation email (only if calendar add succeeded — that
    //    proves the applicant is now on the event and gives us the Meet
    //    link to share).
    if (calendarStatus === 'added' || calendarStatus === 'already-on') {
      sendConfirmationEmail(body);
    }

    return jsonOut({ ok: true, calendar: calendarStatus });
  } catch (err) {
    return jsonOut({ ok: false, error: String(err) });
  }
}

function doGet() {
  return jsonOut({ ok: true, msg: 'Workshop signup endpoint. POST only.' });
}

/**
 * Add the applicant as an attendee on the workshop event.
 * Uses sendUpdates: 'none' so existing attendees aren't notified.
 *
 * Returns: 'added' | 'already-on' | 'no-event-id' | 'error: ...'
 */
function addToCalendarEvent(email, fullName) {
  if (!CALENDAR_EVENT_ID) return 'no-event-id';
  if (!email) return 'error: no email';

  try {
    const event = Calendar.Events.get(CALENDAR_ID, CALENDAR_EVENT_ID);
    const existing = (event.attendees || []).map(a => (a.email || '').toLowerCase());
    if (existing.indexOf(email.toLowerCase()) !== -1) return 'already-on';

    const newAttendees = (event.attendees || []).concat([
      {
        email: email,
        displayName: fullName || undefined,
        responseStatus: 'needsAction',
      },
    ]);

    Calendar.Events.patch(
      { attendees: newAttendees },
      CALENDAR_ID,
      CALENDAR_EVENT_ID,
      { sendUpdates: 'none' } // ← key: nobody on the event gets pinged
    );

    return 'added';
  } catch (err) {
    return 'error: ' + err;
  }
}

/**
 * Send the applicant a custom confirmation email with the Meet link.
 * Pulled separately from the Calendar invite so existing attendees
 * aren't disturbed.
 */
function sendConfirmationEmail(body) {
  if (!body.email) return;

  let meetLink = '';
  let eventStart = '';
  try {
    const event = Calendar.Events.get(CALENDAR_ID, CALENDAR_EVENT_ID);
    meetLink = event.hangoutLink || (event.conferenceData && event.conferenceData.entryPoints
      && event.conferenceData.entryPoints[0] && event.conferenceData.entryPoints[0].uri) || '';
    eventStart = event.start && (event.start.dateTime || event.start.date) || '';
  } catch (err) {
    // Email still goes out without the link if Calendar lookup fails.
  }

  const firstName = (body.fullName || '').split(' ')[0] || 'there';
  const subject = "You're in — Workshop with Jesse Horwitz, Mon May 18";

  const text = [
    "Hey " + firstName + ",",
    "",
    "Thanks for applying to the founder workshop with Jesse Horwitz.",
    "You're in. Here are the details:",
    "",
    "Date    Monday, May 18 · 12:00 PM ET",
    "Format  Google Meet · 1 hour",
    meetLink ? "Meet    " + meetLink : "",
    "",
    "You'll also see this on your Google Calendar — we've added you as a guest.",
    "",
    "Bring your toughest questions. We're keeping the room small so the Q&A actually works.",
    "",
    "See you Monday,",
    "Andrew, Alex & Ben",
    "Igloo Media × Dollar Commerce",
  ].filter(Boolean).join('\n');

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Inter', Helvetica, Arial, sans-serif; color:#0A0A0A; line-height:1.55; max-width:560px;">
      <p>Hey ${escapeHtml(firstName)},</p>
      <p>Thanks for applying to the founder workshop with <strong>Jesse Horwitz</strong>. You're in — here are the details:</p>
      <table cellpadding="0" cellspacing="0" style="border-collapse:collapse; margin:18px 0;">
        <tr><td style="padding:6px 18px 6px 0; color:#8A95A0; font-size:12px; letter-spacing:0.08em; text-transform:uppercase; font-weight:600;">Date</td><td style="padding:6px 0; font-size:15px;">Monday, May 18 · 12:00 PM ET</td></tr>
        <tr><td style="padding:6px 18px 6px 0; color:#8A95A0; font-size:12px; letter-spacing:0.08em; text-transform:uppercase; font-weight:600;">Format</td><td style="padding:6px 0; font-size:15px;">Google Meet · 1 hour</td></tr>
        ${meetLink ? `<tr><td style="padding:6px 18px 6px 0; color:#8A95A0; font-size:12px; letter-spacing:0.08em; text-transform:uppercase; font-weight:600;">Join</td><td style="padding:6px 0; font-size:15px;"><a href="${escapeHtml(meetLink)}" style="color:#1AA3F0; text-decoration:none; font-weight:600;">${escapeHtml(meetLink)}</a></td></tr>` : ''}
      </table>
      <p>You'll also see this on your Google Calendar — we've added you as a guest.</p>
      <p>Bring your toughest questions. We're keeping the room small so the Q&amp;A actually works.</p>
      <p style="margin-top:24px;">See you Monday,<br>
      Andrew, Alex &amp; Ben<br>
      <span style="color:#8A95A0; font-size:13px;">Igloo Media × Dollar Commerce</span></p>
    </div>
  `;

  MailApp.sendEmail({
    to: body.email,
    subject: subject,
    body: text,
    htmlBody: html,
    name: FROM_NAME,
  });
}

function getOrCreateSheet(tabName) {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  let sheet = ss.getSheetByName(tabName);
  if (!sheet) {
    sheet = ss.insertSheet(tabName);
    sheet.appendRow(HEADERS);
    sheet.setFrozenRows(1);
  } else if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function jsonOut(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Helper: list candidate event IDs around the workshop date.
 * Run this once from the Apps Script editor (top toolbar → pick this
 * function → Run). Then View → Logs to see the result.
 */
function logEventIdsForWorkshopDate() {
  const start = new Date('2026-05-18T00:00:00-04:00');
  const end = new Date('2026-05-19T00:00:00-04:00');
  const events = Calendar.Events.list(CALENDAR_ID, {
    timeMin: start.toISOString(),
    timeMax: end.toISOString(),
    singleEvents: true,
    orderBy: 'startTime',
  });
  if (!events.items || events.items.length === 0) {
    Logger.log('No events found on May 18, 2026 in calendar: ' + CALENDAR_ID);
    return;
  }
  events.items.forEach(ev => {
    const when = (ev.start && (ev.start.dateTime || ev.start.date)) || '';
    Logger.log(when + ' — ' + (ev.summary || '(no title)') + '  →  ' + ev.id);
  });
}

/**
 * Helper: end-to-end test from the Apps Script editor. Edit the email
 * to your own address, run, then check the sheet, your calendar, and
 * your inbox.
 */
function testSubmission() {
  const fake = {
    postData: {
      contents: JSON.stringify({
        tab: DEFAULT_TAB,
        workshopId: 'jesse-w1',
        timestamp: new Date().toISOString(),
        fullName: 'Test Founder',
        email: 'you@your-domain.com', // ← edit before running
        company: 'Test Co.',
        website: 'https://example.com',
        linkedin: 'https://linkedin.com/in/test',
        description: 'Testing the signup flow end-to-end.',
      }),
    },
  };
  const res = doPost(fake);
  Logger.log(res.getContent());
}
