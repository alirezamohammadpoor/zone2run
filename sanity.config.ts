import { defineConfig, isDev } from "sanity";
import { visionTool } from "@sanity/vision";
import { structureTool } from "sanity/structure";
import { colorInput } from "@sanity/color-input";
import { imageHotspotArrayPlugin } from "sanity-plugin-hotspot-array";
import { media, mediaAssetSource } from "sanity-plugin-media";
import { schemaTypes } from "./src/sanity/schemaTypes";
import { structure } from "./src/sanity/structure";
// import { customDocumentActions } from "./src/sanity/customDocumentActions";
import Navbar from "./src/sanity/studio/Navbar";
import Footer from "./src/sanity/studio/Footer";

const devOnlyPlugins = [visionTool()];

export default defineConfig({
  name: "default",
  title: "Shopify Store",
  basePath: "/studio",
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,

  plugins: [
    structureTool({ structure }),
    colorInput(),
    imageHotspotArrayPlugin(),
    // customDocumentActions(),
    media(),
    ...(isDev ? devOnlyPlugins : []),
  ],

  schema: {
    types: schemaTypes,
  },

  form: {
    file: {
      assetSources: (previousAssetSources) => {
        return previousAssetSources.filter(
          (assetSource) => assetSource !== mediaAssetSource
        );
      },
    },
    image: {
      assetSources: (previousAssetSources) => {
        return previousAssetSources.filter(
          (assetSource) => assetSource === mediaAssetSource
        );
      },
    },
  },

  studio: {
    components: {
      navbar: Navbar,
      footer: Footer,
    },
  },
});
