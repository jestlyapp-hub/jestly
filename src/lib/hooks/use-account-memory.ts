"use client";

import { useEffect, useMemo, useState } from "react";
import { useApi } from "@/lib/hooks/use-api";

const STORAGE_KEY = "jestly_ecom_accounts"; // v2 : registre multi-comptes

interface MeResponse {
  authenticated: boolean;
  user?: { id: string; email: string | null };
}
interface ShopifyState { connected: boolean }
interface PinterestState { connected: boolean; integration?: { external_account_id: string | null } }

/** Une entrée du registre : un compte vu sur ce navigateur + ses intégrations connues. */
export interface RememberedAccount {
  userId: string;
  email: string | null;
  hasShopify: boolean;
  hasPinterest: boolean;
  updatedAt: number;
}

export interface AccountMemory {
  currentUserId: string | null;
  currentEmail: string | null;
  /** Le compte courant a-t-il au moins une intégration ecom ? */
  currentHasIntegration: boolean;
  /** Tous les comptes connus de ce navigateur (registre persistant). */
  knownAccounts: RememberedAccount[];
  /**
   * Autres comptes (≠ courant) qui ont des intégrations alors que le compte
   * courant n'en a aucune. Si non vide → on peut suggérer un changement de compte.
   */
  accountsWithIntegrations: RememberedAccount[];
  /** True si le compte courant est "vide" mais qu'un autre compte connu a des intégrations. */
  shouldSuggestSwitch: boolean;
  loading: boolean;
}

function readRegistry(): Record<string, RememberedAccount> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return typeof parsed === "object" && parsed !== null ? parsed : {};
  } catch {
    return {};
  }
}

function writeRegistry(reg: Record<string, RememberedAccount>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reg));
  } catch { /* ignore */ }
}

/**
 * Mémorise CHAQUE compte ayant accédé à l'ecom sur ce navigateur, avec les
 * intégrations qu'il possède. Fonctionne pour tous les comptes (pas seulement
 * un compte canonique). Avertit uniquement quand le compte courant n'a aucune
 * intégration mais qu'un autre compte connu en a — pour éviter de reconfigurer
 * une intégration qui existe déjà sur un autre compte.
 */
export function useAccountMemory(): AccountMemory {
  const { data: me, loading: meLoading } = useApi<MeResponse>("/api/me");
  const { data: shopify, loading: shLoading } = useApi<ShopifyState>("/api/integrations/shopify/sync-state");
  const { data: pinterest, loading: pinLoading } = useApi<PinterestState>("/api/integrations/pinterest/status");

  // Snapshot du registre lu au montage (pour comparer avant mise à jour).
  const [registrySnapshot, setRegistrySnapshot] = useState<Record<string, RememberedAccount>>({});
  useEffect(() => { setRegistrySnapshot(readRegistry()); }, []);

  const loading = meLoading || shLoading || pinLoading;
  const currentUserId = me?.user?.id ?? null;
  const currentEmail = me?.user?.email ?? null;
  const hasShopify = Boolean(shopify?.connected);
  const hasPinterest = Boolean(pinterest?.connected && pinterest?.integration?.external_account_id);
  const currentHasIntegration = hasShopify || hasPinterest;

  // Met à jour le registre avec le compte courant + ses intégrations.
  useEffect(() => {
    if (loading || !currentUserId) return;
    const reg = readRegistry();
    reg[currentUserId] = {
      userId: currentUserId,
      email: currentEmail,
      hasShopify,
      hasPinterest,
      updatedAt: Date.now(),
    };
    writeRegistry(reg);
  }, [loading, currentUserId, currentEmail, hasShopify, hasPinterest]);

  const knownAccounts = useMemo(() => {
    // Fusionne snapshot + compte courant (pour affichage immédiat)
    const reg = { ...registrySnapshot };
    if (currentUserId) {
      reg[currentUserId] = {
        userId: currentUserId, email: currentEmail,
        hasShopify, hasPinterest, updatedAt: Date.now(),
      };
    }
    return Object.values(reg).sort((a, b) => b.updatedAt - a.updatedAt);
  }, [registrySnapshot, currentUserId, currentEmail, hasShopify, hasPinterest]);

  const accountsWithIntegrations = useMemo(
    () => knownAccounts.filter(
      (a) => a.userId !== currentUserId && (a.hasShopify || a.hasPinterest),
    ),
    [knownAccounts, currentUserId],
  );

  const shouldSuggestSwitch = Boolean(
    !loading &&
    currentUserId &&
    !currentHasIntegration &&
    accountsWithIntegrations.length > 0,
  );

  return {
    currentUserId,
    currentEmail,
    currentHasIntegration,
    knownAccounts,
    accountsWithIntegrations,
    shouldSuggestSwitch,
    loading,
  };
}
