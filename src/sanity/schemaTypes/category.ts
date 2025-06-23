import { defineField, defineType } from "sanity";

export default defineType({
  name: "category",
  title: "Category",
  type: "document",
  preview: {
    select: {
      title: "title",
      media: "image",
      productCount: "productCount",
    },
    prepare({ title, media, productCount }) {
      return {
        title: title || "Untitled Category",
        subtitle: productCount ? `${productCount} products` : "No products",
        media,
      };
    },
  },
  fields: [
    defineField({
      name: "title",
      title: "Category Title",
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
      name: "description",
      title: "Description",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "image",
      title: "Category Image",
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
    }),
    defineField({
      name: "parentCategory",
      title: "Parent Category",
      type: "reference",
      to: [{ type: "category" }],
      description: "Leave empty for top-level categories",
    }),
    defineField({
      name: "featured",
      title: "Featured Category",
      type: "boolean",
      initialValue: false,
      description: "Show this category in featured sections",
    }),
    defineField({
      name: "sortOrder",
      title: "Sort Order",
      type: "number",
      description: "Lower numbers appear first",
      initialValue: 0,
    }),
    defineField({
      name: "seo",
      title: "SEO",
      type: "object",
      fields: [
        {
          name: "title",
          type: "string",
          title: "SEO Title",
          description:
            "Title for search engines (leave empty to use category title)",
        },
        {
          name: "description",
          type: "text",
          title: "SEO Description",
          rows: 3,
          description: "Description for search engines",
        },
        {
          name: "keywords",
          type: "array",
          title: "SEO Keywords",
          of: [{ type: "string" }],
          options: {
            layout: "tags",
          },
        },
      ],
    }),
    defineField({
      name: "productCount",
      title: "Product Count",
      type: "number",
      readOnly: true,
      description: "This will be automatically calculated",
      initialValue: 0,
    }),
  ],
});
