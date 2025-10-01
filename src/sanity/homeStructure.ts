import { ListItemBuilder } from "sanity/structure";
import defineStructure from "./defineStructure";

export default defineStructure<ListItemBuilder>((S) =>
  S.listItem()
    .title("Home")
    .schemaType("home")
    .child(S.editor().title("Home").schemaType("home").documentId("home"))
);
