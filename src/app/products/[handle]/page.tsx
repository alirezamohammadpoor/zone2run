import ProductDetails from "@/components/product/ProductDetails";
import { getProductByHandle } from "@/lib/product/getProductByHandle";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import RelatedProductsServer from "@/components/product/RelatedProductsServer";
import ColorVariants from "@/components/product/ColorVariants";
import ProductEditorialImages from "@/components/product/ProductEditorialImages";
import RelatedProductsSkeleton from "@/components/skeletons/RelatedProductsSkeleton";
import EditorialImageSkeleton from "@/components/skeletons/EditorialImageSkeleton";

/**
 * Render the product detail page for the product identified by the route `handle`.
 *
 * Fetches product data by `handle` and returns the JSX for the product detail view,
 * including product details, color variants, editorial images (lazy-loaded with a skeleton fallback),
 * and related products for the product's brand (lazy-loaded with a skeleton fallback).
 *
 * @param params - A promise that resolves to an object containing the route `handle` string
 *                 used to look up the product.
 * @returns The React element tree for the product page.
 *
 * If no product is found for the provided `handle`, this function triggers a 404 response
 * by calling `notFound()`.
 */
export default async function ProductPage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const handle = (await params).handle;
  const product = await getProductByHandle(handle);

  if (!product) {
    notFound();
  }

  return (
    <>
      <div>
        <ProductDetails product={product} />
        <ColorVariants
          colorVariants={product.colorVariants}
          currentProductId={product._id}
        />
        <Suspense fallback={<EditorialImageSkeleton />}>
          <ProductEditorialImages editorialImages={product.editorialImages} />
        </Suspense>
      </div>
      {product.brand?.slug && (
        <Suspense fallback={<RelatedProductsSkeleton />}>
          <RelatedProductsServer
            brandSlug={product.brand.slug}
            currentProductId={product._id}
          />
        </Suspense>
      )}
    </>
  );
}