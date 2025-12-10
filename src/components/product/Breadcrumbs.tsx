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
    <div className="py-2">
      <span className="text-xs text-gray-500">
        {breadcrumbs.map((crumb, index) => (
          <span key={index}>
            {index > 0 && " > "}
            <Link
              href={crumb.href}
              className="hover:text-gray-700 hover:underline cursor-pointer"
            >
              {crumb.label}
            </Link>
          </span>
        ))}
      </span>
    </div>
  );
}
