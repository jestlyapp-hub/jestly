import Navbar from "@/components/Navbar";
import Hero from "@/sections/Hero";
import Features from "@/sections/Features";
import Workflow from "@/sections/Workflow";
import Pricing from "@/sections/Pricing";
import Faq from "@/sections/Faq";
import FinalCta from "@/sections/FinalCta";
import Footer from "@/sections/Footer";

export default function Home() {
  return (
    <main className="relative">
      {/* Noise texture globale */}
      <div className="noise-overlay" />

      <Navbar />
      <Hero />
      <Features />
      <Workflow />
      <Pricing />
      <Faq />
      <FinalCta />
      <Footer />
    </main>
  );
}
