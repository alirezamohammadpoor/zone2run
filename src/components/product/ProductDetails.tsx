"use client";
import React from "react";
import ProductGallery from "./ProductGallery";
import VariantSelector from "./VariantSelector";
import AddToCart from "./AddToCart";
import { useProductStore } from "@/store/variantStore";
import { urlFor } from "@/sanity/lib/image";

interface ProductDetailsProps {
  product: {
    title?: string;
    mainImage?: any;
    handle?: string;
  };
}

function ProductDetails({ product }: ProductDetailsProps) {
  const { selectedVariant } = useProductStore();
  return (
    <div>
      <span className="text-sm text-gray-500">
        Zone 2 {">"} Men's {">"} Tops
      </span>

      <ProductGallery mainImage={product.mainImage} title={product.title} />

      <div className="flex justify-between items-center mt-4">
        <span className="ml-2">{product.title || "Product Name"}</span>
        <span className="mr-2">500 SEK</span>
      </div>

      <VariantSelector />
      <AddToCart
        product={{
          title: product.title || "",
          handle: product.handle || "",
          productImage:
            urlFor(product.mainImage).width(80).height(120).url() || "",
        }}
        selectedVariant={selectedVariant}
      />
    </div>
  );
}

export default ProductDetails;
