'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { TrendingUp, TrendingDown, Search, Bell, User, Menu, Clock, Bookmark, Volume2, ChevronDown, ChevronUp, X, ArrowLeft, ChevronRight } from 'lucide-react';
import { urlFor } from '@/sanity/lib/image';
import BurgerDrawer from '@/components/BurgerDrawer';
import SideNav from '@/components/SideNav';
import TopBar from '@/components/TopBar';
import LikeButton from '@/components/LikeButton';
import BookmarkButton from '@/components/BookmarkButton';
import SiteFooter from '@/components/SiteFooter';
import SearchDrawer from '@/components/SearchDrawer';
import NewsletterSignup from '@/components/NewsletterSignup';

// Feature flag — flip to true to re-enable premium gates, paywall modal,
// PREMIUM badges, Free Plan upsell card, and Market Intelligence section.
// When false the site is entirely free/open. All the premium JSX below is
// preserved in the source — it just doesn't render.
const PREMIUM_ENABLED = false;

// Live data comes from the server page via props.
//   tickerStocks:   [{symbol, price, changePercent, ...}]  from Finnhub
//   heroArticle:    the newest article from Sanity
//   topStories:     the next ~6 most recent, for the sidebar rail
//   founderFeatures:articles in the "Features" category
//   dcIndex:        { overall:{value}, ... }             from /api/dc-index
function formatTimeAgo(iso) {
  if (!iso) return '';
  const diffMs = Date.now() - new Date(iso).getTime();
  const hours = Math.round(diffMs / 3600000);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
function heroUrl(image, w = 1200, h = 675) {
  if (!image?.asset) return null;
  try {
    return urlFor(image).width(w).height(h).url();
  } catch {
    return null;
  }
}

export default function DCHomepageDesktop({
  heroArticle = null,
  topStories = [],
  founderFeatures = [],
  dcIndex = null,
  dcIndexValue = null,
  dcIndexChange = null,
  latestArticle = null,
  latestArticles = [],
  mostReadArticles = [],
} = {}) {
  const router = useRouter();
  const [hoveredCard, setHoveredCard] = useState(null);
  const [burgerMenuOpen, setBurgerMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [currentView, setCurrentView] = useState('home');
  const [profileSubView, setProfileSubView] = useState('main');
  
  // Profile state
  const [profileName, setProfileName] = useState('Andrew Watson');
  const [profileEmail, setProfileEmail] = useState('');
  const [profilePhone, setProfilePhone] = useState('');
  const [notifNewArticles, setNotifNewArticles] = useState(true);
  const [notifPlatformUpdates, setNotifPlatformUpdates] = useState(true);
  const [notifMarketAlerts, setNotifMarketAlerts] = useState(true);
  const [notifWeeklyDigest, setNotifWeeklyDigest] = useState(true);
  const [notifNewsletter, setNotifNewsletter] = useState(false);
  
  // Saved articles state
  const [savedArticles, setSavedArticles] = useState([]);
  const [founderFeaturesPosition, setFounderFeaturesPosition] = useState(0);
  const [showPaywallModal, setShowPaywallModal] = useState(false);
  const [paywallFeature, setPaywallFeature] = useState(null);
  const [activePlatform, setActivePlatform] = useState('Amazon');
  const [expandedEvent, setExpandedEvent] = useState(null);
  const [showDowngradeModal, setShowDowngradeModal] = useState(false);
  const [activeFundingType, setActiveFundingType] = useState('Seed');
  const [activeBrandNiche, setActiveBrandNiche] = useState('All');
  const [expandedFaq, setExpandedFaq] = useState(null);
  
  const handlePremiumFeatureClick = (featureName) => {
    if (PREMIUM_ENABLED && !isPremium) {
      setPaywallFeature(featureName);
      setShowPaywallModal(true);
    } else {
      // Navigate to the premium feature
      const viewMap = {
        'Fundraising Tracker': 'fundraisingtracker',
        'DC Index': 'dcindex',
        'Platform Tracker': 'platformtracker',
        'Brand Leaderboard': 'brandleaderboard',
        'Events': 'events',
        'Consumer Sentiment': 'dcindex' // Part of DC Index
      };
      setCurrentView(viewMap[featureName] || 'home');
    }
  };
  
  const toggleBookmark = (article) => {
    setSavedArticles(prev => {
      const isAlreadySaved = prev.some(a => a.title === article.title);
      if (isAlreadySaved) {
        return prev.filter(a => a.title !== article.title);
      } else {
        return [...prev, article];
      }
    });
  };
  
  const isArticleSaved = (articleTitle) => {
    return savedArticles.some(a => a.title === articleTitle);
  };


  return (
    <div style={{ minHeight: '100vh', background: '#F4F1EA', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* Persistent desktop sidebar — hidden <1024 via CSS */}
      <SideNav />

      {/* Top Bar — DC Index CTA + latest article */}
      <TopBar
        dcIndexValue={dcIndexValue}
        dcIndexChange={dcIndexChange}
        latestArticle={latestArticle}
      />

      {/* Header */}
      <header data-dc="site-header" style={{
        background: '#F4F1EA',
        borderBottom: '1px solid #E0E0E0',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '24px 40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <button
            data-dc="burger-btn"
            onClick={() => setBurgerMenuOpen(!burgerMenuOpen)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '8px'
            }}
          >
            <Menu size={24} color="#0F172A" />
          </button>

          <div data-dc="site-title" onClick={() => setCurrentView('home')} aria-label="Dollar Commerce" style={{
            display: 'inline-flex',
            alignItems: 'center',
            cursor: 'pointer',
            lineHeight: 0,
          }}>
            <img
              src="/dc-icon-navy.svg"
              alt="Dollar Commerce"
              width={44}
              height={44}
              style={{ display: 'block', borderRadius: 10 }}
            />
          </div>

          <div data-dc="header-actions" style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <button
              onClick={() => setSearchOpen(true)}
              aria-label="Search"
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '8px'
              }}
            >
              <Search size={22} color="#0F172A" />
            </button>
            <button onClick={() => setCurrentView('profile')} style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '8px'
            }}>
              <User size={22} color="#0F172A" />
            </button>
          </div>
        </div>
      </header>

      {/* Burger Menu Drawer — shared across all pages via BurgerDrawer */}
      {burgerMenuOpen && <BurgerDrawer onClose={() => setBurgerMenuOpen(false)} />}

      {/* Search drawer */}
      {searchOpen && <SearchDrawer onClose={() => setSearchOpen(false)} />}

      {/* Paywall Modal — preserved but only renders when PREMIUM_ENABLED=true */}
      {PREMIUM_ENABLED && showPaywallModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 10000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {/* Blurred Backdrop */}
          <div 
            onClick={() => setShowPaywallModal(false)}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0,0,0,0.5)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)'
            }}
          />
          
          {/* Modal Content */}
          <div style={{
            position: 'relative',
            background: '#fff',
            borderRadius: '16px',
            padding: '48px',
            maxWidth: '500px',
            width: '90%',
            textAlign: 'center',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
          }}>
            <h2 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '16px', color: '#000' }}>
              {paywallFeature}
            </h2>
            <p style={{ fontSize: '16px', color: '#666', marginBottom: '32px', lineHeight: '1.6' }}>
              {paywallFeature === 'Fundraising Tracker' && 'E-commerce funding and deals'}
              {paywallFeature === 'DC Index' && 'Track the fastest-growing e-commerce stocks and custom DC Index performance'}
              {paywallFeature === 'Platform Tracker' && 'Track bugs, features, and earnings across Meta, Google, TikTok, Amazon, Shopify, and Pinterest'}
              {paywallFeature === 'Brand Leaderboard' && 'Discover the 50 fastest-rising consumer brands with real-time momentum scores'}
              {paywallFeature === 'Events' && 'Discover and register for exclusive e-commerce industry events worldwide'}
              {paywallFeature === 'Consumer Sentiment' && 'Track consumer confidence trends from University of Michigan'}
            </p>
            
            <div onClick={() => {
              setShowPaywallModal(false);
              setCurrentView('profile');
              setProfileSubView('main');
            }} style={{
              background: '#D2042D',
              color: '#fff',
              padding: '14px 32px',
              borderRadius: '8px',
              fontSize: '15px',
              fontWeight: '700',
              display: 'inline-block',
              marginBottom: '24px',
              cursor: 'pointer'
            }}>
              PREMIUM FEATURE
            </div>
            
            <div style={{ fontSize: '15px', color: '#999', marginBottom: '20px' }}>
              $1/month • 30-day free trial
            </div>
            
            <button 
              onClick={() => {
                setShowPaywallModal(false);
                setCurrentView('profile');
                setProfileSubView('main');
              }}
              style={{
                background: 'none',
                border: 'none',
                color: '#0F172A',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                margin: '0 auto'
              }}
            >
              Upgrade to Premium →
            </button>
          </div>
        </div>
      )}

      {/* Downgrade Confirmation Modal */}
      {PREMIUM_ENABLED && showDowngradeModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 10000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div 
            onClick={() => setShowDowngradeModal(false)}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0,0,0,0.5)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)'
            }}
          />
          
          <div style={{
            position: 'relative',
            background: '#fff',
            borderRadius: '16px',
            padding: '48px',
            maxWidth: '500px',
            width: '90%',
            textAlign: 'center',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
          }}>
            <h2 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '16px', color: '#000' }}>
              Downgrade to Standard?
            </h2>
            <p style={{ fontSize: '16px', color: '#666', marginBottom: '32px', lineHeight: '1.6' }}>
              You'll lose access to all premium features including DC Index, Platform Tracker, Brand Leaderboard, Events, and Fundraising Tracker. You can upgrade again anytime.
            </p>
            
            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                onClick={() => setShowDowngradeModal(false)}
                style={{
                  flex: 1,
                  background: '#0F172A',
                  color: '#fff',
                  border: 'none',
                  padding: '16px',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '700',
                  cursor: 'pointer'
                }}
              >
                Keep Premium
              </button>
              <button 
                onClick={() => {
                  setIsPremium(false);
                  setShowDowngradeModal(false);
                }}
                style={{
                  flex: 1,
                  background: '#fff',
                  color: '#666',
                  border: '2px solid #E0E0E0',
                  padding: '16px',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '700',
                  cursor: 'pointer'
                }}
              >
                Downgrade
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONDITIONAL RENDERING - HOME OR PROFILE */}
      {currentView === 'home' && (
      <main data-dc="home-main" style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '40px'
      }}>
        {/* Hero Section */}
        <div data-dc="hero-grid" style={{
          display: 'grid',
          gridTemplateColumns: '1.8fr 1fr',
          gap: '40px',
          marginBottom: '32px'
        }}>
          {/* Main Story — live from Sanity */}
          <Link
            href={heroArticle ? `/article/${heroArticle.slug}` : '#'}
            style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
          >
            <div data-dc="hero-image" style={{
              width: '100%',
              height: '440px',
              background: heroUrl(heroArticle?.heroImage)
                ? `#eee center/cover no-repeat url(${heroUrl(heroArticle?.heroImage, 1600, 900)})`
                : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '4px',
              marginBottom: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '48px'
            }}>
              {!heroUrl(heroArticle?.heroImage) && '📊'}
            </div>
            <div style={{
              fontSize: '11px',
              fontWeight: '700',
              color: heroArticle?.category?.color || '#D2042D',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              marginBottom: '16px'
            }}>
              {heroArticle?.category?.title || 'E-Commerce'}
            </div>
            <h1 data-dc="hero-title" style={{
              fontSize: '34px',
              fontWeight: '700',
              lineHeight: '1.2',
              marginBottom: '16px',
              color: '#000'
            }}>
              {heroArticle?.title || "Meta's advertising platform faces unprecedented creative generation challenge"}
            </h1>
            <p data-dc="hero-excerpt" style={{
              fontSize: '18px',
              lineHeight: '1.6',
              color: '#666',
              marginBottom: '16px'
            }}>
              {heroArticle?.excerpt || heroArticle?.subtitle || "As AI-powered creative tools proliferate, Meta's Advantage+ campaigns show signs of creative fatigue."}
            </p>
            <div style={{
              display: 'flex',
              gap: '16px',
              alignItems: 'center',
              fontSize: '14px',
              color: '#666'
            }}>
              <span style={{ fontWeight: '600', color: '#0F172A' }}>{heroArticle?.author?.name || 'Andrew Watson'}</span>
              <span>•</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Clock size={14} />
                {formatTimeAgo(heroArticle?.publishedAt)}
              </span>
            </div>
          </Link>

          {/* STICKY Sidebar - Top Stories */}
          <div data-dc="top-stories" style={{ position: 'sticky', top: '120px', alignSelf: 'flex-start' }}>
            <h3 style={{
              fontSize: '14px',
              fontWeight: '600',
              color: '#666',
              marginBottom: '24px',
              paddingBottom: '12px',
              borderBottom: '1px solid #E0E0E0',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              TOP STORIES
            </h3>

            {topStories.map((story) => (
              <Link
                key={story._id}
                href={`/article/${story.slug}`}
                style={{
                  display: 'block',
                  padding: '16px 0',
                  borderBottom: '1px solid #E0E0E0',
                  textDecoration: 'none',
                  color: 'inherit',
                }}
              >
                <div style={{
                  fontSize: '11px',
                  fontWeight: '700',
                  color: story.category?.color || '#D2042D',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  marginBottom: '8px'
                }}>
                  {story.category?.title}
                </div>
                <h4 style={{
                  fontSize: '16px',
                  fontWeight: '700',
                  lineHeight: '1.4',
                  marginBottom: '8px',
                  color: '#000'
                }}>
                  {story.title}
                </h4>
                <div style={{
                  fontSize: '13px',
                  color: '#999',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <span style={{ fontWeight: '600', color: '#666' }}>{story.author?.name}</span>
                  <span>•</span>
                  <Clock size={12} />
                  <span>{formatTimeAgo(story.publishedAt)}</span>
                </div>
              </Link>
            ))}

          </div>
        </div>

        {/* Market Intelligence Section — hidden when PREMIUM_ENABLED=false */}
        {PREMIUM_ENABLED && (
        <section style={{ marginBottom: '48px' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '32px',
            paddingBottom: '16px',
            borderBottom: '1px solid #E0E0E0'
          }}>
            <h2 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#666',
              margin: 0,
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              MARKET INTELLIGENCE
            </h2>
            <div style={{
              display: 'inline-block',
              background: '#D2042D',
              color: '#fff',
              padding: '6px 12px',
              fontSize: '11px',
              fontWeight: '700',
              textTransform: 'uppercase',
              borderRadius: '4px'
            }}>
              PREMIUM
            </div>
          </div>

          <div data-dc="grid-4" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '20px'
          }}>
            {[
              {
                title: "Fundraising Tracker",
                desc: "Latest venture rounds and M&A activity",
                metric: "$2.3B",
                label: "Raised this month",
                change: "+12%",
                isPositive: true,
                featureName: "Fundraising Tracker"
              },
              {
                title: "DC Index",
                desc: "19-stock e-commerce basket, rebased to 100 on Jan 2, 2024",
                metric: dcIndex?.overall?.value ? dcIndex.overall.value.toFixed(2) : '—',
                label: "Index level (base = 100)",
                change: dcIndex?.overall?.value
                  ? `${((dcIndex.overall.value - 100) >= 0 ? '+' : '')}${(dcIndex.overall.value - 100).toFixed(2)}%`
                  : '',
                isPositive: (dcIndex?.overall?.value ?? 100) >= 100,
                featureName: "DC Index"
              },
              {
                title: "Platform Tracker",
                desc: "Meta, Google, TikTok feature releases",
                metric: "12",
                label: "Updates this week",
                change: "+3",
                isPositive: true,
                featureName: "Platform Tracker"
              },
              {
                title: "Consumer Sentiment",
                desc: "University of Michigan index",
                metric: "73.2",
                label: "Current reading",
                change: "+2.8%",
                isPositive: true,
                featureName: "Consumer Sentiment"
              }
            ].map((card, i) => (
              <div
                key={i}
                onClick={() => handlePremiumFeatureClick(card.featureName)}
                onMouseEnter={() => setHoveredCard(i)}
                onMouseLeave={() => setHoveredCard(null)}
                style={{
                  background: '#fff',
                  border: '1px solid #E0E0E0',
                  borderRadius: '8px',
                  padding: '24px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  transform: hoveredCard === i ? 'translateY(-4px)' : 'none',
                  boxShadow: hoveredCard === i ? '0 8px 24px rgba(0,0,0,0.12)' : '0 2px 4px rgba(0,0,0,0.04)'
                }}
              >
                <h3 style={{
                  fontSize: '16px',
                  fontWeight: '700',
                  marginBottom: '10px',
                  color: '#0F172A'
                }}>
                  {card.title}
                </h3>
                <p style={{
                  fontSize: '13px',
                  color: '#666',
                  marginBottom: '20px',
                  lineHeight: '1.4',
                  minHeight: '36px'
                }}>
                  {card.desc}
                </p>
                <div style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  gap: '6px',
                  marginBottom: '4px'
                }}>
                  <div style={{
                    fontSize: '28px',
                    fontWeight: '700',
                    color: '#0F172A'
                  }}>
                    {card.metric}
                  </div>
                  <div style={{
                    fontSize: '13px',
                    fontWeight: '600',
                    color: card.isPositive ? '#10b981' : '#ef4444'
                  }}>
                    {card.change}
                  </div>
                </div>
                <div style={{
                  fontSize: '11px',
                  color: '#999',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  {card.label}
                </div>
              </div>
            ))}
          </div>
        </section>
        )}

        {/* Founder Features */}
        <section style={{ marginBottom: '48px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', paddingBottom: '16px', borderBottom: '1px solid #E0E0E0' }}>
            <h2 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#666',
              margin: 0,
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              FOUNDER FEATURES
            </h2>
            <button onClick={() => router.push('/category/features')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px', display: 'flex', alignItems: 'center', gap: '4px', color: '#666' }}>
              <ChevronRight size={20} />
            </button>
          </div>

          <div style={{ position: 'relative' }}>
            <div style={{
              display: 'flex',
              gap: '20px',
              overflowX: 'auto',
              scrollBehavior: 'smooth',
              scrollSnapType: 'x mandatory',
              WebkitOverflowScrolling: 'touch',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              padding: '4px 0',
            }}>
              <style>{`div::-webkit-scrollbar { display: none; }`}</style>
              {(founderFeatures.length > 0 ? founderFeatures : []).map((article) => {
                const imgUrl = heroUrl(article.heroImage, 600, 400);
                return (
                  <Link
                    key={article._id}
                    href={`/article/${article.slug}`}
                    style={{
                      display: 'block',
                      minWidth: '320px',
                      maxWidth: '320px',
                      scrollSnapAlign: 'start',
                      textDecoration: 'none',
                      color: 'inherit',
                      background: '#fff',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      border: '1px solid #f0f0f0',
                      flexShrink: 0,
                    }}
                  >
                    <div style={{
                      width: '100%',
                      height: '200px',
                      background: imgUrl
                        ? `#eee center/cover no-repeat url(${imgUrl})`
                        : 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                    }} />
                    <div style={{ padding: '16px 18px' }}>
                      <div style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        color: article.category?.color || '#D2042D',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        marginBottom: '8px',
                      }}>
                        {article.category?.title}
                      </div>
                      <h3 style={{
                        fontSize: '18px',
                        fontWeight: 700,
                        lineHeight: 1.3,
                        margin: '0 0 8px',
                        color: '#0F172A',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}>
                        {article.title}
                      </h3>
                      <p style={{
                        fontSize: '13px',
                        lineHeight: 1.5,
                        color: '#666',
                        margin: '0 0 12px',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}>
                        {article.excerpt}
                      </p>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontSize: '12px',
                        color: '#999',
                      }}>
                        <span style={{ fontWeight: 600, color: '#0F172A' }}>{article.author?.name}</span>
                        <span>·</span>
                        <Clock size={11} />
                        <span>{formatTimeAgo(article.publishedAt)}</span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        {/* Latest News Grid */}
        <section style={{ marginBottom: '48px' }}>
          <div data-dc="grid-2" style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1fr',
            gap: '40px'
          }}>
            {/* Main News Feed */}
            <div>
              <h2 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#666',
                marginBottom: '32px',
                paddingBottom: '16px',
                borderBottom: '1px solid #E0E0E0',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                LATEST
              </h2>

              {latestArticles.map((item) => (
                <Link
                  key={item._id}
                  href={`/article/${item.slug}`}
                  style={{
                    display: 'block',
                    padding: '24px 0',
                    borderBottom: '1px solid #E0E0E0',
                    textDecoration: 'none',
                    color: 'inherit',
                  }}
                >
                  <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                    {item.heroImage?.asset && (
                      <div style={{
                        width: '140px',
                        height: '100px',
                        background: `#e2e8f0 center/cover no-repeat url(${heroUrl(item.heroImage, 280, 200)})`,
                        borderRadius: '6px',
                        flexShrink: 0
                      }} />
                    )}
                    <div data-dc="latest-card-body" style={{ flex: 1, minWidth: 0 }}>
                      <div data-dc="latest-card-top" style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '8px',
                        marginBottom: '6px'
                      }}>
                        <div style={{
                          fontSize: '11px',
                          fontWeight: '700',
                          color: item.category?.color || '#D2042D',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px'
                        }}>
                          {item.category?.title}
                        </div>
                        <div data-dc="latest-card-actions" style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#999' }}>
                          <LikeButton slug={item.slug} initialCount={item.likeCount || 0} size={16} color="#999" />
                        </div>
                      </div>
                      <h3 style={{
                        fontSize: '18px',
                        fontWeight: '700',
                        lineHeight: '1.4',
                        marginBottom: '8px',
                        color: '#000'
                      }}>
                        {item.title}
                      </h3>
                      <div data-dc="latest-card-meta" style={{
                        fontSize: '13px',
                        color: '#666',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        flexWrap: 'wrap'
                      }}>
                        <span style={{ fontWeight: '600', color: '#0F172A' }}>{item.author?.name}</span>
                        <span>•</span>
                        <Clock size={12} />
                        <span style={{ whiteSpace: 'nowrap' }}>{formatTimeAgo(item.publishedAt)}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Sidebar */}
            <div>
              <h3 style={{
                fontSize: '14px',
                fontWeight: '600',
                color: '#666',
                marginBottom: '24px',
                paddingBottom: '12px',
                borderBottom: '1px solid #E0E0E0',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                MOST READ
              </h3>

              {mostReadArticles.map((article, i) => (
                <Link
                  key={article._id}
                  href={`/article/${article.slug}`}
                  style={{
                    display: 'flex',
                    padding: '16px 0',
                    borderBottom: '1px solid #E0E0E0',
                    gap: '12px',
                    textDecoration: 'none',
                    color: 'inherit',
                  }}
                >
                  <div style={{
                    fontSize: '24px',
                    fontWeight: '700',
                    color: '#D2042D',
                    minWidth: '30px'
                  }}>
                    {i + 1}
                  </div>
                  <h4 style={{
                    fontSize: '15px',
                    fontWeight: '700',
                    lineHeight: '1.4',
                    color: '#000'
                  }}>
                    {article.title}
                  </h4>
                </Link>
              ))}

              {/* Newsletter Signup — wired to Beehiiv via /api/subscribe */}
              <div style={{ marginTop: '40px' }}>
                <NewsletterSignup variant="dark" />
              </div>
            </div>
          </div>
        </section>
      </main>
      )}

      {/* PROFILE VIEW */}
      {currentView === 'profile' && (
        <main style={{ maxWidth: '900px', margin: '0 auto', padding: '40px' }}>
          {profileSubView === 'main' && (
            <div>
              {/* Profile Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '40px' }}>
                <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', fontWeight: '700', color: '#fff' }}>
                  AW
                </div>
                <div>
                  <h1 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '4px' }}>{profileName}</h1>
                  <div style={{ fontSize: '16px', color: '#666' }}>{profileEmail}</div>
                </div>
              </div>

              {/* Upgrade to Premium Card — hidden when PREMIUM_ENABLED=false */}
              {PREMIUM_ENABLED && !isPremium && (
                <div style={{ background: '#fff', border: '2px solid #E0E0E0', borderRadius: '12px', padding: '32px', marginBottom: '32px' }}>
                  <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '16px' }}>Upgrade to Premium</h2>
                  <p style={{ fontSize: '15px', color: '#666', marginBottom: '24px' }}>Start your 30-day free trial</p>
                  
                  <div style={{ borderTop: '1px solid #E0E0E0', paddingTop: '20px', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0' }}>
                      <span style={{ fontSize: '15px' }}>Unlimited articles</span>
                      <span style={{ fontSize: '14px', color: '#999' }}>vs 2 per day</span>
                    </div>
                    <div style={{ padding: '10px 0', fontSize: '15px' }}>Ad-free experience</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0' }}>
                      <span style={{ fontSize: '15px' }}>DC Platform Tracker</span>
                      <span style={{ background: '#D2042D', color: '#fff', fontSize: '10px', fontWeight: '700', padding: '3px 8px', borderRadius: '4px' }}>Premium</span>
                    </div>
                    <div style={{ padding: '10px 0', fontSize: '15px' }}>Exclusive insights</div>
                    <div style={{ padding: '10px 0', fontSize: '15px' }}>Early access</div>
                  </div>

                  <div style={{ borderTop: '1px solid #E0E0E0', paddingTop: '20px', marginBottom: '24px' }}>
                    <div style={{ fontSize: '40px', fontWeight: '700', marginBottom: '4px' }}>
                      $1<span style={{ fontSize: '20px', color: '#666' }}>/month</span>
                    </div>
                    <div style={{ fontSize: '15px', color: '#666' }}>After 30-day free trial</div>
                  </div>

                  <button onClick={() => setIsPremium(true)} style={{ width: '100%', background: '#0F172A', color: '#fff', border: 'none', padding: '16px', borderRadius: '8px', fontSize: '16px', fontWeight: '700', cursor: 'pointer', marginBottom: '12px' }}>
                    Start Free Trial
                  </button>
                  <div style={{ fontSize: '13px', color: '#999', textAlign: 'center' }}>Cancel anytime during trial</div>
                </div>
              )}

              {/* Premium Member Card — hidden when PREMIUM_ENABLED=false */}
              {PREMIUM_ENABLED && isPremium && (
                <div style={{ marginBottom: '32px' }}>
                  <div style={{ background: '#fff', border: '2px solid #E0E0E0', borderRadius: '12px', padding: '32px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                      <h2 style={{ fontSize: '24px', fontWeight: '700', margin: 0 }}>Premium Member</h2>
                      <div style={{ background: '#0F172A', color: '#fff', padding: '8px 16px', borderRadius: '6px', fontSize: '13px', fontWeight: '700' }}>
                        ACTIVE
                      </div>
                    </div>
                    <p style={{ fontSize: '16px', color: '#666', marginBottom: '24px' }}>Unlimited access to all content</p>
                    
                    <div style={{ borderTop: '1px solid #E0E0E0', paddingTop: '20px', marginBottom: '20px' }}>
                      <div style={{ fontSize: '15px', color: '#666', marginBottom: '8px' }}>$1.00/month</div>
                      <div style={{ fontSize: '15px', color: '#666' }}>Next billing: March 11, 2026</div>
                    </div>

                    <button onClick={() => setShowDowngradeModal(true)} style={{
                      width: '100%',
                      background: '#fff',
                      color: '#666',
                      border: '2px solid #E0E0E0',
                      padding: '14px',
                      borderRadius: '8px',
                      fontSize: '16px',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}>
                      Downgrade to Standard
                    </button>
                  </div>
                </div>
              )}

              {/* Saved Articles */}
              <div style={{ marginBottom: '32px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '20px' }}>Saved Articles</h2>
                <div onClick={() => setProfileSubView('saved')} style={{ background: '#fff', border: '1px solid #E0E0E0', borderRadius: '12px', padding: '24px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '4px' }}>
                      {savedArticles.length === 0 ? 'No saved articles yet' : `${savedArticles.length} saved article${savedArticles.length !== 1 ? 's' : ''}`}
                    </h3>
                    <p style={{ fontSize: '14px', color: '#666' }}>
                      {savedArticles.length === 0 ? 'Bookmark articles to read them later' : 'View your bookmarked articles'}
                    </p>
                  </div>
                  <ArrowLeft size={20} style={{ transform: 'rotate(180deg)', color: '#666' }} />
                </div>
              </div>

              {/* Settings */}
              <div style={{ marginBottom: '32px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '20px' }}>Settings</h2>
                
                <div onClick={() => setProfileSubView('notifications')} style={{ background: '#fff', border: '1px solid #E0E0E0', borderRadius: '12px', padding: '24px', marginBottom: '16px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '4px' }}>Notifications</h3>
                    <p style={{ fontSize: '14px', color: '#666' }}>Manage your notification preferences</p>
                  </div>
                  <ArrowLeft size={20} style={{ transform: 'rotate(180deg)', color: '#666' }} />
                </div>

                <div onClick={() => setProfileSubView('account')} style={{ background: '#fff', border: '1px solid #E0E0E0', borderRadius: '12px', padding: '24px', marginBottom: '16px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '4px' }}>Account</h3>
                    <p style={{ fontSize: '14px', color: '#666' }}>Update your profile and preferences</p>
                  </div>
                  <ArrowLeft size={20} style={{ transform: 'rotate(180deg)', color: '#666' }} />
                </div>

                <div onClick={() => setProfileSubView('help')} style={{ background: '#fff', border: '1px solid #E0E0E0', borderRadius: '12px', padding: '24px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '4px' }}>Help & Support</h3>
                    <p style={{ fontSize: '14px', color: '#666' }}>FAQs and support resources</p>
                  </div>
                  <ArrowLeft size={20} style={{ transform: 'rotate(180deg)', color: '#666' }} />
                </div>
              </div>

              {/* Legal & Privacy */}
              <div>
                <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '20px' }}>Legal & Privacy</h2>
                
                <div onClick={() => setProfileSubView('legal-terms')} style={{ background: '#fff', border: '1px solid #E0E0E0', borderRadius: '12px', padding: '24px', marginBottom: '16px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '700' }}>Terms of Service</h3>
                  <ArrowLeft size={20} style={{ transform: 'rotate(180deg)', color: '#666' }} />
                </div>

                <div onClick={() => setProfileSubView('legal-privacy')} style={{ background: '#fff', border: '1px solid #E0E0E0', borderRadius: '12px', padding: '24px', marginBottom: '16px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '700' }}>Privacy Policy</h3>
                  <ArrowLeft size={20} style={{ transform: 'rotate(180deg)', color: '#666' }} />
                </div>

                <div onClick={() => setProfileSubView('legal-cookies')} style={{ background: '#fff', border: '1px solid #E0E0E0', borderRadius: '12px', padding: '24px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '700' }}>Cookie Policy</h3>
                  <ArrowLeft size={20} style={{ transform: 'rotate(180deg)', color: '#666' }} />
                </div>
              </div>
            </div>
          )}

          {/* Notifications Subview */}
          {profileSubView === 'notifications' && (
            <div>
              <button onClick={() => setProfileSubView('main')} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '32px', padding: 0 }}>
                <ArrowLeft size={20} />
                <span style={{ fontSize: '16px' }}>Back</span>
              </button>

              <h1 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '32px' }}>Notifications</h1>

              <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '20px' }}>Push Notifications</h2>
              
              <div style={{ background: '#fff', border: '1px solid #E0E0E0', borderRadius: '12px', padding: '24px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', paddingBottom: '24px', borderBottom: '1px solid #E0E0E0' }}>
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '6px' }}>New Articles</h3>
                    <p style={{ fontSize: '14px', color: '#666' }}>Get notified when new articles are published</p>
                  </div>
                  <button onClick={() => setNotifNewArticles(!notifNewArticles)} style={{ width: '60px', height: '32px', borderRadius: '16px', border: 'none', background: notifNewArticles ? '#0F172A' : '#E0E0E0', position: 'relative', cursor: 'pointer', transition: 'background 0.2s' }}>
                    <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#fff', position: 'absolute', top: '4px', left: notifNewArticles ? '32px' : '4px', transition: 'left 0.2s' }} />
                  </button>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', paddingBottom: '24px', borderBottom: '1px solid #E0E0E0' }}>
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '6px' }}>Platform Updates</h3>
                    <p style={{ fontSize: '14px', color: '#666' }}>Updates from Platform Tracker</p>
                  </div>
                  <button onClick={() => setNotifPlatformUpdates(!notifPlatformUpdates)} style={{ width: '60px', height: '32px', borderRadius: '16px', border: 'none', background: notifPlatformUpdates ? '#0F172A' : '#E0E0E0', position: 'relative', cursor: 'pointer', transition: 'background 0.2s' }}>
                    <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#fff', position: 'absolute', top: '4px', left: notifPlatformUpdates ? '32px' : '4px', transition: 'left 0.2s' }} />
                  </button>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', paddingBottom: '24px', borderBottom: '1px solid #E0E0E0' }}>
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '6px' }}>Market Alerts</h3>
                    <p style={{ fontSize: '14px', color: '#666' }}>Important changes in DC Index</p>
                  </div>
                  <button onClick={() => setNotifMarketAlerts(!notifMarketAlerts)} style={{ width: '60px', height: '32px', borderRadius: '16px', border: 'none', background: notifMarketAlerts ? '#0F172A' : '#E0E0E0', position: 'relative', cursor: 'pointer', transition: 'background 0.2s' }}>
                    <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#fff', position: 'absolute', top: '4px', left: notifMarketAlerts ? '32px' : '4px', transition: 'left 0.2s' }} />
                  </button>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '6px' }}>Weekly Digest</h3>
                    <p style={{ fontSize: '14px', color: '#666' }}>Summary of top articles each week</p>
                  </div>
                  <button onClick={() => setNotifWeeklyDigest(!notifWeeklyDigest)} style={{ width: '60px', height: '32px', borderRadius: '16px', border: 'none', background: notifWeeklyDigest ? '#0F172A' : '#E0E0E0', position: 'relative', cursor: 'pointer', transition: 'background 0.2s' }}>
                    <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#fff', position: 'absolute', top: '4px', left: notifWeeklyDigest ? '32px' : '4px', transition: 'left 0.2s' }} />
                  </button>
                </div>
              </div>

              <h2 style={{ fontSize: '20px', fontWeight: '700', marginTop: '32px', marginBottom: '20px' }}>Email Notifications</h2>
              
              <div style={{ background: '#fff', border: '1px solid #E0E0E0', borderRadius: '12px', padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '6px' }}>Newsletter</h3>
                    <p style={{ fontSize: '14px', color: '#666' }}>Weekly newsletter with highlights</p>
                  </div>
                  <button onClick={() => setNotifNewsletter(!notifNewsletter)} style={{ width: '60px', height: '32px', borderRadius: '16px', border: 'none', background: notifNewsletter ? '#0F172A' : '#E0E0E0', position: 'relative', cursor: 'pointer', transition: 'background 0.2s' }}>
                    <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#fff', position: 'absolute', top: '4px', left: notifNewsletter ? '32px' : '4px', transition: 'left 0.2s' }} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Account Subview */}
          {profileSubView === 'account' && (
            <div>
              <button onClick={() => setProfileSubView('main')} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '32px', padding: 0 }}>
                <ArrowLeft size={20} />
                <span style={{ fontSize: '16px' }}>Back</span>
              </button>

              <h1 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '32px' }}>Account</h1>

              <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '20px' }}>Personal Information</h2>
              
              <div style={{ background: '#fff', border: '1px solid #E0E0E0', borderRadius: '12px', padding: '32px', marginBottom: '32px' }}>
                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', fontSize: '14px', color: '#666', marginBottom: '8px' }}>Full Name</label>
                  <input type="text" value={profileName} onChange={(e) => setProfileName(e.target.value)} style={{ width: '100%', padding: '12px', fontSize: '16px', border: '1px solid #E0E0E0', borderRadius: '8px', boxSizing: 'border-box' }} />
                </div>

                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', fontSize: '14px', color: '#666', marginBottom: '8px' }}>Email</label>
                  <input type="email" value={profileEmail} onChange={(e) => setProfileEmail(e.target.value)} style={{ width: '100%', padding: '12px', fontSize: '16px', border: '1px solid #E0E0E0', borderRadius: '8px', boxSizing: 'border-box' }} />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '14px', color: '#666', marginBottom: '8px' }}>Phone</label>
                  <input type="tel" value={profilePhone} onChange={(e) => setProfilePhone(e.target.value)} style={{ width: '100%', padding: '12px', fontSize: '16px', border: '1px solid #E0E0E0', borderRadius: '8px', boxSizing: 'border-box' }} />
                </div>
              </div>

              <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '20px' }}>Preferences</h2>
              
              <div style={{ background: '#fff', border: '1px solid #E0E0E0', borderRadius: '12px', padding: '24px', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '6px' }}>Language</h3>
                <p style={{ fontSize: '14px', color: '#666' }}>English (US)</p>
              </div>

              <div style={{ background: '#fff', border: '1px solid #E0E0E0', borderRadius: '12px', padding: '24px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '6px' }}>Time Zone</h3>
                <p style={{ fontSize: '14px', color: '#666' }}>GMT (London)</p>
              </div>
            </div>
          )}

          {/* Saved Articles Subview */}
          {profileSubView === 'saved' && (
            <div>
              <button onClick={() => setProfileSubView('main')} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '32px', padding: 0 }}>
                <ArrowLeft size={20} />
                <span style={{ fontSize: '16px' }}>Back</span>
              </button>

              <h1 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '32px' }}>Saved Articles</h1>

              {savedArticles.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '80px 40px' }}>
                  <div style={{ fontSize: '64px', marginBottom: '24px' }}>📖</div>
                  <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '12px', color: '#0F172A' }}>No saved articles yet</h2>
                  <p style={{ fontSize: '16px', color: '#666' }}>Bookmark articles to read them later</p>
                </div>
              ) : (
                <div style={{ background: '#fff', border: '1px solid #E0E0E0', borderRadius: '12px', overflow: 'hidden' }}>
                  {savedArticles.map((article, i) => (
                    <div key={i} style={{ padding: '24px', borderBottom: i < savedArticles.length - 1 ? '1px solid #E0E0E0' : 'none', cursor: 'pointer' }}>
                      <div style={{ fontSize: '11px', fontWeight: '700', color: '#D2042D', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>{article.cat}</div>
                      <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '8px', color: '#000' }}>{article.title}</h3>
                      <div style={{ fontSize: '14px', color: '#666', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontWeight: '600', color: '#0F172A' }}>{article.author}</span>
                        <span>•</span>
                        <span>{article.time}</span>
                        <div style={{ flex: 1 }} />
                        <button onClick={(e) => { e.stopPropagation(); toggleBookmark(article); }} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}>
                          <Bookmark size={18} color="#D2042D" fill="#D2042D" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Help & Support (FAQ) Subview */}
          {profileSubView === 'help' && (
            <div>
              <button onClick={() => setProfileSubView('main')} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '32px', padding: 0 }}>
                <ArrowLeft size={20} />
                <span style={{ fontSize: '16px' }}>Back</span>
              </button>

              <h1 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '32px' }}>Help & Support</h1>

              <div style={{ background: '#fff', border: '1px solid #E0E0E0', borderRadius: '12px', overflow: 'hidden' }}>
                {[
                  { q: 'What is Dollar Commerce Premium?', a: 'Dollar Commerce Premium gives you unlimited access to all premium features including DC Index Tracker, Platform Tracker, Fundraising Tracker, Brand Leaderboard, and Events. You also get ad-free reading and early access to new features.' },
                  { q: 'How much does Premium cost?', a: 'Premium costs $1/month after a 30-day free trial. You can cancel anytime during or after the trial period with no commitment.' },
                  { q: 'How do I cancel my subscription?', a: 'You can downgrade to Standard anytime from your Profile page. Click on your profile icon, scroll to the Premium Member card, and click "Downgrade to Standard". Your premium access will continue until the end of your current billing period.' },
                  { q: 'What happens when I downgrade?', a: 'When you downgrade to Standard, you\'ll lose access to premium features but keep your saved articles and preferences. You can upgrade again anytime to restore full access.' },
                  { q: 'How often is data updated?', a: 'DC Index updates in real-time during market hours. Platform Tracker updates are added within hours of official announcements. Fundraising Tracker updates daily. Brand Leaderboard updates every morning at 9:30 AM ET.' },
                  { q: 'Can I share my Premium account?', a: 'Premium subscriptions are for individual use only. Each user needs their own Premium subscription to access premium features.' },
                  { q: 'What payment methods do you accept?', a: 'We accept all major credit cards (Visa, Mastercard, American Express, Discover) and PayPal. All payments are processed securely through Stripe.' },
                  { q: 'Do you offer refunds?', a: 'We offer full refunds within 14 days of your first charge if you\'re not satisfied with Premium. After 14 days, refunds are evaluated on a case-by-case basis.' },
                  { q: 'How do I update my payment information?', a: 'Go to Profile > Account > Payment Information to update your credit card or billing details. Changes take effect immediately.' },
                  { q: 'I found a bug or have feedback. How do I report it?', a: 'We\'d love to hear from you! Email us at support@dollarcommerce.com with your feedback or bug report. We read every message and typically respond within 24 hours.' }
                ].map((faq, i) => (
                  <div key={i} style={{ borderBottom: i < 9 ? '1px solid #E0E0E0' : 'none' }}>
                    <button
                      onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                      style={{
                        width: '100%',
                        background: 'none',
                        border: 'none',
                        padding: '24px',
                        textAlign: 'left',
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0F172A', margin: 0 }}>{faq.q}</h3>
                      <div style={{ fontSize: '18px', color: '#666', marginLeft: '16px' }}>{expandedFaq === i ? '−' : '+'}</div>
                    </button>
                    {expandedFaq === i && (
                      <div style={{ padding: '0 24px 24px 24px', fontSize: '15px', color: '#666', lineHeight: '1.6' }}>
                        {faq.a}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div style={{ marginTop: '32px', background: '#F9FAFB', border: '1px solid #E0E0E0', borderRadius: '12px', padding: '32px', textAlign: 'center' }}>
                <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '12px' }}>Still need help?</h3>
                <p style={{ fontSize: '15px', color: '#666', marginBottom: '20px' }}>Contact our support team and we'll get back to you within 24 hours.</p>
                <button style={{ background: '#0F172A', color: '#fff', border: 'none', padding: '14px 32px', borderRadius: '8px', fontSize: '16px', fontWeight: '700', cursor: 'pointer' }}>
                  Contact Support
                </button>
              </div>
            </div>
          )}

          {/* Terms of Service Subview */}
          {profileSubView === 'legal-terms' && (
            <div>
              <button onClick={() => setProfileSubView('main')} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '32px', padding: 0 }}>
                <ArrowLeft size={20} />
                <span style={{ fontSize: '16px' }}>Back</span>
              </button>

              <div style={{ background: '#fff', border: '1px solid #E0E0E0', borderRadius: '12px', padding: '48px', maxWidth: '900px', margin: '0 auto' }}>
                <h1 style={{ fontSize: '36px', fontWeight: '700', marginBottom: '12px' }}>Terms of Service</h1>
                <p style={{ fontSize: '14px', color: '#999', marginBottom: '32px' }}>Last updated: March 27, 2026</p>

                <div style={{ fontSize: '15px', lineHeight: '1.8', color: '#333' }}>
                  <h2 style={{ fontSize: '24px', fontWeight: '700', marginTop: '32px', marginBottom: '16px' }}>1. Acceptance of Terms</h2>
                  <p style={{ marginBottom: '16px' }}>By accessing and using Dollar Commerce ("Service"), you accept and agree to be bound by the terms and provision of this agreement. Tiger Global Technologies Ltd ("Company", "we", "us", or "our") operates this service.</p>

                  <h2 style={{ fontSize: '24px', fontWeight: '700', marginTop: '32px', marginBottom: '16px' }}>2. Use License</h2>
                  <p style={{ marginBottom: '16px' }}>Permission is granted to temporarily access the materials (information or software) on Dollar Commerce for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title.</p>

                  <h2 style={{ fontSize: '24px', fontWeight: '700', marginTop: '32px', marginBottom: '16px' }}>3. Premium Subscription</h2>
                  <p style={{ marginBottom: '16px' }}>Premium subscriptions are billed monthly at $1.00 USD. Subscriptions automatically renew unless cancelled before the renewal date. You may cancel your subscription at any time from your account settings. Upon cancellation, you will retain premium access until the end of your current billing period.</p>

                  <h2 style={{ fontSize: '24px', fontWeight: '700', marginTop: '32px', marginBottom: '16px' }}>4. User Accounts</h2>
                  <p style={{ marginBottom: '16px' }}>You are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all activities that occur under your account.</p>

                  <h2 style={{ fontSize: '24px', fontWeight: '700', marginTop: '32px', marginBottom: '16px' }}>5. Prohibited Uses</h2>
                  <p style={{ marginBottom: '16px' }}>You may not use the Service for any unlawful purpose or to solicit others to perform or participate in any unlawful acts. You may not transmit any worms or viruses or any code of a destructive nature.</p>

                  <h2 style={{ fontSize: '24px', fontWeight: '700', marginTop: '32px', marginBottom: '16px' }}>6. Disclaimer</h2>
                  <p style={{ marginBottom: '16px' }}>The materials on Dollar Commerce are provided on an 'as is' basis. We make no warranties, expressed or implied, and hereby disclaim and negate all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.</p>

                  <h2 style={{ fontSize: '24px', fontWeight: '700', marginTop: '32px', marginBottom: '16px' }}>7. Limitations</h2>
                  <p style={{ marginBottom: '16px' }}>In no event shall Tiger Global Technologies Ltd or its suppliers be liable for any damages arising out of the use or inability to use the materials on Dollar Commerce.</p>

                  <h2 style={{ fontSize: '24px', fontWeight: '700', marginTop: '32px', marginBottom: '16px' }}>8. Governing Law</h2>
                  <p style={{ marginBottom: '16px' }}>These terms and conditions are governed by and construed in accordance with the laws of England and Wales, and you irrevocably submit to the exclusive jurisdiction of the courts in that location.</p>

                  <h2 style={{ fontSize: '24px', fontWeight: '700', marginTop: '32px', marginBottom: '16px' }}>9. Contact Information</h2>
                  <p style={{ marginBottom: '16px' }}>For questions about these Terms, please contact us at legal@dollarcommerce.com.</p>
                </div>
              </div>
            </div>
          )}

          {/* Privacy Policy Subview */}
          {profileSubView === 'legal-privacy' && (
            <div>
              <button onClick={() => setProfileSubView('main')} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '32px', padding: 0 }}>
                <ArrowLeft size={20} />
                <span style={{ fontSize: '16px' }}>Back</span>
              </button>

              <div style={{ background: '#fff', border: '1px solid #E0E0E0', borderRadius: '12px', padding: '48px', maxWidth: '900px', margin: '0 auto' }}>
                <h1 style={{ fontSize: '36px', fontWeight: '700', marginBottom: '12px' }}>Privacy Policy</h1>
                <p style={{ fontSize: '14px', color: '#999', marginBottom: '32px' }}>Last updated: March 27, 2026</p>

                <div style={{ fontSize: '15px', lineHeight: '1.8', color: '#333' }}>
                  <h2 style={{ fontSize: '24px', fontWeight: '700', marginTop: '32px', marginBottom: '16px' }}>1. Information We Collect</h2>
                  <p style={{ marginBottom: '16px' }}>We collect information you provide directly to us, including name, email address, payment information, and preferences. We also automatically collect certain information about your device when you use our Service, including IP address, browser type, and usage data.</p>

                  <h2 style={{ fontSize: '24px', fontWeight: '700', marginTop: '32px', marginBottom: '16px' }}>2. How We Use Your Information</h2>
                  <p style={{ marginBottom: '16px' }}>We use the information we collect to provide, maintain, and improve our services, process transactions, send you technical notices and support messages, and respond to your comments and questions.</p>

                  <h2 style={{ fontSize: '24px', fontWeight: '700', marginTop: '32px', marginBottom: '16px' }}>3. Information Sharing</h2>
                  <p style={{ marginBottom: '16px' }}>We do not share your personal information with third parties except as described in this policy. We may share information with service providers who perform services on our behalf, such as payment processing and data analysis.</p>

                  <h2 style={{ fontSize: '24px', fontWeight: '700', marginTop: '32px', marginBottom: '16px' }}>4. Data Security</h2>
                  <p style={{ marginBottom: '16px' }}>We take reasonable measures to help protect your personal information from loss, theft, misuse, unauthorized access, disclosure, alteration, and destruction. However, no security system is impenetrable.</p>

                  <h2 style={{ fontSize: '24px', fontWeight: '700', marginTop: '32px', marginBottom: '16px' }}>5. Your Rights (UK GDPR)</h2>
                  <p style={{ marginBottom: '16px' }}>Under UK GDPR, you have the right to access, rectify, erase, restrict processing, object to processing, and data portability regarding your personal data. You may exercise these rights by contacting us at privacy@dollarcommerce.com.</p>

                  <h2 style={{ fontSize: '24px', fontWeight: '700', marginTop: '32px', marginBottom: '16px' }}>6. Cookies</h2>
                  <p style={{ marginBottom: '16px' }}>We use cookies and similar tracking technologies to track activity on our Service and hold certain information. You can instruct your browser to refuse all cookies or indicate when a cookie is being sent.</p>

                  <h2 style={{ fontSize: '24px', fontWeight: '700', marginTop: '32px', marginBottom: '16px' }}>7. Data Controller</h2>
                  <p style={{ marginBottom: '16px' }}>Tiger Global Technologies Ltd, registered in England and Wales, is the data controller responsible for your personal information under this Privacy Policy.</p>

                  <h2 style={{ fontSize: '24px', fontWeight: '700', marginTop: '32px', marginBottom: '16px' }}>8. Changes to This Policy</h2>
                  <p style={{ marginBottom: '16px' }}>We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.</p>

                  <h2 style={{ fontSize: '24px', fontWeight: '700', marginTop: '32px', marginBottom: '16px' }}>9. Contact Us</h2>
                  <p style={{ marginBottom: '16px' }}>If you have questions about this Privacy Policy, please contact us at privacy@dollarcommerce.com.</p>
                </div>
              </div>
            </div>
          )}

          {/* Cookie Policy Subview */}
          {profileSubView === 'legal-cookies' && (
            <div>
              <button onClick={() => setProfileSubView('main')} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '32px', padding: 0 }}>
                <ArrowLeft size={20} />
                <span style={{ fontSize: '16px' }}>Back</span>
              </button>

              <div style={{ background: '#fff', border: '1px solid #E0E0E0', borderRadius: '12px', padding: '48px', maxWidth: '900px', margin: '0 auto' }}>
                <h1 style={{ fontSize: '36px', fontWeight: '700', marginBottom: '12px' }}>Cookie Policy</h1>
                <p style={{ fontSize: '14px', color: '#999', marginBottom: '32px' }}>Last updated: March 27, 2026</p>

                <div style={{ fontSize: '15px', lineHeight: '1.8', color: '#333' }}>
                  <h2 style={{ fontSize: '24px', fontWeight: '700', marginTop: '32px', marginBottom: '16px' }}>1. What Are Cookies</h2>
                  <p style={{ marginBottom: '16px' }}>Cookies are small text files that are placed on your computer or mobile device when you visit our website. They are widely used to make websites work more efficiently and provide information to website owners.</p>

                  <h2 style={{ fontSize: '24px', fontWeight: '700', marginTop: '32px', marginBottom: '16px' }}>2. How We Use Cookies</h2>
                  <p style={{ marginBottom: '16px' }}>We use cookies for authentication (keeping you logged in), preferences (remembering your settings), analytics (understanding how you use our Service), and security (protecting against fraud).</p>

                  <h2 style={{ fontSize: '24px', fontWeight: '700', marginTop: '32px', marginBottom: '16px' }}>3. Types of Cookies We Use</h2>
                  <p style={{ marginBottom: '12px' }}><strong>Essential Cookies:</strong> Required for the Service to function properly. These cannot be disabled.</p>
                  <p style={{ marginBottom: '12px' }}><strong>Functional Cookies:</strong> Enable enhanced functionality and personalization.</p>
                  <p style={{ marginBottom: '12px' }}><strong>Analytics Cookies:</strong> Help us understand how visitors interact with our Service.</p>
                  <p style={{ marginBottom: '16px' }}><strong>Advertising Cookies:</strong> Used to deliver relevant advertisements.</p>

                  <h2 style={{ fontSize: '24px', fontWeight: '700', marginTop: '32px', marginBottom: '16px' }}>4. Third-Party Cookies</h2>
                  <p style={{ marginBottom: '16px' }}>We may use third-party service providers who may set cookies on your device, including analytics providers and payment processors. These third parties have their own privacy policies.</p>

                  <h2 style={{ fontSize: '24px', fontWeight: '700', marginTop: '32px', marginBottom: '16px' }}>5. Managing Cookies</h2>
                  <p style={{ marginBottom: '16px' }}>You can control and manage cookies through your browser settings. Most browsers allow you to refuse cookies or delete cookies. Please note that disabling cookies may affect the functionality of the Service.</p>

                  <h2 style={{ fontSize: '24px', fontWeight: '700', marginTop: '32px', marginBottom: '16px' }}>6. Contact Us</h2>
                  <p style={{ marginBottom: '16px' }}>If you have questions about our use of cookies, please contact us at privacy@dollarcommerce.com.</p>
                </div>
              </div>
            </div>
          )}
        </main>
      )}

      {/* FUNDRAISING TRACKER VIEW */}

      <SiteFooter />
    </div>
  );
}

