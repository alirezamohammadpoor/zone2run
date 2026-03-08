import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { SUPPORTED_LOCALES } from "@/lib/locale/localeUtils";

const REVALIDATE_SECRET = process.env.SANITY_REVALIDATE_SECRET;

/** Revalidate a path for ALL supported locales (e.g. "/mens" → "/en-se/mens", "/en-dk/mens", ...) */
function revalidateForAllLocales(path: string, revalidated: string[]) {
  for (const locale of SUPPORTED_LOCALES) {
    const localePath = `/${locale}${path}`;
    revalidatePath(localePath);
    revalidated.push(localePath);
  }
}

export async function POST(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get("secret");

  if (secret !== REVALIDATE_SECRET) {
    return NextResponse.json({ message: "Invalid secret" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const revalidated: string[] = [];

    // Product changes
    if (body._type === "product") {
      const handle = body.handle;
      if (handle) {
        revalidateForAllLocales(`/products/${handle}`, revalidated);
      }
      // Revalidate listing pages (product added/removed affects these)
      if (body.gender) {
        revalidateForAllLocales(`/${body.gender}`, revalidated);
      }
      // Handle both {slug: "value"} and {slug: {current: "value"}} formats
      const brandSlug = body.brand?.slug?.current || body.brand?.slug;
      if (brandSlug && typeof brandSlug === "string") {
        revalidateForAllLocales(`/brands/${brandSlug}`, revalidated);
      }
    }

    // Collection changes
    if (body._type === "collection") {
      const slug = body.slug;
      if (slug) {
        revalidateForAllLocales(`/collections/${slug}`, revalidated);
      }
    }

    // Blog post changes
    if (body._type === "blogPost") {
      const slug = body.slug;
      const category = body.category?.slug;
      if (slug && category) {
        revalidateForAllLocales(`/blog/${category}/${slug}`, revalidated);
        revalidateForAllLocales(`/blog`, revalidated);
      }
    }

    // Homepage changes
    if (body._type === "homepageVersion" || body._type === "siteSettings") {
      revalidateForAllLocales(``, revalidated);
    }

    // Brand changes
    if (body._type === "brand") {
      const slug = body.slug;
      if (slug) {
        revalidateForAllLocales(`/brands/${slug}`, revalidated);
      }
    }

    // Structured log for Vercel Functions monitoring
    console.log(
      JSON.stringify({
        event: "revalidation_complete",
        type: body._type,
        paths: revalidated.length,
        timestamp: new Date().toISOString(),
      })
    );

    return NextResponse.json({
      revalidated,
      count: revalidated.length,
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
