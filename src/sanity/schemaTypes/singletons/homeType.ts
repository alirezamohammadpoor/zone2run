import { HomeIcon } from "@sanity/icons";
import { defineArrayMember, defineField } from "sanity";
import { GROUPS } from "../../constants";

const TITLE = "Home";

export const homeType = defineField({
  name: "home",
  title: TITLE,
  type: "document",
  icon: HomeIcon,
  groups: GROUPS,
  fields: [
    defineField({
      name: "modules",
      type: "array",
      of: [
        defineArrayMember({ type: "heroModule" }),
        defineArrayMember({ type: "editorialModule" }),
        defineArrayMember({ type: "spotifyPlaylistsModule" }),
        defineArrayMember({ type: "imageModule" }),
        defineArrayMember({ type: "portableTextModule" }),
      ],
      group: "editorial",
    }),
    defineField({
      name: "seo",
      title: "SEO",
      type: "seo",
      group: "seo",
    }),
  ],
  preview: {
    prepare() {
      return {
        media: HomeIcon,
        subtitle: "Index",
        title: TITLE,
      };
    },
  },
});
