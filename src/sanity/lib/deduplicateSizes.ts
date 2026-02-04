import type { PLPProduct } from "@/types/plpProduct";

/** Raw shape before sizes deduplication (GROQ option1 values may have nulls/dupes) */
export interface RawProductWithSizes extends Omit<PLPProduct, "sizes"> {
  sizes?: (string | null)[];
}

/** Deduplicate sizes from raw GROQ option1 values */
export function deduplicateSizes<T extends RawProductWithSizes>(
  products: T[],
): (Omit<T, "sizes"> & { sizes: string[] })[] {
  return products.map((p) => ({
    ...p,
    sizes: [...new Set((p.sizes ?? []).filter(Boolean))] as string[],
  }));
}
