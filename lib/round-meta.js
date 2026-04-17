// Shared metadata for fundraising round types.
// Used by the round filter pills and the round badges in the tracker table.
//
// Colors were picked to sit comfortably on both white and the page's cream
// background (#F4F1EA) without any two adjacent rounds clashing.

import {
  Sprout, Rocket, TrendingUp, Zap, Flame, Crown, Gem, Landmark,
  Coins, Handshake, HelpCircle,
} from 'lucide-react';

export const ROUND_META = {
  'Unknown':     { color: '#94a3b8', icon: HelpCircle },
  'Pre-seed':    { color: '#a78bfa', icon: Sprout },
  'Seed':        { color: '#8b5cf6', icon: Sprout },
  'Series A':    { color: '#10B981', icon: Rocket },
  'Series B':    { color: '#0ea5e9', icon: TrendingUp },
  'Series C':    { color: '#3b82f6', icon: Zap },
  'Series D':    { color: '#6366f1', icon: Flame },
  'Series E+':   { color: '#9333ea', icon: Crown },
  'Growth':      { color: '#f59e0b', icon: Gem },
  'IPO':         { color: '#ec4899', icon: Landmark },
  'Debt':        { color: '#f97316', icon: Coins },
  'Acquisition': { color: '#D2042D', icon: Handshake },
};

export function getRoundMeta(round) {
  return ROUND_META[round] || { color: '#cbd5e1', icon: HelpCircle };
}
