import { defineArrayMember, defineField, defineType } from "sanity";

export default defineType({
  name: "brand",
  title: "Brand",
  type: "document",
  preview: {
    select: {
      title: "name",
      media: "logo",
    },
    prepare({ title, media }) {
      return {
        title: title || "Untitled Brand",
        media,
      };
    },
  },
  fields: [
    defineField({
      name: "name",
      title: "Brand Name",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: {
        source: "name",
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "logo",
      title: "Brand Logo",
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
      name: "description",
      title: "Brand Description",
      type: "text",
      rows: 4,
    }),
    defineField({
      name: "website",
      title: "Website",
      type: "url",
    }),
    defineField({
      name: "featured",
      title: "Featured Brand",
      type: "boolean",
      initialValue: false,
      description: "Show this brand in featured sections",
    }),
    defineField({
      name: "editorialImages",
      title: "Editorial Images",
      type: "array",
      description:
        "Full-width images to display between products on brand page. Drag to reorder.",
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
                subtitle: "Appears after every 6 products",
                media,
              };
            },
          },
        }),
      ],
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
            "Title for search engines (leave empty to use brand name)",
        },
        {
          name: "description",
          type: "text",
          title: "SEO Description",
          rows: 3,
          description: "Description for search engines",
        },
      ],
    }),
  ],
});
