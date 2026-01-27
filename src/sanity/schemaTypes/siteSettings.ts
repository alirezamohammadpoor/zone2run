import { defineField, defineType, defineArrayMember } from "sanity";

export default defineType({
  name: "siteSettings",
  title: "Site Settings",
  type: "document",
  preview: {
    select: {
      title: "title",
    },
    prepare({ title }) {
      return {
        title,
        subtitle: "Site Settings",
      };
    },
  },
  fields: [
    defineField({
      name: "title",
      title: "Site Title",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "description",
      title: "Site Description",
      type: "text",
      rows: 3,
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "headerLogo",
      title: "Header Logo",
      type: "image",
      options: {
        hotspot: true,
      },
      fields: [
        {
          name: "alt",
          type: "string",
          title: "Alternative Text",
          description: "Important for SEO and accessibility",
        },
      ],
    }),
    defineField({
      name: "mainHeroImage",
      title: "Main Hero Image",
      type: "image",
      options: {
        hotspot: true,
      },
      fields: [
        {
          name: "alt",
          type: "string",
          title: "Alternative Text",
          description: "Important for SEO and accessibility",
        },
      ],
    }),
    defineField({
      name: "logo",
      title: "Main Logo",
      type: "image",
      options: {
        hotspot: true,
      },
      fields: [
        {
          name: "alt",
          type: "string",
          title: "Alternative Text",
          description: "Important for SEO and accessibility",
        },
      ],
    }),
    defineField({
      name: "socialMediaLinks",
      title: "Social Media Links",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          name: "socialLink",
          fields: [
            {
              name: "platform",
              title: "Platform",
              type: "string",
              options: {
                list: [
                  { title: "Facebook", value: "facebook" },
                  { title: "Twitter", value: "twitter" },
                  { title: "Instagram", value: "instagram" },
                  { title: "LinkedIn", value: "linkedin" },
                  { title: "YouTube", value: "youtube" },
                ],
              },
            },
            {
              name: "url",
              title: "URL",
              type: "url",
            },
          ],
        }),
      ],
    }),
    defineField({
      name: "callToActionText",
      title: "Call to Action Text",
      type: "object",
      fields: [
        {
          name: "heading",
          title: "Heading",
          type: "string",
        },
        {
          name: "subheading",
          title: "Subheading",
          type: "text",
          rows: 2,
        },
        {
          name: "buttonText",
          title: "Button Text",
          type: "string",
        },
      ],
    }),
    defineField({
      name: "pricingDetails",
      title: "Pricing Details",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          name: "pricingPlan",
          fields: [
            {
              name: "planName",
              title: "Plan Name",
              type: "string",
            },
            {
              name: "price",
              title: "Price",
              type: "number",
            },
            {
              name: "currency",
              title: "Currency",
              type: "string",
              initialValue: "USD",
            },
            {
              name: "billingPeriod",
              title: "Billing Period",
              type: "string",
              options: {
                list: [
                  { title: "Monthly", value: "monthly" },
                  { title: "Yearly", value: "yearly" },
                  { title: "One-time", value: "one-time" },
                ],
              },
            },
            {
              name: "features",
              title: "Features",
              type: "array",
              of: [{ type: "string" }],
            },
            {
              name: "isPopular",
              title: "Popular Plan",
              type: "boolean",
              initialValue: false,
            },
          ],
        }),
      ],
    }),
  ],
});
