'use client';

/**
 * Dual-write bookmarks: localStorage (for instant UI + anonymous users)
 * + Sanity API (for logged-in users, fire-and-forget).
 */
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Bookmark } from 'lucide-react';

const KEY = 'dc_saved_articles';

function readSaved() {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]');
  } catch {
    return [];
  }
}

function writeSaved(saved) {
  localStorage.setItem(KEY, JSON.stringify(saved));
  window.dispatchEvent(new Event('dc-saved-changed'));
}

export function useSavedArticles() {
  const [saved, setSaved] = useState([]);
  useEffect(() => {
    setSaved(readSaved());
    const onChange = () => setSaved(readSaved());
    window.addEventListener('dc-saved-changed', onChange);
    window.addEventListener('storage', onChange);
    return () => {
      window.removeEventListener('dc-saved-changed', onChange);
      window.removeEventListener('storage', onChange);
    };
  }, []);
  return saved;
}

export default function BookmarkButton({ article, size = 18, color = '#666' }) {
  const saved = useSavedArticles();
  const { data: session } = useSession();
  const isSaved = saved.some((a) => a.slug === article.slug);

  const toggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const current = readSaved();
    const next = isSaved
      ? current.filter((a) => a.slug !== article.slug)
      : [
          ...current,
          {
            slug: article.slug,
            title: article.title,
            publishedAt: article.publishedAt,
            category: article.category?.title,
            author: article.author?.name,
          },
        ];
    writeSaved(next);

    // Dual-write to Sanity for logged-in users (fire-and-forget)
    if (session && article._id) {
      fetch('/api/saved-articles', {
        method: isSaved ? 'DELETE' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ articleId: article._id }),
      }).catch(() => {});
    }
  };

  return (
    <button
      onClick={toggle}
      aria-label={isSaved ? 'Remove bookmark' : 'Bookmark article'}
      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
    >
      <Bookmark size={size} color={color} fill={isSaved ? color : 'none'} />
    </button>
  );
}
