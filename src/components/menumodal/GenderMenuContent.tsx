"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { getBrandUrl } from "@/lib/utils/brandUrls";
import { urlFor } from "@/sanity/lib/image";
import { useSetToggle } from "@/hooks/useSetToggle";
import { ChevronRightIcon } from "@/components/icons/ChevronRightIcon";
import { NavLink } from "@/components/ui/NavLink";
import type {
  BrandMenuItem,
  CollectionMenuItem,
  MenuData,
  SubcategoryMenuItem,
  SubSubcategoryMenuItem,
} from "@/types/menu";

interface GenderMenuContentProps {
  gender: "mens" | "womens";
  onClose: () => void;
  data: MenuData[string];
  brands?: BrandMenuItem[];
  featuredCollections?: CollectionMenuItem[];
}

function GenderMenuContent({
  gender,
  onClose,
  data,
  brands,
  featuredCollections,
}: GenderMenuContentProps) {
  const { has: hasCategory, toggle: toggleCategory } = useSetToggle<string>();
  const { has: hasSubcategory, toggle: toggleSubcategory } =
    useSetToggle<string>();
  const { has: hasBrand, toggle: toggleBrand } = useSetToggle<string>();

  // Pointer-based drag detection (replaces Embla scroll/settle events)
  const pointerStartRef = useRef<{ x: number; y: number } | null>(null);
  const hasDraggedRef = useRef(false);

  const handlePointerDown = (e: React.PointerEvent) => {
    pointerStartRef.current = { x: e.clientX, y: e.clientY };
    hasDraggedRef.current = false;
  };
  const handlePointerMove = (e: React.PointerEvent) => {
    if (!pointerStartRef.current) return;
    const dx = Math.abs(e.clientX - pointerStartRef.current.x);
    const dy = Math.abs(e.clientY - pointerStartRef.current.y);
    if (dx > 10 || dy > 10) hasDraggedRef.current = true;
  };
  const handleLinkClick = (e: React.MouseEvent) => {
    if (hasDraggedRef.current) {
      e.preventDefault();
    } else {
      onClose();
    }
  };

  // Gender path for URLs (e.g., "/mens/" or "/womens/")
  const genderPath = `/${gender}`;

  return (
    <div className="mt-2">
      {Object.entries(data || {}).map(([category, subcategories]) => {
        const isOpen = hasCategory(category);
        return (
          <div key={category}>
            <div className="px-2 py-2">
              <button
                onClick={() => toggleCategory(category)}
                className="w-full text-left flex justify-between items-center"
              >
                <span className="text-xs capitalize">{category}</span>
                <ChevronRightIcon
                  className="w-2 h-2 text-black"
                  rotate={isOpen ? 90 : 0}
                  animated
                />
              </button>

              <div
                className={`mt-2 space-y-2 overflow-hidden transition-all duration-700 ease-in-out ${
                  isOpen ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"
                }`}
              >
                {/* View All button */}
                <NavLink
                  href={`${genderPath}/${category}`}
                  onClick={onClose}
                  prefetch={true}
                  className="pl-2"
                >
                  View All {category.charAt(0).toUpperCase() + category.slice(1)}
                </NavLink>

                {/* Subcategories */}
                {(subcategories as SubcategoryMenuItem[]).map((subcategory) => {
                  const isSubOpen = hasSubcategory(subcategory.slug.current);
                  const subSubcats = subcategory.subSubcategories || [];

                  return (
                    <div key={subcategory._id} className="pl-2">
                      <div className="flex justify-between items-center w-full">
                        {subSubcats.length > 0 ? (
                          <>
                            <button
                              className="text-xs hover:text-gray-500 text-left flex-1"
                              onClick={() =>
                                toggleSubcategory(subcategory.slug.current)
                              }
                            >
                              {subcategory.title}
                            </button>
                            <button
                              onClick={() =>
                                toggleSubcategory(subcategory.slug.current)
                              }
                              className="ml-2 p-1"
                            >
                              <ChevronRightIcon
                                className="w-2 h-2 text-black"
                                rotate={isSubOpen ? 90 : 0}
                                animated
                              />
                            </button>
                          </>
                        ) : (
                          <NavLink
                            href={`${genderPath}/${category}/${subcategory.slug.current}`}
                            onClick={onClose}
                            className="flex-1"
                          >
                            {subcategory.title}
                          </NavLink>
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
                          <NavLink
                            href={`${genderPath}/${category}/${subcategory.slug.current}`}
                            onClick={onClose}
                            prefetch={true}
                            className="pl-2"
                          >
                            View All {subcategory.title}
                          </NavLink>

                          {subSubcats.map((subSubcat: SubSubcategoryMenuItem) => (
                            <NavLink
                              key={subSubcat._id}
                              href={`${genderPath}/${category}/${subcategory.slug.current}/${subSubcat.slug.current}`}
                              onClick={onClose}
                              className="pl-2"
                            >
                              {subSubcat.title}
                            </NavLink>
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
        <div>
          <div className="px-2 py-2">
            <button
              onClick={() => toggleBrand("brands")}
              className="w-full text-left flex justify-between items-center"
            >
              <span className="text-xs">Brands</span>
              <ChevronRightIcon
                className="w-2 h-2 text-black"
                rotate={hasBrand("brands") ? 90 : 0}
                animated
              />
            </button>

            <div
              className={`mt-2 space-y-2 overflow-hidden transition-all duration-700 ease-in-out ${
                hasBrand("brands")
                  ? "max-h-[1000px] opacity-100"
                  : "max-h-0 opacity-0"
              }`}
            >
              {/* Brand list */}
              {brands.map((brand) => {
                if (!brand?.slug?.current) return null;
                return (
                  <NavLink
                    key={brand._id || brand.slug.current}
                    href={`${getBrandUrl(brand.slug.current)}?gender=${gender}`}
                    onClick={onClose}
                    className="pl-2"
                  >
                    {brand.name}
                  </NavLink>
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
            <div className="mt-2 overflow-x-auto snap-x snap-mandatory scrollbar-hide -mx-2 px-2">
              <div className="flex gap-2">
                {featuredCollections.map((collection: CollectionMenuItem) => {
                  if (!collection?.slug?.current) return null;
                  return (
                    <Link
                      key={collection._id || collection.slug.current}
                      href={`/collections/${collection.slug.current}`}
                      onClick={handleLinkClick}
                      onPointerDown={handlePointerDown}
                      onPointerMove={handlePointerMove}
                      draggable={false}
                      className="flex-shrink-0 w-[70vw] min-w-0 aspect-[3/4] flex flex-col cursor-pointer snap-start"
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
                    </Link>
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

export default GenderMenuContent;
