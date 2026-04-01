import type { Metadata } from "next";
import LandingHeader from "@/components/landing/LandingHeader";
import LandingFooter from "@/components/landing/LandingFooter";

export const metadata: Metadata = {
  title: "Tarifs — Jestly",
  description:
    "Découvrez les plans Jestly : Starter gratuit, Pro pour les freelances actifs, Business pour scaler.",
  openGraph: {
    title: "Tarifs — Jestly",
    description:
      "Découvrez les plans Jestly : Starter gratuit, Pro pour les freelances actifs, Business pour scaler.",
    siteName: "Jestly",
  },
};

export default function TarifsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <LandingHeader />
      {children}
      <LandingFooter />
    </>
  );
}
