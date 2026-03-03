"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

function slugify(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

// ── Sign Up ──
export async function signUp(formData: FormData) {
  const supabase = await createClient();

  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const password = formData.get("password") as string;
  const businessName = (formData.get("businessName") as string)?.trim();

  if (!email || !password || !businessName) {
    return { error: "Tous les champs sont requis." };
  }

  if (password.length < 8) {
    return { error: "Le mot de passe doit contenir au moins 8 caractères." };
  }

  // Generate slug from business name
  let subdomain = slugify(businessName);
  if (!subdomain) subdomain = slugify(email.split("@")[0]);

  // Check slug availability
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: existing } = await (supabase.from("profiles") as any)
    .select("id")
    .eq("subdomain", subdomain)
    .maybeSingle();

  if (existing) {
    // Append random suffix
    subdomain = `${subdomain}-${Math.floor(Math.random() * 900) + 100}`;
  }

  const headerStore = await headers();
  const origin = headerStore.get("origin") || "http://localhost:3000";

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
      data: {
        full_name: businessName,
        business_name: businessName,
        subdomain,
      },
    },
  });

  if (error) {
    if (error.message.includes("already registered")) {
      return { error: "Cet email est déjà utilisé. Connectez-vous." };
    }
    return { error: error.message };
  }

  // If user is auto-confirmed (no email confirm), create profile
  if (data.user && data.session) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from("profiles") as any).upsert({
      id: data.user.id,
      email,
      full_name: businessName,
      business_name: businessName,
      subdomain,
    });
    redirect("/dashboard");
  }

  // Email confirmation required
  return { success: true, message: "Vérifiez votre boîte mail pour confirmer votre compte." };
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
      redirectTo: `${origin}/auth/callback`,
    },
  });

  if (error) {
    return { error: error.message };
  }

  if (data.url) {
    redirect(data.url);
  }
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
  const supabase = await createClient();
  const normalized = slugify(slug);
  if (!normalized || normalized.length < 2) {
    return { available: false, slug: normalized, suggestion: null };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase.from("profiles") as any)
    .select("id")
    .eq("subdomain", normalized)
    .maybeSingle();

  if (!data) {
    return { available: true, slug: normalized, suggestion: null };
  }

  // Suggest alternative
  const suggestion = `${normalized}-${Math.floor(Math.random() * 900) + 100}`;
  return { available: false, slug: normalized, suggestion };
}
