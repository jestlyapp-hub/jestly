import { buildBlogMetadata, BlogArticleJsonLd } from "@/lib/seo/blog-metadata";

const SLUG = "comment-creer-un-site-freelance-qui-convertit";
export const metadata = buildBlogMetadata(SLUG);

export default function ArticleLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <BlogArticleJsonLd slug={SLUG} />
      {children}
    </>
  );
}
