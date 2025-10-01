import { defineField, defineType } from "sanity";

export const editorialModule = defineType({
  name: "editorialModule",
  title: "Editorial Module",
  type: "object",
  fields: [
    defineField({
      name: "title",
      title: "Module Title",
      type: "string",
      description: "Title for this editorial section",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "subtitle",
      title: "Subtitle",
      type: "string",
      description: "Optional subtitle or description",
    }),
    defineField({
      name: "featuredPosts",
      title: "Featured Blog Posts",
      type: "array",
      description: "Select blog posts to feature in this editorial section",
      of: [
        {
          type: "object",
          fields: [
            defineField({
              name: "post",
              title: "Blog Post",
              type: "reference",
              to: [{ type: "blogPost" }],
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "imageSelection",
              title: "Image Selection",
              type: "string",
              description: "Which image to display for this post",
              options: {
                list: [
                  { title: "Editorial Image", value: "editorial" },
                  { title: "Featured Image", value: "featured" },
                  { title: "Gallery Image 1", value: "gallery_0" },
                  { title: "Gallery Image 2", value: "gallery_1" },
                  { title: "Gallery Image 3", value: "gallery_2" },
                ],
              },
              initialValue: "editorial",
            }),
          ],
          preview: {
            select: {
              title: "post.title",
              media: "post.featuredImage",
            },
          },
        },
      ],
      validation: (Rule) => Rule.max(6).min(1),
    }),
    defineField({
      name: "buttonText",
      title: "Button Text",
      type: "string",
      description: "Text for the 'View All' button",
      initialValue: "View All Editorials",
    }),
    defineField({
      name: "buttonLink",
      title: "Button Link",
      type: "string",
      description: "Link for the 'View All' button",
      initialValue: "/blog/editorials",
    }),
  ],
  preview: {
    select: {
      title: "title",
      subtitle: "subtitle",
    },
    prepare(selection) {
      return {
        title: selection.title || "Editorial Module",
        subtitle: selection.subtitle || "Blog posts section",
      };
    },
  },
});
