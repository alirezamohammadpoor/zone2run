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
      title: "Default Homepage",
      type: "reference",
      to: [{ type: "homepageVersion" }],
      description:
        "Fallback homepage for markets without a region-specific version",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "marketHomepages",
      title: "Market-Specific Homepages",
      description:
        "Override the default homepage for specific market regions. Leave empty to show the default homepage everywhere.",
      type: "array",
      of: [
        {
          type: "object",
          name: "marketHomepage",
          fields: [
            defineField({
              name: "region",
              title: "Market Region",
              type: "string",
              options: {
                list: [
                  { title: "Nordic (SE, NO, DK, FI)", value: "nordic" },
                  { title: "United Kingdom (GB)", value: "uk" },
                  {
                    title: "EU (DE, FR, NL, BE, AT, IE, IT, ES, PT + more)",
                    value: "eu",
                  },
                ],
              },
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "homepage",
              title: "Homepage Version",
              type: "reference",
              to: [{ type: "homepageVersion" }],
              validation: (Rule) => Rule.required(),
            }),
          ],
          preview: {
            select: { region: "region", title: "homepage.title" },
            prepare({ region, title }) {
              const labels: Record<string, string> = {
                nordic: "Nordic",
                uk: "United Kingdom",
                eu: "EU",
              };
              return {
                title: labels[region ?? ""] ?? region ?? "Unknown",
                subtitle: title || "No homepage selected",
              };
            },
          },
        },
      ],
      validation: (Rule) =>
        Rule.custom((items) => {
          if (!items || !Array.isArray(items)) return true;
          const regions = items.map((item) => {
            const obj = item as Record<string, unknown>;
            return obj.region as string | undefined;
          });
          const dupes = regions.filter(
            (r, i) => r && regions.indexOf(r) !== i,
          );
          return dupes.length > 0
            ? `Duplicate regions: ${[...new Set(dupes)].join(", ")}`
            : true;
        }),
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

