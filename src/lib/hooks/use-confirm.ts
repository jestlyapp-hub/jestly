"use client";

import { useState, useCallback } from "react";

interface ConfirmState {
  title: string;
  message: string;
  variant?: "danger" | "default";
  confirmLabel?: string;
  resolve: (value: boolean) => void;
}

interface ConfirmOptions {
  title: string;
  message: string;
  variant?: "danger" | "default";
  confirmLabel?: string;
}

export function useConfirm() {
  const [state, setState] = useState<ConfirmState | null>(null);

  const confirm = useCallback((opts: ConfirmOptions): Promise<boolean> => {
    return new Promise<boolean>((resolve) => {
      setState({ ...opts, resolve });
    });
  }, []);

  const dialogProps = state
    ? {
        open: true as const,
        title: state.title,
        message: state.message,
        variant: state.variant,
        confirmLabel: state.confirmLabel,
        onConfirm: () => {
          state.resolve(true);
          setState(null);
        },
        onCancel: () => {
          state.resolve(false);
          setState(null);
        },
      }
    : {
        open: false as const,
        title: "",
        message: "",
        onConfirm: () => {},
        onCancel: () => {},
      };

  return { confirm, dialogProps };
}
