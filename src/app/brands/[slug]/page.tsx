import { getProductsByBrand, getCategoryBySlug } from "@/sanity/lib/getData";
import { notFound } from "next/navigation";
import ProductGrid from "@/components/ProductGrid";
import Image from "next/image";
import { urlFor } from "@/sanity/lib/image";

export default async function BrandPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const products = await getProductsByBrand(slug);

  if (!products || products.length === 0) {
    notFound();
  }

  // Get brand name from first product (since we don't have a direct brand query)
  const brandName = products[0]?.sanity?.brand?.name || slug;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        {products[0]?.sanity?.brand?.logo?.asset?._ref && (
          <div className="mb-4">
            <Image
              src={urlFor(products[0].sanity.brand.logo).url()}
              alt={`${brandName} logo`}
              width={100}
              height={100}
              className="h-16 w-auto object-contain"
            />
          </div>
        )}
        <h1 className="text-3xl font-bold">{brandName} Products</h1>
        <p className="text-gray-600 mt-2">
          {products.length} product{products.length !== 1 ? "s" : ""} available
        </p>
      </div>
      <ProductGrid products={products} />
    </div>
  );
}
