import Link from "next/link";

interface TemplateCard {
  title: string;
  description: string;
  tag: string;
  icon: string;
  status: "available" | "soon";
}

const TEMPLATES: TemplateCard[] = [
  {
    title: "Modèle de devis freelance",
    description:
      "Devis prêt à envoyer avec mentions légales, conditions de paiement et CTA d'acceptation en ligne.",
    tag: "Facturation",
    icon: "📄",
    status: "soon",
  },
  {
    title: "Modèle de facture freelance",
    description:
      "Facture conforme avec numérotation automatique, TVA, échéance et lien de paiement Stripe intégré.",
    tag: "Facturation",
    icon: "🧾",
    status: "soon",
  },
  {
    title: "Brief client structuré",
    description:
      "Questionnaire de brief pré-rempli pour cadrer un projet créatif en 10 minutes au lieu de 2 jours.",
    tag: "Briefs",
    icon: "📝",
    status: "soon",
  },
  {
    title: "Proposition commerciale premium",
    description:
      "Présentation de service en ligne avec tarifs, livrables et bouton d'acceptation pour signer en un clic.",
    tag: "Ventes",
    icon: "🚀",
    status: "soon",
  },
  {
    title: "Page de prise de commande",
    description:
      "Formulaire de commande prêt à publier avec choix d'offre, brief intégré et paiement immédiat.",
    tag: "Site",
    icon: "🛒",
    status: "soon",
  },
  {
    title: "Suivi de projet client",
    description:
      "Tableau de bord partagé pour montrer l'avancement à votre client sans email de relance.",
    tag: "Projets",
    icon: "📊",
    status: "soon",
  },
];

export default function TemplatesPage() {
  return (
    <main id="main" className="min-h-screen bg-white text-[#191919]">
      <section className="max-w-5xl mx-auto px-6 py-20">
        <div className="text-center mb-14">
          <span className="inline-block text-[11px] font-semibold tracking-wider uppercase text-[#7C3AED] bg-[#F3EEFF] border border-[#E5D9FF] rounded-full px-3 py-1 mb-4">
            Templates
          </span>
          <h1 className="text-[40px] sm:text-[52px] font-extrabold tracking-[-0.03em] leading-[1.05] mb-5">
            Templates prêts à l&apos;emploi pour freelances créatifs.
          </h1>
          <p className="text-[17px] text-[#5A5A58] max-w-2xl mx-auto leading-relaxed">
            Devis, factures, briefs, propositions, pages de commande : toute une bibliothèque
            de modèles pensés pour vous faire gagner des heures chaque semaine. Disponibles
            directement dans votre cockpit Jestly.
          </p>
          <div className="mt-8 flex items-center justify-center gap-3">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center h-[48px] px-6 rounded-xl text-[14px] font-semibold text-white"
              style={{
                background: "linear-gradient(135deg, #7C3AED, #A78BFA)",
                boxShadow: "0 6px 24px rgba(124,58,237,0.25)",
              }}
            >
              Créer mon compte gratuit
            </Link>
            <Link
              href="/centre-aide"
              className="inline-flex items-center justify-center h-[48px] px-6 rounded-xl text-[14px] font-semibold text-[#5A5A58] border border-[#E6E6E4] hover:bg-[#FAFAF9]"
            >
              Voir le centre d&apos;aide
            </Link>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {TEMPLATES.map((t) => (
            <article
              key={t.title}
              className="rounded-2xl border border-[#E6E6E4] bg-white p-6 hover:border-[#7C3AED]/40 hover:shadow-sm transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="text-[28px]" aria-hidden>
                  {t.icon}
                </div>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[#7C3AED] bg-[#F3EEFF] border border-[#E5D9FF] rounded-full px-2 py-0.5">
                  {t.tag}
                </span>
              </div>
              <h2 className="text-[16px] font-bold text-[#191919] mb-2 leading-snug">
                {t.title}
              </h2>
              <p className="text-[13px] text-[#5A5A58] leading-relaxed mb-4">
                {t.description}
              </p>
              <div className="text-[11px] font-semibold text-[#8A8A88] uppercase tracking-wider">
                {t.status === "available" ? "Disponible" : "Bientôt disponible"}
              </div>
            </article>
          ))}
        </div>

        <div className="mt-16 rounded-2xl border border-[#E6E6E4] bg-[#FAFAF9] p-8 text-center">
          <h2 className="text-[22px] font-extrabold tracking-[-0.02em] mb-2">
            Vous attendez un template précis ?
          </h2>
          <p className="text-[14px] text-[#5A5A58] max-w-xl mx-auto mb-5">
            La bibliothèque s&apos;enrichit chaque semaine avec les retours des freelances de
            la bêta. Dites-nous ce qui vous manque, on l&apos;ajoute en priorité.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center justify-center h-[44px] px-5 rounded-xl text-[13px] font-semibold text-white"
            style={{
              background: "linear-gradient(135deg, #7C3AED, #A78BFA)",
            }}
          >
            Demander un template
          </Link>
        </div>
      </section>
    </main>
  );
}
