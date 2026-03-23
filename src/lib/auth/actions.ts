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

  const { error } = await supabase.auth.signUp({
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
    return { error: error.message };
  }

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
    if (error.message.includes("Invalid login")) {
      return { error: "Email ou mot de passe incorrect." };
    }
    return { error: error.message };
  }

  redirect("/dashboard");
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

  // Slug pris — proposer une alternative
  const suggestion = `${normalized}-${Math.floor(Math.random() * 900) + 100}`;
  return { available: false, slug: normalized, suggestion };
}
