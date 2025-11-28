import { createClient } from 'next-sanity'

import { apiVersion, dataset, projectId } from '../env'

// Published content client (uses CDN for performance)
export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: true,
})

// Preview client for draft content (no CDN, uses token)
export const previewClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  token: process.env.SANITY_API_READ_TOKEN,
  perspective: 'previewDrafts',
  stega: {
    enabled: true, // Required for visual editing
    studioUrl: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000/studio',
  },
})

// Helper to get the appropriate client based on preview mode
export function getClient(preview = false) {
  return preview ? previewClient : client
}
