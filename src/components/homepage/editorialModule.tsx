"use client";

import { type EditorialModule } from "../../../sanity.types";
import React from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

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
function getSelectedImage(post: any, imageSelection: string) {
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

function EditorialModuleComponent({
  editorialModule,
  posts,
}: {
  editorialModule: EditorialModule;
  posts: any[];
}) {
  const router = useRouter();

  // Create a map of posts with their selected images
  const postsWithImages = posts.map((post) => {
    const postItem = editorialModule.featuredPosts?.find(
      (item) => item.post?._ref === post._id
    );

    return {
      post,
      imageSelection: postItem?.imageSelection || "editorial",
    };
  });

  return (
    <div className="ml-2 pr-4 mb-8 w-full">
      <div className="py-4 flex justify-between items-center">
        <h2 className="text-black text-lg font-medium">
          {editorialModule.title}
        </h2>
        <button
          className="text-black text-sm hover:underline cursor-pointer"
          onClick={() => {
            router.push(editorialModule.buttonLink || "/blog/editorials");
          }}
        >
          {editorialModule.buttonText || "View All Editorials"}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {postsWithImages.map(({ post, imageSelection }) => {
          const selectedImage = getSelectedImage(post, imageSelection);
          return (
            <div
              key={post._id}
              className="group cursor-pointer"
              onClick={() => {
                router.push(
                  `/blog/${post.category?.slug?.current}/${post.slug?.current}`
                );
              }}
            >
              <div className="relative w-full h-[300px] mb-4 overflow-hidden">
                {selectedImage.url ? (
                  <Image
                    src={selectedImage.url}
                    alt={selectedImage.alt}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <p className="text-gray-500">No image</p>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span>{post.category?.title}</span>
                  <span>•</span>
                  <span>{post.readingTime} min read</span>
                </div>

                <h3 className="text-xl font-semibold text-black group-hover:underline line-clamp-2">
                  {post.title}
                </h3>

                {post.excerpt && (
                  <p className="text-gray-600 line-clamp-3">{post.excerpt}</p>
                )}

                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>By {post.author}</span>
                  <span>{formatDate(post.publishedAt)}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default EditorialModuleComponent;
