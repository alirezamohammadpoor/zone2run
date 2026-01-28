import { notFound } from "next/navigation";
import { buildCategoryMetadata } from "@/lib/metadata";

export const metadata = buildCategoryMetadata("unisex");

export default function UnisexPage() {
  notFound();
}
