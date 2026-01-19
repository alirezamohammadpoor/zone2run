import type { Metadata } from "next";
import { getBlogPost, getProductsByCollectionId } from "@/sanity/lib/getData";
import { notFound } from "next/navigation";
import Image from "next/image";
import { PortableText } from "@portabletext/react";
import ProductGrid from "@/components/ProductGrid";
import BlogProductCarousel from "@/components/blog/BlogProductCarousel";
import type { SanityProduct } from "@/types/sanityProduct";

// ISR: Revalidate every 24 hours, on-demand via Sanity webhook
export const revalidate = 86400;

// Generate dynamic metadata for SEO
export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string; postSlug: string }>;
}): Promise<Metadata> {
  const { category, postSlug } = await params;
  const post = await getBlogPost(postSlug);

  if (!post) {
    return { title: "Post Not Found | Zone2Run" };
  }

  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://zone2run-build.vercel.app";

  return {
    title: `${post.title} | Zone2Run Blog`,
    description: post.excerpt || `Read ${post.title} on Zone2Run`,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url: `${baseUrl}/blog/${category}/${postSlug}`,
      siteName: "Zone2Run",
      type: "article",
      publishedTime: post.publishedAt,
      authors: post.author ? [post.author] : undefined,
      images: post.featuredImage?.asset?.url
        ? [{ url: post.featuredImage.asset.url }]
        : [],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
      images: post.featuredImage?.asset?.url
        ? [post.featuredImage.asset.url]
        : [],
    },
  };
}

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

export default async function PostPage({
  params,
}: {
  params: Promise<{ category: string; postSlug: string }>;
}) {
  const { postSlug } = await params;
  const post = await getBlogPost(postSlug);

  if (!post) return notFound();

  // Fetch products from featured collection if set
  let collectionProducts: SanityProduct[] = [];
  if (post.featuredCollection?._id) {
    const allProducts = await getProductsByCollectionId(
      post.featuredCollection._id
    );
    collectionProducts = post.featuredCollectionLimit
      ? allProducts.slice(0, post.featuredCollectionLimit)
      : allProducts;
  }

  return (
    <div className="w-full">
      {/* HERO */}
      <div
        className="relative w-full overflow-hidden mb-8 md:mb-12 xl:mb-16"
        style={{ height: post.heroHeight }}
      >
        {post.mediaType === "video" && post.featuredVideo?.asset?.url ? (
          <video
            src={post.featuredVideo.asset.url}
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-full object-contain"
          />
        ) : post.featuredImage?.asset?.url ? (
          <Image
            src={post.featuredImage.asset.url}
            alt={post.featuredImage.alt || ""}
            fill
            className="object-cover"
            style={{
              objectPosition: post.featuredImage.hotspot
                ? `${post.featuredImage.hotspot.x * 100}% ${
                    post.featuredImage.hotspot.y * 100
                  }%`
                : "center",
            }}
          />
        ) : (
          <div className="w-full h-full bg-black flex items-center justify-center">
            <p className="text-white text-xl">No media uploaded</p>
          </div>
        )}
      </div>

      {/* TITLE & META */}
      <div className="w-full px-2 py-2 xl:max-w-4xl xl:mx-auto xl:px-4 xl:py-4">
        <h1 className="text-sm mb-6">{post.title}</h1>
        <div className="flex items-center gap-4 text-xs mb-6">
          <span>By {post.author}</span>
          <span>{post.readingTime} min read</span>
          <span>{new Date(post.publishedAt).toLocaleDateString()}</span>
        </div>
        {post.excerpt && <p className="text-xs">{post.excerpt}</p>}
      </div>

      {/* CONTENT */}
      <div className="w-full px-2 py-2 xl:max-w-4xl xl:mx-auto xl:px-4">
        {post.content?.length ? (
          <PortableText
            value={post.content}
            components={{
              block: {
                normal: ({ children }) => (
                  <p className="mb-6 leading-relaxed text-xs">{children}</p>
                ),
                h1: ({ children }) => (
                  <h1 className="text-sm mb-8 mt-4 first:mt-0 font-normal [&_strong]:font-normal [&_b]:font-normal">
                    {children}
                  </h1>
                ),
                h2: ({ children }) => (
                  <h2 className="text-sm mb-6 mt-4 font-normal [&_strong]:font-normal [&_b]:font-normal">
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
                      <div className="relative w-full h-[50vh] xl:h-[70vh] overflow-hidden">
                        <Image
                          src={value.asset.url}
                          alt={value.alt || ""}
                          fill
                          className="object-contain"
                        />
                      </div>
                      {value.caption && (
                        <p className="text-xs text-black mt-2 italic text-center">
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
                  <div className="ml-2 pr-4 w-full xl:ml-0 xl:pr-0">
                    <div className="py-4 flex justify-between items-center">
                      <h2 className="text-black text-sm font-medium">
                        {value.featuredHeading}
                      </h2>
                      {value.featuredButtonText && value.featuredButtonLink && (
                        <a
                          href={value.featuredButtonLink}
                          className="text-black text-xs hover:underline cursor-pointer"
                        >
                          {value.featuredButtonText}
                        </a>
                      )}
                    </div>
                    {value.displayType === "grid" ? (
                      <ProductGrid
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
                        className="grid grid-cols-2 xl:grid-cols-4 gap-2"
                      />
                    ) : (
                      <BlogProductCarousel
                        products={value.featuredProducts || []}
                      />
                    )}
                  </div>
                ),
                // muxVideo custom element removed
              },
            }}
          />
        ) : (
          <p className="text-black italic text-xs">
            No content available for this blog post.
          </p>
        )}
      </div>

      {/* Featured Collection Products */}
      {collectionProducts.length > 0 && (
        <div className="w-full px-2 my-8 md:my-12 xl:my-16 xl:max-w-4xl xl:mx-auto xl:px-4">
          <div className="py-4 flex justify-between items-center">
            <h2 className="text-black text-sm font-medium">
              {post.featuredCollection?.title || "Featured Products"}
            </h2>
            {post.featuredCollection?.slug && (
              <a
                href={`/collections/${post.featuredCollection.slug}`}
                className="text-black text-xs hover:underline cursor-pointer"
              >
                View All
              </a>
            )}
          </div>
          {post.featuredCollectionDisplayType === "horizontal" ? (
            <BlogProductCarousel
              products={collectionProducts.map((p) => ({
                product: p,
                imageSelection: "main",
              }))}
            />
          ) : (
            <ProductGrid
              products={collectionProducts.map((p) => ({
                ...p,
                selectedImage: p.mainImage,
              }))}
              className="grid grid-cols-2 xl:grid-cols-4 gap-2"
            />
          )}
        </div>
      )}
    </div>
  );
}
