import type { Metadata } from "next";
import { Suspense } from "react";
import dynamic from "next/dynamic";
import { notFound } from "next/navigation";
import { getCollectionInfo, getCollectionProducts } from "@/sanity/lib/getData";
import Image from "next/image";
import type { EditorialImage } from "@/components/ProductGridWithImages";
import PaginationNav from "@/components/PaginationNav";
import type { PaginatedCollectionProducts } from "@/sanity/lib/getCollections";
import { PRODUCTS_PER_PAGE } from "@/sanity/lib/groqUtils";

// Dynamic import reduces TBT by deferring JS parsing
const ProductGridWithImages = dynamic(
  () => import("@/components/ProductGridWithImages"),
  { ssr: true }
);

// ISR: Revalidate every hour, on-demand via Sanity webhook
export const revalidate = 3600;

interface CollectionPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}

// Generate dynamic metadata for SEO
export async function generateMetadata({
  params,
}: CollectionPageProps): Promise<Metadata> {
  const { slug } = await params;
  const collection = await getCollectionInfo(slug);

  if (!collection) {
    return { title: "Collection Not Found | Zone2Run" };
  }

  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://zone2run-build.vercel.app";
  const description =
    collection.description ||
    `Shop our ${collection.title} collection at Zone2Run`;

  return {
    title: `${collection.title} | Zone2Run`,
    description,
    openGraph: {
      title: collection.title,
      description,
      url: `${baseUrl}/collections/${slug}`,
      siteName: "Zone2Run",
      type: "website",
    },
  };
}

// Async component for streaming products grid with pagination
async function CollectionProductGrid({
  collectionId,
  shopifyId,
  curatedProducts,
  editorialImages,
  productsPerImage,
  gridLayout,
  currentPage,
}: {
  collectionId: string;
  shopifyId?: number;
  curatedProducts?: Array<{ _id: string }>;
  editorialImages?: EditorialImage[];
  productsPerImage?: number;
  gridLayout?: "4col" | "3col";
  currentPage: number;
}) {
  const result = await getCollectionProducts(collectionId, shopifyId, curatedProducts, currentPage);

  // Type guard for paginated result
  const isPaginated = (r: typeof result): r is PaginatedCollectionProducts =>
    typeof r === "object" && "totalPages" in r;

  if (!isPaginated(result)) {
    return null;
  }

  const { products, totalPages } = result;

  if (!products || products.length === 0) {
    return (
      <div className="px-2 py-8 text-center text-sm text-gray-500">
        No products found.
      </div>
    );
  }

  // Calculate the starting product index for editorial image positioning
  const productStartIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;

  return (
    <>
      <ProductGridWithImages
        products={products}
        editorialImages={editorialImages}
        productsPerImage={productsPerImage || 4}
        productsPerImageXL={productsPerImage || 4}
        gridLayout={gridLayout || "4col"}
        productStartIndex={productStartIndex}
      />
      <PaginationNav
        currentPage={currentPage}
        totalPages={totalPages}
        className="my-8 md:my-12"
      />
    </>
  );
}

export default async function CollectionPage({ params, searchParams }: CollectionPageProps) {
  const { slug } = await params;
  const { page: pageParam } = await searchParams;

  // Parse page number, default to 1, ensure positive integer
  const currentPage = Math.max(1, parseInt(pageParam || "1", 10) || 1);

  // Fetch collection info FIRST - hero renders immediately
  const collection = await getCollectionInfo(slug);

  if (!collection) {
    notFound();
  }

  // Extract first editorial image for header, rest for grid
  const firstEditorialImage = collection.editorialImages?.[0];
  const remainingEditorialImages = collection.editorialImages?.slice(1);
  const blurDataURL = firstEditorialImage?.image?.asset?.metadata?.lqip;

  const imageUrl = firstEditorialImage?.image?.asset?.url;

  return (
    <div>
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
                alt={firstEditorialImage?.image?.alt || collection.title}
                fill
                className="object-cover"
                sizes="(min-width: 1280px) 50vw, 100vw"
                priority
                fetchPriority="high"
                placeholder={blurDataURL ? "blur" : "empty"}
                blurDataURL={blurDataURL}
                unoptimized
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
          editorialImages={remainingEditorialImages}
          productsPerImage={collection.productsPerImage}
          gridLayout={collection.gridLayout}
          currentPage={currentPage}
        />
      </Suspense>
    </div>
  );
}
