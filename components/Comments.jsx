'use client';

/**
 * Comments powered by Giscus (GitHub Discussions under the hood).
 *
 * Why Giscus instead of rolling our own:
 *   - Auth, threading, reactions, moderation, spam handling are all free
 *   - Content lives in a public GitHub Discussions category (durable, exportable)
 *   - Zero backend for us to maintain
 *
 * To activate:
 *   1. Push the repo to GitHub (public)
 *   2. Install the Giscus app: https://github.com/apps/giscus
 *   3. Enable Discussions on the repo, create a category called "Comments"
 *   4. Go to https://giscus.app, fill in the form → it gives you the four IDs
 *   5. Paste them into .env.local:
 *        NEXT_PUBLIC_GISCUS_REPO=owner/repo
 *        NEXT_PUBLIC_GISCUS_REPO_ID=...
 *        NEXT_PUBLIC_GISCUS_CATEGORY=Comments
 *        NEXT_PUBLIC_GISCUS_CATEGORY_ID=...
 *
 * Until those envs are set, this component shows a friendly placeholder.
 */
import { useEffect, useRef } from 'react';

export default function Comments({ term }) {
  const ref = useRef(null);
  const repo = process.env.NEXT_PUBLIC_GISCUS_REPO;
  const repoId = process.env.NEXT_PUBLIC_GISCUS_REPO_ID;
  const category = process.env.NEXT_PUBLIC_GISCUS_CATEGORY;
  const categoryId = process.env.NEXT_PUBLIC_GISCUS_CATEGORY_ID;

  useEffect(() => {
    if (!ref.current || !repo || !repoId) return;
    // Clean up any previous instance
    ref.current.innerHTML = '';
    const script = document.createElement('script');
    script.src = 'https://giscus.app/client.js';
    script.async = true;
    script.crossOrigin = 'anonymous';
    script.setAttribute('data-repo', repo);
    script.setAttribute('data-repo-id', repoId);
    script.setAttribute('data-category', category);
    script.setAttribute('data-category-id', categoryId);
    script.setAttribute('data-mapping', 'specific');
    script.setAttribute('data-term', term);
    script.setAttribute('data-strict', '1');
    script.setAttribute('data-reactions-enabled', '1');
    script.setAttribute('data-emit-metadata', '0');
    script.setAttribute('data-input-position', 'top');
    script.setAttribute('data-theme', 'light');
    script.setAttribute('data-lang', 'en');
    ref.current.appendChild(script);
  }, [repo, repoId, category, categoryId, term]);

  // Hide the component entirely until Giscus env vars are set.
  // Once NEXT_PUBLIC_GISCUS_REPO + NEXT_PUBLIC_GISCUS_REPO_ID are added to
  // Vercel, comments will appear automatically with no code change.
  if (!repo || !repoId) return null;

  return <div ref={ref} style={{ marginTop: 48 }} />;
}
