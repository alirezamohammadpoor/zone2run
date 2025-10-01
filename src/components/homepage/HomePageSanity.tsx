import {
  type Home,
  type FeaturedProductsModule,
  type EditorialModule,
  type SpotifyPlaylistsModule,
  type ImageModule,
  type PortableTextModule,
} from "../../../sanity.types";
import HeroModule from "./heroModule";
import FeaturedProductsModuleComponent from "./featuredProductsModuleComponent";
import EditorialModuleComponent from "./editorialModule";
import SpotifyPlaylistsModuleComponent from "./spotifyPlaylistsModule";
import ImageModuleComponent from "./imageModule";
import PortableTextModuleComponent from "./portableTextModule";
import { getProductsByIds } from "@/sanity/lib/getData";
import type { SanityProduct } from "@/types/sanityProduct";

async function HomePageSanity({ homepage }: { homepage: Home }) {
  // Force update to ensure correct type import
  // Add error handling and debugging
  if (!homepage) {
    console.error("Homepage data is null or undefined");
    return <div>No homepage data available</div>;
  }

  if (!homepage.modules || homepage.modules.length === 0) {
    console.warn("No modules found in homepage data");
    return <div>No homepage modules configured</div>;
  }

  // Fetch products for featured products module
  const featuredProductsModules = homepage.modules?.filter(
    (module: any) => module._type === "featuredProductsModule"
  ) as FeaturedProductsModule[];

  const modulesWithProducts = await Promise.all(
    featuredProductsModules.map(async (module) => {
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
        module: module as FeaturedProductsModule,
        products: orderedProducts,
      };
    })
  );

  // Fetch blog posts for editorial modules
  const editorialModules = homepage.modules?.filter(
    (module: any) => module._type === "editorialModule"
  ) as EditorialModule[];

  const modulesWithPosts = await Promise.all(
    editorialModules.map(async (module) => {
      // The posts are already resolved in the editorialModule, so we can use them directly
      const orderedPosts =
        module.featuredPosts?.map((item) => item.post).filter(Boolean) || [];

      return {
        module: module as EditorialModule,
        posts: orderedPosts,
      };
    })
  );

  const getProductsForModule = (moduleKey: string) => {
    const moduleWithProducts = modulesWithProducts.find(
      (item) => (item.module as any)._key === moduleKey
    );
    return moduleWithProducts?.products || [];
  };

  const getPostsForModule = (moduleKey: string) => {
    const moduleWithPosts = modulesWithPosts.find(
      (item) => (item.module as any)._key === moduleKey
    );
    return moduleWithPosts?.posts || [];
  };

  return (
    <div className="w-full">
      {homepage.modules?.map((module: any) => {
        if (module._type === "heroModule") {
          return <HeroModule key={module._key} heroModule={module} />;
        }

        if (module._type === "featuredProductsModule") {
          return (
            <FeaturedProductsModuleComponent
              key={module._key}
              featuredProductsModule={module}
              products={getProductsForModule(module._key)}
            />
          );
        }

        if (module._type === "editorialModule") {
          return (
            <div key={module._key}>
              <EditorialModuleComponent
                editorialModule={module}
                posts={getPostsForModule(module._key)}
              />
            </div>
          );
        }

        if (module._type === "spotifyPlaylistsModule") {
          return (
            <div key={module._key}>
              <SpotifyPlaylistsModuleComponent
                spotifyPlaylistsModule={module}
              />
            </div>
          );
        }

        if (module._type === "imageModule") {
          return (
            <ImageModuleComponent key={module._key} imageModule={module} />
          );
        }

        if (module._type === "portableTextModule") {
          return (
            <PortableTextModuleComponent
              key={module._key}
              portableTextModule={module}
            />
          );
        }

        return null;
      })}
    </div>
  );
}
export default HomePageSanity;
