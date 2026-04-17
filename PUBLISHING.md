# Publishing articles

This is the workflow for writing, editing, and publishing articles on Dollar
Commerce. Everything lives in **Sanity Studio** — a Google-Docs-style web editor
embedded directly in the site.

## The 30-second version

1. Go to `http://localhost:5180/studio` (locally) or `https://YOUR-DOMAIN/studio` (live)
2. Log in with your Sanity account
3. Click **Article → Create new**
4. Fill in title, hero image, author, category, body
5. Click **Publish**
6. The article is live within ~60 seconds (cache refresh)

---

## First-time setup (per writer)

Each writer needs their own Sanity login. You invite them once:

1. Go to https://www.sanity.io/manage
2. Pick the `dollar-commerce` project
3. **Members → Invite Member**, enter their email
4. Give them the **Editor** role
5. They accept the invite via email, log in, and land in the Studio

---

## Writing an article

### Open Studio
Go to `/studio` on the site. Sign in with your Sanity account. You'll see a
sidebar with **Article, Author, Category, Tag**. Click **Article**.

### Create new
Click the **"+"** icon at the top. A new draft article opens.

### Fill in the fields

| Field | What to put |
|---|---|
| **Title** | The full article headline |
| **Slug** | Auto-generates from the title — click "Generate" |
| **Subtitle / deck** | Optional one-liner under the headline |
| **Hero image** | Drag-drop the main image here. This is what shows on the homepage and article page. |
| **Author** | Pick from the dropdown, or "Create new" if it's a new writer |
| **Category** | Pick one: E-Commerce / Platforms / Features / Opinion / Tech |
| **Tags** | Optional free-form tags — e.g. "Amazon", "AI", "Meta" |
| **Published at** | Defaults to now. Backdate if you want. |
| **Premium only?** | Flip to paywall the article. Leave off for free reads. |
| **Excerpt** | Short summary for article cards. Keep under ~200 chars. |
| **Body** | The actual article. See below. |

### Writing the body

The body field is a rich-text editor with:

- **Paragraphs** — just type
- **Headings** — click the style dropdown (top-left) → H2 or H3
- **Bold / italic** — select text, click B or I in the toolbar
- **Links** — select text, click the link icon, paste URL
- **Bulleted / numbered lists** — click the list icons
- **Block quotes** — pick "Quote" from the style dropdown
- **Inline images** — click the image icon in the toolbar, drag-drop or upload.
  Each image gets a caption and alt-text field.

**Tip:** If you're pasting from Google Docs or Notion, most formatting
(bold, italic, lists, headings) comes through cleanly. Paste, then scan for
anything weird.

### Draft vs publish
- Clicking **Save** stores a draft — nothing is live yet
- Clicking **Publish** pushes it live
- You can un-publish at any time via **⋮ → Unpublish**
- Previous versions are saved automatically — undo is always possible

### How fast does it go live?
The site caches for 60 seconds, so your new article shows up on the homepage
within ~1 minute of publishing. If you don't see it, hard-refresh the page.

---

## Categories — what goes where

Based on the original Substack taxonomy:

| Category | What belongs here |
|---|---|
| **E-Commerce** | General industry analysis, tariffs, DTC economics, supply chain, retail |
| **Platforms** | Meta, Google, TikTok, Amazon features, AI tools, ad platforms, software changes |
| **Features** | Brand / founder / company profiles (IQBAR, Cheers Health, "12 Days of Commerce", guest features) |
| **Opinion** | Personal essays, sports, politics, life takes |
| **Tech** | Infrastructure, developer stuff, AI research |

Each article has exactly **one** category. Use **tags** if you want to
cross-cut (e.g. a Features article about an AI tool can be tagged "AI" so it
still appears in AI filters later).

---

## Adding a new writer

Two steps:

### 1. Create the Author doc
Studio → **Author → Create new**
- **Name:** full name (e.g. "Sarah Jenkins")
- **Slug:** auto-generate
- **Avatar:** profile photo, 400×400+, cropped square
- **Bio:** 1–2 sentences, shown on their author page
- **Twitter / email:** optional

### 2. Invite them as a Sanity member
See *First-time setup* above. Once they accept, they can log in and start
writing — the Author doc you created will be in the dropdown when they write
their first article.

---

## Images — what to know

- **Hero image** — the biggest one. Appears at 1200×675 on article pages and
  as the card thumbnail everywhere else. Minimum **1200px wide**.
- **Inline images** — automatically sized. Use sparingly; too many slows
  the page and the reader.
- **File size** — Sanity optimizes on the fly, so don't worry about it. Just
  upload the biggest version you have.
- **Alt text** — fill it in. It's for screen readers and Google Images.
- **HEIC files** — won't work. Convert to JPG first (Preview app on Mac: File
  → Export).

---

## Importing old Substack posts

The importer already pulled your first 63 Substack posts. If you publish a new
post on Substack and want to bring it over:

```
npm run import:substack
```

It's idempotent — it skips anything already in Sanity (matched by Substack
URL). So you can run it as many times as you want.

If you want to **re-import** a specific post (e.g. because you fixed the
images), delete it in Studio first, then run the importer.

---

## Moving articles between categories in bulk

Open `scripts/categorize-articles.mjs`. Edit the `RULES` block to move slugs
around. Then:

```
npm run categorize
```

This re-runs categorization across every article. It's safe to run multiple
times.

---

## What happens if you break something

Everything is versioned in Sanity — every publish is a new version, and you
can roll back via the **⋮ → History** button on any document. Nothing you do
in Studio can permanently lose content.

If you break the *layout* (e.g. a weird heading), just edit and re-publish.
The site auto-refreshes.

If you break the *code* (not the content) — tell Claude.

---

## Comments

Comments are off by default. To turn them on (it's free), follow the
instructions at the top of `components/Comments.jsx`. Briefly: push the repo
to GitHub, install the Giscus app, paste four IDs into `.env.local`. After
that every article page shows a comment thread with threaded replies,
reactions, and GitHub-account login.

---

## Tagging cheat sheet

Use tags for anything cross-cutting:
- `amazon`, `meta`, `google`, `tiktok`, `shopify` — platform-specific pieces
- `ai`, `llm`, `automation` — AI content
- `dtc`, `retail`, `logistics` — industry sub-verticals
- `guest-feature`, `12-days-of-commerce` — series

These don't show up anywhere in the UI yet, but filter pages
(`/tag/amazon`, etc.) are easy to add when you want them — just ask.
