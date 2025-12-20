import { getBlogPosts } from "@/sanity/lib/getData";
import Image from "next/image";
import Link from "next/link";

// Helper function to format dates consistently for SSR
function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-GB", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

export default async function BlogPage() {
  const posts = await getBlogPosts();

  return (
    <div className="w-full my-8 md:my-12 xl:my-16 px-2">
      <div className="mb-8 mt-2 xl:w-1/3">
        <h1 className="text-sm">Our Space</h1>
        <p className="text-xs mt-2">
          This is where we share what inspires us — from creative editorials and
          curated playlists to glimpses behind the scenes. It's our way of
          staying connected and showing what drives the journey.
        </p>
      </div>
      <div className="flex flex-col gap-4 xl:grid xl:grid-cols-3 xl:gap-2">
        {posts.map((post: any) => {
          const imageUrl =
            post.editorialImage?.asset?.url || post.featuredImage?.asset?.url;
          const imageAlt =
            post.editorialImage?.alt || post.featuredImage?.alt || post.title;

          return (
            <div key={post._id} className="mb-4">
              <Link
                href={`/blog/${post.category?.slug?.current}/${post.slug?.current}`}
              >
                <div className="relative w-full h-[50vh] xl:h-[60vh] mb-4 overflow-hidden">
                  {imageUrl ? (
                    <Image
                      src={imageUrl}
                      alt={imageAlt}
                      className="w-full h-full object-cover"
                      fill
                      sizes="(max-width: 1280px) 100vw, 50vw"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <p className="text-black">No image</p>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <h3 className="text-sm text-black line-clamp-2">
                    {post.title}
                  </h3>

                  {post.excerpt && <p className="text-xs">{post.excerpt}</p>}

                  <div className="flex items-center justify-between text-xs mt-2">
                    <span>By {post.author}</span>
                    <span>{formatDate(post.publishedAt)}</span>
                  </div>
                </div>
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
