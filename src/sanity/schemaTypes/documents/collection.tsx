import { defineArrayMember, defineField, defineType } from "sanity";
import { PackageIcon } from "@sanity/icons";
import { getExtension } from "@sanity/asset-utils";
import pluralize from "pluralize-esm";
import CollectionHiddenInput from "../../inputs/CollectionHidden";
import ShopifyDocumentStatus from "../../media/ShopifyDocumentStatus";
import { GROUPS } from "../../constants";

export const collectionType = defineType({
  name: "collection",
  title: "Collection",
  type: "document",
  icon: PackageIcon,
  groups: GROUPS,
  fields: [
    defineField({
      name: "hidden",
      type: "string",
      components: {
        field: CollectionHiddenInput,
      },
      hidden: ({ parent }) => {
        const isDeleted = parent?.store?.isDeleted;
        return !isDeleted;
      },
    }),
    defineField({
      name: "titleProxy",
      title: "Title",
      type: "proxyString",
      options: { field: "store.title" },
    }),
    defineField({
      name: "slugProxy",
      title: "Slug",
      type: "proxyString",
      options: { field: "store.slug.current" },
    }),
    defineField({
      name: "description",
      title: "Collection Description",
      type: "text",
      rows: 4,
      description: "Editorial description for this collection",
      group: "editorial",
    }),
    defineField({
      name: "colorTheme",
      type: "reference",
      to: [{ type: "colorTheme" }],
      group: "theme",
    }),
    defineField({
      name: "vector",
      title: "Vector artwork",
      type: "image",
      description: "Displayed in collection links using color theme",
      options: {
        accept: "image/svg+xml",
      },
      group: "theme",
      validation: (Rule) =>
        Rule.custom((image) => {
          if (!image?.asset?._ref) {
            return true;
          }

          const format = getExtension(image.asset._ref);

          if (format !== "svg") {
            return "Image must be an SVG";
          }
          return true;
        }),
    }),
    defineField({
      name: "showHero",
      type: "boolean",
      description: "If disabled, page title will be displayed instead",
      group: "editorial",
    }),
    defineField({
      name: "hero",
      type: "hero",
      hidden: ({ document }) => !document?.showHero,
      group: "editorial",
    }),
    defineField({
      name: "modules",
      type: "array",
      description: "Editorial modules to associate with this collection",
      of: [
        defineArrayMember({ type: "callout" }),
        defineArrayMember({ type: "callToAction" }),
        defineArrayMember({ type: "image" }),
        defineArrayMember({ type: "instagram" }),
      ],
      group: "editorial",
    }),
    defineField({
      name: "featured",
      title: "Featured Collection",
      type: "boolean",
      description: "Show this collection in featured sections",
      group: "editorial",
      initialValue: false,
    }),
    defineField({
      name: "sortOrder",
      title: "Sort Order",
      type: "number",
      description: "Lower numbers appear first in collection listings",
      group: "editorial",
      initialValue: 0,
    }),
    defineField({
      name: "isActive",
      title: "Active",
      type: "boolean",
      description: "Whether this collection is visible on the website",
      group: "editorial",
      initialValue: true,
    }),
    defineField({
      name: "menuImage",
      title: "Menu Image",
      type: "image",
      description: "Image displayed in the menu carousel",
      options: {
        hotspot: true,
      },
      fields: [
        {
          name: "alt",
          type: "string",
          title: "Alternative Text",
          description: "Important for accessibility",
        },
      ],
      group: "editorial",
    }),
    defineField({
      name: "gridLayout",
      title: "Grid Layout",
      type: "string",
      description: "Choose the grid layout style for this collection",
      options: {
        list: [
          { title: "4 columns (image 2x2)", value: "4col" },
          { title: "3 columns (image same as product)", value: "3col" },
        ],
        layout: "radio",
      },
      initialValue: "4col",
      group: "editorial",
    }),
    defineField({
      name: "productsPerImage",
      title: "Products Per Editorial Image",
      type: "number",
      description:
        "Number of products to show before each editorial image. Choose based on collection size.",
      options: {
        list: [
          { title: "2 products", value: 2 },
          { title: "4 products", value: 4 },
          { title: "6 products", value: 6 },
          { title: "8 products", value: 8 },
        ],
      },
      initialValue: 4,
      group: "editorial",
    }),
    defineField({
      name: "editorialImages",
      title: "Editorial Images",
      type: "array",
      description:
        "Full-width images to display between products on collection page. Drag to reorder.",
      of: [
        defineArrayMember({
          type: "object",
          fields: [
            defineField({
              name: "image",
              title: "Image",
              type: "image",
              options: {
                hotspot: true,
              },
              fields: [
                {
                  name: "alt",
                  type: "string",
                  title: "Alternative Text",
                  description: "Important for SEO and accessibility",
                },
              ],
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "caption",
              title: "Caption",
              type: "string",
              description: "Optional caption text for the image",
            }),
          ],
          preview: {
            select: {
              title: "caption",
              media: "image",
              position: "position",
            },
            prepare({ title, media }) {
              return {
                title: title || "Editorial Image",
                subtitle: "Appears after every 2 products",
                media,
              };
            },
          },
        }),
      ],
      group: "editorial",
    }),
    defineField({
      name: "curatedProducts",
      title: "Curated Product Order",
      type: "array",
      description:
        "Manually order products in this collection. Drag to reorder. If empty, products will be shown in default order (newest first).",
      of: [
        defineArrayMember({
          type: "reference",
          to: [{ type: "product" }],
          options: {
            filter: ({ document }: { document?: any }) => {
              // @ts-ignore - document type is complex in Sanity
              const collectionId = document?._id;
              // @ts-ignore
              const shopifyId = document?.store?.id;

              if (!collectionId) {
                return { filter: "", params: {} };
              }

              // Filter to show only products that are already in this collection
              // Products that reference this collection OR have this collection's Shopify ID
              const shopifyIdStr = shopifyId ? shopifyId.toString() : "";

              if (shopifyIdStr) {
                return {
                  filter: `_type == "product" && ($collectionId in collections[]._ref || (defined(shopifyCollectionIds) && $shopifyIdStr in shopifyCollectionIds))`,
                  params: {
                    collectionId,
                    shopifyIdStr,
                  },
                };
              }

              return {
                filter: `_type == "product" && $collectionId in collections[]._ref`,
                params: {
                  collectionId,
                },
              };
            },
          },
        }),
      ],
      group: "editorial",
    }),
    defineField({
      name: "store",
      title: "Shopify",
      type: "shopifyCollection",
      description: "Collection data from Shopify (read-only)",
      group: "shopifySync",
    }),
    defineField({
      name: "seo",
      title: "SEO",
      type: "seo",
      group: "seo",
    }),
  ],
  orderings: [
    {
      name: "sortOrder",
      title: "Manual Order",
      by: [{ field: "sortOrder", direction: "asc" }],
    },
    {
      name: "titleAsc",
      title: "Title (A-Z)",
      by: [{ field: "store.title", direction: "asc" }],
    },
    {
      name: "titleDesc",
      title: "Title (Z-A)",
      by: [{ field: "store.title", direction: "desc" }],
    },
  ],
  preview: {
    select: {
      imageUrl: "store.imageUrl",
      isDeleted: "store.isDeleted",
      rules: "store.rules",
      title: "store.title",
    },
    prepare({ imageUrl, isDeleted, rules, title }) {
      const ruleCount = rules?.length || 0;

      return {
        media: (
          <ShopifyDocumentStatus
            isDeleted={isDeleted}
            type="collection"
            url={imageUrl}
            title={title}
          />
        ),
        subtitle:
          ruleCount > 0
            ? `Automated (${pluralize("rule", ruleCount, true)})`
            : "Manual",
        title,
      };
    },
  },
});
