import { defineField } from "sanity";

export const notFoundPageType = defineField({
  name: "notFoundPage",
  title: "404 page",
  type: "object",
  group: "notFoundPage",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "body",
      title: "Body Text",
      type: "text",
      rows: 2,
    }),
    defineField({
      name: "image",
      title: "Background Image",
      type: "image",
      options: { hotspot: true },
      fields: [
        {
          name: "alt",
          type: "string",
          title: "Alt Text",
        },
      ],
    }),
    defineField({
      name: "buttons",
      title: "Buttons",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            {
              name: "text",
              type: "string",
              title: "Button Text",
              validation: (Rule) => Rule.required(),
            },
            {
              name: "link",
              type: "string",
              title: "Link URL",
              validation: (Rule) => Rule.required(),
            },
          ],
          preview: {
            select: {
              title: "text",
              subtitle: "link",
            },
          },
        },
      ],
    }),
  ],
});
