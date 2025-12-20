import {
  type Home,
  type EditorialModule,
  type SpotifyPlaylistsModule,
  type ImageModule,
  type PortableTextModule,
} from "../../../sanity.types";
import HeroModule from "./heroModule";
import EditorialModuleComponent from "./editorialModule";
import SpotifyPlaylistsModuleComponent from "./spotifyPlaylistsModule";
import ImageModuleComponent from "./imageModule";
import ContentModuleComponent from "./contentModule";
import {
  getProductsByIds,
  getProductsByCollectionId,
} from "@/sanity/lib/getData";
import { getBlogPosts } from "@/sanity/lib/getBlog";
import type { SanityProduct } from "@/types/sanityProduct";

async function HomePageSanity({ homepage }: { homepage: Home }) {
  if (!homepage) {
    return <div>No homepage data available</div>;
  }

  if (!homepage.modules || homepage.modules.length === 0) {
    return <div>No homepage modules configured</div>;
  }

  // Fetch products for portable text modules that include products
  const portableTextModulesWithProducts = homepage.modules?.filter(
    (module: any) =>
      module._type === "portableTextModule" &&
      (module.contentType === "text-with-products" ||
        module.contentType === "media-with-products" ||
        module.contentType === "products-only")
  ) as PortableTextModule[];

  const portableTextModulesWithProductsData = await Promise.all(
    portableTextModulesWithProducts.map(async (module) => {
      const moduleAny = module as any;
      const productSource = moduleAny.productSource || "manual";

      // If using collection source, fetch products from the collection
      if (productSource === "collection" && moduleAny.collection?._ref) {
        const products = await getProductsByCollectionId(
          moduleAny.collection._ref
        );
        return {
          module: module as PortableTextModule,
          products: products,
        };
      }

      // Otherwise, use manual product selection
      const productRefs =
        (module.featuredProducts
          ?.map((item) => item.product?._ref)
          .filter(Boolean) as string[]) || [];

      // Fetch specific products by their IDs
      const products = await getProductsByIds(productRefs);

      const orderedProducts =
        module.featuredProducts
          ?.map((item) => {
            if (!item.product?._ref) return null;
            const product = products.find(
              (p: SanityProduct) => p?._id === item.product?._ref
            );
            return product;
          })
          .filter((product) => product !== null && product !== undefined) || [];

      return {
        module: module as PortableTextModule,
        products: orderedProducts,
      };
    })
  );

  // Fetch blog posts for editorial modules - always use latest posts
  const editorialModules = homepage.modules?.filter(
    (module: any) => module._type === "editorialModule"
  ) as EditorialModule[];

  // Fetch latest blog posts once for all editorial modules
  const latestBlogPosts = await getBlogPosts(10);

  const modulesWithPosts = await Promise.all(
    editorialModules.map(async (module) => {
      // Use the latest blog posts instead of curated list
      return {
        module: module as EditorialModule,
        posts: latestBlogPosts || [],
      };
    })
  );

  // Create maps for quick lookup
  const portableTextProductsMap = new Map(
    portableTextModulesWithProductsData.map((item) => [
      (item.module as any)._key,
      item,
    ])
  );
  const editorialModulesMap = new Map(
    modulesWithPosts.map((item) => [(item.module as any)._key, item])
  );

  return (
    <div className="w-full">
      {homepage.modules?.map((module: any) => {
        if (module._type === "heroModule") {
          return <HeroModule key={module._key} heroModule={module} />;
        }

        if (module._type === "editorialModule") {
          const moduleWithPosts = editorialModulesMap.get(module._key);
          if (!moduleWithPosts) return null;
          return (
            <div key={module._key}>
              <EditorialModuleComponent
                editorialModule={moduleWithPosts.module}
                posts={moduleWithPosts.posts}
              />
            </div>
          );
        }

        // if (module._type === "spotifyPlaylistsModule") {
        //   return (
        //     <div key={module._key}>
        //       <SpotifyPlaylistsModuleComponent
        //         spotifyPlaylistsModule={module}
        //       />
        //     </div>
        //   );
        // }

        if (module._type === "imageModule") {
          return (
            <ImageModuleComponent key={module._key} imageModule={module} />
          );
        }

        if (module._type === "portableTextModule") {
          const moduleWithProducts = portableTextProductsMap.get(module._key);
          return (
            <ContentModuleComponent
              key={module._key}
              contentModule={module}
              products={moduleWithProducts?.products}
            />
          );
        }

        return null;
      })}
    </div>
  );
}
export default HomePageSanity;
