import { getBlogPost } from "@/sanity/lib/getData";
import { notFound } from "next/navigation";
import Image from "next/image";
import { PortableText } from "@portabletext/react";
import MuxVideo from "@/components/MuxVideo";

export default async function PostPage({
  params,
}: {
  params: Promise<{ category: string; postSlug: string }>;
}) {
  const { postSlug } = await params;
  const post = await getBlogPost(postSlug);

  if (!post) return notFound();

  return (
    <div className="w-full">
      {/* HERO */}
      <div
        className="relative w-full overflow-hidden mb-2"
        style={{ height: post.heroHeight }}
      >
        {post.mediaType === "video" && post.featuredVideo?.asset?.url ? (
          <video
            src={post.featuredVideo.asset.url}
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-full object-cover"
          />
        ) : post.featuredImage?.asset?.url ? (
          <Image
            src={post.featuredImage.asset.url}
            alt={post.featuredImage.alt || ""}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-900 flex items-center justify-center">
            <p className="text-white text-xl">No media uploaded</p>
          </div>
        )}
      </div>

      {/* TITLE & META */}
      <div className="w-full px-2 py-2">
        <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
          {post.title}
        </h1>
        <div className="flex items-center gap-4 text-gray-600 mb-6">
          <span>By {post.author}</span>
          <span>{post.readingTime} min read</span>
          <span>{new Date(post.publishedAt).toLocaleDateString()}</span>
        </div>
        {post.excerpt && (
          <p className="text-xl text-gray-700 leading-relaxed">
            {post.excerpt}
          </p>
        )}
      </div>

      {/* CONTENT */}
      <div className="w-full px-2 py-2">
        {post.content?.length ? (
          <PortableText
            value={post.content}
            components={{
              block: {
                normal: ({ children }) => (
                  <p className="mb-6 leading-relaxed">{children}</p>
                ),
                h1: ({ children }) => (
                  <h1 className="text-4xl font-bold mb-8 mt-4 first:mt-0">
                    {children}
                  </h1>
                ),
                h2: ({ children }) => (
                  <h2 className="text-3xl font-bold mb-6 mt-4">{children}</h2>
                ),
              },
              marks: {
                strong: ({ children }) => (
                  <strong className="font-bold">{children}</strong>
                ),
                em: ({ children }) => <em className="italic">{children}</em>,
                code: ({ children }) => (
                  <code className="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono">
                    {children}
                  </code>
                ),
                link: ({ children, value }) => (
                  <a
                    href={value.href}
                    target={value.blank ? "_blank" : undefined}
                    rel={value.blank ? "noopener noreferrer" : undefined}
                    className="text-blue-600 hover:text-blue-800 underline"
                  >
                    {children}
                  </a>
                ),
              },
              types: {
                image: ({ value }) =>
                  value?.asset?.url && (
                    <div className="mb-4">
                      <div className="relative w-full h-[50vh] overflow-hidden">
                        <Image
                          src={value.asset.url}
                          alt={value.alt || ""}
                          fill
                          className="object-cover"
                        />
                      </div>
                      {value.caption && (
                        <p className="text-md text-gray-600 mt-2 italic">
                          {value.caption}
                        </p>
                      )}
                    </div>
                  ),
                muxVideo: ({ value }) =>
                  value?.playbackId ? (
                    <div className="mb-6">
                      <MuxVideo playbackId={value.playbackId} />
                      {value.title && (
                        <p className="text-sm text-gray-600 mt-2 italic">
                          {value.title}
                        </p>
                      )}
                    </div>
                  ) : null,
              },
            }}
          />
        ) : (
          <p className="text-gray-500 italic">
            No content available for this blog post.
          </p>
        )}
      </div>
    </div>
  );
}
