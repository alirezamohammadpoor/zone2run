import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";

export default defineConfig({
  name: "default",
  title: "Shopify Store",
  projectId: "0d62jtoi",
  dataset: "production",

  plugins: [structureTool()],

  schema: {
    types: [], // Empty schema to test
  },
});
