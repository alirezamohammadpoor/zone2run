import ProductDetails from "@/components/product/ProductDetails";
import { getProductByHandle } from "@/lib/product/getProductByHandle";
import React from "react";
import { notFound } from "next/navigation";
import RelatedProductsServer from "@/components/product/RelatedProductsServer";
import ColorVariants from "@/components/product/ColorVariants";
import ProductEditorialImages from "@/components/product/ProductEditorialImages";

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
        <ProductEditorialImages editorialImages={product.editorialImages} />
      </div>
      {product.brand?.slug && (
        <RelatedProductsServer
          brandSlug={product.brand.slug}
          currentProductId={product._id}
        />
      )}
    </>
  );
}
