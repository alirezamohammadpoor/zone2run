import { HomeIcon } from "@sanity/icons";
import { defineArrayMember, defineField, defineType } from "sanity";
import { GROUPS } from "../../constants";

export const homepageVersionType = defineType({
  name: "homepageVersion",
  title: "Homepage Version",
  type: "document",
  icon: HomeIcon,
  groups: GROUPS,
  fields: [
    defineField({
      name: "title",
      title: "Version Name",
      type: "string",
      description: "Internal name to identify this homepage version (e.g., 'Summer Campaign', 'Default')",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "modules",
      title: "Modules",
      type: "array",
      of: [
        defineArrayMember({ type: "heroModule" }),
        defineArrayMember({ type: "featuredProductsModule" }),
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
    select: {
      title: "title",
    },
    prepare({ title }) {
      return {
        title: title || "Untitled Homepage",
        subtitle: "Homepage Version",
        media: HomeIcon,
      };
    },
  },
});

