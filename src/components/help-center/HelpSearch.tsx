"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { searchHelp } from "@/lib/help-center/queries";

export function HelpSearch() {
  const [query, setQuery] = useState("");
  const results = useMemo(() => searchHelp(query), [query]);
  const showResults = query.trim().length >= 2;

  return (
    <div style={{ maxWidth: 560, margin: "0 auto", position: "relative" }}>
      <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#A8A8B0"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ position: "absolute", left: 16, pointerEvents: "none" }}
        >
          <circle cx="11" cy="11" r="8" />
          <path d="M21 21l-4.35-4.35" />
        </svg>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Rechercher un article, un guide…"
          aria-label="Rechercher dans le centre d'aide"
          style={{
            width: "100%",
            height: 54,
            paddingLeft: 48,
            paddingRight: 20,
            borderRadius: 16,
            border: "1px solid #EEEDF2",
            background: "#fff",
            fontSize: 15,
            color: "#111118",
            outline: "none",
          }}
        />
      </div>

      {showResults && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            left: 0,
            right: 0,
            background: "#fff",
            border: "1px solid #EEEDF2",
            borderRadius: 16,
            boxShadow: "0 20px 60px rgba(17, 17, 24, 0.08)",
            maxHeight: 420,
            overflowY: "auto",
            zIndex: 20,
            textAlign: "left",
          }}
        >
          {results.length === 0 ? (
            <div style={{ padding: 24, color: "#6B6F80", fontSize: 14 }}>
              Aucun résultat pour «&nbsp;<strong>{query}</strong>&nbsp;».
              <div style={{ marginTop: 8, fontSize: 13 }}>
                Essayez un autre mot-clé ou parcourez les catégories ci-dessous.
              </div>
            </div>
          ) : (
            <ul style={{ listStyle: "none", margin: 0, padding: 8 }}>
              {results.map((r) => (
                <li key={`${r.type}-${r.slug}`}>
                  <Link
                    href={r.href}
                    style={{
                      display: "block",
                      padding: "12px 14px",
                      borderRadius: 12,
                      textDecoration: "none",
                      color: "#111118",
                    }}
                    className="hover:bg-[#F8F8FC]"
                  >
                    <div
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        color: "#7C5CFF",
                        textTransform: "uppercase",
                        letterSpacing: 0.4,
                        marginBottom: 2,
                      }}
                    >
                      {r.type === "article"
                        ? r.categoryTitle ?? "Article"
                        : r.type === "guide"
                          ? "Guide"
                          : "Catégorie"}
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>
                      {r.title}
                    </div>
                    <div
                      style={{
                        fontSize: 13,
                        color: "#6B6F80",
                        marginTop: 2,
                        lineHeight: 1.5,
                      }}
                    >
                      {r.excerpt}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
