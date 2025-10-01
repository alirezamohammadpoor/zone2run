import type { StructureBuilder } from "sanity/structure";

const brandStructure = (S: StructureBuilder) =>
  S.listItem()
    .title("Brands")
    .child(
      S.documentTypeList("brand")
        .title("Brands")
        .filter('_type == "brand"')
        .defaultOrdering([{ field: "name", direction: "asc" }])
    );

export { brandStructure };
