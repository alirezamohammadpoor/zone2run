"use client";

import Link from "next/link";
import { useLocale } from "@/lib/locale/LocaleContext";

/**
 * Drop-in replacement for next/link that auto-prefixes the locale segment.
 *
 * <LocaleLink href="/products/foo"> → /en-se/products/foo
 *
 * External URLs, hash links, and non-string hrefs pass through unchanged.
 */
export default function LocaleLink({
  href,
  ...props
}: React.ComponentProps<typeof Link>) {
  const { locale } = useLocale();

  const prefixedHref =
    typeof href === "string" && href.startsWith("/")
      ? `/${locale}${href}`
      : href;

  return <Link href={prefixedHref} {...props} />;
}
