"use client";

import { createContext, useContext, useReducer, useEffect, useState, useRef, type ReactNode } from "react";
import type { Site, Block, BlockType, BlockContentMap, BlockSettings, SitePage } from "@/types";
import { useSite } from "@/lib/hooks/use-site";

type Breakpoint = "desktop" | "tablet" | "mobile";
type SaveStatus = "idle" | "saving" | "saved" | "error";

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
  | { type: "INIT_SITE"; site: Site }
  | { type: "MARK_CLEAN" }
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
  "portfolio-grid": { columns: 3, items: [{ title: "Projet 1", imageUrl: "", category: "Design" }], categories: [], showFilter: false, showDetailLink: false, showSearch: false },
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
  "calendar-booking": { title: "Réserver un créneau", description: "Choisissez un horaire", provider: "calendly" as const, embedUrl: "", ctaLabel: "Réserver", openModal: false, slots: ["Lundi 10h", "Mardi 14h"] },
  "stats-counter": { stats: [{ value: "100+", label: "Projets" }] },
  newsletter: { title: "Newsletter", description: "Restez informé", placeholder: "Votre email", buttonLabel: "S'abonner" },
  "pricing-table": { title: "Nos offres", plans: [{ name: "Starter", price: 29, period: "monthly" as const, description: "Pour démarrer", features: ["Feature 1", "Feature 2"], isPopular: false, ctaLabel: "Choisir" }, { name: "Pro", price: 79, period: "monthly" as const, description: "Pour les pros", features: ["Feature 1", "Feature 2", "Feature 3"], isPopular: true, ctaLabel: "Choisir" }], showToggle: false, columns: 2 },
  "feature-grid": { title: "Fonctionnalités", subtitle: "Tout ce dont vous avez besoin", features: [{ icon: "zap", title: "Rapide", description: "Performance optimale" }, { icon: "shield", title: "Sécurisé", description: "Protection maximale" }, { icon: "heart", title: "Simple", description: "Facile à utiliser" }], columns: 3 },
  "testimonials-carousel": { testimonials: [{ name: "Client 1", role: "CEO", text: "Excellent travail !", rating: 5 }], autoplay: true, autoplayInterval: 5000 },
  "faq-advanced": { title: "Questions fréquentes", items: [{ question: "Question ?", answer: "Réponse." }], allowMultiple: false, useGlobal: false },
  "timeline-advanced": { title: "Notre processus", orientation: "vertical" as const, steps: [{ title: "Étape 1", description: "Description" }] },
  "cta-premium": { title: "Prêt à commencer ?", description: "Lancez votre projet dès aujourd'hui.", primaryCtaLabel: "Commencer", secondaryCtaLabel: "En savoir plus" },
  "logo-cloud": { title: "Ils nous font confiance", logos: [{ name: "Client 1", imageUrl: "" }], grayscale: true, columns: 4 },
  "stats-animated": { stats: [{ value: 50, suffix: "+", label: "Projets" }, { value: 98, suffix: "%", label: "Satisfaction" }], animateOnScroll: true },
  "masonry-gallery": { items: [{ imageUrl: "", title: "Image 1" }], columns: 3, lightbox: false, maxImages: 12 },
  "comparison-table": { title: "Comparer les offres", plans: [{ name: "Basic", isHighlighted: false, ctaLabel: "Choisir" }, { name: "Premium", isHighlighted: true, ctaLabel: "Choisir" }], rows: [{ feature: "Feature 1", values: [true, true] }, { feature: "Feature 2", values: [false, true] }] },
  "contact-form": { title: "Contactez-nous", description: "Remplissez le formulaire ci-dessous.", fields: [{ label: "Nom", type: "text" as const, required: true }, { label: "Email", type: "email" as const, required: true }, { label: "Message", type: "textarea" as const, required: false }], submitLabel: "Envoyer", successMessage: "Merci ! Nous reviendrons vers vous rapidement.", saveAsLead: false },
  "blog-preview": { title: "Articles récents", posts: [{ title: "Article 1", excerpt: "Résumé de l'article...", date: "2025-03-15" }], columns: 3 },
  "video-text-split": { videoUrl: "", videoPosition: "left" as const, title: "Découvrez notre approche", description: "Description de la vidéo.", ctaLabel: "En savoir plus" },
  "before-after": { beforeImageUrl: "", afterImageUrl: "", beforeLabel: "Avant", afterLabel: "Après", initialPosition: 50 },
  "service-cards": { title: "Nos services", services: [{ icon: "palette", name: "Service 1", description: "Description", features: ["Feature 1"], ctaLabel: "Commander" }], columns: 3 },
  "lead-magnet": { title: "Téléchargez notre guide", description: "Un guide complet pour lancer votre marque.", fileUrl: "", buttonLabel: "Télécharger", successMessage: "Merci ! Vérifiez votre boîte mail." },
  "availability-banner": { status: "open" as const, message: "Actuellement disponible pour de nouveaux projets" },
  "product-hero-checkout": { productId: "", benefits: ["Résultat professionnel", "Livraison rapide", "Révisions incluses"], ctaLabel: "Commander", showFeatures: true, layout: "center" as const },
  "product-cards-grid": { productIds: [], columns: 3 as const, showFilter: true, ctaLabel: "Voir le détail" },
  "inline-checkout": { productId: "", layout: "detailed" as const, ctaLabel: "Commander maintenant" },
  "bundle-builder": { productIds: [], title: "Créez votre pack sur-mesure", description: "Sélectionnez les services qui vous intéressent", ctaLabel: "Commander le pack", discountPercent: 10 },
  "pricing-table-real": { productIds: [], columns: 3 as const, showFeatures: true, highlightIndex: 1, ctaLabel: "Choisir" },
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
    case "INIT_SITE": {
      return {
        ...state,
        site: action.site,
        activePageId: action.site.pages[0]?.id ?? "",
        activeBlockId: null,
        isDirty: false,
        history: [JSON.parse(JSON.stringify(action.site))],
        historyIndex: 0,
      };
    }

    case "MARK_CLEAN":
      return { ...state, isDirty: false };

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

const emptySite: Site = {
  id: "",
  settings: { name: "", description: "", maintenanceMode: false, socials: {} },
  theme: { primaryColor: "#4F46E5", fontFamily: "Inter, sans-serif", borderRadius: "rounded", shadow: "sm" },
  pages: [],
  domain: { subdomain: "" },
  seo: { globalTitle: "", globalDescription: "" },
};

const initialState: BuilderState = {
  site: emptySite,
  activePageId: "",
  activeBlockId: null,
  isDirty: false,
  breakpoint: "desktop",
  previewMode: false,
  history: [JSON.parse(JSON.stringify(emptySite))],
  historyIndex: 0,
};

// ── Serialize Site → draft payload for autosave ──
function serializeSiteForSave(site: Site) {
  return {
    name: site.settings.name,
    settings: {
      description: site.settings.description,
      logoUrl: site.settings.logoUrl,
      maintenanceMode: site.settings.maintenanceMode,
      socials: site.settings.socials,
      i18n: site.settings.i18n,
    },
    theme: site.theme,
    seo: {
      globalTitle: site.seo.globalTitle,
      globalDescription: site.seo.globalDescription,
      ogImageUrl: site.seo.ogImageUrl,
    },
    nav: site.nav || null,
    footer: site.footer || null,
    pages: site.pages.map((p, i) => ({
      title: p.name,
      slug: p.slug === "/" ? "home" : p.slug.replace(/^\//, ""),
      is_home: p.slug === "/",
      sort_order: i,
      status: p.status || "draft",
      seo_title: p.seoTitle || null,
      seo_description: p.seoDescription || null,
      blocks: p.blocks.map((b, j) => ({
        type: b.type,
        sort_order: j,
        content: b.content,
        style: b.style,
        settings: b.settings,
        visible: b.visible,
      })),
    })),
  };
}

const BuilderContext = createContext<{
  state: BuilderState;
  dispatch: React.Dispatch<BuilderAction>;
  saveStatus: SaveStatus;
  siteId: string;
}>({ state: initialState, dispatch: () => {}, saveStatus: "idle", siteId: "" });

export function BuilderProvider({ children }: { children: ReactNode }) {
  const { site: loadedSite, siteId, loading: siteLoading, error: siteError, mutate } = useSite();
  const [state, dispatch] = useReducer(builderReducer, initialState);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const initializedRef = useRef(false);
  const saveAbortRef = useRef<AbortController | null>(null);
  const stateRef = useRef(state);
  stateRef.current = state;

  // Initialize from SiteProvider's data (once per mount)
  useEffect(() => {
    if (!siteLoading && loadedSite.id && !initializedRef.current) {
      dispatch({ type: "INIT_SITE", site: loadedSite });
      initializedRef.current = true;
    }
  }, [siteLoading, loadedSite]);

  // Autosave: debounced 800ms after any dirty change
  useEffect(() => {
    if (!state.isDirty || !siteId || !initializedRef.current) return;

    const timer = setTimeout(async () => {
      saveAbortRef.current?.abort();
      const ctrl = new AbortController();
      saveAbortRef.current = ctrl;

      setSaveStatus("saving");
      try {
        const snapshot = serializeSiteForSave(state.site);
        const res = await fetch(`/api/sites/${siteId}/draft`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(snapshot),
          signal: ctrl.signal,
        });
        if (ctrl.signal.aborted) return;
        if (!res.ok) throw new Error(`${res.status}`);

        setSaveStatus("saved");
        dispatch({ type: "MARK_CLEAN" });
        // Refresh SiteProvider cache for other tabs (fire & forget)
        mutate();
      } catch (err: unknown) {
        if (err instanceof Error && err.name === "AbortError") return;
        console.error("[autosave] error:", err);
        setSaveStatus("error");
      }
    }, 800);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.site, state.isDirty, siteId]);

  // Flush pending changes on unmount (tab switch)
  useEffect(() => {
    return () => {
      saveAbortRef.current?.abort();
      if (stateRef.current.isDirty && siteId) {
        const snapshot = serializeSiteForSave(stateRef.current.site);
        fetch(`/api/sites/${siteId}/draft`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(snapshot),
          keepalive: true,
        }).catch(() => {});
      }
    };
  }, [siteId]);

  // Error state — SiteProvider failed (404, auth, network)
  if (!siteLoading && siteError) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <div className="text-center">
          <p className="text-[13px] text-red-500 mb-2">{siteError}</p>
          <button
            onClick={() => mutate()}
            className="text-[12px] font-medium text-[#4F46E5] border border-[#4F46E5]/20 px-3 py-1.5 rounded-lg hover:bg-[#EEF2FF] transition-colors"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  // Loading state — still fetching from API or waiting for initialization
  if (siteLoading || !initializedRef.current) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <div className="flex items-center gap-2 text-[#999]">
          <div className="w-4 h-4 border-2 border-[#999] border-t-transparent rounded-full animate-spin" />
          <span className="text-[13px]">Chargement du site...</span>
        </div>
      </div>
    );
  }

  return (
    <BuilderContext.Provider value={{ state, dispatch, saveStatus, siteId: siteId || "" }}>
      {children}
    </BuilderContext.Provider>
  );
}

export function useBuilder() {
  return useContext(BuilderContext);
}

export { defaultContent, serializeSiteForSave };
export type { BuilderAction, Breakpoint, SaveStatus };
