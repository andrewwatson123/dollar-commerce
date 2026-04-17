# Domain Launch Checklist

Things to do once dollarcommerce.com (or chosen domain) is live:

## Google OAuth Setup
1. Go to Google Cloud Console → APIs & Services → Credentials
2. Create OAuth 2.0 Client ID (Web application)
3. Add authorized redirect URI: `https://yourdomain.com/api/auth/callback/google`
4. Copy Client ID and Client Secret
5. Add to Vercel environment variables:
   - `AUTH_GOOGLE_ID`
   - `AUTH_GOOGLE_SECRET`
   - `AUTH_SECRET` (same value as .env.local)

## Email Magic Link (Optional)
1. Set up transactional email (Resend, SendGrid, or similar)
2. Add to Vercel env vars:
   - `AUTH_EMAIL_SERVER=smtp://user:pass@smtp.provider.com:587`
   - `AUTH_EMAIL_FROM=noreply@yourdomain.com`
3. Set up SPF/DKIM DNS records for deliverability

## Vercel Environment Variables
Copy all from `.env.local`:
- `FINNHUB_API_KEY`
- `NEXT_PUBLIC_SANITY_PROJECT_ID`
- `NEXT_PUBLIC_SANITY_DATASET`
- `NEXT_PUBLIC_SANITY_API_VERSION`
- `SANITY_API_WRITE_TOKEN`
- `AUTH_SECRET`
- `AUTH_GOOGLE_ID`
- `AUTH_GOOGLE_SECRET`
- `CRON_SECRET` (for Vercel cron jobs)

## DNS / Domain
- Point domain to Vercel
- SSL auto-provisioned by Vercel
- Update `NEXT_PUBLIC_SITE_URL` env var to production URL

## Sanity CORS
- Add production domain to Sanity CORS origins:
  sanity.io/manage → project → API → CORS origins → Add `https://yourdomain.com`
