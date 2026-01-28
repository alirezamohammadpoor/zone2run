import { notFound } from "next/navigation";
import { brandsMetadata } from "@/lib/metadata";

export const metadata = brandsMetadata;

export default async function BrandsPage() {
  notFound();
}
