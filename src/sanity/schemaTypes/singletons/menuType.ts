import { MenuIcon } from "@sanity/icons";
import { defineArrayMember, defineField } from "sanity";
import { GROUPS } from "../../constants";

const TITLE = "Navigation Menu";

export const navigationMenuType = defineField({
  name: "navigationMenu",
  title: TITLE,
  type: "document",
  icon: MenuIcon,
  groups: GROUPS,
  fields: [
    defineField({
      name: "men",
      title: "Men Tab",
      type: "object",
      group: "editorial",
      fields: [
        defineField({
          name: "featuredCollections",
          title: "Featured Collections",
          type: "array",
          description:
            "Collections to display in the Men tab. Drag to reorder.",
          of: [
            defineArrayMember({
              type: "reference",
              to: [{ type: "collection" }],
            }),
          ],
        }),
      ],
    }),
    defineField({
      name: "women",
      title: "Women Tab",
      type: "object",
      group: "editorial",
      fields: [
        defineField({
          name: "featuredCollections",
          title: "Featured Collections",
          type: "array",
          description:
            "Collections to display in the Women tab. Drag to reorder.",
          of: [
            defineArrayMember({
              type: "reference",
              to: [{ type: "collection" }],
            }),
          ],
        }),
      ],
    }),
    defineField({
      name: "help",
      title: "Help Tab",
      type: "object",
      group: "editorial",
      fields: [
        defineField({
          name: "links",
          title: "Help Links",
          type: "array",
          description: "Links to display in the Help tab. Drag to reorder.",
          of: [
            defineArrayMember({
              type: "object",
              fields: [
                defineField({
                  name: "label",
                  type: "string",
                  validation: (Rule) => Rule.required(),
                }),
                defineField({
                  name: "url",
                  type: "string",
                  validation: (Rule) => Rule.required(),
                }),
              ],
              preview: {
                select: {
                  title: "label",
                  subtitle: "url",
                },
              },
            }),
          ],
        }),
      ],
    }),
    defineField({
      name: "ourSpace",
      title: "Our Space Tab",
      type: "object",
      group: "editorial",
      fields: [
        defineField({
          name: "links",
          title: "Our Space Links",
          type: "array",
          description:
            "Links to display in the Our Space tab. Drag to reorder.",
          of: [
            defineArrayMember({
              type: "object",
              fields: [
                defineField({
                  name: "label",
                  type: "string",
                  validation: (Rule) => Rule.required(),
                }),
                defineField({
                  name: "url",
                  type: "string",
                  validation: (Rule) => Rule.required(),
                }),
              ],
              preview: {
                select: {
                  title: "label",
                  subtitle: "url",
                },
              },
            }),
          ],
        }),
      ],
    }),
  ],
  preview: {
    prepare() {
      return {
        media: MenuIcon,
        subtitle: "Navigation Menu",
        title: TITLE,
      };
    },
  },
});
