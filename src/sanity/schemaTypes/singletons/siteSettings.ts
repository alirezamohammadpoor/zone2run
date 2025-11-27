import { CogIcon } from "@sanity/icons";
import { defineField, defineType } from "sanity";

export const siteSettingsType = defineType({
  name: "siteSettings",
  title: "Site Settings",
  type: "document",
  icon: CogIcon,
  fields: [
    defineField({
      name: "activeHomepage",
      title: "Active Homepage",
      type: "reference",
      to: [{ type: "homepageVersion" }],
      description: "Select which homepage version to display on the site",
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    prepare() {
      return {
        title: "Site Settings",
        media: CogIcon,
      };
    },
  },
});

