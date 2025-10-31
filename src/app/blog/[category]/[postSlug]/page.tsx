import { getBlogPost } from "@/sanity/lib/getData";
import { notFound } from "next/navigation";
import Image from "next/image";
import { PortableText } from "@portabletext/react";
import BlogProductGrid from "@/components/blog/BlogProductGrid";
import type { SanityProduct } from "@/types/sanityProduct";

type BlogProductsDisplayType = "horizontal" | "grid";

interface BlogProductsModuleItem {
  product: SanityProduct | undefined;
  imageSelection?: string;
}

interface BlogProductsModuleValue {
  featuredHeading?: string;
  featuredSubheading?: string;
  featuredButtonText?: string;
  featuredButtonLink?: string;
  displayType?: BlogProductsDisplayType;
  productCount?: number;
  featuredProducts?: BlogProductsModuleItem[];
}
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
          <div className="w-full h-full bg-black flex items-center justify-center">
            <p className="text-white text-xl">No media uploaded</p>
          </div>
        )}
      </div>

      {/* TITLE & META */}
      <div className="w-full px-2 py-2">
        <h1 className="text-2xl mb-6">{post.title}</h1>
        <div className="flex items-center gap-4 text-sm mb-6">
          <span>By {post.author}</span>
          <span>{post.readingTime} min read</span>
          <span>{new Date(post.publishedAt).toLocaleDateString()}</span>
        </div>
        {post.excerpt && <p className="text-sm">{post.excerpt}</p>}
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
                  <h1 className="text-3xl mb-8 mt-4 first:mt-0 font-normal [&_strong]:font-normal [&_b]:font-normal">
                    {children}
                  </h1>
                ),
                h2: ({ children }) => (
                  <h2 className="text-2xl mb-6 mt-4 font-normal [&_strong]:font-normal [&_b]:font-normal">
                    {children}
                  </h2>
                ),
              },
              marks: {
                strong: ({ children }) => (
                  <strong className="font-bold">{children}</strong>
                ),
                em: ({ children }) => <em className="italic">{children}</em>,
                code: ({ children }) => (
                  <code className="bg-black px-1 py-0.5 rounded text-sm font-mono">
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
                        <p className="text-md text-black mt-2 italic">
                          {value.caption}
                        </p>
                      )}
                    </div>
                  ),
                blogProductsModule: ({
                  value,
                }: {
                  value: BlogProductsModuleValue;
                }) => (
                  <div className="ml-2 pr-4 w-full">
                    <div className="py-4 flex justify-between items-center">
                      <h2 className="text-black text-lg font-medium">
                        {value.featuredHeading}
                      </h2>
                      {value.featuredButtonText && value.featuredButtonLink && (
                        <a
                          href={value.featuredButtonLink}
                          className="text-black text-sm hover:underline cursor-pointer"
                        >
                          {value.featuredButtonText}
                        </a>
                      )}
                    </div>
                    {value.displayType === "grid" ? (
                      <BlogProductGrid
                        products={(value.featuredProducts || []).map(
                          (item: BlogProductsModuleItem) => {
                            const p = item?.product;
                            const selection = item?.imageSelection || "main";
                            let selectedUrl = p?.mainImage?.url || "";
                            if (selection.startsWith("gallery_")) {
                              const i = parseInt(selection.split("_")[1]);
                              selectedUrl = p?.gallery?.[i]?.url || selectedUrl;
                            }
                            return p
                              ? {
                                  ...p,
                                  selectedImage: selectedUrl
                                    ? {
                                        url: selectedUrl,
                                        alt: p.title || "Product",
                                      }
                                    : undefined,
                                }
                              : ({} as SanityProduct);
                          }
                        )}
                        count={value.productCount}
                      />
                    ) : (
                      <div
                        className="flex gap-2 overflow-x-auto overflow-y-visible scrollbar-hide -mx-2 px-2"
                        style={{ WebkitOverflowScrolling: "touch" as any }}
                      >
                        {value.featuredProducts?.map(
                          (item: BlogProductsModuleItem, idx: number) => {
                            const p = item?.product;
                            if (!p) return null;
                            const selection = item?.imageSelection || "main";
                            let selectedUrl = p.mainImage?.url || "";
                            if (selection.startsWith("gallery_")) {
                              const i = parseInt(selection.split("_")[1]);
                              selectedUrl = p.gallery?.[i]?.url || selectedUrl;
                            }

                            return (
                              <a
                                key={p._id || idx}
                                href={p.handle ? `/products/${p.handle}` : "#"}
                                className="group flex-shrink-0 w-[70vw] aspect-[3/4] flex flex-col cursor-pointer"
                              >
                                <div className="w-full h-full relative bg-gray-100">
                                  {selectedUrl && (
                                    <Image
                                      src={selectedUrl}
                                      alt={p.title || "Product"}
                                      fill
                                      className="object-cover"
                                      sizes="(max-width: 768px) 70vw, 33vw"
                                      draggable={false}
                                    />
                                  )}
                                </div>
                                <div className="mt-2 mb-10">
                                  {p.brand?.name && (
                                    <a
                                      className="text-base font-medium hover:underline cursor-pointer"
                                      href={
                                        p.brand?.slug
                                          ? `/brands/${p.brand.slug}`
                                          : "#"
                                      }
                                    >
                                      {p.brand.name}
                                    </a>
                                  )}
                                  <p className="text-base hover:underline cursor-pointer">
                                    {p.title}
                                  </p>
                                  {p.priceRange?.minVariantPrice && (
                                    <p className="text-base mt-2">
                                      {p.priceRange.minVariantPrice} SEK
                                    </p>
                                  )}
                                </div>
                              </a>
                            );
                          }
                        )}
                      </div>
                    )}
                  </div>
                ),
                muxVideo: ({ value }) =>
                  value?.playbackId ? (
                    <div className="mb-6">
                      <MuxVideo playbackId={value.playbackId} />
                      {value.title && (
                        <p className="text-sm text-black mt-2 italic">
                          {value.title}
                        </p>
                      )}
                    </div>
                  ) : null,
              },
            }}
          />
        ) : (
          <p className="text-black italic">
            No content available for this blog post.
          </p>
        )}
      </div>
    </div>
  );
}
