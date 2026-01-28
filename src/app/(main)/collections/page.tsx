import { notFound } from "next/navigation";
import { collectionsMetadata } from "@/lib/metadata";

export const metadata = collectionsMetadata;

export default async function CollectionsPage() {
  notFound();
}
