"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export type UrlFilters = {
  category: string[];
  brand: string[];
  gender: string[];
  size: string[];
};

export function useUrlFilters() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // ✅ keep local state in sync with URL
  const [filters, setFilters] = useState<UrlFilters>({
    category: searchParams.getAll("category"),
    brand: searchParams.getAll("brand"),
    gender: searchParams.getAll("gender"),
    size: searchParams.getAll("size"),
  });

  // When URL changes (e.g. back/forward nav), sync again
  useEffect(() => {
    setFilters({
      category: searchParams.getAll("category"),
      brand: searchParams.getAll("brand"),
      gender: searchParams.getAll("gender"),
      size: searchParams.getAll("size"),
    });
  }, [searchParams]);

  const updateFilters = (newFilters: Partial<UrlFilters>) => {
    const newSearchParams = new URLSearchParams(searchParams.toString());

    Object.entries(newFilters).forEach(([key, value]) => {
      if (!value || value.length === 0) {
        newSearchParams.delete(key);
      } else {
        if (Array.isArray(value)) {
          newSearchParams.delete(key);
          value.forEach((v) => newSearchParams.append(key, v));
        } else {
          newSearchParams.set(key, value);
        }
      }
    });

    // ✅ update URL
    router.push(`${pathname}?${newSearchParams.toString()}`, { scroll: false });

    // ✅ update UI immediately (fixes 1-step lag)
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
    }));
  };

  return { filters, updateFilters };
}
