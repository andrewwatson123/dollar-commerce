'use client';

import { useEffect } from 'react';

export default function ViewTracker({ slug }) {
  useEffect(() => {
    if (!slug) return;
    // Fire-and-forget. One ping per mount.
    fetch('/api/view', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ slug }),
    }).catch(() => {});
  }, [slug]);
  return null;
}
