import ProductDetails from "@/components/product/ProductDetails";
import { getProductByHandle } from "@/lib/product/getProductByHandle";
import React from "react";
import { notFound } from "next/navigation";
import RelatedProductsServer from "@/components/product/RelatedProductsServer";
import ColorVariants from "@/components/product/ColorVariants";
import ProductEditorialImages from "@/components/product/ProductEditorialImages";
import ProductTabs from "@/components/product/ProductTabs";
// A/B Test: Old collapsible sections (commented out)
// import CollapsibleSection from "@/components/CollapsibleSection";
// import ProductDescription from "@/components/ProductDescription";

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

        {/* A/B Test: New tabbed interface */}
        <ProductTabs description={product.description} />

        {/* A/B Test: Old collapsible sections (commented out for A/B testing)
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
        */}

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
