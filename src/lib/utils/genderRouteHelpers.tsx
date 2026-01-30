import { notFound } from "next/navigation";
import {
  getProductsByGender,
  getProductsByPath,
  getProductsBySubcategoryIncludingSubSubcategories,
} from "@/sanity/lib/getData";
import { ProductListing } from "@/components/plp/ProductListing";
import { buildCategoryBreadcrumbs } from "@/lib/utils/breadcrumbs";
import { buildCategoryMetadata } from "@/lib/metadata";

type GenderUrl = "mens" | "womens";
type GenderApi = "men" | "women";

const apiGender = (g: GenderUrl): GenderApi =>
  g === "mens" ? "men" : "women";

// ─── Gender landing (/mens, /womens) ────────────────────────────────────────

export const genderMetadata = (g: GenderUrl) => buildCategoryMetadata(g);

export async function GenderPage({ gender }: { gender: GenderUrl }) {
  const products = await getProductsByGender(apiGender(gender));
  if (!products?.length) notFound();

  return (
    <div>
      <ProductListing
        products={products}
        breadcrumbs={buildCategoryBreadcrumbs(gender)}
      />
    </div>
  );
}

// ─── Main category (/mens/clothing, /womens/footwear) ───────────────────────

export const mainCategoryMetadata = (g: GenderUrl, main: string) =>
  buildCategoryMetadata(g, main);

export async function MainCategoryPage({
  gender,
  mainCategory,
}: {
  gender: GenderUrl;
  mainCategory: string;
}) {
  const g = apiGender(gender);

  // Fetch both in parallel — main category first, fallback to subcategory
  const [mainProducts, subProducts] = await Promise.all([
    getProductsByPath(g, "main", mainCategory),
    getProductsByPath(g, "subcategory", mainCategory),
  ]);
  const products = mainProducts?.length ? mainProducts : subProducts;
  if (!products?.length) notFound();

  return (
    <div>
      <ProductListing
        products={products}
        breadcrumbs={buildCategoryBreadcrumbs(gender, [mainCategory])}
      />
    </div>
  );
}

// ─── Subcategory (/mens/clothing/tops) ──────────────────────────────────────

export const subcategoryMetadata = (
  g: GenderUrl,
  main: string,
  sub: string,
) => buildCategoryMetadata(g, main, sub);

export async function SubcategoryPage({
  gender,
  mainCategory,
  subcategory,
}: {
  gender: GenderUrl;
  mainCategory: string;
  subcategory: string;
}) {
  const products = await getProductsBySubcategoryIncludingSubSubcategories(
    apiGender(gender),
    mainCategory,
    subcategory,
  );
  if (!products?.length) notFound();

  return (
    <div>
      <ProductListing
        products={products}
        breadcrumbs={buildCategoryBreadcrumbs(gender, [
          mainCategory,
          subcategory,
        ])}
      />
    </div>
  );
}

// ─── Specific category (/mens/clothing/tops/t-shirts) ───────────────────────

export const specificCategoryMetadata = (
  g: GenderUrl,
  main: string,
  sub: string,
  spec: string,
) => buildCategoryMetadata(g, main, sub, spec);

export async function SpecificCategoryPage({
  gender,
  mainCategory,
  subcategory,
  specificCategory,
}: {
  gender: GenderUrl;
  mainCategory: string;
  subcategory: string;
  specificCategory: string;
}) {
  // Fetch parent subcategory so sibling categories appear in filter modal
  const products = await getProductsBySubcategoryIncludingSubSubcategories(
    apiGender(gender),
    mainCategory,
    subcategory,
  );
  if (!products?.length) notFound();

  return (
    <div>
      <ProductListing
        products={products}
        breadcrumbs={buildCategoryBreadcrumbs(gender, [
          mainCategory,
          subcategory,
          specificCategory,
        ])}
        initialFilters={{ category: [specificCategory] }}
      />
    </div>
  );
}
