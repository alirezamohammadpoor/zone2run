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
    defineField({
      name: "productTabs",
      title: "Product Page Tabs",
      type: "object",
      description: "Content for product detail page tabs",
      fields: [
        defineField({
          name: "shippingAndReturns",
          title: "Shipping and Returns",
          type: "text",
          rows: 5,
          description: "Information about shipping and returns policy",
        }),
        defineField({
          name: "payments",
          title: "Payments",
          type: "text",
          rows: 3,
          description: "Information about payment methods",
        }),
      ],
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

