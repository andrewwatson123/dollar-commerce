import { createClient } from '@sanity/client';
import { projectId, dataset, apiVersion } from '../env';

// Read-only client for the site.
export const sanityClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: true,
  perspective: 'published',
});

// Write client — only used from scripts and server code where
// SANITY_API_WRITE_TOKEN is set. Never ship this token to the browser.
export function sanityWriteClient() {
  return createClient({
    projectId,
    dataset,
    apiVersion,
    useCdn: false,
    token: process.env.SANITY_API_WRITE_TOKEN,
  });
}
