"use client";

import { useState, useCallback, memo } from "react";
import Image from "next/image";
import LocaleLink from "@/components/LocaleLink";
import { getBrandUrl } from "@/lib/utils/brandUrls";
import type {
  BrandMenuItem,
  CollectionMenuItem,
  MenuData,
  SubcategoryMenuItem,
  SubSubcategoryMenuItem,
} from "@/types/menu";

interface DropdownContentProps {
  type: "men" | "women";
  onClose: () => void;
  data: MenuData[string];
  brands?: BrandMenuItem[];
  featuredCollections?: CollectionMenuItem[];
}

// Define the order of main categories
const CATEGORY_ORDER = ["clothing", "footwear", "accessories"];

const DropdownContent = memo(function DropdownContent({
  type,
  onClose,
  data,
  brands,
  featuredCollections,
}: DropdownContentProps) {
  const genderPath = type === "men" ? "mens" : "womens";

  // Track expanded subcategories (for those with sub-subcategories)
  const [openSubcategories, setOpenSubcategories] = useState<Set<string>>(
    new Set()
  );

  // Memoized toggle to prevent re-renders
  const toggleSubcategory = useCallback((subcategorySlug: string) => {
    setOpenSubcategories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(subcategorySlug)) {
        newSet.delete(subcategorySlug);
      } else {
        newSet.add(subcategorySlug);
      }
      return newSet;
    });
  }, []);

  // Sort categories by defined order
  const sortedCategories = CATEGORY_ORDER.filter(
    (cat) => data && cat in data
  ).map((cat) => [cat, data[cat]] as const);

  return (
    <div className="flex justify-between py-4 px-4">
      {/* Left side - Categories as columns and Brands */}
      <div className="flex gap-12">
        {/* Main Categories as separate columns */}
        {sortedCategories.map(([category, subcategories]) => (
          <div key={category}>
            <LocaleLink
              href={`/${genderPath}/${category}`}
              onClick={onClose}
              prefetch={true}
              className="text-xs mb-3 capitalize hover:text-gray-500 block"
              aria-label={`View all ${category}`}
            >
              {category}
            </LocaleLink>
            <div className="space-y-1">
              {(subcategories as SubcategoryMenuItem[]).map((subcategory) => {
                const subSubcats = subcategory.subSubcategories || [];
                const isSubOpen = openSubcategories.has(
                  subcategory.slug.current
                );

                return (
                  <div key={subcategory._id}>
                    {subSubcats.length > 0 ? (
                      <>
                        <button
                          onClick={() =>
                            toggleSubcategory(subcategory.slug.current)
                          }
                          className="w-full text-left flex justify-between items-center py-0.5"
                          aria-expanded={isSubOpen}
                          aria-controls={`subcategory-${subcategory.slug.current}`}
                        >
                          <span className="text-xs text-black hover:text-gray-500">
                            {subcategory.title}
                          </span>
                          <svg
                            aria-hidden="true"
                            viewBox="0 0 5 8"
                            className={`w-2 h-2 text-black ml-2 transition-transform duration-200 ${
                              isSubOpen ? "rotate-90" : "rotate-0"
                            }`}
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
                          id={`subcategory-${subcategory.slug.current}`}
                          className={`ml-3 space-y-1 overflow-hidden transition-all duration-300 ${
                            isSubOpen
                              ? "max-h-[300px] opacity-100"
                              : "max-h-0 opacity-0"
                          }`}
                          inert={!isSubOpen ? true : undefined}
                        >
                          {subSubcats.map(
                            (subSubcat: SubSubcategoryMenuItem) => (
                              <LocaleLink
                                key={subSubcat._id}
                                href={`/${genderPath}/${category}/${subcategory.slug.current}/${subSubcat.slug.current}`}
                                onClick={onClose}
                                className="block text-xs text-black hover:text-gray-500 py-0.5"
                              >
                                {subSubcat.title}
                              </LocaleLink>
                            )
                          )}
                        </div>
                      </>
                    ) : (
                      <LocaleLink
                        href={`/${genderPath}/${category}/${subcategory.slug.current}`}
                        onClick={onClose}
                        className="block text-xs text-black hover:text-gray-500 py-0.5"
                      >
                        {subcategory.title}
                      </LocaleLink>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {/* Brands Column */}
        <div>
          <h3 className="text-xs mb-3 mt-2">Brands</h3>
          <div className="space-y-1">
            {brands?.map((brand) => {
              if (!brand?.slug?.current) return null;
              return (
                <LocaleLink
                  key={brand._id || brand.slug.current}
                  href={`${getBrandUrl(brand.slug.current)}?gender=${genderPath}`}
                  onClick={onClose}
                  className="block text-xs text-black hover:text-gray-500 py-0.5"
                >
                  {brand.name}
                </LocaleLink>
              );
            })}
          </div>
        </div>
      </div>

      {/* Featured Collections Column - Right side */}
      <div className="w-[50vw]">
        <h3 className="text-xs mb-3 mt-2">Featured Collections</h3>
        <div className="grid grid-cols-4 gap-1">
          {featuredCollections?.slice(0, 4).map((collection) => {
            if (!collection?.slug?.current) return null;
            return (
              <LocaleLink
                key={collection._id || collection.slug.current}
                href={`/collections/${collection.slug.current}`}
                className="group"
                onClick={onClose}
              >
                <div className="aspect-[3/4] relative overflow-hidden">
                  {collection.menuImage?.asset?.url ? (
                    <Image
                      src={collection.menuImage.asset.url}
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
              </LocaleLink>
            );
          })}
        </div>
      </div>
    </div>
  );
});

export default DropdownContent;
