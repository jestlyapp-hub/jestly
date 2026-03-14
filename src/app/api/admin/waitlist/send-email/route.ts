import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, logAdminAction, escapeIlike, sanitizeSearchTerm, checkAdminRateLimit, ADMIN_ACTIONS } from "@/lib/admin";
import { sendWaitlistEmail } from "@/lib/email/send-waitlist-email";
import type { WaitlistTemplateKey, SendEmailPayload, SendEmailResult } from "@/lib/email/types";

const VALID_TEMPLATES: WaitlistTemplateKey[] = [
  "teasing_produit",
  "invitation_beta",
  "lancement_officiel",
];

export async function POST(req: NextRequest) {
  // Auth + admin check
  const auth = await requireAdmin();
  if (auth.error) return auth.error;
  const { user } = auth;

  // Rate limit : 5 requêtes/min (route très sensible)
  const rateLimitResponse = checkAdminRateLimit(user.id, "send_email", 5);
  if (rateLimitResponse) {
    await logAdminAction(user.id, ADMIN_ACTIONS.RATE_LIMIT_HIT, undefined, { endpoint: "send_email" });
    return rateLimitResponse;
  }

  const body: SendEmailPayload = await req.json();
  const { template, audience, selectedIds, filters } = body;

  // Validate template
  if (!VALID_TEMPLATES.includes(template)) {
    return NextResponse.json(
      { error: "Template invalide. confirmation_waitlist ne peut pas être envoyé manuellement." },
      { status: 400 }
    );
  }

  // Resolve recipients
  const supabase = auth.adminClient;
  let recipients: { id: string; email: string; first_name: string }[] = [];

  if (audience === "selected") {
    if (!selectedIds || selectedIds.length === 0) {
      return NextResponse.json({ error: "Aucun destinataire sélectionné" }, { status: 400 });
    }
    const { data, error } = await (supabase.from("waitlist") as ReturnType<typeof supabase.from>)
      .select("id, email, first_name")
      .in("id", selectedIds);
    if (error) {
      console.error("[send-email] resolve selected:", error);
      return NextResponse.json({ error: "Erreur résolution destinataires" }, { status: 500 });
    }
    recipients = (data as typeof recipients) || [];
  } else if (audience === "filtered") {
    let query = (supabase.from("waitlist") as ReturnType<typeof supabase.from>)
      .select("id, email, first_name");

    if (filters?.status && filters.status !== "all") {
      query = query.eq("status", filters.status);
    }
    if (filters?.job_type && filters.job_type !== "all") {
      query = query.eq("job_type", filters.job_type);
    }
    if (filters?.search) {
      const safe = escapeIlike(sanitizeSearchTerm(filters.search));
      query = query.or(
        `email.ilike.%${safe}%,first_name.ilike.%${safe}%,twitter.ilike.%${safe}%`
      );
    }

    const { data, error } = await query;
    if (error) {
      console.error("[send-email] resolve filtered:", error);
      return NextResponse.json({ error: "Erreur résolution destinataires" }, { status: 500 });
    }
    recipients = (data as typeof recipients) || [];
  } else if (audience === "all") {
    const { data, error } = await (supabase.from("waitlist") as ReturnType<typeof supabase.from>)
      .select("id, email, first_name");
    if (error) {
      console.error("[send-email] resolve all:", error);
      return NextResponse.json({ error: "Erreur résolution destinataires" }, { status: 500 });
    }
    recipients = (data as typeof recipients) || [];
  } else {
    return NextResponse.json({ error: "Audience invalide" }, { status: 400 });
  }

  if (recipients.length === 0) {
    return NextResponse.json({ error: "Aucun destinataire trouvé" }, { status: 400 });
  }

  // Send emails sequentially (Resend free tier: 1 req/sec)
  const result: SendEmailResult = { total: recipients.length, sent: 0, failed: 0, errors: [] };

  for (const r of recipients) {
    const res = await sendWaitlistEmail(
      { email: r.email, first_name: r.first_name, waitlist_id: r.id },
      template,
      user.email ?? "admin"
    );
    if (res.success) {
      result.sent++;
    } else {
      result.failed++;
      if (res.error) result.errors.push(`${r.email}: ${res.error}`);
    }
  }

  await logAdminAction(user.id, "send_email", undefined, { template, audience, count: recipients.length });

  return NextResponse.json(result);
}
