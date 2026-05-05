/**
 * Workshop signup → Google Sheet bridge.
 *
 * Setup:
 *  1. Open the target Sheet:
 *     https://docs.google.com/spreadsheets/d/1TQUDREhad2pgfdIGyUy438eqKdkjvEXzskVB7foyWhI/edit
 *  2. Extensions → Apps Script.
 *  3. Replace Code.gs with this file's contents.
 *  4. Deploy → New deployment → type "Web app".
 *       - Execute as: Me
 *       - Who has access: Anyone
 *  5. Copy the deployment URL.
 *  6. In the Next.js app, set:
 *       WORKSHOP_SHEET_WEBHOOK_URL=<the deployment URL>
 *
 * The script writes a row to the tab named in the request payload (e.g.
 * `Jesse_W1`). If the tab doesn't exist it is created and a header row added.
 */

const SHEET_ID = '1TQUDREhad2pgfdIGyUy438eqKdkjvEXzskVB7foyWhI';
const DEFAULT_TAB = 'Jesse_W1';
const HEADERS = [
  'Timestamp',
  'Workshop',
  'Full name',
  'Email',
  'Company',
  'Website',
  'LinkedIn',
  'Description',
];

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents || '{}');
    const tabName = body.tab || DEFAULT_TAB;
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

    sheet.appendRow([
      body.timestamp || new Date().toISOString(),
      body.workshopId || '',
      body.fullName || '',
      body.email || '',
      body.company || '',
      body.website || '',
      body.linkedin || '',
      body.description || '',
    ]);

    return ContentService.createTextOutput(
      JSON.stringify({ ok: true })
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(
      JSON.stringify({ ok: false, error: String(err) })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet() {
  return ContentService.createTextOutput(
    JSON.stringify({ ok: true, msg: 'Workshop signup endpoint. POST only.' })
  ).setMimeType(ContentService.MimeType.JSON);
}
