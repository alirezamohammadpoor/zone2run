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
    <div className="w-full mt-8 mb-8 px-2">
      <div className="mb-16 mt-2">
        <h1 className="text-2xl">Our Space</h1>
        <p className="text-sm mt-2">
          This is where we share what inspires us — from creative editorials and
          curated playlists to glimpses behind the scenes. It’s our way of
          staying connected and showing what drives the journey.
        </p>
      </div>
      <div className="flex flex-col gap-6">
        {posts.map((post: any) => {
          const imageUrl =
            post.editorialImage?.asset?.url || post.featuredImage?.asset?.url;
          const imageAlt =
            post.editorialImage?.alt || post.featuredImage?.alt || post.title;

          return (
            <div key={post._id} className="mb-6">
              <Link
                href={`/blog/${post.category?.slug?.current}/${post.slug?.current}`}
                className="group"
              >
                <div className="relative w-full h-[50vh] mb-4 overflow-hidden">
                  {imageUrl ? (
                    <Image
                      src={imageUrl}
                      alt={imageAlt}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <p className="text-black">No image</p>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl text-black group-hover:underline line-clamp-2">
                    {post.title}
                  </h3>

                  {post.excerpt && <p className="text-sm">{post.excerpt}</p>}

                  <div className="flex items-center justify-between text-sm mt-2">
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
