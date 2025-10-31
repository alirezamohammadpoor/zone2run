import { defineType, defineField } from "sanity";

export const blogProductsModule = defineType({
  name: "blogProductsModule",
  title: "Products Module",
  type: "object",
  fields: [
    defineField({
      name: "featuredHeading",
      title: "Heading",
      type: "string",
    }),
    defineField({
      name: "featuredSubheading",
      title: "Subheading",
      type: "string",
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
    }),
    defineField({
      name: "productCount",
      title: "Number of Products (Grid)",
      type: "number",
      description: "Only applies to grid layout",
      initialValue: 4,
      validation: (Rule) => Rule.min(1).max(20),
    }),
    defineField({
      name: "featuredProducts",
      title: "Products",
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
              description: "Choose which image to display",
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
      validation: (Rule) => Rule.max(10),
    }),
    defineField({
      name: "featuredButtonLink",
      title: "Button Link",
      type: "string",
    }),
    defineField({
      name: "featuredButtonText",
      title: "Button Text",
      type: "string",
    }),
  ],
});

export default blogProductsModule;
