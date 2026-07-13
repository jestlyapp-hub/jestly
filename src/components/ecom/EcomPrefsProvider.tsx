"use client";

/**
 * Source UNIQUE de vérité des préférences du module ECOM : période, boutique,
 * et préférences d'affichage (métriques, colonnes, tiroir). Monté au niveau du
 * layout (dans EcomShell) → l'état PERSISTE à travers la navigation entre pages
 * (App Router ne remonte pas le layout). Il survit au reload via localStorage,
 * et supporte le deep-link via l'URL (?from&to&pl).
 *
 * ISOLATION MULTI-TENANT : les préférences localStorage sont estampillées du
 * user courant. Si le compte change dans le même navigateur, les prefs de
 * l'autre compte ne sont jamais réutilisées (reset au défaut).
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { SWRConfig } from "swr";
import { useApi } from "@/lib/hooks/use-api";
import { parisDaysAgo, todayParis } from "@/lib/paris-time";
import { EcomShopContext, ECOM_SWR_USE } from "./ecom-shop-context";

const DAY_RE = /^\d{4}-\d{2}-\d{2}$/;
const DEFAULT_LABEL = "30 derniers jours";

export interface EcomRange {
  from: string;
  to: string;
  label: string;
}

/** Boutique Shopify du user (vue légère pour le sélecteur). */
export interface EcomShopLite {
  id: string;
  shop_domain: string;
  status: string;
  last_sync_at: string | null;
  metadata: { shop_name?: string; currency?: string } & Record<string, unknown>;
  sync_state?: { initial_sync_completed: boolean; initial_sync_progress: Record<string, unknown> };
}

function defaultRange(): EcomRange {
  return { from: parisDaysAgo(30), to: todayParis(), label: DEFAULT_LABEL };
}

interface Ctx {
  range: EcomRange;
  setRange: (r: EcomRange) => void;
  userKey: string;
  /** Lecture/écriture d'une préférence persistée, namespacée par user. */
  getPref: <T>(key: string, fallback: T) => T;
  setPref: <T>(key: string, value: T) => void;
  /** Boutiques du user (principale d'abord). */
  shops: EcomShopLite[];
  /** id de la boutique sélectionnée (null si aucune). */
  selectedShopId: string | null;
  /** Boutique sélectionnée résolue (ou null). */
  selectedShop: EcomShopLite | null;
  /** Change la boutique active (persistée par user). */
  setSelectedShopId: (id: string) => void;
}

const EcomPrefsContext = createContext<Ctx | null>(null);

const RANGE_KEY = "jestly_ecom_range";
const SHOP_KEY = "jestly_ecom_shop";
const prefStorageKey = (key: string) => `jestly_ecom_pref__${key}`;

/** Lit une valeur estampillée { u, v } ; renvoie fallback si autre compte/absent. */
function readStamped<T>(storageKey: string, userKey: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as { u?: string; v?: T };
    if (parsed.u !== userKey || parsed.v === undefined) return fallback;
    return parsed.v;
  } catch {
    return fallback;
  }
}

function writeStamped<T>(storageKey: string, userKey: string, value: T): void {
  try {
    window.localStorage.setItem(storageKey, JSON.stringify({ u: userKey, v: value }));
  } catch {
    /* quota / mode privé : la persistance échoue silencieusement */
  }
}

export function EcomPrefsProvider({
  children,
  shops = [],
}: {
  children: React.ReactNode;
  shops?: EcomShopLite[];
}) {
  const sp = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // user courant → clé de namespace (isolation). "anon" tant qu'inconnu.
  const { data: me } = useApi<{ id?: string }>("/api/auth/me");
  const userKey = me?.id ?? "anon";

  // Init : URL (deep-link) prioritaire, sinon défaut ; le localStorage est
  // appliqué une fois le user connu (effet ci-dessous) pour respecter l'isolation.
  const urlFrom = sp.get("from");
  const urlTo = sp.get("to");
  const urlHasRange = Boolean(urlFrom && urlTo && DAY_RE.test(urlFrom!) && DAY_RE.test(urlTo!) && urlFrom! <= urlTo!);

  const [range, setRangeState] = useState<EcomRange>(() =>
    urlHasRange ? { from: urlFrom!, to: urlTo!, label: sp.get("pl") ?? "Personnalisé" } : defaultRange(),
  );

  // Hydrate depuis localStorage une fois le user résolu, SI l'URL n'impose rien.
  const hydratedFor = useRef<string | null>(null);
  useEffect(() => {
    if (userKey === "anon") return;
    if (hydratedFor.current === userKey) return;
    hydratedFor.current = userKey;
    if (urlHasRange) return; // le deep-link gagne
    const stored = readStamped<EcomRange | null>(RANGE_KEY, userKey, null);
    if (stored && DAY_RE.test(stored.from) && DAY_RE.test(stored.to)) {
      setRangeState(stored);
    }
  }, [userKey, urlHasRange]);

  const writeUrl = useCallback((r: EcomRange) => {
    const params = new URLSearchParams(sp.toString());
    params.set("from", r.from);
    params.set("to", r.to);
    params.set("pl", r.label);
    router.replace(`${pathname}?${params.toString()}` as Parameters<typeof router.replace>[0], { scroll: false });
  }, [sp, router, pathname]);

  const setRange = useCallback((r: EcomRange) => {
    setRangeState(r);
    writeStamped(RANGE_KEY, userKey === "anon" ? (hydratedFor.current ?? "anon") : userKey, r);
    writeUrl(r);
  }, [userKey, writeUrl]);

  const getPref = useCallback(<T,>(key: string, fallback: T): T => {
    if (typeof window === "undefined" || userKey === "anon") return fallback;
    return readStamped<T>(prefStorageKey(key), userKey, fallback);
  }, [userKey]);

  const setPref = useCallback(<T,>(key: string, value: T): void => {
    if (userKey === "anon") return;
    writeStamped(prefStorageKey(key), userKey, value);
  }, [userKey]);

  // ── Boutique sélectionnée (multi-boutiques) ────────────────────────
  // Défaut : la boutique principale (shops[0]). La préférence persistée n'est
  // appliquée qu'une fois le user résolu (isolation) ET si elle pointe encore
  // vers une boutique existante (sinon on retombe sur la principale).
  const primaryId = shops[0]?.id ?? null;
  const [selectedShopId, setSelectedShopIdState] = useState<string | null>(primaryId);
  const shopHydratedFor = useRef<string | null>(null);

  useEffect(() => {
    if (userKey === "anon") return;
    if (shopHydratedFor.current !== userKey) {
      shopHydratedFor.current = userKey;
      const stored = readStamped<string | null>(prefStorageKey(SHOP_KEY), userKey, null);
      if (stored && shops.some((s) => s.id === stored)) {
        setSelectedShopIdState(stored);
        return;
      }
    }
    // Garde-fou : si la sélection courante n'existe plus (boutique déconnectée),
    // retomber sur la principale.
    setSelectedShopIdState((cur) => (cur && shops.some((s) => s.id === cur) ? cur : primaryId));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userKey, primaryId, shops.length]);

  const setSelectedShopId = useCallback((id: string) => {
    setSelectedShopIdState(id);
    if (userKey !== "anon") writeStamped(prefStorageKey(SHOP_KEY), userKey, id);
  }, [userKey]);

  const selectedShop = useMemo(
    () => shops.find((s) => s.id === selectedShopId) ?? null,
    [shops, selectedShopId],
  );

  const ctx: Ctx = {
    range, setRange, userKey, getPref, setPref,
    shops, selectedShopId, selectedShop, setSelectedShopId,
  };

  return (
    <EcomPrefsContext.Provider value={ctx}>
      <EcomShopContext.Provider value={selectedShopId}>
        <SWRConfig value={{ use: ECOM_SWR_USE }}>
          {children}
        </SWRConfig>
      </EcomShopContext.Provider>
    </EcomPrefsContext.Provider>
  );
}

/** Accès au contexte de préférences ECOM (période + prefs). */
export function useEcomPrefs(): Ctx {
  const ctx = useContext(EcomPrefsContext);
  if (!ctx) {
    // Défensif : hors provider (ne devrait pas arriver sous EcomShell).
    return {
      range: defaultRange(),
      setRange: () => {},
      userKey: "anon",
      getPref: <T,>(_k: string, f: T) => f,
      setPref: () => {},
      shops: [],
      selectedShopId: null,
      selectedShop: null,
      setSelectedShopId: () => {},
    };
  }
  return ctx;
}

/**
 * Préférence persistée par user, réactive (state React + localStorage namespacé).
 * Réhydrate quand le user est résolu pour éviter le flash au premier rendu.
 */
export function useEcomPref<T>(key: string, fallback: T): [T, (v: T) => void] {
  const { getPref, setPref, userKey } = useEcomPrefs();
  const [value, setValue] = useState<T>(fallback);
  const hydrated = useRef<string | null>(null);

  useEffect(() => {
    if (userKey === "anon") return;
    if (hydrated.current === userKey) return;
    hydrated.current = userKey;
    setValue(getPref(key, fallback));
    // fallback n'est pas une dépendance : on ne réhydrate qu'au changement de user.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userKey, key]);

  const set = useCallback((v: T) => {
    setValue(v);
    setPref(key, v);
  }, [key, setPref]);

  return [value, set];
}
