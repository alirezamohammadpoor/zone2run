import { defineLive } from 'next-sanity/live'
import { client } from './client'

const { sanityFetch: baseSanityFetch, SanityLive } = defineLive({
  client,
  serverToken: process.env.SANITY_API_READ_TOKEN,
  browserToken: process.env.SANITY_API_READ_TOKEN,
})

// Every cached query also carries the coarse "sanity-content" tag so the
// revalidation webhook (/api/revalidate) can expire all Sanity-backed caches
// without knowing next-sanity's per-query sync tags. SanityLive only expires
// sync tags while a browser is connected — the webhook is the
// visitor-independent path.
const sanityFetch: typeof baseSanityFetch = (options) =>
  baseSanityFetch({
    ...options,
    tags: ['sanity-content', ...(options.tags ?? [])],
  })

export { sanityFetch, SanityLive }
