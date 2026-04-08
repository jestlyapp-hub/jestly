import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { HelpBreadcrumbs } from "@/components/help-center/HelpBreadcrumbs";
import {
  getArticlesByCategory,
  getCategoryBySlug,
  getGuidesByCategory,
  getAllCategories,
} from "@/lib/help-center/queries";

export async function generateStaticParams() {
  return getAllCategories().map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const cat = getCategoryBySlug(slug);
  if (!cat) return { title: "Catégorie | Centre d'aide Jestly" };
  return {
    title: `${cat.title} | Centre d'aide Jestly`,
    description: cat.description,
  };
}

export default async function CategoriePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const cat = getCategoryBySlug(slug);
  if (!cat) notFound();

  const articles = getArticlesByCategory(slug);
  const guides = getGuidesByCategory(slug);
  const popular = articles.filter((a) => a.popular);

  return (
    <main className="max-w-4xl mx-auto px-4 pt-32 pb-24">
      <HelpBreadcrumbs
        items={[
          { label: "Centre d'aide", href: "/centre-aide" },
          { label: cat.title },
        ]}
      />

      <header className="mb-12">
        <div className="text-4xl mb-3">{cat.icon}</div>
        <h1 className="text-4xl font-bold text-[#111118] mb-3">{cat.title}</h1>
        <p className="text-[#6B6F80] text-lg max-w-2xl">{cat.description}</p>
        <p className="text-sm text-[#8A8A94] mt-3">
          {articles.length} article{articles.length > 1 ? "s" : ""}
          {guides.length > 0 &&
            ` · ${guides.length} guide${guides.length > 1 ? "s" : ""} associé${guides.length > 1 ? "s" : ""}`}
        </p>
      </header>

      {guides.length > 0 && (
        <section className="mb-12">
          <h2 className="text-lg font-semibold text-[#111118] mb-4">
            Guides associés
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {guides.map((g) => (
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

      {popular.length > 0 && (
        <section className="mb-12">
          <h2 className="text-lg font-semibold text-[#111118] mb-4">
            Articles populaires
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {popular.map((a) => (
              <Link
                key={a.slug}
                href={`/centre-aide/article/${a.slug}`}
                className="block rounded-2xl border border-[#EEEDF2] bg-white p-5 hover:border-[#7C5CFF]/30 hover:shadow-sm transition"
              >
                <div className="font-semibold text-[#111118] mb-1">
                  {a.title}
                </div>
                <div className="text-sm text-[#6B6F80]">{a.excerpt}</div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="mb-16">
        <h2 className="text-lg font-semibold text-[#111118] mb-4">
          Tous les articles
        </h2>
        {articles.length === 0 ? (
          <div className="rounded-2xl border border-[#EEEDF2] bg-white p-8 text-center text-[#6B6F80]">
            Aucun article publié pour l&apos;instant dans cette catégorie.
          </div>
        ) : (
          <ul className="divide-y divide-[#EEEDF2] rounded-2xl border border-[#EEEDF2] bg-white overflow-hidden">
            {articles.map((a) => (
              <li key={a.slug}>
                <Link
                  href={`/centre-aide/article/${a.slug}`}
                  className="flex items-start justify-between gap-4 px-6 py-4 hover:bg-[#F8F8FC] transition"
                >
                  <div>
                    <div className="font-semibold text-[#111118]">
                      {a.title}
                    </div>
                    <div className="text-sm text-[#6B6F80] mt-1">
                      {a.excerpt}
                    </div>
                  </div>
                  <span className="text-[#7C5CFF] text-xl leading-none">›</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-2xl border border-[#EEEDF2] bg-white p-8 text-center">
        <h2 className="text-lg font-semibold text-[#111118] mb-2">
          Vous ne trouvez pas votre réponse ?
        </h2>
        <p className="text-[#6B6F80] mb-4">
          Parcourez une autre catégorie ou contactez directement notre support.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link
            href="/centre-aide"
            className="px-4 py-2 rounded-lg border border-[#EEEDF2] text-[#111118] font-medium hover:border-[#7C5CFF]/40"
          >
            ← Retour au centre d&apos;aide
          </Link>
          <Link
            href="/contact"
            className="px-4 py-2 rounded-lg bg-[#7C5CFF] text-white font-medium hover:bg-[#6B4FE8]"
          >
            Contacter le support
          </Link>
        </div>
      </section>
    </main>
  );
}
