interface NotFoundPageProps {
  type?: "site" | "page";
}

export default function NotFoundPage({ type = "site" }: NotFoundPageProps) {
  const isSite = type === "site";

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center max-w-sm px-6">
        {/* Icon */}
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-[#F7F7F5] flex items-center justify-center">
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#8A8A88"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {isSite ? (
              <>
                <circle cx="12" cy="12" r="10" />
                <path d="M8 15s1.5-2 4-2 4 2 4 2" />
                <line x1="9" y1="9" x2="9.01" y2="9" />
                <line x1="15" y1="9" x2="15.01" y2="9" />
              </>
            ) : (
              <>
                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="9" y1="15" x2="15" y2="15" />
              </>
            )}
          </svg>
        </div>

        {/* Title */}
        <h1 className="text-xl font-semibold text-[#191919] mb-2">
          {isSite ? "Site introuvable" : "Page introuvable"}
        </h1>

        {/* Description */}
        <p className="text-sm text-[#8A8A88] leading-relaxed mb-8">
          {isSite
            ? "Ce site n'existe pas ou n'est pas encore publié."
            : "Cette page n'existe pas ou n'est pas encore publiée."}
        </p>

        {/* Back link */}
        <a
          href="https://jestly.site"
          className="inline-flex items-center gap-2 text-sm font-medium text-[#5A5A58] hover:text-[#191919] transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          Retour à Jestly
        </a>
      </div>
    </div>
  );
}
