'use client';

/**
 * Auto-merges localStorage bookmarks to Sanity on login.
 * Runs once per session via useRef flag.
 */

import { useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';

const KEY = 'dc_saved_articles';

export default function BookmarkSync() {
  const { data: session, status } = useSession();
  const merged = useRef(false);

  useEffect(() => {
    if (status !== 'authenticated' || merged.current) return;
    merged.current = true;

    try {
      const saved = JSON.parse(localStorage.getItem(KEY) || '[]');
      if (!saved.length) return;

      const slugs = saved.map((a) => a.slug).filter(Boolean);
      if (!slugs.length) return;

      fetch('/api/saved-articles/merge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slugs }),
      }).catch(() => {});
    } catch {
      // silent fail
    }
  }, [status]);

  return null;
}
