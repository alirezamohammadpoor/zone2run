"use client";
import React from "react";
import ProductGallery from "./ProductGallery";
import VariantSelector from "./VariantSelector";
import AddToCart from "./AddToCart";
import { useProductStore } from "@/store/variantStore";
import { ProductHelper } from "@/types/product";
import type { Product } from "@/types/product";

interface ProductDetailsProps {
  product: Product;
}

function ProductDetails({ product }: ProductDetailsProps) {
  const { selectedVariant } = useProductStore();
  const helper = new ProductHelper(product);
  const breadCrumbs = helper.getBreadcrumbs();
  const brandName = helper.getBrandName();
  const productName = helper.getProductName();

  return (
    <div>
      <span className="text-sm text-gray-500">
        {breadCrumbs.map((crumb, index) => (
          <span key={index}>
            {index > 0 && " > "}
            {crumb.label}
          </span>
        ))}
      </span>

      <ProductGallery
        mainImage={product.sanity.mainImage}
        title={helper.getDisplayTitle()}
      />

      <div className="flex justify-between items-center mt-4">
        <p className="ml-2 text-md font-semibold">{brandName}</p>
        <p className="mr-2">
          {helper.getPrice().amount} {helper.getPrice().currencyCode}
        </p>
      </div>
      <p className="ml-2">{productName}</p>

      <VariantSelector product={product} />
      <AddToCart
        product={{
          title: productName,
          handle: product.shopify.handle,
          productImage: helper.getMainImage() || "",
        }}
        selectedVariant={selectedVariant}
      />
    </div>
  );
}

export default ProductDetails;
