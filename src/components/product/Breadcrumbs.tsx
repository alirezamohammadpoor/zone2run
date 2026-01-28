import Link from "next/link";
import type { SanityProduct } from "@/types/sanityProduct";

interface BreadcrumbItem {
  label: string;
  href: string;
}

interface BreadcrumbsProps {
  product: SanityProduct;
}

export function getBreadcrumbsFromProduct(
  product: SanityProduct
): BreadcrumbItem[] {
  const breadcrumbs: BreadcrumbItem[] = [];

  // Add gender
  if (product.gender === "mens" || product.gender === "womens") {
    const formattedGender = product.gender === "womens" ? "Women's" : "Men's";
    breadcrumbs.push({
      label: formattedGender,
      href: `/${product.gender}`,
    });
  }

  // Add category hierarchy - handle 3-level structure (main/sub/specific)
  if (
    product.category?.categoryType === "specific" &&
    product.category.parentCategory?.parentCategory?.title
  ) {
    // 3-level: main > sub > specific
    breadcrumbs.push({
      label: product.category.parentCategory.parentCategory.title,
      href: `/${product.gender}/${product.category.parentCategory.parentCategory.slug}`,
    });
    breadcrumbs.push({
      label: product.category.parentCategory.title,
      href: `/${product.gender}/${product.category.parentCategory.parentCategory.slug}/${product.category.parentCategory.slug}`,
    });
    breadcrumbs.push({
      label: product.category.title,
      href: `/${product.gender}/${product.category.parentCategory.parentCategory.slug}/${product.category.parentCategory.slug}/${product.category.slug}`,
    });
  } else if (
    product.category?.categoryType === "subcategory" &&
    product.category.parentCategory?.title
  ) {
    // 2-level: main > sub
    breadcrumbs.push({
      label: product.category.parentCategory.title,
      href: `/${product.gender}/${product.category.parentCategory.slug}`,
    });
    breadcrumbs.push({
      label: product.category.title,
      href: `/${product.gender}/${product.category.parentCategory.slug}/${product.category.slug}`,
    });
  } else if (
    product.category?.categoryType === "main" &&
    product.category.title
  ) {
    // 1-level: main only
    breadcrumbs.push({
      label: product.category.title,
      href: `/${product.gender}/${product.category.slug}`,
    });
  } else if (product.category?.title) {
    // Fallback for any other category type
    breadcrumbs.push({
      label: product.category.title,
      href: `/${product.gender}/${product.category.slug}`,
    });
  }

  // Add current product
  breadcrumbs.push({
    label: product.title,
    href: `/products/${product.handle}`,
  });

  return breadcrumbs;
}

export default function Breadcrumbs({ product }: BreadcrumbsProps) {
  const breadcrumbs = getBreadcrumbsFromProduct(product);

  if (breadcrumbs.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className="py-2">
      <ol className="text-xs text-gray-500 flex flex-nowrap">
        {breadcrumbs.map((crumb, index) => {
          const isLast = index === breadcrumbs.length - 1;
          return (
            <li key={crumb.href} className={`flex items-center ${isLast ? "min-w-0" : "flex-shrink-0"}`}>
              {index > 0 && <span aria-hidden="true" className="mx-1">&gt;</span>}
              {isLast ? (
                <span className="py-3 md:py-1 truncate" aria-current="page">
                  {crumb.label}
                </span>
              ) : (
                <Link
                  href={crumb.href}
                  className="hover:text-gray-700 hover:underline py-3 md:py-1"
                >
                  {crumb.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/**
 * PLP Breadcrumbs - renders breadcrumb segments with h1 styling for category pages.
 * Uses same layout as brand page headers (text-sm).
 */
interface PLPBreadcrumbsProps {
  segments: BreadcrumbItem[];
}

export function PLPBreadcrumbs({ segments }: PLPBreadcrumbsProps) {
  if (segments.length === 0) return null;

  return (
    <div className="px-2 mt-8 md:mt-12 xl:mt-16 mb-8 md:mb-12 xl:mb-16">
      <h1 className="text-sm">
        {segments.map((segment, index) => (
          <span key={segment.href}>
            {index > 0 && " / "}
            {index === segments.length - 1 ? (
              segment.label
            ) : (
              <Link href={segment.href} className="hover:underline">
                {segment.label}
              </Link>
            )}
          </span>
        ))}
      </h1>
    </div>
  );
}
