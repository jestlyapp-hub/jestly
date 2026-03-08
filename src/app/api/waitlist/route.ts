import { NextRequest, NextResponse } from "next/server";
import { after } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error("[waitlist] Missing env:", { hasUrl: !!url, hasKey: !!key });
    return null;
  }
  return createClient(url, key);
}

// ─── Rate limiting (in-memory, per IP) ──────────────────────
const rateMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 3; // max requests per window
const RATE_WINDOW = 60_000; // 1 minute

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW });
    return false;
  }
  entry.count++;
  return entry.count > RATE_LIMIT;
}

// ─── Allowed job_type values ────────────────────────────────
const ALLOWED_JOB_TYPES = new Set([
  "freelance-creative",
  "freelance-dev",
  "freelance-other",
  "agency",
]);

// ─── Sanitize string: strip HTML tags, limit length ─────────
function sanitizeString(str: string, maxLen: number): string {
  return str.replace(/<[^>]*>/g, "").trim().slice(0, maxLen);
}

export async function POST(req: NextRequest) {
  try {
    // Rate limiting
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: "Trop de requêtes. Réessayez dans une minute." },
        { status: 429 }
      );
    }

    // Reject oversized payloads (> 10 KB)
    const contentLength = parseInt(req.headers.get("content-length") || "0");
    if (contentLength > 10_240) {
      return NextResponse.json(
        { error: "Payload trop volumineux." },
        { status: 413 }
      );
    }

    const supabaseAdmin = getAdminClient();
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: "Configuration serveur manquante. Contactez l'administrateur." },
        { status: 503 }
      );
    }

    const body = await req.json();

    const { email, first_name, twitter, job_type } = body;

    // Validation
    if (!email || !first_name || !job_type) {
      return NextResponse.json(
        { error: "Prénom, email et métier sont requis." },
        { status: 400 }
      );
    }

    // Validate job_type against whitelist
    if (!ALLOWED_JOB_TYPES.has(job_type)) {
      return NextResponse.json(
        { error: "Type de métier invalide." },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email) || email.length > 254) {
      return NextResponse.json(
        { error: "Email invalide." },
        { status: 400 }
      );
    }

    // Sanitize inputs
    const cleanFirstName = sanitizeString(first_name, 50);
    const cleanTwitter = twitter ? sanitizeString(twitter, 50).replace(/[^a-zA-Z0-9_@]/g, "") : null;

    if (!cleanFirstName) {
      return NextResponse.json(
        { error: "Prénom invalide." },
        { status: 400 }
      );
    }

    // UTM + referrer from body (captured client-side) — limit lengths
    const utm_source = typeof body.utm_source === "string" ? body.utm_source.slice(0, 100) : null;
    const utm_medium = typeof body.utm_medium === "string" ? body.utm_medium.slice(0, 100) : null;
    const utm_campaign = typeof body.utm_campaign === "string" ? body.utm_campaign.slice(0, 100) : null;
    const utm_content = typeof body.utm_content === "string" ? body.utm_content.slice(0, 100) : null;
    const utm_term = typeof body.utm_term === "string" ? body.utm_term.slice(0, 100) : null;
    const referrer = typeof body.referrer === "string" ? body.referrer.slice(0, 500) : null;
    const source = typeof body.source === "string" ? body.source.slice(0, 50) : "landing";

    // Limit metadata to 1 KB
    const rawMeta = body.metadata && typeof body.metadata === "object" ? body.metadata : {};
    const metaStr = JSON.stringify(rawMeta);
    const metadata = metaStr.length <= 1024 ? rawMeta : {};

    // Scoring basique
    let score = 0;
    if (cleanTwitter) score += 10;
    if (utm_source) score += 5;
    if (job_type === "freelance-creative") score += 15;
    if (job_type === "agency") score += 12;
    if (job_type === "freelance-dev") score += 10;
    if (job_type === "freelance-other") score += 8;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabaseAdmin.from("waitlist") as any)
      .insert({
        email: email.toLowerCase().trim().slice(0, 254),
        first_name: cleanFirstName,
        twitter: cleanTwitter || null,
        job_type,
        status: "new",
        source,
        referrer,
        utm_source,
        utm_medium,
        utm_campaign,
        utm_content,
        utm_term,
        score,
        metadata,
      })
      .select("id, email")
      .single();

    if (error) {
      // Duplicate email
      if (error.code === "23505") {
        return NextResponse.json(
          { error: "already_registered", message: "Cet email est déjà inscrit !" },
          { status: 409 }
        );
      }
      console.error("[waitlist] insert error:", JSON.stringify(error));
      return NextResponse.json(
        { error: "Impossible de traiter l'inscription. Réessayez." },
        { status: 500 }
      );
    }

    // Send confirmation email after response (keeps lambda alive via after())
    const recipientEmail = email.toLowerCase().trim();
    const recipientName = cleanFirstName;
    const recipientId = data.id;

    after(async () => {
      try {
        const { sendWaitlistConfirmation } = await import("@/lib/email/send-waitlist-email");
        await sendWaitlistConfirmation(recipientEmail, recipientName, recipientId);
      } catch (err) {
        console.error("[waitlist] confirmation email failed:", err);
      }
    });

    return NextResponse.json({ success: true, id: data.id }, { status: 201 });
  } catch (err) {
    console.error("[waitlist] unexpected error:", err);
    return NextResponse.json(
      { error: "Une erreur inattendue est survenue. Réessayez." },
      { status: 500 }
    );
  }
}

// Public: get waitlist count for social proof
export async function GET() {
  try {
    const supabaseAdmin = getAdminClient();
    if (!supabaseAdmin) {
      return NextResponse.json({ count: 0 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { count, error } = await (supabaseAdmin.from("waitlist") as any)
      .select("id", { count: "exact", head: true });

    if (error) {
      console.error("[waitlist] count error:", JSON.stringify(error));
      return NextResponse.json({ count: 0 });
    }

    return NextResponse.json({ count: count || 0 });
  } catch {
    return NextResponse.json({ count: 0 });
  }
}
