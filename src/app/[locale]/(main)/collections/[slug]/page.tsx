import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getCollectionInfo, getCollectionProductsPaginated } from "@/sanity/lib/getData";
import Image from "next/image";
import { ProductListing } from "@/components/plp/ProductListing";
import { BreadcrumbJsonLd } from "@/components/schemas";
import { localeToCountry } from "@/lib/locale/localeUtils";
import { buildHreflangAlternates } from "@/lib/metadata";

// ISR: Revalidate every hour, on-demand via Sanity webhook
export const revalidate = 3600;

interface CollectionPageProps {
  params: Promise<{ locale: string; slug: string }>;
}

// Generate dynamic metadata for SEO
export async function generateMetadata({
  params,
}: CollectionPageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const collection = await getCollectionInfo(slug);

  if (!collection) {
    return { title: "Collection Not Found | Zone2Run" };
  }

  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://zone2run-build.vercel.app";
  const url = `${baseUrl}/${locale}/collections/${slug}`;
  const description =
    collection.description ||
    `Shop our ${collection.title} collection at Zone2Run`;

  return {
    title: `${collection.title} | Zone2Run`,
    description,
    alternates: buildHreflangAlternates(`/collections/${slug}`, locale),
    openGraph: {
      title: collection.title,
      description,
      url,
      siteName: "Zone2Run",
      type: "website",
    },
    twitter: {
      card: "summary",
      title: collection.title,
      description,
    },
  };
}

// Async component for streaming products grid with filtering
async function CollectionProductGrid({
  collectionId,
  shopifyId,
  curatedProducts,
  editorialImages,
  productsPerImage,
  gridLayout,
  country,
}: {
  collectionId: string;
  shopifyId?: number;
  curatedProducts?: Array<{ _id: string }>;
  editorialImages?: NonNullable<
    Awaited<ReturnType<typeof getCollectionInfo>>
  >["editorialImages"];
  productsPerImage?: number;
  gridLayout?: "4col" | "3col";
  country?: string;
}) {
  const { products, totalCount } = await getCollectionProductsPaginated(
    collectionId,
    shopifyId,
    curatedProducts,
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

  const curatedProductIds = curatedProducts?.map((p) => p._id);

  return (
    <ProductListing
      products={products}
      editorialImages={editorialImages}
      productsPerImage={productsPerImage || 4}
      productsPerImageXL={productsPerImage || 4}
      gridLayout={gridLayout || "4col"}
      totalCount={totalCount}
      queryType={{ type: "collection", collectionId, shopifyId, curatedProductIds }}
      country={country}
    />
  );
}

export default async function CollectionPage({ params }: CollectionPageProps) {
  const { locale, slug } = await params;
  const country = localeToCountry(locale);

  // Fetch collection info FIRST - hero renders immediately
  const collection = await getCollectionInfo(slug);

  if (!collection) {
    notFound();
  }

  // Hero image is separate from editorial images (cleaner data model)
  const heroImage = collection.heroImage;
  const blurDataURL = heroImage?.image?.asset?.metadata?.lqip;
  const imageUrl = heroImage?.image?.asset?.url;

  // Editorial images go in the product grid
  const editorialImages = collection.editorialImages;

  // Breadcrumb trail for collections: Home > Collection Name
  const breadcrumbs = [
    { label: collection.title, href: `/collections/${slug}` },
  ];

  return (
    <div>
      {/* JSON-LD Breadcrumb for SEO */}
      <BreadcrumbJsonLd items={breadcrumbs} locale={locale} />

      {/* Header: Description + First editorial image (renders immediately) */}
      <div className="px-2 mt-8 md:mt-12 xl:mt-16 mb-8 md:mb-12 xl:mb-16 xl:flex xl:justify-between xl:items-start xl:gap-8">
        <div className="xl:w-1/3">
          <h1 className="text-sm">{collection.title}</h1>
          <p className="text-xs mt-2">{collection.description || ""}</p>
        </div>

        {/* Single image - CSS handles mobile/desktop layout */}
        {imageUrl && (
          <div className="mt-4 xl:mt-0 xl:w-1/2 xl:pl-2">
            <div className="relative aspect-[4/5]">
              <Image
                src={imageUrl}
                alt={heroImage?.image?.alt || collection.title}
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
        <CollectionProductGrid
          collectionId={collection._id}
          shopifyId={collection.shopifyId}
          curatedProducts={collection.curatedProducts}
          editorialImages={editorialImages}
          productsPerImage={collection.productsPerImage}
          gridLayout={collection.gridLayout}
          country={country}
        />
      </Suspense>
    </div>
  );
}
