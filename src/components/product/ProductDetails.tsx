"use client";
import React from "react";
import ProductGallery from "./ProductGallery";
import VariantSelector from "./VariantSelector";
import AddToCart from "./AddToCart";
import { useProductStore } from "@/store/variantStore";
import type { SanityProduct } from "@/types/sanityProduct";
import { formatPrice } from "@/lib/utils/formatPrice";

interface ProductDetailsProps {
  product: SanityProduct;
}

function ProductDetails({ product }: ProductDetailsProps) {
  const { selectedVariant } = useProductStore();

  // Simple helper functions for SanityProduct
  const getBreadcrumbs = () => {
    const breadcrumbs = [];

    // Add gender
    if (product.gender === "mens" || product.gender === "womens") {
      const formattedGender = product.gender === "womens" ? "Women's" : "Men's";
      const frontendGender = product.gender === "womens" ? "women" : "men";
      breadcrumbs.push({
        label: formattedGender,
        href: `/products/${frontendGender}`,
      });
    }

    // Add category hierarchy
    if (
      product.category?.categoryType === "sub" &&
      product.category.parentCategory?.title
    ) {
      const frontendGender = product.gender === "womens" ? "women" : "men";
      breadcrumbs.push({
        label: product.category.parentCategory.title,
        href: `/products/${frontendGender}/${product.category.parentCategory.slug}`,
      });
      breadcrumbs.push({
        label: product.category.title,
        href: `/products/${frontendGender}/${product.category.parentCategory.slug}/${product.category.slug}`,
      });
    } else if (product.category?.title) {
      const frontendGender = product.gender === "womens" ? "women" : "men";
      breadcrumbs.push({
        label: product.category.title,
        href: `/products/${frontendGender}/${product.category.slug}`,
      });
    }

    // Add current product
    breadcrumbs.push({
      label: product.title,
      href: `/products/item/${product.handle}`,
    });

    return breadcrumbs;
  };

  const getBrandName = () => product.brand?.name || product.vendor;
  const getDisplayTitle = () => product.title;
  const getMainImage = () => product.mainImage?.url || "";
  const getPrice = () => ({
    amount: product.priceRange.minVariantPrice,
    currencyCode: "SEK",
  });

  const breadCrumbs = getBreadcrumbs();
  const brandName = getBrandName();
  const displayTitle = getDisplayTitle();

  return (
    <div className="">
      <ProductGallery
        mainImage={product.mainImage}
        galleryImages={[]} // TODO: Add gallery support later
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
          {formatPrice(getPrice().amount)} {getPrice().currencyCode}
        </p>
      </div>

      <VariantSelector product={product} />
      <AddToCart
        product={{
          title: displayTitle,
          handle: product.handle,
          productImage: getMainImage(),
          brand: brandName || "",
          currencyCode: getPrice().currencyCode,
        }}
        selectedVariant={selectedVariant}
      />
    </div>
  );
}

export default ProductDetails;
