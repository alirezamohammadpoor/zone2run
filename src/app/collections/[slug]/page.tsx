import { notFound } from "next/navigation";
import ProductGridWithImages from "@/components/ProductGridWithImages";
import { getCollectionBySlug } from "@/sanity/lib/getData";
import Image from "next/image";
import { urlFor } from "@/sanity/lib/image";

interface CollectionPageProps {
  params: Promise<{ slug: string }>;
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

  return (
    <div>
      {/* Header: Description + First editorial image */}
      <div className="px-2 xl:flex xl:justify-between xl:items-start xl:gap-8">
        <div className="xl:w-1/3">
          <h1 className="text-base">{collection.title}</h1>
          <p className="text-xs mt-2">{collection.description || ""}</p>
          {/* Mobile: First editorial image below description */}
          {firstEditorialImage?.image?.asset?.url && (
            <div className="block xl:hidden mt-4">
              <div className="relative aspect-[4/5]">
                <Image
                  src={urlFor(firstEditorialImage.image).url()}
                  alt={firstEditorialImage.image.alt || collection.title}
                  fill
                  className="object-cover"
                  sizes="100vw"
                />
              </div>
            </div>
          )}
        </div>
        {/* XL: First editorial image on right */}
        {firstEditorialImage?.image?.asset?.url && (
          <div className="hidden xl:block xl:w-1/2 mt-4 pl-2">
            <div className="relative aspect-[4/5]">
              <Image
                src={urlFor(firstEditorialImage.image).url()}
                alt={firstEditorialImage.image.alt || collection.title}
                fill
                className="object-cover"
                sizes="25vw"
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
