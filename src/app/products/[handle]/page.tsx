import ProductDetails from "@/components/product/ProductDetails";
import CollapsibleSection from "@/components/CollapsibleSection";
import ProductDescription from "@/components/ProductDescription";
import { getProductByHandle } from "@/lib/product/getProductByHandle";
import React from "react";
import { notFound } from "next/navigation";
import RelatedProductsServer from "@/components/product/RelatedProductsServer";

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
        <ProductDescription description={product.description} />

        <CollapsibleSection
          title="Product Details"
          content="Your product details content here"
        />
        <CollapsibleSection
          title="Wash and care"
          content="Your wash and care content here"
        />
        <CollapsibleSection
          title="Shipping and returns"
          content="Your shipping and returns content here"
        />
        <CollapsibleSection
          title="Secure payments"
          content="Your secure payments content here"
        />
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
