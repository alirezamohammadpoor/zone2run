import { ListItemBuilder } from "sanity/structure";
import defineStructure from "./defineStructure";

export default defineStructure<ListItemBuilder>((S) =>
  S.listItem()
    .title("Site Settings")
    .schemaType("siteSettings")
    .child(
      S.editor()
        .title("Site Settings")
        .schemaType("siteSettings")
        .documentId("siteSettings")
    )
);

