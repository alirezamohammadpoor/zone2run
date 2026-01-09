import { Suspense } from "react";
import {
  type Home,
  type PortableTextModule,
  type HeroModule as HeroModuleType,
  type EditorialModule as EditorialModuleType,
  type ImageModule as ImageModuleType,
} from "../../../sanity.types";
import HeroModule from "./heroModule";
import EditorialModuleServer from "./EditorialModuleServer";
import ImageModuleComponent from "./imageModule";
import ContentModuleComponent from "./contentModule";
import {
  getProductsByIds,
  getProductsByCollectionId,
} from "@/sanity/lib/getData";
import type { SanityProduct } from "@/types/sanityProduct";
import BlogPostCardSkeleton from "@/components/skeletons/BlogPostCardSkeleton";

// Union type for all homepage modules
type HomepageModule =
  | ({ _key: string } & HeroModuleType)
  | ({ _key: string } & EditorialModuleType)
  | ({ _key: string } & ImageModuleType)
  | ({ _key: string } & PortableTextModule);

async function HomePageSanity({ homepage }: { homepage: Home }) {
  if (!homepage) {
    return <div>No homepage data available</div>;
  }

  if (!homepage.modules || homepage.modules.length === 0) {
    return <div>No homepage modules configured</div>;
  }

  // Fetch products for portable text modules that include products
  const portableTextModulesWithProducts = homepage.modules?.filter(
    (module): module is { _key: string } & PortableTextModule =>
      module._type === "portableTextModule" &&
      (module.contentType === "text-with-products" ||
        module.contentType === "media-with-products" ||
        module.contentType === "products-only")
  ) || [];

  const portableTextModulesWithProductsData = await Promise.all(
    portableTextModulesWithProducts.map(async (module) => {
      const productSource = module.productSource || "manual";

      // If using collection source, fetch products from the collection
      if (productSource === "collection" && module.collection?._ref) {
        const products = await getProductsByCollectionId(
          module.collection._ref
        );
        return {
          module,
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
        module,
        products: orderedProducts,
      };
    })
  );

  // Create map for quick lookup
  const portableTextProductsMap = new Map(
    portableTextModulesWithProductsData.map((item) => [
      item.module._key,
      item,
    ])
  );

  return (
    <div className="w-full">
      {homepage.modules?.map((module) => {
        if (module._type === "heroModule") {
          return <HeroModule key={module._key} heroModule={module} />;
        }

        if (module._type === "editorialModule") {
          return (
            <Suspense
              key={module._key}
              fallback={
                <div className="px-2 my-8 md:my-12 xl:my-16">
                  <div className="flex gap-2 overflow-hidden">
                    {[...Array(4)].map((_, i) => (
                      <BlogPostCardSkeleton key={i} />
                    ))}
                  </div>
                </div>
              }
            >
              <EditorialModuleServer editorialModule={module} />
            </Suspense>
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
