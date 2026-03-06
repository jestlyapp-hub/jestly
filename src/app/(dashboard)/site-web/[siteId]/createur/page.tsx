"use client";

import { useState, useEffect } from "react";
import { BuilderProvider } from "@/lib/site-builder-context";
import { ProductProvider } from "@/lib/product-context";
import type { Product } from "@/types";
import BuilderToolbar from "@/components/site-web/builder/BuilderToolbar";
import BuilderPageList from "@/components/site-web/builder/BuilderPageList";
import BuilderCanvas from "@/components/site-web/builder/BuilderCanvas";
import BuilderPropertyPanel from "@/components/site-web/builder/BuilderPropertyPanel";
import ThemeEditorPanel from "@/components/site-web/builder/ThemeEditorPanel";
import NavFooterEditorPanel from "@/components/site-web/builder/NavFooterEditorPanel";

type RightPanel = "inspector" | "theme" | "nav";

function useBuilderProducts(): Product[] {
  const [products, setProducts] = useState<Product[]>([]);
  useEffect(() => {
    fetch("/api/products")
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setProducts(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);
  return products;
}

function BuilderLayout() {
  const [activePanel, setActivePanel] = useState<RightPanel>("inspector");

  const handlePanelChange = (panel: RightPanel) => {
    setActivePanel((prev) => (prev === panel ? "inspector" : panel));
  };

  return (
    <div className="flex flex-col h-[calc(100vh-180px)] -mx-6 -mb-6 border-t border-[#E6E6E4] rounded-t-xl overflow-hidden bg-white">
      <BuilderToolbar activePanel={activePanel} onPanelChange={handlePanelChange} />
      <div className="flex flex-1 overflow-hidden">
        <BuilderPageList />
        <BuilderCanvas />
        {activePanel === "theme" ? (
          <ThemeEditorPanel onClose={() => setActivePanel("inspector")} />
        ) : activePanel === "nav" ? (
          <NavFooterEditorPanel onClose={() => setActivePanel("inspector")} />
        ) : (
          <BuilderPropertyPanel />
        )}
      </div>
    </div>
  );
}

export default function CreateurPage() {
  const products = useBuilderProducts();

  return (
    <BuilderProvider>
      <ProductProvider products={products}>
        <BuilderLayout />
      </ProductProvider>
    </BuilderProvider>
  );
}
