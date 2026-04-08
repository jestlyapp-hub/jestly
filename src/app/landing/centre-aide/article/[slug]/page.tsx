import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { HelpBreadcrumbs } from "@/components/help-center/HelpBreadcrumbs";
import {
  getAllArticles,
  getArticleBySlug,
  getCategoryBySlug,
  getRelatedArticles,
  getRelatedGuidesForArticle,
} from "@/lib/help-center/queries";

export async function generateStaticParams() {
  return getAllArticles().map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) return { title: "Article | Centre d'aide Jestly" };
  return {
    title: `${article.title} | Centre d'aide Jestly`,
    description: article.excerpt,
  };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) notFound();

  const category = getCategoryBySlug(article.categorySlug);
  const related = getRelatedArticles(article);
  const relatedGuides = getRelatedGuidesForArticle(article);

  return (
    <main className="max-w-3xl mx-auto px-4 pt-32 pb-24">
      <HelpBreadcrumbs
        items={[
          { label: "Centre d'aide", href: "/centre-aide" },
          category
            ? {
                label: category.title,
                href: `/centre-aide/categorie/${category.slug}`,
              }
            : { label: "Article" },
          { label: article.title },
        ]}
      />

      <header className="mb-10">
        <div className="flex flex-wrap items-center gap-2 mb-4 text-xs">
          {category && (
            <Link
              href={`/centre-aide/categorie/${category.slug}`}
              className="px-2.5 py-1 rounded-full bg-[#F2EEFF] text-[#7C5CFF] font-semibold hover:bg-[#E7DFFF]"
            >
              {category.title}
            </Link>
          )}
          {article.readingTime && (
            <span className="px-2.5 py-1 rounded-full bg-[#F4F3FA] text-[#6B6F80] font-medium">
              ⏱ {article.readingTime}
            </span>
          )}
          {article.difficulty && (
            <span className="px-2.5 py-1 rounded-full bg-[#F4F3FA] text-[#6B6F80] font-medium">
              {article.difficulty}
            </span>
          )}
        </div>
        <h1 className="text-4xl font-bold text-[#111118] mb-4 leading-tight">
          {article.title}
        </h1>
        <p className="text-[#6B6F80] text-lg">{article.excerpt}</p>
        {article.updatedAt && (
          <p className="text-xs text-[#8A8A94] mt-3">
            Mis à jour le{" "}
            {new Date(article.updatedAt).toLocaleDateString("fr-FR", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        )}
      </header>

      <article className="space-y-10">
        {article.sections.map((section, i) => (
          <section key={i}>
            <h2 className="text-xl font-bold text-[#111118] mb-3">
              {section.heading}
            </h2>
            {section.body.map((p, j) => (
              <p
                key={j}
                className="text-[#3F4052] leading-relaxed mb-3 text-[15px]"
              >
                {p}
              </p>
            ))}
            {section.bullets && (
              <ul className="list-disc pl-5 space-y-1.5 text-[#3F4052] text-[15px]">
                {section.bullets.map((b, k) => (
                  <li key={k}>{b}</li>
                ))}
              </ul>
            )}
          </section>
        ))}

        {article.commonMistakes && article.commonMistakes.length > 0 && (
          <section className="rounded-2xl border border-[#FFE4CC] bg-[#FFF7EE] p-6">
            <h2 className="text-base font-bold text-[#111118] mb-2 flex items-center gap-2">
              ⚠️ Erreurs fréquentes
            </h2>
            <ul className="list-disc pl-5 space-y-1.5 text-[#5A4A2E] text-[14px]">
              {article.commonMistakes.map((m, i) => (
                <li key={i}>{m}</li>
              ))}
            </ul>
          </section>
        )}

        {article.faq && article.faq.length > 0 && (
          <section>
            <h2 className="text-xl font-bold text-[#111118] mb-3">
              Questions fréquentes
            </h2>
            <div className="space-y-3">
              {article.faq.map((f, i) => (
                <details
                  key={i}
                  className="rounded-xl border border-[#EEEDF2] bg-white p-4"
                >
                  <summary className="font-semibold text-[#111118] cursor-pointer">
                    {f.question}
                  </summary>
                  <p className="mt-2 text-[#6B6F80] text-[14px]">{f.answer}</p>
                </details>
              ))}
            </div>
          </section>
        )}
      </article>

      {relatedGuides.length > 0 && (
        <section className="mt-14">
          <h2 className="text-lg font-semibold text-[#111118] mb-4">
            Guide complémentaire
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {relatedGuides.map((g) => (
              <Link
                key={g.slug}
                href={`/centre-aide/guide/${g.slug}`}
                className="block rounded-2xl border border-[#EEEDF2] bg-white p-5 hover:border-[#7C5CFF]/30 hover:shadow-sm transition"
              >
                <div className="text-xs font-semibold text-[#7C5CFF] uppercase tracking-wide mb-2">
                  Guide · {g.duration}
                </div>
                <div className="font-semibold text-[#111118] mb-1">
                  {g.title}
                </div>
                <div className="text-sm text-[#6B6F80]">{g.excerpt}</div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {related.length > 0 && (
        <section className="mt-14">
          <h2 className="text-lg font-semibold text-[#111118] mb-4">
            Articles liés
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {related.map((r) => (
              <Link
                key={r.slug}
                href={`/centre-aide/article/${r.slug}`}
                className="block rounded-2xl border border-[#EEEDF2] bg-white p-5 hover:border-[#7C5CFF]/30 hover:shadow-sm transition"
              >
                <div className="font-semibold text-[#111118] mb-1">
                  {r.title}
                </div>
                <div className="text-sm text-[#6B6F80]">{r.excerpt}</div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="mt-16 rounded-2xl border border-[#EEEDF2] bg-white p-6 flex flex-wrap items-center justify-between gap-4">
        {category && (
          <Link
            href={`/centre-aide/categorie/${category.slug}`}
            className="text-[#7C5CFF] font-semibold"
          >
            ← Retour à {category.title}
          </Link>
        )}
        <Link
          href="/contact"
          className="px-4 py-2 rounded-lg bg-[#7C5CFF] text-white font-medium hover:bg-[#6B4FE8]"
        >
          Contacter le support
        </Link>
      </section>
    </main>
  );
}
