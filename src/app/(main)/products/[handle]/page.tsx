import type { Metadata } from "next";
import ProductGalleryClient from "@/components/product/ProductGalleryClient";
import ProductInfo from "@/components/product/ProductInfo";
import ProductForm, { ProductPrice } from "@/components/product/ProductForm";
import { getProductByHandle } from "@/lib/product/getProductByHandle";
import { getShopifyProductByHandle } from "@/lib/shopify/products";
import { getSiteSettings } from "@/sanity/lib/getData";
import { notFound } from "next/navigation";
import RelatedProductsServer from "@/components/product/RelatedProductsServer";
import ColorVariants from "@/components/product/ColorVariants";
import ProductEditorialImages from "@/components/product/ProductEditorialImages";
import { ProductJsonLd, BreadcrumbJsonLd } from "@/components/schemas";
import { getBreadcrumbsFromProduct } from "@/components/product/Breadcrumbs";
import { Suspense } from "react";

// ISR: Revalidate every 30 minutes, on-demand via Sanity webhook
export const revalidate = 1800;

// Allow dynamic params for product handles not generated at build time
export const dynamicParams = true;

// Generate static params for all products (enables ISR)
export async function generateStaticParams() {
  // Return empty array - pages will be generated on-demand and cached
  // This enables ISR behavior: first request generates the page, subsequent requests are cached
  return [];
}

// Generate dynamic metadata for SEO
export async function generateMetadata({
  params,
}: {
  params: Promise<{ handle: string }>;
}): Promise<Metadata> {
  const { handle } = await params;
  const product = await getProductByHandle(handle);

  if (!product) {
    return { title: "Product Not Found | Zone2Run" };
  }

  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://zone2run-build.vercel.app";
  const url = `${baseUrl}/products/${handle}`;
  const description =
    product.description?.replace(/<[^>]*>/g, "").slice(0, 160) ||
    `Shop ${product.title} at Zone2Run`;

  return {
    title: `${product.title} | Zone2Run`,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: product.title,
      description,
      url,
      siteName: "Zone2Run",
      images: product.images?.[0]?.url
        ? [
            {
              url: product.images[0].url,
              alt: product.images[0].alt || product.title,
            },
          ]
        : [],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: product.title,
      description,
      images: product.images?.[0]?.url ? [product.images[0].url] : [],
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const handle = (await params).handle;

  // Parallel fetch: Sanity (ISR cached) + Shopify + site settings at the same time
  const [product, shopifyProduct, siteSettings] = await Promise.all([
    getProductByHandle(handle),
    getShopifyProductByHandle(handle),
    getSiteSettings(),
  ]);

  if (!product) {
    notFound();
  }

  // Generate breadcrumb trail from product's category hierarchy
  const breadcrumbs = getBreadcrumbsFromProduct(product);

  return (
    <>
      {/* JSON-LD Structured Data for SEO */}
      <ProductJsonLd product={product} />
      <BreadcrumbJsonLd items={breadcrumbs} />

      <div>
        <div className="xl:flex xl:flex-row">
          <div className="relative w-full xl:w-1/2">
            {product.images?.length > 0 ? (
              <ProductGalleryClient images={product.images} />
            ) : (
              <div className="w-full relative aspect-[4/5] flex items-center justify-center bg-gray-100">
                <p className="text-gray-400">No images available</p>
              </div>
            )}
          </div>
          <ProductInfo
            product={product}
            siteSettings={siteSettings}
            priceSlot={
              <ProductPrice
                shopifyProduct={shopifyProduct}
                fallbackPrice={product.priceRange.minVariantPrice}
              />
            }
          >
            {/* Shopify data - fetched in parallel with Sanity */}
            <ProductForm
              staticProduct={product}
              shopifyProduct={shopifyProduct}
            />
          </ProductInfo>
        </div>
        <ColorVariants
          colorVariants={product.colorVariants}
          currentProductId={product._id}
        />
        <Suspense fallback={null}>
          <ProductEditorialImages editorialImages={product.editorialImages} />
        </Suspense>
      </div>
      {product.brand?.slug && (
        <Suspense fallback={null}>
          <RelatedProductsServer
            brandSlug={product.brand.slug}
            currentProductId={product._id}
          />
        </Suspense>
      )}
    </>
  );
}
