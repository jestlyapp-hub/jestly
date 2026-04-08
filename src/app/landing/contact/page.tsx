"use client";

import { useState } from "react";
import Link from "next/link";

export default function ContactPage() {
  const [status, setStatus] = useState<"idle" | "sending" | "ok" | "error">("idle");
  const [error, setError] = useState("");

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("sending");
    setError("");
    const fd = new FormData(e.currentTarget);
    const payload = {
      name: String(fd.get("name") || "").trim(),
      email: String(fd.get("email") || "").trim(),
      subject: String(fd.get("subject") || "").trim(),
      message: String(fd.get("message") || "").trim(),
      source: "contact-page",
    };
    if (!payload.name || !payload.email || !payload.message) {
      setStatus("error");
      setError("Merci de renseigner votre nom, votre email et votre message.");
      return;
    }
    try {
      const res = await fetch("/api/public/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("send-failed");
      setStatus("ok");
      (e.target as HTMLFormElement).reset();
    } catch {
      setStatus("error");
      setError("Impossible d'envoyer votre message. Réessayez ou écrivez à support@jestly.fr.");
    }
  };

  return (
    <main id="main" className="min-h-screen bg-white text-[#191919]">
      <section className="max-w-3xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <span className="inline-block text-[11px] font-semibold tracking-wider uppercase text-[#7C3AED] bg-[#F3EEFF] border border-[#E5D9FF] rounded-full px-3 py-1 mb-4">
            Contact
          </span>
          <h1 className="text-[40px] sm:text-[48px] font-extrabold tracking-[-0.03em] leading-[1.05] mb-4">
            Une question ? Parlons-en.
          </h1>
          <p className="text-[16px] text-[#5A5A58] max-w-xl mx-auto leading-relaxed">
            Que vous soyez freelance, agence ou simplement curieux de Jestly, l&apos;équipe
            répond généralement sous <strong>24 h ouvrées</strong>.
          </p>
        </div>

        <div className="grid sm:grid-cols-3 gap-3 mb-10">
          <a
            href="mailto:support@jestly.fr"
            className="rounded-xl border border-[#E6E6E4] bg-[#FAFAF9] p-4 hover:border-[#7C3AED]/40 transition-colors"
          >
            <div className="text-[11px] font-semibold uppercase tracking-wider text-[#8A8A88] mb-1">
              Email support
            </div>
            <div className="text-[14px] font-semibold text-[#191919]">support@jestly.fr</div>
          </a>
          <Link
            href="/centre-aide"
            className="rounded-xl border border-[#E6E6E4] bg-[#FAFAF9] p-4 hover:border-[#7C3AED]/40 transition-colors"
          >
            <div className="text-[11px] font-semibold uppercase tracking-wider text-[#8A8A88] mb-1">
              Centre d&apos;aide
            </div>
            <div className="text-[14px] font-semibold text-[#191919]">Articles & guides</div>
          </Link>
          <a
            href="https://discord.gg/hnfkDJQKUU"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-xl border border-[#E6E6E4] bg-[#FAFAF9] p-4 hover:border-[#7C3AED]/40 transition-colors"
          >
            <div className="text-[11px] font-semibold uppercase tracking-wider text-[#8A8A88] mb-1">
              Communauté
            </div>
            <div className="text-[14px] font-semibold text-[#191919]">Discord Jestly</div>
          </a>
        </div>

        <form
          onSubmit={onSubmit}
          className="bg-white rounded-2xl border border-[#E6E6E4] p-6 sm:p-8 shadow-sm space-y-5"
        >
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="contact-name" className="block text-[12px] font-semibold text-[#5A5A58] mb-1.5">
                Votre nom
              </label>
              <input
                id="contact-name"
                name="name"
                type="text"
                required
                autoComplete="name"
                className="w-full h-[44px] rounded-xl border border-[#E6E6E4] bg-[#FAFAF9] px-3 text-[14px] focus:outline-none focus:border-[#7C3AED]/40 focus:ring-2 focus:ring-[#7C3AED]/10"
              />
            </div>
            <div>
              <label htmlFor="contact-email" className="block text-[12px] font-semibold text-[#5A5A58] mb-1.5">
                Votre email
              </label>
              <input
                id="contact-email"
                name="email"
                type="email"
                required
                autoComplete="email"
                className="w-full h-[44px] rounded-xl border border-[#E6E6E4] bg-[#FAFAF9] px-3 text-[14px] focus:outline-none focus:border-[#7C3AED]/40 focus:ring-2 focus:ring-[#7C3AED]/10"
              />
            </div>
          </div>
          <div>
            <label htmlFor="contact-subject" className="block text-[12px] font-semibold text-[#5A5A58] mb-1.5">
              Sujet (optionnel)
            </label>
            <input
              id="contact-subject"
              name="subject"
              type="text"
              className="w-full h-[44px] rounded-xl border border-[#E6E6E4] bg-[#FAFAF9] px-3 text-[14px] focus:outline-none focus:border-[#7C3AED]/40 focus:ring-2 focus:ring-[#7C3AED]/10"
            />
          </div>
          <div>
            <label htmlFor="contact-message" className="block text-[12px] font-semibold text-[#5A5A58] mb-1.5">
              Votre message
            </label>
            <textarea
              id="contact-message"
              name="message"
              required
              rows={6}
              className="w-full rounded-xl border border-[#E6E6E4] bg-[#FAFAF9] px-3 py-2.5 text-[14px] focus:outline-none focus:border-[#7C3AED]/40 focus:ring-2 focus:ring-[#7C3AED]/10"
            />
          </div>

          {status === "ok" && (
            <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-[13px] text-emerald-700">
              Message envoyé. L&apos;équipe Jestly revient vers vous sous 24 h ouvrées.
            </div>
          )}
          {status === "error" && error && (
            <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-[13px] text-red-700">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={status === "sending"}
            className="w-full h-[48px] rounded-xl text-[14px] font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: "linear-gradient(135deg, #7C3AED, #A78BFA)",
              boxShadow: "0 6px 24px rgba(124,58,237,0.25)",
            }}
          >
            {status === "sending" ? "Envoi…" : "Envoyer le message"}
          </button>

          <p className="text-[11px] text-[#8A8A88] text-center">
            En envoyant ce formulaire, vous acceptez notre{" "}
            <Link href="/confidentialite" className="underline hover:text-[#7C3AED]">
              politique de confidentialité
            </Link>
            .
          </p>
        </form>
      </section>
    </main>
  );
}
