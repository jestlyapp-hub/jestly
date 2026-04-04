import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/api-auth";

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * GET /api/onboarding — Récupère l'état onboarding du profil.
 * Retourne { completed, step, answers }.
 */
export async function GET() {
  const auth = await getAuthUser();
  if ("error" in auth) return auth.error;
  const { user, supabase } = auth;

  const { data } = await (supabase.from("profiles") as any)
    .select("settings")
    .eq("id", user.id)
    .single();

  const onboarding = data?.settings?.onboarding || {};

  return NextResponse.json({
    completed: onboarding.completed === true,
    step: onboarding.step ?? 0,
    answers: {
      discovery_source: onboarding.discovery_source ?? null,
      freelance_type: onboarding.freelance_type ?? null,
      freelance_experience: onboarding.freelance_experience ?? null,
      client_volume: onboarding.client_volume ?? null,
      main_goal: onboarding.main_goal ?? null,
      wants_tips: onboarding.wants_tips ?? null,
    },
  });
}

/**
 * POST /api/onboarding — Sauvegarde les réponses onboarding.
 * Body : { step, answers, completed? }
 * Merge dans settings.onboarding (ne touche pas les autres clés settings).
 */
export async function POST(request: Request) {
  const auth = await getAuthUser();
  if ("error" in auth) return auth.error;
  const { user, supabase } = auth;

  const body = await request.json();
  const { step, answers, completed } = body;

  // Récupérer settings actuel pour merge
  const { data: profile } = await (supabase.from("profiles") as any)
    .select("settings")
    .eq("id", user.id)
    .single();

  const currentSettings = profile?.settings || {};
  const currentOnboarding = currentSettings.onboarding || {};

  const updatedOnboarding = {
    ...currentOnboarding,
    ...answers,
    step: step ?? currentOnboarding.step ?? 0,
    ...(completed !== undefined ? { completed } : {}),
  };

  const { error } = await (supabase.from("profiles") as any)
    .update({
      settings: { ...currentSettings, onboarding: updatedOnboarding },
    })
    .eq("id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
