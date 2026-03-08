import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendWaitlistConfirmation } from "@/lib/email/send-waitlist-email";

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

export async function POST(req: NextRequest) {
  try {
    const supabaseAdmin = getAdminClient();
    if (!supabaseAdmin) {
      return NextResponse.json({ error: "Service unavailable" }, { status: 503 });
    }

    const body = await req.json();

    const { email, first_name, twitter, job_type } = body;

    // Validation
    if (!email || !first_name || !job_type) {
      return NextResponse.json(
        { error: "email, first_name et job_type sont requis" },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Email invalide" },
        { status: 400 }
      );
    }

    // UTM + referrer from body (captured client-side)
    const utm_source = body.utm_source || null;
    const utm_medium = body.utm_medium || null;
    const utm_campaign = body.utm_campaign || null;
    const utm_content = body.utm_content || null;
    const utm_term = body.utm_term || null;
    const referrer = body.referrer || null;
    const source = body.source || "landing";

    // Scoring basique
    let score = 0;
    if (twitter) score += 10;
    if (utm_source) score += 5;
    if (job_type === "freelance-creative") score += 15;
    if (job_type === "agency") score += 12;
    if (job_type === "freelance-dev") score += 10;
    if (job_type === "freelance-other") score += 8;

    const { data, error } = await (supabaseAdmin.from("waitlist") as any)
      .insert({
        email: email.toLowerCase().trim(),
        first_name: first_name.trim(),
        twitter: twitter?.trim() || null,
        job_type,
        source,
        referrer,
        utm_source,
        utm_medium,
        utm_campaign,
        utm_content,
        utm_term,
        score,
        metadata: body.metadata || {},
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
      console.error("[waitlist] insert error:", error);
      return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }

    // Send confirmation email (fire-and-forget, don't block the response)
    sendWaitlistConfirmation(email.toLowerCase().trim(), first_name.trim(), data.id).catch(
      (err) => console.error("[waitlist] confirmation email failed:", err)
    );

    return NextResponse.json({ success: true, id: data.id }, { status: 201 });
  } catch (err) {
    console.error("[waitlist] unexpected error:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// Public: get waitlist count for social proof
export async function GET() {
  try {
    const supabaseAdmin = getAdminClient();
    if (!supabaseAdmin) {
      return NextResponse.json({ count: 0 });
    }

    const { count, error } = await (supabaseAdmin.from("waitlist") as any)
      .select("id", { count: "exact", head: true });

    if (error) {
      console.error("[waitlist] count error:", error);
      return NextResponse.json({ count: 0 });
    }

    return NextResponse.json({ count: count || 0 });
  } catch {
    return NextResponse.json({ count: 0 });
  }
}
