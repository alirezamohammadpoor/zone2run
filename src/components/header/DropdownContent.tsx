"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { urlFor } from "@/sanity/lib/image";
import { getBrandUrl } from "@/lib/utils/brandUrls";
import type { BrandMenuItem, CollectionMenuItem, MenuData } from "@/types/menu";

interface DropdownContentProps {
  type: "men" | "women";
  onClose: () => void;
  data: MenuData[string];
  brands?: BrandMenuItem[];
  featuredCollections?: CollectionMenuItem[];
}

export default function DropdownContent({
  type,
  onClose,
  data,
  brands,
  featuredCollections,
}: DropdownContentProps) {
  const router = useRouter();
  const [openCategories, setOpenCategories] = useState<Set<string>>(new Set());
  const [openSubcategories, setOpenSubcategories] = useState<Set<string>>(
    new Set()
  );

  const genderPath = type === "men" ? "mens" : "womens";

  const toggleCategory = (categorySlug: string) => {
    setOpenCategories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(categorySlug)) {
        newSet.delete(categorySlug);
      } else {
        newSet.add(categorySlug);
      }
      return newSet;
    });
  };

  const toggleSubcategory = (subcategorySlug: string) => {
    setOpenSubcategories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(subcategorySlug)) {
        newSet.delete(subcategorySlug);
      } else {
        newSet.add(subcategorySlug);
      }
      return newSet;
    });
  };

  const handleViewAllClick = (categorySlug: string) => {
    router.push(`/${genderPath}/${categorySlug}`);
    onClose();
  };

  const handleSubcategoryClick = (
    subcategorySlug: string,
    mainCategorySlug: string
  ) => {
    router.push(`/${genderPath}/${mainCategorySlug}/${subcategorySlug}`);
    onClose();
  };

  const handleSubSubcategoryClick = (
    mainCategorySlug: string,
    subcategorySlug: string,
    subSubcategorySlug: string
  ) => {
    router.push(
      `/${genderPath}/${mainCategorySlug}/${subcategorySlug}/${subSubcategorySlug}`
    );
    onClose();
  };

  const handleBrandClick = (brandSlug: string) => {
    router.push(`${getBrandUrl(brandSlug)}?gender=${genderPath}`);
    onClose();
  };

  const handleCollectionClick = (collectionSlug: string) => {
    router.push(`/collections/${collectionSlug}`);
    onClose();
  };

  return (
    <div className="flex justify-between py-4 px-4">
      {/* Left side - Categories and Brands */}
      <div className="flex gap-16">
        {/* Categories Column */}
        <div>
          <h3 className="text-xs mb-4">Categories</h3>
          <div className="space-y-2">
            {Object.entries(data || {}).map(([category, subcategories]) => {
              const isOpen = openCategories.has(category);
              return (
                <div key={category}>
                  <button
                    onClick={() => toggleCategory(category)}
                    className="w-full text-left flex justify-between items-center py-1"
                  >
                    <span className="text-xs capitalize hover:text-gray-500">
                      {category}
                    </span>
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 5 8"
                      style={{
                        transform: isOpen ? "rotate(90deg)" : "rotate(0deg)",
                        transition: "transform 0.2s ease-in-out",
                      }}
                      className="w-2 h-2 text-black"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M0.707107 7.70711L0 7L3.14645 3.85355L0 0.707107L0.707107 0L4.56066 3.85355L0.707107 7.70711Z"
                        fill="currentColor"
                      />
                    </svg>
                  </button>

                  <div
                    className={`ml-3 space-y-1 overflow-hidden transition-all duration-300 ${
                      isOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
                    }`}
                  >
                    <button
                      className="text-xs text-gray-600 hover:text-black py-1"
                      onClick={() => handleViewAllClick(category)}
                    >
                      View All{" "}
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </button>

                    {(subcategories as any[]).map((subcategory: any) => {
                      const isSubOpen = openSubcategories.has(
                        subcategory.slug.current
                      );
                      const subSubcats = subcategory.subSubcategories || [];

                      return (
                        <div key={subcategory._id}>
                          {subSubcats.length > 0 ? (
                            <>
                              <button
                                onClick={() =>
                                  toggleSubcategory(subcategory.slug.current)
                                }
                                className="w-full text-left flex justify-between items-center py-1"
                              >
                                <span className="text-xs hover:text-gray-500">
                                  {subcategory.title}
                                </span>
                                <svg
                                  aria-hidden="true"
                                  viewBox="0 0 5 8"
                                  style={{
                                    transform: isSubOpen
                                      ? "rotate(90deg)"
                                      : "rotate(0deg)",
                                    transition: "transform 0.2s ease-in-out",
                                  }}
                                  className="w-2 h-2 text-black"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    fillRule="evenodd"
                                    clipRule="evenodd"
                                    d="M0.707107 7.70711L0 7L3.14645 3.85355L0 0.707107L0.707107 0L4.56066 3.85355L0.707107 7.70711Z"
                                    fill="currentColor"
                                  />
                                </svg>
                              </button>

                              <div
                                className={`ml-3 space-y-1 overflow-hidden transition-all duration-300 ${
                                  isSubOpen
                                    ? "max-h-[300px] opacity-100"
                                    : "max-h-0 opacity-0"
                                }`}
                              >
                                {subSubcats.map((subSubcat: any) => (
                                  <button
                                    key={subSubcat._id}
                                    className="block text-xs text-gray-600 hover:text-black py-1"
                                    onClick={() =>
                                      handleSubSubcategoryClick(
                                        category,
                                        subcategory.slug.current,
                                        subSubcat.slug.current
                                      )
                                    }
                                  >
                                    {subSubcat.title}
                                  </button>
                                ))}
                              </div>
                            </>
                          ) : (
                            <button
                              className="block text-xs hover:text-gray-500 py-1"
                              onClick={() =>
                                handleSubcategoryClick(
                                  subcategory.slug.current,
                                  category
                                )
                              }
                            >
                              {subcategory.title}
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Brands Column - Multi-column grid */}
        <div>
          <h3 className="text-xs mb-4">Brands</h3>
          <div className="grid grid-cols-1">
            {brands?.map((brand) => {
              if (!brand?.slug?.current) return null;
              return (
                <button
                  key={brand._id || brand.slug.current}
                  className="text-xs hover:text-gray-500 py-1 text-left"
                  onClick={() => handleBrandClick(brand.slug.current)}
                >
                  {brand.name}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Featured Collections Column - Right side */}
      <div className="w-[50vw]">
        <h3 className="text-xs mb-2">Featured Collections</h3>
        <div className="grid grid-cols-4 gap-1">
          {featuredCollections?.slice(0, 4).map((collection) => {
            if (!collection?.slug?.current) return null;
            return (
              <div
                key={collection._id || collection.slug.current}
                className="cursor-pointer group"
                onClick={() => handleCollectionClick(collection.slug.current)}
              >
                <div className="aspect-[3/4] relative overflow-hidden">
                  {collection.menuImage?.asset?.url ? (
                    <Image
                      src={urlFor(collection.menuImage).url()}
                      alt={
                        collection.menuImage.alt ||
                        collection.title ||
                        "Collection"
                      }
                      fill
                      className="object-cover"
                      sizes="(min-width: 1280px) 12.5vw, 150px"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <span className="text-xs text-gray-500">
                        {collection.title}
                      </span>
                    </div>
                  )}
                </div>
                <p className="text-xs mt-2 group-hover:underline">
                  {collection.title}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
