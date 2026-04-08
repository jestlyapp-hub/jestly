import { buildBlogMetadata, BlogArticleJsonLd } from "@/lib/seo/blog-metadata";

const SLUG = "le-guide-complet-du-brief-client-reussi";
export const metadata = buildBlogMetadata(SLUG);

export default function ArticleLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <BlogArticleJsonLd slug={SLUG} />
      {children}
    </>
  );
}
