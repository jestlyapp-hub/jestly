"use server";

import { createClient } from "@/lib/supabase/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

// ── Sign Up ──
export async function signUp(formData: FormData) {
  const supabase = await createClient();
  const headerStore = await headers();
  const origin = headerStore.get("origin") || "http://localhost:3000";

  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Email et mot de passe requis." };
  }

  if (password.length < 6) {
    return { error: "Le mot de passe doit contenir au moins 6 caractères." };
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

  if (!email) {
    return { error: "Email requis." };
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?next=/parametres`,
  });

  if (error) {
    return { error: error.message };
  }

  return { success: true, message: "Lien de réinitialisation envoyé par email." };
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
