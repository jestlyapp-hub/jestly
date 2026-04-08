import { buildBlogMetadata, BlogArticleJsonLd } from "@/lib/seo/blog-metadata";

const SLUG = "gagner-3-heures-par-semaine-en-automatisant-sa-gestion";
export const metadata = buildBlogMetadata(SLUG);

export default function ArticleLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <BlogArticleJsonLd slug={SLUG} />
      {children}
    </>
  );
}
