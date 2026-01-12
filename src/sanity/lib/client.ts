import { createClient, type QueryParams } from 'next-sanity'

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

/**
 * Cached fetch for Sanity queries (Next.js 15 requires explicit cache)
 * Next.js 15 changed default fetch behavior from 'force-cache' to 'no-store'
 * This wrapper ensures all Sanity queries are cached for ISR
 * Revalidation is controlled by page-level `export const revalidate = X`
 *
 * Set SANITY_NO_CACHE=true to disable caching for troubleshooting
 */
export async function sanityFetch<T>(
  query: string,
  params: QueryParams = {}
): Promise<T> {
  const noCache = process.env.SANITY_NO_CACHE === 'true';

  return client.fetch<T>(query, params, {
    cache: noCache ? 'no-store' : 'force-cache',
  })
}
