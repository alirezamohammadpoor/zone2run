import { Suspense } from "react";
import { notFound } from "next/navigation";
import {
  getProductsByGender,
  getProductsByPath,
  getProductsBySubcategoryIncludingSubSubcategories,
} from "@/sanity/lib/getData";
import { ProductListing } from "@/components/plp/ProductListing";
import { buildCategoryBreadcrumbs } from "@/lib/utils/breadcrumbs";
import { buildCategoryMetadata } from "@/lib/metadata";
import { localeToCountry } from "@/lib/locale/localeUtils";

type GenderUrl = "mens" | "womens";
type GenderApi = "men" | "women";

const apiGender = (g: GenderUrl): GenderApi =>
  g === "mens" ? "men" : "women";

// Category params are URL data and can't live in the shared App Shell — the
// *Route wrappers below keep the page component sync and await params inside
// a Suspense boundary so navigations stay instant.
type CategoryParams = Promise<{
  locale: string;
  mainCategory: string;
  subcategory: string;
  specificCategory: string;
}>;

export function MainCategoryRoute({
  gender,
  params,
}: {
  gender: GenderUrl;
  params: Promise<{ locale: string; mainCategory: string }>;
}) {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <MainCategoryResolver gender={gender} params={params} />
    </Suspense>
  );
}

async function MainCategoryResolver({
  gender,
  params,
}: {
  gender: GenderUrl;
  params: Promise<{ locale: string; mainCategory: string }>;
}) {
  const { locale, mainCategory } = await params;
  return (
    <MainCategoryPage
      gender={gender}
      mainCategory={mainCategory}
      country={localeToCountry(locale)}
    />
  );
}

export function SubcategoryRoute({
  gender,
  params,
}: {
  gender: GenderUrl;
  params: Promise<{ locale: string; mainCategory: string; subcategory: string }>;
}) {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <SubcategoryResolver gender={gender} params={params} />
    </Suspense>
  );
}

async function SubcategoryResolver({
  gender,
  params,
}: {
  gender: GenderUrl;
  params: Promise<{ locale: string; mainCategory: string; subcategory: string }>;
}) {
  const { locale, mainCategory, subcategory } = await params;
  return (
    <SubcategoryPage
      gender={gender}
      mainCategory={mainCategory}
      subcategory={subcategory}
      country={localeToCountry(locale)}
    />
  );
}

export function SpecificCategoryRoute({
  gender,
  params,
}: {
  gender: GenderUrl;
  params: CategoryParams;
}) {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <SpecificCategoryResolver gender={gender} params={params} />
    </Suspense>
  );
}

async function SpecificCategoryResolver({
  gender,
  params,
}: {
  gender: GenderUrl;
  params: CategoryParams;
}) {
  const { locale, mainCategory, subcategory, specificCategory } = await params;
  return (
    <SpecificCategoryPage
      gender={gender}
      mainCategory={mainCategory}
      subcategory={subcategory}
      specificCategory={specificCategory}
      country={localeToCountry(locale)}
    />
  );
}

// ─── Gender landing (/mens, /womens) ────────────────────────────────────────

export const genderMetadata = (locale: string, g: GenderUrl) =>
  buildCategoryMetadata(locale, g);

export async function GenderPage({ gender, country }: { gender: GenderUrl; country: string }) {
  const products = await getProductsByGender(apiGender(gender), undefined, country);
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
  const [mainProducts, subProducts] = await Promise.all([
    getProductsByPath(g, "main", mainCategory, undefined, country),
    getProductsByPath(g, "subcategory", mainCategory, undefined, country),
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
  const products = await getProductsBySubcategoryIncludingSubSubcategories(
    apiGender(gender),
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
  // Fetch parent subcategory so sibling categories appear in filter modal
  const products = await getProductsBySubcategoryIncludingSubSubcategories(
    apiGender(gender),
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
      />
    </div>
  );
}
