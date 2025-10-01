// Live content functionality - simplified for now
// This can be enhanced later when the live content API is stable
import { client } from "./client";

// For now, just export the client for regular fetching
export const sanityFetch = client.fetch;
export const SanityLive = null; // Placeholder for future implementation
