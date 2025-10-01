import { defineField, defineType } from "sanity";

export const portableTextModule = defineType({
  name: "portableTextModule",
  title: "Portable Text Module",
  type: "object",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
    }),
    defineField({
      name: "content",
      title: "Content",
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
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "maxWidth",
      title: "Max Width",
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
    }),
  ],
  preview: {
    select: {
      title: "title",
    },
    prepare(selection) {
      const { title } = selection;
      return {
        title: "Portable Text Module",
        subtitle: title || "No title",
      };
    },
  },
});
