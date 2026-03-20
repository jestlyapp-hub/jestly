"use client";

import { memo } from "react";
import type { TeamMiniGridBlockContent } from "@/types";

function TeamMiniGridBlockPreviewInner({ content }: { content: TeamMiniGridBlockContent }) {
  return (
    <section className="py-16 px-6">
      <div className="max-w-6xl mx-auto">
        <h2
          className="text-2xl font-bold text-center mb-2"
          style={{ color: "var(--site-text, #191919)", fontFamily: "var(--site-heading-font, inherit)" }}
        >
          {content.title}
        </h2>
        {content.subtitle && (
          <p className="text-sm text-center mb-10" style={{ color: "var(--site-muted, #666)" }}>
            {content.subtitle}
          </p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {content.members.map((m, i) => (
            <div
              key={i}
              className="rounded-xl p-6 text-center"
              style={{
                backgroundColor: "var(--site-surface, #F7F7F5)",
                border: "1px solid var(--site-border, #E6E6E4)",
              }}
            >
              {/* Avatar */}
              {m.imageUrl ? (
                <img
                  src={m.imageUrl}
                  alt={m.name}
                  className="w-16 h-16 rounded-full object-cover mx-auto mb-4"
                  style={{ border: "2px solid var(--site-border, #E6E6E4)" }}
                />
              ) : (
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-lg font-bold"
                  style={{
                    backgroundColor: "var(--site-primary-light, #EEF2FF)",
                    color: "var(--site-primary, #4F46E5)",
                    border: "2px solid var(--site-border, #E6E6E4)",
                  }}
                >
                  {m.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()}
                </div>
              )}

              <h3 className="text-sm font-semibold mb-0.5" style={{ color: "var(--site-text, #191919)" }}>
                {m.name}
              </h3>
              <div className="text-xs font-medium mb-2" style={{ color: "var(--site-primary, #4F46E5)" }}>
                {m.role}
              </div>
              <p className="text-xs leading-relaxed" style={{ color: "var(--site-muted, #666)" }}>
                {m.bio}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default memo(TeamMiniGridBlockPreviewInner);
