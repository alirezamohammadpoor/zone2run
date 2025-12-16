"use client";

import { useRouter } from "next/navigation";
import { useState, useCallback, useEffect } from "react";
import Image from "next/image";
import useEmblaCarousel from "embla-carousel-react";
import { getBrandUrl } from "@/lib/utils/brandUrls";
import { urlFor } from "@/sanity/lib/image";
import type { BrandMenuItem, CollectionMenuItem, MenuData } from "@/types/menu";

function MenContent({
  onClose,
  data,
  brands,
  featuredCollections,
}: {
  onClose: () => void;
  data: MenuData[string];
  brands?: BrandMenuItem[];
  featuredCollections?: CollectionMenuItem[];
}) {
  const router = useRouter();
  const [openCategories, setOpenCategories] = useState<Set<string>>(new Set());
  const [openSubcategories, setOpenSubcategories] = useState<Set<string>>(
    new Set()
  );
  const [openBrands, setOpenBrands] = useState<Set<string>>(new Set());
  const [isDragging, setIsDragging] = useState(false);
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    containScroll: "trimSnaps",
    dragFree: false,
  });

  // Handle embla carousel drag state
  useEffect(() => {
    if (!emblaApi) return;

    const onSettle = () => setIsDragging(false);
    const onScroll = () => setIsDragging(true);

    emblaApi.on("settle", onSettle);
    emblaApi.on("scroll", onScroll);

    return () => {
      emblaApi.off("settle", onSettle);
      emblaApi.off("scroll", onScroll);
    };
  }, [emblaApi]);

  const toggleBrand = (brandSlug: string) => {
    setOpenBrands((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(brandSlug)) {
        newSet.delete(brandSlug);
      } else {
        newSet.add(brandSlug);
      }
      return newSet;
    });
  };

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

  const toggleSubcategory = (
    subcategorySlug: string,
    mainCategorySlug: string
  ) => {
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

  const handleSubcategoryClick = (
    subcategorySlug: string,
    mainCategorySlug: string
  ) => {
    router.push(`/mens/${mainCategorySlug}/${subcategorySlug}`);
    onClose();
  };

  const handleSubSubcategoryClick = (
    mainCategorySlug: string,
    subcategorySlug: string,
    subSubcategorySlug: string
  ) => {
    router.push(
      `/mens/${mainCategorySlug}/${subcategorySlug}/${subSubcategorySlug}`
    );
    onClose();
  };

  const handleViewAllClick = (categorySlug: string) => {
    router.push(`/mens/${categorySlug}`);
    onClose();
  };

  const handleViewAllSubcategoryClick = (
    mainCategorySlug: string,
    subcategorySlug: string
  ) => {
    router.push(`/mens/${mainCategorySlug}/${subcategorySlug}`);
    onClose();
  };

  const handleBrandClick = (brandSlug: string) => {
    router.push(`${getBrandUrl(brandSlug)}?gender=mens`);
    onClose();
  };

  const handleCollectionClick = useCallback(
    (e: React.MouseEvent, collectionSlug: string) => {
      if (!isDragging) {
        router.push(`/collections/${collectionSlug}`);
        onClose();
      }
    },
    [router, onClose, isDragging]
  );

  const handleViewAllBrandsClick = () => {
    router.push("/brands");
    onClose();
  };

  return (
    <div className="mt-2">
      {Object.entries(data || {}).map(([category, subcategories]) => {
        const isOpen = openCategories.has(category);
        return (
          // <div key={category} className="border-b">
          <div key={category}>
            <div className="px-2 py-2">
              <button
                onClick={() => toggleCategory(category)}
                className="w-full text-left flex justify-between items-center"
              >
                <span className="text-xs capitalize">{category}</span>
                <svg
                  aria-hidden="true"
                  viewBox="0 0 5 8"
                  style={{
                    transform: isOpen ? "rotate(90deg)" : "rotate(0deg)",
                    transition: "transform 0.3s ease-in-out",
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
                className={`mt-2 space-y-2 overflow-hidden transition-all duration-700 ease-in-out ${
                  isOpen ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"
                }`}
              >
                {/* View All button */}
                <button
                  className="text-xs hover:text-gray-500 pl-2 text-left w-full"
                  onClick={() => handleViewAllClick(category)}
                >
                  View All{" "}
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </button>

                {/* Subcategories */}
                {(subcategories as any[]).map((subcategory: any) => {
                  const isSubOpen = openSubcategories.has(
                    subcategory.slug.current
                  );
                  const subSubcats = subcategory.subSubcategories || [];

                  return (
                    <div key={subcategory._id} className="pl-2">
                      <div className="flex justify-between items-center w-full">
                        {subSubcats.length > 0 ? (
                          <>
                            <button
                              className="text-xs hover:text-gray-500 text-left flex-1"
                              onClick={() =>
                                toggleSubcategory(
                                  subcategory.slug.current,
                                  category
                                )
                              }
                            >
                              {subcategory.title}
                            </button>
                            <button
                              onClick={() =>
                                toggleSubcategory(
                                  subcategory.slug.current,
                                  category
                                )
                              }
                              className="ml-2 p-1"
                            >
                              <svg
                                aria-hidden="true"
                                viewBox="0 0 5 8"
                                style={{
                                  transform: isSubOpen
                                    ? "rotate(90deg)"
                                    : "rotate(0deg)",
                                  transition: "transform 0.3s ease-in-out",
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
                          </>
                        ) : (
                          <button
                            className="text-xs hover:text-gray-500 text-left flex-1"
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

                      {/* Sub-subcategories */}
                      {subSubcats.length > 0 && (
                        <div
                          className={`ml-2 space-y-1 overflow-hidden transition-all duration-500 ease-in-out ${
                            isSubOpen
                              ? "max-h-[500px] opacity-100"
                              : "max-h-0 opacity-0"
                          }`}
                        >
                          {/* View All button for subcategory */}
                          <button
                            className="text-xs hover:text-gray-500 pl-2 text-left w-full"
                            onClick={() =>
                              handleViewAllSubcategoryClick(
                                category,
                                subcategory.slug.current
                              )
                            }
                          >
                            View All {subcategory.title}
                          </button>

                          {subSubcats.map((subSubcat: any) => (
                            <button
                              key={subSubcat._id}
                              className="text-xs hover:text-gray-500 pl-2 text-left w-full"
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
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })}

      {/* Brands Section */}
      {brands && brands.length > 0 && (
        // <div className="border-b border-t">
        <div>
          <div className="px-2 py-2">
            <button
              onClick={() => toggleBrand("brands")}
              className="w-full text-left flex justify-between items-center"
            >
              <span className="text-xs">Brands</span>
              <svg
                aria-hidden="true"
                viewBox="0 0 5 8"
                style={{
                  transform: openBrands.has("brands")
                    ? "rotate(90deg)"
                    : "rotate(0deg)",
                  transition: "transform 0.3s ease-in-out",
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
              className={`mt-2 space-y-2 overflow-hidden transition-all duration-700 ease-in-out ${
                openBrands.has("brands")
                  ? "max-h-[1000px] opacity-100"
                  : "max-h-0 opacity-0"
              }`}
            >
              {/* Brand list */}
              {brands.map((brand: any) => {
                if (!brand?.slug?.current) return null;
                return (
                  <button
                    key={brand._id || brand.slug.current}
                    className="text-xs hover:text-gray-500 pl-2 text-left w-full"
                    onClick={() => handleBrandClick(brand.slug.current)}
                  >
                    {brand.name || brand.title}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
      {/* Collections Section */}
      {featuredCollections && featuredCollections.length > 0 && (
        <div>
          <div className="px-2 mt-4">
            <span className="text-xs">Featured Collections</span>

            {/* Collection carousel */}
            <div className="mt-2 overflow-hidden -mx-2 px-2" ref={emblaRef}>
              <div className="flex gap-2">
                {featuredCollections.map((collection: CollectionMenuItem) => {
                  if (!collection?.slug?.current) return null;
                  return (
                    <div
                      key={collection._id || collection.slug.current}
                      className={`flex-shrink-0 w-[70vw] min-w-0 aspect-[3/4] flex flex-col cursor-pointer ${
                        isDragging ? "pointer-events-none" : ""
                      }`}
                      onClick={(e) =>
                        handleCollectionClick(e, collection.slug.current)
                      }
                    >
                      <div className="w-full h-full relative bg-gray-100">
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
                            sizes="70vw"
                            draggable={false}
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                            <span className="text-xs text-gray-500">
                              {collection.title}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="mt-2 mb-4">
                        <p className="text-xs hover:underline cursor-pointer">
                          {collection.title}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
export default MenContent;
