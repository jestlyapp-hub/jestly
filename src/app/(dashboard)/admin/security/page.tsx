"use client";

import { useState, useEffect } from "react";
import AdminHeader from "@/components/admin/AdminHeader";
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  Mail,
  Lock,
  Users,
  Globe,
  Key,
  CheckCircle2,
  Circle,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";

// ── Types ────────────────────────────────────────────────────────
interface AuditEntry {
  id: string;
  actor_email: string;
  action: string;
  ip_address: string | null;
  result: string;
  created_at: string;
}

// ── Checklist items ──────────────────────────────────────────────
const securityChecklist = [
  { label: "Admin email vérifié côté serveur (requireAdmin)", done: true },
  { label: "Middleware auth sur routes protégées", done: true },
  { label: "RLS activé (47 tables, admin tables sans policy)", done: true },
  { label: "requireAdmin() unifié sur TOUTES les routes API admin", done: true },
  { label: "Audit logging des accès admin (accordé + refusé)", done: true },
  { label: "Audit logging des actions sensibles (notes, flags, emails)", done: true },
  { label: "noindex/nofollow sur pages admin", done: true },
  { label: "Cache-Control: no-store sur /admin/* et /api/*", done: true },
  { label: "Headers de sécurité (X-Frame-Options DENY, nosniff, etc.)", done: true },
  { label: "Rate limiting sur routes admin sensibles", done: true },
  { label: "Validation/sanitization inputs (ilike escape, UUID, sort whitelist)", done: true },
  { label: "Module sécurité admin centralisé (src/lib/admin/)", done: true },
  { label: "Tests de non-régression sécurité (41 tests)", done: true },
  { label: "ADMIN_USER_ID double vérification", done: false, note: "Variable env à configurer" },
  { label: "Stripe webhook signature verification", done: false, note: "Stripe non connecté" },
  { label: "Sentry error tracking", done: false, note: "Non configuré" },
];

// ── Recommandations ──────────────────────────────────────────────
const recommendations = [
  {
    title: "Configurer ADMIN_USER_ID",
    description:
      "Ajouter la variable d'env ADMIN_USER_ID avec l'UUID Supabase de jestlyapp@gmail.com. La double vérification email + ID sera activée automatiquement.",
    priority: "haute",
  },
  {
    title: "Activer Sentry",
    description:
      "Installer @sentry/nextjs pour capturer les erreurs en production et recevoir des alertes en temps réel.",
    priority: "moyenne",
  },
  {
    title: "Migrer rate limiting vers Redis",
    description:
      "Le rate limiting actuel est en mémoire (perdu au redémarrage). Migrer vers @upstash/ratelimit + Redis pour la persistance en production multi-instance.",
    priority: "moyenne",
  },
  {
    title: "Vérifier les signatures webhook Stripe",
    description:
      "Quand Stripe sera connecté, valider les signatures des webhooks avec stripe.webhooks.constructEvent().",
    priority: "moyenne",
  },
  {
    title: "Rotation des clés Supabase",
    description:
      "Planifier une rotation régulière de la service_role key et de l'anon key Supabase.",
    priority: "basse",
  },
];

const priorityColors: Record<string, { bg: string; text: string }> = {
  haute: { bg: "#FEF2F2", text: "#DC2626" },
  moyenne: { bg: "#FFFBEB", text: "#D97706" },
  basse: { bg: "#F0FDF4", text: "#16A34A" },
};

// ── Formatters ───────────────────────────────────────────────────
const fmtDateTime = (d: string) =>
  new Date(d).toLocaleString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

// ── Types status dynamique ────────────────────────────────────────
interface SecurityStatus {
  confidence: "production-ready" | "bon" | "a-corriger" | "critique";
  score: { done: number; total: number };
  admin_user_id_configured: boolean;
  denied_24h: number;
  total_audit_entries: number;
}

const confidenceConfig: Record<string, { label: string; color: string; bg: string }> = {
  "production-ready": { label: "Production-ready", color: "#16A34A", bg: "#F0FDF4" },
  "bon": { label: "Bon", color: "#4F46E5", bg: "#EEF2FF" },
  "a-corriger": { label: "À corriger", color: "#D97706", bg: "#FFFBEB" },
  "critique": { label: "Critique", color: "#DC2626", bg: "#FEF2F2" },
};

// ── Component ────────────────────────────────────────────────────
export default function AdminSecurityPage() {
  const [accessLogs, setAccessLogs] = useState<AuditEntry[]>([]);
  const [status, setStatus] = useState<SecurityStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/audit?limit=20&sort=created_at&order=desc").then((r) =>
        r.ok ? r.json() : Promise.reject()
      ),
      fetch("/api/admin/security").then((r) =>
        r.ok ? r.json() : Promise.reject()
      ),
    ])
      .then(([auditData, securityData]) => {
        const accessEntries = (auditData.data || []).filter(
          (e: AuditEntry) =>
            e.action === "admin_access_granted" ||
            e.action === "admin_access_denied" ||
            e.action === "access_granted" ||
            e.action === "access_denied"
        );
        setAccessLogs(accessEntries.slice(0, 20));
        setStatus(securityData);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  const doneCount = securityChecklist.filter((c) => c.done).length;
  const totalCount = securityChecklist.length;
  const scorePercent = Math.round((doneCount / totalCount) * 100);

  return (
    <div className="space-y-6">
      <AdminHeader
        title="Sécurité"
        section="Sécurité"
        description="Configuration et état de la sécurité de la plateforme"
      />

      {/* ── Section 0: Statut global dynamique ─────────────────── */}
      {status && (
        <div
          className="rounded-xl border p-4 flex items-center justify-between"
          style={{
            borderColor: confidenceConfig[status.confidence]?.color + "40",
            backgroundColor: confidenceConfig[status.confidence]?.bg,
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: confidenceConfig[status.confidence]?.color + "20" }}
            >
              {status.confidence === "production-ready" ? (
                <ShieldCheck size={20} style={{ color: confidenceConfig[status.confidence]?.color }} />
              ) : (
                <ShieldAlert size={20} style={{ color: confidenceConfig[status.confidence]?.color }} />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[14px] font-semibold text-[#191919]">
                  Niveau de confiance :
                </span>
                <span
                  className="text-[12px] font-bold uppercase px-2 py-0.5 rounded-md"
                  style={{
                    color: confidenceConfig[status.confidence]?.color,
                    backgroundColor: confidenceConfig[status.confidence]?.color + "15",
                  }}
                >
                  {confidenceConfig[status.confidence]?.label}
                </span>
              </div>
              <p className="text-[12px] text-[#5A5A58] mt-0.5">
                {status.score.done}/{status.score.total} contrôles actifs
                {status.denied_24h > 0 && (
                  <span className="text-[#DC2626] font-medium ml-2">
                    {status.denied_24h} accès refusé{status.denied_24h > 1 ? "s" : ""} (24h)
                  </span>
                )}
                {!status.admin_user_id_configured && (
                  <span className="text-[#D97706] font-medium ml-2">
                    ADMIN_USER_ID non configuré
                  </span>
                )}
              </p>
            </div>
          </div>
          <div className="text-[12px] text-[#8A8A88]">
            {status.total_audit_entries} entrées audit total
          </div>
        </div>
      )}

      {/* ── Alerte ADMIN_USER_ID ──────────────────────────────────── */}
      {status && !status.admin_user_id_configured && (
        <div className="rounded-xl border border-[#FCD34D] bg-[#FFFBEB] p-4 flex items-start gap-3">
          <AlertTriangle size={18} className="text-[#D97706] flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-[13px] font-semibold text-[#92400E]">
              ADMIN_USER_ID non configuré — double vérification inactive
            </p>
            <p className="text-[12px] text-[#A16207] mt-1">
              Seul l{"'"}email est vérifié actuellement. Pour activer la double sécurité (email + UUID),
              ajoutez la variable d{"'"}environnement <code className="bg-[#FEF3C7] px-1 rounded text-[11px] font-mono">ADMIN_USER_ID</code> avec
              l{"'"}UUID Supabase de jestlyapp@gmail.com. Le contrôle sera activé automatiquement au prochain déploiement.
            </p>
          </div>
        </div>
      )}

      {/* ── Section 1: Configuration actuelle ───────────────────── */}
      <div className="bg-white rounded-xl border border-[#E6E6E4] p-5">
        <h3 className="text-[14px] font-semibold text-[#191919] mb-4 flex items-center gap-2">
          <Shield size={16} strokeWidth={1.7} className="text-[#4F46E5]" />
          Configuration actuelle
        </h3>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            {
              icon: <Mail size={14} strokeWidth={1.7} />,
              label: "Admin email",
              value: "jestlyapp@gmail.com",
            },
            {
              icon: <Key size={14} strokeWidth={1.7} />,
              label: "Auth provider",
              value: "Supabase Auth",
            },
            {
              icon: <Lock size={14} strokeWidth={1.7} />,
              label: "RLS",
              value: "Activé sur toutes les tables",
            },
            {
              icon: <Shield size={14} strokeWidth={1.7} />,
              label: "Admin routes protégées",
              value: "/admin/* (layout + API)",
            },
            {
              icon: <Users size={14} strokeWidth={1.7} />,
              label: "Inscriptions",
              value: "Fermées (waitlist only)",
            },
            {
              icon: <Globe size={14} strokeWidth={1.7} />,
              label: "OAuth",
              value: "Désactivé",
            },
          ].map((item) => (
            <div
              key={item.label}
              className="flex items-start gap-3 p-3 rounded-lg bg-[#F7F7F5]"
            >
              <span className="text-[#8A8A88] mt-0.5 flex-shrink-0">
                {item.icon}
              </span>
              <div className="min-w-0">
                <p className="text-[11px] font-medium text-[#8A8A88] uppercase tracking-wide">
                  {item.label}
                </p>
                <p className="text-[13px] text-[#191919] mt-0.5">{item.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Section 2: Accès récents ────────────────────────────── */}
      <div className="bg-white rounded-xl border border-[#E6E6E4] p-5">
        <h3 className="text-[14px] font-semibold text-[#191919] mb-4 flex items-center gap-2">
          <ShieldCheck size={16} strokeWidth={1.7} className="text-[#4F46E5]" />
          Accès récents
        </h3>

        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="h-10 bg-[#F7F7F5] rounded-lg animate-pulse"
              />
            ))}
          </div>
        ) : error ? (
          <p className="text-[13px] text-[#8A8A88]">
            Erreur lors du chargement des logs d{"'"}accès.
          </p>
        ) : accessLogs.length === 0 ? (
          <p className="text-[13px] text-[#8A8A88]">
            Aucun log d{"'"}accès trouvé.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-[#E6E6E4]">
                  <th className="text-left py-2 pr-3 text-[#8A8A88] font-medium">
                    Date
                  </th>
                  <th className="text-left py-2 pr-3 text-[#8A8A88] font-medium">
                    Résultat
                  </th>
                  <th className="text-left py-2 pr-3 text-[#8A8A88] font-medium">
                    Email
                  </th>
                  <th className="text-left py-2 text-[#8A8A88] font-medium">
                    IP
                  </th>
                </tr>
              </thead>
              <tbody>
                {accessLogs.map((log) => {
                  const isDenied = log.action === "admin_access_denied";
                  return (
                    <tr
                      key={log.id}
                      className={`border-b border-[#EFEFEF] ${
                        isDenied ? "bg-[#FEF2F2]" : "hover:bg-[#FBFBFA]"
                      }`}
                    >
                      <td className="py-2 pr-3 text-[#5A5A58] whitespace-nowrap">
                        {fmtDateTime(log.created_at)}
                      </td>
                      <td className="py-2 pr-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 text-[11px] rounded-md font-medium ${
                            isDenied
                              ? "bg-[#FEE2E2] text-[#DC2626]"
                              : "bg-[#F0FDF4] text-[#16A34A]"
                          }`}
                        >
                          {isDenied ? (
                            <ShieldAlert size={10} />
                          ) : (
                            <ShieldCheck size={10} />
                          )}
                          {isDenied ? "Refusé" : "Autorisé"}
                        </span>
                      </td>
                      <td className="py-2 pr-3 text-[#191919] max-w-[200px] truncate">
                        {log.actor_email}
                      </td>
                      <td className="py-2 text-[#8A8A88] font-mono text-[12px]">
                        {log.ip_address || "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Section 3: Checklist sécurité ───────────────────────── */}
      <div className="bg-white rounded-xl border border-[#E6E6E4] p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[14px] font-semibold text-[#191919] flex items-center gap-2">
            <CheckCircle2
              size={16}
              strokeWidth={1.7}
              className="text-[#4F46E5]"
            />
            Checklist sécurité
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-[12px] text-[#5A5A58] font-medium">
              {doneCount}/{totalCount}
            </span>
            <div className="w-24 h-2 bg-[#F7F7F5] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${scorePercent}%`,
                  backgroundColor:
                    scorePercent >= 80
                      ? "#16A34A"
                      : scorePercent >= 50
                        ? "#D97706"
                        : "#DC2626",
                }}
              />
            </div>
          </div>
        </div>

        <div className="space-y-1">
          {securityChecklist.map((item) => (
            <div
              key={item.label}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg ${
                item.done ? "" : "bg-[#FFFBEB]/50"
              }`}
            >
              {item.done ? (
                <CheckCircle2
                  size={16}
                  strokeWidth={2}
                  className="text-[#16A34A] flex-shrink-0"
                />
              ) : (
                <Circle
                  size={16}
                  strokeWidth={2}
                  className="text-[#D97706] flex-shrink-0"
                />
              )}
              <span
                className={`text-[13px] flex-1 ${
                  item.done ? "text-[#5A5A58]" : "text-[#191919] font-medium"
                }`}
              >
                {item.label}
              </span>
              {item.note && (
                <span className="text-[11px] text-[#D97706] bg-[#FFFBEB] px-2 py-0.5 rounded-md">
                  {item.note}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── Section 4: Recommandations ──────────────────────────── */}
      <div className="bg-white rounded-xl border border-[#E6E6E4] p-5">
        <h3 className="text-[14px] font-semibold text-[#191919] mb-4 flex items-center gap-2">
          <AlertTriangle
            size={16}
            strokeWidth={1.7}
            className="text-[#D97706]"
          />
          Recommandations
        </h3>

        <div className="space-y-3">
          {recommendations.map((rec) => {
            const colors = priorityColors[rec.priority] || priorityColors.basse;
            return (
              <div
                key={rec.title}
                className="flex items-start gap-3 p-3 rounded-lg border border-[#EFEFEF] hover:bg-[#FBFBFA] transition-colors"
              >
                <ArrowRight
                  size={14}
                  strokeWidth={2}
                  className="text-[#8A8A88] mt-0.5 flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[13px] font-medium text-[#191919]">
                      {rec.title}
                    </span>
                    <span
                      className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded"
                      style={{
                        backgroundColor: colors.bg,
                        color: colors.text,
                      }}
                    >
                      {rec.priority}
                    </span>
                  </div>
                  <p className="text-[12px] text-[#5A5A58]">
                    {rec.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
