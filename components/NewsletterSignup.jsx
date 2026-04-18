'use client';

import { useState } from 'react';

export default function NewsletterSignup({ variant = 'dark' }) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [message, setMessage] = useState('');

  const isDark = variant === 'dark';

  async function handleSubmit(e) {
    e.preventDefault();
    if (status === 'loading') return;
    setStatus('loading');
    setMessage('');

    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus('error');
        setMessage(data.error || 'Something went wrong. Please try again.');
      } else {
        setStatus('success');
        setMessage('You\u2019re in. Look out for tomorrow\u2019s DC Daily.');
        setEmail('');
      }
    } catch {
      setStatus('error');
      setMessage('Network error. Please try again.');
    }
  }

  return (
    <div
      data-dc="newsletter-signup"
      style={{
        background: isDark ? '#0F172A' : '#fff',
        padding: '24px',
        borderRadius: '8px',
        border: isDark ? 'none' : '1px solid #E2E8F0',
      }}
    >
      <h4 style={{
        fontSize: '18px', fontWeight: '700',
        color: isDark ? '#fff' : '#0F172A',
        marginBottom: '12px', margin: '0 0 12px',
      }}>
        DC Daily
      </h4>
      <p style={{
        fontSize: '14px',
        color: isDark ? '#cbd5e1' : '#64748B',
        marginBottom: '16px', margin: '0 0 16px', lineHeight: '1.5',
      }}>
        Get the top stories delivered to your inbox every morning.
      </p>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={status === 'loading' || status === 'success'}
          placeholder="Your email"
          aria-label="Email"
          style={{
            width: '100%', padding: '12px', marginBottom: '10px',
            border: '1px solid ' + (isDark ? 'transparent' : '#E2E8F0'),
            borderRadius: '6px', fontSize: '14px',
            boxSizing: 'border-box', fontFamily: 'inherit',
            background: status === 'loading' || status === 'success' ? '#F1F5F9' : '#fff',
            color: '#0F172A',
            outline: 'none',
          }}
        />
        <button
          type="submit"
          disabled={status === 'loading' || status === 'success'}
          style={{
            width: '100%',
            background: status === 'success' ? '#10B981' : '#D2042D',
            color: '#fff', border: 'none', padding: '12px',
            borderRadius: '6px', fontSize: '14px', fontWeight: '700',
            cursor: status === 'loading' || status === 'success' ? 'default' : 'pointer',
            opacity: status === 'loading' ? 0.7 : 1,
            fontFamily: 'inherit',
            transition: 'background 200ms',
          }}
        >
          {status === 'loading' ? 'Subscribing...' :
           status === 'success' ? '\u2713 Subscribed' :
           'Subscribe'}
        </button>
      </form>
      {message && (
        <p style={{
          fontSize: '12px', margin: '10px 0 0', lineHeight: 1.5,
          color: status === 'success'
            ? (isDark ? '#86efac' : '#059669')
            : (isDark ? '#fca5a5' : '#DC2626'),
        }}>
          {message}
        </p>
      )}
    </div>
  );
}
