export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white">
      <nav className="border-b border-[#E6E6E4] px-6 py-4">
        <a href="/" className="text-[15px] font-bold text-[#1A1A1A]">
          Jestly
        </a>
      </nav>
      <main className="px-4 py-12">{children}</main>
    </div>
  );
}
