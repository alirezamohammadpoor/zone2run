import { notFound } from "next/navigation";
import {
  getProductsByGenderPaginated,
  getProductsByPathPaginated,
  getProductsBySubcategoryPaginated,
} from "@/sanity/lib/getData";
import { ProductListing } from "@/components/plp/ProductListing";
import { buildCategoryBreadcrumbs } from "@/lib/utils/breadcrumbs";
import { buildCategoryMetadata } from "@/lib/metadata";

type GenderUrl = "mens" | "womens";
type GenderApi = "men" | "women";

const apiGender = (g: GenderUrl): GenderApi =>
  g === "mens" ? "men" : "women";

// ─── Gender landing (/mens, /womens) ────────────────────────────────────────

export const genderMetadata = (locale: string, g: GenderUrl) =>
  buildCategoryMetadata(locale, g);

export async function GenderPage({ gender, country }: { gender: GenderUrl; country: string }) {
  const g = apiGender(gender);
  const { products, totalCount } = await getProductsByGenderPaginated(g, undefined, country);
  if (!products?.length) notFound();

  return (
    <div>
      <ProductListing
        products={products}
        breadcrumbs={buildCategoryBreadcrumbs(gender)}
        totalCount={totalCount}
        queryType={{ type: "gender", gender: g }}
        country={country}
      />
    </div>
  );
}

// ─── Main category (/mens/clothing, /womens/footwear) ───────────────────────

export const mainCategoryMetadata = (locale: string, g: GenderUrl, main: string) =>
  buildCategoryMetadata(locale, g, main);

export async function MainCategoryPage({
  gender,
  mainCategory,
  country,
}: {
  gender: GenderUrl;
  mainCategory: string;
  country: string;
}) {
  const g = apiGender(gender);

  // Fetch both in parallel — main category first, fallback to subcategory
  const [mainResult, subResult] = await Promise.all([
    getProductsByPathPaginated(g, "main", mainCategory, undefined, country),
    getProductsByPathPaginated(g, "subcategory", mainCategory, undefined, country),
  ]);

  const result = mainResult.products.length ? mainResult : subResult;
  const categoryType = mainResult.products.length ? "main" : "subcategory";
  if (!result.products.length) notFound();

  return (
    <div>
      <ProductListing
        products={result.products}
        breadcrumbs={buildCategoryBreadcrumbs(gender, [mainCategory])}
        totalCount={result.totalCount}
        queryType={{ type: "category", gender: g, categoryType, categorySlug: mainCategory }}
        country={country}
      />
    </div>
  );
}

// ─── Subcategory (/mens/clothing/tops) ──────────────────────────────────────

export const subcategoryMetadata = (
  locale: string,
  g: GenderUrl,
  main: string,
  sub: string,
) => buildCategoryMetadata(locale, g, main, sub);

export async function SubcategoryPage({
  gender,
  mainCategory,
  subcategory,
  country,
}: {
  gender: GenderUrl;
  mainCategory: string;
  subcategory: string;
  country: string;
}) {
  const g = apiGender(gender);
  const { products, totalCount } = await getProductsBySubcategoryPaginated(
    g,
    mainCategory,
    subcategory,
    undefined,
    country,
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
        totalCount={totalCount}
        queryType={{ type: "subcategory", gender: g, mainCategorySlug: mainCategory, subcategorySlug: subcategory }}
        country={country}
      />
    </div>
  );
}

// ─── Specific category (/mens/clothing/tops/t-shirts) ───────────────────────

export const specificCategoryMetadata = (
  locale: string,
  g: GenderUrl,
  main: string,
  sub: string,
  spec: string,
) => buildCategoryMetadata(locale, g, main, sub, spec);

export async function SpecificCategoryPage({
  gender,
  mainCategory,
  subcategory,
  specificCategory,
  country,
}: {
  gender: GenderUrl;
  mainCategory: string;
  subcategory: string;
  specificCategory: string;
  country: string;
}) {
  const g = apiGender(gender);
  // Fetch parent subcategory so sibling categories appear in filter modal
  const { products, totalCount } = await getProductsBySubcategoryPaginated(
    g,
    mainCategory,
    subcategory,
    undefined,
    country,
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
        totalCount={totalCount}
        queryType={{ type: "subcategory", gender: g, mainCategorySlug: mainCategory, subcategorySlug: subcategory }}
        country={country}
      />
    </div>
  );
}
