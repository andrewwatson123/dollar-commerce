'use client';

/**
 * Embedded Sanity Studio — available at /studio.
 * Writers log in here with their Sanity account and publish articles.
 */
import { NextStudio } from 'next-sanity/studio';
import config from '@/sanity.config';

export const dynamic = 'force-static';

export default function StudioPage() {
  return <NextStudio config={config} />;
}
