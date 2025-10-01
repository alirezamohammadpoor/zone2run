import { defineField, defineType } from "sanity";

export const spotifyPlaylistsModule = defineType({
  name: "spotifyPlaylistsModule",
  title: "Spotify Playlists Module",
  type: "object",
  fields: [
    defineField({
      name: "title",
      title: "Module Title",
      type: "string",
      description: "Title for this Spotify playlists section",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "subtitle",
      title: "Subtitle",
      type: "string",
      description: "Optional subtitle or description",
    }),
    defineField({
      name: "playlists",
      title: "Spotify Playlists",
      type: "array",
      description: "Add Spotify playlists to display",
      of: [
        {
          type: "object",
          fields: [
            defineField({
              name: "playlistId",
              title: "Spotify Playlist ID",
              type: "string",
              description:
                "The ID from the Spotify playlist URL (e.g., 466bNiA3zqJxGsChcgbTYJ)",
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "title",
              title: "Playlist Title",
              type: "string",
              description: "Custom title for this playlist",
            }),
            defineField({
              name: "description",
              title: "Description",
              type: "text",
              description: "Optional description of the playlist",
            }),
            defineField({
              name: "height",
              title: "Height",
              type: "number",
              description: "Height of the iframe in pixels",
              initialValue: 352,
              validation: (Rule) => Rule.min(200).max(600),
            }),
          ],
          preview: {
            select: {
              title: "title",
              playlistId: "playlistId",
            },
            prepare(selection) {
              return {
                title: selection.title || `Playlist: ${selection.playlistId}`,
                subtitle: `ID: ${selection.playlistId}`,
              };
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
      initialValue: "View All Playlists",
    }),
    defineField({
      name: "buttonLink",
      title: "Button Link",
      type: "string",
      description: "Link for the 'View All' button",
      initialValue: "/playlists",
    }),
  ],
  preview: {
    select: {
      title: "title",
      subtitle: "subtitle",
    },
    prepare(selection) {
      return {
        title: selection.title || "Spotify Playlists Module",
        subtitle: selection.subtitle || "Music playlists section",
      };
    },
  },
});
