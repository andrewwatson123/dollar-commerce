'use client';

/**
 * User profile page — account info, saved articles, notification prefs,
 * help, and legal pages.
 */

import { useState } from 'react';
import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft, Bookmark, Bell, Settings, HelpCircle,
  ChevronDown, ChevronUp, ChevronRight, LogOut, Trash2,
} from 'lucide-react';

export default function ProfilePage({ session, userData }) {
  const router = useRouter();
  const [subView, setSubView] = useState('main');
  const [savedArticles, setSavedArticles] = useState(userData?.savedArticles || []);
  const [notifPrefs, setNotifPrefs] = useState(
    userData?.notificationPrefs || {
      newArticles: true, platformUpdates: true, marketAlerts: true,
      weeklyDigest: true, newsletter: false,
    }
  );
  const [expandedFaq, setExpandedFaq] = useState(null);

  const user = session?.user || {};
  const initials = (user.name || user.email || '?')
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const handleToggleNotif = async (key) => {
    const updated = { ...notifPrefs, [key]: !notifPrefs[key] };
    setNotifPrefs(updated);
    try {
      await fetch('/api/user/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationPrefs: updated }),
      });
    } catch { /* silent fail */ }
  };

  const handleRemoveBookmark = async (articleId) => {
    setSavedArticles((prev) => prev.filter((a) => a._id !== articleId));
    try {
      await fetch('/api/saved-articles', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ articleId }),
      });
    } catch { /* silent fail */ }
  };

  const handleSignOut = () => {
    // Clear local bookmarks on sign out so UI doesn't show them as saved
    if (typeof window !== 'undefined') {
      try { localStorage.removeItem('dc_saved_articles'); } catch {}
      window.dispatchEvent(new Event('dc-saved-changed'));
    }
    signOut({ callbackUrl: '/' });
  };

  const memberSince = userData?.createdAt
    ? new Date(userData.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : null;

  /* ── Back button ── */
  const BackButton = ({ label }) => (
    <button
      onClick={() => setSubView('main')}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 6, background: 'none',
        border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600,
        color: '#94a3b8', padding: 0, marginBottom: 28,
        letterSpacing: '0.02em',
      }}
    >
      <ArrowLeft size={14} strokeWidth={2.5} /> {label || 'Back'}
    </button>
  );

  return (
    <main data-dc="profile-wrap" style={{ maxWidth: 640, margin: '0 auto', padding: '40px 24px 80px' }}>
      {/* ════════ MAIN VIEW ════════ */}
      {subView === 'main' && (
        <>
          {/* Back to home */}
          <button
            onClick={() => router.push('/')}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6, background: 'none',
              border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600,
              color: '#94a3b8', padding: 0, marginBottom: 32,
              letterSpacing: '0.02em',
            }}
          >
            <ArrowLeft size={14} strokeWidth={2.5} /> Home
          </button>

          {/* Profile header card */}
          <div style={{
            background: '#0F172A', borderRadius: 16, padding: '32px 28px',
            marginBottom: 24, position: 'relative', overflow: 'hidden',
          }}>
            {/* Subtle decorative element */}
            <div style={{
              position: 'absolute', top: -40, right: -40,
              width: 160, height: 160, borderRadius: '50%',
              background: 'rgba(255,255,255,0.03)',
            }} />
            <div style={{
              position: 'absolute', bottom: -60, right: 40,
              width: 120, height: 120, borderRadius: '50%',
              background: 'rgba(255,255,255,0.02)',
            }} />

            <div style={{ display: 'flex', alignItems: 'center', gap: 20, position: 'relative' }}>
              {user.image ? (
                <img
                  src={user.image}
                  alt=""
                  referrerPolicy="no-referrer"
                  style={{
                    width: 64, height: 64, borderRadius: '50%', objectFit: 'cover',
                    border: '3px solid rgba(255,255,255,0.15)',
                  }}
                />
              ) : (
                <div style={{
                  width: 64, height: 64, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #D2042D, #FF6B6B)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 24, fontWeight: 700, color: '#fff',
                  border: '3px solid rgba(255,255,255,0.15)',
                }}>
                  {initials}
                </div>
              )}
              <div>
                <h1 style={{
                  fontSize: 22, fontWeight: 700, color: '#fff',
                  margin: '0 0 4px', letterSpacing: '-0.01em',
                }}>
                  {user.name || 'User'}
                </h1>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>
                  {user.email}
                </div>
                {memberSince && (
                  <div style={{
                    fontSize: 11, color: 'rgba(255,255,255,0.35)',
                    marginTop: 6, fontWeight: 500, textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}>
                    Member since {memberSince}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Menu cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 32 }}>
            <MenuCard
              icon={<Bookmark size={18} />}
              iconBg="#EEF2FF"
              iconColor="#6366F1"
              label="Saved Articles"
              sub={savedArticles.length === 0 ? 'No saved articles yet' : `${savedArticles.length} article${savedArticles.length !== 1 ? 's' : ''}`}
              onClick={() => setSubView('saved')}
            />
            <MenuCard
              icon={<Bell size={18} />}
              iconBg="#F0F9FF"
              iconColor="#0EA5E9"
              label="Notifications"
              sub="Manage your email preferences"
              onClick={() => setSubView('notifications')}
            />
            <MenuCard
              icon={<Settings size={18} />}
              iconBg="#F0FDF4"
              iconColor="#10B981"
              label="Account"
              sub="View account details"
              onClick={() => setSubView('account')}
            />
            <MenuCard
              icon={<HelpCircle size={18} />}
              iconBg="#FFFBEB"
              iconColor="#F59E0B"
              label="Help & Support"
              sub="FAQs and contact"
              onClick={() => setSubView('help')}
            />
          </div>


          {/* Sign out */}
          <button
            onClick={handleSignOut}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'none', border: '1px solid rgba(210,4,45,0.2)', borderRadius: 10,
              padding: '10px 20px', fontSize: 13, fontWeight: 600,
              color: '#D2042D', cursor: 'pointer',
              transition: 'all 150ms',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(210,4,45,0.05)';
              e.currentTarget.style.borderColor = 'rgba(210,4,45,0.35)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'none';
              e.currentTarget.style.borderColor = 'rgba(210,4,45,0.2)';
            }}
          >
            <LogOut size={14} /> Sign out
          </button>
        </>
      )}

      {/* ════════ SAVED ARTICLES ════════ */}
      {subView === 'saved' && (
        <>
          <BackButton label="Back to Profile" />
          <h2 style={{ fontSize: 22, fontWeight: 700, color: '#0F172A', margin: '0 0 20px', letterSpacing: '-0.01em' }}>
            Saved Articles
          </h2>
          {savedArticles.length === 0 ? (
            <div style={{
              background: '#fff', border: '1px solid rgba(0,0,0,0.06)', borderRadius: 14,
              padding: '56px 32px', textAlign: 'center',
            }}>
              <div style={{
                width: 48, height: 48, borderRadius: 12, background: '#F8FAFC',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: 16,
              }}>
                <Bookmark size={22} color="#cbd5e1" />
              </div>
              <p style={{ fontSize: 15, color: '#64748b', margin: '0 0 4px', fontWeight: 500 }}>No saved articles yet</p>
              <p style={{ fontSize: 13, color: '#94a3b8', margin: 0 }}>Bookmark articles to read them later</p>
            </div>
          ) : (
            <div style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.06)', borderRadius: 14, overflow: 'hidden' }}>
              {savedArticles.map((article, i) => (
                <div
                  key={article._id}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 16, padding: '14px 20px',
                    borderBottom: i < savedArticles.length - 1 ? '1px solid rgba(0,0,0,0.04)' : 'none',
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    {article.category && (
                      <div style={{ fontSize: 10, fontWeight: 700, color: '#D2042D', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 3 }}>
                        {article.category}
                      </div>
                    )}
                    <a
                      href={`/article/${article.slug}`}
                      style={{ fontSize: 14, fontWeight: 600, color: '#0F172A', textDecoration: 'none', lineHeight: 1.4 }}
                    >
                      {article.title}
                    </a>
                    <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 3 }}>
                      {article.author}{article.publishedAt ? ` · ${new Date(article.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}` : ''}
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveBookmark(article._id)}
                    style={{
                      background: 'none', border: 'none', cursor: 'pointer',
                      padding: 8, color: '#cbd5e1', borderRadius: 8,
                      transition: 'color 150ms',
                    }}
                    title="Remove bookmark"
                    onMouseEnter={(e) => e.currentTarget.style.color = '#D2042D'}
                    onMouseLeave={(e) => e.currentTarget.style.color = '#cbd5e1'}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ════════ NOTIFICATIONS ════════ */}
      {subView === 'notifications' && (
        <>
          <BackButton label="Back to Profile" />
          <h2 style={{ fontSize: 22, fontWeight: 700, color: '#0F172A', margin: '0 0 6px', letterSpacing: '-0.01em' }}>
            Notifications
          </h2>
          <p style={{ fontSize: 13, color: '#94a3b8', margin: '0 0 20px' }}>
            Choose what email notifications you receive.
          </p>
          <div style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.06)', borderRadius: 14, overflow: 'hidden' }}>
            {[
              { key: 'newArticles', label: 'New articles', desc: 'Get notified when new articles are published' },
              { key: 'platformUpdates', label: 'Platform updates', desc: 'Amazon, Shopify, Meta, and Google changes' },
              { key: 'marketAlerts', label: 'Market alerts', desc: 'DC Index movements and fundraising activity' },
              { key: 'weeklyDigest', label: 'Weekly digest', desc: "A summary of the week's top stories" },
              { key: 'newsletter', label: 'Newsletter', desc: 'Monthly deep dives and exclusive content' },
            ].map((item, i, arr) => (
              <div
                key={item.key}
                style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '14px 20px',
                  borderBottom: i < arr.length - 1 ? '1px solid rgba(0,0,0,0.04)' : 'none',
                }}
              >
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#0F172A' }}>{item.label}</div>
                  <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>{item.desc}</div>
                </div>
                <Toggle checked={notifPrefs[item.key]} onChange={() => handleToggleNotif(item.key)} />
              </div>
            ))}
          </div>
        </>
      )}

      {/* ════════ ACCOUNT ════════ */}
      {subView === 'account' && (
        <>
          <BackButton label="Back to Profile" />
          <h2 style={{ fontSize: 22, fontWeight: 700, color: '#0F172A', margin: '0 0 20px', letterSpacing: '-0.01em' }}>
            Account
          </h2>
          <div style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.06)', borderRadius: 14, overflow: 'hidden' }}>
            <Field label="Name" value={user.name || '\u2014'} />
            <Field label="Email" value={user.email || '\u2014'} />
            <Field label="Member since" value={memberSince || '\u2014'} last />
          </div>

          <div style={{ marginTop: 28 }}>
            <button
              onClick={handleSignOut}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                background: 'none', border: '1px solid rgba(210,4,45,0.2)', borderRadius: 10,
                padding: '10px 20px', fontSize: 13, fontWeight: 600,
                color: '#D2042D', cursor: 'pointer',
              }}
            >
              <LogOut size={14} /> Sign out
            </button>
          </div>
        </>
      )}

      {/* ════════ HELP ════════ */}
      {subView === 'help' && (
        <>
          <BackButton label="Back to Profile" />
          <h2 style={{ fontSize: 22, fontWeight: 700, color: '#0F172A', margin: '0 0 20px', letterSpacing: '-0.01em' }}>
            Help & Support
          </h2>
          <div style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.06)', borderRadius: 14, overflow: 'hidden' }}>
            {FAQ_ITEMS.map((item, i) => (
              <div key={i} style={{ borderBottom: i < FAQ_ITEMS.length - 1 ? '1px solid rgba(0,0,0,0.04)' : 'none' }}>
                <button
                  onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                  style={{
                    width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '14px 20px', background: 'none', border: 'none', cursor: 'pointer',
                    fontSize: 14, fontWeight: 600, color: '#0F172A', textAlign: 'left',
                  }}
                >
                  {item.q}
                  {expandedFaq === i ? <ChevronUp size={14} color="#94a3b8" /> : <ChevronDown size={14} color="#94a3b8" />}
                </button>
                {expandedFaq === i && (
                  <div style={{ padding: '0 20px 14px', fontSize: 13, color: '#64748b', lineHeight: 1.7 }}>
                    {item.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {/* ════════ LEGAL PAGES ════════ */}
      {subView.startsWith('legal-') && (
        <>
          <BackButton label="Back to Profile" />
          <h2 style={{ fontSize: 22, fontWeight: 700, color: '#0F172A', margin: '0 0 20px', letterSpacing: '-0.01em' }}>
            {subView === 'legal-terms' ? 'Terms of Service' : subView === 'legal-privacy' ? 'Privacy Policy' : 'Cookie Policy'}
          </h2>
          <div style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.06)', borderRadius: 14, padding: '24px 24px' }}>
            <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.8, margin: 0 }}>
              {subView === 'legal-terms' && 'These Terms of Service govern your use of Dollar Commerce. By accessing or using the service, you agree to be bound by these terms. Dollar Commerce provides e-commerce industry intelligence including articles, market data, and analytics tools. All content is for informational purposes only and does not constitute financial advice.'}
              {subView === 'legal-privacy' && 'Dollar Commerce respects your privacy. We collect minimal personal information (name, email) to provide account functionality. We do not sell your data to third parties. Usage analytics are collected anonymously to improve the service. You can request deletion of your account and data at any time by contacting support.'}
              {subView === 'legal-cookies' && 'Dollar Commerce uses essential cookies for authentication and session management. We use analytics cookies to understand how visitors interact with the site. You can disable non-essential cookies in your browser settings. Essential cookies are required for the site to function properly.'}
            </p>
          </div>
        </>
      )}
    </main>
  );
}

/* ── Shared UI Components ───────────────────────── */

function MenuCard({ icon, iconBg, iconColor, label, sub, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 14, width: '100%',
        background: '#fff', border: '1px solid rgba(0,0,0,0.06)', borderRadius: 14,
        padding: '16px 20px', cursor: 'pointer', textAlign: 'left',
        transition: 'box-shadow 150ms, border-color 150ms',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.06)';
        e.currentTarget.style.borderColor = 'rgba(0,0,0,0.1)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = 'none';
        e.currentTarget.style.borderColor = 'rgba(0,0,0,0.06)';
      }}
    >
      <div style={{
        width: 40, height: 40, borderRadius: 10,
        background: iconBg, color: iconColor,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        {icon}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: '#0F172A' }}>{label}</div>
        <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 1 }}>{sub}</div>
      </div>
      <ChevronRight size={16} color="#cbd5e1" />
    </button>
  );
}

function Toggle({ checked, onChange }) {
  return (
    <button
      onClick={onChange}
      style={{
        width: 44, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer',
        background: checked ? '#0F172A' : '#e2e8f0', position: 'relative',
        transition: 'background 200ms ease',
        flexShrink: 0,
      }}
    >
      <span style={{
        width: 18, height: 18, borderRadius: '50%', background: '#fff',
        position: 'absolute', top: 3,
        left: checked ? 23 : 3, transition: 'left 200ms ease',
        boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
      }} />
    </button>
  );
}

function Field({ label, value, last }) {
  return (
    <div style={{
      padding: '14px 20px',
      borderBottom: last ? 'none' : '1px solid rgba(0,0,0,0.04)',
    }}>
      <div style={{
        fontSize: 10, fontWeight: 700, color: '#94a3b8',
        textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4,
      }}>
        {label}
      </div>
      <div style={{ fontSize: 14, fontWeight: 500, color: '#0F172A' }}>{value}</div>
    </div>
  );
}

const FAQ_ITEMS = [
  { q: 'What is Dollar Commerce?', a: 'Dollar Commerce is an e-commerce industry intelligence platform providing articles, fundraising data, platform updates, and market analytics.' },
  { q: 'How do I save articles?', a: 'Click the bookmark icon on any article card or article page. Saved articles appear in your profile under "Saved Articles."' },
  { q: 'What is the DC Index?', a: 'The DC Index tracks the performance of major publicly traded e-commerce companies, providing a real-time benchmark for the industry.' },
  { q: 'How often is data updated?', a: 'Articles are published daily. The DC Index updates in real-time during market hours. Fundraising data is refreshed daily. Platform updates are tracked continuously.' },
  { q: 'How do I manage notifications?', a: 'Go to your Profile and tap "Notifications" to customize which email alerts you receive.' },
  { q: 'How do I delete my account?', a: 'Contact support at help@dollarcommerce.com and we\'ll process your account deletion request within 48 hours.' },
];
