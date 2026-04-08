import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { HelpBreadcrumbs } from "@/components/help-center/HelpBreadcrumbs";
import {
  getAllGuides,
  getArticleBySlug,
  getGuideBySlug,
} from "@/lib/help-center/queries";

export async function generateStaticParams() {
  return getAllGuides().map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const guide = getGuideBySlug(slug);
  if (!guide) return { title: "Guide | Centre d'aide Jestly" };
  return {
    title: `${guide.title} | Centre d'aide Jestly`,
    description: guide.excerpt,
  };
}

export default async function GuidePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const guide = getGuideBySlug(slug);
  if (!guide) notFound();

  const relatedArticles = (guide.relatedArticleSlugs ?? [])
    .map((s) => getArticleBySlug(s))
    .filter((a): a is NonNullable<typeof a> => Boolean(a));

  return (
    <main className="max-w-3xl mx-auto px-4 pt-32 pb-24">
      <HelpBreadcrumbs
        items={[
          { label: "Centre d'aide", href: "/centre-aide" },
          { label: "Guides de démarrage" },
          { label: guide.title },
        ]}
      />

      <header className="mb-10">
        <div className="flex flex-wrap items-center gap-2 mb-4 text-xs">
          <span className="px-2.5 py-1 rounded-full bg-[#F2EEFF] text-[#7C5CFF] font-semibold uppercase tracking-wide">
            Guide de démarrage
          </span>
          <span className="px-2.5 py-1 rounded-full bg-[#F4F3FA] text-[#6B6F80] font-medium">
            ⏱ {guide.duration}
          </span>
          <span className="px-2.5 py-1 rounded-full bg-[#F4F3FA] text-[#6B6F80] font-medium">
            👤 {guide.audience}
          </span>
        </div>
        <h1 className="text-4xl font-bold text-[#111118] mb-4 leading-tight">
          {guide.title}
        </h1>
        <p className="text-[#6B6F80] text-lg">{guide.excerpt}</p>
        {guide.intro && (
          <p className="mt-4 text-[#3F4052] text-[15px] leading-relaxed">
            {guide.intro}
          </p>
        )}
      </header>

      <section className="rounded-2xl border border-[#EEEDF2] bg-white p-6 mb-10">
        <h2 className="text-sm font-bold text-[#111118] mb-2">
          🎯 Objectif de ce guide
        </h2>
        <p className="text-[#3F4052] text-[15px] leading-relaxed">
          {guide.objective}
        </p>
        {guide.prerequisites && guide.prerequisites.length > 0 && (
          <div className="mt-4 pt-4 border-t border-[#EEEDF2]">
            <h3 className="text-sm font-bold text-[#111118] mb-2">
              Prérequis
            </h3>
            <ul className="list-disc pl-5 space-y-1 text-[#3F4052] text-[14px]">
              {guide.prerequisites.map((p, i) => (
                <li key={i}>{p}</li>
              ))}
            </ul>
          </div>
        )}
      </section>

      <ol className="space-y-8 mb-14">
        {guide.steps.map((step, i) => (
          <li
            key={i}
            className="rounded-2xl border border-[#EEEDF2] bg-white p-6"
          >
            <div className="flex items-start gap-4">
              <div className="shrink-0 w-9 h-9 rounded-full bg-[#7C5CFF] text-white font-bold flex items-center justify-center">
                {i + 1}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-[#111118] mb-2">
                  {step.title}
                </h3>
                {step.description.map((p, j) => (
                  <p
                    key={j}
                    className="text-[#3F4052] leading-relaxed mb-2 text-[15px]"
                  >
                    {p}
                  </p>
                ))}

                {step.screenshot && (
                  <div className="mt-3 rounded-xl border border-dashed border-[#D4D4DD] bg-[#F8F8FC] p-6 text-center text-[13px] text-[#8A8A94]">
                    🖼 {step.screenshot}
                  </div>
                )}

                {step.commonMistakes && step.commonMistakes.length > 0 && (
                  <div className="mt-3 rounded-xl bg-[#FFF7EE] border border-[#FFE4CC] p-4">
                    <div className="text-xs font-bold text-[#B8761E] uppercase tracking-wide mb-1">
                      ⚠️ À éviter
                    </div>
                    <ul className="list-disc pl-5 space-y-1 text-[#5A4A2E] text-[14px]">
                      {step.commonMistakes.map((m, k) => (
                        <li key={k}>{m}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {step.tips && step.tips.length > 0 && (
                  <div className="mt-3 rounded-xl bg-[#F2EEFF] border border-[#E2D8FF] p-4">
                    <div className="text-xs font-bold text-[#7C5CFF] uppercase tracking-wide mb-1">
                      💡 Conseils
                    </div>
                    <ul className="list-disc pl-5 space-y-1 text-[#3F2E75] text-[14px]">
                      {step.tips.map((t, k) => (
                        <li key={k}>{t}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {step.links && step.links.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {step.links.map((l, k) => (
                      <Link
                        key={k}
                        href={l.href}
                        className="text-sm font-semibold text-[#7C5CFF] hover:underline"
                      >
                        {l.label} →
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </li>
        ))}
      </ol>

      {guide.checklist && guide.checklist.length > 0 && (
        <section className="rounded-2xl border border-[#D8F0E0] bg-[#F1FBF4] p-6 mb-10">
          <h2 className="text-base font-bold text-[#111118] mb-3">
            ✅ Checklist finale
          </h2>
          <ul className="space-y-2 text-[#2F5B3F] text-[14px]">
            {guide.checklist.map((c, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-[#3F9F5A] font-bold">✓</span>
                <span>{c}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {guide.commonMistakes && guide.commonMistakes.length > 0 && (
        <section className="rounded-2xl border border-[#FFE4CC] bg-[#FFF7EE] p-6 mb-14">
          <h2 className="text-base font-bold text-[#111118] mb-2">
            ⚠️ Erreurs fréquentes à éviter
          </h2>
          <ul className="list-disc pl-5 space-y-1.5 text-[#5A4A2E] text-[14px]">
            {guide.commonMistakes.map((m, i) => (
              <li key={i}>{m}</li>
            ))}
          </ul>
        </section>
      )}

      {guide.nextSteps && guide.nextSteps.length > 0 && (
        <section className="mb-14">
          <h2 className="text-lg font-semibold text-[#111118] mb-4">
            Prochaines étapes recommandées
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {guide.nextSteps.map((n, i) => (
              <Link
                key={i}
                href={n.href}
                className="block rounded-2xl border border-[#EEEDF2] bg-white p-5 hover:border-[#7C5CFF]/30 hover:shadow-sm transition"
              >
                <div className="font-semibold text-[#111118] mb-1">
                  {n.label} →
                </div>
                {n.description && (
                  <div className="text-sm text-[#6B6F80]">{n.description}</div>
                )}
              </Link>
            ))}
          </div>
        </section>
      )}

      {relatedArticles.length > 0 && (
        <section className="mb-14">
          <h2 className="text-lg font-semibold text-[#111118] mb-4">
            Articles complémentaires
          </h2>
          <ul className="divide-y divide-[#EEEDF2] rounded-2xl border border-[#EEEDF2] bg-white overflow-hidden">
            {relatedArticles.map((a) => (
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
        </section>
      )}

      <section className="rounded-2xl border border-[#EEEDF2] bg-white p-6 flex flex-wrap items-center justify-between gap-4">
        <Link
          href="/centre-aide"
          className="text-[#7C5CFF] font-semibold"
        >
          ← Retour au centre d&apos;aide
        </Link>
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
