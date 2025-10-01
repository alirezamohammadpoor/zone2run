import { defineField, defineType } from "sanity";

export const imageModule = defineType({
  name: "imageModule",
  title: "Image Module",
  type: "object",
  fields: [
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
      name: "imageHeight",
      title: "Image Height",
      type: "string",
      options: {
        list: [
          { title: "50vh", value: "50vh" },
          { title: "55vh", value: "55vh" },
          { title: "60vh", value: "60vh" },
          { title: "65vh", value: "65vh" },
          { title: "70vh", value: "70vh" },
          { title: "75vh", value: "75vh" },
          { title: "80vh", value: "80vh" },
          { title: "85vh", value: "85vh" },
          { title: "90vh", value: "90vh" },
          { title: "95vh", value: "95vh" },
          { title: "100vh", value: "100vh" },
        ],
      },
      initialValue: "70vh",
      validation: (Rule) => Rule.required(),
    }),
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
      name: "video",
      title: "Video",
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
              { title: "Code", value: "code" },
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
    }),
  ],
  preview: {
    select: {
      mediaType: "mediaType",
      image: "image",
      video: "video",
    },
    prepare(selection) {
      const { mediaType, image, video } = selection;
      return {
        title: "Image Module",
        subtitle: `${mediaType === "image" ? "Image" : "Video"} - ${
          mediaType === "image"
            ? image
              ? "Uploaded"
              : "No image"
            : video
            ? "Uploaded"
            : "No video"
        }`,
        media: mediaType === "image" ? image : undefined,
      };
    },
  },
});
