'use client';

/**
 * Share menu. Click the button, dropdown opens with:
 *   - Copy link
 *   - Share to X / LinkedIn / Facebook / Email
 * On mobile with navigator.share support, we route through the native share sheet.
 */
import { useEffect, useRef, useState } from 'react';
import { Share2, Link as LinkIcon, Mail, Check } from 'lucide-react';

export default function ShareButton({ title, url, size = 18 }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onClickAway = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onClickAway);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClickAway);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const fullUrl = url?.startsWith('http')
    ? url
    : (typeof window !== 'undefined' ? `${window.location.origin}${url || window.location.pathname}` : url);
  const text = title || 'Dollar Commerce';

  const handleClick = async () => {
    // Use native share sheet on mobile if available
    if (typeof navigator !== 'undefined' && navigator.share && /mobile|android|iphone|ipad/i.test(navigator.userAgent)) {
      try {
        await navigator.share({ title: text, url: fullUrl });
        return;
      } catch {
        // user cancelled → fall through to menu
      }
    }
    setOpen((o) => !o);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      setTimeout(() => { setCopied(false); setOpen(false); }, 1200);
    } catch {}
  };

  const share = (platform) => {
    const u = encodeURIComponent(fullUrl);
    const t = encodeURIComponent(text);
    const links = {
      x: `https://twitter.com/intent/tweet?url=${u}&text=${t}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${u}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${u}`,
      email: `mailto:?subject=${t}&body=${u}`,
    };
    window.open(links[platform], '_blank', 'noopener,noreferrer,width=600,height=500');
    setOpen(false);
  };

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={handleClick}
        aria-label="Share"
        title="Share this article"
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          background: 'none', border: '1px solid #E2E8F0', borderRadius: 8,
          padding: '6px 12px', cursor: 'pointer',
          fontSize: 13, fontWeight: 600, color: '#0F172A',
          fontFamily: 'inherit',
        }}
      >
        <Share2 size={size - 4} color="#0F172A" />
        Share
      </button>

      {open && (
        <div
          style={{
            position: 'absolute', top: 'calc(100% + 6px)', right: 0,
            minWidth: 200, background: '#fff',
            border: '1px solid #E2E8F0', borderRadius: 10,
            boxShadow: '0 12px 32px rgba(0,0,0,0.12)',
            padding: 6, zIndex: 100,
          }}
        >
          <MenuItem icon={copied ? Check : LinkIcon} label={copied ? 'Copied!' : 'Copy link'} onClick={handleCopy} accent={copied ? '#10B981' : undefined} />
          <MenuItem icon={XIcon}        label="Share on X"        onClick={() => share('x')} />
          <MenuItem icon={LinkedInIcon} label="Share on LinkedIn" onClick={() => share('linkedin')} />
          <MenuItem icon={FacebookIcon} label="Share on Facebook" onClick={() => share('facebook')} />
          <MenuItem icon={Mail}         label="Email"             onClick={() => share('email')} />
        </div>
      )}
    </div>
  );
}

function MenuItem({ icon: Icon, label, onClick, accent }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 10,
        width: '100%', padding: '9px 12px',
        background: 'none', border: 'none', cursor: 'pointer',
        fontSize: 13, color: accent || '#0F172A', fontFamily: 'inherit',
        textAlign: 'left', borderRadius: 6,
      }}
      onMouseEnter={(e) => e.currentTarget.style.background = '#F8FAFC'}
      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
    >
      <Icon size={15} color={accent || '#64748B'} />
      {label}
    </button>
  );
}

/* Simple brand icons rendered as inline SVG */
function XIcon({ size = 15, color = '#64748B' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  );
}
function LinkedInIcon({ size = 15, color = '#64748B' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zm1.78 13.02H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z"/>
    </svg>
  );
}
function FacebookIcon({ size = 15, color = '#64748B' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M24 12.07C24 5.41 18.63 0 12 0S0 5.41 0 12.07C0 18.1 4.39 23.09 10.13 24v-8.44H7.08v-3.5h3.05V9.41c0-3.02 1.79-4.7 4.53-4.7 1.31 0 2.69.24 2.69.24v2.97h-1.51c-1.49 0-1.96.93-1.96 1.89v2.26h3.33l-.53 3.5h-2.8V24C19.61 23.09 24 18.1 24 12.07z"/>
    </svg>
  );
}
