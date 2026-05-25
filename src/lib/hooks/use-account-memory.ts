"use client";

import { useEffect, useState } from "react";
import { useApi } from "@/lib/hooks/use-api";

const STORAGE_KEY = "jestly_ecom_account";

interface MeResponse {
  authenticated: boolean;
  user?: { id: string; email: string | null };
}

export interface AccountMemory {
  /** User actuellement connecté (depuis /api/me). */
  currentUserId: string | null;
  currentEmail: string | null;
  /** Dernier compte ayant utilisé l'ecom sur ce navigateur (localStorage). */
  rememberedEmail: string | null;
  rememberedUserId: string | null;
  /** True si le compte actuel diffère du dernier mémorisé (cause probable des intégrations "oubliées"). */
  accountMismatch: boolean;
  loading: boolean;
}

/**
 * Mémorise sur ce navigateur le dernier compte ayant accédé à l'ecom.
 * Les intégrations Pinterest/Shopify étant scopées par user_id Supabase,
 * se connecter avec un compte différent fait disparaître les intégrations.
 * Ce hook détecte ce cas pour pouvoir avertir l'utilisateur.
 */
export function useAccountMemory(): AccountMemory {
  const { data, loading } = useApi<MeResponse>("/api/me");
  const [remembered, setRemembered] = useState<{ email: string | null; userId: string | null }>({ email: null, userId: null });

  // Lecture du localStorage au montage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as { email: string | null; userId: string | null };
        setRemembered({ email: parsed.email ?? null, userId: parsed.userId ?? null });
      }
    } catch { /* ignore */ }
  }, []);

  // Mémorise le compte courant dès qu'il est connu
  useEffect(() => {
    if (data?.authenticated && data.user) {
      const next = { email: data.user.email, userId: data.user.id };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch { /* ignore */ }
      // On ne met PAS à jour `remembered` ici : on garde la valeur lue au montage
      // pour pouvoir comparer (sinon le mismatch disparaîtrait immédiatement).
    }
  }, [data]);

  const currentUserId = data?.user?.id ?? null;
  const currentEmail = data?.user?.email ?? null;
  const accountMismatch = Boolean(
    !loading &&
    currentUserId &&
    remembered.userId &&
    remembered.userId !== currentUserId,
  );

  return {
    currentUserId,
    currentEmail,
    rememberedEmail: remembered.email,
    rememberedUserId: remembered.userId,
    accountMismatch,
    loading,
  };
}
