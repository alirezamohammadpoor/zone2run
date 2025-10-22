import ProductDetails from "@/components/product/ProductDetails";
import CollapsibleSection from "@/components/CollapsibleSection";
import ProductDescription from "@/components/ProductDescription";
import { getProductByHandle } from "@/lib/product/getProductByHandle";
import React from "react";
import { notFound } from "next/navigation";
import Footer from "@/components/Footer";

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
        <ProductDescription productId={product._id} />

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

        <div className="mt-12 mb-12 ml-2">
          <h3 className="font-medium text-sm uppercase mb-2">
            Related Products
          </h3>
          <div className="mt-12 mb-12">
            <h3 className="text-2xl font-medium uppercase mb-2">
              The Race Collection
            </h3>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
