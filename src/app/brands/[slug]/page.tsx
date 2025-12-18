import { getProductsByBrand, getBrandBySlug } from "@/sanity/lib/getData";
import { notFound } from "next/navigation";
import ProductGridWithImages from "@/components/ProductGridWithImages";
import { decodeBrandSlug } from "@/lib/utils/brandUrls";
import Image from "next/image";
import { urlFor } from "@/sanity/lib/image";

export default async function BrandPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ gender?: string }>;
}) {
  const { slug } = await params;
  const { gender } = await searchParams;
  const decodedSlug = decodeBrandSlug(slug);

  const [products, brand] = await Promise.all([
    getProductsByBrand(decodedSlug, undefined, gender),
    getBrandBySlug(decodedSlug),
  ]);

  if (!products || products.length === 0) {
    notFound();
  }

  // Get brand name from brand document or first product
  const brandName = brand?.name || products[0]?.brand?.name || slug;
  const brandDescription =
    brand?.description || products[0]?.brand?.description || "";

  // Extract first editorial image for header, rest for grid
  const firstEditorialImage = brand?.editorialImages?.[0];
  const remainingEditorialImages = brand?.editorialImages?.slice(1);

  return (
    <div>
      {/* Header: Description + First editorial image */}
      <div className="px-2 mb-8 md:mb-12 xl:mb-16 xl:flex xl:justify-between xl:items-start xl:gap-8">
        <div className="xl:w-1/3">
          <h1 className="text-sm">{brandName}</h1>
          <p className="text-xs mt-2">{brandDescription}</p>
          {/* Mobile: First editorial image below description */}
          {firstEditorialImage?.image?.asset?.url && (
            <div className="block xl:hidden mt-4">
              <div className="relative aspect-[4/5]">
                <Image
                  src={urlFor(firstEditorialImage.image).url()}
                  alt={firstEditorialImage.image.alt || brandName}
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
          <div className="hidden xl:block xl:w-1/2 pl-2">
            <div className="relative aspect-[4/5]">
              <Image
                src={urlFor(firstEditorialImage.image).url()}
                alt={firstEditorialImage.image.alt || brandName}
                fill
                className="object-cover"
                sizes="25vw"
              />
            </div>
          </div>
        )}
      </div>
      <ProductGridWithImages
        products={products}
        editorialImages={remainingEditorialImages}
      />
    </div>
  );
}
