"use client";

import { useBuilder } from "@/lib/site-builder-context";
import type { Block } from "@/types";

const inputClass =
  "w-full bg-[#F7F7F5] border border-[#E6E6E4] rounded-lg px-3 py-2 text-[13px] text-[#191919] focus:outline-none focus:border-[#4F46E5]/30 focus:ring-1 focus:ring-[#4F46E5]/20 transition-all";

type TechStackBlock = Extract<Block, { type: "tech-stack" }>;

interface TechStackItem {
  name: string;
  icon?: string;
  description?: string;
}

interface TechStackCategory {
  name: string;
  items: TechStackItem[];
}

export default function TechStackBlockEditor({ block }: { block: TechStackBlock }) {
  const { dispatch } = useBuilder();
  const update = (content: Record<string, unknown>) =>
    dispatch({ type: "UPDATE_BLOCK_CONTENT", blockId: block.id, content });

  const c = block.content as {
    title?: string;
    subtitle?: string;
    categories: TechStackCategory[];
  };

  const categories = c.categories ?? [];

  return (
    <div className="space-y-4">
      {/* Title */}
      <div>
        <label className="block text-[12px] font-medium text-[#5A5A58] mb-1">Titre</label>
        <input
          className={inputClass}
          value={c.title ?? ""}
          onChange={(e) => update({ title: e.target.value })}
          placeholder="Titre de la section"
        />
      </div>

      {/* Subtitle */}
      <div>
        <label className="block text-[12px] font-medium text-[#5A5A58] mb-1">Sous-titre</label>
        <textarea
          className={inputClass + " resize-none"}
          rows={2}
          value={c.subtitle ?? ""}
          onChange={(e) => update({ subtitle: e.target.value })}
          placeholder="Description courte"
        />
      </div>

      {/* Categories */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-[12px] font-medium text-[#5A5A58]">Categories</label>
          <button
            type="button"
            className="text-[12px] text-[#4F46E5] hover:text-[#4338CA] font-medium"
            onClick={() =>
              update({ categories: [...categories, { name: "", items: [] }] })
            }
          >
            + Ajouter une catégorie
          </button>
        </div>

        <div className="space-y-4">
          {categories.map((cat, ci) => (
            <div
              key={ci}
              className="border border-[#E6E6E4] rounded-lg p-3 space-y-3 bg-white"
            >
              {/* Category header */}
              <div className="flex items-center gap-2">
                <input
                  className={inputClass}
                  value={cat.name}
                  onChange={(e) => {
                    const next = [...categories];
                    next[ci] = { ...next[ci], name: e.target.value };
                    update({ categories: next });
                  }}
                  placeholder="Nom de la catégorie"
                />
                <button
                  type="button"
                  className="shrink-0 text-[12px] text-red-500 hover:text-red-700"
                  onClick={() => {
                    const next = categories.filter((_, j) => j !== ci);
                    update({ categories: next });
                  }}
                >
                  Supprimer
                </button>
              </div>

              {/* Items */}
              <div className="space-y-2 pl-2">
                {cat.items.map((item, ii) => (
                  <div key={ii} className="flex gap-2 items-start">
                    <div className="flex-1 space-y-1">
                      <div className="flex gap-2">
                        <input
                          className={inputClass + " !w-16 text-center"}
                          value={item.icon ?? ""}
                          onChange={(e) => {
                            const nextCats = [...categories];
                            const nextItems = [...nextCats[ci].items];
                            nextItems[ii] = { ...nextItems[ii], icon: e.target.value };
                            nextCats[ci] = { ...nextCats[ci], items: nextItems };
                            update({ categories: nextCats });
                          }}
                          placeholder="Emoji"
                        />
                        <input
                          className={inputClass}
                          value={item.name}
                          onChange={(e) => {
                            const nextCats = [...categories];
                            const nextItems = [...nextCats[ci].items];
                            nextItems[ii] = { ...nextItems[ii], name: e.target.value };
                            nextCats[ci] = { ...nextCats[ci], items: nextItems };
                            update({ categories: nextCats });
                          }}
                          placeholder="Nom"
                        />
                      </div>
                      <input
                        className={inputClass}
                        value={item.description ?? ""}
                        onChange={(e) => {
                          const nextCats = [...categories];
                          const nextItems = [...nextCats[ci].items];
                          nextItems[ii] = { ...nextItems[ii], description: e.target.value };
                          nextCats[ci] = { ...nextCats[ci], items: nextItems };
                          update({ categories: nextCats });
                        }}
                        placeholder="Description (optionnel)"
                      />
                    </div>
                    <button
                      type="button"
                      className="mt-1 text-[12px] text-red-500 hover:text-red-700"
                      onClick={() => {
                        const nextCats = [...categories];
                        const nextItems = cat.items.filter((_, j) => j !== ii);
                        nextCats[ci] = { ...nextCats[ci], items: nextItems };
                        update({ categories: nextCats });
                      }}
                    >
                      Supprimer
                    </button>
                  </div>
                ))}

                <button
                  type="button"
                  className="text-[12px] text-[#4F46E5] hover:text-[#4338CA] font-medium"
                  onClick={() => {
                    const nextCats = [...categories];
                    nextCats[ci] = {
                      ...nextCats[ci],
                      items: [...nextCats[ci].items, { name: "", icon: "", description: "" }],
                    };
                    update({ categories: nextCats });
                  }}
                >
                  + Ajouter un item
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
