'use client';

import { useState } from 'react';

/**
 * Subscribe card matching the handoff design.
 * Posts to /api/subscribe (Beehiiv-backed). On success, swaps to the
 * success state.
 */
export default function SubscribeForm() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle | submitting | success | error
  const [message, setMessage] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    if (status === 'submitting' || status === 'success') return;
    setStatus('submitting');
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
        setMessage(data.error || 'Something went wrong. Try again.');
      } else {
        setStatus('success');
        setEmail('');
      }
    } catch {
      setStatus('error');
      setMessage('Network error. Try again.');
    }
  }

  return (
    <form onSubmit={handleSubmit} className="dcdaily-card">
      <h2>
        <span className="pulse" aria-hidden="true" />DC Daily
      </h2>
      <p>Top stories, latest articles and a snapshot of everything public.</p>

      {status !== 'success' && (
        <div className="row">
          <input
            type="email"
            required
            placeholder="Your email"
            aria-label="Your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={status === 'submitting'}
          />
          <button type="submit" disabled={status === 'submitting'}>
            {status === 'submitting' ? 'Subscribing…' : 'Subscribe'}
          </button>
          {status === 'error' && message && (
            <div className="error">{message}</div>
          )}
        </div>
      )}

      {status === 'success' && (
        <div className="success">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0B1128" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          You&rsquo;re in. First issue lands tomorrow at 8am.
        </div>
      )}
    </form>
  );
}
