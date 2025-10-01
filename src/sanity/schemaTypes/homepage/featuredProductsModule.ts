import { defineType, defineField } from "sanity";

export const featuredProductsModule = defineType({
  name: "featuredProductsModule",
  title: "Featured Products Module",
  type: "object",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "displayType",
      title: "Display Type",
      type: "string",
      options: {
        list: [
          { title: "Horizontal Scroll", value: "horizontal" },
          { title: "Grid Layout", value: "grid" },
        ],
      },
      initialValue: "horizontal",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "productCount",
      title: "Number of Products to Show",
      type: "number",
      description: "How many products to display (only applies to grid layout)",
      initialValue: 4,
      validation: (Rule) => Rule.min(1).max(20),
    }),
    defineField({
      name: "featuredHeading",
      title: "Featured Products Heading",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "featuredSubheading",
      title: "Featured Products Subheading",
      type: "string",
    }),
    defineField({
      name: "featuredProducts",
      title: "Featured Products",
      type: "array",
      of: [
        {
          type: "object",
          name: "productWithImage",
          title: "Product with Image",
          fields: [
            {
              name: "product",
              title: "Product",
              type: "reference",
              to: [{ type: "product" }],
              validation: (Rule) => Rule.required(),
            },
            {
              name: "imageSelection",
              title: "Image Selection",
              type: "string",
              options: {
                list: [
                  { title: "Main Image", value: "main" },
                  { title: "Gallery Image 1", value: "gallery_0" },
                  { title: "Gallery Image 2", value: "gallery_1" },
                  { title: "Gallery Image 3", value: "gallery_2" },
                  { title: "Gallery Image 4", value: "gallery_3" },
                  { title: "Gallery Image 5", value: "gallery_4" },
                ],
              },
              initialValue: "main",
              description: "Choose which image from the product to display",
            },
          ],
          preview: {
            select: {
              title: "product.title",
              imageSelection: "imageSelection",
            },
            prepare(selection) {
              return {
                title: selection.title || "Product",
                subtitle:
                  selection.imageSelection === "main"
                    ? "Main Image"
                    : `Gallery Image ${
                        selection.imageSelection?.split("_")[1] || ""
                      }`,
              };
            },
          },
        },
      ],
      validation: (Rule) => Rule.max(5).required(),
    }),
    defineField({
      name: "featuredButtonLink",
      title: "Featured Products Button Link",
      type: "string",
    }),
    defineField({
      name: "featuredButtonText",
      title: "Featured Products Button Text",
      type: "string",
    }),
  ],
});
