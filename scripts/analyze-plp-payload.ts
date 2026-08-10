// One-off: measure PLP GROQ payload composition (bun run scripts/analyze-plp-payload.ts)
import { createClient } from "@sanity/client";
import { PLP_PRODUCT_PROJECTION } from "../src/sanity/lib/groqUtils";

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2025-06-12",
  useCdn: true,
});

const query = `*[_type == "product" && (gender == $gender || gender == "unisex")] {
  ${PLP_PRODUCT_PROJECTION}
} | order(_createdAt desc)`;

const data = await client.fetch(query, { gender: "mens" });
const bytes = (v: unknown) => Buffer.byteLength(JSON.stringify(v ?? null));

const total = bytes(data);
let lqipBytes = 0, imgCount = 0, imgBytes = 0, urlBytes = 0;
let perProductImgs: number[] = [];
for (const p of data) {
  const imgs = p.images || [];
  perProductImgs.push(imgs.length);
  imgBytes += bytes(imgs);
  for (const img of imgs) {
    imgCount++;
    if (img?.lqip) lqipBytes += Buffer.byteLength(String(img.lqip));
    if (img?.url) urlBytes += Buffer.byteLength(String(img.url));
  }
}
perProductImgs.sort((a, b) => a - b);
const mid = perProductImgs[Math.floor(perProductImgs.length / 2)];
console.log({
  products: data.length,
  totalMB: (total / 1048576).toFixed(2),
  imagesMB: (imgBytes / 1048576).toFixed(2),
  lqipMB: (lqipBytes / 1048576).toFixed(2),
  urlMB: (urlBytes / 1048576).toFixed(2),
  images: imgCount,
  imgsPerProduct: { median: mid, max: perProductImgs.at(-1) },
  nonImageMB: ((total - imgBytes) / 1048576).toFixed(2),
});
