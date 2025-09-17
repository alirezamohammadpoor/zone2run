"use client";
import React from "react";
import ProductGallery from "./ProductGallery";
import VariantSelector from "./VariantSelector";
import AddToCart from "./AddToCart";
import { useProductStore } from "@/store/variantStore";
import { ProductHelper } from "@/types/product";
import type { Product } from "@/types/product";
import { formatPrice } from "@/lib/utils/formatPrice";

interface ProductDetailsProps {
  product: Product;
}

function ProductDetails({ product }: ProductDetailsProps) {
  const { selectedVariant } = useProductStore();
  const helper = new ProductHelper(product);
  const breadCrumbs = helper.getBreadcrumbs();
  const brandName = helper.getBrandName();
  const displayTitle = helper.getDisplayTitle();

  return (
    <div className="">
      <ProductGallery
        mainImage={product.sanity.mainImage}
        galleryImages={product.sanity.gallery}
        title={displayTitle}
      />
      <div className="mt-4 ml-2">
        <span className="text-sm text-gray-500">
          {breadCrumbs.map((crumb, index) => (
            <span key={index}>
              {index > 0 && " > "}
              {crumb.href ? (
                <a
                  href={crumb.href}
                  className="hover:text-gray-700 hover:underline cursor-pointer"
                >
                  {crumb.label}
                </a>
              ) : (
                <span className="text-gray-900">{crumb.label}</span>
              )}
            </span>
          ))}
        </span>
      </div>

      <div className="flex justify-between items-center mt-4">
        <p className="ml-2 text-md font-semibold">{brandName}</p>
      </div>
      <div className="flex justify-between items-center">
        <p className="ml-2">{displayTitle}</p>
        <p className="mr-2">
          {formatPrice(helper.getPrice().amount)}{" "}
          {helper.getPrice().currencyCode}
        </p>
      </div>

      <VariantSelector product={product} />
      <AddToCart
        product={{
          title: displayTitle,
          handle: product.shopify.handle,
          productImage: helper.getMainImage() || "",
          brand: brandName || "",
          currencyCode: helper.getPrice().currencyCode || "",
        }}
        selectedVariant={selectedVariant}
      />
    </div>
  );
}

export default ProductDetails;
