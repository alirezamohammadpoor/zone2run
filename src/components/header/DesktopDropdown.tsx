"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import DropdownContent from "./DropdownContent";
import type {
  BrandMenuItem,
  MenuData,
  MenuConfig,
  BlogPostMenuItem,
} from "@/types/menu";

type DropdownType = "men" | "women" | "help" | "ourSpace" | null;

interface DesktopDropdownProps {
  activeDropdown: DropdownType;
  onClose: () => void;
  menuData?: MenuData;
  brands?: BrandMenuItem[];
  menuConfig?: MenuConfig;
  blogPosts?: BlogPostMenuItem[];
}

export default function DesktopDropdown({
  activeDropdown,
  onClose,
  menuData,
  brands,
  menuConfig,
  blogPosts,
}: DesktopDropdownProps) {
  // Close dropdown on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    if (activeDropdown) {
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }
  }, [activeDropdown, onClose]);

  if (!activeDropdown) return null;

  const renderHelpContent = () => {
    const links = menuConfig?.help?.links || [];
    return (
      <div className="py-4 px-4">
        <h3 className="text-sm mb-4">Help & Support</h3>
        <div className="space-y-3">
          {links.map((link, index) =>
            link.url.startsWith("http") ? (
              <a
                key={link._key || index}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-xs hover:text-gray-500"
              >
                {link.label}
              </a>
            ) : (
              <Link
                key={link._key || index}
                href={link.url}
                onClick={onClose}
                className="block text-xs hover:text-gray-500"
              >
                {link.label}
              </Link>
            )
          )}
        </div>
      </div>
    );
  };

  const renderOurSpaceContent = () => {
    return (
      <div className="flex justify-between py-4 px-4">
        {/* Left side - Editorial titles */}
        <div>
          <h3 className="text-xs mb-4">Editorials</h3>
          <div className="space-y-2">
            <Link
              href="/blog"
              onClick={onClose}
              className="block text-xs hover:text-gray-500 py-1 text-left"
            >
              View All Editorials
            </Link>
            {blogPosts?.map((post) => {
              if (!post?.slug?.current) return null;
              const postUrl = `/blog/${post.category?.slug?.current || "editorial"}/${post.slug.current}`;
              return (
                <Link
                  key={post._id}
                  href={postUrl}
                  onClick={onClose}
                  className="block text-xs hover:text-gray-500 py-1 text-left"
                >
                  {post.title}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Right side - Latest 4 editorials with images */}
        <div className="w-[70vw]">
          <h3 className="text-xs mb-2">Latest Editorials</h3>
          <div className="grid grid-cols-4 gap-1">
            {blogPosts?.slice(0, 4).map((post) => {
              if (!post?.slug?.current) return null;
              const postUrl = `/blog/${post.category?.slug?.current || "editorial"}/${post.slug.current}`;
              return (
                <Link
                  key={post._id}
                  href={postUrl}
                  className="group"
                  onClick={onClose}
                >
                  <div className="aspect-[2/3] relative overflow-hidden">
                    {post.featuredImage?.asset?.url ? (
                      <Image
                        src={post.featuredImage.asset.url}
                        alt={
                          post.featuredImage.alt || post.title || "Editorial"
                        }
                        fill
                        className="object-cover"
                        sizes="(min-width: 1280px) 12.5vw, 150px"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <span className="text-xs text-gray-500">
                          {post.title}
                        </span>
                      </div>
                    )}
                  </div>
                  <p className="text-xs mt-2 group-hover:underline">
                    {post.title}
                  </p>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-30 top-16"
        onClick={onClose}
        role="presentation"
        aria-hidden="true"
      />

      {/* Dropdown Panel */}
      <div className="absolute left-0 right-0 bg-white shadow-lg z-30 border-t">
        <div className="max-w-8xl mx-auto">
          {(activeDropdown === "men" || activeDropdown === "women") && (
            <DropdownContent
              type={activeDropdown}
              onClose={onClose}
              data={menuData?.[activeDropdown] || {}}
              brands={brands}
              featuredCollections={
                activeDropdown === "men"
                  ? menuConfig?.men?.featuredCollections
                  : menuConfig?.women?.featuredCollections
              }
            />
          )}
          {activeDropdown === "help" && renderHelpContent()}
          {activeDropdown === "ourSpace" && renderOurSpaceContent()}
        </div>
      </div>
    </>
  );
}
