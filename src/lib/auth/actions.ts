"use server";

import { createClient } from "@/lib/supabase/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

// ── Sign Up ──
// CLOSED: Registrations are disabled until official launch.
// Only the admin account (jestlyapp@gmail.com) exists.
export async function signUp(_formData: FormData) {
  return {
    error: "Les inscriptions sont actuellement fermées. Rejoignez la waitlist sur jestly.fr pour être informé de l'ouverture.",
  };
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
// CLOSED: OAuth signup disabled until official launch.
export async function signInWithGoogle() {
  return {
    error: "Les inscriptions sont actuellement fermées. Seule la connexion par email est disponible.",
  };
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
// CLOSED: Disabled until registrations reopen.
export async function checkSlugAvailable(_slug: string) {
  return { available: false, slug: "", suggestion: null };
}
