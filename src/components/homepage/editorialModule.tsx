"use client";

import { type EditorialModule } from "../../../sanity.types";
import React, { useRef, useMemo, memo } from "react";
import Image from "next/image";
import Link from "next/link";
import useEmblaCarousel from "embla-carousel-react";

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
  const [emblaRef] = useEmblaCarousel({
    align: "start",
    containScroll: "trimSnaps",
    dragFree: false,
  });

  // Track pointer position to detect actual dragging vs. taps
  const pointerStartRef = useRef<{ x: number; y: number } | null>(null);
  const hasDraggedRef = useRef(false);

  // Create a map of posts with their selected images
  // Use editorial image by default for latest posts
  const postsWithImages = useMemo(
    () =>
      posts.map((post) => ({
        post,
        imageSelection: "editorial",
      })),
    [posts]
  );

  // Track pointer movement to distinguish taps from drags
  const handlePointerDown = (e: React.PointerEvent) => {
    pointerStartRef.current = { x: e.clientX, y: e.clientY };
    hasDraggedRef.current = false;
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!pointerStartRef.current) return;
    const dx = Math.abs(e.clientX - pointerStartRef.current.x);
    const dy = Math.abs(e.clientY - pointerStartRef.current.y);
    // 10px threshold - anything more is a drag, not a tap
    if (dx > 10 || dy > 10) {
      hasDraggedRef.current = true;
    }
  };

  // Prevent navigation when dragging the carousel
  const handleLinkClick = (e: React.MouseEvent) => {
    if (hasDraggedRef.current) {
      e.preventDefault();
    }
  };

  return (
    <div className="px-2 my-8 md:my-12 xl:my-16 w-full">
      <div className="flex justify-between items-center">
        <h2 className="text-black text-sm">
          {editorialModule.title}
        </h2>
        <Link
          href={editorialModule.buttonLink || "/blog/editorials"}
          className="text-black text-xs hover:underline"
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
                className="flex-shrink-0 w-[60vw] md:w-[40vw] lg:w-[30vw] xl:w-[25vw] min-w-0"
                onClick={handleLinkClick}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
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
