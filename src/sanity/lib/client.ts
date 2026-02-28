import { createClient } from 'next-sanity'

import { apiVersion, dataset, projectId } from '../env'

// Base Sanity client — defineLive() in live.ts handles caching and draft/published switching
export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
})
