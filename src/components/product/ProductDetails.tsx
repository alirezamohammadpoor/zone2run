"use client";
import React from "react";
import Link from "next/link";
import ProductGallery from "./ProductGallery";
import VariantSelector from "./VariantSelector";
import AddToCart from "./AddToCart";
import { useProductStore } from "@/store/variantStore";
import type { SanityProduct } from "@/types/sanityProduct";
import { formatPrice } from "@/lib/utils/formatPrice";
import { useRouter } from "next/navigation";
import { getBrandUrl } from "@/lib/utils/brandUrls";

interface ProductDetailsProps {
  product: SanityProduct;
}

function ProductDetails({ product }: ProductDetailsProps) {
  const { selectedVariant } = useProductStore();
  const router = useRouter();
  // Simple helper functions for SanityProduct
  const getBreadcrumbs = () => {
    const breadcrumbs = [];

    // Add gender
    if (product.gender === "mens" || product.gender === "womens") {
      const formattedGender = product.gender === "womens" ? "Women's" : "Men's";
      breadcrumbs.push({
        label: formattedGender,
        href: `/${product.gender}`,
      });
    }

    // Add category hierarchy - handle 3-level structure (main/sub/specific)
    if (
      product.category?.categoryType === "specific" &&
      product.category.parentCategory?.parentCategory?.title
    ) {
      // 3-level: main > sub > specific
      breadcrumbs.push({
        label: product.category.parentCategory.parentCategory.title,
        href: `/${product.gender}/${product.category.parentCategory.parentCategory.slug}`,
      });
      breadcrumbs.push({
        label: product.category.parentCategory.title,
        href: `/${product.gender}/${product.category.parentCategory.parentCategory.slug}/${product.category.parentCategory.slug}`,
      });
      breadcrumbs.push({
        label: product.category.title,
        href: `/${product.gender}/${product.category.parentCategory.parentCategory.slug}/${product.category.parentCategory.slug}/${product.category.slug}`,
      });
    } else if (
      product.category?.categoryType === "subcategory" &&
      product.category.parentCategory?.title
    ) {
      // 2-level: main > sub
      breadcrumbs.push({
        label: product.category.parentCategory.title,
        href: `/${product.gender}/${product.category.parentCategory.slug}`,
      });
      breadcrumbs.push({
        label: product.category.title,
        href: `/${product.gender}/${product.category.parentCategory.slug}/${product.category.slug}`,
      });
    } else if (
      product.category?.categoryType === "main" &&
      product.category.title
    ) {
      // 1-level: main only
      breadcrumbs.push({
        label: product.category.title,
        href: `/${product.gender}/${product.category.slug}`,
      });
    } else if (product.category?.title) {
      // Fallback for any other category type
      breadcrumbs.push({
        label: product.category.title,
        href: `/${product.gender}/${product.category.slug}`,
      });
    }

    // Add current product
    breadcrumbs.push({
      label: product.title,
      href: `/products/${product.handle}`,
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
        galleryImages={product.gallery}
        title={displayTitle}
      />
      <div className="mt-4 ml-2">
        <span className="text-sm text-gray-500">
          {breadCrumbs.map((crumb, index) => (
            <span key={index}>
              {index > 0 && " > "}
              {crumb.href ? (
                <Link
                  href={crumb.href}
                  className="hover:text-gray-700 hover:underline cursor-pointer"
                >
                  {crumb.label}
                </Link>
              ) : (
                <span className="text-gray-900">{crumb.label}</span>
              )}
            </span>
          ))}
        </span>
      </div>

      <div className="flex justify-between items-center mt-4">
        {product.brand?.slug ? (
          <Link
            href={getBrandUrl(product.brand.slug)}
            className="ml-2 text-md font-semibold hover:underline cursor-pointer"
          >
            {brandName}
          </Link>
        ) : (
          <p className="ml-2 text-md font-semibold">{brandName}</p>
        )}
      </div>
      <div className="flex justify-between items-center">
        <p className="ml-2 w-[70%]">{displayTitle}</p>
        <p className="mr-2">
          {formatPrice(getPrice().amount)} {getPrice().currencyCode}
        </p>
      </div>

      <VariantSelector product={product} />
      <AddToCart product={product} selectedVariant={selectedVariant} />
    </div>
  );
}

export default ProductDetails;
