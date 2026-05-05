'use client';

import { useState } from 'react';

export default function WorkshopSignupForm({ workshopId = 'jesse-w1' }) {
  const [form, setForm] = useState({
    fullName: '',
    company: '',
    website: '',
    linkedin: '',
    email: '',
    description: '',
  });
  const [status, setStatus] = useState('idle'); // idle | submitting | success | error
  const [errorMsg, setErrorMsg] = useState('');

  const onChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setStatus('submitting');
    setErrorMsg('');

    try {
      const res = await fetch('/api/workshop-signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, workshopId }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || 'Could not submit. Try again.');
      setStatus('success');
    } catch (err) {
      setStatus('error');
      setErrorMsg(err.message || 'Something went wrong.');
    }
  };

  if (status === 'success') {
    return (
      <div className="igf-success">
        <div className="igf-success-mark" aria-hidden>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M5 12.5l4.5 4.5L19 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div className="igf-success-title">Application received.</div>
        <p className="igf-success-body">
          We&apos;ll review your application and email selected founders a Zoom link.
          Keep an eye on your inbox.
        </p>
        <style jsx>{`
          .igf-success {
            max-width: 560px;
            margin: 0 auto;
            text-align: center;
            padding: 48px 24px;
            background: #FFFFFF;
            border: 1px solid #E6ECF1;
            border-radius: 18px;
            box-shadow: 0 18px 40px rgba(15, 27, 40, 0.06);
          }
          .igf-success-mark {
            width: 56px;
            height: 56px;
            margin: 0 auto 18px;
            border-radius: 50%;
            background: #DCEFFB;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #1AA3F0;
          }
          .igf-success-mark svg { width: 28px; height: 28px; }
          .igf-success-title {
            font-family: Georgia, serif;
            font-size: 26px;
            font-weight: 700;
            letter-spacing: -0.01em;
            color: #0A0A0A;
            margin-bottom: 10px;
          }
          .igf-success-body {
            color: #4A5560;
            font-size: 15px;
            line-height: 1.6;
            margin: 0;
          }
          @media (max-width: 600px) {
            .igf-success { padding: 36px 18px; border-radius: 14px; }
            .igf-success-title { font-size: 22px; }
          }
        `}</style>
      </div>
    );
  }

  return (
    <form className="igf-form" onSubmit={onSubmit} noValidate>
      <div className="igf-grid">
        <Field
          label="Full name"
          name="fullName"
          required
          autoComplete="name"
          value={form.fullName}
          onChange={onChange}
          placeholder="Jane Doe"
        />
        <Field
          label="Email"
          name="email"
          type="email"
          required
          autoComplete="email"
          inputMode="email"
          value={form.email}
          onChange={onChange}
          placeholder="you@brand.com"
        />
        <Field
          label="Company or brand"
          name="company"
          required
          autoComplete="organization"
          value={form.company}
          onChange={onChange}
          placeholder="Acme Co."
        />
        <Field
          label="Website"
          name="website"
          required
          autoComplete="url"
          inputMode="url"
          value={form.website}
          onChange={onChange}
          placeholder="https://yourbrand.com"
        />
        <Field
          label="LinkedIn"
          hint="Optional"
          name="linkedin"
          inputMode="url"
          value={form.linkedin}
          onChange={onChange}
          placeholder="linkedin.com/in/..."
          fullWidth
        />
        <Field
          label="Tell us about your business"
          name="description"
          textarea
          required
          value={form.description}
          onChange={onChange}
          placeholder="What you sell, stage, rough scale, and what you're hoping to get out of the session."
          fullWidth
        />
      </div>

      {status === 'error' && (
        <div className="igf-error" role="alert">
          {errorMsg}
        </div>
      )}

      <div className="igf-actions">
        <button
          type="submit"
          className="igf-submit"
          disabled={status === 'submitting'}
        >
          {status === 'submitting' ? 'Submitting…' : 'Apply for a seat'}
          <span className="igf-submit-arrow" aria-hidden>→</span>
        </button>
        <p className="igf-fineprint">
          Free for selected founders. We never share your info.
        </p>
      </div>

      <style jsx>{`
        .igf-form {
          max-width: 720px;
          margin: 0 auto;
          background: #FFFFFF;
          border: 1px solid #E6ECF1;
          border-radius: 18px;
          padding: 32px;
          box-shadow: 0 18px 40px rgba(15, 27, 40, 0.05);
        }
        .igf-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 18px;
        }
        .igf-error {
          margin-top: 18px;
          padding: 12px 14px;
          background: #FEF2F2;
          border: 1px solid #FECACA;
          color: #B42318;
          border-radius: 10px;
          font-size: 14px;
          line-height: 1.4;
        }
        .igf-actions {
          margin-top: 24px;
          display: flex;
          align-items: center;
          gap: 18px;
          flex-wrap: wrap;
        }
        .igf-submit {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 14px 24px;
          background: #1AA3F0;
          color: #FFFFFF;
          border: 0;
          border-radius: 999px;
          font-size: 15px;
          font-weight: 700;
          letter-spacing: 0.01em;
          cursor: pointer;
          transition: background .15s ease, transform .15s ease, box-shadow .15s ease;
          box-shadow: 0 6px 16px rgba(26, 163, 240, 0.28);
        }
        .igf-submit:hover { background: #0E8AD1; transform: translateY(-1px); box-shadow: 0 10px 22px rgba(26, 163, 240, 0.35); }
        .igf-submit:active { transform: translateY(0); }
        .igf-submit:disabled { opacity: 0.65; cursor: progress; transform: none; }
        .igf-submit-arrow { font-size: 16px; }
        .igf-fineprint {
          font-size: 12px;
          color: #8A95A0;
          margin: 0;
        }

        @media (max-width: 700px) {
          .igf-form {
            padding: 22px 18px;
            border-radius: 14px;
          }
          .igf-grid {
            grid-template-columns: 1fr;
            gap: 14px;
          }
          .igf-actions {
            margin-top: 20px;
            gap: 12px;
            flex-direction: column;
            align-items: stretch;
          }
          .igf-submit {
            width: 100%;
            justify-content: center;
            padding: 16px 24px;
            font-size: 16px;
          }
          .igf-fineprint {
            text-align: center;
          }
        }
      `}</style>
    </form>
  );
}

function Field({
  label,
  hint,
  name,
  type = 'text',
  required = false,
  value,
  onChange,
  placeholder,
  textarea = false,
  fullWidth = false,
  autoComplete,
  inputMode,
}) {
  return (
    <label className={`igf-field ${fullWidth ? 'igf-field--full' : ''}`}>
      <span className="igf-label">
        {label}
        {hint && <span className="igf-hint"> · {hint}</span>}
      </span>
      {textarea ? (
        <textarea
          name={name}
          required={required}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          rows={5}
          className="igf-input igf-textarea"
        />
      ) : (
        <input
          type={type}
          name={name}
          required={required}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="igf-input"
          autoComplete={autoComplete}
          inputMode={inputMode}
        />
      )}
      <style jsx>{`
        .igf-field {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .igf-field--full { grid-column: 1 / -1; }
        .igf-label {
          font-size: 11px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #4A5560;
          font-weight: 700;
        }
        .igf-hint {
          color: #8A95A0;
          font-weight: 500;
          letter-spacing: 0.04em;
          text-transform: none;
        }
        .igf-input {
          width: 100%;
          background: #FFFFFF;
          border: 1px solid #D6DDE3;
          border-radius: 10px;
          padding: 12px 14px;
          color: #0A0A0A;
          font-size: 16px; /* 16px prevents iOS zoom-on-focus */
          font-family: inherit;
          transition: border-color .15s ease, box-shadow .15s ease;
          -webkit-appearance: none;
          appearance: none;
        }
        .igf-input::placeholder { color: #B0B8C2; }
        .igf-input:focus {
          outline: none;
          border-color: #1AA3F0;
          box-shadow: 0 0 0 3px rgba(26, 163, 240, 0.18);
        }
        .igf-textarea { resize: vertical; min-height: 120px; line-height: 1.5; }

        @media (max-width: 700px) {
          .igf-input { padding: 13px 14px; }
          .igf-textarea { min-height: 140px; }
        }
      `}</style>
    </label>
  );
}
