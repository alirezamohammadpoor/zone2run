import type { Metadata } from "next";
import { Suspense } from "react";
import { getProductsByBrand, getBrandBySlug } from "@/sanity/lib/getData";
import { notFound } from "next/navigation";
import { decodeBrandSlug } from "@/lib/utils/brandUrls";
import Image from "next/image";
import { ProductListing } from "@/components/plp/ProductListing";
import { BreadcrumbJsonLd } from "@/components/schemas";

// ISR: Revalidate every 10 minutes, on-demand via Sanity webhook
export const revalidate = 600;

// Generate dynamic metadata for SEO
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const decodedSlug = decodeBrandSlug(slug);
  const brand = await getBrandBySlug(decodedSlug);

  if (!brand) {
    return { title: "Brand Not Found | Zone2Run" };
  }

  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://zone2run-build.vercel.app";
  const description =
    brand.description || `Shop ${brand.name} running gear at Zone2Run`;

  return {
    title: `${brand.name} | Zone2Run`,
    description,
    openGraph: {
      title: brand.name,
      description,
      url: `${baseUrl}/brands/${slug}`,
      siteName: "Zone2Run",
      type: "website",
    },
  };
}

// Async component for streaming products grid with filtering
async function BrandProductGrid({
  decodedSlug,
  editorialImages,
}: {
  decodedSlug: string;
  editorialImages?: NonNullable<
    Awaited<ReturnType<typeof getBrandBySlug>>
  >["editorialImages"];
}) {
  // Fetch all products for this brand (gender filtering is client-side)
  const products = await getProductsByBrand(decodedSlug);

  if (!Array.isArray(products) || products.length === 0) {
    return (
      <div className="px-2 py-8 text-center text-sm text-gray-500">
        No products found.
      </div>
    );
  }

  return (
    <ProductListing
      products={products}
      editorialImages={editorialImages}
    />
  );
}

export default async function BrandPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const decodedSlug = decodeBrandSlug(slug);

  // Fetch brand info FIRST - hero renders immediately
  const brand = await getBrandBySlug(decodedSlug);

  if (!brand) {
    notFound();
  }

  const brandName = brand.name;
  const brandDescription = brand.description || "";

  // Hero image is separate from editorial images (cleaner data model)
  const heroImage = brand.heroImage;
  const blurDataURL = heroImage?.image?.asset?.metadata?.lqip;
  const imageUrl = heroImage?.image?.asset?.url;

  // Editorial images go in the product grid
  const editorialImages = brand.editorialImages;

  // Breadcrumb trail for brands: Home > Brands > Brand Name
  const breadcrumbs = [
    { label: "Brands", href: "/brands" },
    { label: brandName, href: `/brands/${slug}` },
  ];

  return (
    <div>
      {/* JSON-LD Breadcrumb for SEO */}
      <BreadcrumbJsonLd items={breadcrumbs} />

      {/* Header: Description + First editorial image (renders immediately) */}
      <div className="px-2 mt-8 md:mt-12 xl:mt-16 mb-8 md:mb-12 xl:mb-16 xl:flex xl:justify-between xl:items-start xl:gap-8">
        <div className="xl:w-1/3">
          <h1 className="text-sm">{brandName}</h1>
          <p className="text-xs mt-2">{brandDescription}</p>
        </div>

        {/* Single image - CSS handles mobile/desktop layout */}
        {imageUrl && (
          <div className="mt-4 xl:mt-0 xl:w-1/2 xl:pl-2">
            <div className="relative aspect-[4/5]">
              <Image
                src={imageUrl}
                alt={heroImage?.image?.alt || brandName}
                fill
                className="object-cover"
                sizes="(min-width: 1280px) 50vw, 100vw"
                priority
                fetchPriority="high"
                placeholder={blurDataURL ? "blur" : "empty"}
                blurDataURL={blurDataURL}
              />
            </div>
          </div>
        )}
      </div>

      {/* Products grid streams in via Suspense */}
      <Suspense fallback={<div className="min-h-screen" />}>
        <BrandProductGrid
          decodedSlug={decodedSlug}
          editorialImages={editorialImages}
        />
      </Suspense>
    </div>
  );
}
