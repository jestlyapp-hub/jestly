"use server";

import { createClient } from "@/lib/supabase/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

// ── Simple in-memory rate limiter for server actions ──
const actionLimiters = new Map<string, Map<string, { count: number; resetAt: number }>>();
function actionRateLimit(name: string, max: number, windowMs: number = 60_000) {
  if (!actionLimiters.has(name)) actionLimiters.set(name, new Map());
  const store = actionLimiters.get(name)!;
  return (ip: string): boolean => {
    const now = Date.now();
    const entry = store.get(ip);
    if (!entry || now > entry.resetAt) {
      store.set(ip, { count: 1, resetAt: now + windowMs });
      return true;
    }
    entry.count++;
    return entry.count <= max;
  };
}

const checkForgotPasswordLimit = actionRateLimit("forgot-password", 3, 120_000); // 3 requêtes / 2 min
const checkResendLimit = actionRateLimit("resend-confirmation", 2, 120_000); // 2 requêtes / 2 min

// ── Sign Up ──
export async function signUp(formData: FormData) {
  const supabase = await createClient();
  const headerStore = await headers();
  const origin = headerStore.get("origin") || "http://localhost:3000";

  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const password = formData.get("password") as string;
  const acceptedTerms = formData.get("accept-terms");

  if (!email || !password) {
    return { error: "Email et mot de passe requis." };
  }

  if (password.length < 8) {
    return { error: "Le mot de passe doit contenir au moins 8 caractères." };
  }

  if (!acceptedTerms) {
    return { error: "Vous devez accepter les CGU et la politique de confidentialité." };
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback?next=/dashboard`,
    },
  });

  if (error) {
    if (error.message.includes("already registered")) {
      return { error: "Cet email est déjà utilisé. Connectez-vous ou réinitialisez votre mot de passe." };
    }
    const msg = error.message.toLowerCase();
    if (msg.includes("rate") || msg.includes("limit") || msg.includes("exceeded") || msg.includes("too many")) {
      return { error: "Trop de tentatives. Réessaie dans quelques minutes." };
    }
    return { error: error.message };
  }

  // If Supabase requires email confirmation, user is created but session is null
  // In that case, DON'T redirect to dashboard — return success with confirmation needed
  const needsConfirmation = data?.user && !data?.session;

  if (needsConfirmation) {
    return {
      success: true,
      needsConfirmation: true,
      email,
      message: "Ton compte a bien été créé ! Vérifie ta boîte mail pour confirmer ton adresse email avant de te connecter.",
    };
  }

  // Session exists — email confirmation not required, go to dashboard
  redirect("/dashboard");
}

// ── Sign In ──
export async function signIn(formData: FormData) {
  const supabase = await createClient();

  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Email et mot de passe requis." };
  }

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    // Email not confirmed
    if (error.message.includes("Email not confirmed") || error.message.includes("email_not_confirmed")) {
      return {
        error: "email_not_confirmed",
        email,
      };
    }
    // Invalid credentials
    if (error.message.includes("Invalid login")) {
      return { error: "Email ou mot de passe incorrect." };
    }
    // Rate limited
    const msg = error.message.toLowerCase();
    if (msg.includes("rate") || msg.includes("limit") || msg.includes("exceeded") || msg.includes("too many")) {
      return { error: "Trop de tentatives. Réessaie dans quelques minutes." };
    }
    return { error: error.message };
  }

  redirect("/dashboard");
}

// ── Resend Confirmation Email ──
export async function resendConfirmationEmail(email: string) {
  if (!email?.trim()) {
    return { error: "Email requis." };
  }

  const supabase = await createClient();
  const headerStore = await headers();
  const origin = headerStore.get("origin") || "http://localhost:3000";
  const ip = headerStore.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";

  if (!checkResendLimit(ip)) {
    return { error: "Trop de tentatives. Réessayez dans quelques minutes." };
  }

  const { error } = await supabase.auth.resend({
    type: "signup",
    email: email.trim().toLowerCase(),
    options: {
      emailRedirectTo: `${origin}/auth/callback?next=/dashboard`,
    },
  });

  if (error) {
    const msg = error.message.toLowerCase();
    if (msg.includes("rate") || msg.includes("limit") || msg.includes("60") || msg.includes("exceeded") || msg.includes("too many")) {
      return { error: "Tu as déjà demandé un email récemment. Attends quelques minutes avant de réessayer." };
    }
    return { error: error.message };
  }

  return { success: true, message: "Email de confirmation renvoyé. Pense à vérifier tes spams." };
}

// ── Sign In with Google ──
export async function signInWithGoogle() {
  const supabase = await createClient();
  const headerStore = await headers();
  const origin = headerStore.get("origin") || "http://localhost:3000";

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${origin}/auth/callback?next=/dashboard`,
    },
  });

  if (error) {
    return { error: error.message };
  }

  if (data?.url) {
    redirect(data.url);
  }

  return { error: "Impossible de lancer l'authentification Google." };
}

// ── Forgot Password ──
export async function forgotPassword(formData: FormData) {
  const supabase = await createClient();
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const headerStore = await headers();
  const origin = headerStore.get("origin") || "http://localhost:3000";
  const ip = headerStore.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";

  if (!checkForgotPasswordLimit(ip)) {
    return { error: "Trop de tentatives. Réessayez dans quelques minutes." };
  }

  if (!email) {
    return { error: "Email requis." };
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/reset-password`,
  });

  if (error) {
    return { error: error.message };
  }

  return { success: true, message: "Lien de réinitialisation envoyé par email." };
}

// ── Update Password (after recovery link) ──
export async function updatePassword(formData: FormData) {
  const supabase = await createClient();
  const password = (formData.get("password") as string) || "";
  const confirm = (formData.get("confirm") as string) || "";

  if (!password || password.length < 8) {
    return { error: "Le mot de passe doit contenir au moins 8 caractères." };
  }
  if (password !== confirm) {
    return { error: "Les mots de passe ne correspondent pas." };
  }

  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    return { error: error.message };
  }

  // Security: destroy session after password change — user must re-login
  await supabase.auth.signOut();

  return { success: true };
}

// ── Sign Out ──
export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

// ── Check Slug Availability ──
export async function checkSlugAvailable(slug: string) {
  if (!slug || slug.length < 3) {
    return { available: false, slug, suggestion: null };
  }

  const supabase = await createClient();
  const normalized = slug.toLowerCase().replace(/[^a-z0-9-]/g, "");

  const { data } = await (supabase.from("sites") as any)
    .select("slug")
    .eq("slug", normalized)
    .maybeSingle();

  if (!data) {
    return { available: true, slug: normalized, suggestion: null };
  }

  const suggestion = `${normalized}-${Math.floor(Math.random() * 900) + 100}`;
  return { available: false, slug: normalized, suggestion };
}
