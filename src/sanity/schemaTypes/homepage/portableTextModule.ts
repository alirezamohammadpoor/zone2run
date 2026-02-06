import { defineField, defineType } from "sanity";

export const portableTextModule = defineType({
  name: "portableTextModule",
  title: "Content Module",
  description:
    "Unified module for text, media (image/video), and products. Media/products on left, text on right.",
  type: "object",
  fields: [
    defineField({
      name: "contentType",
      title: "Content Type",
      description: "Choose what to display",
      type: "string",
      options: {
        list: [
          { title: "Text Only", value: "text-only" },
          { title: "Media + Text", value: "media-text" },
          { title: "Products + Text", value: "products-text" },
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
    // Text content (shared across layouts with text)
    defineField({
      name: "content",
      title: "Text Content",
      description: "Rich text content",
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
                  { name: "href", type: "url", title: "URL" },
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
          fields: [{ name: "alt", type: "string", title: "Alt Text" }],
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
    // Media fields (for media-text)
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
      hidden: ({ parent }) => parent?.contentType !== "media-text",
    }),
    defineField({
      name: "image",
      title: "Image",
      type: "image",
      options: { hotspot: true },
      fields: [{ name: "alt", type: "string", title: "Alt Text" }],
      hidden: ({ parent }) =>
        parent?.contentType !== "media-text" || parent?.mediaType !== "image",
    }),
    defineField({
      name: "video",
      title: "Video",
      type: "file",
      options: { accept: "video/*" },
      hidden: ({ parent }) =>
        parent?.contentType !== "media-text" || parent?.mediaType !== "video",
    }),
    defineField({
      name: "mediaHeight",
      title: "Media Height",
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
      hidden: ({ parent }) => parent?.contentType !== "media-text",
    }),
    // Products fields (for products-text and products-only)
    defineField({
      name: "productSource",
      title: "Product Source",
      type: "string",
      options: {
        list: [
          { title: "Manual Selection", value: "manual" },
          { title: "From Collection", value: "collection" },
        ],
      },
      initialValue: "manual",
      hidden: ({ parent }) =>
        parent?.contentType !== "products-text" &&
        parent?.contentType !== "products-only",
    }),
    defineField({
      name: "collection",
      title: "Collection",
      type: "reference",
      to: [{ type: "collection" }],
      hidden: ({ parent }) => {
        const hasProducts =
          parent?.contentType === "products-text" ||
          parent?.contentType === "products-only";
        return !(hasProducts && parent?.productSource === "collection");
      },
      validation: (Rule) =>
        Rule.custom((value, context) => {
          const { parent } = context as {
            parent?: { productSource?: string; contentType?: string };
          };
          const hasProducts =
            parent?.contentType === "products-text" ||
            parent?.contentType === "products-only";
          if (hasProducts && parent?.productSource === "collection" && !value) {
            return "Collection is required when product source is 'From Collection'";
          }
          return true;
        }),
    }),
    defineField({
      name: "featuredHeading",
      title: "Products Heading",
      type: "string",
      hidden: ({ parent }) =>
        parent?.contentType !== "products-text" &&
        parent?.contentType !== "products-only",
    }),
    defineField({
      name: "featuredSubheading",
      title: "Products Subheading",
      type: "string",
      hidden: ({ parent }) =>
        parent?.contentType !== "products-text" &&
        parent?.contentType !== "products-only",
    }),
    defineField({
      name: "displayType",
      title: "Products Display (Mobile)",
      type: "string",
      options: {
        list: [
          { title: "Horizontal Scroll", value: "horizontal" },
          { title: "Grid Layout", value: "grid" },
        ],
      },
      initialValue: "horizontal",
      hidden: ({ parent }) =>
        parent?.contentType !== "products-text" &&
        parent?.contentType !== "products-only",
    }),
    defineField({
      name: "displayTypeDesktop",
      title: "Products Display (Desktop)",
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
        parent?.contentType !== "products-text" &&
        parent?.contentType !== "products-only",
    }),
    defineField({
      name: "productCount",
      title: "Number of Products",
      description: "How many products to display (0 = show all). Grid only.",
      type: "number",
      initialValue: 4,
      validation: (Rule) => Rule.min(0).max(50),
      hidden: ({ parent }) =>
        (parent?.contentType !== "products-text" &&
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
            },
          ],
          preview: {
            select: { title: "product.title", imageSelection: "imageSelection" },
            prepare(selection) {
              return {
                title: selection.title || "Product",
                subtitle:
                  selection.imageSelection === "main"
                    ? "Main Image"
                    : `Gallery Image ${selection.imageSelection?.split("_")[1] || ""}`,
              };
            },
          },
        },
      ],
      validation: (Rule) => Rule.max(20),
      hidden: ({ parent }) => {
        const hasProducts =
          parent?.contentType === "products-text" ||
          parent?.contentType === "products-only";
        return !hasProducts || parent?.productSource === "collection";
      },
    }),
    defineField({
      name: "featuredButtonLink",
      title: "Products Button Link",
      type: "string",
      hidden: ({ parent }) =>
        parent?.contentType !== "products-text" &&
        parent?.contentType !== "products-only",
    }),
    defineField({
      name: "featuredButtonText",
      title: "Products Button Text",
      type: "string",
      hidden: ({ parent }) =>
        parent?.contentType !== "products-text" &&
        parent?.contentType !== "products-only",
    }),
    // Text styling
    defineField({
      name: "maxWidth",
      title: "Text Max Width",
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
      type: "string",
      hidden: ({ parent }) => parent?.contentType === "products-only",
    }),
    defineField({
      name: "link",
      title: "Link URL",
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
  ],
  preview: {
    select: { title: "title", contentType: "contentType" },
    prepare(selection) {
      const { title, contentType } = selection;
      const typeLabels: Record<string, string> = {
        "text-only": "Text Only",
        "media-text": "Media + Text",
        "products-text": "Products + Text",
        "products-only": "Products Only",
      };
      return {
        title: "Content Module",
        subtitle: `${typeLabels[contentType] || "Content"}${title ? ` - ${title}` : ""}`,
      };
    },
  },
});
