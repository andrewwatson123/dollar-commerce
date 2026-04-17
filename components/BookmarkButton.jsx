'use client';

/**
 * Dual-write bookmarks: localStorage (for instant UI + anonymous users)
 * + Sanity API (for logged-in users, fire-and-forget).
 */
import { useEffect, useState } from 'react';
import { useSession, signIn } from 'next-auth/react';
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
  const { data: session, status } = useSession();
  const [showPrompt, setShowPrompt] = useState(false);
  const isSaved = saved.some((a) => a.slug === article.slug);

  const toggle = (e) => {
    e.preventDefault();
    e.stopPropagation();

    // Require login to bookmark
    if (status !== 'loading' && !session) {
      setShowPrompt(true);
      return;
    }

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
    <>
      <button
        onClick={toggle}
        aria-label={isSaved ? 'Remove bookmark' : 'Bookmark article'}
        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
      >
        <Bookmark size={size} color={color} fill={isSaved ? color : 'none'} />
      </button>

      {showPrompt && (
        <div
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowPrompt(false); }}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 9999, padding: 20,
          }}
        >
          <div
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
            style={{
              background: '#fff', borderRadius: 16, padding: '32px 28px',
              maxWidth: 400, width: '100%', textAlign: 'center',
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            }}
          >
            <div style={{ width: 56, height: 56, borderRadius: 14, background: '#FEF2F2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <Bookmark size={26} color="#D2042D" />
            </div>
            <h3 style={{ margin: '0 0 8px', fontSize: 20, fontWeight: 700, color: '#0F172A' }}>Save articles for later</h3>
            <p style={{ margin: '0 0 24px', fontSize: 14, color: '#64748B', lineHeight: 1.5 }}>
              Sign in to bookmark articles and sync them across devices.
            </p>
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); signIn('google'); }}
              style={{
                display: 'block', width: '100%', padding: '12px 20px', borderRadius: 10,
                border: 'none', background: '#0F172A', color: '#fff',
                fontSize: 14, fontWeight: 600, cursor: 'pointer', marginBottom: 10,
              }}
            >
              Sign in with Google
            </button>
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowPrompt(false); }}
              style={{
                display: 'block', width: '100%', padding: '10px 20px', borderRadius: 10,
                border: '1px solid #E2E8F0', background: '#fff', color: '#64748B',
                fontSize: 13, fontWeight: 500, cursor: 'pointer',
              }}
            >
              Not now
            </button>
          </div>
        </div>
      )}
    </>
  );
}
