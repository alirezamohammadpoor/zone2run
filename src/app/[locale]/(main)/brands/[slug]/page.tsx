import type { Metadata } from "next";
import { Suspense } from "react";
import { getProductsByBrandPaginated, getBrandBySlug } from "@/sanity/lib/getData";
import { notFound } from "next/navigation";
import { decodeBrandSlug } from "@/lib/utils/brandUrls";
import Image from "next/image";
import { ProductListing } from "@/components/plp/ProductListing";
import { BreadcrumbJsonLd } from "@/components/schemas";
import { localeToCountry } from "@/lib/locale/localeUtils";
import { buildHreflangAlternates } from "@/lib/metadata";

// ISR: Revalidate every 10 minutes, on-demand via Sanity webhook
export const revalidate = 600;

// Generate dynamic metadata for SEO
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const decodedSlug = decodeBrandSlug(slug);
  const brand = await getBrandBySlug(decodedSlug);

  if (!brand) {
    return { title: "Brand Not Found | Zone2Run" };
  }

  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://zone2run-build.vercel.app";
  const url = `${baseUrl}/${locale}/brands/${slug}`;
  const description =
    brand.description || `Shop ${brand.name} running gear at Zone2Run`;

  return {
    title: `${brand.name} | Zone2Run`,
    description,
    alternates: buildHreflangAlternates(`/brands/${slug}`, locale),
    openGraph: {
      title: brand.name,
      description,
      url,
      siteName: "Zone2Run",
      type: "website",
    },
    twitter: {
      card: "summary",
      title: brand.name,
      description,
    },
  };
}

// Async component for streaming products grid with filtering
async function BrandProductGrid({
  decodedSlug,
  editorialImages,
  country,
}: {
  decodedSlug: string;
  editorialImages?: NonNullable<
    Awaited<ReturnType<typeof getBrandBySlug>>
  >["editorialImages"];
  country?: string;
}) {
  const { products, totalCount } = await getProductsByBrandPaginated(
    decodedSlug,
    undefined,
    undefined,
    country,
  );

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
      totalCount={totalCount}
      queryType={{ type: "brand", brandSlug: decodedSlug }}
      country={country}
    />
  );
}

export default async function BrandPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const decodedSlug = decodeBrandSlug(slug);
  const country = localeToCountry(locale);

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
      <BreadcrumbJsonLd items={breadcrumbs} locale={locale} />

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
          country={country}
        />
      </Suspense>
    </div>
  );
}
