import { type SchemaTypeDefinition } from "sanity";

const homepage: SchemaTypeDefinition = {
  name: "homepage",
  title: "Homepage",
  type: "document",
  fields: [
    {
      name: "title",
      title: "Page Title",
      type: "string",
      description: "Internal title for this homepage configuration",
      initialValue: "Homepage",
    },
    {
      name: "modules",
      title: "Homepage Sections",
      type: "array",
      description: "Add, remove, and reorder homepage sections",
      of: [
        { type: "heroModule" },
        { type: "featuredProductsModule" },
        { type: "editorialModule" },
        { type: "spotifyPlaylistsModule" },
        { type: "imageModule" },
        { type: "portableTextModule" },
      ],
      validation: (Rule) =>
        Rule.required().min(1).error("Homepage must have at least one section"),
    },
  ],
  preview: {
    select: {
      title: "title",
    },
    prepare(selection) {
      return {
        title: selection.title || "Homepage",
        subtitle: "Homepage Configuration",
      };
    },
  },
};

export default homepage;
