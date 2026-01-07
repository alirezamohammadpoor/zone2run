import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

const REVALIDATE_SECRET = process.env.SANITY_REVALIDATE_SECRET;

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
        revalidatePath(`/products/${handle}`);
        revalidated.push(`/products/${handle}`);
      }
      // Revalidate listing pages (product added/removed affects these)
      if (body.gender) {
        revalidatePath(`/${body.gender}`);
        revalidated.push(`/${body.gender}`);
      }
      // Handle both {slug: "value"} and {slug: {current: "value"}} formats
      const brandSlug = body.brand?.slug?.current || body.brand?.slug;
      if (brandSlug && typeof brandSlug === "string") {
        revalidatePath(`/brands/${brandSlug}`);
        revalidated.push(`/brands/${brandSlug}`);
      }
    }

    // Collection changes
    if (body._type === "collection") {
      const slug = body.slug;
      if (slug) {
        revalidatePath(`/collections/${slug}`);
        revalidated.push(`/collections/${slug}`);
      }
    }

    // Blog post changes
    if (body._type === "blogPost") {
      const slug = body.slug;
      const category = body.category?.slug;
      if (slug && category) {
        revalidatePath(`/blog/${category}/${slug}`);
        revalidatePath(`/blog`);
        revalidated.push(`/blog/${category}/${slug}`, `/blog`);
      }
    }

    // Homepage changes
    if (body._type === "homepageVersion" || body._type === "siteSettings") {
      revalidatePath(`/`);
      revalidated.push(`/`);
    }

    // Brand changes
    if (body._type === "brand") {
      const slug = body.slug;
      if (slug) {
        revalidatePath(`/brands/${slug}`);
        revalidated.push(`/brands/${slug}`);
      }
    }

    return NextResponse.json({
      revalidated,
      count: revalidated.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      { message: "Error revalidating", error: String(error) },
      { status: 500 }
    );
  }
}
