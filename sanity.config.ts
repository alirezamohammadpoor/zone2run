import { defineConfig, isDev } from "sanity";
import { visionTool } from "@sanity/vision";
import { structureTool } from "sanity/structure";
import {
  presentationTool,
  defineDocuments,
  defineLocations,
} from "sanity/presentation";
import { colorInput } from "@sanity/color-input";
import { imageHotspotArrayPlugin } from "sanity-plugin-hotspot-array";
import { media, mediaAssetSource } from "sanity-plugin-media";
import { schemaTypes } from "./src/sanity/schemaTypes";
import { structure } from "./src/sanity/structure";
import Navbar from "./src/sanity/studio/Navbar";
import Footer from "./src/sanity/studio/Footer";

const devOnlyPlugins = [visionTool()];

export default defineConfig({
  name: "default",
  title: "Shopify Store",
  basePath: "/studio",
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,

  plugins: [
    structureTool({ structure }),
    presentationTool({
      previewUrl: {
        origin: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
        previewMode: {
          enable: "/api/draft",
        },
      },
      resolve: {
        mainDocuments: defineDocuments([
          {
            route: "/:locale",
            filter: `_type == "homepageVersion" && _id in *[_id == "siteSettings"][0].activeHomepage._ref`,
          },
          {
            route: "/:locale/products/:handle",
            filter: `_type == "product" && (shopifyHandle == $handle || store.slug.current == $handle)`,
            params: ({ params }) => ({ handle: params.handle }),
          },
          {
            route: "/:locale/brands/:slug",
            filter: `_type == "brand" && slug.current == $slug`,
            params: ({ params }) => ({ slug: params.slug }),
          },
          {
            route: "/:locale/collections/:slug",
            filter: `_type == "collection" && store.slug.current == $slug`,
            params: ({ params }) => ({ slug: params.slug }),
          },
          {
            route: "/:locale/blog/:category/:postSlug",
            filter: `_type == "blogPost" && slug.current == $postSlug`,
            params: ({ params }) => ({ postSlug: params.postSlug }),
          },
        ]),
        locations: {
          product: defineLocations({
            select: {
              title: "title",
              handle: "shopifyHandle",
              storeSlug: "store.slug.current",
            },
            resolve: (doc) => {
              const slug = doc?.handle || doc?.storeSlug;
              if (!slug) return null;
              return {
                locations: [
                  {
                    title: doc?.title || "Product",
                    href: `/en/products/${slug}`,
                  },
                ],
              };
            },
          }),
          brand: defineLocations({
            select: { title: "title", slug: "slug.current" },
            resolve: (doc) =>
              doc?.slug
                ? {
                    locations: [
                      {
                        title: doc.title || "Brand",
                        href: `/en/brands/${doc.slug}`,
                      },
                    ],
                  }
                : null,
          }),
          collection: defineLocations({
            select: { title: "store.title", slug: "store.slug.current" },
            resolve: (doc) =>
              doc?.slug
                ? {
                    locations: [
                      {
                        title: doc.title || "Collection",
                        href: `/en/collections/${doc.slug}`,
                      },
                    ],
                  }
                : null,
          }),
          blogPost: defineLocations({
            select: {
              title: "title",
              slug: "slug.current",
              categorySlug: "category.slug.current",
            },
            resolve: (doc) =>
              doc?.slug && doc?.categorySlug
                ? {
                    locations: [
                      {
                        title: doc.title || "Blog Post",
                        href: `/en/blog/${doc.categorySlug}/${doc.slug}`,
                      },
                    ],
                  }
                : null,
          }),
          homepageVersion: defineLocations({
            select: { title: "title" },
            resolve: (doc) => ({
              locations: [
                { title: doc?.title || "Homepage", href: "/en" },
              ],
            }),
          }),
        },
      },
    }),
    colorInput(),
    imageHotspotArrayPlugin(),
    media(),
    ...(isDev ? devOnlyPlugins : []),
  ],

  schema: {
    types: schemaTypes,
  },

  form: {
    file: {
      assetSources: (previousAssetSources) => {
        return previousAssetSources.filter(
          (assetSource) => assetSource !== mediaAssetSource
        );
      },
    },
    image: {
      assetSources: (previousAssetSources) => {
        return previousAssetSources.filter(
          (assetSource) => assetSource === mediaAssetSource
        );
      },
    },
  },

  studio: {
    components: {
      navbar: Navbar,
      footer: Footer,
    },
  },
});
