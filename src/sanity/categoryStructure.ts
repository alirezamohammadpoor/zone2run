import type { StructureBuilder } from "sanity/structure";

const categoryStructure = (S: StructureBuilder) =>
  S.listItem()
    .title("Categories")
    .child(
      S.documentTypeList("category")
        .title("Categories")
        .filter('_type == "category"')
        .defaultOrdering([{ field: "title", direction: "asc" }])
    );

export { categoryStructure };
