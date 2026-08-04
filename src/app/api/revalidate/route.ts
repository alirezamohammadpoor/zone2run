import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

const REVALIDATE_SECRET = process.env.SANITY_REVALIDATE_SECRET;

/**
 * Visitor-independent cache invalidation, called by the Sanity webhook on
 * document changes. All cached Sanity queries carry the "sanity-content" tag
 * (see src/sanity/lib/live.ts), so expiring that tag marks every route that
 * consumed Sanity data stale — they regenerate in the background on the next
 * request ("max" profile = serve stale while revalidating).
 *
 * SanityLive expires next-sanity's fine-grained sync tags too, but only while
 * a browser is connected — this webhook covers the empty-store case.
 */
export async function POST(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get("secret");

  if (secret !== REVALIDATE_SECRET) {
    return NextResponse.json({ message: "Invalid secret" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const expired: string[] = [];

    // Any Sanity document change can surface through GROQ joins (products
    // dereference brands/categories, homepage embeds products, ...) — expire
    // all Sanity-backed data rather than maintaining a per-type mapping.
    revalidateTag("sanity-content", "max");
    expired.push("sanity-content");

    // Header data is cached outside sanityFetch with its own tag
    // (getCachedHeaderData) — expire it when header-relevant types change.
    const HEADER_CONTENT_TYPES = [
      "brand",
      "navigationMenu",
      "category",
      "blogPost",
      "collection",
    ];
    if (HEADER_CONTENT_TYPES.includes(body._type)) {
      revalidateTag("header-data", "max");
      expired.push("header-data");
    }

    // Structured log for Vercel Functions monitoring
    console.log(
      JSON.stringify({
        event: "revalidation_complete",
        type: body._type,
        tags: expired,
        timestamp: new Date().toISOString(),
      })
    );

    return NextResponse.json({
      expired,
      count: expired.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error(
      JSON.stringify({
        event: "revalidation_failed",
        error: String(error),
        timestamp: new Date().toISOString(),
      })
    );
    return NextResponse.json(
      { message: "Error revalidating", error: String(error) },
      { status: 500 }
    );
  }
}
