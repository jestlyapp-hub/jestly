"use client";

import { useRef, useState, useCallback } from "react";
import Image from "next/image";
import { Camera, Loader2, X } from "lucide-react";
import type { ProfileData, SettingsForm, SettingsFormActions } from "./shared";
import { SectionCard, inputCls, labelCls, selectCls, FieldError, validatePhone, TIMEZONES } from "./shared";

const AVATAR_MAX_SIZE = 5 * 1024 * 1024; // 5MB
const AVATAR_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

export function AccountSection({ profile, form, actions, dirty, onAvatarChange }: {
  profile: ProfileData;
  form: SettingsForm;
  actions: SettingsFormActions;
  dirty: boolean;
  onAvatarChange?: (url: string | null) => void;
}) {
  const phoneErr = validatePhone(form.phone);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const displayUrl = previewUrl || profile.avatar_url;

  const handleAvatarSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarError(null);

    if (!AVATAR_TYPES.has(file.type)) {
      setAvatarError("Format non supporté. Utilisez JPG, PNG, WebP ou GIF.");
      return;
    }
    if (file.size > AVATAR_MAX_SIZE) {
      setAvatarError("Image trop lourde (max 5 Mo).");
      return;
    }

    // Local preview
    const localUrl = URL.createObjectURL(file);
    setPreviewUrl(localUrl);

    // Upload to Supabase Storage
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Erreur ${res.status}`);
      }
      const data = await res.json();

      // Save avatar_url immediately
      const patchRes = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avatar_url: data.url }),
      });
      if (!patchRes.ok) throw new Error("Échec de la sauvegarde");

      setPreviewUrl(null); // profile.avatar_url will update via mutate
      onAvatarChange?.(data.url);
    } catch (err) {
      setAvatarError(err instanceof Error ? err.message : "Erreur d'upload");
      setPreviewUrl(null);
    } finally {
      setUploading(false);
      // Reset file input so same file can be re-selected
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }, [onAvatarChange]);

  const handleRemoveAvatar = useCallback(async () => {
    setUploading(true);
    setAvatarError(null);
    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avatar_url: null }),
      });
      if (!res.ok) throw new Error("Échec de la suppression");
      setPreviewUrl(null);
      onAvatarChange?.(null);
    } catch (err) {
      setAvatarError(err instanceof Error ? err.message : "Erreur");
    } finally {
      setUploading(false);
    }
  }, [onAvatarChange]);

  return (
    <SectionCard id="compte" title="Compte & Profil" description="Vos informations personnelles et votre identité." dirty={dirty}>
      <div className="space-y-5">
        {/* Avatar */}
        <div className="flex items-center gap-4">
          <div className="relative">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="w-16 h-16 rounded-full bg-[#EDE9FE] ring-2 ring-[#E8E5F5] flex items-center justify-center text-[20px] font-bold text-[#7C3AED] flex-shrink-0 relative group cursor-pointer overflow-hidden disabled:cursor-wait"
            >
              {uploading ? (
                <Loader2 size={20} className="animate-spin text-[#7C3AED]" />
              ) : displayUrl ? (
                <Image src={displayUrl} alt="" fill className="object-cover" unoptimized />
              ) : (
                form.fullName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) || "?"
              )}
              {!uploading && (
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <Camera size={18} className="text-white" />
                </div>
              )}
            </button>
            {displayUrl && !uploading && (
              <button
                type="button"
                onClick={handleRemoveAvatar}
                className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-white border border-[#E6E6E4] flex items-center justify-center shadow-sm hover:bg-red-50 hover:border-red-200 transition-colors"
                title="Supprimer l'avatar"
              >
                <X size={10} className="text-[#A8A29E] hover:text-red-500" />
              </button>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={handleAvatarSelect}
            className="hidden"
          />
          <div>
            <div className="text-[13px] font-medium text-[#191919]">{form.fullName || "Votre nom"}</div>
            <div className="text-[12px] text-[#A8A29E]">{profile.email}</div>
            <div className="text-[11px] text-[#C4C4C2] mt-0.5">
              Membre depuis {new Date(profile.created_at).toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}
            </div>
            {avatarError && <p className="text-[11px] text-red-500 mt-1">{avatarError}</p>}
          </div>
        </div>

        <div className="h-px bg-[#F0F0EE]" />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Nom complet</label>
            <input type="text" value={form.fullName} onChange={e => { actions.setFullName(e.target.value); actions.markDirty("compte"); }} className={inputCls} placeholder="Prénom Nom" />
          </div>
          <div>
            <label className={labelCls}>Email</label>
            <input type="email" value={profile.email ?? ""} disabled className={`${inputCls} opacity-60 cursor-not-allowed`} />
          </div>
          <div>
            <label className={labelCls}>Téléphone</label>
            <input type="tel" value={form.phone} onChange={e => { actions.setPhone(e.target.value); actions.markDirty("compte"); }} className={phoneErr ? inputCls.replace("border-[#E6E6E4]", "border-red-300") : inputCls} placeholder="+33 6 12 34 56 78" />
            <FieldError message={phoneErr} />
          </div>
          <div>
            <label className={labelCls}>Rôle / Titre</label>
            <input type="text" value={form.role} onChange={e => { actions.setRole(e.target.value); actions.markDirty("compte"); }} className={inputCls} placeholder="Freelance, Designer, Studio..." />
          </div>
          <div>
            <label className={labelCls}>Langue</label>
            <select value={form.locale} onChange={e => { actions.setLocale(e.target.value); actions.markDirty("compte"); }} className={selectCls}>
              <option value="fr">Français</option>
              <option value="en">English</option>
            </select>
          </div>
          <div>
            <label className={labelCls}>Fuseau horaire</label>
            <select value={form.timezone} onChange={e => { actions.setTimezone(e.target.value); actions.markDirty("compte"); }} className={selectCls}>
              {TIMEZONES.map(tz => <option key={tz} value={tz}>{tz.replace("_", " ")}</option>)}
            </select>
          </div>
        </div>
      </div>
    </SectionCard>
  );
}
