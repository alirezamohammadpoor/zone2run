import { type EditorialModule } from "../../../sanity.types";
import { getBlogPosts } from "@/sanity/lib/getBlog";
import EditorialModuleComponent from "./editorialModule";

/**
 * Render an editorial module populated with recent blog posts.
 *
 * @param editorialModule - Configuration and content for the editorial module to render
 * @returns A React element that renders the editorial module using the provided configuration and up to 10 most recent blog posts
 */
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