import { getProductsByBrand } from "@/sanity/lib/getData";
import { notFound } from "next/navigation";
import ProductGrid from "@/components/ProductGrid";
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
  const products = await getProductsByBrand(decodedSlug, undefined, gender);

  if (!products || products.length === 0) {
    notFound();
  }

  // Get brand name from first product (since we don't have a direct brand query)
  const brandName = products[0]?.brand?.name || slug;
  const brandDescription = products[0]?.brand?.description || "";
  return (
    <div>
      <div className="mb-12 px-2">
        <h1 className="text-2xl mt-4">{brandName}</h1>
        <p className="text-sm mt-2">{brandDescription}</p>
      </div>
      <ProductGrid products={products} />
    </div>
  );
}
