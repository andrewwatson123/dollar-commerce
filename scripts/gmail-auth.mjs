/**
 * One-time Gmail OAuth setup.
 *
 * Run this once to authorize the newsletter scraper to read your Gmail:
 *   node --env-file=.env.local scripts/gmail-auth.mjs
 *
 * It will:
 *   1. Open a browser window for Google sign-in
 *   2. Ask you to grant read-only Gmail access
 *   3. Save the refresh token to .env.local
 *
 * Prerequisites:
 *   - AUTH_GOOGLE_ID and AUTH_GOOGLE_SECRET in .env.local
 *   - Gmail API enabled in Google Cloud Console
 *   - Add http://localhost:3333 as an authorized redirect URI in Google Cloud Console
 */

import { google } from 'googleapis';
import http from 'http';
import { execSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';

const CLIENT_ID = process.env.AUTH_GOOGLE_ID;
const CLIENT_SECRET = process.env.AUTH_GOOGLE_SECRET;
const REDIRECT_URI = 'http://localhost:3333';

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error('❌ Missing AUTH_GOOGLE_ID or AUTH_GOOGLE_SECRET in .env.local');
  process.exit(1);
}

const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

const authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  prompt: 'consent',
  scope: [
    'https://www.googleapis.com/auth/gmail.readonly',
    'https://www.googleapis.com/auth/gmail.send',
  ],
});

console.log('🔐 Gmail Authorization Setup\n');
console.log('Opening your browser to authorize Gmail access...\n');

// Open browser
try {
  execSync(`open "${authUrl}"`);
} catch {
  console.log('Open this URL in your browser:\n');
  console.log(authUrl);
  console.log('');
}

// Start local server to catch the callback
const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:3333`);
  const code = url.searchParams.get('code');

  if (!code) {
    res.writeHead(400);
    res.end('No authorization code received.');
    return;
  }

  try {
    const { tokens } = await oauth2Client.getToken(code);

    // Save refresh token to .env.local
    const envPath = '.env.local';
    let envContent = readFileSync(envPath, 'utf-8');

    if (envContent.includes('GMAIL_REFRESH_TOKEN=')) {
      envContent = envContent.replace(/GMAIL_REFRESH_TOKEN=.*/, `GMAIL_REFRESH_TOKEN=${tokens.refresh_token}`);
    } else {
      envContent += `\n# Gmail API — for newsletter scraper\nGMAIL_REFRESH_TOKEN=${tokens.refresh_token}\n`;
    }

    writeFileSync(envPath, envContent);

    console.log('✅ Gmail authorized successfully!');
    console.log(`   Refresh token saved to .env.local`);
    console.log(`\n   You can now run: node --env-file=.env.local scripts/scrape-newsletters.mjs`);

    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(`
      <html><body style="font-family:system-ui;display:flex;align-items:center;justify-content:center;min-height:100vh;background:#F4F1EA">
        <div style="text-align:center">
          <h1 style="color:#0F172A">✅ Gmail Authorized</h1>
          <p style="color:#666">You can close this tab and return to the terminal.</p>
        </div>
      </body></html>
    `);
  } catch (err) {
    console.error('❌ Error getting tokens:', err.message);
    res.writeHead(500);
    res.end('Authorization failed.');
  }

  server.close();
  process.exit(0);
});

server.listen(3333, () => {
  console.log('Waiting for authorization callback on http://localhost:3333 ...\n');
});

// Timeout after 2 minutes
setTimeout(() => {
  console.log('⏰ Timed out waiting for authorization. Please try again.');
  server.close();
  process.exit(1);
}, 120000);
