import { defineField, defineType } from "sanity";

export const muxVideo = defineType({
  name: "muxVideo",
  title: "Mux Video",
  type: "object",
  fields: [
    defineField({
      name: "playbackId",
      title: "Playback ID",
      type: "string",
      description: "The Mux playback ID for the video",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "title",
      title: "Video Title",
      type: "string",
      description: "Optional title for the video",
    }),
    defineField({
      name: "description",
      title: "Video Description",
      type: "text",
      description: "Optional description for the video",
    }),
  ],
  preview: {
    select: {
      title: "title",
      playbackId: "playbackId",
    },
    prepare(selection) {
      const { title, playbackId } = selection;
      return {
        title: title || "Mux Video",
        subtitle: playbackId ? `ID: ${playbackId}` : "No playback ID",
      };
    },
  },
});
