import { defineType, defineField } from "sanity";

export const blogCategory = defineType({
  name: "blogCategory",
  title: "Blog Category",
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
      name: "description",
      title: "Description",
      type: "text",
      rows: 3,
      description: "Brief description of this category",
    }),
    defineField({
      name: "image",
      title: "Featured Image",
      type: "image",
      options: { hotspot: true },
      fields: [{ name: "alt", type: "string", title: "Alt Text" }],
    }),
  ],
  preview: {
    select: {
      title: "title",
      description: "description",
    },
    prepare(selection) {
      return {
        title: selection.title,
        subtitle: selection.description,
      };
    },
  },
});

export default blogCategory;
