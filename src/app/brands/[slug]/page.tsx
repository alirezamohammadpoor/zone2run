import { getProductsByBrand, getBrandBySlug } from "@/sanity/lib/getData";
import { notFound } from "next/navigation";
import ProductGridWithImages from "@/components/ProductGridWithImages";
import { decodeBrandSlug } from "@/lib/utils/brandUrls";

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

  return (
    <div>
      <div className="mb-6 px-2">
        <h1 className="text-2xl mt-4">{brandName}</h1>
        <p className="text-sm mt-2">{brandDescription}</p>
      </div>
      <ProductGridWithImages
        products={products}
        editorialImages={brand?.editorialImages}
        productsPerImage={4}
      />
    </div>
  );
}
