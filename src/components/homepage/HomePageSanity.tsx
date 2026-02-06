import { Suspense } from "react";
import {
  type Home,
  type PortableTextModule,
  type HeroModule as HeroModuleType,
  type EditorialModule as EditorialModuleType,
  type ImageModule as ImageModuleType,
} from "../../../sanity.types";
import HeroModule from "./HeroModule";
import EditorialModuleServer from "./EditorialModuleServer";
import ImageModuleComponent from "./ImageModule";
import ContentModuleComponent from "./ContentModule";
import {
  getProductsByIds,
  getProductsByCollectionId,
} from "@/sanity/lib/getData";
import type { CardProduct } from "@/types/cardProduct";
import { reorderProductImages } from "@/lib/utils/imageSelection";

// Union type for all homepage modules
type HomepageModule =
  | ({ _key: string } & HeroModuleType)
  | ({ _key: string } & EditorialModuleType)
  | ({ _key: string } & ImageModuleType)
  | ({ _key: string } & PortableTextModule);

async function HomePageSanity({ homepage, country }: { homepage: Home; country?: string }) {
  if (!homepage) {
    return <div>No homepage data available</div>;
  }

  if (!homepage.modules || homepage.modules.length === 0) {
    return <div>No homepage modules configured</div>;
  }

  // Fetch products for portable text modules that include products
  // Supports both new values (products-text, products-only) and legacy values in existing Sanity documents
  const hasProducts = (contentType: string | undefined) =>
    contentType === "products-text" ||
    contentType === "products-only" ||
    // Legacy support for existing Sanity documents
    contentType === "text-with-products" ||
    contentType === "media-with-products";

  const portableTextModulesWithProducts = homepage.modules?.filter(
    (module): module is { _key: string } & PortableTextModule =>
      module._type === "portableTextModule" && hasProducts(module.contentType)
  ) || [];

  const portableTextModulesWithProductsData = await Promise.all(
    portableTextModulesWithProducts.map(async (module) => {
      const productSource = module.productSource || "manual";

      // If using collection source, fetch products from the collection
      if (productSource === "collection" && module.collection?._ref) {
        const fullProducts = await getProductsByCollectionId(
          module.collection._ref,
          country,
        );
        // Extract minimal data on server - collection products use main image
        const products: CardProduct[] = fullProducts.map(
          (p) => reorderProductImages(p, "main")
        );
        return { module, products };
      }

      // Otherwise, use manual product selection
      const productRefs =
        (module.featuredProducts
          ?.map((item) => item.product?._ref)
          .filter(Boolean) as string[]) || [];

      // Fetch specific products by their IDs
      const fullProducts = await getProductsByIds(productRefs, country);

      // Extract minimal data on server with per-product imageSelection
      const products: CardProduct[] =
        module.featuredProducts
          ?.map((item) => {
            if (!item.product?._ref) return null;
            const product = fullProducts.find(
              (p) => p?._id === item.product?._ref
            );
            if (!product) return null;
            // Use imageSelection from the featured product config
            return reorderProductImages(
              product,
              item.imageSelection || "main"
            );
          })
          .filter((p): p is CardProduct => p !== null) || [];

      return { module, products };
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
            <Suspense key={module._key} fallback={null}>
              <EditorialModuleServer editorialModule={module} />
            </Suspense>
          );
        }

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
