import AuthPanel from "@/components/auth/AuthPanel";
import AuthShowcase from "@/components/auth/AuthShowcase";
import Link from "next/link";

export const metadata = {
  title: "Jestly — Connexion",
  description: "Connectez-vous ou créez votre espace Jestly.",
};

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#FAFAF8] flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-6 lg:px-10 py-4 border-b border-[#E6E6E4] bg-white">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#4F46E5] flex items-center justify-center">
            <span className="text-white text-[12px] font-bold">J</span>
          </div>
          <span className="text-[16px] font-bold text-[#111]">Jestly</span>
        </Link>
      </header>

      {/* Main — 12-col grid */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-12">
        {/* Left — Auth panel (5/12) */}
        <div className="lg:col-span-5 bg-white border-r border-[#E6E6E4] min-h-[calc(100vh-57px)]">
          <AuthPanel />
        </div>

        {/* Right — Showcase (7/12) */}
        <div className="hidden lg:block lg:col-span-7 bg-[#FAFAF8] min-h-[calc(100vh-57px)]">
          <AuthShowcase />
        </div>
      </main>
    </div>
  );
}
