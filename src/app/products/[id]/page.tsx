import AddToCart from "@/components/buttons/AddToCart";
import CollapsibleSection from "@/components/CollapsibleSection";
import ProductDescription from "@/components/ProductDescription";
import { urlFor } from "@/sanity/lib/image";
import { getProductByHandle } from "@/sanity/lib/getData";
import Image from "next/image";
import React from "react";
import { notFound } from "next/navigation";
import { useCartStore } from "@/store/cartStore";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const id = (await params).id;
  const product = await getProductByHandle(id);

  if (!product) {
    notFound();
  }

  return (
    <div>
      <span className="text-sm text-gray-500">
        Zone 2 {">"} Men's {">"} Tops
      </span>
      <div className="w-full relative aspect-[5/5] mt-4 bg-gray-100 flex items-center justify-center">
        {product.mainImage && (
          <Image
            src={urlFor(product.mainImage).url()}
            alt={product.title || "Product"}
            fill
            className="object-contain"
          />
        )}
      </div>
      <div className="flex justify-between items-center mt-4">
        <span className="ml-2">{product.title || "Product Name"}</span>
        <span className="mr-2">500 SEK</span>
      </div>

      <div className="max-w-md mx-auto p-4 mt-4">
        <h3 className="mb-2 text-sm font-medium">Select Size</h3>
        <div className="grid grid-cols-3 gap-2">
          {["XS", "S", "M", "L", "XL"].map((size) => (
            <button
              key={size}
              className="py-2 px-4 border rounded text-center hover:bg-black hover:text-white"
            >
              {size}
            </button>
          ))}
        </div>
        <p className="mt-2 text-xs text-gray-500">
          Find your size with our size guide.
        </p>
      </div>

      <AddToCart />
      <ProductDescription />

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
        <h3 className="font-medium text-sm uppercase mb-2">Related Products</h3>
        <div className="mt-12 mb-12">
          <h3 className="text-2xl font-medium uppercase mb-2">
            The Race Collection
          </h3>
        </div>
      </div>
    </div>
  );
}
