'use client';

import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';

const KEY = 'dc_liked_articles';

function readLiked() {
  if (typeof window === 'undefined') return new Set();
  try {
    return new Set(JSON.parse(localStorage.getItem(KEY) || '[]'));
  } catch {
    return new Set();
  }
}

function writeLiked(set) {
  localStorage.setItem(KEY, JSON.stringify([...set]));
}

export default function LikeButton({ slug, initialCount = 0, size = 18, color = '#666' }) {
  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState(initialCount);

  useEffect(() => {
    setLiked(readLiked().has(slug));
  }, [slug]);

  const toggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (liked) return; // Can't unlike (keeps it simple)

    setLiked(true);
    setCount((c) => c + 1);

    const set = readLiked();
    set.add(slug);
    writeLiked(set);

    // Fire-and-forget server increment
    fetch('/api/like', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ slug }),
    }).catch(() => {});
  };

  return (
    <button
      onClick={toggle}
      aria-label={liked ? 'Liked' : 'Like this article'}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        background: 'none',
        border: 'none',
        cursor: liked ? 'default' : 'pointer',
        padding: 4,
        fontSize: 12,
        color: liked ? '#D2042D' : color,
        fontWeight: 600,
      }}
    >
      <Heart size={size} color={liked ? '#D2042D' : color} fill={liked ? '#D2042D' : 'none'} />
      {count > 0 && <span>{count}</span>}
    </button>
  );
}
