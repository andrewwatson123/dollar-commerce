'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { Mail } from 'lucide-react';

const SERIF = "Georgia, 'Times New Roman', serif";

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleGoogle = () => signIn('google', { callbackUrl: '/' });

  const handleEmail = async (e) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      await signIn('email', { email, callbackUrl: '/', redirect: false });
      setEmailSent(true);
    } catch {
      // Will still show success to avoid email enumeration
      setEmailSent(true);
    }
    setLoading(false);
  };

  return (
    <div style={{
      width: '100%', maxWidth: 440, background: '#fff',
      borderRadius: 12, border: '1px solid #E0E0E0',
      padding: '48px 40px', textAlign: 'center',
    }}>
      {/* Logo */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}>
        <img
          src="/dc-icon-navy.svg"
          alt="Dollar Commerce"
          width={56}
          height={56}
          style={{ display: 'block', borderRadius: 12 }}
        />
      </div>

      <h1 style={{ fontSize: 20, fontWeight: 700, color: '#0F172A', margin: '24px 0 8px' }}>
        Sign in to your account
      </h1>
      <p style={{ fontSize: 14, color: '#666', margin: '0 0 32px' }}>
        Access saved articles, preferences, and more.
      </p>

      {emailSent ? (
        <div style={{ padding: '24px 0' }}>
          <div style={{
            width: 48, height: 48, borderRadius: '50%', background: '#ECFDF5',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px',
          }}>
            <Mail size={24} color="#10B981" />
          </div>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#0F172A', margin: '0 0 8px' }}>
            Check your email
          </h2>
          <p style={{ fontSize: 14, color: '#666', margin: 0 }}>
            We sent a sign-in link to <strong>{email}</strong>
          </p>
          <button
            onClick={() => { setEmailSent(false); setEmail(''); }}
            style={{
              marginTop: 24, padding: '10px 24px', borderRadius: 8,
              fontSize: 13, fontWeight: 600, color: '#666',
              background: 'none', border: '1px solid #E0E0E0', cursor: 'pointer',
            }}
          >
            Try a different email
          </button>
        </div>
      ) : (
        <>
          {/* Google button */}
          <button
            onClick={handleGoogle}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: 10, padding: '12px 16px', borderRadius: 8, fontSize: 14, fontWeight: 600,
              color: '#0F172A', background: '#fff', border: '1px solid #E0E0E0',
              cursor: 'pointer', marginBottom: 24,
            }}
          >
            <svg width="18" height="18" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
            </svg>
            Continue with Google
          </button>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
            <div style={{ flex: 1, height: 1, background: '#E0E0E0' }} />
            <span style={{ fontSize: 12, color: '#999', textTransform: 'uppercase', letterSpacing: 0.5 }}>or</span>
            <div style={{ flex: 1, height: 1, background: '#E0E0E0' }} />
          </div>

          {/* Email form */}
          <form onSubmit={handleEmail}>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: '100%', padding: '12px 16px', borderRadius: 8,
                border: '1px solid #E0E0E0', fontSize: 14, color: '#0F172A',
                outline: 'none', marginBottom: 12, boxSizing: 'border-box',
              }}
            />
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%', padding: '12px 16px', borderRadius: 8,
                fontSize: 14, fontWeight: 600, color: '#fff',
                background: '#0F172A', border: 'none', cursor: 'pointer',
                opacity: loading ? 0.6 : 1,
              }}
            >
              {loading ? 'Sending...' : 'Send magic link'}
            </button>
          </form>

          <p style={{ fontSize: 12, color: '#999', marginTop: 24 }}>
            By signing in, you agree to our Terms of Service and Privacy Policy.
          </p>
        </>
      )}
    </div>
  );
}
