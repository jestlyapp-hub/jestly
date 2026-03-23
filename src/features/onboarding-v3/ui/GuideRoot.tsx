"use client";

import { Component, type ReactNode } from "react";
import { GuideProvider } from "../engine/guide-engine";
import GuideOverlay from "./GuideOverlay";
import GuideLauncher from "./GuideLauncher";
import MissionSuccessModal from "./MissionSuccessModal";

class SafeGuard extends Component<{ children: ReactNode; name: string }, { err: boolean }> {
  state = { err: false };
  static getDerivedStateFromError() { return { err: true }; }
  componentDidCatch(e: Error) { console.warn(`[GuideV3] ${this.props.name} crashed:`, e.message); }
  render() { return this.state.err ? null : this.props.children; }
}

export default function GuideRoot({ children }: { children: ReactNode }) {
  return (
    <GuideProvider>
      {children}
      <SafeGuard name="GuideLauncher">
        <GuideLauncher />
      </SafeGuard>
      <SafeGuard name="GuideOverlay">
        <GuideOverlay />
      </SafeGuard>
      <SafeGuard name="MissionSuccessModal">
        <MissionSuccessModal />
      </SafeGuard>
    </GuideProvider>
  );
}
