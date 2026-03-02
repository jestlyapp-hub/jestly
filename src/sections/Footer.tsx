export default function Footer() {
  return (
    <footer className="bg-[#050412] border-t border-white/[0.04] py-16 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-14">
          {/* Brand */}
          <div>
            <span className="text-xl font-extrabold tracking-tight block mb-2">
              Jestly
            </span>
            <p className="text-sm text-white/30">
              Le cockpit du freelance moderne.
            </p>
          </div>

          {/* Produit */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white/20 mb-4">
              Produit
            </h4>
            <ul className="flex flex-col gap-2.5">
              <li>
                <a
                  href="#features"
                  className="text-sm text-white/40 hover:text-white transition-colors"
                >
                  Fonctionnalites
                </a>
              </li>
              <li>
                <a
                  href="#pricing"
                  className="text-sm text-white/40 hover:text-white transition-colors"
                >
                  Tarifs
                </a>
              </li>
              <li>
                <a
                  href="#faq"
                  className="text-sm text-white/40 hover:text-white transition-colors"
                >
                  FAQ
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white/20 mb-4">
              Legal
            </h4>
            <ul className="flex flex-col gap-2.5">
              <li>
                <a
                  href="#"
                  className="text-sm text-white/40 hover:text-white transition-colors"
                >
                  CGU
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm text-white/40 hover:text-white transition-colors"
                >
                  Confidentialite
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white/20 mb-4">
              Contact
            </h4>
            <a
              href="mailto:contact@jestly.fr"
              className="text-sm text-white/40 hover:text-white transition-colors"
            >
              contact@jestly.fr
            </a>
          </div>
        </div>

        <div className="border-t border-white/[0.04] pt-8">
          <p className="text-xs text-white/20 text-center">
            &copy; 2025 Jestly. Tous droits reserves.
          </p>
        </div>
      </div>
    </footer>
  );
}
