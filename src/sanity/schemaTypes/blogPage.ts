import { defineType, defineField } from "sanity";

export const blogPage = defineType({
  name: "blogPage",
  title: "Blog Page",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Page Title",
      type: "string",
      initialValue: "Blog",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "description",
      title: "Page Description",
      type: "text",
      rows: 3,
      description: "Brief description of the blog",
    }),
    defineField({
      name: "heroImage",
      title: "Hero Image",
      type: "image",
      options: { hotspot: true },
      fields: [{ name: "alt", type: "string", title: "Alt Text" }],
    }),
    defineField({
      name: "featuredPosts",
      title: "Featured Posts",
      type: "array",
      of: [
        {
          type: "reference",
          to: [{ type: "blogPost" }],
        },
      ],
      validation: (Rule) => Rule.max(3),
      description: "Up to 3 featured posts to highlight",
    }),
    defineField({
      name: "postsPerPage",
      title: "Posts Per Page",
      type: "number",
      initialValue: 12,
      validation: (Rule) => Rule.required().min(1).max(50),
    }),
    defineField({
      name: "seo",
      title: "SEO",
      type: "object",
      fields: [
        {
          name: "metaTitle",
          title: "Meta Title",
          type: "string",
          validation: (Rule) => Rule.max(60),
        },
        {
          name: "metaDescription",
          title: "Meta Description",
          type: "text",
          rows: 3,
          validation: (Rule) => Rule.max(160),
        },
      ],
    }),
  ],
  preview: {
    select: {
      title: "title",
    },
    prepare(selection) {
      return {
        title: selection.title || "Blog Page",
        subtitle: "Blog Configuration",
      };
    },
  },
});

export default blogPage;
