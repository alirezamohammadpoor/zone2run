import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProductGridWithImages from "@/components/ProductGridWithImages";
import { getCollectionBySlug } from "@/sanity/lib/getData";
import Image from "next/image";

// ISR: Revalidate every hour, on-demand via Sanity webhook
export const revalidate = 3600;

interface CollectionPageProps {
  params: Promise<{ slug: string }>;
}

// Generate dynamic metadata for SEO
export async function generateMetadata({
  params,
}: CollectionPageProps): Promise<Metadata> {
  const { slug } = await params;
  const collection = await getCollectionBySlug(slug);

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

export default async function CollectionPage({ params }: CollectionPageProps) {
  const { slug } = await params;
  const collection = await getCollectionBySlug(slug);

  if (!collection || !collection.products || collection.products.length === 0) {
    notFound();
  }

  // Extract first editorial image for header, rest for grid
  const firstEditorialImage = collection.editorialImages?.[0];
  const remainingEditorialImages = collection.editorialImages?.slice(1);
  const imageUrl = firstEditorialImage?.image?.asset?.url;

  return (
    <div>
      {/* Header: Description + First editorial image */}
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
                alt={firstEditorialImage.image.alt || collection.title}
                fill
                className="object-cover"
                sizes="(min-width: 1280px) 50vw, 100vw"
                priority
                fetchPriority="high"
              />
            </div>
          </div>
        )}
      </div>
      <ProductGridWithImages
        products={collection.products}
        editorialImages={remainingEditorialImages}
        productsPerImage={collection.productsPerImage || 4}
        productsPerImageXL={collection.productsPerImage || 4}
        gridLayout={collection.gridLayout || "4col"}
      />
    </div>
  );
}
