import { defineField, defineType } from "sanity";

export const portableTextModule = defineType({
  name: "portableTextModule",
  title: "Content Module",
  description:
    "Unified module for text, media (image/video), and featured products with responsive split layouts",
  type: "object",
  fields: [
    defineField({
      name: "contentType",
      title: "Content Type",
      description: "Choose what to display alongside the text content",
      type: "string",
      options: {
        list: [
          { title: "Text Only", value: "text-only" },
          { title: "Text with Media (Image/Video)", value: "text-with-media" },
          { title: "Text with Products", value: "text-with-products" },
          { title: "Media with Products", value: "media-with-products" },
          { title: "Products Only", value: "products-only" },
        ],
      },
      initialValue: "text-only",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "title",
      title: "Title",
      type: "string",
    }),
    defineField({
      name: "content",
      title: "Text Content",
      description:
        "Rich text content that can include headings, paragraphs, lists, and links",
      type: "array",
      of: [
        {
          type: "block",
          styles: [
            { title: "Normal", value: "normal" },
            { title: "H1", value: "h1" },
            { title: "H2", value: "h2" },
            { title: "H3", value: "h3" },
            { title: "H4", value: "h4" },
            { title: "Quote", value: "blockquote" },
          ],
          lists: [
            { title: "Bullet", value: "bullet" },
            { title: "Number", value: "number" },
          ],
          marks: {
            decorators: [
              { title: "Strong", value: "strong" },
              { title: "Emphasis", value: "em" },
              { title: "Underline", value: "underline" },
            ],
            annotations: [
              {
                name: "link",
                type: "object",
                title: "Link",
                fields: [
                  {
                    name: "href",
                    type: "url",
                    title: "URL",
                  },
                  {
                    name: "target",
                    type: "string",
                    title: "Target",
                    options: {
                      list: [
                        { title: "Same window", value: "_self" },
                        { title: "New window", value: "_blank" },
                      ],
                    },
                    initialValue: "_self",
                  },
                ],
              },
            ],
          },
        },
        {
          type: "image",
          options: { hotspot: true },
          fields: [
            {
              name: "alt",
              type: "string",
              title: "Alt Text",
            },
          ],
        },
      ],
      hidden: ({ parent }) => parent?.contentType === "products-only",
      validation: (Rule) =>
        Rule.custom((value, context) => {
          const { parent } = context as { parent?: { contentType?: string } };
          if (parent?.contentType !== "products-only" && !value) {
            return "Text content is required unless content type is 'Products Only'";
          }
          return true;
        }),
    }),
    // Layout options
    defineField({
      name: "layout",
      title: "Layout",
      description:
        "Single column stacks on mobile, split layout creates side-by-side on larger screens",
      type: "string",
      options: {
        list: [
          { title: "Single Column", value: "single" },
          { title: "Split Layout", value: "split" },
          { title: "Full Width Media", value: "full-width" },
        ],
      },
      initialValue: "single",
      hidden: ({ parent }) =>
        parent?.contentType === "text-only" ||
        parent?.contentType === "products-only",
    }),
    // Media fields (for text-with-media)
    defineField({
      name: "mediaType",
      title: "Media Type",
      type: "string",
      options: {
        list: [
          { title: "Image", value: "image" },
          { title: "Video", value: "video" },
        ],
      },
      initialValue: "image",
      hidden: ({ parent }) =>
        parent?.contentType !== "text-with-media" &&
        parent?.contentType !== "media-with-products",
    }),
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
          title: "Alt Text",
        },
      ],
      hidden: ({ parent }) =>
        (parent?.contentType !== "text-with-media" &&
          parent?.contentType !== "media-with-products") ||
        parent?.mediaType !== "image",
    }),
    defineField({
      name: "video",
      title: "Video",
      type: "file",
      options: {
        accept: "video/*",
      },
      hidden: ({ parent }) =>
        (parent?.contentType !== "text-with-media" &&
          parent?.contentType !== "media-with-products") ||
        parent?.mediaType !== "video",
    }),
    defineField({
      name: "mediaPosition",
      title: "Media Position",
      description:
        "Position of media relative to text (only applies to split layout)",
      type: "string",
      options: {
        list: [
          { title: "Left", value: "left" },
          { title: "Right", value: "right" },
        ],
      },
      initialValue: "left",
      hidden: ({ parent }) =>
        (parent?.contentType !== "text-with-media" &&
          parent?.contentType !== "media-with-products") ||
        parent?.layout !== "split",
    }),
    defineField({
      name: "mediaHeight",
      title: "Media Height",
      description: "Height of the media element",
      type: "string",
      options: {
        list: [
          { title: "50vh", value: "50vh" },
          { title: "60vh", value: "60vh" },
          { title: "70vh", value: "70vh" },
          { title: "80vh", value: "80vh" },
          { title: "90vh", value: "90vh" },
          { title: "100vh", value: "100vh" },
        ],
      },
      initialValue: "70vh",
      hidden: ({ parent }) =>
        parent?.contentType !== "text-with-media" &&
        parent?.contentType !== "media-with-products",
    }),
    // Products fields (for text-with-products, media-with-products, or products-only)
    defineField({
      name: "productSource",
      title: "Product Source",
      description:
        "Choose how to select products - manually or from a collection",
      type: "string",
      options: {
        list: [
          { title: "Manual Selection", value: "manual" },
          { title: "From Collection", value: "collection" },
        ],
      },
      initialValue: "manual",
      hidden: ({ parent }) =>
        parent?.contentType !== "text-with-products" &&
        parent?.contentType !== "media-with-products" &&
        parent?.contentType !== "products-only",
    }),
    defineField({
      name: "collection",
      title: "Collection",
      description: "Select a collection to display all its products",
      type: "reference",
      to: [{ type: "collection" }],
      hidden: ({ parent }) => {
        const contentType = parent?.contentType;
        const productSource = parent?.productSource;
        // Show only when contentType includes products AND productSource is collection
        return !(
          (contentType === "text-with-products" ||
            contentType === "media-with-products" ||
            contentType === "products-only") &&
          productSource === "collection"
        );
      },
      validation: (Rule) =>
        Rule.custom((value, context) => {
          const { parent } = context as {
            parent?: { productSource?: string; contentType?: string };
          };
          if (
            (parent?.contentType === "text-with-products" ||
              parent?.contentType === "media-with-products" ||
              parent?.contentType === "products-only") &&
            parent?.productSource === "collection" &&
            !value
          ) {
            return "Collection is required when product source is 'From Collection'";
          }
          return true;
        }),
    }),
    defineField({
      name: "productPosition",
      title: "Product Position",
      description:
        "Position of products relative to text (only applies to split layout)",
      type: "string",
      options: {
        list: [
          { title: "Left", value: "left" },
          { title: "Right", value: "right" },
        ],
      },
      initialValue: "right",
      hidden: ({ parent }) =>
        (parent?.contentType !== "text-with-products" &&
          parent?.contentType !== "media-with-products") ||
        parent?.layout !== "split",
    }),
    defineField({
      name: "featuredHeading",
      title: "Products Heading",
      description: "Heading text for the products section",
      type: "string",
      hidden: ({ parent }) =>
        parent?.contentType !== "text-with-products" &&
        parent?.contentType !== "media-with-products" &&
        parent?.contentType !== "products-only",
    }),
    defineField({
      name: "featuredSubheading",
      title: "Products Subheading",
      type: "string",
      hidden: ({ parent }) =>
        parent?.contentType !== "text-with-products" &&
        parent?.contentType !== "media-with-products" &&
        parent?.contentType !== "products-only",
    }),
    defineField({
      name: "displayType",
      title: "Products Display Type (Mobile)",
      description: "How to display products on mobile screens",
      type: "string",
      options: {
        list: [
          { title: "Horizontal Scroll", value: "horizontal" },
          { title: "Grid Layout", value: "grid" },
        ],
      },
      initialValue: "horizontal",
      hidden: ({ parent }) =>
        parent?.contentType !== "text-with-products" &&
        parent?.contentType !== "media-with-products" &&
        parent?.contentType !== "products-only",
    }),
    defineField({
      name: "displayTypeDesktop",
      title: "Products Display Type (Desktop)",
      description:
        "How to display products on larger screens (leave empty to use same as mobile)",
      type: "string",
      options: {
        list: [
          { title: "Same as Mobile", value: "" },
          { title: "Horizontal Scroll", value: "horizontal" },
          { title: "Grid Layout", value: "grid" },
        ],
      },
      initialValue: "",
      hidden: ({ parent }) =>
        parent?.contentType !== "text-with-products" &&
        parent?.contentType !== "media-with-products" &&
        parent?.contentType !== "products-only",
    }),
    defineField({
      name: "productCount",
      title: "Number of Products to Show",
      description:
        "How many products to display (0 = show all). Only applies to grid layout.",
      type: "number",
      initialValue: 4,
      validation: (Rule) => Rule.min(0).max(50),
      hidden: ({ parent }) =>
        (parent?.contentType !== "text-with-products" &&
          parent?.contentType !== "media-with-products" &&
          parent?.contentType !== "products-only") ||
        parent?.displayType !== "grid",
    }),
    defineField({
      name: "featuredProducts",
      title: "Featured Products",
      type: "array",
      of: [
        {
          type: "object",
          name: "productWithImage",
          title: "Product with Image",
          fields: [
            {
              name: "product",
              title: "Product",
              type: "reference",
              to: [{ type: "product" }],
              validation: (Rule) => Rule.required(),
            },
            {
              name: "imageSelection",
              title: "Image Selection",
              type: "string",
              options: {
                list: [
                  { title: "Main Image", value: "main" },
                  { title: "Gallery Image 1", value: "gallery_0" },
                  { title: "Gallery Image 2", value: "gallery_1" },
                  { title: "Gallery Image 3", value: "gallery_2" },
                  { title: "Gallery Image 4", value: "gallery_3" },
                  { title: "Gallery Image 5", value: "gallery_4" },
                ],
              },
              initialValue: "main",
              description: "Choose which image from the product to display",
            },
          ],
          preview: {
            select: {
              title: "product.title",
              imageSelection: "imageSelection",
            },
            prepare(selection) {
              return {
                title: selection.title || "Product",
                subtitle:
                  selection.imageSelection === "main"
                    ? "Main Image"
                    : `Gallery Image ${
                        selection.imageSelection?.split("_")[1] || ""
                      }`,
              };
            },
          },
        },
      ],
      validation: (Rule) => Rule.max(20),
      hidden: ({ parent }) => {
        const contentType = parent?.contentType;
        const productSource = parent?.productSource;
        // Hide if not a products content type, or if using collection source
        return (
          (contentType !== "text-with-products" &&
            contentType !== "media-with-products" &&
            contentType !== "products-only") ||
          productSource === "collection"
        );
      },
    }),
    defineField({
      name: "featuredButtonLink",
      title: "Products Button Link",
      type: "string",
      hidden: ({ parent }) =>
        parent?.contentType !== "text-with-products" &&
        parent?.contentType !== "media-with-products" &&
        parent?.contentType !== "products-only",
    }),
    defineField({
      name: "featuredButtonText",
      title: "Products Button Text",
      type: "string",
      hidden: ({ parent }) =>
        parent?.contentType !== "text-with-products" &&
        parent?.contentType !== "media-with-products" &&
        parent?.contentType !== "products-only",
    }),
    // Text styling options
    defineField({
      name: "maxWidth",
      title: "Text Max Width",
      description: "Maximum width of the text content",
      type: "string",
      options: {
        list: [
          { title: "Small", value: "max-w-2xl" },
          { title: "Medium", value: "max-w-4xl" },
          { title: "Large", value: "max-w-6xl" },
          { title: "Full", value: "max-w-full" },
        ],
      },
      initialValue: "max-w-4xl",
      hidden: ({ parent }) => parent?.contentType === "products-only",
    }),
    defineField({
      name: "textAlign",
      title: "Text Alignment",
      type: "string",
      options: {
        list: [
          { title: "Left", value: "text-left" },
          { title: "Center", value: "text-center" },
          { title: "Right", value: "text-right" },
        ],
      },
      initialValue: "text-left",
      hidden: ({ parent }) => parent?.contentType === "products-only",
    }),
    // Link fields
    defineField({
      name: "linkText",
      title: "Link Text",
      description: "Text to display for the link",
      type: "string",
      hidden: ({ parent }) => parent?.contentType === "products-only",
    }),
    defineField({
      name: "link",
      title: "Link URL",
      description: "Link URL",
      type: "string",
      hidden: ({ parent }) => parent?.contentType === "products-only",
    }),
    defineField({
      name: "source",
      title: "Source",
      description: "Source attribution",
      type: "string",
      hidden: ({ parent }) => parent?.contentType === "products-only",
    }),
    defineField({
      name: "source",
      title: "Source",
      type: "string",
    }),
    defineField({
      name: "linkText",
      title: "Link Text",
      type: "string",
      description: "Text to display for the link",
    }),
    defineField({
      name: "link",
      title: "Link URL",
      type: "string",
      description: "Link URL to the source of the content",
    }),
  ],
  preview: {
    select: {
      title: "title",
      contentType: "contentType",
    },
    prepare(selection) {
      const { title, contentType } = selection;
      const typeLabels: Record<string, string> = {
        "text-only": "Text Only",
        "text-with-media": "Text + Media",
        "text-with-products": "Text + Products",
        "media-with-products": "Media + Products",
        "products-only": "Products Only",
      };
      return {
        title: "Content Module",
        subtitle: `${typeLabels[contentType] || "Content"}${
          title ? ` - ${title}` : ""
        }`,
      };
    },
  },
});
