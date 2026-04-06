import Link from "next/link";

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Header minimal */}
      <header className="border-b border-[#E6E6E4] bg-white sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold tracking-tight text-[#191919] hover:opacity-80 transition-opacity">
            Jestly
          </Link>
          <Link
            href="/"
            className="text-sm text-[#5A5A58] hover:text-[#191919] transition-colors"
          >
            &larr; Retour à l&apos;accueil
          </Link>
        </div>
      </header>

      {/* Contenu */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer simple */}
      <footer className="border-t border-[#E6E6E4] bg-[#F7F7F5]">
        <div className="max-w-3xl mx-auto px-6 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-[#8A8A88]">
              &copy; 2026 Jestly. Tous droits réservés.
            </p>
            <div className="flex items-center gap-6">
              <Link href="/legal/cgu" className="text-xs text-[#8A8A88] hover:text-[#191919] transition-colors">
                CGU
              </Link>
              <Link href="/legal/confidentialite" className="text-xs text-[#8A8A88] hover:text-[#191919] transition-colors">
                Confidentialité
              </Link>
              <Link href="/legal/mentions-legales" className="text-xs text-[#8A8A88] hover:text-[#191919] transition-colors">
                Mentions légales
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
