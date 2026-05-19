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
const DEFAULT_TAB = 'Rafa_W1';

// The calendar that owns the workshop events. 'primary' is the
// script-owner's personal calendar. Change to a calendar ID (looks
// like an email) if the events live on a shared calendar.
const CALENDAR_ID = 'primary';

// Sender display name on the confirmation email.
const FROM_NAME = 'Igloo Media × Dollar Commerce';

// One entry per workshop. The `workshopId` field on each form
// submission is matched against the keys here.
//
// To add a new workshop:
//   1. Create the Calendar event in Google Calendar.
//   2. Run logEventIdsForDate (top of editor → set the date param) and
//      copy the event ID from the logs.
//   3. Add a row to this map with the event ID, friendly title, and
//      the date/format strings used inside the confirmation email.
const WORKSHOPS = {
  'rafa-w1': {
    title: 'Rafa Guida <> AI Creative Workshop',
    eventId: '',                          // ← paste Rafa's event ID
    date: 'Monday, June 22 · 12:00 PM ET',
    format: 'Google Meet · 1 hour',
    meetLinkFallback: 'https://meet.google.com/wdv-hjfj-dih',
    signoff: 'Andrew, Alex & Ben',
  },
};

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
    const workshop = WORKSHOPS[body.workshopId] || null;

    // 1. Write to the sheet.
    const sheet = getOrCreateSheet(tabName);
    const calendarStatus = addToCalendarEvent(workshop, body.email, body.fullName);
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
    if (workshop && (calendarStatus === 'added' || calendarStatus === 'already-on')) {
      sendConfirmationEmail(workshop, body);
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
 * Returns: 'added' | 'already-on' | 'no-event-id' | 'unknown-workshop' | 'error: ...'
 */
function addToCalendarEvent(workshop, email, fullName) {
  if (!workshop) return 'unknown-workshop';
  if (!workshop.eventId) return 'no-event-id';
  if (!email) return 'error: no email';

  try {
    const event = Calendar.Events.get(CALENDAR_ID, workshop.eventId);
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
      workshop.eventId,
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
function sendConfirmationEmail(workshop, body) {
  if (!body.email) return;
  if (!workshop) return;

  let meetLink = '';
  try {
    const event = Calendar.Events.get(CALENDAR_ID, workshop.eventId);
    meetLink = event.hangoutLink || (event.conferenceData && event.conferenceData.entryPoints
      && event.conferenceData.entryPoints[0] && event.conferenceData.entryPoints[0].uri) || '';
  } catch (err) {
    // Calendar lookup failed — we'll use the fallback below.
  }
  if (!meetLink && workshop.meetLinkFallback) meetLink = workshop.meetLinkFallback;

  const firstName = (body.fullName || '').split(' ')[0] || 'there';
  const subject = "You're in — " + workshop.title;

  const text = [
    "Hey " + firstName + ",",
    "",
    "Thanks for applying to the founder workshop. You're in.",
    "",
    "Workshop  " + workshop.title,
    "Date      " + workshop.date,
    "Format    " + workshop.format,
    meetLink ? "Meet      " + meetLink : "",
    "",
    "You'll also see this on your Google Calendar — we've added you as a guest.",
    "",
    "Bring your toughest questions. We're keeping the room small so the Q&A actually works.",
    "",
    "See you then,",
    workshop.signoff,
    "Igloo Media × Dollar Commerce",
  ].filter(Boolean).join('\n');

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Inter', Helvetica, Arial, sans-serif; color:#0A0A0A; line-height:1.55; max-width:560px;">
      <p>Hey ${escapeHtml(firstName)},</p>
      <p>Thanks for applying to the founder workshop. You're in — here are the details:</p>
      <table cellpadding="0" cellspacing="0" style="border-collapse:collapse; margin:18px 0;">
        <tr><td style="padding:6px 18px 6px 0; color:#8A95A0; font-size:12px; letter-spacing:0.08em; text-transform:uppercase; font-weight:600;">Workshop</td><td style="padding:6px 0; font-size:15px;">${escapeHtml(workshop.title)}</td></tr>
        <tr><td style="padding:6px 18px 6px 0; color:#8A95A0; font-size:12px; letter-spacing:0.08em; text-transform:uppercase; font-weight:600;">Date</td><td style="padding:6px 0; font-size:15px;">${escapeHtml(workshop.date)}</td></tr>
        <tr><td style="padding:6px 18px 6px 0; color:#8A95A0; font-size:12px; letter-spacing:0.08em; text-transform:uppercase; font-weight:600;">Format</td><td style="padding:6px 0; font-size:15px;">${escapeHtml(workshop.format)}</td></tr>
        ${meetLink ? `<tr><td style="padding:6px 18px 6px 0; color:#8A95A0; font-size:12px; letter-spacing:0.08em; text-transform:uppercase; font-weight:600;">Join</td><td style="padding:6px 0; font-size:15px;"><a href="${escapeHtml(meetLink)}" style="color:#1AA3F0; text-decoration:none; font-weight:600;">${escapeHtml(meetLink)}</a></td></tr>` : ''}
      </table>
      <p>You'll also see this on your Google Calendar — we've added you as a guest.</p>
      <p>Bring your toughest questions. We're keeping the room small so the Q&amp;A actually works.</p>
      <p style="margin-top:24px;">See you then,<br>
      ${escapeHtml(workshop.signoff)}<br>
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
 * Helper: list candidate event IDs around the Rafa workshop date.
 * Run from the Apps Script editor (top toolbar → pick the function →
 * Run), then View → Logs to see the IDs.
 */
function logRafaEventId() { logEventIdsForDate('2026-06-22'); }

function logEventIdsForDate(yyyy_mm_dd) {
  const start = new Date(yyyy_mm_dd + 'T00:00:00-04:00');
  const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
  const events = Calendar.Events.list(CALENDAR_ID, {
    timeMin: start.toISOString(),
    timeMax: end.toISOString(),
    singleEvents: true,
    orderBy: 'startTime',
  });
  if (!events.items || events.items.length === 0) {
    Logger.log('No events found on ' + yyyy_mm_dd + ' in calendar: ' + CALENDAR_ID);
    return;
  }
  events.items.forEach(ev => {
    const when = (ev.start && (ev.start.dateTime || ev.start.date)) || '';
    Logger.log(when + ' — ' + (ev.summary || '(no title)') + '  →  ' + ev.id);
  });
}

/**
 * Helper: end-to-end test from the Apps Script editor. Edit the email
 * + workshopId, run, then check the sheet, your calendar, and inbox.
 */
function testRafaSubmission() { runTestSubmission('rafa-w1', 'Rafa_W1'); }

function runTestSubmission(workshopId, tab) {
  const fake = {
    postData: {
      contents: JSON.stringify({
        tab: tab,
        workshopId: workshopId,
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
