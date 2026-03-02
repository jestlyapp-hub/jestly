"use client";

import { createContext, useContext, useReducer, type ReactNode } from "react";
import type { Site, Block, BlockType, BlockContentMap, BlockSettings, SitePage } from "@/types";
import { mockSite } from "@/lib/mock-data";

type Breakpoint = "desktop" | "tablet" | "mobile";

interface BuilderState {
  site: Site;
  activePageId: string;
  activeBlockId: string | null;
  isDirty: boolean;
  breakpoint: Breakpoint;
  previewMode: boolean;
  history: Site[];
  historyIndex: number;
}

type BuilderAction =
  | { type: "SET_ACTIVE_PAGE"; pageId: string }
  | { type: "SET_ACTIVE_BLOCK"; blockId: string | null }
  | { type: "UPDATE_BLOCK_CONTENT"; blockId: string; content: Record<string, unknown> }
  | { type: "UPDATE_BLOCK_STYLE"; blockId: string; style: Partial<Block["style"]> }
  | { type: "UPDATE_BLOCK_SETTINGS"; blockId: string; settings: Partial<BlockSettings> }
  | { type: "TOGGLE_BLOCK_VISIBILITY"; blockId: string }
  | { type: "DUPLICATE_BLOCK"; blockId: string }
  | { type: "REORDER_BLOCKS"; pageId: string; fromIndex: number; toIndex: number }
  | { type: "ADD_BLOCK"; pageId: string; blockType: BlockType }
  | { type: "REMOVE_BLOCK"; blockId: string }
  | { type: "ADD_PAGE"; page: SitePage }
  | { type: "REMOVE_PAGE"; pageId: string }
  | { type: "UPDATE_PAGE"; pageId: string; updates: Partial<SitePage> }
  | { type: "APPLY_TEMPLATE"; pages: SitePage[] }
  | { type: "UPDATE_SITE_SETTINGS"; settings: Partial<Site["settings"]> }
  | { type: "UPDATE_SITE_THEME"; theme: Partial<Site["theme"]> }
  | { type: "UPDATE_SITE_SEO"; seo: Partial<Site["seo"]> }
  | { type: "UPDATE_SITE_DOMAIN"; domain: Partial<Site["domain"]> }
  | { type: "SET_BREAKPOINT"; breakpoint: Breakpoint }
  | { type: "TOGGLE_PREVIEW_MODE" }
  | { type: "UNDO" }
  | { type: "REDO" };

const defaultContent: { [K in BlockType]: BlockContentMap[K] } = {
  hero: { title: "Titre principal", subtitle: "Sous-titre de la section", ctaLabel: "En savoir plus", ctaLink: "#" },
  "portfolio-grid": { columns: 3, items: [{ title: "Projet 1", imageUrl: "", category: "Design" }] },
  "services-list": { productIds: [], showPrice: true, showCategory: true, ctaMode: "product_page" as const, layout: "list" as const },
  "pack-premium": { productId: "", highlight: true, showFeatures: true, showPrice: true, ctaLabel: "Choisir ce pack" },
  testimonials: { testimonials: [{ name: "Client", role: "CEO", text: "Super travail !" }] },
  "timeline-process": { steps: [{ title: "Étape 1", description: "Description" }] },
  "faq-accordion": { items: [{ question: "Question ?", answer: "Réponse." }] },
  video: { videoUrl: "", caption: "Vidéo de présentation" },
  "full-image": { imageUrl: "", alt: "Image", overlayText: "" },
  "why-me": { title: "Pourquoi me choisir ?", reasons: [{ title: "Raison 1", description: "Description" }] },
  "centered-cta": { title: "Passez à l'action", description: "Description de l'appel à l'action", ctaLabel: "Commencer", ctaLink: "#" },
  "custom-form": { fields: [{ label: "Nom", type: "text", required: true }], submitLabel: "Envoyer" },
  "calendar-booking": { title: "Réserver un créneau", description: "Choisissez un horaire", slots: ["Lundi 10h", "Mardi 14h"] },
  "stats-counter": { stats: [{ value: "100+", label: "Projets" }] },
  newsletter: { title: "Newsletter", description: "Restez informé", placeholder: "Votre email", buttonLabel: "S'abonner" },
};

let blockCounter = 100;

const MAX_HISTORY = 50;

function pushHistory(state: BuilderState): { history: Site[]; historyIndex: number } {
  const history = state.history.slice(0, state.historyIndex + 1);
  history.push(JSON.parse(JSON.stringify(state.site)));
  if (history.length > MAX_HISTORY) history.shift();
  return { history, historyIndex: history.length - 1 };
}

function withHistory(state: BuilderState, site: Site): BuilderState {
  const h = pushHistory(state);
  return { ...state, site, isDirty: true, history: h.history, historyIndex: h.historyIndex };
}

function builderReducer(state: BuilderState, action: BuilderAction): BuilderState {
  switch (action.type) {
    case "SET_ACTIVE_PAGE":
      return { ...state, activePageId: action.pageId, activeBlockId: null };

    case "SET_ACTIVE_BLOCK":
      return { ...state, activeBlockId: action.blockId };

    case "SET_BREAKPOINT":
      return { ...state, breakpoint: action.breakpoint };

    case "TOGGLE_PREVIEW_MODE":
      return { ...state, previewMode: !state.previewMode, activeBlockId: null };

    case "UNDO": {
      if (state.historyIndex <= 0) return state;
      const newIndex = state.historyIndex - 1;
      return { ...state, site: JSON.parse(JSON.stringify(state.history[newIndex])), historyIndex: newIndex, isDirty: true };
    }

    case "REDO": {
      if (state.historyIndex >= state.history.length - 1) return state;
      const newIndex = state.historyIndex + 1;
      return { ...state, site: JSON.parse(JSON.stringify(state.history[newIndex])), historyIndex: newIndex, isDirty: true };
    }

    case "UPDATE_BLOCK_CONTENT": {
      const site = { ...state.site, pages: state.site.pages.map((p) => ({
        ...p,
        blocks: p.blocks.map((b) =>
          b.id === action.blockId ? { ...b, content: { ...b.content, ...action.content } } as Block : b
        ),
      })) };
      return withHistory(state, site);
    }

    case "UPDATE_BLOCK_STYLE": {
      const site = { ...state.site, pages: state.site.pages.map((p) => ({
        ...p,
        blocks: p.blocks.map((b) =>
          b.id === action.blockId ? { ...b, style: { ...b.style, ...action.style } } as Block : b
        ),
      })) };
      return withHistory(state, site);
    }

    case "UPDATE_BLOCK_SETTINGS": {
      const site = { ...state.site, pages: state.site.pages.map((p) => ({
        ...p,
        blocks: p.blocks.map((b) =>
          b.id === action.blockId ? { ...b, settings: { ...b.settings, ...action.settings } } as Block : b
        ),
      })) };
      return withHistory(state, site);
    }

    case "TOGGLE_BLOCK_VISIBILITY": {
      const site = { ...state.site, pages: state.site.pages.map((p) => ({
        ...p,
        blocks: p.blocks.map((b) =>
          b.id === action.blockId ? { ...b, visible: !b.visible } as Block : b
        ),
      })) };
      return withHistory(state, site);
    }

    case "DUPLICATE_BLOCK": {
      blockCounter++;
      const site = { ...state.site, pages: state.site.pages.map((p) => {
        const idx = p.blocks.findIndex((b) => b.id === action.blockId);
        if (idx === -1) return p;
        const source = p.blocks[idx];
        const dup = { ...source, id: `BLK-DUP-${blockCounter}`, content: { ...source.content }, style: { ...source.style }, settings: { ...source.settings } } as Block;
        const blocks = [...p.blocks];
        blocks.splice(idx + 1, 0, dup);
        return { ...p, blocks };
      }) };
      return { ...withHistory(state, site), activeBlockId: `BLK-DUP-${blockCounter}` };
    }

    case "REORDER_BLOCKS": {
      const site = { ...state.site, pages: state.site.pages.map((p) => {
        if (p.id !== action.pageId) return p;
        const blocks = [...p.blocks];
        const [moved] = blocks.splice(action.fromIndex, 1);
        blocks.splice(action.toIndex, 0, moved);
        return { ...p, blocks };
      }) };
      return withHistory(state, site);
    }

    case "ADD_BLOCK": {
      blockCounter++;
      const newBlock = {
        id: `BLK-NEW-${blockCounter}`,
        type: action.blockType,
        content: { ...defaultContent[action.blockType] },
        style: { paddingTop: 40, paddingBottom: 40 },
        settings: {},
        visible: true,
      } as Block;
      const site = { ...state.site, pages: state.site.pages.map((p) =>
        p.id === action.pageId ? { ...p, blocks: [...p.blocks, newBlock] } : p
      ) };
      return { ...withHistory(state, site), activeBlockId: newBlock.id };
    }

    case "REMOVE_BLOCK": {
      const site = { ...state.site, pages: state.site.pages.map((p) => ({
        ...p,
        blocks: p.blocks.filter((b) => b.id !== action.blockId),
      })) };
      return { ...withHistory(state, site), activeBlockId: state.activeBlockId === action.blockId ? null : state.activeBlockId };
    }

    case "ADD_PAGE": {
      const site = { ...state.site, pages: [...state.site.pages, action.page] };
      return { ...withHistory(state, site), activePageId: action.page.id };
    }

    case "REMOVE_PAGE": {
      const site = { ...state.site, pages: state.site.pages.filter((p) => p.id !== action.pageId) };
      const newActivePageId = state.activePageId === action.pageId
        ? (site.pages[0]?.id ?? "")
        : state.activePageId;
      return { ...withHistory(state, site), activePageId: newActivePageId, activeBlockId: null };
    }

    case "UPDATE_PAGE": {
      const site = { ...state.site, pages: state.site.pages.map((p) =>
        p.id === action.pageId ? { ...p, ...action.updates } : p
      ) };
      return withHistory(state, site);
    }

    case "APPLY_TEMPLATE": {
      const site = { ...state.site, pages: action.pages };
      return { ...withHistory(state, site), activePageId: action.pages[0]?.id ?? "", activeBlockId: null };
    }

    case "UPDATE_SITE_SETTINGS":
      return withHistory(state, { ...state.site, settings: { ...state.site.settings, ...action.settings } });

    case "UPDATE_SITE_THEME":
      return withHistory(state, { ...state.site, theme: { ...state.site.theme, ...action.theme } });

    case "UPDATE_SITE_SEO":
      return withHistory(state, { ...state.site, seo: { ...state.site.seo, ...action.seo } });

    case "UPDATE_SITE_DOMAIN":
      return withHistory(state, { ...state.site, domain: { ...state.site.domain, ...action.domain } });

    default:
      return state;
  }
}

const initialState: BuilderState = {
  site: mockSite,
  activePageId: mockSite.pages[0]?.id ?? "",
  activeBlockId: null,
  isDirty: false,
  breakpoint: "desktop",
  previewMode: false,
  history: [JSON.parse(JSON.stringify(mockSite))],
  historyIndex: 0,
};

const BuilderContext = createContext<{
  state: BuilderState;
  dispatch: React.Dispatch<BuilderAction>;
}>({ state: initialState, dispatch: () => {} });

export function BuilderProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(builderReducer, initialState);
  return (
    <BuilderContext.Provider value={{ state, dispatch }}>
      {children}
    </BuilderContext.Provider>
  );
}

export function useBuilder() {
  return useContext(BuilderContext);
}

export { defaultContent };
export type { BuilderAction, Breakpoint };
