import { defineField, defineType } from "sanity";

export default defineType({
  name: "category",
  title: "Category",
  type: "document",
  preview: {
    select: {
      title: "title",
      media: "image",
      categoryType: "categoryType",
      parentCategory: "parentCategory.title",
    },
    prepare({ title, media, categoryType, parentCategory }) {
      const typeLabel = categoryType ? `[${categoryType}]` : "";
      const parentLabel = parentCategory ? ` → ${parentCategory}` : "";

      return {
        title: `${title}${typeLabel}${parentLabel}`,
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
      options: { hotspot: true },
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
      description: "Leave empty for top-level categories (e.g., Tops, Bottoms)",
    }),

    defineField({
      name: "categoryType",
      title: "Category Type",
      type: "string",
      options: {
        list: [
          { title: "Main Category", value: "main" },
          { title: "Subcategory", value: "subcategory" },
          { title: "Specific Type", value: "specific" },
        ],
        layout: "radio",
      },
      validation: (Rule) =>
        Rule.required().custom((value, context) => {
          const parent = (context.parent as any)?.parentCategory;
          if (value === "main" && parent)
            return "Main category cannot have a parent";
          if ((value === "subcategory" || value === "specific") && !parent)
            return `${value} must have a parent category`;
          return true;
        }),
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
      description: "Lower numbers appear first within the same level",
      initialValue: 0,
    }),

    defineField({
      name: "seo",
      title: "SEO",
      type: "object",
      fields: [
        { name: "title", type: "string", title: "SEO Title" },
        {
          name: "description",
          type: "text",
          title: "SEO Description",
          rows: 3,
        },
        {
          name: "keywords",
          type: "array",
          title: "SEO Keywords",
          of: [{ type: "string" }],
          options: { layout: "tags" },
        },
      ],
    }),

  ],
});
