"use client";

import { useMemo, useCallback } from "react";
import { useApi, apiFetch } from "./use-api";
import { toast } from "./use-toast";
import type { BoardField, FieldOption } from "@/types";

interface BoardResponse {
  board: { id: string; name: string };
  statuses: { production: unknown[]; cash: unknown[] };
  fields: RawField[];
}

interface RawField {
  id: string;
  key: string;
  label: string;
  field_type: string;
  options: string[] | FieldOption[];
  is_required: boolean;
  is_visible_on_card: boolean;
  is_system?: boolean;
  config?: Record<string, unknown>;
  position: number;
}

/** Normalize a raw DB field row to camelCase BoardField */
function normalizeField(raw: RawField): BoardField {
  // options can be string[] (legacy) or FieldOption[]
  const options: FieldOption[] = (raw.options ?? []).map((o) => {
    if (typeof o === "string") return { label: o, color: "gray" };
    return o as FieldOption;
  });

  return {
    id: raw.id,
    key: raw.key,
    label: raw.label,
    fieldType: raw.field_type as BoardField["fieldType"],
    options,
    isRequired: raw.is_required ?? false,
    isVisibleOnCard: raw.is_visible_on_card ?? false,
    isSystem: raw.is_system ?? false,
    config: raw.config ?? {},
    position: raw.position,
  };
}

export function useColumns() {
  const { data, loading, setData, mutate } = useApi<BoardResponse>("/api/orders/board");

  // All fields (system + custom) — page.tsx handles visibility & legacy filtering.
  const fields: BoardField[] = useMemo(() => {
    if (!data?.fields) return [];
    return data.fields
      .map(normalizeField)
      .sort((a, b) => a.position - b.position);
  }, [data]);

  const addField = useCallback(
    async (label: string, fieldType: string): Promise<string | null> => {
      try {
        const created = await apiFetch<RawField>("/api/orders/board/fields", {
          method: "POST",
          body: { label, field_type: fieldType },
        });
        // Add to cache
        setData((prev) => {
          if (!prev) return prev;
          return { ...prev, fields: [...prev.fields, created] };
        });
        return created.id;
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Erreur lors de la création");
        return null;
      }
    },
    [setData]
  );

  const patchField = useCallback(
    async (id: string, patch: Record<string, unknown>): Promise<void> => {
      // Optimistic update
      setData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          fields: prev.fields.map((f) => (f.id === id ? { ...f, ...patch } : f)),
        };
      });

      try {
        const updated = await apiFetch<RawField>(`/api/orders/board/fields/${id}`, {
          method: "PATCH",
          body: patch,
        });
        // Confirm with server data
        setData((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            fields: prev.fields.map((f) => (f.id === id ? updated : f)),
          };
        });
      } catch (err) {
        mutate(); // rollback
        toast.error(err instanceof Error ? err.message : "Erreur");
      }
    },
    [setData, mutate]
  );

  const deleteField = useCallback(
    async (id: string): Promise<void> => {
      // Optimistic: remove from cache
      setData((prev) => {
        if (!prev) return prev;
        return { ...prev, fields: prev.fields.filter((f) => f.id !== id) };
      });

      try {
        await apiFetch(`/api/orders/board/fields/${id}`, { method: "DELETE" });
        toast.success("Colonne supprimée");
      } catch (err) {
        mutate(); // rollback
        toast.error(err instanceof Error ? err.message : "Erreur");
      }
    },
    [setData, mutate]
  );

  return { fields, loading, addField, patchField, deleteField };
}
