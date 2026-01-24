import { type EditorialModule } from "../../../sanity.types";
import { getBlogPosts } from "@/sanity/lib/getBlog";
import EditorialModuleComponent from "./EditorialModule";

async function EditorialModuleServer({
  editorialModule,
}: {
  editorialModule: EditorialModule;
}) {
  const posts = await getBlogPosts(10);

  return (
    <EditorialModuleComponent editorialModule={editorialModule} posts={posts} />
  );
}

export default EditorialModuleServer;
