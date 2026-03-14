// Client pour l'API Sentry — utilisé par /api/admin/incidents
// Requiert SENTRY_AUTH_TOKEN + SENTRY_ORG + SENTRY_PROJECT en env

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

const SENTRY_API = "https://sentry.io/api/0";

export function isSentryAdminConfigured(): boolean {
  return !!(
    process.env.SENTRY_AUTH_TOKEN &&
    process.env.SENTRY_ORG &&
    process.env.SENTRY_PROJECT
  );
}

/**
 * Fetch les issues récentes depuis l'API Sentry.
 */
export async function fetchSentryIssues(limit: number = 25): Promise<SentryIssue[]> {
  if (!isSentryAdminConfigured()) return [];

  const org = process.env.SENTRY_ORG!;
  const project = process.env.SENTRY_PROJECT!;
  const token = process.env.SENTRY_AUTH_TOKEN!;

  try {
    const res = await fetch(
      `${SENTRY_API}/projects/${org}/${project}/issues/?query=is:unresolved&sort=date&limit=${limit}`,
      {
        headers: { Authorization: `Bearer ${token}` },
        next: { revalidate: 60 }, // Cache 1 minute
      }
    );

    if (!res.ok) {
      console.error("[sentry-admin] API error:", res.status);
      return [];
    }

    return await res.json();
  } catch (err) {
    console.error("[sentry-admin] Fetch error:", err);
    return [];
  }
}

/**
 * Fetch les stats d'erreurs pour le dashboard admin.
 */
export async function fetchSentryStats(): Promise<SentryStats | null> {
  if (!isSentryAdminConfigured()) return null;

  const issues = await fetchSentryIssues(25);

  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;

  // Issues avec events dans les 24h
  const recent = issues.filter(i => new Date(i.lastSeen).getTime() > now - day);

  return {
    total_issues_24h: recent.length,
    total_events_24h: recent.reduce((sum, i) => sum + parseInt(i.count || "0"), 0),
    unresolved_issues: issues.length,
    top_issues: issues.slice(0, 10),
    affected_users_24h: recent.reduce((sum, i) => sum + (i.userCount || 0), 0),
  };
}
