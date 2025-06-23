import { type SchemaTypeDefinition } from "sanity";
import siteSettings from "./siteSettings";
import product from "./product";
import category from "./category";
import brand from "./brand";

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [siteSettings, product, category, brand],
};
