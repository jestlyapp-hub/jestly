"use client";

import { memo } from "react";
import type { Block, BlockType } from "@/types";
import { defaultContent, useBuilder } from "@/lib/site-builder-context";
import { computeThemeVars, resolveTheme } from "@/lib/block-style-engine";
import BlockPreview from "@/components/site-web/blocks/BlockPreview";

function PreviewSandboxInner({ type }: { type: BlockType | null }) {
  const { state } = useBuilder();
  const resolved = resolveTheme(state.site.theme, state.site.design);
  const themeStyle = computeThemeVars(resolved) as React.CSSProperties;

  if (!type) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 rounded-xl bg-[#F7F7F5] flex items-center justify-center mx-auto mb-3">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#BBB" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </div>
          <p className="text-[12px] text-[#BBB]">Survolez un bloc pour voir l&apos;aperçu</p>
        </div>
      </div>
    );
  }

  const previewBlock: Block = {
    id: "preview",
    type,
    content: { ...defaultContent[type] },
    style: { paddingTop: 40, paddingBottom: 40 },
    settings: {},
    visible: true,
  } as Block;

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-4">
        <div className="rounded-xl border border-[#E6E6E4] overflow-hidden shadow-sm" style={{ ...themeStyle, backgroundColor: resolved.backgroundColor || "#ffffff" }}>
          <BlockPreview block={previewBlock} />
        </div>
      </div>
    </div>
  );
}

const PreviewSandbox = memo(PreviewSandboxInner);
export default PreviewSandbox;
