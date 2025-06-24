import { defineField, defineType } from "sanity";

export default defineType({
  name: "product",
  title: "Product",
  type: "document",
  preview: {
    select: {
      title: "title",
      media: "mainImage",
      shopifyId: "shopifyId",
    },
    prepare({ title, media, shopifyId }) {
      return {
        title: title || "Untitled Product",
        subtitle: shopifyId ? `Shopify ID: ${shopifyId}` : "No Shopify ID",
        media,
      };
    },
  },
  fields: [
    defineField({
      name: "title",
      title: "Product Title",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "shopifyId",
      title: "Shopify Product ID",
      type: "string",
      description: "The Shopify product ID (gid://shopify/Product/...)",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "shopifyHandle",
      title: "Shopify Handle",
      type: "string",
      description: "The URL handle from Shopify (e.g., 'running-shirt')",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "mainImage",
      title: "Main Product Image",
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
      name: "gallery",
      title: "Product Gallery",
      type: "array",
      of: [
        {
          type: "image",
          options: {
            hotspot: true,
          },
          fields: [
            {
              name: "alt",
              type: "string",
              title: "Alternative Text",
            },
          ],
        },
      ],
    }),
    defineField({
      name: "description",
      title: "Product Description",
      type: "array",
      of: [
        {
          type: "block",
        },
        {
          type: "image",
          options: {
            hotspot: true,
          },
          fields: [
            {
              name: "alt",
              type: "string",
              title: "Alternative Text",
            },
          ],
        },
      ],
    }),
    defineField({
      name: "shortDescription",
      title: "Short Description",
      type: "text",
      rows: 3,
      description: "Brief product description for product cards",
    }),
    defineField({
      name: "category",
      title: "Category",
      type: "reference",
      to: [{ type: "category" }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "brand",
      title: "Brand",
      type: "reference",
      to: [{ type: "brand" }],
    }),
    defineField({
      name: "gender",
      title: "Gender",
      type: "string",
      options: {
        list: [
          { title: "Men", value: "men" },
          { title: "Women", value: "women" },
          { title: "Unisex", value: "unisex" },
          { title: "Kids", value: "kids" },
        ],
        layout: "radio",
      },
      validation: (Rule) => Rule.required(),
      description: "Target gender for this product",
    }),
    defineField({
      name: "tags",
      title: "Tags",
      type: "array",
      of: [{ type: "string" }],
      options: {
        layout: "tags",
      },
    }),
    defineField({
      name: "featured",
      title: "Featured Product",
      type: "boolean",
      initialValue: false,
      description: "Show this product in featured sections",
    }),
    defineField({
      name: "seo",
      title: "SEO",
      type: "object",
      fields: [
        {
          name: "title",
          type: "string",
          title: "SEO Title",
          description:
            "Title for search engines (leave empty to use product title)",
        },
        {
          name: "description",
          type: "text",
          title: "SEO Description",
          rows: 3,
          description: "Description for search engines",
        },
        {
          name: "keywords",
          type: "array",
          title: "SEO Keywords",
          of: [{ type: "string" }],
          options: {
            layout: "tags",
          },
        },
      ],
    }),
    defineField({
      name: "productDetails",
      title: "Product Details",
      type: "array",
      of: [
        {
          type: "object",
          name: "detail",
          fields: [
            {
              name: "title",
              type: "string",
              title: "Detail Title",
            },
            {
              name: "value",
              type: "text",
              title: "Detail Value",
            },
          ],
        },
      ],
    }),
    defineField({
      name: "careInstructions",
      title: "Care Instructions",
      type: "array",
      of: [{ type: "string" }],
      options: {
        layout: "list",
      },
    }),
  ],
});
