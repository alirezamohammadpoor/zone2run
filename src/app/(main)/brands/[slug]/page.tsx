import type { Metadata } from "next";
import { Suspense } from "react";
import dynamic from "next/dynamic";
import { getProductsByBrand, getBrandBySlug } from "@/sanity/lib/getData";
import { notFound } from "next/navigation";
import { decodeBrandSlug } from "@/lib/utils/brandUrls";
import Image from "next/image";
import type { EditorialImage } from "@/components/ProductGridWithImages";
import PaginationNav from "@/components/PaginationNav";
import type { PaginatedProducts } from "@/sanity/lib/getProducts";
import { PRODUCTS_PER_PAGE } from "@/sanity/lib/groqUtils";

// Dynamic import reduces TBT by deferring JS parsing
const ProductGridWithImages = dynamic(
  () => import("@/components/ProductGridWithImages"),
  { ssr: true }
);

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

// Async component for streaming products grid with pagination
async function BrandProductGrid({
  slug,
  gender,
  editorialImages,
  currentPage,
}: {
  slug: string;
  gender?: string;
  editorialImages?: EditorialImage[];
  currentPage: number;
}) {
  const result = await getProductsByBrand(slug, undefined, gender, currentPage);

  // Type guard for paginated result
  const isPaginated = (r: typeof result): r is PaginatedProducts =>
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

export default async function BrandPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ gender?: string; page?: string }>;
}) {
  const { slug } = await params;
  const { gender, page: pageParam } = await searchParams;
  const decodedSlug = decodeBrandSlug(slug);

  // Parse page number, default to 1, ensure positive integer
  const currentPage = Math.max(1, parseInt(pageParam || "1", 10) || 1);

  // Fetch brand info FIRST - hero renders immediately
  const brand = await getBrandBySlug(decodedSlug);

  if (!brand) {
    notFound();
  }

  const brandName = brand.name;
  const brandDescription = brand.description || "";

  // Extract first editorial image for header, rest for grid
  const firstEditorialImage = brand.editorialImages?.[0];
  const remainingEditorialImages = brand.editorialImages?.slice(1);
  const blurDataURL = firstEditorialImage?.image?.asset?.metadata?.lqip;

  const imageUrl = firstEditorialImage?.image?.asset?.url;

  return (
    <div>
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
                alt={firstEditorialImage?.image?.alt || brandName}
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
      <Suspense fallback={null}>
        <BrandProductGrid
          slug={decodedSlug}
          gender={gender}
          editorialImages={remainingEditorialImages}
          currentPage={currentPage}
        />
      </Suspense>
    </div>
  );
}
