"use client";

import { useState, useEffect } from "react";
import AdminHeader from "@/components/admin/AdminHeader";
import {
  AlertTriangle,
  Activity,
  MailX,
  ScrollText,
  ExternalLink,
  BarChart3,
  Wifi,
  FileText,
  Bug,
  ShieldAlert,
  Users,
  Flame,
} from "lucide-react";

// ── Types ────────────────────────────────────────────────────────
interface AuditEntry {
  id: string;
  actor_email: string;
  action: string;
  target_type: string | null;
  target_id: string | null;
  metadata: Record<string, unknown> | null;
  ip_address: string | null;
  result: string;
  created_at: string;
}

interface FailedEmail {
  id: string;
  recipient_email: string;
  subject: string | null;
  status: string;
  error_message: string | null;
  created_at: string;
}

interface SentryIssue {
  id: string;
  title: string;
  culprit: string;
  shortId: string;
  count: string;
  userCount: number;
  firstSeen: string;
  lastSeen: string;
  level: string;
  status: string;
  permalink: string;
  metadata: { type?: string; value?: string; filename?: string };
}

interface SentryStats {
  total_issues_24h: number;
  total_events_24h: number;
  unresolved_issues: number;
  top_issues: SentryIssue[];
  affected_users_24h: number;
}

interface IncidentsData {
  audit_logs: AuditEntry[];
  audit_total: number;
  failed_emails: FailedEmail[];
  failed_emails_total: number;
  sentry_connected: boolean;
  sentry: SentryStats | null;
}

// ── Setup cards (affichées uniquement si Sentry non connecté) ────
const setupCards = [
  {
    title: "Sentry",
    icon: <Bug size={20} strokeWidth={1.7} />,
    description:
      "Error tracking, performance monitoring et release tracking. Ajoutez NEXT_PUBLIC_SENTRY_DSN, SENTRY_AUTH_TOKEN, SENTRY_ORG, SENTRY_PROJECT dans vos variables d'environnement.",
    link: "https://sentry.io",
    color: "#362D59",
  },
  {
    title: "Vercel Analytics",
    icon: <BarChart3 size={20} strokeWidth={1.7} />,
    description:
      "Performance en temps réel, Web Vitals, et métriques de navigation. Intégré nativement à Next.js.",
    link: "https://vercel.com/analytics",
    color: "#000000",
  },
  {
    title: "Uptime monitor",
    icon: <Wifi size={20} strokeWidth={1.7} />,
    description:
      "Suivi de la disponibilité de jestly.fr avec alertes par email/SMS en cas de downtime. Ex: UptimeRobot, BetterStack.",
    link: "https://betterstack.com/uptime",
    color: "#16A34A",
  },
  {
    title: "Log drain",
    icon: <FileText size={20} strokeWidth={1.7} />,
    description:
      "Centralisation des logs Vercel vers un service externe (Datadog, Axiom, Logtail) pour analyse et alerting.",
    link: "https://vercel.com/docs/observability/log-drains",
    color: "#4F46E5",
  },
];

// ── Formatters ───────────────────────────────────────────────────
const fmtDateTime = (d: string) =>
  new Date(d).toLocaleString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

const fmtRelative = (d: string) => {
  const diff = Date.now() - new Date(d).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "< 1 min";
  if (mins < 60) return `${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}j`;
};

const actionLabels: Record<string, string> = {
  admin_access_granted: "Accès admin autorisé",
  admin_access_denied: "Accès admin refusé",
  user_update: "Modification utilisateur",
  user_delete: "Suppression utilisateur",
  waitlist_email_sent: "Email waitlist envoyé",
  waitlist_status_update: "Statut waitlist modifié",
};

const resultColors: Record<string, { bg: string; text: string }> = {
  success: { bg: "#F0FDF4", text: "#16A34A" },
  denied: { bg: "#FEF2F2", text: "#DC2626" },
  error: { bg: "#FEF2F2", text: "#DC2626" },
};

// Badges de niveau Sentry
const levelBadge: Record<string, { bg: string; text: string; label: string }> = {
  fatal: { bg: "#7F1D1D", text: "#FFFFFF", label: "Fatal" },
  error: { bg: "#FEF2F2", text: "#DC2626", label: "Error" },
  warning: { bg: "#FFFBEB", text: "#D97706", label: "Warning" },
  info: { bg: "#EFF6FF", text: "#2563EB", label: "Info" },
};

// ── Component ────────────────────────────────────────────────────
export default function AdminIncidentsPage() {
  const [data, setData] = useState<IncidentsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch("/api/admin/incidents")
      .then((r) => {
        if (!r.ok) throw new Error("fetch failed");
        return r.json();
      })
      .then((d) => setData(d))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  // ── Loading skeleton ──────────────────────────────────────────
  if (loading) {
    return (
      <div className="space-y-6">
        <AdminHeader title="Incidents & Logs" section="Incidents" description="Chargement..." />
        <div className="h-16 bg-[#FFFBEB] rounded-xl animate-pulse" />
        <div className="bg-white rounded-xl border border-[#E6E6E4] p-5 h-64 animate-pulse" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <AdminHeader title="Incidents & Logs" section="Incidents" />
        <p className="text-sm text-[#8A8A88] p-8">
          Erreur de chargement des données.
        </p>
      </div>
    );
  }

  const sentryConnected = data?.sentry_connected ?? false;
  const sentry = data?.sentry ?? null;

  return (
    <div className="space-y-6">
      <AdminHeader
        title="Incidents & Logs"
        section="Incidents"
        description="Observabilité et suivi des erreurs"
      />

      {/* ── Alert banner (si Sentry non connecté) ─────────────────── */}
      {!sentryConnected && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-[#FFFBEB] border border-[#FDE68A]">
          <AlertTriangle
            size={18}
            strokeWidth={2}
            className="text-[#D97706] flex-shrink-0 mt-0.5"
          />
          <div>
            <p className="text-[13px] font-medium text-[#92400E]">
              Sentry n{"'"}est pas configuré
            </p>
            <p className="text-[12px] text-[#A16207] mt-0.5">
              Ajoutez <code className="bg-[#FEF3C7] px-1 rounded text-[11px]">NEXT_PUBLIC_SENTRY_DSN</code>,{" "}
              <code className="bg-[#FEF3C7] px-1 rounded text-[11px]">SENTRY_AUTH_TOKEN</code>,{" "}
              <code className="bg-[#FEF3C7] px-1 rounded text-[11px]">SENTRY_ORG</code>,{" "}
              <code className="bg-[#FEF3C7] px-1 rounded text-[11px]">SENTRY_PROJECT</code>{" "}
              dans vos variables d{"'"}environnement pour activer le suivi des erreurs.
            </p>
          </div>
        </div>
      )}

      {/* ── Sentry connected banner ──────────────────────────────── */}
      {sentryConnected && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-[#F0FDF4] border border-[#BBF7D0]">
          <Bug
            size={18}
            strokeWidth={2}
            className="text-[#16A34A] flex-shrink-0 mt-0.5"
          />
          <div>
            <p className="text-[13px] font-medium text-[#166534]">
              Sentry est connecté
            </p>
            <p className="text-[12px] text-[#15803D] mt-0.5">
              Le suivi des erreurs est actif. Les incidents sont remontés automatiquement.
            </p>
          </div>
        </div>
      )}

      {/* ── KPI row ─────────────────────────────────────────────── */}
      {data && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-[#E6E6E4] p-4">
            <p className="text-[11px] font-medium text-[#8A8A88] uppercase tracking-wide mb-1">
              Entrées audit
            </p>
            <p className="text-[22px] font-bold text-[#191919]">
              {data.audit_total.toLocaleString("fr-FR")}
            </p>
          </div>
          <div className="bg-white rounded-xl border border-[#E6E6E4] p-4">
            <p className="text-[11px] font-medium text-[#8A8A88] uppercase tracking-wide mb-1">
              Emails échoués
            </p>
            <p className={`text-[22px] font-bold ${data.failed_emails_total > 0 ? "text-[#DC2626]" : "text-[#191919]"}`}>
              {data.failed_emails_total.toLocaleString("fr-FR")}
            </p>
          </div>

          {/* KPIs Sentry dynamiques */}
          {sentryConnected && sentry ? (
            <>
              <div className="bg-white rounded-xl border border-[#E6E6E4] p-4">
                <p className="text-[11px] font-medium text-[#8A8A88] uppercase tracking-wide mb-1 flex items-center gap-1">
                  <Flame size={12} strokeWidth={2} />
                  Erreurs 24h
                </p>
                <p className={`text-[22px] font-bold ${sentry.total_issues_24h > 0 ? "text-[#DC2626]" : "text-[#191919]"}`}>
                  {sentry.total_issues_24h}
                </p>
                <p className="text-[11px] text-[#8A8A88] mt-0.5">
                  {sentry.total_events_24h} events
                </p>
              </div>
              <div className="bg-white rounded-xl border border-[#E6E6E4] p-4">
                <p className="text-[11px] font-medium text-[#8A8A88] uppercase tracking-wide mb-1 flex items-center gap-1">
                  <ShieldAlert size={12} strokeWidth={2} />
                  Non résolues
                </p>
                <p className={`text-[22px] font-bold ${sentry.unresolved_issues > 0 ? "text-[#D97706]" : "text-[#191919]"}`}>
                  {sentry.unresolved_issues}
                </p>
                <p className="text-[11px] text-[#8A8A88] mt-0.5 flex items-center gap-1">
                  <Users size={10} strokeWidth={2} />
                  {sentry.affected_users_24h} utilisateurs impactés
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="bg-white rounded-xl border border-[#E6E6E4] p-4">
                <p className="text-[11px] font-medium text-[#8A8A88] uppercase tracking-wide mb-1">
                  Error tracking
                </p>
                <p className="text-[13px] font-medium text-[#D97706] mt-1">
                  Non configuré
                </p>
              </div>
              <div className="bg-white rounded-xl border border-[#E6E6E4] p-4">
                <p className="text-[11px] font-medium text-[#8A8A88] uppercase tracking-wide mb-1">
                  Uptime monitor
                </p>
                <p className="text-[13px] font-medium text-[#D97706] mt-1">
                  Non configuré
                </p>
              </div>
            </>
          )}
        </div>
      )}

      {/* ── Sentry top issues ─────────────────────────────────────── */}
      {sentryConnected && sentry && sentry.top_issues.length > 0 && (
        <div className="bg-white rounded-xl border border-[#E6E6E4] p-5">
          <h3 className="text-[14px] font-semibold text-[#191919] mb-4 flex items-center gap-2">
            <Bug size={16} strokeWidth={1.7} className="text-[#362D59]" />
            Top issues Sentry
            <span className="text-[11px] text-[#8A8A88] font-normal ml-1">
              ({sentry.unresolved_issues} non résolues)
            </span>
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-[#E6E6E4]">
                  <th className="text-left py-2 pr-3 text-[#8A8A88] font-medium">
                    Titre
                  </th>
                  <th className="text-left py-2 pr-3 text-[#8A8A88] font-medium">
                    Niveau
                  </th>
                  <th className="text-right py-2 pr-3 text-[#8A8A88] font-medium">
                    Events
                  </th>
                  <th className="text-right py-2 pr-3 text-[#8A8A88] font-medium">
                    Utilisateurs
                  </th>
                  <th className="text-left py-2 pr-3 text-[#8A8A88] font-medium">
                    Dernière vue
                  </th>
                  <th className="text-left py-2 text-[#8A8A88] font-medium">
                    Lien
                  </th>
                </tr>
              </thead>
              <tbody>
                {sentry.top_issues.map((issue) => {
                  const badge = levelBadge[issue.level] || levelBadge.error;
                  return (
                    <tr
                      key={issue.id}
                      className="border-b border-[#EFEFEF] hover:bg-[#FBFBFA]"
                    >
                      <td className="py-2 pr-3 text-[#191919] max-w-[300px]">
                        <span className="block truncate font-medium">
                          {issue.title}
                        </span>
                        {issue.culprit && (
                          <span className="block truncate text-[11px] text-[#8A8A88]">
                            {issue.culprit}
                          </span>
                        )}
                      </td>
                      <td className="py-2 pr-3">
                        <span
                          className="inline-block px-2 py-0.5 text-[11px] rounded-md font-medium"
                          style={{
                            backgroundColor: badge.bg,
                            color: badge.text,
                          }}
                        >
                          {badge.label}
                        </span>
                      </td>
                      <td className="py-2 pr-3 text-right text-[#191919] font-medium tabular-nums">
                        {parseInt(issue.count || "0").toLocaleString("fr-FR")}
                      </td>
                      <td className="py-2 pr-3 text-right text-[#5A5A58] tabular-nums">
                        {(issue.userCount || 0).toLocaleString("fr-FR")}
                      </td>
                      <td className="py-2 pr-3 text-[#5A5A58] whitespace-nowrap">
                        {fmtRelative(issue.lastSeen)}
                      </td>
                      <td className="py-2">
                        <a
                          href={issue.permalink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[12px] font-medium text-[#4F46E5] hover:text-[#4338CA] transition-colors"
                        >
                          Voir
                          <ExternalLink size={11} strokeWidth={2} />
                        </a>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Recent audit logs ───────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-[#E6E6E4] p-5">
        <h3 className="text-[14px] font-semibold text-[#191919] mb-4 flex items-center gap-2">
          <ScrollText size={16} strokeWidth={1.7} className="text-[#4F46E5]" />
          Logs d{"'"}audit récents
          <span className="text-[11px] text-[#8A8A88] font-normal ml-1">
            (dernières 50 entrées)
          </span>
        </h3>

        {data && data.audit_logs.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-[#E6E6E4]">
                  <th className="text-left py-2 pr-3 text-[#8A8A88] font-medium">
                    Date
                  </th>
                  <th className="text-left py-2 pr-3 text-[#8A8A88] font-medium">
                    Action
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
                {data.audit_logs.map((log) => {
                  const colors = resultColors[log.result] || {
                    bg: "#F7F7F5",
                    text: "#5A5A58",
                  };
                  return (
                    <tr
                      key={log.id}
                      className={`border-b border-[#EFEFEF] ${
                        log.result === "denied"
                          ? "bg-[#FEF2F2]/50"
                          : "hover:bg-[#FBFBFA]"
                      }`}
                    >
                      <td className="py-2 pr-3 text-[#5A5A58] whitespace-nowrap">
                        {fmtDateTime(log.created_at)}
                      </td>
                      <td className="py-2 pr-3 text-[#191919]">
                        {actionLabels[log.action] || log.action}
                      </td>
                      <td className="py-2 pr-3">
                        <span
                          className="inline-block px-2 py-0.5 text-[11px] rounded-md font-medium"
                          style={{
                            backgroundColor: colors.bg,
                            color: colors.text,
                          }}
                        >
                          {log.result}
                        </span>
                      </td>
                      <td className="py-2 pr-3 text-[#5A5A58] max-w-[180px] truncate">
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
        ) : (
          <p className="text-[13px] text-[#8A8A88]">
            Aucun log d{"'"}audit disponible.
          </p>
        )}
      </div>

      {/* ── Failed emails ───────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-[#E6E6E4] p-5">
        <h3 className="text-[14px] font-semibold text-[#191919] mb-4 flex items-center gap-2">
          <MailX size={16} strokeWidth={1.7} className="text-[#DC2626]" />
          Emails échoués
          {data && data.failed_emails_total > 0 && (
            <span className="text-[11px] text-[#DC2626] bg-[#FEF2F2] px-2 py-0.5 rounded-md font-medium ml-1">
              {data.failed_emails_total}
            </span>
          )}
        </h3>

        {data && data.failed_emails.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-[#E6E6E4]">
                  <th className="text-left py-2 pr-3 text-[#8A8A88] font-medium">
                    Date
                  </th>
                  <th className="text-left py-2 pr-3 text-[#8A8A88] font-medium">
                    Destinataire
                  </th>
                  <th className="text-left py-2 pr-3 text-[#8A8A88] font-medium">
                    Sujet
                  </th>
                  <th className="text-left py-2 text-[#8A8A88] font-medium">
                    Erreur
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.failed_emails.map((email) => (
                  <tr
                    key={email.id}
                    className="border-b border-[#EFEFEF] hover:bg-[#FBFBFA]"
                  >
                    <td className="py-2 pr-3 text-[#5A5A58] whitespace-nowrap">
                      {fmtDateTime(email.created_at)}
                    </td>
                    <td className="py-2 pr-3 text-[#191919] max-w-[200px] truncate">
                      {email.recipient_email}
                    </td>
                    <td className="py-2 pr-3 text-[#5A5A58] max-w-[200px] truncate">
                      {email.subject || "—"}
                    </td>
                    <td className="py-2 text-[#DC2626] text-[12px] max-w-[250px] truncate">
                      {email.error_message || "Erreur inconnue"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-[13px] text-[#8A8A88]">
            Aucun email échoué.
          </p>
        )}
      </div>

      {/* ── Setup guide (outils non encore configurés) ────────────── */}
      <div>
        <h3 className="text-[14px] font-semibold text-[#191919] mb-4 flex items-center gap-2">
          <Activity size={16} strokeWidth={1.7} className="text-[#4F46E5]" />
          Outils de monitoring à configurer
        </h3>

        <div className="grid sm:grid-cols-2 gap-4">
          {setupCards
            .filter((card) => {
              // Masquer la carte Sentry si déjà connecté
              if (card.title === "Sentry" && sentryConnected) return false;
              return true;
            })
            .map((card) => (
              <div
                key={card.title}
                className="bg-white rounded-xl border border-[#E6E6E4] p-5 hover:border-[#CCCCCC] transition-colors"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{
                      backgroundColor: card.color + "12",
                      color: card.color,
                    }}
                  >
                    {card.icon}
                  </div>
                  <h4 className="text-[14px] font-semibold text-[#191919]">
                    {card.title}
                  </h4>
                </div>
                <p className="text-[12px] text-[#5A5A58] leading-relaxed mb-3">
                  {card.description}
                </p>
                <a
                  href={card.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[12px] font-medium text-[#4F46E5] hover:text-[#4338CA] transition-colors"
                >
                  Documentation
                  <ExternalLink size={11} strokeWidth={2} />
                </a>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
