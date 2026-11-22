import type { ImageLoaderProps } from "next/image";

// Resize on the source CDNs instead of Vercel Image Optimization, which bills
// every unique source × width × format as a transformation (Hobby cap: 5K).
// Shopify and Sanity both resize at the edge for free and negotiate WebP/AVIF
// from the Accept header, so we keep the format win without the bill.
export default function imageLoader({ src, width, quality }: ImageLoaderProps) {
  let url: URL;
  try {
    url = new URL(src);
  } catch {
    return src;
  }

  if (url.hostname === "cdn.shopify.com") {
    url.searchParams.set("width", String(width));
    return url.toString();
  }

  if (url.hostname === "cdn.sanity.io") {
    url.searchParams.set("w", String(width));
    url.searchParams.set("q", String(quality ?? 75));
    url.searchParams.set("auto", "format");
    url.searchParams.set("fit", "max");
    return url.toString();
  }

  return src;
}
