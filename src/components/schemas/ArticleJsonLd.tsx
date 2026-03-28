import type { BlogPostingSchema } from "./types";

interface ArticleJsonLdProps {
  title: string;
  excerpt?: string;
  publishedAt?: string;
  author?: string;
  image?: string;
  readingTime?: number;
  locale: string;
  categorySlug: string;
  postSlug: string;
}

/**
 * Generates JSON-LD structured data for blog posts (BlogPosting schema).
 * Helps Google display rich snippets and AI answer engines cite content.
 */
export default function ArticleJsonLd({
  title,
  excerpt,
  publishedAt,
  author,
  image,
  readingTime,
  locale,
  categorySlug,
  postSlug,
}: ArticleJsonLdProps) {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://zone2run-build.vercel.app";
  const url = `${baseUrl}/${locale}/blog/${categorySlug}/${postSlug}`;

  const schema: BlogPostingSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: title,
    description: excerpt,
    image,
    datePublished: publishedAt,
    author: author
      ? { "@type": "Person", name: author }
      : undefined,
    publisher: {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "Zone2Run",
      url: baseUrl,
      logo: `${baseUrl}/logo.png`,
    },
    mainEntityOfPage: url,
    wordCount: readingTime ? readingTime * 200 : undefined,
  };

  return (
    <script
      id="article-jsonld"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
