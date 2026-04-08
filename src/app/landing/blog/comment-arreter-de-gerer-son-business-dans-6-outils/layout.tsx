import { buildBlogMetadata, BlogArticleJsonLd } from "@/lib/seo/blog-metadata";

const SLUG = "comment-arreter-de-gerer-son-business-dans-6-outils";
export const metadata = buildBlogMetadata(SLUG);

export default function ArticleLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <BlogArticleJsonLd slug={SLUG} />
      {children}
    </>
  );
}
