"use client";

import { BuilderProvider } from "@/lib/site-builder-context";
import BuilderToolbar from "@/components/site-web/builder/BuilderToolbar";
import BuilderPageList from "@/components/site-web/builder/BuilderPageList";
import BuilderCanvas from "@/components/site-web/builder/BuilderCanvas";
import BuilderPropertyPanel from "@/components/site-web/builder/BuilderPropertyPanel";

export default function CreateurPage() {
  return (
    <BuilderProvider>
      <div className="flex flex-col h-[calc(100vh-180px)] -mx-6 -mb-6 border-t border-[#E6E8F0] rounded-t-xl overflow-hidden bg-white">
        <BuilderToolbar />
        <div className="flex flex-1 overflow-hidden">
          <BuilderPageList />
          <BuilderCanvas />
          <BuilderPropertyPanel />
        </div>
      </div>
    </BuilderProvider>
  );
}
