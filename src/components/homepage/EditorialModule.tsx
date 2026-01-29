"use client";

import { type EditorialModule } from "../../../sanity.types";
import React, { useEffect, useState, useMemo, useCallback, memo } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Image from "next/image";
import Link from "next/link";

// Type for editorial blog posts (from getLatestBlogPosts query)
interface EditorialBlogPost {
  _id: string;
  title: string;
  slug: { current: string };
  excerpt?: string;
  category?: { slug: { current: string } };
  editorialImage?: { asset?: { url: string }; alt?: string };
  featuredImage?: { asset?: { url: string }; alt?: string };
  gallery?: Array<{ asset?: { url: string }; alt?: string }>;
}

// Helper function to get the selected image based on imageSelection
function getSelectedImage(post: EditorialBlogPost, imageSelection: string) {
  if (imageSelection === "editorial") {
    // Use editorial image as primary choice
    return {
      url: post.editorialImage?.asset?.url,
      alt: post.editorialImage?.alt || post.title || "Blog post",
    };
  }

  if (imageSelection === "featured") {
    // Use featured image
    return {
      url: post.featuredImage?.asset?.url,
      alt: post.featuredImage?.alt || post.title || "Blog post",
    };
  }

  // Handle gallery images (gallery_0, gallery_1, etc.)
  if (imageSelection.startsWith("gallery_")) {
    const index = parseInt(imageSelection.split("_")[1]);
    const galleryImage = post.gallery?.[index];

    if (galleryImage?.asset?.url) {
      return {
        url: galleryImage.asset.url,
        alt: galleryImage.alt || post.title || "Blog post",
      };
    }
  }

  // Fallback to editorial image, then featured image
  return {
    url: post.editorialImage?.asset?.url || post.featuredImage?.asset?.url,
    alt:
      post.editorialImage?.alt ||
      post.featuredImage?.alt ||
      post.title ||
      "Blog post",
  };
}

const EditorialModuleComponent = memo(function EditorialModuleComponent({
  editorialModule,
  posts,
}: {
  editorialModule: EditorialModule;
  posts: EditorialBlogPost[];
}) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    containScroll: "trimSnaps",
    dragFree: false,
  });
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (!emblaApi) return;
    const onSettle = () => setIsDragging(false);
    const onScroll = () => setIsDragging(true);
    emblaApi.on("settle", onSettle).on("scroll", onScroll);
    return () => {
      emblaApi.off("settle", onSettle).off("scroll", onScroll);
    };
  }, [emblaApi]);

  // Create a map of posts with their selected images
  // Use editorial image by default for latest posts
  // Filter out posts with missing slugs to prevent "/blog/undefined/..." URLs
  const postsWithImages = useMemo(
    () =>
      posts
        .filter((post) => post.slug?.current && post.category?.slug?.current)
        .map((post) => ({
          post,
          imageSelection: "editorial",
        })),
    [posts]
  );

  // Prevent navigation when dragging the carousel
  const handleLinkClick = useCallback((e: React.MouseEvent) => {
    if (isDragging) {
      e.preventDefault();
    }
  }, [isDragging]);

  return (
    <div className="px-2 my-8 md:my-12 xl:my-16 w-full">
      <div className="flex justify-between items-center">
        <h2 className="text-black text-sm">
          {editorialModule.title}
        </h2>
        <Link
          href={editorialModule.buttonLink || "/blog/editorials"}
          prefetch={true}
          className="text-black text-xs hover:underline py-3 -my-3 md:py-1 md:-my-1"
        >
          {editorialModule.buttonText || "View All Editorials"}
        </Link>
      </div>

      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex gap-2">
          {postsWithImages.map(({ post, imageSelection }) => {
            const selectedImage = getSelectedImage(post, imageSelection);
            const postUrl = `/blog/${post.category?.slug?.current}/${post.slug?.current}`;
            return (
              <Link
                key={post._id}
                href={postUrl}
                className={`flex-shrink-0 w-[60vw] md:w-[40vw] lg:w-[30vw] xl:w-[25vw] min-w-0 ${isDragging ? "pointer-events-none" : ""}`}
                onClick={handleLinkClick}
                draggable={false}
              >
                <article>
                  <div className="relative h-[40vh] md:h-[45vh] xl:h-[50vh] overflow-hidden">
                    {selectedImage.url && (
                      <Image
                        src={selectedImage.url}
                        alt={selectedImage.alt}
                        className="w-full h-full object-cover"
                        fill
                        sizes="(max-width: 768px) 60vw, (max-width: 1024px) 40vw, 25vw"
                        draggable={false}
                      />
                    )}
                  </div>

                  <div className="pt-2 pb-4 space-y-1">
                    <h3 className="text-sm text-black">
                      {post.title}
                    </h3>

                    {post.excerpt && (
                      <p className="text-xs line-clamp-2">
                        {post.excerpt}
                      </p>
                    )}
                  </div>
                </article>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
});

export default EditorialModuleComponent;
