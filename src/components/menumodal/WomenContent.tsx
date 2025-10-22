"use client";

import {
  getMainCategoryBySub,
  getSubSubcategoriesByParentAndGender,
} from "@/sanity/lib/getData";
import { useRouter } from "next/navigation";
import { useState } from "react";

function WomenContent({ onClose, data }: { onClose: () => void; data: any }) {
  const router = useRouter();
  const [openCategories, setOpenCategories] = useState<Set<string>>(new Set());
  const [openSubcategories, setOpenSubcategories] = useState<Set<string>>(
    new Set()
  );
  const [subSubcategories, setSubSubcategories] = useState<{
    [key: string]: any[];
  }>({});

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

  const toggleSubcategory = async (
    subcategorySlug: string,
    mainCategorySlug: string
  ) => {
    setOpenSubcategories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(subcategorySlug)) {
        newSet.delete(subcategorySlug);
      } else {
        newSet.add(subcategorySlug);
        // Fetch sub-subcategories when opening
        fetchSubSubcategories(subcategorySlug, mainCategorySlug);
      }
      return newSet;
    });
  };

  const fetchSubSubcategories = async (
    subcategorySlug: string,
    mainCategorySlug: string
  ) => {
    try {
      const subSubcats = await getSubSubcategoriesByParentAndGender(
        subcategorySlug,
        "women"
      );
      setSubSubcategories((prev) => ({
        ...prev,
        [subcategorySlug]: subSubcats || [],
      }));
    } catch (error) {
      console.error(
        `Error fetching sub-subcategories for ${subcategorySlug}:`,
        error
      );
      setSubSubcategories((prev) => ({
        ...prev,
        [subcategorySlug]: [],
      }));
    }
  };

  const handleSubcategoryClick = async (subcategorySlug: string) => {
    try {
      const subcategoryData = await getMainCategoryBySub(subcategorySlug);
      if (subcategoryData?.parentCategory?.slug?.current) {
        router.push(
          `/womens/${subcategoryData.parentCategory.slug.current}/${subcategorySlug}`
        );
        onClose();
      } else {
        console.error(
          `No parent category found for subcategory: ${subcategorySlug}`
        );
      }
    } catch (error) {
      console.error(
        `Error navigating to subcategory ${subcategorySlug}:`,
        error
      );
    }
  };

  const handleSubSubcategoryClick = (
    mainCategorySlug: string,
    subcategorySlug: string,
    subSubcategorySlug: string
  ) => {
    router.push(
      `/womens/${mainCategorySlug}/${subcategorySlug}/${subSubcategorySlug}`
    );
    onClose();
  };

  const handleViewAllClick = (categorySlug: string) => {
    router.push(`/womens/${categorySlug}`);
    onClose();
  };

  const handleViewAllSubcategoryClick = (
    mainCategorySlug: string,
    subcategorySlug: string
  ) => {
    router.push(`/womens/${mainCategorySlug}/${subcategorySlug}`);
    onClose();
  };

  return (
    <div>
      {Object.entries(data || {}).map(([category, subcategories]) => {
        const isOpen = openCategories.has(category);
        return (
          <div key={category} className="border-b">
            <div className="p-4 py-3">
              <button
                onClick={() => toggleCategory(category)}
                className="w-full text-left flex justify-between items-center"
              >
                <span className="font-medium text-sm capitalize">
                  {category}
                </span>
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
                  isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                }`}
              >
                {/* View All button */}
                <button
                  className="text-sm hover:text-gray-500 pl-2 font-medium text-left w-full"
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
                  const subSubcats =
                    subSubcategories[subcategory.slug.current] || [];

                  return (
                    <div key={subcategory._id} className="pl-2">
                      <button
                        className="text-sm hover:text-gray-500 text-left w-full flex justify-between items-center"
                        onClick={() =>
                          toggleSubcategory(subcategory.slug.current, category)
                        }
                      >
                        <span>{subcategory.title}</span>
                        {subSubcats.length > 0 && (
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
                        )}
                      </button>

                      {/* Sub-subcategories */}
                      {subSubcats.length > 0 && (
                        <div
                          className={`ml-2 space-y-1 overflow-hidden transition-all duration-500 ease-in-out ${
                            isSubOpen
                              ? "max-h-96 opacity-100"
                              : "max-h-0 opacity-0"
                          }`}
                        >
                          {/* View All button for subcategory */}
                          <button
                            className="text-xs hover:text-gray-500 pl-2 text-left w-full font-medium"
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
    </div>
  );
}

export default WomenContent;
