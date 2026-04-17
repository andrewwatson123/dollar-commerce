import { Users, Store, Mountain, Wrench, Monitor } from 'lucide-react';

export const EVENT_TYPE_META = {
  Conference: { color: '#6366F1', icon: Users },
  Expo:       { color: '#0EA5E9', icon: Store },
  Summit:     { color: '#10B981', icon: Mountain },
  Workshop:   { color: '#F59E0B', icon: Wrench },
  Webinar:    { color: '#8B5CF6', icon: Monitor },
};

export const REGION_META = {
  'North America':       { color: '#6366F1' },
  'Europe':              { color: '#0EA5E9' },
  'Asia-Pacific':        { color: '#10B981' },
  'Latin America':       { color: '#F97316' },
  'Middle East & Africa': { color: '#EC4899' },
  'Global/Virtual':      { color: '#F59E0B' },
};

export function getEventTypeMeta(type) {
  return EVENT_TYPE_META[type] || { color: '#94A3B8', icon: Users };
}

export function getRegionMeta(region) {
  return REGION_META[region] || { color: '#94A3B8' };
}
