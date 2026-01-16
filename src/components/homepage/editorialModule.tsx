"use client";

import { type EditorialModule } from "../../../sanity.types";
import React, { useCallback, useRef, useMemo, memo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
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

// Helper function to format dates consistently for SSR
function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-GB", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
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
  const router = useRouter();
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
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    pointerStartRef.current = { x: e.clientX, y: e.clientY };
    hasDraggedRef.current = false;
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!pointerStartRef.current) return;
    const dx = Math.abs(e.clientX - pointerStartRef.current.x);
    const dy = Math.abs(e.clientY - pointerStartRef.current.y);
    // 10px threshold - anything more is a drag, not a tap
    if (dx > 10 || dy > 10) {
      hasDraggedRef.current = true;
    }
  }, []);

  const handlePostClick = useCallback(
    (post: EditorialBlogPost) => {
      if (!hasDraggedRef.current) {
        router.push(
          `/blog/${post.category?.slug?.current}/${post.slug?.current}`
        );
      }
    },
    [router]
  );

  return (
    <div className="px-2 my-8 md:my-12 xl:my-16 w-full">
      <div className="flex justify-between items-center">
        <h2 className="text-black text-sm">
          {editorialModule.title}
        </h2>
        <button
          className="text-black text-xs hover:underline cursor-pointer"
          onClick={() => {
            router.push(editorialModule.buttonLink || "/blog/editorials");
          }}
        >
          {editorialModule.buttonText || "View All Editorials"}
        </button>
      </div>

      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex gap-2">
          {postsWithImages.map(({ post, imageSelection }) => {
            const selectedImage = getSelectedImage(post, imageSelection);
            return (
              <div
                key={post._id}
                className="flex-shrink-0 w-[60vw] md:w-[40vw] lg:w-[30vw] xl:w-[25vw] min-w-0 cursor-pointer"
                onClick={() => handlePostClick(post)}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
              >
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
                  <div className="flex items-center gap-2 text-xs"></div>

                  <h3 className="text-sm text-black">
                    {post.title}
                  </h3>

                  {post.excerpt && (
                    <p className="text-xs line-clamp-2">
                      {post.excerpt}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
});

export default EditorialModuleComponent;
