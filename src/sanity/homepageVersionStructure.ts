import type { StructureBuilder } from "sanity/structure";

const homepageVersionStructure = (S: StructureBuilder) =>
  S.listItem()
    .title("Homepage Versions")
    .child(
      S.documentTypeList("homepageVersion")
        .title("Homepage Versions")
        .filter('_type == "homepageVersion"')
        .defaultOrdering([{ field: "title", direction: "asc" }])
    );

export { homepageVersionStructure };

