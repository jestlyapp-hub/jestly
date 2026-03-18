export default function Footer() {
  return (
    <footer className="bg-[#F7F7F5] border-t border-[#E6E6E4] py-16 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-14">
          {/* Brand */}
          <div>
            <span className="text-xl font-bold tracking-tight block mb-2 text-[#191919]">
              Jestly
            </span>
            <p className="text-sm text-[#8A8A88]">
              Le cockpit du freelance moderne.
            </p>
          </div>

          {/* Produit */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#8A8A88] mb-4">
              Produit
            </h4>
            <ul className="flex flex-col gap-2.5">
              <li>
                <a
                  href="#features"
                  className="text-sm text-[#5A5A58] hover:text-[#191919] transition-colors"
                >
                  Fonctionnalités
                </a>
              </li>
              <li>
                <a
                  href="#pricing"
                  className="text-sm text-[#5A5A58] hover:text-[#191919] transition-colors"
                >
                  Tarifs
                </a>
              </li>
              <li>
                <a
                  href="#faq"
                  className="text-sm text-[#5A5A58] hover:text-[#191919] transition-colors"
                >
                  FAQ
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#8A8A88] mb-4">
              Légal
            </h4>
            <ul className="flex flex-col gap-2.5">
              <li>
                <a
                  href="#"
                  className="text-sm text-[#5A5A58] hover:text-[#191919] transition-colors"
                >
                  CGU
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm text-[#5A5A58] hover:text-[#191919] transition-colors"
                >
                  Confidentialité
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#8A8A88] mb-4">
              Contact
            </h4>
            <a
              href="mailto:contact@jestly.fr"
              className="text-sm text-[#5A5A58] hover:text-[#191919] transition-colors"
            >
              contact@jestly.fr
            </a>
          </div>
        </div>

        <div className="border-t border-[#E6E6E4] pt-8">
          <p className="text-xs text-[#8A8A88] text-center">
            &copy; 2025 Jestly. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  );
}
