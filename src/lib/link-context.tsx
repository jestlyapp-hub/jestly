"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { Site } from "@/types";

interface LinkContextValue {
  site: Site;
}

const LinkContext = createContext<LinkContextValue | null>(null);

export function LinkProvider({ site, children }: { site: Site; children: ReactNode }) {
  return <LinkContext.Provider value={{ site }}>{children}</LinkContext.Provider>;
}

export function useLinkContext(): LinkContextValue | null {
  return useContext(LinkContext);
}
