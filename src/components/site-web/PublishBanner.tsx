"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSite } from "@/lib/hooks/use-site";
import { toast } from "@/lib/hooks/use-toast";
import { getSitePublicUrl } from "@/lib/site-url-helpers";
import {
  Rocket,
  ExternalLink,
  Copy,
  Check,
  Share2,
  X,
  Globe,
  Loader2,
  PartyPopper,
} from "lucide-react";

// ═══════════════════════════════════════
// SUCCESS MODAL
// ═══════════════════════════════════════

function PublishSuccessModal({
  url,
  onClose,
}: {
  url: string;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success("Lien copié !");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: "Mon site Jestly", url });
      } catch {}
    } else {
      handleCopy();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/20 backdrop-blur-[2px]"
        onClick={onClose}
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        transition={{ type: "spring", stiffness: 350, damping: 30 }}
        className="relative bg-white rounded-2xl border border-[#E6E6E4] shadow-2xl w-full max-w-md mx-4 overflow-hidden"
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-[#F7F7F5] transition-colors cursor-pointer z-10"
        >
          <X size={16} className="text-[#AAA]" />
        </button>

        {/* Content */}
        <div className="px-8 pt-8 pb-6 text-center">
          {/* Celebration icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 15, delay: 0.15 }}
            className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-200/50"
          >
            <PartyPopper size={28} className="text-white" strokeWidth={1.7} />
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="text-[20px] font-bold text-[#191919] mb-2"
          >
            Ton site est en ligne !
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35 }}
            className="text-[13px] text-[#8A8A88] mb-5"
          >
            Voici ton lien public :
          </motion.p>

          {/* URL display */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-[#F7F7F5] border border-[#E6E6E4] rounded-xl px-4 py-3 mb-6 flex items-center gap-3"
          >
            <Globe size={16} className="text-[#4F46E5] flex-shrink-0" />
            <span className="text-[14px] font-medium text-[#191919] truncate flex-1 text-left">
              {url}
            </span>
          </motion.div>

          {/* Action buttons */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex gap-2"
          >
            <button
              onClick={handleCopy}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-[#E6E6E4] text-[13px] font-medium text-[#44403C] hover:bg-[#F7F7F5] transition-colors cursor-pointer"
            >
              {copied ? <Check size={15} className="text-emerald-500" /> : <Copy size={15} />}
              {copied ? "Copié !" : "Copier le lien"}
            </button>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#4F46E5] text-white text-[13px] font-semibold hover:bg-[#4338CA] transition-colors"
            >
              <ExternalLink size={15} />
              Ouvrir le site
            </a>
            <button
              onClick={handleShare}
              className="w-10 flex items-center justify-center rounded-xl border border-[#E6E6E4] text-[#8A8A88] hover:bg-[#F7F7F5] hover:text-[#5A5A58] transition-colors cursor-pointer"
              title="Partager"
            >
              <Share2 size={15} />
            </button>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ═══════════════════════════════════════
// MAIN BANNER
// ═══════════════════════════════════════

export default function PublishBanner() {
  const { site, siteId, mutate } = useSite();
  const [publishing, setPublishing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [publishedUrl, setPublishedUrl] = useState("");

  const isDraft = site.status !== "published";
  const hasSubdomain = !!site.domain.subdomain;

  const handlePublish = useCallback(async () => {
    if (publishing || !hasSubdomain) return;
    setPublishing(true);
    try {
      const res = await fetch(`/api/sites/${siteId}/publish`, { method: "POST" });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Erreur ${res.status}`);
      }
      await mutate();
      const url = getSitePublicUrl({
        id: siteId,
        slug: site.domain.subdomain,
        status: "published",
        custom_domain: site.domain.customDomain || null,
      });
      setPublishedUrl(url || "");
      setShowSuccess(true);
      toast.success("Site publié !");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur lors de la publication");
    } finally {
      setPublishing(false);
    }
  }, [publishing, hasSubdomain, siteId, site.domain, mutate]);

  // Ne rien afficher si le site est déjà publié
  if (!isDraft) return null;

  return (
    <>
      {/* ── Sticky publish banner ── */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-5 bg-gradient-to-r from-[#4F46E5] to-[#6366F1] rounded-xl px-5 py-3.5 flex items-center justify-between gap-4 shadow-sm"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center flex-shrink-0">
            <Rocket size={16} className="text-white" strokeWidth={1.8} />
          </div>
          <div className="min-w-0">
            <p className="text-[13px] font-semibold text-white">
              Votre site est prêt — publiez-le en 1 clic
            </p>
            <p className="text-[11px] text-white/60">
              Il sera accessible sur jestly.fr/s/{site.domain.subdomain || "..."}
            </p>
          </div>
        </div>
        <motion.button
          onClick={handlePublish}
          disabled={publishing || !hasSubdomain}
          whileHover={publishing ? undefined : { scale: 1.03 }}
          whileTap={publishing ? undefined : { scale: 0.97 }}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white text-[#4F46E5] text-[13px] font-bold hover:bg-white/90 disabled:opacity-60 disabled:cursor-not-allowed transition-all cursor-pointer flex-shrink-0 shadow-sm"
        >
          {publishing ? (
            <Loader2 size={15} className="animate-spin" />
          ) : (
            <Rocket size={15} strokeWidth={2} />
          )}
          {publishing ? "Publication..." : "Publier mon site"}
        </motion.button>
      </motion.div>

      {/* ── Success modal ── */}
      <AnimatePresence>
        {showSuccess && publishedUrl && (
          <PublishSuccessModal
            url={publishedUrl}
            onClose={() => setShowSuccess(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
