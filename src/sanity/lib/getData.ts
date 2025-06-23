import { client } from "./client";
import * as queries from "./queries";

export async function getAllProducts() {
  return await client.fetch(queries.getAllProducts);
}

export async function getFeaturedProducts() {
  return client.fetch(queries.getFeaturedProducts);
}

export async function getProductByHandle(handle: string) {
  return await client.fetch(queries.getProductByHandle, { handle });
}

export async function getProductsByBrand(brandId: string) {
  return await client.fetch(queries.getProductsByBrand, { brandId });
}

export async function searchProducts(searchTerm: string) {
  return await client.fetch(queries.searchProducts, { searchTerm });
}

export async function getAllCategories() {
  return await client.fetch(queries.getAllCategories);
}

export async function getSiteSettings() {
  return await client.fetch(queries.getSiteSettings);
}

export async function getAllBrands() {
  return await client.fetch(queries.getAllBrands);
}

export async function getBrandBySlug(slug: string) {
  return await client.fetch(queries.getBrandBySlug, { slug });
}

export async function getCategoryBySlug(slug: string) {
  return await client.fetch(queries.getCategoryBySlug, { slug });
}
