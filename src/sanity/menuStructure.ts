import { ListItemBuilder } from "sanity/structure";
import defineStructure from "./defineStructure";

export default defineStructure<ListItemBuilder>((S) =>
  S.listItem()
    .title("Navigation Menu")
    .schemaType("navigationMenu")
    .child(
      S.editor()
        .title("Navigation Menu")
        .schemaType("navigationMenu")
        .documentId("navigationMenu")
    )
);
