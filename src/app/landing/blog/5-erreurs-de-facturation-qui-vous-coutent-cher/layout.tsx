import { buildBlogMetadata, BlogArticleJsonLd } from "@/lib/seo/blog-metadata";

const SLUG = "5-erreurs-de-facturation-qui-vous-coutent-cher";
export const metadata = buildBlogMetadata(SLUG);

export default function ArticleLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <BlogArticleJsonLd slug={SLUG} />
      {children}
    </>
  );
}
