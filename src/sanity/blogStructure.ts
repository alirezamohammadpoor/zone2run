import { StructureBuilder } from "sanity/structure";
import { DocumentIcon, TagIcon } from "@sanity/icons";

export const blogStructure = (S: StructureBuilder) =>
  S.listItem()
    .title("Blog")
    .icon(DocumentIcon)
    .child(
      S.list()
        .title("Blog Content")
        .items([
          S.listItem()
            .title("Blog Posts")
            .icon(DocumentIcon)
            .child(
              S.documentTypeList("blogPost")
                .title("Blog Posts")
                .filter('_type == "blogPost"')
                .defaultOrdering([{ field: "publishedAt", direction: "desc" }])
            ),
          S.listItem()
            .title("Blog Categories")
            .icon(TagIcon)
            .child(
              S.documentTypeList("blogCategory")
                .title("Blog Categories")
                .filter('_type == "blogCategory"')
            ),
        ])
    );
