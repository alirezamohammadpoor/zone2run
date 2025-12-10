"use client";
import React from "react";
import ProductGallery from "./ProductGallery";
import ProductInfo from "./ProductInfo";
import type { SanityProduct } from "@/types/sanityProduct";

interface ProductDetailsProps {
  product: SanityProduct;
}

function ProductDetails({ product }: ProductDetailsProps) {
  return (
    <div className="xl:flex xl:flex-row">
      <ProductGallery
        mainImage={product.mainImage}
        galleryImages={product.gallery}
        title={product.title}
      />
      <ProductInfo product={product} />
    </div>
  );
}

export default ProductDetails;
