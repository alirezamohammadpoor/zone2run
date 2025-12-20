import { defineType, defineField } from "sanity";

export const blogPost = defineType({
  name: "blogPost",
  title: "Blog Post",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: {
        source: "title",
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "excerpt",
      title: "Excerpt",
      type: "text",
      rows: 3,
      description: "Short description for blog listings",
    }),
    defineField({
      name: "content",
      title: "Content",
      type: "array",
      description: "Main blog post content with rich text formatting",
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
            { title: "Numbered", value: "number" },
          ],
          marks: {
            decorators: [
              { title: "Strong", value: "strong" },
              { title: "Emphasis", value: "em" },
              { title: "Code", value: "code" },
            ],
            annotations: [
              {
                name: "link",
                type: "object",
                title: "URL",
                fields: [
                  {
                    title: "URL",
                    name: "href",
                    type: "url",
                    validation: (Rule) =>
                      Rule.uri({
                        allowRelative: true,
                        scheme: ["http", "https", "mailto", "tel"],
                      }),
                  },
                  {
                    title: "Open in new tab",
                    name: "blank",
                    type: "boolean",
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
              validation: (Rule) => Rule.required(),
            },
            {
              name: "caption",
              type: "string",
              title: "Caption",
            },
          ],
        },
        {
          type: "file",
          title: "Video",
          options: {
            accept: "video/*",
          },
        },
        { type: "blogProductsModule" },
        { type: "muxVideo" },
      ],
      validation: (Rule) => Rule.required().min(1),
    }),
    defineField({
      name: "productsModule",
      title: "Products Module",
      type: "blogProductsModule",
    }),
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
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "heroHeight",
      title: "Hero Height",
      type: "string",
      options: {
        list: [
          { title: "100vh (Full Screen)", value: "100vh" },
          { title: "95vh", value: "95vh" },
          { title: "90vh", value: "90vh" },
          { title: "85vh", value: "85vh" },
          { title: "80vh", value: "80vh" },
          { title: "75vh", value: "75vh" },
          { title: "70vh", value: "70vh" },
          { title: "65vh", value: "65vh" },
          { title: "60vh", value: "60vh" },
          { title: "55vh", value: "55vh" },
          { title: "50vh", value: "50vh" },
        ],
      },
      initialValue: "80vh",
      description: "Height of the hero section",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "featuredImage",
      title: "Featured Image",
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
      hidden: ({ parent }) => parent?.mediaType !== "image",
      validation: (Rule) =>
        Rule.custom((value, context) => {
          const { parent } = context as { parent?: { mediaType?: string } };
          if (parent?.mediaType === "image" && !value) {
            return "Image is required when media type is image";
          }
          return true;
        }),
    }),
    defineField({
      name: "featuredVideo",
      title: "Featured Video",
      type: "file",
      options: {
        accept: "video/*",
      },
      hidden: ({ parent }) => parent?.mediaType !== "video",
      validation: (Rule) =>
        Rule.custom((value, context) => {
          const { parent } = context as { parent?: { mediaType?: string } };
          if (parent?.mediaType === "video" && !value) {
            return "Video is required when media type is video";
          }
          return true;
        }),
    }),
    defineField({
      name: "editorialImage",
      title: "Editorial Image",
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
      description:
        "Image used in editorial modules and blog listings (separate from hero media)",
    }),
    defineField({
      name: "category",
      title: "Category",
      type: "reference",
      to: [{ type: "blogCategory" }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "author",
      title: "Author",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "publishedAt",
      title: "Published At",
      type: "datetime",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "featured",
      title: "Featured Post",
      type: "boolean",
      initialValue: false,
    }),
    // NEW FIELDS
    defineField({
      name: "tags",
      title: "Tags",
      type: "array",
      of: [{ type: "string" }],
      options: {
        layout: "tags",
      },
    }),
    defineField({
      name: "readingTime",
      title: "Reading Time (minutes)",
      type: "number",
      validation: (Rule) => Rule.required().min(1),
    }),
    // FEATURED COLLECTION
    defineField({
      name: "featuredCollection",
      title: "Featured Collection",
      type: "reference",
      to: [{ type: "collection" }],
      description: "Select a collection to display products from",
    }),
    defineField({
      name: "featuredCollectionLimit",
      title: "Product Limit",
      type: "number",
      description: "Maximum number of products to show (leave empty for all)",
      validation: (Rule) => Rule.min(1).max(50),
    }),
    defineField({
      name: "featuredCollectionDisplayType",
      title: "Display Type",
      type: "string",
      options: {
        list: [
          { title: "Grid", value: "grid" },
          { title: "Horizontal Scroll", value: "horizontal" },
        ],
        layout: "radio",
      },
      initialValue: "grid",
      description: "How to display the featured collection products",
    }),
    // SEO FIELDS
    defineField({
      name: "seo",
      title: "SEO",
      type: "object",
      fields: [
        {
          name: "metaTitle",
          title: "Meta Title",
          type: "string",
          description: "Title for search engines (max 60 characters)",
          validation: (Rule) => Rule.max(60),
        },
        {
          name: "metaDescription",
          title: "Meta Description",
          type: "text",
          rows: 3,
          description: "Description for search engines (max 160 characters)",
          validation: (Rule) => Rule.max(160),
        },
        {
          name: "keywords",
          title: "Keywords",
          type: "array",
          of: [{ type: "string" }],
          options: {
            layout: "tags",
          },
        },
      ],
    }),
  ],
  preview: {
    select: {
      title: "title",
      author: "author",
      media: "featuredImage",
      category: "category.title",
    },
    prepare(selection) {
      return {
        title: selection.title,
        subtitle: `${selection.category} • By ${selection.author}`,
        media: selection.media,
      };
    },
  },
});

export default blogPost;
