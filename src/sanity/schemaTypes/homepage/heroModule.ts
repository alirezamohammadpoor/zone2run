import { defineType, defineField } from "sanity";

export const heroModule = defineType({
  name: "heroModule",
  title: "Hero Module",
  type: "object",
  fields: [
    defineField({
      name: "heroHeading",
      title: "Hero Heading",
      type: "string",
    }),
    defineField({
      name: "heroSubparagraph",
      title: "Hero Subparagraph",
      type: "string",
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
      name: "heroImage",
      title: "Hero Image",
      type: "image",
      description:
        "Use the hotspot tool to set the focal point for responsive cropping",
      options: {
        hotspot: true,
      },
      fields: [{ name: "alt", type: "string", title: "Alt Text" }],
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
      name: "heroVideo",
      title: "Hero Video",
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
      name: "buttonText",
      title: "Button Text",
      type: "string",
    }),
    defineField({
      name: "buttonLink",
      title: "Button Link",
      type: "string",
    }),
    defineField({
      name: "textColor",
      title: "Text Color",
      type: "string",
      options: {
        list: [
          { title: "Black", value: "black" },
          { title: "White", value: "white" },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "height",
      type: "string",
      title: "Hero Height",
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
      initialValue: "100vh",
      description: "Height of the hero section",
      validation: (Rule) => Rule.required(),
    }),
  ],
});

export default heroModule;
